import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function storage() {
    const values = new Map();
    let mutations = 0;
    return {
        get mutations() { return mutations; },
        getItem: (key) => values.get(key) ?? null,
        setItem(key, value) { if (values.get(key) !== value) { mutations += 1; values.set(key, value); } },
        removeItem(key) { if (values.delete(key)) mutations += 1; },
    };
}
function setup() {
    const exports = {};
    const events = [];
    const window = { dispatchEvent: event => events.push(event.type), localStorage: storage(), sessionStorage: storage(), location: { search: '', href: '/' } };
    const source = readFileSync(new URL('../src/utils/auth.ts', import.meta.url), 'utf8').replaceAll('import.meta.env', 'testEnv');
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(compiled, { exports, window, testEnv: {}, console, Event,
        require: (name) => name === 'firebase/auth' ? { signOut: async () => {} } : { auth: {} },
    });
    return { api: exports, window, events };
}

test('QR screen metadata stays in session storage, including after auth restoration', () => {
    const { api, window } = setup();
    const session = { role: 'admin', username: 'teacher@example.com' };
    api.saveSession(session, 'tab');
    assert.equal(window.localStorage.getItem(api.SESSION_STORAGE_KEY), null);
    assert.equal(window.localStorage.getItem(api.AUTH_STORAGE_KEY), null);
    assert.deepEqual(JSON.parse(JSON.stringify(api.getSession())), session);
    api.saveSession(session);
    assert.equal(window.localStorage.getItem(api.SESSION_STORAGE_KEY), null);
    window.sessionStorage.removeItem(api.SESSION_STORAGE_KEY);
    assert.equal(api.getSession(), null);
});

test('manual phone login remains local and removes the previous tab session', () => {
    const { api, window } = setup();
    api.saveSession({ role: 'admin', username: 'teacher@example.com' }, 'tab');
    const session = { role: 'class', classId: 'c1', className: '7/A', username: '7a' };
    api.saveSession(session, 'local');
    assert.equal(window.sessionStorage.getItem(api.SESSION_STORAGE_KEY), null);
    assert.deepEqual(JSON.parse(window.localStorage.getItem(api.SESSION_STORAGE_KEY)), session);
    assert.equal(window.localStorage.getItem(api.AUTH_STORAGE_KEY), null);
});

test('restoring the same session does not trigger repeated cross-tab storage events', () => {
    const { api, window } = setup();
    const session = { role: 'admin', username: 'teacher@example.com' };
    api.saveSession(session, 'local');
    const writes = window.localStorage.mutations;
    api.saveSession(session);
    api.saveSession(session);
    assert.equal(window.localStorage.mutations, writes);
});

test('logout clears both persistence modes and the legacy marker', () => {
    const { api, window } = setup();
    api.saveSession({ role: 'admin', username: 'teacher@example.com' }, 'local');
    window.sessionStorage.setItem(api.SESSION_STORAGE_KEY, '{"role":"class"}');
    api.clearSession();
    assert.equal(api.getSession(), null);
    assert.equal(window.localStorage.getItem(api.AUTH_STORAGE_KEY), null);
});


test('student restoration is stable and announces metadata changes without page reload', () => {
    const { api, window, events } = setup();
    const session = { role: 'student', classId: 'c1', studentId: 's1', studentName: 'Ali Kaya', schoolNumber: '0012' };
    api.saveSession(session, 'local');
    const writes = window.localStorage.mutations;
    api.saveSession({ ...session });
    api.saveSession({ ...session });
    assert.equal(window.localStorage.mutations, writes);
    assert.deepEqual(events, [api.SESSION_CHANGED_EVENT]);
    api.saveSession({ ...session, schoolNumber: '0013' });
    assert.equal(api.getSession().schoolNumber, '0013');
    assert.equal(events.length, 2);
    api.clearSession();
    assert.equal(events.length, 3);
    assert.equal(api.getSession(), null);
    assert.equal(window.location.href, '/');
});
