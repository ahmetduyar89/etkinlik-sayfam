// src/lib/pwa.ts — Uygulama olarak kurulum + otomatik güncelleme altyapısı.
//
// • registerServiceWorker(): service worker'ı kaydeder, düzenli aralıklarla yeni
//   sürüm arar ve yeni sürüm hazır olduğunda ekranın altında küçük bir şerit gösterir.
// • Kurulum istemi (beforeinstallprompt) yakalanır; Navbar'daki "Uygulama olarak
//   yükle" düğmesi bu istemi kullanır.

const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000; // 30 dakika
const FOCUS_CHECK_THROTTLE = 60 * 1000; // aynı dakikada tekrar tekrar sormayalım

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let lastCheck = 0;
let reloading = false;

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt: () => Promise<void>;
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/** Kurulum isteminin durumu değiştiğinde tetiklenir (Navbar düğmesi dinler). */
export const INSTALL_STATE_EVENT = 'pwa:install-state';

function emitInstallState() {
    window.dispatchEvent(new CustomEvent(INSTALL_STATE_EVENT));
}

/** Uygulama şu anda kurulu pencerede mi çalışıyor? */
export function isRunningStandalone(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        // iOS Safari
        (navigator as unknown as { standalone?: boolean }).standalone === true
    );
}

/** Tarayıcı kurulum istemi hazır mı? */
export function canInstall(): boolean {
    return deferredPrompt !== null;
}

/** Kurulum istemini gösterir; kullanıcı kabul ederse true döner. */
export async function promptInstall(): Promise<boolean> {
    if (!deferredPrompt) return false;
    const evt = deferredPrompt;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    deferredPrompt = null;
    emitInstallState();
    return outcome === 'accepted';
}

export function listenForInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event as BeforeInstallPromptEvent;
        emitInstallState();
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        emitInstallState();
    });
}

export function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    // Geliştirme sunucusunda service worker devre dışı; eski kayıt varsa temizlenir.
    if (!import.meta.env.PROD) {
        navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
        return;
    }

    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((registration) => {
                if (registration.waiting && navigator.serviceWorker.controller) {
                    showUpdateBanner(registration.waiting);
                }

                registration.addEventListener('updatefound', () => {
                    const installing = registration.installing;
                    if (!installing) return;
                    installing.addEventListener('statechange', () => {
                        // controller varsa bu bir güncelleme, ilk kurulum değil.
                        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateBanner(installing);
                        }
                    });
                });

                const check = () => {
                    const now = Date.now();
                    if (now - lastCheck < FOCUS_CHECK_THROTTLE) return;
                    lastCheck = now;
                    registration.update().catch(() => undefined);
                };

                window.setInterval(check, UPDATE_CHECK_INTERVAL);
                window.addEventListener('focus', check);
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') check();
                });
            })
            .catch(() => undefined);

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (reloading) return;
            reloading = true;
            window.location.reload();
        });
    });
}

/** Yeni sürüm hazır olduğunda ekranın altında beliren şerit. */
function showUpdateBanner(worker: ServiceWorker) {
    if (document.getElementById('pwa-update-banner')) return;

    const bar = document.createElement('div');
    bar.id = 'pwa-update-banner';
    bar.setAttribute('role', 'status');
    bar.style.cssText = [
        'position:fixed',
        'left:50%',
        'bottom:20px',
        'transform:translateX(-50%)',
        'z-index:2147483000',
        'display:flex',
        'align-items:center',
        'gap:14px',
        'max-width:calc(100vw - 32px)',
        'padding:12px 14px 12px 18px',
        'border-radius:16px',
        'background:#1e1b4b',
        'color:#ffffff',
        'box-shadow:0 12px 32px rgba(15,23,42,0.32)',
        'font:600 13.5px/1.4 Inter,system-ui,sans-serif',
    ].join(';');

    const text = document.createElement('span');
    text.textContent = 'Yeni sürüm hazır.';
    text.style.cssText = 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis';

    const apply = document.createElement('button');
    apply.type = 'button';
    apply.textContent = 'Güncelle';
    apply.style.cssText =
        'flex-shrink:0;background:#6366f1;color:#fff;border:0;border-radius:10px;padding:8px 14px;font:inherit;cursor:pointer';
    apply.onclick = () => {
        apply.disabled = true;
        apply.textContent = 'Güncelleniyor…';
        worker.postMessage({ type: 'SKIP_WAITING' });
    };

    const later = document.createElement('button');
    later.type = 'button';
    later.setAttribute('aria-label', 'Kapat');
    later.textContent = '✕';
    later.style.cssText =
        'flex-shrink:0;background:transparent;color:#c7d2fe;border:0;font:inherit;cursor:pointer;padding:8px';
    later.onclick = () => bar.remove();

    bar.append(text, apply, later);
    document.body.appendChild(bar);
}
