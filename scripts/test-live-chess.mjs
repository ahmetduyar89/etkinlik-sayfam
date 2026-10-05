import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import * as engine from '../src/lib/chess/engine/Chess.js';

// Exercise the actual room service against an in-memory transaction adapter.
function roomService() {
    const records = new Map();
    const firestore = {
        doc: (_db, _collection, code) => code,
        runTransaction: async (_db, operation) => operation({
            get: async (code) => ({ exists: () => records.has(code), data: () => structuredClone(records.get(code)) }),
            set: (code, value) => records.set(code, structuredClone(value)),
        }),
    };
    const exports = {};
    const output = ts.transpileModule(readFileSync(new URL('../src/lib/chess/rooms.ts', import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    runInNewContext(output, { exports, Date, Math, require: (id) => {
        if (id === 'firebase/firestore') return firestore;
        if (id === '../firebase') return { db: {} };
        if (id === './engine/Chess') return engine;
        throw new Error(`Unexpected import ${id}`);
    } });
    return exports;
}

test('players join before starting; custom clock starts with the game', async () => {
    const service = roomService();
    const room = await service.createRoom({ id: 'a', studentId: 'a', name: 'Ali Kaya', classId: 'live-guests', kind: 'acik', timeControl: 'artisli10', minutes: 3, increment: 2, color: 'w', allowDraw: false });
    assert.equal(room.status, 'bekliyor');
    assert.equal(room.clock.w_ms, 180_000);
    await assert.rejects(service.startGame(room.code, 'a'));
    await service.joinRoom(room.code, 'b', 'b', 'Ece Yılmaz', 'live-guests');
    assert.equal((await service.readRoom(room.code)).status, 'bekliyor');
    await assert.rejects(service.startGame(room.code, 'spectator'));
    await service.startGame(room.code, 'b');
    const started = await service.readRoom(room.code);
    assert.equal(started.status, 'oynaniyor');
    assert.equal(started.clock.increment_ms, 2_000);
    assert.equal(started.clock.w_ms, 180_000);
    const spectator = await service.joinRoom(room.code, 'c', 'c', 'Can Yıldız', 'live-guests');
    assert.equal(service.seatColor(spectator, 'c'), null);
    assert.equal(await service.playMove(room.code, 'c', 'e2e4'), false);
    assert.equal(await service.playMove(room.code, 'b', 'e7e5'), false);
    assert.equal(await service.playMove(room.code, 'a', 'e2e4'), true);
    await service.offerDraw(room.code, 'a', true);
    assert.equal((await service.readRoom(room.code)).draw_offer, null);
});

test('untimed games, enabled draw offers, and invalid settings', async () => {
    const service = roomService();
    const options = { id: 'a', studentId: 'a', name: 'Ali Kaya', classId: 'live-guests', kind: 'ozel', timeControl: 'suresiz', color: 'b', minutes: 0, increment: 0, allowDraw: true };
    await assert.rejects(service.createRoom({ ...options, minutes: -1 }));
    await assert.rejects(service.createRoom({ ...options, increment: 61 }));
    const room = await service.createRoom(options);
    assert.equal(room.clock, null);
    assert.equal(room.kind, 'ozel');
    assert.equal(room.black.id, 'a');
    await service.joinRoom(room.code, 'b', 'b', 'Ece Yılmaz', 'live-guests');
    await service.startGame(room.code, 'a');
    await service.offerDraw(room.code, 'a', true);
    await service.answerDraw(room.code, 'b', true);
    const finished = await service.readRoom(room.code);
    assert.equal(finished.status, 'bitti');
    assert.equal(finished.result.code, '1/2-1/2');
});

test('guest sign-in validates full names and grants only the chess role', async () => {
    const require = createRequire(import.meta.url);
    const exports = {};
    let claims;
    runInNewContext(readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8'), {
        exports, Buffer, require: (id) => {
            if (id === 'node:crypto') return require(id);
            if (id === 'firebase-admin/app') return { initializeApp() {} };
            if (id === 'firebase-admin/auth') return { getAuth: () => ({ createCustomToken: async (_id, value) => { claims = value; return 'test-token'; } }) };
            if (id === 'firebase-admin/firestore') return { getFirestore: () => ({}) };
            if (id === 'firebase-functions/params') return { defineString: () => ({}) };
            if (id === 'firebase-functions/v2/https') return { HttpsError: Error, onCall: (_options, callback) => callback };
            if (id === 'firebase-functions/v2/firestore') return { onDocumentUpdated() {} };
            if (id === 'firebase-functions/v2/scheduler') return { onSchedule() {} };
            if (id === './qr-login') return { createQrHandlers: () => ({}) };
            throw new Error(`Unexpected import ${id}`);
        },
    });
    await assert.rejects(exports.loginChessGuest({ data: { name: 'Ali' } }));
    await assert.rejects(exports.loginChessGuest({ data: { name: '123 456' } }));
    const session = await exports.loginChessGuest({ data: { name: '  Ahmet   Yılmaz ' } });
    assert.equal(session.studentName, 'Ahmet Yılmaz');
    assert.equal(claims.role, 'chessGuest');
    assert.equal(claims.classId, 'live-guests');
    assert.equal(claims.studentId, session.studentId);
});
