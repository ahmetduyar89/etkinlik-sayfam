import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = (await readFile(new URL('../public/sw.js', import.meta.url), 'utf8'))
    .replace('/*__APP_PATHS__*/', '"deneyler", "satranc"')
    .replace('/*__SHELL_ASSETS__*/', '"/assets/app.js"');

function worker({ offline = false, status = 200, precacheFails = false } = {}) {
    const listeners = new Map();
    const stores = new Map();
    const requests = [];
    const cache = (name) => {
        if (!stores.has(name)) stores.set(name, new Map());
        const entries = stores.get(name);
        return {
            match: async (key) => entries.get(typeof key === 'string' ? key : key.url)?.clone(),
            put: async (key, value) => entries.set(typeof key === 'string' ? key : key.url, value.clone()),
            add: async (key) => entries.set(key.url.replace('https://app.test', ''), new Response('shell')),
            addAll: async (keys) => {
                if (precacheFails) throw new Error('download failed');
                for (const key of keys) entries.set(key, new Response('asset'));
            },
        };
    };
    class AppRequest extends Request {
        constructor(url, options) { super(new URL(url, 'https://app.test'), options); }
    }
    vm.runInNewContext(source, {
        self: {
            location: { origin: 'https://app.test' },
            registration: {}, clients: { claim: async () => {} },
            addEventListener: (type, listener) => listeners.set(type, listener),
        },
        caches: {
            open: async (name) => cache(name),
            keys: async () => [...stores.keys()],
            delete: async (name) => stores.delete(name),
        },
        fetch: async (request) => {
            requests.push(request.url);
            if (offline) throw new Error('offline');
            return new Response('new content', { status });
        },
        URL, Request: AppRequest, Response, setTimeout, clearTimeout,
    });
    return {
        stores, requests,
        lifecycle: (type) => {
            let promise;
            listeners.get(type)({ waitUntil: (value) => { promise = value; } });
            return promise;
        },
        request: (url, mode = 'cors') => {
            let response;
            listeners.get('fetch')({ request: { url, mode, method: 'GET' }, respondWith: (value) => { response = value; } });
            return response;
        },
    };
}

test('ilk kurulum kabukla birlikte uygulama dosyalarını hazırlar', async () => {
    const app = worker();
    await app.lifecycle('install');
    assert.equal(app.stores.get('ad-assets-v3').has('/assets/app.js'), true);
    assert.equal([...app.stores.values()].some((store) => store.has('/index.html')), true);
});

test('başarısız indirmede eksik sürüm etkinleştirilmez', async () => {
    await assert.rejects(worker({ precacheFails: true }).lifecycle('install'), /download failed/);
});

test('diğer uygulamaların önbellekleri korunur', async () => {
    const app = worker();
    app.stores.set('chess-cache', new Map());
    app.stores.set('ad-html-old', new Map());
    await app.lifecycle('activate');
    assert(app.stores.has('chess-cache'));
    assert(!app.stores.has('ad-html-old'));
});

test('Firebase ve bağımsız deney/satranç sayfaları yakalanmaz', () => {
    const app = worker();
    for (const url of ['https://firestore.googleapis.com/documents', 'https://app.test/deneyler/test.html', 'https://app.test/satranc/', 'https://app.test/__/auth/handler']) {
        assert.equal(app.request(url, 'navigate'), undefined);
    }
});

test('adı sabit içerik önce ağdan güncellenir', async () => {
    const app = worker();
    const url = 'https://app.test/activity.html';
    app.stores.set('ad-assets-v3', new Map([[url, new Response('old content')]]));
    assert.equal(await (await app.request(url)).text(), 'new content');
});

test('çevrimdışıyken ve sunucu hatasında kabuk açılır', async () => {
    for (const config of [{ offline: true }, { status: 503 }]) {
        const app = worker(config);
        await app.lifecycle('install');
        assert.equal(await (await app.request('https://app.test/etkinlikler', 'navigate')).text(), 'shell');
    }
});

test('hash içeren dosyalar çevrimdışıyken önbellekten açılır', async () => {
    const app = worker({ offline: true });
    const url = 'https://app.test/assets/app-hash.js';
    app.stores.set('ad-assets-v3', new Map([[url, new Response('cached module')]]));
    assert.equal(await (await app.request(url)).text(), 'cached module');
    assert.equal(app.requests.length, 0);
});
