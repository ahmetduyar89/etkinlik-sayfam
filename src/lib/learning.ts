import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { LearningAssignment, LearningResult } from '../types/learning';

export const LEARNING_LABELS = {
    activity: 'Etkinlik / test', notebook: 'Defter', experiment: 'Deney / simülasyon',
    'chess-week': 'Satranç haftalık ders', 'chess-puzzle': 'Satranç bulmacası',
    'chess-minigame': 'Satranç mini oyunu', 'chess-bot': 'Bilgisayara karşı satranç',
};
export const MINI_GAME_OPTIONS = [
    ['ordunu-diz', 'Ordunu diz'], ['tasi-surukle', 'Taşı sürükle'], ['sah-mat-pat', 'Şah, mat, pat'],
    ['kasif-at', 'Kâşif at'], ['bedava-tas', 'Bedava taş'], ['kare-bul', 'Kare bul'],
    ['tasi-tani', 'Taşı tanı'], ['mati-bul', 'Matı bul'], ['hamleyi-tahmin', 'Hamleyi tahmin et'],
    ['hizli-hafiza', 'Hızlı hafıza'], ['eslestirme', 'Eşleştirme'],
];

/** Cache snapshots do not count as a confirmed online workspace. */
export function useLearning(classId: string | undefined, studentId?: string) {
    const [assignments, setAssignments] = useState<LearningAssignment[]>([]);
    const [results, setResults] = useState<LearningResult[]>([]);
    const [streams, setStreams] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    useEffect(() => {
        setAssignments([]); setResults([]); setStreams({}); setErrors({});
        if (!classId) return;
        const watch = <T extends { id: string }>(name: string, setter: (items: T[]) => void) => {
            const filters = [where('classId', '==', classId)];
            if (name === 'learning_results' && studentId) filters.push(where('studentId', '==', studentId));
            return onSnapshot(query(collection(db, name), ...filters), { includeMetadataChanges: true }, snapshot => {
                const confirmed = !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites;
                setStreams(current => ({ ...current, [name]: confirmed }));
                if (!confirmed) return;
                setter(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as T)));
                setErrors(current => { const next = { ...current }; delete next[name]; return next; });
            }, error => setErrors(current => ({ ...current, [name]: error.message })));
        };
        const stops = [watch<LearningAssignment>('learning_assignments', setAssignments), watch<LearningResult>('learning_results', setResults)];
        return () => stops.forEach(stop => stop());
    }, [classId, studentId]);
    return { assignments, results, ready: Boolean(streams.learning_assignments && streams.learning_results), error: Object.values(errors).join(' · ') };
}
export async function saveLearningAssignment(data: Omit<LearningAssignment, 'id' | 'active'>) {
    return (await httpsCallable<typeof data, { id: string }>(functions, 'saveLearningAssignment')(data)).data;
}
export async function archiveLearningAssignment(id: string) {
    await httpsCallable(functions, 'archiveLearningAssignment')({ id });
}
export async function startLearningAssignment(assignmentId: string) {
    if (!navigator.onLine) throw new Error('Çalışmayı başlatmak için internet bağlantısı gerekiyor.');
    await httpsCallable(functions, 'startLearningAssignment')({ assignmentId });
}
export async function completeLearningAssignment(assignmentId: string, submissionId?: string) {
    if (!navigator.onLine) throw new Error('Sonucu kaydetmek için internet bağlantısı gerekiyor.');
    await httpsCallable(functions, 'completeLearningAssignment')({ assignmentId, ...(submissionId ? { submissionId } : {}) });
}
export function assignmentUrl(item: LearningAssignment) {
    const resource = encodeURIComponent(item.resourceId);
    const assignment = encodeURIComponent(item.id);
    const root = `/satranc/?assignmentId=${assignment}&returnTo=${encodeURIComponent('/?view=ogrenci')}`;
    switch (item.kind) {
        case 'activity': return `/?view=student&id=${resource}&assignmentId=${assignment}`;
        case 'notebook': return `/?view=notebook&id=${resource}&assignmentId=${assignment}`;
        case 'experiment': return `/deneyler/${resource}`;
        case 'chess-week': return `${root}#/plan?hafta=${item.resourceId.slice(5)}`;
        case 'chess-puzzle': return `${root}#/puzzles?id=${resource}`;
        case 'chess-minigame': return `${root}#/minigames?oyun=${resource}`;
        case 'chess-bot': return `${root}#/play?seviye=${resource}`;
    }
}

export async function recordChessBotGame(data: { id: string; moves: string[]; playerColor: 'w' | 'b'; level: string }) {
    if (!navigator.onLine) throw new Error('Sonucu kaydetmek için internet bağlantısı gerekiyor.');
    return (await httpsCallable<typeof data, { result: string }>(functions, 'recordChessBotGame')(data)).data;
}
