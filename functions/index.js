const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { defineString } = require('firebase-functions/params');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');

initializeApp();

const db = getFirestore();
const teacherEmail = defineString('TEACHER_EMAIL');
const callableOptions = { region: 'europe-west1', cors: true };

const cleanText = (value, max = 80) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
const cleanUsername = (value) => cleanText(value, 40).toLocaleLowerCase('tr').replace(/[^a-z0-9_-]/g, '');
const cleanSchoolNumber = (value) => String(value || '').replace(/\D/g, '').slice(0, 20);
const cleanId = (value) => String(value || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);

function passwordRecord(password) {
  const value = String(password || '');
  if (value.length < 6 || value.length > 72) {
    throw new HttpsError('invalid-argument', 'Sınıf şifresi en az 6 karakter olmalıdır.');
  }
  const salt = randomBytes(16);
  const hash = scryptSync(value, salt, 64);
  return { passwordSalt: salt.toString('base64'), passwordHash: hash.toString('base64') };
}

function passwordMatches(password, credential) {
  try {
    const salt = Buffer.from(credential.passwordSalt, 'base64');
    const expected = Buffer.from(credential.passwordHash, 'base64');
    const actual = scryptSync(String(password || ''), salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function isTeacher(request) {
  const configuredEmail = teacherEmail.value().trim().toLocaleLowerCase('tr');
  const email = String(request.auth?.token?.email || '').trim().toLocaleLowerCase('tr');
  return Boolean(request.auth && configuredEmail && email === configuredEmail);
}

function requireTeacher(request) {
  if (!isTeacher(request)) throw new HttpsError('permission-denied', 'Bu işlem yalnızca öğretmene açıktır.');
}

exports.bootstrapTeacher = onCall(callableOptions, async (request) => {
  requireTeacher(request);
  const uid = request.auth.uid;
  await Promise.all([
    getAuth().setCustomUserClaims(uid, { role: 'teacher' }),
    db.collection('teachers').doc(uid).set({
      email: request.auth.token.email || '',
      role: 'teacher',
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true }),
  ]);
  return { ok: true };
});

exports.saveClass = onCall(callableOptions, async (request) => {
  requireTeacher(request);
  const input = request.data || {};
  const name = cleanText(input.name, 60);
  const username = cleanUsername(input.username);
  const grade = cleanText(input.grade, 12);
  const classId = cleanId(input.id) || db.collection('classes').doc().id;
  if (!name || !username) throw new HttpsError('invalid-argument', 'Sınıf adı ve kullanıcı adı zorunludur.');

  const duplicateCredential = await db.collection('classCredentials')
    .where('usernameNormalized', '==', username).limit(2).get();
  const duplicateClass = await db.collection('classes').where('username', '==', username).limit(2).get();
  if (duplicateCredential.docs.some((item) => item.id !== classId) ||
      duplicateClass.docs.some((item) => item.id !== classId)) {
    throw new HttpsError('already-exists', 'Bu sınıf kullanıcı adı başka bir sınıfta kullanılıyor.');
  }

  const rawStudents = Array.isArray(input.students) ? input.students : [];
  const numberSet = new Set();
  const students = rawStudents.map((student, index) => {
    const studentName = cleanText(student?.name, 80);
    const schoolNumber = cleanSchoolNumber(student?.schoolNumber);
    const id = cleanId(student?.id) || `student_${classId}_${index + 1}`;
    if (!studentName) throw new HttpsError('invalid-argument', 'Öğrenci adı boş bırakılamaz.');
    if (schoolNumber && numberSet.has(schoolNumber)) {
      throw new HttpsError('already-exists', `${schoolNumber} numaralı öğrenci listede birden fazla kez bulunuyor.`);
    }
    if (schoolNumber) numberSet.add(schoolNumber);
    return { id, name: studentName, schoolNumber, active: student?.active !== false };
  });

  for (const student of students) {
    if (!student.schoolNumber) continue;
    const lookup = await db.collection('studentLookup').doc(student.schoolNumber).get();
    if (lookup.exists && (
      lookup.data()?.studentId !== student.id || lookup.data()?.classId !== classId
    )) {
      throw new HttpsError('already-exists', `${student.schoolNumber} numarası başka bir öğrenciye kayıtlı.`);
    }
  }

  const classRef = db.collection('classes').doc(classId);
  const credentialRef = db.collection('classCredentials').doc(classId);
  const [oldClass, existingCredential] = await Promise.all([classRef.get(), credentialRef.get()]);
  const oldStudents = Array.isArray(oldClass.data()?.students) ? oldClass.data().students : [];
  const batch = db.batch();
  const now = FieldValue.serverTimestamp();
  const classData = {
    name,
    username,
    grade: grade || null,
    description: cleanText(input.description, 300) || null,
    assignedModules: Array.isArray(input.assignedModules) ? input.assignedModules.map(cleanId).filter(Boolean) : [],
    assignedNotebooks: Array.isArray(input.assignedNotebooks) ? input.assignedNotebooks.map(cleanId).filter(Boolean) : [],
    assignedActivities: Array.isArray(input.assignedActivities) ? input.assignedActivities.map(cleanId).filter(Boolean) : [],
    assignedExperiments: Array.isArray(input.assignedExperiments) ? input.assignedExperiments.map((v) => cleanText(v, 120)).filter(Boolean) : [],
    students,
    teacherId: request.auth.uid,
    credentialConfigured: existingCredential.exists || Boolean(input.password),
    password: FieldValue.delete(),
    updated_at: now,
  };
  if (!oldClass.exists) classData.created_at = now;
  batch.set(classRef, classData, { merge: true });

  for (const old of oldStudents) {
    const number = cleanSchoolNumber(old?.schoolNumber);
    if (number && !students.some((student) => student.schoolNumber === number)) {
      batch.delete(db.collection('studentLookup').doc(number));
    }
  }
  for (const student of students) {
    batch.set(classRef.collection('students').doc(student.id), {
      ...student,
      classId,
      updatedAt: now,
    }, { merge: true });
    if (student.schoolNumber) {
      batch.set(db.collection('studentLookup').doc(student.schoolNumber), {
        classId,
        studentId: student.id,
        studentName: student.name,
        active: student.active,
        updatedAt: now,
      });
    }
  }

  const credentialData = { classId, usernameNormalized: username, updatedAt: now };
  if (input.password) Object.assign(credentialData, passwordRecord(input.password));
  if (existingCredential.exists || input.password) {
    batch.set(credentialRef, credentialData, { merge: true });
  }
  await batch.commit();
  return { id: classId };
});

exports.deleteClass = onCall(callableOptions, async (request) => {
  requireTeacher(request);
  const classId = cleanId(request.data?.id);
  if (!classId) throw new HttpsError('invalid-argument', 'Sınıf kimliği gerekli.');
  const classRef = db.collection('classes').doc(classId);
  const snap = await classRef.get();
  const students = Array.isArray(snap.data()?.students) ? snap.data().students : [];
  const batch = db.batch();
  batch.delete(classRef);
  batch.delete(db.collection('classCredentials').doc(classId));
  for (const student of students) {
    const number = cleanSchoolNumber(student?.schoolNumber);
    if (number) batch.delete(db.collection('studentLookup').doc(number));
    if (student?.id) batch.delete(classRef.collection('students').doc(cleanId(student.id)));
  }
  await batch.commit();
  return { ok: true };
});

exports.loginClass = onCall(callableOptions, async (request) => {
  const username = cleanUsername(request.data?.username);
  const password = String(request.data?.password || '');
  if (!username || !password) throw new HttpsError('invalid-argument', 'Kullanıcı adı ve şifre gerekli.');
  const result = await db.collection('classCredentials').where('usernameNormalized', '==', username).limit(1).get();
  if (result.empty || !passwordMatches(password, result.docs[0].data())) {
    throw new HttpsError('unauthenticated', 'Sınıf kullanıcı adı veya şifre hatalı.');
  }
  const classId = result.docs[0].data().classId;
  const classSnap = await db.collection('classes').doc(classId).get();
  if (!classSnap.exists) throw new HttpsError('not-found', 'Sınıf kaydı bulunamadı.');
  const classData = classSnap.data();
  const uid = `class_${classId}`;
  const token = await getAuth().createCustomToken(uid, { role: 'class', classId });
  return { token, classId, className: classData.name, username };
});

exports.loginStudent = onCall(callableOptions, async (request) => {
  const schoolNumber = cleanSchoolNumber(request.data?.schoolNumber);
  if (!schoolNumber) throw new HttpsError('invalid-argument', 'Öğrenci numarası gerekli.');
  const lookup = await db.collection('studentLookup').doc(schoolNumber).get();
  if (!lookup.exists || lookup.data()?.active === false) {
    throw new HttpsError('unauthenticated', 'Öğrenci numarası bulunamadı.');
  }
  const data = lookup.data();
  const uid = `student_${cleanId(data.classId)}_${cleanId(data.studentId)}`;
  const token = await getAuth().createCustomToken(uid, {
    role: 'student',
    classId: data.classId,
    studentId: data.studentId,
  });
  return {
    token,
    classId: data.classId,
    studentId: data.studentId,
    studentName: data.studentName,
  };
});

// Canlı oyun ilk kez bittiğinde değişmez bir sonuç kaydı üretir. İki oyuncu
// farklı sınıftaysa sonuç her iki sınıfın öğretmen raporuna da bağlanır.
exports.archiveLiveChessGame = onDocumentUpdated({
  document: 'chess_rooms/{roomId}',
  region: 'europe-west1',
}, async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!after || before?.status === 'bitti' || after.status !== 'bitti' || !after.result) return;
  if (!after.white?.studentId || !after.black?.studentId) return;

  const roomId = event.params.roomId;
  const finishedAt = FieldValue.serverTimestamp();
  const moves = Array.isArray(after.moves) ? after.moves : [];
  const game = {
    roomId,
    playerIds: [after.white.studentId, after.black.studentId],
    whiteId: after.white.studentId,
    whiteName: after.white.name,
    whiteClassId: after.white.classId || null,
    blackId: after.black.studentId,
    blackName: after.black.name,
    blackClassId: after.black.classId || null,
    moves,
    result: after.result.code,
    reason: after.result.reason || '',
    source: 'live-chess',
    finishedAt,
  };

  const batch = db.batch();
  batch.set(db.collection('liveChessGames').doc(roomId), game);
  const classIds = [...new Set([after.white.classId, after.black.classId].filter(Boolean))];
  for (const classId of classIds) {
    batch.set(db.collection('chess_matches').doc(`${roomId}--${classId}`), {
      id: roomId,
      localId: roomId,
      classId,
      whiteId: after.white.studentId,
      blackId: after.black.studentId,
      result: after.result.code,
      moves,
      source: 'live-chess',
      date: new Date().toISOString(),
      syncedAt: finishedAt,
    });
  }
  await batch.commit();
});
