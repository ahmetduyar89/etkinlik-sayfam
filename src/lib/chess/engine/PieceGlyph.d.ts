// PieceGlyph.js için TypeScript tanımları (taşların vektör çizimleri).
import type { PieceColor, PieceType } from './Chess';

/** Bir taşın SVG çizimini üretir. Bilinmeyen tip için boş dize döner. */
export function pieceSvg(type: PieceType, color: PieceColor): string;

/** "wk" / "bq" gibi bir taş kodunu SVG işaretlemesine çevirir. */
export function pieceHTML(code: string): string;
