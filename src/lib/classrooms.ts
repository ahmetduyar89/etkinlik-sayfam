// src/lib/classrooms.ts — Sınıflar, Öğrenci Kadroları ve İçerik Atama Servisi
import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { ClassRoom, ClassStudent } from '../types/classroom';
// @ts-expect-error JavaScript module without type declaration
import { CLASS_ROSTER } from '../../apps/satranc/src/data/classRoster.js';

import { INITIAL_CLASSES } from '../constants/initialClasses';

const CLASSES_COLLECTION = 'classes';
const LOCAL_CACHE_KEY = 'etkinlik_siniflar_cache';
const CHESS_STORAGE_KEY = 'satranc-okulu-siniflar';
const CHESS_PROGRESS_KEY = 'satranc-okulu-progress';

/** Yerel önbellekteki sınıfları oku (boşsa INITIAL_CLASSES döner) */
export function getCachedClasses(): ClassRoom[] {
    try {
        const raw = localStorage.getItem(LOCAL_CACHE_KEY);
        if (!raw) {
            setCachedClasses(INITIAL_CLASSES);
            syncClassesToChess(INITIAL_CLASSES);
            return INITIAL_CLASSES;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        setCachedClasses(INITIAL_CLASSES);
        syncClassesToChess(INITIAL_CLASSES);
        return INITIAL_CLASSES;
    } catch {
        return INITIAL_CLASSES;
    }
}

/** Sınıfları yerel önbelleğe kaydet */
export function setCachedClasses(classes: ClassRoom[]): void {
    try {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(classes));
    } catch (e) {
        console.warn('Sınıf önbelleği kaydedilemedi:', e);
    }
}

/** Başlangıç sınıflarını (Satranç okul listesi) Firestore'a kaydet */
export async function seedInitialClasses(): Promise<void> {
    try {
        const now = new Date().toISOString();
        const promises = INITIAL_CLASSES.map((cls) => {
            const docRef = doc(db, CLASSES_COLLECTION, cls.id);
            return updateDoc(docRef, {
                ...cls,
                updated_at: now,
            }).catch(() => {
                // If doc doesn't exist, create it via setDoc
                import('firebase/firestore').then(({ setDoc }) =>
                    setDoc(docRef, {
                        ...cls,
                        created_at: now,
                        updated_at: now,
                    })
                );
            });
        });
        await Promise.allSettled(promises);
        setCachedClasses(INITIAL_CLASSES);
        syncClassesToChess(INITIAL_CLASSES);
    } catch (err) {
        console.warn('Başlangıç sınıfları Firestore\'a yüklenemedi:', err);
    }
}

/** Firestore'dan sınıfları tek seferde çek (giriş kontrolü vb. için) */
export async function fetchAllClasses(): Promise<ClassRoom[]> {
    try {
        const snap = await getDocs(collection(db, CLASSES_COLLECTION));
        if (snap.empty) {
            // Firestore boşsa başlangıç sınıflarını yükle
            void seedInitialClasses();
            return INITIAL_CLASSES;
        }
        const list: ClassRoom[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ClassRoom, 'id'>),
        }));
        setCachedClasses(list);
        syncClassesToChess(list);
        return list;
    } catch (e) {
        console.warn('Firestore sınıfları çekilemedi, önbelleğe bakılıyor:', e);
        return getCachedClasses();
    }
}

/**
 * Satranç uygulamasının (apps/satranc) yerel verisini günceller.
 * Böylece web sitesinde eklenen sınıflar ve öğrenciler, Satranç uygulamasında
 * iki kişilik oyunlarda ve turnuvalarda doğrudan seçilebilir hale gelir.
 */
export function syncClassesToChess(classes: ClassRoom[], activeClassId?: string): void {
    try {
        const existingRaw = localStorage.getItem(CHESS_STORAGE_KEY);
        let chessData: any = {
            version: 1,
            activeClassId: activeClassId || null,
            classes: [],
            matches: [],
            tournaments: [],
            rosterVersion: null,
        };

        if (existingRaw) {
            try {
                const parsed = JSON.parse(existingRaw);
                if (parsed && typeof parsed === 'object') {
                    chessData = {
                        ...chessData,
                        ...parsed,
                        classes: parsed.classes || [],
                        matches: parsed.matches || [],
                        tournaments: parsed.tournaments || [],
                    };
                }
            } catch {
                // yoksay
            }
        }

        const oldClasses = Array.isArray(chessData.classes) ? chessData.classes : [];

        // Bizdeki sınıfları Satranç formatına dönüştür / birleştir
        const converted = classes.map((c) => ({
            id: c.id,
            name: c.name,
            students: (c.students || []).map((s) => ({
                id: s.id,
                name: s.name,
                removed: false,
            })),
        }));

        // Firestore'da yeniden oluşturulan bir sınıfın/öğrencinin kimliği
        // değişmiş olabilir. Yereldeki eski turnuva ve maçları ad üzerinden
        // yeni kadroya bağlayarak kayıtların sahipsiz kalmasını önleriz.
        const normalized = (value: unknown) => String(value || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('tr');
        const classIdMap = new Map<string, string>();
        const studentIdMap = new Map<string, string>();

        for (const oldClass of oldClasses) {
            const nextClass = converted.find((item) => item.id === oldClass?.id)
                || converted.find((item) => normalized(item.name) === normalized(oldClass?.name));
            if (!nextClass || !oldClass?.id) continue;
            classIdMap.set(oldClass.id, nextClass.id);
            for (const oldStudent of oldClass.students || []) {
                const nextStudent = nextClass.students.find((item) => item.id === oldStudent?.id)
                    || nextClass.students.find((item) => normalized(item.name) === normalized(oldStudent?.name));
                if (nextStudent && oldStudent?.id) studentIdMap.set(oldStudent.id, nextStudent.id);
            }
        }

        const remapStudent = (id: unknown) => studentIdMap.get(String(id || '')) || id;
        chessData.matches = chessData.matches.map((match: any) => ({
            ...match,
            classId: classIdMap.get(match.classId) || match.classId,
            whiteId: remapStudent(match.whiteId),
            blackId: remapStudent(match.blackId),
        }));
        chessData.tournaments = chessData.tournaments.map((tournament: any) => ({
            ...tournament,
            classId: classIdMap.get(tournament.classId) || tournament.classId,
            playerIds: Array.isArray(tournament.playerIds)
                ? tournament.playerIds.map(remapStudent)
                : tournament.playerIds,
            withdrawn: Array.isArray(tournament.withdrawn)
                ? tournament.withdrawn.map(remapStudent)
                : tournament.withdrawn,
            rounds: Array.isArray(tournament.rounds)
                ? tournament.rounds.map((round: any[]) => round.map((board: any) => ({
                    ...board,
                    whiteId: remapStudent(board?.whiteId),
                    blackId: remapStudent(board?.blackId),
                })))
                : [],
        }));

        // Öğrenci ve sınıf ilerleme profilleri ayrı anahtarda tutulur. Kimlik
        // değişiminde XP/rozet/ders kayıtlarını da aynı eşlemeyle taşı.
        try {
            const progressRaw = localStorage.getItem(CHESS_PROGRESS_KEY);
            const progressData = progressRaw ? JSON.parse(progressRaw) : null;
            if (progressData?.profiles && typeof progressData.profiles === 'object') {
                const profileIdMap = new Map<string, string>();
                for (const [oldId, nextId] of classIdMap) {
                    if (oldId !== nextId) profileIdMap.set(`class:${oldId}`, `class:${nextId}`);
                }
                for (const [oldId, nextId] of studentIdMap) {
                    if (oldId !== nextId) profileIdMap.set(`student:${oldId}`, `student:${nextId}`);
                }
                for (const [oldProfileId, nextProfileId] of profileIdMap) {
                    if (progressData.profiles[oldProfileId] && !progressData.profiles[nextProfileId]) {
                        progressData.profiles[nextProfileId] = progressData.profiles[oldProfileId];
                    }
                    if (progressData.profileNames?.[oldProfileId] && !progressData.profileNames[nextProfileId]) {
                        progressData.profileNames[nextProfileId] = progressData.profileNames[oldProfileId];
                    }
                    delete progressData.profiles[oldProfileId];
                    if (progressData.profileNames) delete progressData.profileNames[oldProfileId];
                    if (progressData.activeProfileId === oldProfileId) {
                        progressData.activeProfileId = nextProfileId;
                    }
                }
                localStorage.setItem(CHESS_PROGRESS_KEY, JSON.stringify(progressData));
            }
        } catch {
            // Bozuk/eski ilerleme kaydı satranç sınıf aktarımını engellemesin.
        }

        chessData.classes = converted;
        if (activeClassId) {
            chessData.activeClassId = activeClassId;
        } else if (classIdMap.has(chessData.activeClassId)) {
            chessData.activeClassId = classIdMap.get(chessData.activeClassId);
        } else if (!chessData.activeClassId && converted.length > 0) {
            chessData.activeClassId = converted[0].id;
        }

        localStorage.setItem(CHESS_STORAGE_KEY, JSON.stringify(chessData));
    } catch (e) {
        console.warn('Satranç verisi senkronize edilemedi:', e);
    }
}

/** Satranç yerel depolamasında kayıtlı sınıf durumunu inceler */
export function getSatrancLocalStorageStatus(): {
    hasClasses: boolean;
    classCount: number;
    studentCount: number;
    classes: Array<{ id: string; name: string; students: any[] }>;
} {
    try {
        const raw = localStorage.getItem(CHESS_STORAGE_KEY);
        if (!raw) return { hasClasses: false, classCount: 0, studentCount: 0, classes: [] };
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.classes)) {
            return { hasClasses: false, classCount: 0, studentCount: 0, classes: [] };
        }
        const valid = parsed.classes.filter((c: any) => c && c.name);
        const totalStudents = valid.reduce((acc: number, c: any) => acc + (c.students?.length || 0), 0);
        return {
            hasClasses: valid.length > 0,
            classCount: valid.length,
            studentCount: totalStudents,
            classes: valid,
        };
    } catch {
        return { hasClasses: false, classCount: 0, studentCount: 0, classes: [] };
    }
}

/**
 * Satranç uygulamasında daha önceden kayıtlı sınıfları (localStorage)
 * web sitesinin Sınıflar paneline aktarır.
 */
export async function importFromSatrancLocalStorage(): Promise<{ added: number; skipped: number }> {
    const status = getSatrancLocalStorageStatus();
    if (!status.hasClasses) return { added: 0, skipped: 0 };

    const existingClasses = await fetchAllClasses();
    let added = 0;
    let skipped = 0;

    for (const satClass of status.classes) {
        const trimmedName = satClass.name.trim();
        const exists = existingClasses.some(
            (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) {
            skipped++;
            continue;
        }

        const cleanUser = trimmedName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '') || `sinif${Math.floor(100 + Math.random() * 900)}`;

        const students: ClassStudent[] = (satClass.students || [])
            .filter((s: any) => !s.removed && s.name)
            .map((s: any, idx: number) => ({
                id: s.id || `st_${idx + 1}`,
                name: s.name,
            }));

        const now = new Date().toISOString();
        await addDoc(collection(db, CLASSES_COLLECTION), {
            name: trimmedName,
            username: cleanUser,
            password: '1234',
            grade: trimmedName.match(/\d+/)?.[0] || undefined,
            students,
            assignedModules: ['satranc', 'deneyler', 'akil-oyunlari'],
            assignedExperiments: ['basit-pusula.html', 'isildayan-devre.html', 'termometre.html'],
            assignedNotebooks: [],
            assignedActivities: [],
            created_at: now,
            updated_at: now,
        });

        added++;
    }

    if (added > 0) {
        await fetchAllClasses();
    }

    return { added, skipped };
}

// -------------------------------------------------------------
// Satranç Şifreli Okul Listesi Çözümü (RosterCrypto)
// -------------------------------------------------------------
const bytes = (b64: string) => Uint8Array.from(atob(b64), (char) => char.charCodeAt(0));

async function hmacKey(raw: Uint8Array) {
    return crypto.subtle.importKey('raw', raw as unknown as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function decryptSatrancRoster(payload: any, password: string): Promise<any | null> {
    if (!globalThis.crypto?.subtle) {
        throw new Error('Bu tarayıcıda şifre çözme desteklenmiyor.');
    }

    const salt = bytes(payload.salt);
    const nonce = bytes(payload.nonce);
    const cipher = bytes(payload.data);
    const tag = bytes(payload.tag);

    const base = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password) as unknown as BufferSource,
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const keys = new Uint8Array(
        await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', salt: salt as unknown as BufferSource, iterations: payload.iterations },
            base,
            512
        )
    );
    const encKey = await hmacKey(keys.slice(0, 32));
    const macKey = await hmacKey(keys.slice(32));

    const signed = new Uint8Array(salt.length + nonce.length + cipher.length);
    signed.set(salt, 0);
    signed.set(nonce, salt.length);
    signed.set(cipher, salt.length + nonce.length);
    if (!(await crypto.subtle.verify('HMAC', macKey, tag as unknown as BufferSource, signed as unknown as BufferSource))) {
        return null;
    }

    const plain = new Uint8Array(cipher.length);
    const block = new Uint8Array(nonce.length + 4);
    block.set(nonce, 0);
    for (let counter = 0; counter * 32 < cipher.length; counter += 1) {
        new DataView(block.buffer).setUint32(nonce.length, counter);
        const stream = new Uint8Array(await crypto.subtle.sign('HMAC', encKey, block));
        const start = counter * 32;
        for (let i = 0; i < 32 && start + i < cipher.length; i += 1) {
            plain[start + i] = cipher[start + i] ^ stream[i];
        }
    }

    return JSON.parse(new TextDecoder().decode(plain));
}

/**
 * Satranç gömülü okul listesini öğretmen şifresiyle çözüp sınıflara aktarır.
 */
export async function importFromSatrancEncryptedRoster(password: string): Promise<{ added: number; skipped: number }> {
    const roster = await decryptSatrancRoster(CLASS_ROSTER, password);
    if (!roster || !Array.isArray(roster.classes)) {
        throw new Error('Öğretmen şifresi hatalı.');
    }

    const existingClasses = await fetchAllClasses();
    let added = 0;
    let skipped = 0;

    for (const satClass of roster.classes) {
        const trimmedName = String(satClass.name || '').trim();
        if (!trimmedName) continue;

        const exists = existingClasses.some(
            (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) {
            skipped++;
            continue;
        }

        const cleanUser = trimmedName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '') || `sinif${Math.floor(100 + Math.random() * 900)}`;

        const students: ClassStudent[] = (satClass.students || []).map((s: any, idx: number) => ({
            id: s.id || `st_${idx + 1}`,
            name: s.name,
        }));

        const now = new Date().toISOString();
        await addDoc(collection(db, CLASSES_COLLECTION), {
            name: trimmedName,
            username: cleanUser,
            password: '1234',
            grade: trimmedName.match(/\d+/)?.[0] || undefined,
            students,
            assignedModules: ['satranc', 'deneyler', 'akil-oyunlari'],
            assignedExperiments: ['basit-pusula.html', 'isildayan-devre.html', 'termometre.html'],
            assignedNotebooks: [],
            assignedActivities: [],
            created_at: now,
            updated_at: now,
        });

        added++;
    }

    const updatedList = await fetchAllClasses();
    syncClassesToChess(updatedList);

    return { added, skipped };
}

/** Sınıf yönetimi için canlı React Hook'u */
export function useClassrooms() {
    const [classes, setClasses] = useState<ClassRoom[]>(getCachedClasses);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribe = () => {};
        try {
            const colRef = collection(db, CLASSES_COLLECTION);
            unsubscribe = onSnapshot(
                colRef,
                (snapshot) => {
                    if (snapshot.empty) {
                        // Eğer Firestore boşsa, başlangıç sınıflarını (satranç kadroları) otomatik yükle
                        void seedInitialClasses();
                        setClasses(INITIAL_CLASSES);
                        setCachedClasses(INITIAL_CLASSES);
                        syncClassesToChess(INITIAL_CLASSES);
                        setLoading(false);
                        return;
                    }
                    const list: ClassRoom[] = snapshot.docs.map((docSnap) => ({
                        id: docSnap.id,
                        ...(docSnap.data() as Omit<ClassRoom, 'id'>),
                    }));
                    setClasses(list);
                    setCachedClasses(list);
                    syncClassesToChess(list);
                    setLoading(false);
                },
                (err) => {
                    console.error('Sınıflar canlı izleme hatası:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );
        } catch (e: any) {
            setError(e?.message || 'Bilinmeyen hata');
            setLoading(false);
        }

        return () => unsubscribe();
    }, []);

    // Otomatik içe aktarım: Eğer sınıflar hala boşsa INITIAL_CLASSES yükle
    useEffect(() => {
        if (!loading && classes.length === 0) {
            void seedInitialClasses();
            setClasses(INITIAL_CLASSES);
        }
    }, [loading, classes.length]);

    const addClass = useCallback(
        async (data: Omit<ClassRoom, 'id' | 'created_at' | 'updated_at'>) => {
            const now = new Date().toISOString();
            const cleanUsername = data.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
            const docData = {
                ...data,
                username: cleanUsername,
                created_at: now,
                updated_at: now,
            };
            const docRef = await addDoc(collection(db, CLASSES_COLLECTION), docData);
            return docRef.id;
        },
        []
    );

    const updateClass = useCallback(
        async (id: string, data: Partial<Omit<ClassRoom, 'id' | 'created_at'>>) => {
            const docRef = doc(db, CLASSES_COLLECTION, id);
            const updatePayload: Record<string, unknown> = {
                ...data,
                updated_at: new Date().toISOString(),
            };
            if (typeof data.username === 'string') {
                updatePayload.username = data.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
            }
            await updateDoc(docRef, updatePayload);
        },
        []
    );

    const removeClass = useCallback(async (id: string) => {
        const docRef = doc(db, CLASSES_COLLECTION, id);
        await deleteDoc(docRef);
    }, []);

    return {
        classes,
        loading,
        error,
        addClass,
        updateClass,
        removeClass,
    };
}
