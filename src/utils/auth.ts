// src/utils/auth.ts — Basit şifre kilidi yardımcıları
// NOT: Tamamen tarayıcıda çalışan basit bir kilittir; şifre sayfa kaynağında
// görülebilir. Gerçek koruma için ileride sunucu tarafı doğrulama gerekir.

// Şifre ortam değişkeniyle değiştirilebilir; yoksa varsayılan kullanılır.
export const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD || '951852';
export const AUTH_STORAGE_KEY = 'etkinlik_giris';

/** Kayıtlı giriş bilgisi (localStorage kapalıysa null). */
export function readStoredAuth(): string | null {
    try {
        return window.localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
        return null;
    }
}

/** Şifre değişirse eski girişler otomatik geçersiz olsun diye değeri karşılaştırırız. */
export function isAuthenticated(): boolean {
    return readStoredAuth() === APP_PASSWORD;
}

export function saveAuth(): void {
    try {
        window.localStorage.setItem(AUTH_STORAGE_KEY, APP_PASSWORD);
    } catch {
        // Kaydedilemezse de bu oturum için giriş yapılmış sayılır.
    }
}

/** Çıkış yap: kaydı sil ve giriş ekranına dön. */
export function lockApp(): void {
    try {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // Yoksay.
    }
    window.location.reload();
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
