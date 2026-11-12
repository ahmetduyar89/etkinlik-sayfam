const test = require('node:test');
const assert = require('node:assert/strict');
const { createLearningHandlers, createClassNotebookHandler, classMatchPlayerId, evidenceFor } = require('./learning');
class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
const { setup } = require('./test-support');

const rejects = (promise, code) => assert.rejects(promise, error => error.code === code);
test('only teacher assigns; inactive or foreign students/resources are rejected', async () => {
  const s = setup(); await rejects(s.handlers.saveLearningAssignment(s.request({})), 'permission-denied');
  await rejects(s.assign({ studentIds: ['foreign'] }), 'invalid-argument');
  await rejects(s.assign({ resourceId: 'week-37' }), 'invalid-argument');
  await rejects(s.assign({ kind: 'experiment', resourceId: '../secret.html' }), 'invalid-argument');
  await rejects(s.assign({ kind: 'chess-puzzle', resourceId: 'puzzle-9999' }), 'invalid-argument');
  const item = await s.assign({ studentIds: ['s1'] });
  await rejects(s.handlers.startLearningAssignment(s.request({ assignmentId: item.id }, 'student', 's2')), 'permission-denied');
  await rejects(s.handlers.startLearningAssignment(s.request({ assignmentId: item.id }, 'student', 's1', 'other')), 'permission-denied');
});
test('stable results survive repeated starts; progress completes tasks automatically', async () => {
  const s = setup(); const a = await s.assign({});
  const first = await s.handlers.startLearningAssignment(s.request({ assignmentId: a.id }));
  const again = await s.handlers.startLearningAssignment(s.request({ assignmentId: a.id }));
  assert.equal(first.id, again.id);
  assert.equal(s.records.get(`learning_results/${first.id}`).status, 'started');
  await rejects(s.handlers.completeLearningAssignment(s.request({ assignmentId: a.id })), 'failed-precondition');
  s.records.set('chess_progress/c1--student%3As1', { progress: { completedLessons: ['week-1'] } });
  await s.handlers.syncProgressResults('c1', 's1');
  assert.equal(s.records.get(`learning_results/${first.id}`).status, 'completed');
  assert.equal(s.records.get(`learning_results/${first.id}`).completionSource, 'chess-progress');
  await s.handlers.syncProgressResults('c1', 's1');
  await s.handlers.archiveLearningAssignment(s.request({ id: a.id }, 'teacher'));
  assert.equal(s.records.get(`learning_results/${first.id}`).status, 'completed');
  await rejects(s.handlers.startLearningAssignment(s.request({ assignmentId: a.id })), 'permission-denied');
});
test('test result must belong to the verified student and exact assignment', async () => {
  const s = setup(); const a = await s.assign({ kind: 'activity', resourceId: 'a1' });
  await s.handlers.startLearningAssignment(s.request({ assignmentId: a.id }));
  s.records.set('submissions/test1', { activity_id: 'a1', student_id: 's2', class_id: 'c1', assignment_id: a.id, submitted_at: 'now', answers: { q1: 'B' } });
  await rejects(s.handlers.completeLearningAssignment(s.request({ assignmentId: a.id, submissionId: 'test1' })), 'failed-precondition');
  s.records.get('submissions/test1').student_id = 's1';
  await s.handlers.completeLearningAssignment(s.request({ assignmentId: a.id, submissionId: 'test1' }));
  const result = s.records.get(`learning_results/${a.id}--s1`);
  assert.equal(result.status, 'completed'); assert.deepEqual(result.evidence.answers, { q1: 'B' });
});
test('mini games and computer games require a new recorded attempt', () => {
  assert.equal(evidenceFor({ kind: 'chess-minigame', resourceId: 'kare-bul' }, { miniGames: { 'kare-bul': { plays: 2 } } }, { miniGames: { 'kare-bul': { plays: 2 } } }), null);
  assert.equal(evidenceFor({ kind: 'chess-minigame', resourceId: 'kare-bul' }, { miniGames: { 'kare-bul': { plays: 3, best: 40 } } }, { miniGames: { 'kare-bul': { plays: 2 } } }).best, 40);
  assert.equal(evidenceFor({ kind: 'chess-bot', resourceId: 'zor' }, { gamesArchive: [{ id: 'old', level: { id: 'zor' } }, { id: 'new', level: { id: 'kolay' } }] }, { gamesArchive: [{ id: 'old' }] }), null);
});

test('class notebook creation atomically assigns the notebook and checks class scope', async () => {
  const s = setup();
  const handler = createClassNotebookHandler({ db: s.db, HttpsError, FieldValue: { serverTimestamp: () => 'server' }, requireTeacher: request => { if (request.auth?.token.role !== 'teacher') throw new HttpsError('permission-denied', 'Teacher only'); } });
  const created = await handler(s.request({ classId: 'c1' }, 'class'));
  assert.ok(s.records.has(`notebooks/${created.id}`));
  assert.deepEqual(s.records.get('classes/c1').assignedNotebooks, [created.id]);
  await rejects(handler(s.request({ classId: 'c1' }, 'class', 's1', 'other')), 'permission-denied');
  await rejects(handler(s.request({ classId: 'c1' }, 'student')), 'permission-denied');
});

test('same student IDs in different classes cannot share a match score identity', () => {
  assert.equal(classMatchPlayerId({ classId: 'c1', studentId: 's1' }, 'c1'), 's1');
  assert.equal(classMatchPlayerId({ classId: 'c2', studentId: 's1' }, 'c1'), 'external:c2:s1');
});
