// Chess.js için TypeScript tanımları.
// Motor düz JavaScript'tir (satranç uygulamasından kopyalanır); burada
// yalnızca Canlı Satranç sayfasının kullandığı yüzey tanımlanır.

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
    type: PieceType;
    color: PieceColor;
}

/** `move()` ve `getHistory({verbose:true})` tarafından dönen hamle kaydı. */
export interface ChessMove {
    color: PieceColor;
    from: string;
    to: string;
    piece: PieceType;
    captured?: PieceType;
    promotion?: PieceType;
    flags: number;
    san?: string;
    fenAfter?: string;
}

/** Oyunun bittiğini ve nedenini çocuk diliyle açıklayan özet. */
export interface GameStatus {
    over: boolean;
    /** "1-0" | "0-1" | "1/2-1/2" | "*" */
    result: string;
    winner: PieceColor | null;
    reason: string;
}

export const WHITE: 'w';
export const BLACK: 'b';
export const DEFAULT_FEN: string;

export const PIECE_NAMES_TR: Record<PieceType, string>;
export const UNICODE: Record<string, string>;

export function toAlgebraic(square: number): string;
export function toSquare(algebraic: string): number;
export function isLightSquare(square: number): boolean;
export function sanTr(san: string): string;

export class Chess {
    constructor(fen?: string);
    load(fen?: string): boolean;
    reset(): void;
    get(algebraic: string): Piece | null;
    turnColor(): PieceColor;
    fen(): string;
    inCheck(): boolean;
    moves(options?: { square?: string; legal?: boolean; verbose?: boolean }): ChessMove[];
    /** Bir kareden gidilebilecek hedef kareler: "e2" → ["e3","e4"]. */
    destinations(square: string): string[];
    move(input: string | { from: string; to: string; promotion?: PieceType }): ChessMove | null;
    /** "e2e4" / "e7e8q" biçimindeki hamleyi oynar. */
    moveUci(uci: string): ChessMove | null;
    undo(): ChessMove | null;
    getHistory(options?: { verbose?: false }): string[];
    getHistory(options: { verbose: true }): ChessMove[];
    isCheckmate(): boolean;
    isStalemate(): boolean;
    isDraw(): boolean;
    isGameOver(): boolean;
    status(): GameStatus;
    pieceMap(): Record<string, Piece>;
    checkedKingSquare(): string | null;
    capturedPieces(): Record<PieceColor, PieceType[]>;
    clone(): Chess;
}
