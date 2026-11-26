import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { CloudMatch, CloudProgress } from './adminCloud';

type Progress = NonNullable<CloudProgress['progress']> & { games?: { won?: number; lost?: number; drawn?: number } };

export function summarizeStudentChess(matches: CloudMatch[], studentId: string, progress: Progress = {}) {
    const own = matches.filter(m => (m.whiteId === studentId || m.blackId === studentId) && ['1-0', '0-1', '1/2-1/2'].includes(m.result));
    const points = own.reduce((sum, match) => sum + (match.result === '1/2-1/2' ? 0.5 : (match.whiteId === studentId ? match.result === '1-0' : match.result === '0-1') ? 1 : 0), 0);
    const computerGames = progress.games
        ? (progress.games.won || 0) + (progress.games.lost || 0) + (progress.games.drawn || 0)
        : progress.gamesArchive?.length || 0;
    return { points, xp: progress.xp || 0, matchCount: own.length, computerGames, gameCount: own.length + computerGames };
}

export function useStudentChessStats(classId?: string, studentId?: string) {
    const [matches, setMatches] = useState<CloudMatch[]>([]);
    const [progress, setProgress] = useState<Progress>({});
    const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    useEffect(() => {
        setMatches([]); setProgress({}); setConfirmed({}); setErrors({});
        if (!classId || !studentId) return;
        const confirm = (name: string, metadata: { fromCache: boolean; hasPendingWrites: boolean }) => {
            const ready = !metadata.fromCache && !metadata.hasPendingWrites;
            setConfirmed(current => ({ ...current, [name]: ready }));
            if (ready) setErrors(current => { const next = { ...current }; delete next[name]; return next; });
            return ready;
        };
        const fail = (name: string) => (error: Error) => setErrors(current => ({ ...current, [name]: error.message }));
        const games = onSnapshot(query(collection(db, 'chess_matches'), where('classId', '==', classId)), { includeMetadataChanges: true }, snapshot => {
            if (confirm('matches', snapshot.metadata)) setMatches(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CloudMatch)));
        }, fail('matches'));
        const profile = onSnapshot(query(collection(db, 'chess_progress'), where('classId', '==', classId), where('profileId', '==', `student:${studentId}`)), { includeMetadataChanges: true }, snapshot => {
            if (confirm('progress', snapshot.metadata)) setProgress(snapshot.docs[0]?.data()?.progress || {});
        }, fail('progress'));
        return () => { games(); profile(); };
    }, [classId, studentId]);
    return { ...summarizeStudentChess(matches, studentId || '', progress), ready: Boolean(confirmed.matches && confirmed.progress), error: Object.values(errors).join(' · ') };
}
