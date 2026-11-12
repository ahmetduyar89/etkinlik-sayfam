// src/lib/chess/player.ts — Canlı Satranç oyuncu kimliği
// ─────────────────────────────────────────────────────────────────────
// Oyuncu ad soyadıyla, yalnız satranç erişimi olan sunucu oturumu açar. Yine de "bu hamleyi
// kim yaptı, bu masada hangi koltuk benim" sorusunun yanıtı gerekir. Bunun
// için tarayıcıda kalıcı, rastgele bir kimlik üretilir.
//
// Kimlik gizli bir şey değildir; yalnızca aynı odadaki iki cihazı birbirinden
// ayırır. Sekme yenilendiğinde oyuncunun aynı koltuğa dönmesini de bu sağlar.
// ─────────────────────────────────────────────────────────────────────

const ID_KEY = 'satranc_oyuncu_id';
const NAME_KEY = 'satranc_oyuncu_ad';
const STUDENT_KEY = 'satranc_ogrenci_oturumu';

export interface ChessStudentSession {
    studentId: string;
    studentName: string;
    classId: string;
    schoolNumber?: string;
}

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

export function readStudentSession(): ChessStudentSession | null {
    try {
        const raw = window.localStorage.getItem(STUDENT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ChessStudentSession;
        return parsed.studentId && parsed.classId && parsed.studentName ? parsed : null;
    } catch {
        return null;
    }
}

export function saveStudentSession(session: ChessStudentSession): void {
    try {
        window.localStorage.setItem(STUDENT_KEY, JSON.stringify(session));
        savePlayerName(session.studentName);
        window.localStorage.setItem(ID_KEY, session.studentId);
    } catch {
        // Depolama kapalıysa oturum bellekte devam eder.
    }
}

export function clearStudentSession(): void {
    try {
        window.localStorage.removeItem(STUDENT_KEY);
        window.localStorage.removeItem(NAME_KEY);
        window.localStorage.removeItem(ID_KEY);
    } catch {
        // Oturum belleği kapalıysa sayfa durumu yine temizlenir.
    }
}

/**
 * Ad soyadı temizler: baştaki/sondaki boşluklar gider, araya düşen fazla
 * boşluklar teke iner, uzunluk sınırlanır. Çocuklar bazen büyük harf kilidiyle
 * yazar; görünümü bozmasın diye baş harfler büyük, kalanı küçük yapılır.
 */
export function normalizeName(raw: string): string {
    const cleaned = raw.replace(/\s+/g, ' ').trim().slice(0, 80);
    return cleaned.replace(
        /\p{L}+/gu,
        (word) => word[0].toLocaleUpperCase('tr') + word.slice(1).toLocaleLowerCase('tr')
    );
}

/** Ad soyad en az iki sözcükten oluşmalı. */
export function isValidName(raw: string): boolean {
    return /^[\p{L}][\p{L}\p{M}'’.-]*(?: [\p{L}][\p{L}\p{M}'’.-]*)+$/u.test(normalizeName(raw));
}
