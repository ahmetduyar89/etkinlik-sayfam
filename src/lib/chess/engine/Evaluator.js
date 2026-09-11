// ─────────────────────────────────────────────────────────────────────
// BU DOSYA SATRANÇ UYGULAMASINDAN ALINMIŞTIR — ELLE DÜZENLEMEYİN.
//
// Kaynak: https://github.com/ahmetduyar89/satranc  (src/engine, src/components)
// Kural motoru, değerlendirici, yapay zekâ ve taş çizimleri orada gelişir;
// Canlı Satranç sayfası aynı motoru kullansın diye buraya kopyalanmıştır.
// Böylece çocuğun derste öğrendiği kurallar ile çevrimiçi maçtaki kurallar
// birebir aynı davranır.
//
// Güncellemek için: scripts/sync-chess-engine.mjs çalıştırın.
// ─────────────────────────────────────────────────────────────────────
/**
 * Evaluator.js — Konum değerlendirme fonksiyonu.
 *
 * Yapay zekânın "bu konum kimin işine yarıyor?" sorusuna verdiği cevabı üretir.
 * Puan santipiyon (1 piyon = 100) cinsindendir ve DAİMA beyazın gözünden hesaplanır:
 * pozitif = beyaz iyi, negatif = siyah iyi.
 *
 * Kullanılan bileşenler:
 *  1. Materyal      — taşların ham değeri
 *  2. Kare tabloları— aynı taş iyi karede daha değerlidir (at merkezde, piyon ileride)
 *  3. Piyon yapısı  — ikiz ve izole piyon cezaları, geçer piyon ödülü
 *  4. Şah güvenliği — rok yapılmış şahın önündeki piyon kalkanı
 *  5. Fil ikilisi   — iki fil birlikte küçük bir bonus alır
 *  6. Hareketlilik  — açık kalede ve merkezdeki taşlar için küçük ödüller
 */

import { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, SQUARE_LIST, fileOf, rankOf } from "./Chess.js";

/** Taşların temel değerleri (santipiyon). Şah aramanın dışında tutulur. */
export const PIECE_VALUES = {
  [PAWN]: 100,
  [KNIGHT]: 320,
  [BISHOP]: 330,
  [ROOK]: 500,
  [QUEEN]: 900,
  [KING]: 20000
};

/** Çocuklara gösterilen basit taş değerleri (piyon cinsinden). */
export const SIMPLE_VALUES = {
  [PAWN]: 1,
  [KNIGHT]: 3,
  [BISHOP]: 3,
  [ROOK]: 5,
  [QUEEN]: 9,
  [KING]: 0
};

/*
 * Kare tabloları beyazın gözünden ve yukarıdan aşağıya yazılmıştır:
 * ilk satır 8. yatay, son satır 1. yataydır. Siyah için tablo dikey olarak yansıtılır.
 */

const PAWN_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5, 10, 10,  5,  0,-10,
 -10,  5,  5, 10, 10,  5,  5,-10,
 -10,  0, 10, 10, 10, 10,  0,-10,
 -10, 10, 10, 10, 10, 10, 10,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
   0,  0,  5,  5,  5,  5,  0, -5,
 -10,  5,  5,  5,  5,  5,  0,-10,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20
];

/** Oyun ortasında şah köşede güvenlidir. */
const KING_MIDDLE_TABLE = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

/** Oyun sonunda şah merkeze yürümelidir. */
const KING_END_TABLE = [
 -50,-40,-30,-20,-20,-30,-40,-50,
 -30,-20,-10,  0,  0,-10,-20,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-30,  0,  0,  0,  0,-30,-30,
 -50,-30,-30,-30,-30,-30,-30,-50
];

const TABLES = {
  [PAWN]: PAWN_TABLE,
  [KNIGHT]: KNIGHT_TABLE,
  [BISHOP]: BISHOP_TABLE,
  [ROOK]: ROOK_TABLE,
  [QUEEN]: QUEEN_TABLE
};

/** 0x88 karesini kare tablosu indeksine (0-63) çevirir; siyah için dikey yansıtır. */
function tableIndex(square, color) {
  const rank = rankOf(square);
  const file = fileOf(square);
  return color === WHITE ? rank * 8 + file : (7 - rank) * 8 + file;
}

/** Şah + piyon dışındaki toplam materyal; oyun sonuna geçişi anlamak için. */
function nonPawnMaterial(board) {
  let total = 0;
  for (const square of SQUARE_LIST) {
    const piece = board[square];
    if (piece && piece.type !== PAWN && piece.type !== KING) total += PIECE_VALUES[piece.type];
  }
  return total;
}

/**
 * Konumu değerlendirir.
 * @param {import("./Chess.js").Chess} chess
 * @returns {number} Beyazın gözünden santipiyon puanı.
 */
export function evaluate(chess) {
  const board = chess.board;
  let score = 0;

  // Piyon sütunlarını sayarak ikiz/izole/geçer piyon analizini tek geçişte hazırlarız.
  const pawnFiles = { [WHITE]: new Array(8).fill(0), [BLACK]: new Array(8).fill(0) };
  const pawnRanks = { [WHITE]: [], [BLACK]: [] };
  const bishops = { [WHITE]: 0, [BLACK]: 0 };

  for (const square of SQUARE_LIST) {
    const piece = board[square];
    if (!piece) continue;
    if (piece.type === PAWN) {
      pawnFiles[piece.color][fileOf(square)] += 1;
      pawnRanks[piece.color].push(square);
    } else if (piece.type === BISHOP) {
      bishops[piece.color] += 1;
    }
  }

  const endgame = nonPawnMaterial(board) <= 1300; // yaklaşık iki kale + bir hafif taş

  for (const square of SQUARE_LIST) {
    const piece = board[square];
    if (!piece) continue;
    const sign = piece.color === WHITE ? 1 : -1;

    score += sign * PIECE_VALUES[piece.type];

    const table = piece.type === KING ? (endgame ? KING_END_TABLE : KING_MIDDLE_TABLE) : TABLES[piece.type];
    if (table) score += sign * table[tableIndex(square, piece.color)];

    if (piece.type === PAWN) {
      const file = fileOf(square);
      // İkiz piyon: aynı sütunda birden fazla piyon.
      if (pawnFiles[piece.color][file] > 1) score += sign * -12;
      // İzole piyon: komşu sütunlarda dost piyon yok.
      const leftCount = file > 0 ? pawnFiles[piece.color][file - 1] : 0;
      const rightCount = file < 7 ? pawnFiles[piece.color][file + 1] : 0;
      if (leftCount === 0 && rightCount === 0) score += sign * -18;
      // Geçer piyon: önünde ve komşu sütunlarda rakip piyon kalmamış.
      if (isPassedPawn(pawnRanks, piece.color, square)) {
        const advance = piece.color === WHITE ? 6 - rankOf(square) : rankOf(square) - 1;
        score += sign * (12 + advance * 8);
      }
    }

    if (piece.type === ROOK) {
      // Açık ve yarı açık sütundaki kale daha güçlüdür.
      const file = fileOf(square);
      const own = pawnFiles[piece.color][file];
      const foe = pawnFiles[piece.color === WHITE ? BLACK : WHITE][file];
      if (own === 0 && foe === 0) score += sign * 20;
      else if (own === 0) score += sign * 10;
    }
  }

  // Fil ikilisi bonusu.
  if (bishops[WHITE] >= 2) score += 30;
  if (bishops[BLACK] >= 2) score -= 30;

  // Şah kalkanı: oyun ortasında şahın önündeki dost piyonlar ödüllendirilir.
  if (!endgame) {
    score += kingShield(board, WHITE, chess.kings[WHITE]);
    score -= kingShield(board, BLACK, chess.kings[BLACK]);
  }

  return score;
}

/** Şahın önündeki üç karede duran dost piyonlar için küçük bonus. */
function kingShield(board, color, kingSquare) {
  if (kingSquare === -1 || kingSquare === undefined) return 0;
  const forward = color === WHITE ? -16 : 16;
  let bonus = 0;
  for (const side of [-1, 0, 1]) {
    const square = kingSquare + forward + side;
    if (square & 0x88) continue;
    const piece = board[square];
    if (piece && piece.type === PAWN && piece.color === color) bonus += 10;
  }
  return bonus;
}

/** Piyonun önünde ve komşu sütunlarda onu durduracak rakip piyon var mı? */
function isPassedPawn(pawnRanks, color, square) {
  const file = fileOf(square);
  const rank = rankOf(square);
  const enemy = color === WHITE ? BLACK : WHITE;
  for (const enemySquare of pawnRanks[enemy]) {
    const enemyFile = fileOf(enemySquare);
    if (Math.abs(enemyFile - file) > 1) continue;
    const enemyRank = rankOf(enemySquare);
    // Beyaz için "ileri" küçük rank indeksidir.
    if (color === WHITE ? enemyRank < rank : enemyRank > rank) return false;
  }
  return true;
}

/**
 * Tahtadaki materyal farkını çocuk diliyle özetler.
 * @returns {{white:number, black:number, diff:number, text:string}}
 */
export function materialSummary(chess) {
  let white = 0;
  let black = 0;
  for (const square of SQUARE_LIST) {
    const piece = chess.board[square];
    if (!piece || piece.type === KING) continue;
    if (piece.color === WHITE) white += SIMPLE_VALUES[piece.type];
    else black += SIMPLE_VALUES[piece.type];
  }
  const diff = white - black;
  let text = "Taşlar eşit, oyun başa baş.";
  if (diff > 0) text = `Beyaz ${diff} puan önde.`;
  else if (diff < 0) text = `Siyah ${-diff} puan önde.`;
  return { white, black, diff, text };
}
