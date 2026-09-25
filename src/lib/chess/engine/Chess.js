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
 * Chess.js — Satranç Eğitimi'nin kural motoru.
 *
 * Tamamen bağımsızdır: hiçbir harici kütüphaneye ihtiyaç duymaz, çevrimdışı çalışır.
 * 0x88 tahta gösterimi kullanır. Bu gösterimde tahta 128 kutuluk tek bir dizidir;
 * bir indeksin tahta dışında olup olmadığı tek bir "index & 0x88" işlemiyle anlaşılır.
 *
 * a8 = 0, h8 = 7, a1 = 112, h1 = 119.
 *
 * Desteklenen kuralların tamamı:
 *  - Tüm taşların yasal hamleleri
 *  - Şah, şah mat, pat
 *  - Kısa rok ve uzun rok (tüm ön koşullarıyla)
 *  - Geçerken alma (en passant)
 *  - Piyon terfisi (vezir, kale, fil, at)
 *  - 50 hamle kuralı, üç kez tekrar, yetersiz materyal beraberliği
 *  - FEN okuma/yazma, SAN (Türkçe ve İngilizce taş harfleriyle) okuma/yazma
 */

export const WHITE = "w";
export const BLACK = "b";

export const PAWN = "p";
export const KNIGHT = "n";
export const BISHOP = "b";
export const ROOK = "r";
export const QUEEN = "q";
export const KING = "k";

export const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Hamle türlerini tek bir sayıda tutmak için bit maskeleri. */
const BITS = {
  NORMAL: 1,
  CAPTURE: 2,
  BIG_PAWN: 4,
  EP_CAPTURE: 8,
  PROMOTION: 16,
  KSIDE_CASTLE: 32,
  QSIDE_CASTLE: 64
};

/** Arama motorunun hamle türünü hızlıca sınayabilmesi için maskeleri dışa açarız. */
export const MOVE_BITS = BITS;

/** Bit maskelerinin okunabilir harf karşılıkları (chess.js ile aynı sözleşme). */
const FLAG_CHARS = {
  [BITS.NORMAL]: "n",
  [BITS.CAPTURE]: "c",
  [BITS.BIG_PAWN]: "b",
  [BITS.EP_CAPTURE]: "e",
  [BITS.PROMOTION]: "p",
  [BITS.KSIDE_CASTLE]: "k",
  [BITS.QSIDE_CASTLE]: "q"
};

/** Piyonun ilerleme ve alma yönleri. İlk iki değer ilerleme, son iki değer almadır. */
const PAWN_OFFSETS = {
  [WHITE]: [-16, -32, -17, -15],
  [BLACK]: [16, 32, 17, 15]
};

/** Taşların yön vektörleri. At ve şah tek adım, diğerleri ışın (ray) olarak kullanılır. */
const PIECE_OFFSETS = {
  [KNIGHT]: [-18, -33, -31, -14, 18, 33, 31, 14],
  [BISHOP]: [-17, -15, 17, 15],
  [ROOK]: [-16, 1, 16, -1],
  [QUEEN]: [-17, -16, -15, 1, 17, 16, 15, -1],
  [KING]: [-17, -16, -15, 1, 17, 16, 15, -1]
};

/** Rok yapılırken kullanılan kare ve bayrak bilgileri. */
const ROOKS = {
  [WHITE]: [
    { square: 112, flag: BITS.QSIDE_CASTLE },
    { square: 119, flag: BITS.KSIDE_CASTLE }
  ],
  [BLACK]: [
    { square: 0, flag: BITS.QSIDE_CASTLE },
    { square: 7, flag: BITS.KSIDE_CASTLE }
  ]
};

/** Şah veya kale bu karelerden ayrılırsa ilgili rok hakkı kaybolur. */
const CASTLE_LOSS = {
  112: { color: WHITE, flag: BITS.QSIDE_CASTLE },
  116: { color: WHITE, flag: BITS.QSIDE_CASTLE | BITS.KSIDE_CASTLE },
  119: { color: WHITE, flag: BITS.KSIDE_CASTLE },
  0: { color: BLACK, flag: BITS.QSIDE_CASTLE },
  4: { color: BLACK, flag: BITS.QSIDE_CASTLE | BITS.KSIDE_CASTLE },
  7: { color: BLACK, flag: BITS.KSIDE_CASTLE }
};

const SYMBOLS = "pnbrqkPNBRQK";

/** SAN yazarken/okurken kullanılan taş harfleri. Çocuklar Türkçe harfleri de yazabilsin diye çift dilli. */
const SAN_LETTERS = { [KNIGHT]: "N", [BISHOP]: "B", [ROOK]: "R", [QUEEN]: "Q", [KING]: "K" };
const TR_LETTERS = { [KNIGHT]: "A", [BISHOP]: "F", [ROOK]: "K", [QUEEN]: "V", [KING]: "Ş" };
const LETTER_TO_PIECE = {
  N: KNIGHT, B: BISHOP, R: ROOK, Q: QUEEN, K: KING,
  A: KNIGHT, F: BISHOP, V: QUEEN, "Ş": KING, S: KING
};

/** Uluslararası SAN harfi → Türkçe taş harfi. */
const SAN_TO_TR = { N: "A", B: "F", R: "K", Q: "V", K: "Ş" };

/**
 * Bir hamle yazımını Türkçe taş harflerine çevirir — SADECE EKRANDA GÖSTERMEK İÇİN.
 *
 * Motorun içinde hamleler daima uluslararası yazımla (Nf3, Bb5) tutulur; ders ve
 * bulmaca verileri de onunla karşılaştırılır. Çocuğa gösterilen her yerde ise
 * Türkçe harfler kullanılır: At=A, Fil=F, Kale=K, Vezir=V, Şah=Ş.
 *
 * DİKKAT: "K" harfi iki dilde İKİ FARKLI taştır — uluslararası yazımda Şah,
 * Türkçe yazımda Kale. Bu yüzden çevirim tek geçişte yapılır; art arda replace
 * çağrılırsa "Rxe5" (kale alır) önce "Kxe5" olur, sonra yanlışlıkla "Şxe5"e
 * dönerdi. Kare adları ve "x", "+", "#", "O-O" küçük harf/işaret olduğu için
 * etkilenmez.
 *
 * @param {string} san "Nf3", "Rxe5", "e8=Q", "O-O"
 * @returns {string} "Af3", "Kxe5", "e8=V", "O-O"
 */
export function sanTr(san) {
  if (!san) return san;
  return String(san).replace(/[NBRQK]/g, (letter) => SAN_TO_TR[letter] || letter);
}

/** Unicode taş sembolleri — arayüzde doğrudan kullanılır. */
export const UNICODE = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚"
};

/** Taşların Türkçe adları — sesli anlatım ve geri bildirim metinleri için. */
export const PIECE_NAMES_TR = {
  [PAWN]: "piyon",
  [KNIGHT]: "at",
  [BISHOP]: "fil",
  [ROOK]: "kale",
  [QUEEN]: "vezir",
  [KING]: "şah"
};

/* ------------------------------------------------------------------ *
 * Kare yardımcıları
 * ------------------------------------------------------------------ */

/** 0x88 indeksinin sütun (dosya) numarası: a=0 ... h=7. */
export function fileOf(square) {
  return square & 15;
}

/** 0x88 indeksinin satır numarası: 8. yatay = 0 ... 1. yatay = 7. */
export function rankOf(square) {
  return square >> 4;
}

/** 0x88 indeksini "e4" biçimine çevirir. */
export function toAlgebraic(square) {
  return "abcdefgh"[fileOf(square)] + (8 - rankOf(square));
}

/** "e4" biçimini 0x88 indeksine çevirir. Geçersizse -1 döner. */
export function toSquare(algebraic) {
  if (typeof algebraic !== "string" || algebraic.length !== 2) return -1;
  const file = "abcdefgh".indexOf(algebraic[0].toLowerCase());
  const rank = "12345678".indexOf(algebraic[1]);
  if (file === -1 || rank === -1) return -1;
  return (7 - rank) * 16 + file;
}

/** Tahtadaki 64 geçerli kareyi a8'den h1'e doğru sıralı verir. */
export const SQUARE_LIST = (() => {
  const list = [];
  for (let index = 0; index <= 119; index += 1) {
    if (index & 0x88) {
      index += 7;
      continue;
    }
    list.push(index);
  }
  return list;
})();

/** Bir karenin açık mı koyu mu olduğunu söyler. */
export function isLightSquare(square) {
  return (fileOf(square) + rankOf(square)) % 2 === 0;
}

function swapColor(color) {
  return color === WHITE ? BLACK : WHITE;
}

/* ------------------------------------------------------------------ *
 * Motor
 * ------------------------------------------------------------------ */

export class Chess {
  constructor(fen = DEFAULT_FEN) {
    this.load(fen);
  }

  /** Motoru verilen FEN konumuna kurar. Geçersiz FEN'de hata fırlatır. */
  load(fen = DEFAULT_FEN) {
    const parts = String(fen).trim().split(/\s+/);
    const [placement, turn = "w", castling = "-", ep = "-", halfMoves = "0", moveNumber = "1"] = parts;

    this.board = new Array(128).fill(null);
    this.kings = { [WHITE]: -1, [BLACK]: -1 };
    this.castling = { [WHITE]: 0, [BLACK]: 0 };
    this.turn = turn === "b" ? BLACK : WHITE;
    this.epSquare = -1;
    this.halfMoves = Number.parseInt(halfMoves, 10) || 0;
    this.moveNumber = Number.parseInt(moveNumber, 10) || 1;
    this.history = [];
    this.positionCounts = new Map();

    let square = 0;
    for (const char of placement) {
      if (char === "/") {
        square += 8;
      } else if (/\d/.test(char)) {
        square += Number.parseInt(char, 10);
      } else {
        if (!SYMBOLS.includes(char)) throw new Error(`Geçersiz FEN taşı: ${char}`);
        const color = char === char.toUpperCase() ? WHITE : BLACK;
        this.#put({ type: char.toLowerCase(), color }, square);
        square += 1;
      }
    }

    if (castling.includes("K")) this.castling[WHITE] |= BITS.KSIDE_CASTLE;
    if (castling.includes("Q")) this.castling[WHITE] |= BITS.QSIDE_CASTLE;
    if (castling.includes("k")) this.castling[BLACK] |= BITS.KSIDE_CASTLE;
    if (castling.includes("q")) this.castling[BLACK] |= BITS.QSIDE_CASTLE;
    if (ep !== "-") this.epSquare = toSquare(ep);

    this.#countPosition();
    return this;
  }

  /** Başlangıç konumuna döner. */
  reset() {
    return this.load(DEFAULT_FEN);
  }

  #put(piece, square) {
    this.board[square] = piece;
    if (piece.type === KING) this.kings[piece.color] = square;
  }

  /** Bir karedeki taşı verir: { type, color } ya da null. */
  get(algebraic) {
    const square = toSquare(algebraic);
    return square === -1 ? null : this.board[square];
  }

  /** Sıradaki oyuncunun rengi. */
  turnColor() {
    return this.turn;
  }

  /** Konumu FEN metni olarak üretir. */
  fen() {
    let empty = 0;
    let placement = "";
    for (let index = 0; index <= 119; index += 1) {
      if (index & 0x88) {
        // Yatay sonu: biriken boş kare sayısını yaz ve ayırıcı koy.
        if (empty > 0) placement += empty;
        placement += "/";
        empty = 0;
        index += 7;
        continue;
      }
      const piece = this.board[index];
      if (!piece) {
        empty += 1;
      } else {
        if (empty > 0) placement += empty;
        empty = 0;
        placement += piece.color === WHITE ? piece.type.toUpperCase() : piece.type;
      }
    }
    // Son yatay (1. yatay) döngü içinde kapanmaz; kalan boşluğu burada yazarız.
    if (empty > 0) placement += empty;

    let castling = "";
    if (this.castling[WHITE] & BITS.KSIDE_CASTLE) castling += "K";
    if (this.castling[WHITE] & BITS.QSIDE_CASTLE) castling += "Q";
    if (this.castling[BLACK] & BITS.KSIDE_CASTLE) castling += "k";
    if (this.castling[BLACK] & BITS.QSIDE_CASTLE) castling += "q";

    const ep = this.epSquare === -1 ? "-" : toAlgebraic(this.epSquare);
    return `${placement} ${this.turn} ${castling || "-"} ${ep} ${this.halfMoves} ${this.moveNumber}`;
  }

  /** Tekrar sayımı için konumun taş/sıra/rok/ep parmak izi. */
  #positionKey() {
    return this.fen().split(" ").slice(0, 4).join(" ");
  }

  #countPosition() {
    const key = this.#positionKey();
    this.positionCounts.set(key, (this.positionCounts.get(key) || 0) + 1);
  }

  #uncountPosition() {
    const key = this.#positionKey();
    const count = this.positionCounts.get(key) || 0;
    if (count <= 1) this.positionCounts.delete(key);
    else this.positionCounts.set(key, count - 1);
  }

  /* ---------------------------------------------------------------- *
   * Saldırı ve şah tespiti
   * ---------------------------------------------------------------- */

  /**
   * Verilen kareye `color` rengindeki herhangi bir taşın saldırıp saldırmadığını söyler.
   * Hedef kareden dışa doğru tarama yapar; bu yüzden tüm tahtayı gezmekten çok daha hızlıdır.
   */
  attacked(color, square) {
    // `square` 0x88 SAYISAL indeks olmalıdır. Metin ("e4") verilirse aşağıdaki
    // ışın döngülerinde indeks aritmetiği metin birleştirmeye dönüşür
    // ("e4" + -16 = "e4-16"), `& 0x88` daima 0 çıkar ve döngü hiç bitmez.
    // Sessiz bir donma yerine erken ve anlaşılır hata veriyoruz.
    if (!Number.isInteger(square)) {
      throw new TypeError(
        `attacked() 0x88 sayısal kare indeksi bekler, "${square}" aldı. Metin kare adı için toSquare() kullanın.`
      );
    }

    for (const offset of PIECE_OFFSETS[KNIGHT]) {
      const from = square + offset;
      if (from & 0x88) continue;
      const piece = this.board[from];
      if (piece && piece.color === color && piece.type === KNIGHT) return true;
    }

    for (const offset of PIECE_OFFSETS[KING]) {
      const from = square + offset;
      if (from & 0x88) continue;
      const piece = this.board[from];
      if (piece && piece.color === color && piece.type === KING) return true;
    }

    // Beyaz piyon hedefe alt çaprazdan (daha büyük indeksten) saldırır.
    const pawnSquares = color === WHITE ? [square + 15, square + 17] : [square - 15, square - 17];
    for (const from of pawnSquares) {
      if (from & 0x88) continue;
      const piece = this.board[from];
      if (piece && piece.color === color && piece.type === PAWN) return true;
    }

    for (const offset of PIECE_OFFSETS[ROOK]) {
      let from = square + offset;
      while (!(from & 0x88)) {
        const piece = this.board[from];
        if (piece) {
          if (piece.color === color && (piece.type === ROOK || piece.type === QUEEN)) return true;
          break;
        }
        from += offset;
      }
    }

    for (const offset of PIECE_OFFSETS[BISHOP]) {
      let from = square + offset;
      while (!(from & 0x88)) {
        const piece = this.board[from];
        if (piece) {
          if (piece.color === color && (piece.type === BISHOP || piece.type === QUEEN)) return true;
          break;
        }
        from += offset;
      }
    }

    return false;
  }

  /** Verilen rengin (varsayılan: sıradaki oyuncunun) şahı tehdit altında mı? */
  isKingAttacked(color = this.turn) {
    const king = this.kings[color];
    return king !== -1 && this.attacked(swapColor(color), king);
  }

  /** Sıradaki oyuncu şah çekilmiş durumda mı? */
  inCheck() {
    return this.isKingAttacked(this.turn);
  }

  /* ---------------------------------------------------------------- *
   * Hamle üretimi
   * ---------------------------------------------------------------- */

  #buildMove(from, to, flags, promotion) {
    const piece = this.board[from];
    const move = {
      color: piece.color,
      from,
      to,
      piece: piece.type,
      flags,
      san: null
    };
    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }
    if (this.board[to]) move.captured = this.board[to].type;
    else if (flags & BITS.EP_CAPTURE) move.captured = PAWN;
    return move;
  }

  #addMove(moves, from, to, flags) {
    const piece = this.board[from];
    const targetRank = rankOf(to);
    if (piece.type === PAWN && (targetRank === 0 || targetRank === 7)) {
      for (const promotion of [QUEEN, ROOK, BISHOP, KNIGHT]) {
        moves.push(this.#buildMove(from, to, flags, promotion));
      }
    } else {
      moves.push(this.#buildMove(from, to, flags));
    }
  }

  /**
   * Hamleleri üretir.
   * @param {object} options
   * @param {boolean} options.legal  true ise sadece yasal hamleler döner (varsayılan)
   * @param {string}  options.square sadece bu kareden çıkan hamleler ("e2")
   * @param {boolean} options.verbose true ise okunabilir nesneler, false ise SAN metinleri
   */
  generateMoves({ legal = true, square = null, verbose = true } = {}) {
    const us = this.turn;
    const them = swapColor(us);
    const moves = [];

    let firstSquare = 0;
    let lastSquare = 119;
    let singleSquare = false;
    if (square) {
      const index = toSquare(square);
      if (index === -1 || !this.board[index] || this.board[index].color !== us) return [];
      firstSquare = index;
      lastSquare = index;
      singleSquare = true;
    }

    for (let from = firstSquare; from <= lastSquare; from += 1) {
      if (from & 0x88) {
        from += 7;
        continue;
      }
      const piece = this.board[from];
      if (!piece || piece.color !== us) continue;

      if (piece.type === PAWN) {
        const offsets = PAWN_OFFSETS[us];
        const oneStep = from + offsets[0];
        if (!(oneStep & 0x88) && !this.board[oneStep]) {
          this.#addMove(moves, from, oneStep, BITS.NORMAL);
          const startRank = us === WHITE ? 6 : 1;
          const twoStep = from + offsets[1];
          if (rankOf(from) === startRank && !this.board[twoStep]) {
            this.#addMove(moves, from, twoStep, BITS.BIG_PAWN);
          }
        }
        for (const offset of [offsets[2], offsets[3]]) {
          const to = from + offset;
          if (to & 0x88) continue;
          const target = this.board[to];
          if (target && target.color === them) this.#addMove(moves, from, to, BITS.CAPTURE);
          else if (!target && to === this.epSquare) this.#addMove(moves, from, to, BITS.EP_CAPTURE);
        }
      } else {
        const single = piece.type === KNIGHT || piece.type === KING;
        for (const offset of PIECE_OFFSETS[piece.type]) {
          let to = from;
          for (;;) {
            to += offset;
            if (to & 0x88) break;
            const target = this.board[to];
            if (!target) {
              this.#addMove(moves, from, to, BITS.NORMAL);
            } else {
              if (target.color === them) this.#addMove(moves, from, to, BITS.CAPTURE);
              break;
            }
            if (single) break;
          }
        }
      }
    }

    // Rok — yalnızca şahın kendi karesinden üretilir.
    if (!singleSquare || firstSquare === this.kings[us]) {
      const kingSquare = this.kings[us];
      if (kingSquare !== -1 && !this.attacked(them, kingSquare)) {
        if (this.castling[us] & BITS.KSIDE_CASTLE) {
          const middle = kingSquare + 1;
          const target = kingSquare + 2;
          if (
            !this.board[middle] &&
            !this.board[target] &&
            !this.attacked(them, middle) &&
            !this.attacked(them, target)
          ) {
            this.#addMove(moves, kingSquare, target, BITS.KSIDE_CASTLE);
          }
        }
        if (this.castling[us] & BITS.QSIDE_CASTLE) {
          const middle = kingSquare - 1;
          const target = kingSquare - 2;
          const knightSquare = kingSquare - 3;
          if (
            !this.board[middle] &&
            !this.board[target] &&
            !this.board[knightSquare] &&
            !this.attacked(them, middle) &&
            !this.attacked(them, target)
          ) {
            this.#addMove(moves, kingSquare, target, BITS.QSIDE_CASTLE);
          }
        }
      }
    }

    if (!legal) return verbose ? moves.map((move) => this.#decorate(move)) : moves;

    const legalMoves = [];
    for (const move of moves) {
      this.#makeMove(move);
      if (!this.isKingAttacked(us)) legalMoves.push(move);
      this.#undoMove();
    }

    if (!verbose) return legalMoves;
    return legalMoves.map((move) => {
      const decorated = this.#decorate(move);
      decorated.san = this.#moveToSan(move, legalMoves);
      return decorated;
    });
  }

  /** Dış dünyaya açılan sade hamle nesnesi. */
  #decorate(move) {
    return {
      color: move.color,
      from: toAlgebraic(move.from),
      to: toAlgebraic(move.to),
      piece: move.piece,
      captured: move.captured,
      promotion: move.promotion,
      flags: Object.entries(FLAG_CHARS)
        .filter(([bit]) => move.flags & Number(bit))
        .map(([, char]) => char)
        .join(""),
      san: move.san,
      _internal: move
    };
  }

  /**
   * Arama motorları için hızlı hamle uygulama.
   * `move()` ile farkı: SAN üretmez ve tekrar sayacına dokunmaz, bu yüzden
   * saniyede on binlerce kez çağrılabilir. Yalnızca generateMoves'un ürettiği
   * dahili hamle nesneleriyle kullanılmalıdır ve mutlaka searchUndo ile eşlenmelidir.
   */
  searchMake(move) {
    this.#makeMove(move);
  }

  /** searchMake ile yapılan hamleyi geri alır. */
  searchUndo() {
    return this.#undoMove();
  }

  /** Kısa yol: yasal hamleler. `square` verilirse sadece o kareden çıkanlar. */
  moves(options = {}) {
    return this.generateMoves({ legal: true, verbose: true, ...options });
  }

  /** Bir kareden gidilebilecek hedef karelerin listesi ("e2" → ["e3","e4"]). */
  destinations(square) {
    return this.moves({ square }).map((move) => move.to);
  }

  /* ---------------------------------------------------------------- *
   * Hamle uygulama
   * ---------------------------------------------------------------- */

  #makeMove(move) {
    const us = move.color;
    const them = swapColor(us);

    this.history.push({
      move,
      kings: { ...this.kings },
      turn: this.turn,
      castling: { ...this.castling },
      epSquare: this.epSquare,
      halfMoves: this.halfMoves,
      moveNumber: this.moveNumber
    });

    this.board[move.to] = this.board[move.from];
    this.board[move.from] = null;

    if (move.flags & BITS.EP_CAPTURE) {
      const captureSquare = us === WHITE ? move.to + 16 : move.to - 16;
      this.board[captureSquare] = null;
    }

    if (move.flags & BITS.PROMOTION) {
      this.board[move.to] = { type: move.promotion, color: us };
    }

    if (this.board[move.to].type === KING) {
      this.kings[us] = move.to;
      if (move.flags & BITS.KSIDE_CASTLE) {
        this.board[move.to - 1] = this.board[move.to + 1];
        this.board[move.to + 1] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        this.board[move.to + 1] = this.board[move.to - 2];
        this.board[move.to - 2] = null;
      }
      this.castling[us] = 0;
    }

    // Şah veya kale kritik bir kareden ayrıldıysa / o kare alındıysa rok hakkı düşer.
    for (const square of [move.from, move.to]) {
      const loss = CASTLE_LOSS[square];
      if (loss) this.castling[loss.color] &= ~loss.flag;
    }

    this.epSquare = move.flags & BITS.BIG_PAWN ? (us === WHITE ? move.to + 16 : move.to - 16) : -1;

    if (move.piece === PAWN || move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) this.halfMoves = 0;
    else this.halfMoves += 1;

    if (us === BLACK) this.moveNumber += 1;
    this.turn = them;
  }

  #undoMove() {
    const old = this.history.pop();
    if (!old) return null;
    const move = old.move;

    this.kings = old.kings;
    this.turn = old.turn;
    this.castling = old.castling;
    this.epSquare = old.epSquare;
    this.halfMoves = old.halfMoves;
    this.moveNumber = old.moveNumber;

    const us = move.color;
    const them = swapColor(us);

    this.board[move.from] = this.board[move.to];
    this.board[move.from].type = move.piece; // terfi geri alınır
    this.board[move.to] = null;

    if (move.flags & BITS.EP_CAPTURE) {
      const captureSquare = us === WHITE ? move.to + 16 : move.to - 16;
      this.board[captureSquare] = { type: PAWN, color: them };
    } else if (move.captured) {
      this.board[move.to] = { type: move.captured, color: them };
    }

    if (move.flags & BITS.KSIDE_CASTLE) {
      this.board[move.to + 1] = this.board[move.to - 1];
      this.board[move.to - 1] = null;
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      this.board[move.to - 2] = this.board[move.to + 1];
      this.board[move.to + 1] = null;
    }

    return move;
  }

  /**
   * Bir hamle oynar.
   * @param {object|string} input {from:"e2", to:"e4", promotion:"q"} ya da "e4" / "Af3" / "Nf3" gibi SAN.
   * @returns {object|null} Oynanan hamle (SAN dahil) veya yasal değilse null.
   */
  move(input) {
    const legalMoves = this.generateMoves({ legal: true, verbose: false });
    let chosen = null;

    if (typeof input === "string") {
      const cleaned = input.replace(/[+#?!]/g, "").trim();
      const strip = (san) => san.replace(/[+#]/g, "");

      // DİKKAT: "K" harfi iki dilde FARKLI taşı gösterir —
      // İngilizce'de King (şah), Türkçe'de Kale. Bu yüzden iki dil aynı
      // döngüde denenemez: "Kg4" hem şah hem kale hamlesine uyabildiğinden
      // eşleşme, hamle üretim sırasına göre yanlış taşa bağlanır.
      // Uygulamanın her yerde ürettiği biçim standart SAN olduğu için
      // önce onu tam olarak tarar, ancak sonuç yoksa Türkçe'ye düşeriz.
      chosen = legalMoves.find((candidate) => strip(this.#moveToSan(candidate, legalMoves)) === cleaned) || null;

      if (!chosen) {
        chosen =
          legalMoves.find((candidate) => strip(this.#moveToSan(candidate, legalMoves, true)) === cleaned) || null;
      }

      if (!chosen) chosen = this.#parseLooseSan(cleaned, legalMoves);
    } else if (input && typeof input === "object") {
      const from = toSquare(input.from);
      const to = toSquare(input.to);
      chosen = legalMoves.find(
        (candidate) =>
          candidate.from === from &&
          candidate.to === to &&
          (!(candidate.flags & BITS.PROMOTION) || candidate.promotion === (input.promotion || QUEEN))
      );
    }

    if (!chosen) return null;

    const san = this.#moveToSan(chosen, legalMoves);
    const decorated = this.#decorate(chosen);
    this.#makeMove(chosen);
    this.#countPosition();
    decorated.san = san;
    decorated.fenAfter = this.fen();
    this.history[this.history.length - 1].san = san;
    return decorated;
  }

  /** "e2e4" veya "e7e8q" gibi UCI biçimindeki hamleyi oynar. */
  moveUci(uci) {
    if (typeof uci !== "string" || uci.length < 4) return null;
    return this.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || QUEEN });
  }

  /** Son hamleyi geri alır. */
  undo() {
    if (this.history.length === 0) return null;
    this.#uncountPosition();
    const move = this.#undoMove();
    return move ? this.#decorate(move) : null;
  }

  /** Oynanmış hamleler. verbose=false ise SAN dizisi döner. */
  getHistory({ verbose = false } = {}) {
    if (!verbose) return this.history.map((entry) => entry.san).filter(Boolean);
    return this.history.map((entry) => ({ ...this.#decorate(entry.move), san: entry.san }));
  }

  /* ---------------------------------------------------------------- *
   * SAN üretimi ve okuma
   * ---------------------------------------------------------------- */

  /**
   * Hamleyi standart cebirsel gösterime çevirir.
   * @param {boolean} turkish true ise At/Fil/Kale/Vezir/Şah harfleri kullanılır.
   */
  #moveToSan(move, moves, turkish = false) {
    if (move.flags & BITS.KSIDE_CASTLE) return "O-O";
    if (move.flags & BITS.QSIDE_CASTLE) return "O-O-O";

    const letters = turkish ? TR_LETTERS : SAN_LETTERS;
    let output = "";

    if (move.piece !== PAWN) {
      output += letters[move.piece];
      output += this.#disambiguator(move, moves);
    }

    if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      if (move.piece === PAWN) output += "abcdefgh"[fileOf(move.from)];
      output += "x";
    }

    output += toAlgebraic(move.to);

    if (move.flags & BITS.PROMOTION) output += `=${letters[move.promotion] || move.promotion.toUpperCase()}`;

    // Şah / mat işareti için hamleyi geçici olarak oynarız.
    this.#makeMove(move);
    if (this.inCheck()) {
      output += this.generateMoves({ legal: true, verbose: false }).length === 0 ? "#" : "+";
    }
    this.#undoMove();

    return output;
  }

  /** Aynı hedefe gidebilen benzer taşları ayırt eden sütun/satır eki. */
  #disambiguator(move, moves) {
    let sameTarget = 0;
    let sameFile = 0;
    let sameRank = 0;

    for (const candidate of moves) {
      if (candidate.piece !== move.piece) continue;
      if (candidate.to !== move.to) continue;
      if (candidate.from === move.from) continue;
      sameTarget += 1;
      if (rankOf(candidate.from) === rankOf(move.from)) sameRank += 1;
      if (fileOf(candidate.from) === fileOf(move.from)) sameFile += 1;
    }

    if (sameTarget === 0) return "";
    const from = toAlgebraic(move.from);
    if (sameFile > 0 && sameRank > 0) return from;
    if (sameFile > 0) return from[1];
    return from[0];
  }

  /** Yazım hataları veya "e2e4" gibi serbest girdileri yakalayan yedek çözümleyici. */
  #parseLooseSan(text, moves) {
    const uci = text.match(/^([a-h][1-8])[-x]?([a-h][1-8])([qrbnQRBN])?$/);
    if (uci) {
      const from = toSquare(uci[1]);
      const to = toSquare(uci[2]);
      const promotion = uci[3] ? uci[3].toLowerCase() : QUEEN;
      return moves.find(
        (move) => move.from === from && move.to === to && (!(move.flags & BITS.PROMOTION) || move.promotion === promotion)
      );
    }

    if (/^(0-0-0|o-o-o)$/i.test(text)) return moves.find((move) => move.flags & BITS.QSIDE_CASTLE);
    if (/^(0-0|o-o)$/i.test(text)) return moves.find((move) => move.flags & BITS.KSIDE_CASTLE);

    const match = text.match(/^([A-ZŞ])?([a-h])?([1-8])?x?([a-h][1-8])=?([QRBNAVFK])?$/);
    if (!match) return null;
    const [, letter, fromFile, fromRank, target, promotionLetter] = match;
    const type = letter ? LETTER_TO_PIECE[letter] : PAWN;
    const to = toSquare(target);
    const promotion = promotionLetter ? LETTER_TO_PIECE[promotionLetter] || promotionLetter.toLowerCase() : null;

    return (
      moves.find(
        (move) =>
          move.piece === type &&
          move.to === to &&
          (!fromFile || "abcdefgh"[fileOf(move.from)] === fromFile) &&
          (!fromRank || String(8 - rankOf(move.from)) === fromRank) &&
          (!promotion || move.promotion === promotion)
      ) || null
    );
  }

  /* ---------------------------------------------------------------- *
   * Oyun durumu
   * ---------------------------------------------------------------- */

  /** Sıradaki oyuncunun hiç yasal hamlesi yok mu? */
  #hasNoMoves() {
    return this.generateMoves({ legal: true, verbose: false }).length === 0;
  }

  isCheckmate() {
    return this.inCheck() && this.#hasNoMoves();
  }

  isStalemate() {
    return !this.inCheck() && this.#hasNoMoves();
  }

  /** 50 hamle kuralı (100 yarım hamle). */
  isFiftyMoveDraw() {
    return this.halfMoves >= 100;
  }

  /** Aynı konum üç kez tekrarlandı mı? */
  isThreefoldRepetition() {
    return (this.positionCounts.get(this.#positionKey()) || 0) >= 3;
  }

  /** Mat imkânsız mı? (Ş-Ş, Ş+F-Ş, Ş+A-Ş, aynı renk fillerle Ş+F-Ş+F) */
  isInsufficientMaterial() {
    const counts = { [WHITE]: [], [BLACK]: [] };
    for (const square of SQUARE_LIST) {
      const piece = this.board[square];
      if (!piece || piece.type === KING) continue;
      if (piece.type === PAWN || piece.type === ROOK || piece.type === QUEEN) return false;
      counts[piece.color].push({ type: piece.type, light: isLightSquare(square) });
    }

    const all = [...counts[WHITE], ...counts[BLACK]];
    if (all.length === 0) return true;
    if (all.length === 1) return true;
    if (all.every((piece) => piece.type === BISHOP)) {
      const shade = all[0].light;
      if (all.every((piece) => piece.light === shade)) return true;
    }
    return false;
  }

  isDraw() {
    return (
      this.isStalemate() ||
      this.isFiftyMoveDraw() ||
      this.isThreefoldRepetition() ||
      this.isInsufficientMaterial()
    );
  }

  isGameOver() {
    return this.isCheckmate() || this.isDraw();
  }

  /**
   * Oyunun bittiğini ve nedenini çocuk diliyle açıklar.
   * @returns {{over:boolean, result:string, reason:string, winner:string|null}}
   */
  status() {
    if (this.isCheckmate()) {
      const winner = swapColor(this.turn);
      return {
        over: true,
        result: winner === WHITE ? "1-0" : "0-1",
        winner,
        reason: `Şah mat! ${winner === WHITE ? "Beyaz" : "Siyah"} kazandı.`
      };
    }
    if (this.isStalemate()) {
      return { over: true, result: "1/2-1/2", winner: null, reason: "Pat! Oynayacak hamle kalmadı ama şah tehditte değil." };
    }
    if (this.isInsufficientMaterial()) {
      return { over: true, result: "1/2-1/2", winner: null, reason: "Beraberlik: mat edecek kadar taş kalmadı." };
    }
    if (this.isThreefoldRepetition()) {
      return { over: true, result: "1/2-1/2", winner: null, reason: "Beraberlik: aynı konum üç kez tekrarlandı." };
    }
    if (this.isFiftyMoveDraw()) {
      return { over: true, result: "1/2-1/2", winner: null, reason: "Beraberlik: 50 hamle boyunca taş alınmadı, piyon sürülmedi." };
    }
    if (this.inCheck()) {
      return { over: false, result: "*", winner: null, reason: "Şah! Şahını kurtaracak bir hamle yap." };
    }
    return { over: false, result: "*", winner: null, reason: "" };
  }

  /* ---------------------------------------------------------------- *
   * Arayüz yardımcıları
   * ---------------------------------------------------------------- */

  /** Arayüzün kullandığı { e4: "♙", ... } biçiminde sembol haritası. */
  symbolMap() {
    const map = {};
    for (const square of SQUARE_LIST) {
      const piece = this.board[square];
      if (piece) map[toAlgebraic(square)] = UNICODE[piece.color + piece.type];
    }
    return map;
  }

  /** Arayüzün kullandığı { e4: {type,color}, ... } biçiminde taş haritası. */
  pieceMap() {
    const map = {};
    for (const square of SQUARE_LIST) {
      const piece = this.board[square];
      if (piece) map[toAlgebraic(square)] = { ...piece };
    }
    return map;
  }

  /** Şahı tehdit altındaysa şahın karesi, değilse null. */
  checkedKingSquare() {
    if (!this.inCheck()) return null;
    return toAlgebraic(this.kings[this.turn]);
  }

  /** Alınan taşların renklere göre listesi — oyun ekranındaki "kayıp taşlar" şeridi için. */
  capturedPieces() {
    const captured = { [WHITE]: [], [BLACK]: [] };
    for (const entry of this.history) {
      const move = entry.move;
      if (!move.captured) continue;
      // Alınan taş, hamleyi yapanın rakibine aittir.
      captured[swapColor(move.color)].push(move.captured);
    }
    return captured;
  }

  /** Konumun kopyasını verir; analiz ve yapay zekâ aramaları orijinali bozmaz. */
  clone() {
    return new Chess(this.fen());
  }

  /** Terminal/konsol hata ayıklaması için tahtayı metin olarak çizer. */
  ascii() {
    let output = "  +------------------------+\n";
    for (let rank = 0; rank < 8; rank += 1) {
      output += `${8 - rank} |`;
      for (let file = 0; file < 8; file += 1) {
        const piece = this.board[rank * 16 + file];
        output += piece
          ? ` ${piece.color === WHITE ? piece.type.toUpperCase() : piece.type} `
          : " . ";
      }
      output += "|\n";
    }
    output += "  +------------------------+\n    a  b  c  d  e  f  g  h\n";
    return output;
  }
}

/** Test ve doğrulama için düğüm sayacı (perft). */
export function perft(chess, depth) {
  if (depth === 0) return 1;
  const moves = chess.generateMoves({ legal: true, verbose: false });
  if (depth === 1) return moves.length;
  let nodes = 0;
  for (const move of moves) {
    chess.move({ from: toAlgebraic(move.from), to: toAlgebraic(move.to), promotion: move.promotion });
    nodes += perft(chess, depth - 1);
    chess.undo();
  }
  return nodes;
}
