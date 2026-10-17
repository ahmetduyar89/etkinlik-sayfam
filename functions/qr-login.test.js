const test = require('node:test');
const assert = require('node:assert/strict');
const { createQrHandlers } = require('./qr-login');

class HttpsError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
const Timestamp = { fromMillis: (value) => ({ toMillis: () => value }) };
function setup() {
  const records = new Map();
  let time = 1000;
  let mutex = Promise.resolve();
  const db = {
    collection: (collection) => ({ doc: (id) => {
      const key = `${collection}/${id}`;
      return { key, get: async () => ({ exists: records.has(key), data: () => records.get(key) }),
        set: async (data) => records.set(key, data) };
    } }),
    runTransaction: async (operation) => {
      const previous = mutex;
      let release;
      mutex = new Promise((resolve) => { release = resolve; });
      await previous;
      const writes = [];
      try {
        const result = await operation({ get: (ref) => ref.get(),
          set: (ref, data) => writes.push(() => records.set(ref.key, data)),
          update: (ref, data) => writes.push(() => records.set(ref.key, { ...records.get(ref.key), ...data })),
        });
        writes.forEach((write) => write());
        return result;
      } finally { release(); }
    },
  };
  const users = new Map([['teacher1', { email: 'teacher@example.com' }], ['class_c1', {}], ['student1', {}]]);
  const auth = { getUser: async (uid) => {
    if (!users.has(uid)) throw new HttpsError('not-found', 'Missing user');
    return users.get(uid);
  }, createCustomToken: async (uid, claims) => `token:${uid}:${JSON.stringify(claims)}` };
  records.set('classes/c1', { name: '7/A', username: '7a' });
  records.set('classCredentials/c1', { classId: 'c1' });
  const handlers = createQrHandlers({ db, auth, HttpsError, Timestamp,
    teacherEmail: () => 'teacher@example.com', now: () => time });
  const phone = (request, role = 'teacher', uid = 'teacher1') => ({
    auth: { uid, token: { role, ...(role === 'class' ? { classId: 'c1' } : {}) } },
    data: { id: request.id, scanSecret: request.scanSecret },
  });
  const owner = (request) => ({ data: { id: request.id, ownerSecret: request.ownerSecret } });
  const create = () => handlers.createQrLogin({ rawRequest: { ip: '127.0.0.1' } });
  return { handlers, create, phone, owner, records, users, auth, advance: (ms) => { time += ms; } };
}
const fails = (promise, code) => assert.rejects(promise, (error) => error.code === code);

test('teacher approval transfers verified account only to the originating screen', async () => {
  const s = setup(); const qr = await s.create();
  assert.equal(qr.expiresAt, 121000);
  assert.match(qr.code, /^\d{6}$/);
  assert.equal((await s.handlers.inspectQrLogin(s.phone(qr))).code, qr.code);
  assert.deepEqual(await s.handlers.completeQrLogin(s.owner(qr)), { state: 'pending' });
  await s.handlers.approveQrLogin(s.phone(qr));
  const result = await s.handlers.completeQrLogin(s.owner(qr));
  assert.deepEqual(result.session, { role: 'admin', username: 'teacher@example.com' });
  assert.match(result.token, /teacher1/);
  assert.equal(s.records.get(`qrLoginRequests/${qr.id}`).token, undefined);
  await fails(s.handlers.completeQrLogin(s.owner(qr)), 'failed-precondition');
});

test('class approval restores current class metadata and restricted claims', async () => {
  const s = setup(); const qr = await s.create();
  await s.handlers.approveQrLogin(s.phone(qr, 'class', 'class_c1'));
  const result = await s.handlers.completeQrLogin(s.owner(qr));
  assert.deepEqual(result.session, { role: 'class', classId: 'c1', className: '7/A', username: '7a' });
  assert.match(result.token, /"role":"class","classId":"c1"/);
});

test('scan secret cannot redeem and owner secret cannot approve; requests cannot be mixed', async () => {
  const s = setup(); const qr = await s.create(); const other = await s.create();
  await fails(s.handlers.completeQrLogin({ data: { id: qr.id, ownerSecret: qr.scanSecret } }), 'permission-denied');
  await fails(s.handlers.approveQrLogin({ ...s.phone(qr), data: { id: qr.id, scanSecret: qr.ownerSecret } }), 'permission-denied');
  await fails(s.handlers.approveQrLogin({ ...s.phone(qr), data: { id: other.id, scanSecret: qr.scanSecret } }), 'permission-denied');
  await fails(s.handlers.completeQrLogin({ data: { id: '../invalid', ownerSecret: qr.ownerSecret } }), 'invalid-argument');
});

test('anonymous, student, forged teacher and mismatched class identities cannot approve', async () => {
  const s = setup(); const qr = await s.create();
  await fails(s.handlers.approveQrLogin({ data: s.phone(qr).data }), 'unauthenticated');
  await fails(s.handlers.approveQrLogin(s.phone(qr, 'student', 'student1')), 'permission-denied');
  await fails(s.handlers.approveQrLogin(s.phone(qr, 'teacher', 'student1')), 'permission-denied');
  await fails(s.handlers.approveQrLogin(s.phone(qr, 'class', 'student1')), 'permission-denied');
});

test('expiration is enforced on inspection, approval and redemption', async () => {
  const s = setup(); const qr = await s.create();
  s.advance(120000);
  await fails(s.handlers.inspectQrLogin(s.phone(qr)), 'deadline-exceeded');
  await fails(s.handlers.approveQrLogin(s.phone(qr)), 'deadline-exceeded');
  await fails(s.handlers.completeQrLogin(s.owner(qr)), 'deadline-exceeded');
});

test('simultaneous approvals and redemptions each allow only one success', async () => {
  const s = setup(); const qr = await s.create();
  const approvals = await Promise.allSettled([s.handlers.approveQrLogin(s.phone(qr)), s.handlers.approveQrLogin(s.phone(qr))]);
  assert.equal(approvals.filter((item) => item.status === 'fulfilled').length, 1);
  const redemptions = await Promise.allSettled([s.handlers.completeQrLogin(s.owner(qr)), s.handlers.completeQrLogin(s.owner(qr))]);
  assert.equal(redemptions.filter((item) => item.status === 'fulfilled').length, 1);
});

test('disabled or deleted accounts/classes cannot redeem an already approved request', async () => {
  const s = setup(); const qr = await s.create();
  await s.handlers.approveQrLogin(s.phone(qr));
  s.users.set('teacher1', { email: 'teacher@example.com', disabled: true });
  await fails(s.handlers.completeQrLogin(s.owner(qr)), 'permission-denied');
  const classQr = await s.create();
  await s.handlers.approveQrLogin(s.phone(classQr, 'class', 'class_c1'));
  s.records.delete('classes/c1');
  await fails(s.handlers.completeQrLogin(s.owner(classQr)), 'permission-denied');
});

test('token signing failure leaves request available for retry', async () => {
  const s = setup(); const qr = await s.create();
  await s.handlers.approveQrLogin(s.phone(qr));
  const sign = s.auth.createCustomToken;
  s.auth.createCustomToken = async () => { throw new Error('signing unavailable'); };
  await assert.rejects(s.handlers.completeQrLogin(s.owner(qr)), /signing unavailable/);
  assert.equal(s.records.get(`qrLoginRequests/${qr.id}`).state, 'approved');
  s.auth.createCustomToken = sign;
  assert.equal((await s.handlers.completeQrLogin(s.owner(qr))).state, 'complete');
});

test('anonymous creation is limited per IP and the window resets', async () => {
  const s = setup();
  for (let i = 0; i < 30; i += 1) await s.create();
  await fails(s.create(), 'resource-exhausted');
  s.advance(600000);
  assert.ok((await s.create()).id);
});
