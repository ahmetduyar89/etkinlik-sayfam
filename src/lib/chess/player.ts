// src/lib/chess/player.ts — Canlı Satranç oyuncu kimliği
// ─────────────────────────────────────────────────────────────────────
// Bu sayfada giriş yoktur: çocuk adını yazar ve oynar. Yine de "bu hamleyi
// kim yaptı, bu masada hangi koltuk benim" sorusunun yanıtı gerekir. Bunun
// için tarayıcıda kalıcı, rastgele bir kimlik üretilir.
//
// Kimlik gizli bir şey değildir; yalnızca aynı odadaki iki cihazı birbirinden
// ayırır. Sekme yenilendiğinde oyuncunun aynı koltuğa dönmesini de bu sağlar.
// ─────────────────────────────────────────────────────────────────────

const ID_KEY = 'satranc_oyuncu_id';
const NAME_KEY = 'satranc_oyuncu_ad';

/** Tarayıcıda saklanan kalıcı oyuncu kimliği; yoksa üretilir. */
export function playerId(): string {
    try {
        const saved = window.localStorage.getItem(ID_KEY);
        if (saved) return saved;
    } catch {
        // localStorage kapalıysa aşağıdaki geçici kimlik kullanılır.
    }
    const fresh = `o${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
    try {
        window.localStorage.setItem(ID_KEY, fresh);
    } catch {
        // Kaydedilemezse kimlik yalnızca bu sayfa ömrü boyunca yaşar.
    }
    return fresh;
}

/** Son yazılan ad soyad (bir dahaki girişte hazır gelsin diye). */
export function readPlayerName(): string {
    try {
        return window.localStorage.getItem(NAME_KEY) || '';
    } catch {
        return '';
    }
}

export function savePlayerName(name: string): void {
    try {
        window.localStorage.setItem(NAME_KEY, name);
    } catch {
        // Yoksay: ad zaten bu oturumda bellekte tutuluyor.
    }
}

/**
 * Ad soyadı temizler: baştaki/sondaki boşluklar gider, araya düşen fazla
 * boşluklar teke iner, uzunluk sınırlanır. Çocuklar bazen büyük harf kilidiyle
 * yazar; görünümü bozmasın diye baş harfler büyük, kalanı küçük yapılır.
 */
export function normalizeName(raw: string): string {
    const cleaned = raw.replace(/\s+/g, ' ').trim().slice(0, 28);
    return cleaned.replace(
        /\p{L}+/gu,
        (word) => word[0].toLocaleUpperCase('tr') + word.slice(1).toLocaleLowerCase('tr')
    );
}

/** Ad soyad geçerli mi: en az iki harf. */
export function isValidName(raw: string): boolean {
    return normalizeName(raw).replace(/[^\p{L}]/gu, '').length >= 2;
}
