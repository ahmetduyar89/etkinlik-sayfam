/* public/sw.js — Masaüstü/mobil uygulama katmanı.
 *
 * Amaç:
 *   1) Sayfa "uygulama" olarak kurulabilsin (yüklenebilirlik şartı).
 *   2) Sitede yapılan her değişiklik uygulamaya OTOMATİK yansısın.
 *   3) İnternet yokken uygulama en azından açılsın.
 *
 * Güncelleme stratejisi:
 *   • index.html (gezinme istekleri) her zaman ÖNCE AĞDAN alınır → yeni yayın
 *     yapıldığı anda uygulama yeni sürümü görür. Ağ yoksa önbellekten açılır.
 *   • /assets/* dosyalarının adında içerik özeti (hash) bulunduğu için
 *     önbellekten servis edilmeleri güvenlidir; yeni yayında adları değişir.
 *   • Firebase/Firestore istekleri hiçbir zaman ele geçirilmez.
 */

const VERSION = 'v1';
const HTML_CACHE = `ad-html-${VERSION}`;
const ASSET_CACHE = `ad-assets-${VERSION}`;
const FONT_CACHE = `ad-fonts-${VERSION}`;
const KEEP = [HTML_CACHE, ASSET_CACHE, FONT_CACHE];

const APP_SHELL = '/index.html';
const NETWORK_TIMEOUT = 8000; // ms — ağ bu sürede yanıt vermezse önbelleğe düş

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(HTML_CACHE)
            .then((cache) => cache.add(new Request(APP_SHELL, { cache: 'reload' })))
            .catch(() => undefined)
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k)));
            if (self.registration.navigationPreload) {
                await self.registration.navigationPreload.enable().catch(() => undefined);
            }
            await self.clients.claim();
        })()
    );
});

// Sayfa "yeni sürüme geç" dediğinde bekleyen worker devreye girer.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    let url;
    try {
        url = new URL(req.url);
    } catch {
        return;
    }

    const sameOrigin = url.origin === self.location.origin;
    const isFont = FONT_HOSTS.includes(url.hostname);

    // Firebase, Firestore, analiz vb. üçüncü taraf istekleri dokunulmadan geçer.
    if (!sameOrigin && !isFont) return;
    if (sameOrigin && url.pathname.startsWith('/__')) return;

    if (req.mode === 'navigate') {
        event.respondWith(handleNavigation(event));
        return;
    }
    if (isFont) {
        event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
        return;
    }
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(cacheFirst(req, ASSET_CACHE));
        return;
    }
    event.respondWith(staleWhileRevalidate(req, ASSET_CACHE));
});

/** Gezinme: önce ağ (böylece yeni yayın anında görülür), olmazsa önbellek. */
async function handleNavigation(event) {
    const cache = await caches.open(HTML_CACHE);
    try {
        const preload = await event.preloadResponse;
        const response = preload || (await fetchWithTimeout(event.request));
        if (response && response.ok) cache.put(APP_SHELL, response.clone());
        return response;
    } catch {
        return (await cache.match(APP_SHELL)) || (await cache.match(event.request)) || Response.error();
    }
}

/** İçerik özetli dosyalar: önbellek varsa oradan, yoksa ağdan alıp saklar. */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
}

/** Adı sabit dosyalar: önbellekten hızlı ver, arka planda tazele. */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    const network = fetch(request)
        .then((response) => {
            if (response && (response.ok || response.type === 'opaque')) {
                cache.put(request, response.clone()).catch(() => undefined);
            }
            return response;
        })
        .catch(() => undefined);
    return hit || (await network) || Response.error();
}

function fetchWithTimeout(request) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT);
        fetch(request).then(
            (r) => {
                clearTimeout(timer);
                resolve(r);
            },
            (e) => {
                clearTimeout(timer);
                reject(e);
            }
        );
    });
}
