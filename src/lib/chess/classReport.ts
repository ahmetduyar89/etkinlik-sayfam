// src/lib/chess/classReport.ts — Öğretmen ekranı için satranç özetleri
// ─────────────────────────────────────────────────────────────────────
// Satranç uygulaması (apps/satranc) maçları ve turnuvaları sunucuya yazar;
// burada yalnız okunur ve öğretmene gösterilecek biçime çevrilir. Puanlama
// apps/satranc/src/services/SwissPairing.js ile aynıdır: galibiyet 1,
// beraberlik ½, bay 1 puan; eşitlikte Buchholz (rakiplerin puan toplamı).
// ─────────────────────────────────────────────────────────────────────
import type { CloudMatch, CloudProgress, CloudTournament } from './adminCloud';

export const TOTAL_WEEKS = 36;

/** Beyazın aldığı puan; sonuç tanınmıyorsa null. */
export function whitePoints(result?: string): number | null {
    if (result === '1-0') return 1;
    if (result === '0-1') return 0;
    if (result === '½-½' || result === '1/2-1/2') return 0.5;
    return null;
}

export function resultLabel(result?: string): string {
    const points = whitePoints(result);
    return points === null ? '—' : points === 0.5 ? '½ - ½' : points === 1 ? '1 - 0' : '0 - 1';
}

const SOURCE_LABELS: Record<string, string> = {
    duel: 'İki kişilik oyun',
    tournament: 'Turnuva',
    'live-chess': 'Canlı satranç',
    manual: 'Elle girildi',
};
export const sourceLabel = (source?: string) => SOURCE_LABELS[source || ''] || 'Maç';

/** Sınıfın ortak ders planında tamamlanan haftalar (sınıf profili). */
export function classWeeks(progress: CloudProgress[], classId: string): Set<number> {
    const weeks = new Set<number>();
    for (const profile of progress) {
        if (profile.classId !== classId || profile.profileId !== `class:${classId}`) continue;
        for (const id of profile.progress?.completedLessons || []) {
            const match = /^week-(\d+)$/.exec(id);
            if (match) weeks.add(Number(match[1]));
        }
    }
    return weeks;
}

interface Board { id?: string; whiteId: string; blackId: string | null; matchId?: string | null }

/** Sunucudaki tur biçimi ({roundNumber, boards}) ya da eski dizi biçimi. */
export function tournamentRounds(tournament: CloudTournament): Board[][] {
    return (tournament.rounds || []).map((round) => {
        const value = round as unknown;
        if (Array.isArray(value)) return value as Board[];
        return ((value as { boards?: Board[] })?.boards || []);
    });
}

export interface StandingRow {
    id: string;
    points: number;
    wins: number;
    draws: number;
    losses: number;
    byes: number;
    played: number;
    buchholz: number;
}

export interface TournamentSummary {
    tournament: CloudTournament;
    standings: StandingRow[];
    roundsPlayed: number;
    plannedRounds: number;
    pendingBoards: number;
}

/** Turnuvanın puan tablosu; sonuçlar turnuvaya bağlı maç kayıtlarından okunur. */
export function summarizeTournament(tournament: CloudTournament, matches: CloudMatch[]): TournamentSummary {
    const byId = new Map(matches.map((match) => [match.localId || match.id, match]));
    const rounds = tournamentRounds(tournament);
    const rows = new Map<string, StandingRow & { opponents: string[] }>(
        (tournament.playerIds || []).map((id) => [id, { id, points: 0, wins: 0, draws: 0, losses: 0, byes: 0, played: 0, buchholz: 0, opponents: [] }])
    );
    const row = (id: string) => {
        if (!rows.has(id)) rows.set(id, { id, points: 0, wins: 0, draws: 0, losses: 0, byes: 0, played: 0, buchholz: 0, opponents: [] });
        return rows.get(id)!;
    };
    let pendingBoards = 0;
    for (const round of rounds) {
        for (const board of round) {
            if (board.blackId === null) {
                const white = row(board.whiteId);
                white.byes += 1;
                white.points += 1;
                continue;
            }
            const white = row(board.whiteId);
            const black = row(board.blackId);
            white.opponents.push(black.id);
            black.opponents.push(white.id);
            const match = board.matchId ? byId.get(board.matchId) : undefined;
            const points = match ? whitePoints(match.result) : null;
            if (points === null) { pendingBoards += 1; continue; }
            for (const [player, earned] of [[white, points], [black, 1 - points]] as const) {
                player.played += 1;
                player.points += earned;
                if (earned === 1) player.wins += 1;
                else if (earned === 0) player.losses += 1;
                else player.draws += 1;
            }
        }
    }
    for (const value of rows.values()) {
        value.buchholz = value.opponents.reduce((sum, id) => sum + (rows.get(id)?.points || 0), 0);
    }
    const standings = [...rows.values()]
        .map(({ opponents: _opponents, ...rest }) => rest)
        .sort((a, b) => b.points - a.points || b.buchholz - a.buchholz || b.wins - a.wins);
    const plannedRounds = Number(tournament.plannedRounds) || rounds.length;
    return { tournament, standings, roundsPlayed: rounds.length, plannedRounds, pendingBoards };
}
