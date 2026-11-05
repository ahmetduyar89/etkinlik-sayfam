const { randomBytes, randomInt, createHash, timingSafeEqual } = require('node:crypto');

const hash = (value) => createHash('sha256').update(value).digest('hex');
const validSecret = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const matches = (value, expected) => validSecret(value) && typeof expected === 'string' &&
  expected.length === 64 && timingSafeEqual(Buffer.from(hash(value)), Buffer.from(expected));

// All records are private: clients interact only through callable functions.
function createQrHandlers({ db, auth, HttpsError, Timestamp, teacherEmail, now = Date.now }) {
  function refFor(id) {
    if (typeof id !== 'string' || !/^[a-f0-9]{40}$/.test(id)) {
      throw new HttpsError('invalid-argument', 'Geçersiz QR kod.');
    }
    return db.collection('qrLoginRequests').doc(id);
  }
  function check(record, secret, field) {
    if (!record || !matches(secret, record[field])) {
      throw new HttpsError('permission-denied', 'QR kod doğrulanamadı. Yeni QR oluşturun.');
    }
    if (record.expiresAt.toMillis() <= now()) {
      throw new HttpsError('deadline-exceeded', 'QR kodun süresi doldu. Yeni QR oluşturun.');
    }
  }
  async function identity(uid, claims) {
    const user = await auth.getUser(uid);
    if (user.disabled) throw new HttpsError('permission-denied', 'Bu hesap kapatılmış.');
    const configuredEmail = teacherEmail().trim().toLowerCase();
    if (claims.role === 'teacher' && configuredEmail && user.email?.toLowerCase() === configuredEmail) {
      return { uid, claims: { role: 'teacher' }, session: { role: 'admin', username: user.email } };
    }
    if (claims.role === 'class' && typeof claims.classId === 'string' && uid === `class_${claims.classId}`) {
      const classSnap = await db.collection('classes').doc(claims.classId).get();
      const credential = await db.collection('classCredentials').doc(claims.classId).get();
      if (classSnap.exists && credential.exists) {
        const data = classSnap.data();
        return { uid, claims: { role: 'class', classId: claims.classId }, session: {
          role: 'class', classId: claims.classId, className: data.name, username: data.username,
        } };
      }
    }
    throw new HttpsError('permission-denied', 'QR onayı için öğretmen veya sınıf hesabıyla giriş yapın.');
  }
  async function currentIdentity(request) {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Önce telefonunuzda hesabınıza giriş yapın.');
    return identity(request.auth.uid, request.auth.token);
  }
  return {
    createQrLogin: async (request) => {
      // Bound anonymous creation and polling costs; raw IP is never stored.
      const rateRef = db.collection('qrLoginRateLimits').doc(hash(request.rawRequest?.ip || 'unknown'));
      await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(rateRef);
        const previous = snapshot.data();
        const fresh = !previous || previous.windowEnd <= now();
        const count = fresh ? 0 : previous.count;
        if (count >= 30) throw new HttpsError('resource-exhausted', 'Çok fazla QR isteği. Birkaç dakika sonra tekrar deneyin.');
        tx.set(rateRef, { count: count + 1, windowEnd: fresh ? now() + 600000 : previous.windowEnd,
          expiresAt: Timestamp.fromMillis(now() + 86400000) });
      });
      const id = randomBytes(20).toString('hex');
      const ownerSecret = randomBytes(32).toString('hex');
      const scanSecret = randomBytes(32).toString('hex');
      const expiresAt = now() + 120000;
      const code = String(randomInt(100000, 1000000));
      await refFor(id).set({ ownerHash: hash(ownerSecret), scanHash: hash(scanSecret), code,
        expiresAt: Timestamp.fromMillis(expiresAt), state: 'pending' });
      return { id, ownerSecret, scanSecret, expiresAt, code };
    },
    inspectQrLogin: async (request) => {
      await currentIdentity(request);
      const snapshot = await refFor(request.data?.id).get();
      const record = snapshot.data();
      check(record, request.data?.scanSecret, 'scanHash');
      if (record.state !== 'pending') throw new HttpsError('failed-precondition', 'Bu QR zaten kullanılmış.');
      return { code: record.code, expiresAt: record.expiresAt.toMillis() };
    },
    approveQrLogin: async (request) => {
      const account = await currentIdentity(request);
      const ref = refFor(request.data?.id);
      await db.runTransaction(async (tx) => {
        const record = (await tx.get(ref)).data();
        check(record, request.data?.scanSecret, 'scanHash');
        if (record.state !== 'pending') throw new HttpsError('failed-precondition', 'Bu QR zaten onaylanmış veya kullanılmış.');
        tx.update(ref, { state: 'approved', uid: account.uid, claims: account.claims });
      });
      return { ok: true };
    },
    completeQrLogin: async (request) => {
      const ref = refFor(request.data?.id);
      return db.runTransaction(async (tx) => {
        const record = (await tx.get(ref)).data();
        check(record, request.data?.ownerSecret, 'ownerHash');
        if (record.state === 'pending') return { state: 'pending' };
        if (record.state !== 'approved') throw new HttpsError('failed-precondition', 'Bu QR zaten kullanılmış. Yeni QR oluşturun.');
        // Revalidate the account at redemption, including deletion/disablement.
        const account = await identity(record.uid, record.claims);
        const token = await auth.createCustomToken(account.uid, account.claims);
        tx.update(ref, { state: 'consumed' });
        return { state: 'complete', token, session: account.session };
      });
    },
  };
}
module.exports = { createQrHandlers };
