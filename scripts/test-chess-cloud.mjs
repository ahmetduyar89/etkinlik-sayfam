import test from 'node:test';
import assert from 'node:assert/strict';
import { changesBetween, serializeTournament, deserializeTournament } from '../apps/satranc/src/services/CloudRecords.js';
import { startCloudSync } from '../apps/satranc/src/services/CloudSyncService.js';

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
test('server first, teacher sees every class, deletion propagates, transactions acknowledge and detect conflicts', async () => {
  const events = new EventTarget(); const values = new Map(); const watchers = new Map(); const records = new Map();
  const statuses = []; let transactionCount = 0;
  globalThis.CustomEvent = class extends Event { constructor(type, options) { super(type); this.detail = options?.detail; } };
  globalThis.window = Object.assign(events, { setTimeout, clearTimeout, alert() {}, location: { reload() {} } });
  globalThis.location = { protocol: 'https:' };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  globalThis.localStorage = { getItem: k => values.get(k) || null, setItem: (k,v) => values.set(k,v) };
  events.addEventListener('satranc-cloud-status', e => statuses.push(e.detail.status));
  const listeners = () => { const subs = new Set(); return { onChange: fn => { subs.add(fn); return () => subs.delete(fn); }, save() { for (const fn of subs) fn(); } }; };
  const classroom = { ...listeners(), state: { activeClassId: 'old', classes: [], matches: [{ id: 'stale', classId: 'old', result: '1-0' }], tournaments: [] } };
  const progress = { ...listeners(), store: { profiles: { teacher: { xp: 99 } }, profileNames: {} }, activeProfileId: 'teacher', state: { xp: 99 } };
  const sdk = {
    collection: (_,name) => name, doc: (_,name,id) => `${name}/${id}`, query() { throw new Error('Teacher must not be scoped to a local class'); }, where() {}, serverTimestamp: () => 'server',
    onSnapshot: (ref, options, callback) => { assert.equal(options.includeMetadataChanges, true); watchers.set(ref, callback); return () => watchers.delete(ref); },
    runTransaction: async (_, fn) => { transactionCount++; const writes = []; await fn({
      get: async ref => ({ exists: () => records.has(ref), data: () => records.get(ref) }),
      set: (ref,data) => writes.push(() => records.set(ref,data)), delete: ref => writes.push(() => records.delete(ref))
    }); writes.forEach(fn => fn()); }
  };
  const stop = await startCloudSync({ classroom, progress, connect: async () => ({ auth: { currentUser: { uid: 'teacher', getIdTokenResult: async () => ({ claims: { role: 'teacher' } }) } }, db: {}, storeSdk: sdk }) });
  const send = (name, docs, metadata = {}) => {
    for (const [id,data] of docs) records.set(`${name}/${id}`,data);
    watchers.get(name)({ metadata: { fromCache: false, hasPendingWrites: false, ...metadata }, docs: docs.map(([id,data]) => ({ id, data: () => data })) });
  };
  send('chess_matches', [] , { fromCache: true });
  assert.equal(transactionCount, 0); assert.ok(!statuses.includes('online'));
  send('classes', [['c', { name: '1-A', students: [] }]]);
  send('chess_matches', [['m', { classId: 'c', id: 'm', localId: 'm', result: '1-0' }]]);
  send('chess_tournaments', []);
  send('chess_progress', []);
  assert.equal(statuses.at(-1), 'online'); assert.equal(transactionCount, 0);
  assert.equal(classroom.state.matches[0].id, 'm');
  assert.ok(values.get('satranc-online-migration-backup').includes('stale'));
  records.delete('chess_matches/m'); send('chess_matches', []);
  assert.deepEqual(classroom.state.matches, []);
  classroom.state.matches.push({ id: 'new', classId: 'c', result: '0-1' }); classroom.save();
  assert.equal(statuses.at(-1), 'saving');
  await new Promise(resolve => setTimeout(resolve, 300));
  assert.equal(records.get('chess_matches/c--new').result, '0-1');
  assert.equal(statuses.at(-1), 'online');
  navigator.onLine = false; window.dispatchEvent(new Event('offline'));
  const countBeforeOffline = transactionCount;
  classroom.state.matches[0].result = '1-0'; classroom.save();
  assert.equal(classroom.state.matches[0].result, '0-1');
  assert.equal(statuses.at(-1), 'offline');
  assert.equal(transactionCount, countBeforeOffline);
  navigator.onLine = true; window.dispatchEvent(new Event('online'));
  // Another device changes the same record before our transaction reads it.
  classroom.state.matches[0].result = '1-0'; classroom.save();
  records.set('chess_matches/c--new', { classId: 'c', id: 'new', localId: 'new', result: '1/2-1/2' });
  await new Promise(resolve => setTimeout(resolve, 300));
  assert.equal(statuses.at(-1), 'error');
  assert.equal(records.get('chess_matches/c--new').result, '1/2-1/2');
  send('chess_progress', []);
  assert.equal(statuses.at(-1), 'error', 'A successful stream cannot mask a failed write');
  stop(); assert.equal(watchers.size, 0);
});
