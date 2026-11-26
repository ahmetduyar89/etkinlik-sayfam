const test = require('node:test');
const assert = require('node:assert/strict');
const { createBotGameHandler } = require('./bot-games');
const { setup } = require('./test-support');
class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
test('bot terminal moves are replayed; repeated result does not duplicate XP or games', async () => {
  const s = setup();
  const handler = createBotGameHandler({ db: s.db, HttpsError, FieldValue: { serverTimestamp: () => 'server' }, loadChess: async () => (await import('./chess-engine.mjs')).Chess });
  const game = { id: 'game1', moves: ['f3', 'e5', 'g4', 'Qh4#'], level: 'kolay', playerColor: 'w' };
  assert.deepEqual(await handler(s.request(game)), { result: 'lost' });
  await handler(s.request(game));
  const progress = s.records.get('chess_progress/c1--student%3As1').progress;
  assert.equal(progress.xp, 12); assert.equal(progress.games.lost, 1); assert.equal(progress.gamesArchive.length, 1);
  assert.equal(s.records.get('chess_bot_games/student_s1--game1').moves.length, 4);
  await assert.rejects(handler(s.request({ ...game, id: 'invalid', moves: ['e5'] })), error => error.code === 'invalid-argument');
  await assert.rejects(handler(s.request({ ...game, id: 'unfinished', moves: ['e4'] })), error => error.code === 'failed-precondition');
  await assert.rejects(handler(s.request(game, 'chessGuest')), error => error.code === 'permission-denied');
});
