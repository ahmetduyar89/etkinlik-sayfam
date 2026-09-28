import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface CloudMatch {
    id: string;
    localId?: string;
    classId: string;
    whiteId: string;
    blackId: string;
    result: '1-0' | '0-1' | '1/2-1/2';
    date?: string;
}

export interface CloudTournament {
    id: string;
    localId?: string;
    classId: string;
    name: string;
    finished?: boolean;
    rounds?: Array<unknown[]>;
    playerIds?: string[];
}

export interface CloudProgress {
    id: string;
    classId: string;
    profileId: string;
    profileName?: string;
    progress?: {
        xp?: number;
        completedLessons?: string[];
        solvedPuzzles?: string[];
        puzzleStats?: Record<string, { solved?: number; wrong?: number; hints?: number }>;
    };
}

export interface SyncDevice {
    id: string;
    classIds?: string[];
    activeClassId?: string;
    anonymous?: boolean;
    lastSeenAt?: { toDate?: () => Date };
}

export interface LivePresence {
    id: string;
    studentId: string;
    studentName?: string;
    classId: string;
    lastSeenAt?: { toDate?: () => Date };
}

export interface LiveGame {
    id: string;
    whiteClassId?: string;
    blackClassId?: string;
    whiteName?: string;
    blackName?: string;
    result?: string;
}

export const levelOf = (xp = 0) => Math.floor(xp / 120) + 1;
export const pointsText = (points: number) => Number.isInteger(points) ? String(points) : `${Math.floor(points)}½`;

/** Öğretmen ekranlarının kullandığı bütün satranç bulut akışlarını tek yerde toplar. */
export function useCloudChess() {
    const [matches, setMatches] = useState<CloudMatch[]>([]);
    const [tournaments, setTournaments] = useState<CloudTournament[]>([]);
    const [progress, setProgress] = useState<CloudProgress[]>([]);
    const [devices, setDevices] = useState<SyncDevice[]>([]);
    const [presence, setPresence] = useState<LivePresence[]>([]);
    const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const watch = <T extends { id: string }>(name: string, setter: (items: T[]) => void) =>
            onSnapshot(collection(db, name), (snapshot) => {
                setter(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T)));
            }, (reason) => setError(reason.message));

        const stops = [
            watch<CloudMatch>('chess_matches', setMatches),
            watch<CloudTournament>('chess_tournaments', setTournaments),
            watch<CloudProgress>('chess_progress', setProgress),
            watch<SyncDevice>('chess_sync', setDevices),
            watch<LivePresence>('liveChessPresence', setPresence),
            watch<LiveGame>('liveChessGames', setLiveGames),
        ];
        return () => stops.forEach((stop) => stop());
    }, []);

    return { matches, tournaments, progress, devices, presence, liveGames, error };
}
