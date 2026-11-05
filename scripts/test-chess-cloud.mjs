import test from 'node:test';
import assert from 'node:assert/strict';
import { changesBetween, serializeTournament, deserializeTournament, progressPatch, tidyArchive } from '../apps/satranc/src/services/CloudRecords.js';
import { startCloudSync } from '../apps/satranc/src/services/CloudSyncService.js';

const ops = { increment: n => ({ inc: n }), arrayUnion: (...items) => ({ union: items }) };
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('transport metadata is ignored; updates and removals are explicit', () => {
  const before = new Map([['one', { result: '1-0', syncedAt: 1, ownerUid: 'a' }], ['two', { result: '0-1' }]]);
  assert.deepEqual(changesBetween(before, new Map([['one', { ownerUid: 'b', result: '1-0', syncedAt: 2 }]])), [
    { id: 'two', before: { result: '0-1' }, after: null }
  ]);
});

test('tournament round shrink and reopened tournament are preserved', () => {
  const item = { finished: false, rounds: [[{ result: null }]] };
  assert.deepEqual(deserializeTournament(serializeTournament(item)), item);
  assert.equal(changesBetween(new Map([['t', { finished: true, rounds: [[], []] }]]), new Map([['t', item]])).length, 1);
});

test('progress is sent as additions so two devices never erase each other', () => {
  const before = { xp: 100, stars: 2, completedLessons: ['week-1'], games: { won: 1, lost: 0, drawn: 0 },
    dailyPractice: { '2026-10-13': 2 }, puzzleStats: { fork: { solved: 1, wrong: 0, hints: 0, lastAt: 'a' } },
    miniGames: { quiz: { best: 5 } }, gamesArchive: [{ id: 'g1', moves: [] }], settings: { sound: true } };
  const after = { ...before, xp: 120, stars: 3, completedLessons: ['week-1', 'week-2'], games: { won: 2, lost: 0, drawn: 0 },
    dailyPractice: { '2026-10-13': 2, '2026-10-14': 1 }, puzzleStats: { fork: { solved: 2, wrong: 0, hints: 0, lastAt: 'b' } },
    miniGames: { quiz: { best: 7 } }, gamesArchive: [{ id: 'g2', moves: [] }, { id: 'g1', moves: [] }], settings: { sound: false } };
  assert.deepEqual(progressPatch(before, after, ops), { replace: false, patch: {
    xp: { inc: 20 }, stars: { inc: 1 }, completedLessons: { union: ['week-2'] }, games: { won: { inc: 1 } },
    dailyPractice: { '2026-10-14': { inc: 1 } }, puzzleStats: { fork: { solved: { inc: 1 }, lastAt: 'b' } },
    miniGames: { quiz: { best: 7 } }, gamesArchive: { union: [{ id: 'g2', moves: [] }] }, settings: { sound: false }
  } });
  assert.deepEqual(progressPatch(before, before, ops), { replace: false, patch: null });
  assert.equal(progressPatch(before, { xp: 0, completedLessons: [] }, ops).replace, true, 'reset replaces the record');
});

test('server archive is newest first, unique and limited', () => {
  const games = [{ id: 'a', playedAt: '2026-01-01' }, { id: 'b', playedAt: '2026-03-01' }, { id: 'a', playedAt: '2026-01-01' }, { id: 'c', playedAt: '2026-02-01' }];
  assert.deepEqual(tidyArchive(games, 2).map(g => g.id), ['b', 'c']);
});

function harness({ claims = { role: 'teacher' }, search = '', localClasses = [], localMatches = [] } = {}) {
  const events = new EventTarget(); const values = new Map(); const watchers = new Map(); const writes = []; const statuses = [];
  let rejectNext = null;
  globalThis.CustomEvent = class extends Event { constructor(type, options) { super(type); this.detail = options?.detail; } };
  globalThis.window = Object.assign(events, { setTimeout, clearTimeout, alert() {}, location: { reload() {} } });
  globalThis.location = { protocol: 'https:', search };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  globalThis.localStorage = { getItem: k => values.get(k) || null, setItem: (k, v) => values.set(k, v) };
  events.addEventListener('satranc-cloud-status', e => statuses.push(e.detail));
  const listeners = () => { const subs = new Set(); return { onChange: fn => { subs.add(fn); return () => subs.delete(fn); }, save() { for (const fn of subs) fn(); } }; };
  const classroom = { ...listeners(), state: { activeClassId: null, classes: localClasses, matches: localMatches, tournaments: [] } };
  const progress = { ...listeners(), store: { profiles: { teacher: { xp: 99 } }, profileNames: {} }, activeProfileId: 'teacher', state: { xp: 99 } };
  const sdk = {
    collection: (_, name) => name, doc: (_, name, id) => `${name}/${id}`, where: (...args) => args,
    query: (name, ...filters) => { if (claims.role === 'teacher') throw new Error('Teacher must not be scoped'); return name; },
    serverTimestamp: () => 'server', increment: ops.increment, arrayUnion: ops.arrayUnion,
    onSnapshot: (ref, options, callback) => { assert.equal(options.includeMetadataChanges, true); watchers.set(ref, callback); return () => watchers.delete(ref); },
    setDoc: async (ref, data, options) => { writes.push({ type: 'set', ref, data, options }); if (rejectNext) { const e = rejectNext; rejectNext = null; throw e; } },
    deleteDoc: async ref => { writes.push({ type: 'delete', ref }); },
  };
  const connect = async () => ({ auth: { currentUser: { uid: 'u1', getIdTokenResult: async () => ({ claims }) } }, db: {}, storeSdk: sdk });
  const send = (name, docs, metadata = {}) => (watchers.get(name) || watchers.get(`${name}/${claims.classId}`))({
    metadata: { fromCache: false, hasPendingWrites: false, ...metadata },
    docs: docs.map(([id, data]) => ({ id, data: () => data })),
    exists: () => docs.length > 0, data: () => docs[0]?.[1], id: docs[0]?.[0],
  });
  return { classroom, progress, statuses, writes, send, values, connect, watchers, reject: e => { rejectNext = e; } };
}

test('stale device data is never uploaded; teacher sees every class and opens the requested one', async () => {
  const h = harness({ search: '?classId=c2', localMatches: [{ id: 'stale', classId: 'c1', result: '1-0' }] });
  const stop = await startCloudSync({ classroom: h.classroom, progress: h.progress, connect: h.connect });
  h.send('classes', [['c1', { name: '1-A', students: [] }], ['c2', { name: '2-B', students: [{ id: 's1', name: 'Ali' }] }]]);
  h.send('chess_matches', [['c1--m', { classId: 'c1', id: 'm', localId: 'm', result: '1-0' }]]);
  h.send('chess_tournaments', []);
  h.send('chess_progress', []);
  await wait(300);
  assert.deepEqual(h.writes, [], 'opening the app must not write anything');
  assert.equal(h.classroom.state.activeClassId, 'c2');
  assert.deepEqual(h.classroom.state.matches.map(m => m.id), ['m']);
  assert.ok(h.values.get('satranc-online-migration-backup').includes('stale'));
  assert.equal(h.statuses.at(-1).status, 'online');
  assert.ok(!h.statuses.some(s => s.blocking), 'connecting never locks the screen');
  stop(); assert.equal(h.watchers.size, 0);
});

test('work done offline or before the server answers is queued, not thrown away', async () => {
  const h = harness({ claims: { role: 'class', classId: 'c1' }, localClasses: [{ id: 'c1', name: '1-A', students: [] }] });
  const stop = await startCloudSync({ classroom: h.classroom, progress: h.progress, connect: h.connect });
  navigator.onLine = false; window.dispatchEvent(new Event('offline'));
  h.classroom.state.matches.push({ id: 'new', classId: 'c1', whiteId: 'a', blackId: 'b', result: '0-1' }); h.classroom.save();
  await wait(300);
  assert.equal(h.statuses.at(-1).status, 'offline');
  assert.equal(h.writes.at(-1).ref, 'chess_matches/c1--new', 'the write is handed to the persistent queue');
  assert.equal(h.classroom.state.matches.at(-1).result, '0-1', 'the local result stays on screen');
  stop();
});

test('class progress is written as increments and deleted matches propagate', async () => {
  const h = harness({ claims: { role: 'class', classId: 'c1' } });
  const stop = await startCloudSync({ classroom: h.classroom, progress: h.progress, connect: h.connect });
  h.send('classes', [['c1', { name: '1-A', students: [] }]]);
  h.send('chess_matches', [['c1--m', { classId: 'c1', id: 'm', localId: 'm', result: '1-0' }]]);
  h.send('chess_tournaments', []);
  h.send('chess_progress', [['c1--class%3Ac1', { classId: 'c1', profileId: 'class:c1', profileName: '1-A Sınıfı', progress: { xp: 40, completedLessons: ['week-1'] } }]]);
  assert.equal(h.classroom.state.activeClassId, 'c1');
  // Uygulamanın kendisi aktif profili sınıf profiline çevirir.
  h.progress.activeProfileId = 'class:c1'; h.progress.state = h.progress.store.profiles['class:c1'];
  h.progress.state.completedLessons.push('week-2'); h.progress.state.xp += 20; h.progress.save();
  h.classroom.state.matches = []; h.classroom.save();
  await wait(300);
  const progressWrite = h.writes.find(w => w.ref === 'chess_progress/c1--class%3Ac1');
  assert.deepEqual(progressWrite.data.progress, { xp: { inc: 20 }, completedLessons: { union: ['week-2'] } });
  assert.deepEqual(progressWrite.options, { merge: true });
  assert.ok(h.writes.some(w => w.type === 'delete' && w.ref === 'chess_matches/c1--m'));
  stop();
});

test('a rejected write is shown until a later write succeeds', async () => {
  const h = harness({ claims: { role: 'class', classId: 'c1' } });
  const stop = await startCloudSync({ classroom: h.classroom, progress: h.progress, connect: h.connect });
  for (const name of ['chess_matches', 'chess_tournaments', 'chess_progress']) h.send(name, []);
  h.send('classes', [['c1', { name: '1-A', students: [] }]]);
  h.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }));
  h.classroom.state.matches.push({ id: 'x', classId: 'c1', whiteId: 'a', blackId: 'b', result: '1-0' }); h.classroom.save();
  await wait(300);
  assert.equal(h.statuses.at(-1).status, 'error');
  h.send('chess_progress', []);
  assert.equal(h.statuses.at(-1).status, 'error', 'a successful read cannot hide a failed write');
  h.classroom.state.matches.push({ id: 'y', classId: 'c1', whiteId: 'a', blackId: 'b', result: '0-1' }); h.classroom.save();
  await wait(300);
  assert.equal(h.statuses.at(-1).status, 'online');
  stop();
});
