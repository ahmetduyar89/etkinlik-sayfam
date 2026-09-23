// src/utils/auth.ts — Rol bazlı kimlik doğrulama ve oturum yardımcıları
// ─────────────────────────────────────────────────────────────────────
// Sistemde iki tür oturum vardır:
// 1. 'admin': Tüm içerikleri, defterleri, deneyleri görebilen ve sınıfları
//    yönetebilen yönetici / öğretmen oturumu.
// 2. 'class': Belirli bir sınıfa ait kullanıcı adı/şifre ile açılan ve yalnızca
//    o sınıfa tanımlanmış çalışmaları (satranç, deney, defter vb.) gösteren oturum.
// ─────────────────────────────────────────────────────────────────────

export const APP_ADMIN_USER = (import.meta.env.VITE_APP_ADMIN_USER || 'admin').toLowerCase().trim();
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || '951852';
export const AUTH_STORAGE_KEY = 'etkinlik_giris';
export const SESSION_STORAGE_KEY = 'etkinlik_oturum';

export type AuthSession =
    | { role: 'admin'; username: string }
    | { role: 'class'; classId: string; className: string; username: string };

/** Kayıtlı oturum bilgisini döner */
export function getSession(): AuthSession | null {
    try {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.role === 'admin' || parsed.role === 'class')) {
                return parsed as AuthSession;
            }
        }
    } catch {
        // yoksay
    }

    // Geriye dönük uyumluluk: Eski şifreli giriş varsa admin say
    try {
        if (window.localStorage.getItem(AUTH_STORAGE_KEY) === APP_PASSWORD) {
            return { role: 'admin', username: APP_ADMIN_USER };
        }
    } catch {
        // yoksay
    }

    return null;
}

/** Oturum var mı? */
export function isAuthenticated(): boolean {
    return getSession() !== null;
}

/** Yönetici (Admin / Öğretmen) oturumu mu? */
export function isAdmin(): boolean {
    const session = getSession();
    return session?.role === 'admin';
}

/** Sınıf oturumu mu? */
export function isClassSession(): boolean {
    const session = getSession();
    return session?.role === 'class';
}

/** Oturumu kaydet */
export function saveSession(session: AuthSession): void {
    try {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        if (session.role === 'admin') {
            window.localStorage.setItem(AUTH_STORAGE_KEY, APP_PASSWORD);
        } else {
            window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    } catch (e) {
        console.warn('Oturum kaydedilemedi:', e);
    }
}

/** Geriye dönük uyumlu admin kaydetme */
export function saveAuth(): void {
    saveSession({ role: 'admin', username: APP_ADMIN_USER });
}

/** Çıkış yap: tüm oturumu temizle ve giriş ekranına dön */
export function lockApp(): void {
    try {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // Yoksay
    }
    window.location.href = '/';
}

/**
 * Öğrenciye gönderilen bağlantılar şifre istemez; öğrenciler doğrudan girer.
 * İki tür vardır: etkinlik (?view=student&id=…) ve salt-okunur defter
 * (?view=notebook&id=…).
 */
export function isStudentLink(): boolean {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    return (view === 'student' || view === 'notebook') && !!params.get('id');
}

/**
 * Canlı Satranç bağlantısı (?view=satranc[&oda=1234]).
 */
export function isChessLink(): boolean {
    return new URLSearchParams(window.location.search).get('view') === 'satranc';
}
