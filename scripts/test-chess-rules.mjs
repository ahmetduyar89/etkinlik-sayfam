// Run against a local Firestore emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run test:chess-rules
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, where, setDoc, runTransaction } from 'firebase/firestore';

test('class transactions create chess records without exposing other classes', async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'Start a local Firestore emulator first');
  const env = await initializeTestEnvironment({
    projectId: 'demo-chess-rules',
    firestore: { rules: await readFile(process.env.FIRESTORE_RULES_FILE || 'firestore.rules', 'utf8') }
  });
  try {
    await env.clearFirestore();
    const classroom = env.authenticatedContext('class-a', { role: 'class', classId: 'a' }).firestore();
    const student = env.authenticatedContext('student-a', { role: 'student', classId: 'a', studentId: 's1' }).firestore();
    const stranger = env.unauthenticatedContext().firestore();
    const guest = env.authenticatedContext('guest', { role: 'chessGuest', classId: 'a' }).firestore();
    for (const name of ['chess_tournaments', 'chess_matches', 'chess_progress']) {
      const data = { classId: 'a', profileId: 'student:s1', whiteId: 's1', blackId: 's2' };
      await env.withSecurityRulesDisabled(async context => {
        await setDoc(doc(context.firestore(), name, 'b--existing'), { ...data, classId: 'b' });
      });
      await assertFails(getDoc(doc(stranger, name, 'a--missing')));
      await assertFails(getDoc(doc(guest, name, 'a--missing')));
      await assertFails(getDoc(doc(classroom, name, 'b--existing')));
      await assertFails(getDoc(doc(student, name, 'b--existing')));
      await assertFails(getDocs(collection(classroom, name)));
      await assertFails(getDocs(query(collection(classroom, name), where('classId', '==', 'b'))));
      await assertSucceeds(runTransaction(classroom, async transaction => {
        const ref = doc(classroom, name, 'a--new');
        const snapshot = await transaction.get(ref);
        assert.equal(snapshot.exists(), false);
        transaction.set(ref, data);
      }));
      await assertSucceeds(getDocs(query(collection(classroom, name), where('classId', '==', 'a'))));
      await assertSucceeds(runTransaction(classroom, async transaction => {
        const ref = doc(classroom, name, 'a--new');
        const snapshot = await transaction.get(ref);
        assert.equal(snapshot.exists(), true);
        transaction.set(ref, { ...snapshot.data(), updated: true });
      }));
      await assertFails(setDoc(doc(classroom, name, 'b--new'), { ...data, classId: 'b' }));
    }
    await assertSucceeds(runTransaction(student, async transaction => {
      const ref = doc(student, 'chess_progress', 'a--student-progress');
      assert.equal((await transaction.get(ref)).exists(), false);
      transaction.set(ref, { classId: 'a', profileId: 'student:s1', progress: {} });
    }));
    await assertFails(setDoc(doc(student, 'chess_progress', 'a--other-student'), { classId: 'a', profileId: 'student:s2' }));
    await env.withSecurityRulesDisabled(context => setDoc(doc(context.firestore(), 'chess_progress', 'a--other-student'), { classId: 'a', profileId: 'student:s2' }));
    await assertFails(getDoc(doc(student, 'chess_progress', 'a--other-student')));
    await assertFails(setDoc(doc(student, 'chess_tournaments', 'a--student-tournament'), { classId: 'a' }));
  } finally {
    await env.cleanup();
  }
});
