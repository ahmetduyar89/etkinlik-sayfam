// src/hooks/useRecentActivities.ts — "Son kullanılanlar" listesi
// Derste en son açılan etkinlikler yalnızca tarayıcıda tutulur (localStorage);
// Firestore'a yazılmaz. Kayıt: { id, at } — en yeni başta, en fazla 8 kayıt.
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'icerik-merkezi:recent-activities';
const MAX_RECENTS = 8;

export interface RecentEntry {
    id: string;
    /** ISO zaman damgası. */
    at: string;
}

function read(): RecentEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((e): e is RecentEntry =>
                !!e && typeof (e as RecentEntry).id === 'string' && typeof (e as RecentEntry).at === 'string')
            .slice(0, MAX_RECENTS);
    } catch {
        return [];
    }
}

function write(entries: RecentEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
        // Depolama kapalıysa (gizli sekme, kota) sessizce yoksay.
    }
}

/** Göreli zaman etiketi: "Bugün", "Dün", "3 gün önce", "Geçen hafta"… */
export function formatRecentTime(at: string): string {
    const then = new Date(at).getTime();
    if (Number.isNaN(then)) return '';
    const days = Math.floor((Date.now() - then) / 86_400_000);
    if (days <= 0) return 'Bugün';
    if (days === 1) return 'Dün';
    if (days < 7) return `${days} gün önce`;
    if (days < 14) return 'Geçen hafta';
    if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
    return `${Math.floor(days / 30)} ay önce`;
}

export function useRecentActivities() {
    const [recents, setRecents] = useState<RecentEntry[]>(() => read());

    // Başka bir sekmede açılan etkinlikler de listeye yansısın.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) setRecents(read());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const markOpened = useCallback((id: string) => {
        setRecents((prev) => {
            const next = [{ id, at: new Date().toISOString() }, ...prev.filter((e) => e.id !== id)].slice(0, MAX_RECENTS);
            write(next);
            return next;
        });
    }, []);

    return { recents, markOpened };
}
