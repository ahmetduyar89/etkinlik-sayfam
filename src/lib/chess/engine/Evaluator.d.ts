// Evaluator.js için TypeScript tanımları.
import type { Chess, PieceType } from './Chess';

/** Çocuklara gösterilen basit taş değerleri (piyon cinsinden). */
export const SIMPLE_VALUES: Record<PieceType, number>;

/** Tahtadaki materyal farkını çocuk diliyle özetler. */
export function materialSummary(chess: Chess): {
    white: number;
    black: number;
    diff: number;
    text: string;
};
