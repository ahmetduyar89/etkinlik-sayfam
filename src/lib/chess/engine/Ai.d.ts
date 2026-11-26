// Ai.js için TypeScript tanımları (yapay zekâ rakip).
import type { Chess, PieceType } from './Chess';

export interface AiLevel {
    id: string;
    label: string;
    elo: string;
    description: string;
    depth: number;
    timeBudget: number;
    quiescence: boolean;
    blunderChance: number;
    choiceSpread: number;
}

export interface AiMove {
    from: string;
    to: string;
    promotion?: PieceType;
    score: number;
    depth: number;
    nodes: number;
    blunder: boolean;
}

export const LEVELS: Record<'kolay' | 'orta' | 'zor', AiLevel>;
export function resolveLevel(level: string | AiLevel | null | undefined): AiLevel;

export class Ai {
    chooseMove(chess: Chess, level?: string | AiLevel): Promise<AiMove | null>;
}

/** Uygulama boyunca paylaşılan tek yapay zekâ örneği. */
export const ai: Ai;
