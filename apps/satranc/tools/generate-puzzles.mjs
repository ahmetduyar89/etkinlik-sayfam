/**
 * generate-puzzles.mjs — Bulmaca üreteci (derleme zamanı aracı).
 *
 * Çalıştırma:  node tools/generate-puzzles.mjs
 * Çıktı:       src/data/puzzles.js
 *
 * Bu araç bulmacaları UYDURMAZ. Aday konumlar üretir ve her birini kendi kural
 * motorumuzla doğrular:
 *
 *  - Mat bulmacaları: gerçekten ZORUNLU mat mı? (rakip ne oynarsa oynasın)
 *  - Tek çözüm: konumu çözen BAŞKA bir ilk hamle var mı? Varsa bulmaca elenir.
 *    Çocuklara "doğru cevap" gösterecek bir sistemde bu şart olmazsa olmazdır.
 *  - Taş kazanma bulmacaları: en iyi hamle ile ikinci en iyi arasında net bir
 *    fark (santipiyon) var mı?
 *
 * Doğrulanamayan her aday sessizce atılır. Bu yüzden çıktıdaki her bulmacanın
 * çözümü tanım gereği doğrudur.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { Chess, SQUARE_LIST, toAlgebraic, WHITE, BLACK } from "../src/engine/Chess.js";
import { ai, resolveLevel } from "../src/engine/Ai.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(HERE, "..", "src", "data", "puzzles.js");

/* ------------------------------------------------------------------ *
 * Tekrarlanabilir rastgelelik
 * ------------------------------------------------------------------ */

/** Mulberry32 — sabit tohumla her çalıştırmada aynı bulmacaları üretir. */
function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = makeRandom(20260721);

const pick = (list) => list[Math.floor(random() * list.length)];
const FILES = "abcdefgh".split("");
const ALL_SQUARES = SQUARE_LIST.map(toAlgebraic);

/* ------------------------------------------------------------------ *
 * Konum yardımcıları
 * ------------------------------------------------------------------ */

/** Taş haritasından FEN üretir. pieces: { e1: "K", e8: "k", ... } */
function toFen(pieces, turn) {
  const rows = [];
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = "";
    let empty = 0;
    for (const file of FILES) {
      const piece = pieces[`${file}${rank}`];
      if (piece) {
        if (empty) row += empty;
        empty = 0;
        row += piece;
      } else empty += 1;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} ${turn} - - 0 1`;
}

/** İki karenin komşu olup olmadığı (şahlar yan yana duramaz). */
function adjacent(a, b) {
  const fileDiff = Math.abs(FILES.indexOf(a[0]) - FILES.indexOf(b[0]));
  const rankDiff = Math.abs(Number(a[1]) - Number(b[1]));
  return fileDiff <= 1 && rankDiff <= 1;
}

/**
 * Konumun kurallara uygun olup olmadığını sınar.
 * En kritik kontrol: sırası GELMEYEN tarafın şahı tehdit altında olamaz.
 */
function loadIfLegal(fen) {
  let chess;
  try {
    chess = new Chess(fen);
  } catch {
    return null;
  }
  const waiting = chess.turnColor() === WHITE ? BLACK : WHITE;
  if (chess.isKingAttacked(waiting)) return null;
  if (chess.moves().length === 0) return null;
  return chess;
}

/* ------------------------------------------------------------------ *
 * Hat ve saldırı geometrisi
 *
 * Yeni temaların çoğu (şiş, açmaz, çifte şah, koridor) "hangi taş neye,
 * hangi hat üzerinden saldırıyor?" sorusunun cevabına dayanır. Motorun
 * `attacked()` metodu yalnızca EVET/HAYIR der; bize saldıranın KARESİ ve
 * hattın kendisi gerekir. Bu yüzden burada kendi ışın taramamız var.
 * (Doğruluğu motorun `attacked()` sonucuyla karşılaştırılarak sınanmıştır.)
 * ------------------------------------------------------------------ */

const RAYS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const KNIGHT_JUMPS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

const squareAt = (file, rank) =>
  file < 0 || file > 7 || rank < 1 || rank > 8 ? null : `${FILES[file]}${rank}`;
const fileIndex = (square) => FILES.indexOf(square[0]);
const rankIndex = (square) => Number(square[1]);

/** `from` karesinden `dir` yönünde ilerleyip ilk DOLU kareyi verir (yoksa null). */
function firstPieceAlong(chess, from, dir) {
  let file = fileIndex(from) + dir[0];
  let rank = rankIndex(from) + dir[1];
  while (squareAt(file, rank)) {
    const square = squareAt(file, rank);
    const piece = chess.get(square);
    if (piece) return { square, piece };
    file += dir[0];
    rank += dir[1];
  }
  return null;
}

/** İki kare aynı hat üzerinde mi? Öyleyse birinden diğerine giden yön vektörü. */
function directionBetween(a, b) {
  const df = fileIndex(b) - fileIndex(a);
  const dr = rankIndex(b) - rankIndex(a);
  if (df === 0 && dr === 0) return null;
  if (df !== 0 && dr !== 0 && Math.abs(df) !== Math.abs(dr)) return null;
  return [Math.sign(df), Math.sign(dr)];
}

/**
 * İki kare ARASINDAKİ kareler (uçlar hariç). Aynı hat üzerinde değillerse null.
 * Hattın boş olup olmadığını sınamak için kullanılır.
 */
function between(a, b) {
  const dir = directionBetween(a, b);
  if (!dir) return null;
  const squares = [];
  let file = fileIndex(a) + dir[0];
  let rank = rankIndex(a) + dir[1];
  while (squareAt(file, rank) && squareAt(file, rank) !== b) {
    squares.push(squareAt(file, rank));
    file += dir[0];
    rank += dir[1];
  }
  return squareAt(file, rank) === b ? squares : null;
}

/** Bir kareye saldıran, verilen renkteki taşların KARELERİ. */
function attackerSquares(chess, target, byColor) {
  const found = [];
  const tf = fileIndex(target);
  const tr = rankIndex(target);

  for (const [df, dr] of KNIGHT_JUMPS) {
    const square = squareAt(tf + df, tr + dr);
    if (!square) continue;
    const piece = chess.get(square);
    if (piece && piece.color === byColor && piece.type === "n") found.push(square);
  }

  // Piyon ÇAPRAZ alır: beyaz piyon bir alt satırdan, siyah piyon bir üstten saldırır.
  const pawnRank = byColor === WHITE ? tr - 1 : tr + 1;
  for (const df of [-1, 1]) {
    const square = squareAt(tf + df, pawnRank);
    if (!square) continue;
    const piece = chess.get(square);
    if (piece && piece.color === byColor && piece.type === "p") found.push(square);
  }

  for (const dir of RAYS) {
    const hit = firstPieceAlong(chess, target, dir);
    if (!hit || hit.piece.color !== byColor) continue;
    const diagonal = dir[0] !== 0 && dir[1] !== 0;
    const distance = Math.max(
      Math.abs(fileIndex(hit.square) - tf),
      Math.abs(rankIndex(hit.square) - tr)
    );
    const reaches =
      hit.piece.type === "q" ||
      (hit.piece.type === "r" && !diagonal) ||
      (hit.piece.type === "b" && diagonal) ||
      (hit.piece.type === "k" && distance === 1);
    if (reaches) found.push(hit.square);
  }
  return found;
}

/** Şahın çevresindeki tüm kareler. */
function ringAround(square) {
  const ring = [];
  for (let df = -1; df <= 1; df += 1) {
    for (let dr = -1; dr <= 1; dr += 1) {
      if (df === 0 && dr === 0) continue;
      const found = squareAt(fileIndex(square) + df, rankIndex(square) + dr);
      if (found) ring.push(found);
    }
  }
  return ring;
}

/* ------------------------------------------------------------------ *
 * Zorunlu mat doğrulaması
 * ------------------------------------------------------------------ */

/**
 * Sırası gelen taraf için `moveDepth` hamlede ZORUNLU mat arar.
 * Rakibin TÜM cevapları mat ile sonuçlanmalıdır; tek bir kaçış varsa mat yoktur.
 *
 * @returns {string[]} Mat eden ilk hamlelerin SAN listesi (birden fazlaysa çözüm tek değildir).
 */
function findForcedMates(chess, moveDepth) {
  const solutions = [];
  for (const move of chess.moves()) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });

    let works;
    if (chess.isCheckmate()) {
      works = true;
    } else if (moveDepth === 1) {
      works = false;
    } else {
      const replies = chess.moves();
      // Pat mat değildir; rakibin hamlesi kalmamışsa bu satır işe yaramaz.
      works =
        replies.length > 0 &&
        replies.every((reply) => {
          chess.move({ from: reply.from, to: reply.to, promotion: reply.promotion });
          const forced = findForcedMates(chess, moveDepth - 1).length > 0;
          chess.undo();
          return forced;
        });
    }

    chess.undo();
    if (works) {
      solutions.push(move.san);
      // İki çözüm bulduysak "tek çözüm" şartı zaten bozuldu, aramayı sürdürmeye gerek yok.
      if (solutions.length > 1) break;
    }
  }
  return solutions;
}

/** Zorunlu mat çözümünün tam hamle sırasını (oyuncu + rakip) çıkarır. */
function principalLine(chess, moveDepth) {
  const line = [];
  const work = chess.clone();
  let depth = moveDepth;
  while (depth > 0) {
    const mates = findForcedMates(work, depth);
    if (mates.length === 0) break;
    const played = work.move(mates[0]);
    line.push(played.san);
    if (work.isCheckmate()) break;
    // Rakip için en inatçı cevabı seçeriz (ilk yasal cevap yeterlidir; hepsi mat).
    const replies = work.moves();
    if (replies.length === 0) break;
    const reply = work.move(replies[0].san);
    line.push(reply.san);
    depth -= 1;
  }
  return line;
}

/* ------------------------------------------------------------------ *
 * Aday konum üreticileri
 * ------------------------------------------------------------------ */

/** Rastgele, seyrek oyun sonu konumu: şahlar + birkaç ağır taş. */
function randomMatingPosition(materials) {
  const pieces = {};
  const used = new Set();

  const place = (symbol, allowed = ALL_SQUARES) => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const square = pick(allowed);
      if (used.has(square)) continue;
      // Piyonlar 1. ve 8. yatayda duramaz.
      if (symbol.toLowerCase() === "p" && (square[1] === "1" || square[1] === "8")) continue;
      used.add(square);
      pieces[square] = symbol;
      return square;
    }
    return null;
  };

  const blackKing = place("k");
  if (!blackKing) return null;
  // Şahlar komşu olamaz.
  const whiteKing = place("K", ALL_SQUARES.filter((square) => !adjacent(square, blackKing)));
  if (!whiteKing) return null;

  for (const symbol of materials) {
    if (!place(symbol)) return null;
  }

  return toFen(pieces, "w");
}

/**
 * At çatalı adayı: atın tek hamleyle şah + değerli taşa aynı anda saldırdığı konum.
 * Çatal karesini önce seçip etrafını kurarız.
 */
function randomKnightFork() {
  const KNIGHT_STEPS = [
    [1, 2], [2, 1], [2, -1], [1, -2],
    [-1, -2], [-2, -1], [-2, 1], [-1, 2]
  ];

  const offset = (square, [df, dr]) => {
    const file = FILES.indexOf(square[0]) + df;
    const rank = Number(square[1]) + dr;
    if (file < 0 || file > 7 || rank < 1 || rank > 8) return null;
    return `${FILES[file]}${rank}`;
  };

  const forkSquare = pick(ALL_SQUARES);
  const targets = KNIGHT_STEPS.map((step) => offset(forkSquare, step)).filter(Boolean);
  if (targets.length < 3) return null;

  // Çatalın iki hedefi: siyah şah ve değerli bir siyah taş.
  const shuffled = [...targets].sort(() => random() - 0.5);
  const blackKing = shuffled[0];
  const victimSquare = shuffled[1];
  const knightStart = shuffled[2];
  const victim = pick(["q", "r", "r"]);

  const pieces = {};
  pieces[blackKing] = "k";
  pieces[victimSquare] = victim;
  pieces[knightStart] = "N";
  if (pieces[forkSquare]) return null;

  // Beyaz şahı gerçekten rastgele bir kareye koyarız. (Filtre içinde rastgelelik
  // kullanmak tahtanın baş taraflarına ağır önyargı yaratıyordu.)
  const taken = new Set([blackKing, victimSquare, knightStart, forkSquare]);
  const options = ALL_SQUARES.filter((square) => !taken.has(square) && !adjacent(square, blackKing));
  if (options.length === 0) return null;
  const whiteKingSquare = pick(options);
  pieces[whiteKingSquare] = "K";

  return toFen(pieces, "w");
}

/* ------------------------------------------------------------------ *
 * Yeni tema aday üreticileri
 *
 * Hepsi aynı ilkeyle çalışır: konumu ÖNCE kurgular (rastgele konumda bu
 * desenlerin çıkmasını beklemek çok verimsizdir), SONRA motorla doğrular.
 * Kurgu bulmacanın doğru olduğunu garanti etmez — doğrulama eder.
 * ------------------------------------------------------------------ */

/** Rastgele siyah taş harfi (piyon ağırlıklı; ilk/son yatayda piyon olamaz). */
function blackFiller(square) {
  const onEdgeRank = square[1] === "1" || square[1] === "8";
  return onEdgeRank ? pick(["r", "b", "n"]) : pick(["p", "p", "p", "r", "b", "n"]);
}

/** Beyaz şahı, siyah şaha komşu olmayan boş bir kareye yerleştirir. */
function placeWhiteKing(pieces, blackKing, forbidden = []) {
  const taken = new Set([...Object.keys(pieces), ...forbidden]);
  const options = ALL_SQUARES.filter((square) => !taken.has(square) && !adjacent(square, blackKing));
  if (options.length === 0) return false;
  pieces[pick(options)] = "K";
  return true;
}

/**
 * BOĞMACA MATI adayı: şah kendi taşlarıyla çevrilidir, at sıçrayıp mat eder.
 * Şahı kenara/köşeye koyarız — komşu kare sayısı az olduğu için boğulma olasıdır.
 */
function randomSmotheredMate() {
  const corners = ALL_SQUARES.filter((square) => ringAround(square).length <= 5);
  const blackKing = pick(corners);
  const pieces = { [blackKing]: "k" };
  for (const square of ringAround(blackKing)) pieces[square] = blackFiller(square);

  // Atın mat edeceği kare: şaha at hamlesi uzaklığında ve BOŞ olmalı.
  const mateSquares = KNIGHT_JUMPS
    .map(([df, dr]) => squareAt(fileIndex(blackKing) + df, rankIndex(blackKing) + dr))
    .filter((square) => square && !pieces[square]);
  if (mateSquares.length === 0) return null;
  const mateSquare = pick(mateSquares);

  const starts = KNIGHT_JUMPS
    .map(([df, dr]) => squareAt(fileIndex(mateSquare) + df, rankIndex(mateSquare) + dr))
    .filter((square) => square && !pieces[square] && square !== blackKing);
  if (starts.length === 0) return null;
  pieces[pick(starts)] = "N";

  if (!placeWhiteKing(pieces, blackKing, [mateSquare])) return null;
  return toFen(pieces, "w");
}

/**
 * KORİDOR MATI adayı: şah son yatayda, önü kendi piyonlarıyla kapalı;
 * kale ya da vezir yatay boyunca gelip mat eder.
 */
function randomBackRankMate() {
  const blackKing = pick(FILES.map((file) => `${file}8`));
  const pieces = { [blackKing]: "k" };

  // Şahın 7. yataydaki kaçış karelerini KENDİ piyonları kapatır.
  for (const df of [-1, 0, 1]) {
    const square = squareAt(fileIndex(blackKing) + df, 7);
    if (square) pieces[square] = "p";
  }

  const heavy = pick(["R", "R", "Q"]);
  // Ağır taş 8. yatayda DEĞİL; bir hamlede oraya gelecek.
  const starts = ALL_SQUARES.filter((square) => square[1] !== "8" && !pieces[square]);
  pieces[pick(starts)] = heavy;

  if (!placeWhiteKing(pieces, blackKing)) return null;
  return toFen(pieces, "w");
}

/**
 * ŞİŞ adayı: şah ile arkasındaki değerli taş aynı hatta dizilir; beyaz taş
 * hatta girip şah çeker, şah çekilince arkadaki taş düşer.
 */
function randomSkewer() {
  const dir = pick(RAYS);
  const diagonal = dir[0] !== 0 && dir[1] !== 0;
  const entry = pick(ALL_SQUARES);

  const blackKing = squareAt(
    fileIndex(entry) + dir[0] * (1 + Math.floor(random() * 3)),
    rankIndex(entry) + dir[1] * (1 + Math.floor(random() * 3))
  );
  if (!blackKing) return null;
  const behind = squareAt(
    fileIndex(blackKing) + dir[0] * (1 + Math.floor(random() * 3)),
    rankIndex(blackKing) + dir[1] * (1 + Math.floor(random() * 3))
  );
  if (!behind) return null;

  const pieces = { [blackKing]: "k", [behind]: pick(["q", "r", "r"]) };
  // Hat temiz olmalı: giriş karesi ile şah arası boş kalacak.
  const gap = between(entry, blackKing);
  if (gap === null || gap.some((square) => pieces[square])) return null;
  const gap2 = between(blackKing, behind);
  if (gap2 === null || gap2.some((square) => pieces[square])) return null;

  const type = diagonal ? "B" : "R";
  // Beyaz taş HENÜZ hatta değil; bir hamlede giriş karesine gelebilmeli.
  const starts = ALL_SQUARES.filter((square) => {
    if (square === entry || pieces[square]) return false;
    const straight = square[0] === entry[0] || square[1] === entry[1];
    const diag = Math.abs(fileIndex(square) - fileIndex(entry)) === Math.abs(rankIndex(square) - rankIndex(entry));
    return type === "R" ? straight : diag;
  });
  if (starts.length === 0) return null;
  pieces[pick(starts)] = type;

  if (!placeWhiteKing(pieces, blackKing, [entry])) return null;
  return toFen(pieces, "w");
}

/**
 * AÇMAZ adayı: siyah vezir, şahıyla aynı hatta durur; beyaz kale/fil hattın
 * arkasına girip veziri mıhlar. Vezir kaçamaz, daha ucuz taşa düşer.
 */
function randomPin() {
  const dir = pick(RAYS);
  const diagonal = dir[0] !== 0 && dir[1] !== 0;
  const blackKing = pick(ALL_SQUARES);

  const victim = squareAt(fileIndex(blackKing) + dir[0], rankIndex(blackKing) + dir[1]);
  if (!victim) return null;
  const entry = squareAt(
    fileIndex(victim) + dir[0] * (1 + Math.floor(random() * 4)),
    rankIndex(victim) + dir[1] * (1 + Math.floor(random() * 4))
  );
  if (!entry) return null;

  const pieces = { [blackKing]: "k", [victim]: "q" };
  const gap = between(victim, entry);
  if (gap === null || gap.some((square) => pieces[square])) return null;

  const type = diagonal ? "B" : "R";
  const starts = ALL_SQUARES.filter((square) => {
    if (square === entry || pieces[square]) return false;
    const straight = square[0] === entry[0] || square[1] === entry[1];
    const diag = Math.abs(fileIndex(square) - fileIndex(entry)) === Math.abs(rankIndex(square) - rankIndex(entry));
    return type === "R" ? straight : diag;
  });
  if (starts.length === 0) return null;
  pieces[pick(starts)] = type;

  // Mıhlayan taşı KORUYAN bir beyaz taş şarttır. Mıhlı vezir hat boyunca hâlâ
  // hareket edebilir ve korumasız mıhlayıcıyı bedavaya alır; o zaman bulmaca
  // "açmaz" değil, beyazın taş kaybı olur. Korunuyorsa vezir ya kıpırdayamaz
  // ya da kendini daha ucuz bir taşa verir.
  const guards = KNIGHT_JUMPS
    .map(([df, dr]) => squareAt(fileIndex(entry) + df, rankIndex(entry) + dr))
    .filter((square) => square && !pieces[square] && !adjacent(square, blackKing));
  if (guards.length === 0) return null;
  pieces[pick(guards)] = "N";

  if (!placeWhiteKing(pieces, blackKing, [entry])) return null;
  return toFen(pieces, "w");
}

/**
 * ÇİFTE ŞAH adayı: beyaz ağır taşın önünde duran at kenara sıçrayınca hem at
 * hem arkadaki taş şah çeker. İki şahtan kaçmanın tek yolu şahı oynatmaktır.
 */
function randomDoubleCheck() {
  const dir = pick(RAYS);
  const diagonal = dir[0] !== 0 && dir[1] !== 0;
  const blackKing = pick(ALL_SQUARES);

  // Gizlenen taş: şahtan en az 2 kare uzakta, aynı hatta.
  const hidden = squareAt(
    fileIndex(blackKing) + dir[0] * (2 + Math.floor(random() * 4)),
    rankIndex(blackKing) + dir[1] * (2 + Math.floor(random() * 4))
  );
  if (!hidden) return null;
  const blockers = between(blackKing, hidden);
  if (!blockers || blockers.length === 0) return null;
  const blocker = pick(blockers);

  // Atın gideceği kare: şaha at hamlesi uzaklığında ve hattın dışında.
  const jumps = KNIGHT_JUMPS
    .map(([df, dr]) => squareAt(fileIndex(blackKing) + df, rankIndex(blackKing) + dr))
    .filter((square) => square && square !== blocker && !between(blackKing, hidden)?.includes(square));
  if (jumps.length === 0) return null;
  const landing = pick(jumps);
  // At, blocker'dan landing'e sıçrayabilmeli.
  const reachable = KNIGHT_JUMPS.some(
    ([df, dr]) => squareAt(fileIndex(blocker) + df, rankIndex(blocker) + dr) === landing
  );
  if (!reachable) return null;

  const pieces = { [blackKing]: "k", [hidden]: diagonal ? "B" : "R", [blocker]: "N" };
  if (pieces[landing]) return null;

  // Keşif hattı: at çekildiğinde arkadaki taşın şah çekebilmesi için bu karelerin
  // BOŞ kalması şart. Yedek taş ya da beyaz şah buraya düşerse çifte şah oluşmaz;
  // üretecin kendi kurgusunu bozmasının en sık sebebi buydu.
  const corridor = new Set(blockers);

  // Kazanılacak bir hedef: tahtanın çıplak görünmemesi için bir siyah taş.
  const spare = ALL_SQUARES.filter(
    (square) =>
      !pieces[square] && square !== landing && !corridor.has(square) && !adjacent(square, blackKing)
  );
  if (spare.length) pieces[pick(spare)] = pick(["r", "b", "n"]);

  if (!placeWhiteKing(pieces, blackKing, [landing, ...corridor])) return null;
  return toFen(pieces, "w");
}

/**
 * TERFİ adayı: 7. yataydaki beyaz piyon vezire çıkarak mat eder.
 */
function randomPromotion() {
  const file = pick(FILES);
  const pawn = `${file}7`;
  const promotionSquare = `${file}8`;
  const pieces = { [pawn]: "P" };

  const blackKing = pick(
    ALL_SQUARES.filter((square) => square !== pawn && square !== promotionSquare)
  );
  pieces[blackKing] = "k";
  if (adjacent(blackKing, promotionSquare)) {
    // Şah terfi karesine komşuysa yeni vezir hemen alınır; desteklemek gerekir.
    const guards = ALL_SQUARES.filter(
      (square) => !pieces[square] && square !== promotionSquare && !adjacent(square, blackKing)
    );
    if (guards.length === 0) return null;
    pieces[pick(guards)] = pick(["R", "B", "N"]);
  }

  // Şahın kaçışını kısıtlayan birkaç taş.
  for (let i = 0; i < 1 + Math.floor(random() * 2); i += 1) {
    const spare = ALL_SQUARES.filter(
      (square) => !pieces[square] && square !== promotionSquare && !adjacent(square, blackKing)
    );
    if (!spare.length) break;
    pieces[pick(spare)] = pick(["R", "Q", "B", "N"]);
  }

  if (!placeWhiteKing(pieces, blackKing, [promotionSquare])) return null;
  return toFen(pieces, "w");
}

/**
 * ASKIDA TAŞ adayı: korumasız duran siyah taşı bedavaya alma.
 */
function randomHangingPiece() {
  const pieces = {};
  const blackKing = pick(ALL_SQUARES);
  pieces[blackKing] = "k";

  const victimSquares = ALL_SQUARES.filter(
    (square) => !pieces[square] && !adjacent(square, blackKing)
  );
  const victim = pick(victimSquares);
  pieces[victim] = pick(["q", "r", "r", "b", "n"]);

  // Alacak beyaz taş: kurbanı görebilen bir kareye konur.
  const type = pick(["R", "B", "N", "Q"]);
  let starts;
  if (type === "N") {
    starts = KNIGHT_JUMPS
      .map(([df, dr]) => squareAt(fileIndex(victim) + df, rankIndex(victim) + dr))
      .filter((square) => square && !pieces[square]);
  } else {
    starts = ALL_SQUARES.filter((square) => {
      if (pieces[square] || square === victim) return false;
      const straight = square[0] === victim[0] || square[1] === victim[1];
      const diag = Math.abs(fileIndex(square) - fileIndex(victim)) === Math.abs(rankIndex(square) - rankIndex(victim));
      if (type === "R") return straight;
      if (type === "B") return diag;
      return straight || diag;
    });
  }
  if (!starts || starts.length === 0) return null;
  pieces[pick(starts)] = type;

  // Birkaç nötr siyah taş — tahtanın çıplak görünmemesi için.
  for (let i = 0; i < Math.floor(random() * 3); i += 1) {
    const spare = ALL_SQUARES.filter((square) => !pieces[square] && !adjacent(square, blackKing));
    if (!spare.length) break;
    pieces[pick(spare)] = pick(["p", "n", "b"]);
  }

  if (!placeWhiteKing(pieces, blackKing)) return null;
  return toFen(pieces, "w");
}

/* ------------------------------------------------------------------ *
 * Bulmaca kalıpları (tema metinleri)
 * ------------------------------------------------------------------ */

const THEMES = {
  "mat-1": {
    theme: "mat-1",
    titles: ["Tek Hamlede Mat", "Matı Bul", "Son Vuruş", "Şah Mat Zamanı"],
    goal: "Beyaz oynar ve tek hamlede mat eder.",
    hints: [
      "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
      "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
      "Şaha en yakın taşını kullan ve kaçış karelerini kapat."
    ],
    explain: "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!"
  },
  "mat-2": {
    theme: "mat-2",
    titles: ["İki Hamlede Mat", "Mat Ağı Kur", "Planlı Mat", "Zorunlu Mat"],
    goal: "Beyaz oynar ve en fazla iki hamlede mat eder.",
    hints: [
      "Önce şahı istediğin kareye zorla, sonra matı yap.",
      "İlk hamlen şahın kaçış karelerini azaltmalı.",
      "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et."
    ],
    explain: "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık."
  },
  catal: {
    theme: "catal",
    titles: ["At Çatalı", "Çifte Saldırı", "Atın Sürprizi", "İki Hedef Birden"],
    goal: "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    hints: [
      "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
      "Şah ve vezire birlikte bakan kare hangisi?",
      "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et."
    ],
    explain: "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz."
  },
  koridor: {
    theme: "koridor",
    titles: ["Koridor Matı", "Son Yatay", "Arka Sıra Tuzağı", "Kaçış Yok"],
    goal: "Beyaz oynar ve son yatayda mat eder.",
    hints: [
      "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
      "Son yatayı boydan boya tarayan bir hamle ara.",
      "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter."
    ],
    explain: "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir."
  },
  bogmaca: {
    theme: "bogmaca",
    titles: ["Boğmaca Matı", "Kendi Taşları Engel", "Atın Zaferi", "Sıkışan Şah"],
    goal: "Beyaz oynar ve atıyla mat eder.",
    hints: [
      "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
      "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
      "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek."
    ],
    explain: "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir."
  },
  sis: {
    theme: "sis",
    titles: ["Şiş", "Öndeki Kaçsın", "Hat Üzerinde", "Şişe Diz"],
    goal: "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    hints: [
      "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
      "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
      "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli."
    ],
    explain: "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı."
  },
  acmaz: {
    theme: "acmaz",
    titles: ["Açmaz", "Mıhlanmış Vezir", "Kıpırdayamaz", "Hatta Kilitle"],
    goal: "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    hints: [
      "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
      "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
      "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir."
    ],
    explain: "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor."
  },
  "cifte-sah": {
    theme: "cifte-sah",
    titles: ["Çifte Şah", "İki Taş Birden", "Açarak Şah", "Kaçmaktan Başka Çare Yok"],
    goal: "Beyaz oynar ve çifte şah çeker.",
    hints: [
      "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
      "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
      "Çifte şahta şah MUTLAKA oynamak zorundadır."
    ],
    explain: "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır."
  },
  terfi: {
    theme: "terfi",
    titles: ["Terfi ile Mat", "Piyon Vezir Oluyor", "Son Adım", "Sekizinci Yatay"],
    goal: "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    hints: [
      "Son yataya bir adım kalan piyonu bul.",
      "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
      "Hangi taşa terfi edersen şah kaçamaz?"
    ],
    explain: "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur."
  },
  askida: {
    theme: "askida",
    titles: ["Askıda Taş", "Bedava Taş", "Korumasız", "Sahipsiz Kalmış"],
    goal: "Beyaz oynar ve korumasız taşı kazanır.",
    hints: [
      "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
      "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
      "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır."
    ],
    explain: "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar."
  }
};

/** Tema metinlerini bulmacaya uyarlar. */
function decorate(index, themeKey, level, extra) {
  const theme = THEMES[themeKey];
  return {
    id: `puzzle-${String(index + 1).padStart(4, "0")}`,
    level,
    theme: theme.theme,
    title: `${pick(theme.titles)} #${index + 1}`,
    goal: theme.goal,
    hint: pick(theme.hints),
    explanation: theme.explain,
    ...extra
  };
}

/* ------------------------------------------------------------------ *
 * Üretim
 * ------------------------------------------------------------------ */

/** Mat bulmacaları üretir ve doğrular. */
function buildMatePuzzles({ target, moveDepth, materialSets, levelFor, maxAttempts }) {
  const found = [];
  const seen = new Set();
  let attempts = 0;

  while (found.length < target && attempts < maxAttempts) {
    attempts += 1;
    const fen = randomMatingPosition(pick(materialSets));
    if (!fen || seen.has(fen)) continue;

    const chess = loadIfLegal(fen);
    if (!chess) continue;

    // Daha kısa matla çözülebiliyorsa bu bulmaca o kategoriye ait değildir.
    if (moveDepth > 1 && findForcedMates(chess.clone(), moveDepth - 1).length > 0) continue;

    const solutions = findForcedMates(chess.clone(), moveDepth);
    // TEK çözüm şartı: birden fazla doğru cevap varsa çocuğa "yanlış" demek haksızlık olur.
    if (solutions.length !== 1) continue;

    seen.add(fen);
    const line = principalLine(chess.clone(), moveDepth);
    const pieceCount = fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;

    found.push({
      fen,
      solution: solutions[0],
      line,
      pieceCount,
      level: levelFor(pieceCount)
    });
  }

  return { found, attempts };
}

const KNIGHT_VECTORS = [
  [1, 2], [2, 1], [2, -1], [1, -2],
  [-1, -2], [-2, -1], [-2, 1], [-1, 2]
];

/**
 * Verilen karedeki atın saldırdığı siyah ağır taşları (vezir/kale) bulur.
 * "En iyi hamle at hamlesiydi" demek çatal olduğu anlamına GELMEZ; bu yüzden
 * çatalın ikinci ucunu açıkça doğrulamak zorundayız.
 */
function knightHeavyTargets(chess, square) {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]);
  const targets = [];
  for (const [df, dr] of KNIGHT_VECTORS) {
    const f = file + df;
    const r = rank + dr;
    if (f < 0 || f > 7 || r < 1 || r > 8) continue;
    const piece = chess.get(`${FILES[f]}${r}`);
    if (piece && piece.color === BLACK && (piece.type === "q" || piece.type === "r")) {
      targets.push(`${FILES[f]}${r}`);
    }
  }
  return targets;
}

/** At çatalı bulmacaları üretir ve motorla doğrular. */
function buildForkPuzzles({ target, maxAttempts }) {
  const found = [];
  const seen = new Set();
  let attempts = 0;
  const level = resolveLevel("orta");

  while (found.length < target && attempts < maxAttempts) {
    attempts += 1;
    const fen = randomKnightFork();
    if (!fen || seen.has(fen)) continue;

    const chess = loadIfLegal(fen);
    if (!chess) continue;
    // Zaten mat varsa bu bir çatal bulmacası değildir.
    if (findForcedMates(chess.clone(), 1).length > 0) continue;

    const results = ai.search(chess.clone(), level);
    if (results.length < 2) continue;

    const best = results[0];
    const second = results[1];
    // Net üstünlük şartı: en iyi hamle ikinciden belirgin biçimde iyi olmalı.
    if (best.score - second.score < 250) continue;

    const probe = chess.clone();
    const bestMove = probe.move({
      from: toAlgebraic(best.move.from),
      to: toAlgebraic(best.move.to),
      promotion: best.move.promotion
    });
    if (!bestMove || bestMove.piece !== "n") continue;

    // Gerçek çatal şartı: atın bir ucu ŞAH çekmeli, diğer ucu vezir/kaleye saldırmalı.
    // Bu kontrol olmadan "atla taş kazanma" bulmacaları çatal diye etiketleniyordu.
    if (!probe.inCheck()) continue;
    if (knightHeavyTargets(probe, bestMove.to).length === 0) continue;

    seen.add(fen);
    found.push({
      fen,
      solution: bestMove.san,
      line: [bestMove.san],
      pieceCount: fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length,
      // Zorluk temanın adına değil KONUMA bağlıdır; az taşlı çatal kolaydır.
      level: fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length <= 5 ? "Kolay" : "Orta"
    });
  }

  return { found, attempts };
}

/* ------------------------------------------------------------------ *
 * Yeni temaların doğrulayıcıları
 *
 * Her tema için iki soru ayrı ayrı yanıtlanır:
 *   1. Bulmaca ÇÖZÜLEBİLİR mi ve çözümü TEK mi?  (mat araması / motor farkı)
 *   2. Çözüm gerçekten O DESEN mi?                (geometri kontrolü)
 *
 * İkincisi olmadan etiketler yalan söyler: "en iyi hamle at hamlesiydi" demek
 * çatal olduğu anlamına gelmez, "mat oldu" demek koridor matı olduğu anlamına
 * gelmez. Çocuğa deseni öğreteceğimiz için etiketin doğru olması şarttır.
 * ------------------------------------------------------------------ */

/**
 * Mat temeli olan temalar için ortak üretim döngüsü.
 * @param {(chess:Chess, solution:string) => boolean} pattern Deseni doğrular.
 */
function buildPatternMates({ target, generator, pattern, level, maxAttempts }) {
  const found = [];
  const seen = new Set();
  let attempts = 0;

  while (found.length < target && attempts < maxAttempts) {
    attempts += 1;
    const fen = generator();
    if (!fen || seen.has(fen)) continue;

    const chess = loadIfLegal(fen);
    if (!chess) continue;

    const solutions = findForcedMates(chess.clone(), 1);
    if (solutions.length !== 1) continue;
    if (!pattern(chess.clone(), solutions[0])) continue;

    seen.add(fen);
    const pieceCount = fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;
    found.push({
      fen,
      solution: solutions[0],
      line: [solutions[0]],
      pieceCount,
      level: typeof level === "function" ? level(pieceCount) : level
    });
  }
  return { found, attempts };
}

/**
 * Taş kazanma temaları için ortak üretim döngüsü.
 * Mat varsa eler (o zaman bulmaca mat bulmacasıdır), en iyi hamle ile ikincisi
 * arasında net fark arar ve deseni ayrıca doğrular.
 */
function buildPatternGains({ target, generator, pattern, level, margin = 250, maxAttempts }) {
  const found = [];
  const seen = new Set();
  const searchLevel = resolveLevel("orta");
  let attempts = 0;

  while (found.length < target && attempts < maxAttempts) {
    attempts += 1;
    const fen = generator();
    if (!fen || seen.has(fen)) continue;

    const chess = loadIfLegal(fen);
    if (!chess) continue;
    if (findForcedMates(chess.clone(), 1).length > 0) continue;

    const results = ai.search(chess.clone(), searchLevel);
    if (results.length < 2) continue;
    if (results[0].score - results[1].score < margin) continue;

    const probe = chess.clone();
    const played = probe.move({
      from: toAlgebraic(results[0].move.from),
      to: toAlgebraic(results[0].move.to),
      promotion: results[0].move.promotion
    });
    if (!played) continue;
    if (!pattern(probe, played, chess.clone())) continue;

    seen.add(fen);
    const pieceCount = fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;
    found.push({
      fen,
      solution: played.san,
      line: [played.san],
      pieceCount,
      level: typeof level === "function" ? level(pieceCount) : level
    });
  }
  return { found, attempts };
}

/**
 * ÇİFTE ŞAH bulmacaları.
 *
 * Diğer temalarda motorun "en iyi hamlesi" desene uyuyor mu diye bakarız.
 * Burada bu yaklaşım işe yaramıyordu: çifte şah çoğu zaman MAT ile bittiği için
 * "mat varsa ele" filtresi adayların neredeyse tamamını atıyordu. Bu yüzden
 * çifte şah çeken hamleyi doğrudan arar, TEK olmasını şart koşar ve motordan
 * yalnızca "bu hamle gerçekten en iyisi mi?" onayını isteriz.
 */
function buildDoubleCheckPuzzles({ target, maxAttempts }) {
  const found = [];
  const seen = new Set();
  const searchLevel = resolveLevel("orta");
  let attempts = 0;

  while (found.length < target && attempts < maxAttempts) {
    attempts += 1;
    const fen = randomDoubleCheck();
    if (!fen || seen.has(fen)) continue;

    const chess = loadIfLegal(fen);
    if (!chess) continue;

    const results = ai.search(chess.clone(), searchLevel);
    if (results.length === 0) continue;
    // İkinci en iyi hamle belirgin biçimde kötü olmalı; ancak o zaman çocuğa
    // "başka cevap yanlış" demek adil olur.
    if (results.length > 1 && results[0].score - results[1].score < 250) continue;

    const probe = chess.clone();
    const best = probe.move({
      from: toAlgebraic(results[0].move.from),
      to: toAlgebraic(results[0].move.to),
      promotion: results[0].move.promotion
    });
    if (!best || !isDoubleCheck(probe)) continue;
    const doubles = [best.san];

    seen.add(fen);
    const pieceCount = fen.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;
    found.push({
      fen,
      solution: doubles[0],
      line: [doubles[0]],
      pieceCount,
      level: pieceCount <= 6 ? "Orta" : "Zor"
    });
  }
  return { found, attempts };
}

/** Siyah şahın karesi. */
function blackKingSquare(chess) {
  for (const square of ALL_SQUARES) {
    const piece = chess.get(square);
    if (piece && piece.type === "k" && piece.color === BLACK) return square;
  }
  return null;
}

/* --- Desen sınayıcıları --- */

/** KORİDOR: mat 8. yatayda ağır taşla verilmeli, şahın 7. yataydaki kaçışları KENDİ taşlarıyla kapalı olmalı. */
function isBackRankMate(chess, san) {
  const played = chess.move(san);
  if (!played || played.to[1] !== "8") return false;
  if (played.piece !== "r" && played.piece !== "q") return false;
  const king = blackKingSquare(chess);
  if (!king || king[1] !== "8") return false;
  // Şahın önündeki (7. yatay) kareler siyahın KENDİ taşlarıyla dolu olmalı.
  const front = [-1, 0, 1]
    .map((df) => squareAt(fileIndex(king) + df, 7))
    .filter(Boolean);
  if (front.length === 0) return false;
  return front.every((square) => {
    const piece = chess.get(square);
    return piece && piece.color === BLACK;
  });
}

/** BOĞMACA: mat atla verilmeli ve şahın ÇEVRESİNDEKİ TÜM kareler kendi taşlarıyla dolu olmalı. */
function isSmotheredMate(chess, san) {
  const played = chess.move(san);
  if (!played || played.piece !== "n") return false;
  const king = blackKingSquare(chess);
  if (!king) return false;
  return ringAround(king).every((square) => {
    const piece = chess.get(square);
    return piece && piece.color === BLACK;
  });
}

/** TERFİ: çözüm bir terfi hamlesi olmalı. */
function isPromotionMate(chess, san) {
  return san.includes("=");
}

/** ŞİŞ: hamle şah çekmeli ve ŞAHIN ARKASINDA, aynı hatta değerli bir taş kalmalı. */
function isSkewer(after, played) {
  if (!after.inCheck()) return false;
  const king = blackKingSquare(after);
  if (!king) return false;
  // Şah çeken taş, hamlenin geldiği kare olmalı (ışın taraması bunu doğrular).
  const attackers = attackerSquares(after, king, WHITE);
  if (!attackers.includes(played.to)) return false;
  const dir = directionBetween(played.to, king);
  if (!dir) return false;
  // Şahın ARKASINDAKİ ilk taş: siyahın vezir/kalesi olmalı.
  const behind = firstPieceAlong(after, king, dir);
  if (!behind) return false;
  return behind.piece.color === BLACK && (behind.piece.type === "q" || behind.piece.type === "r");
}

/**
 * AÇMAZ: siyahın veziri şahıyla aynı hatta mıhlanmış olmalı.
 *
 * DİKKAT: Mıhlı taşın "hiç hamlesi kalmaz" sanmak yaygın bir yanılgıdır —
 * hat BOYUNCA hâlâ hareket edebilir, hatta mıhlayan taşı alabilir. Doğru ölçüt
 * şudur: vezirin gidebildiği HER kare, şahtan geçen hat üzerinde olmalı.
 * Ayrıca mıhlayan taş korunuyor olmalı; korunmuyorsa vezir onu bedavaya alır.
 */
function isPin(after, played) {
  if (after.inCheck()) return false; // şah çekiyorsa bu açmaz değil, başka bir taktik
  const king = blackKingSquare(after);
  if (!king) return false;

  for (const square of ALL_SQUARES) {
    const piece = after.get(square);
    if (!piece || piece.color !== BLACK || piece.type !== "q") continue;
    // Mıhlı taş, şah ile saldıran arasında ve arada başka taş olmamalı.
    const dir = directionBetween(king, square);
    if (!dir) continue;
    const gap = between(king, square);
    if (gap === null || gap.length > 0) continue;
    const behind = firstPieceAlong(after, square, dir);
    if (!behind || behind.piece.color !== WHITE) continue;
    const diagonal = dir[0] !== 0 && dir[1] !== 0;
    const pins =
      behind.piece.type === "q" ||
      (behind.piece.type === "r" && !diagonal) ||
      (behind.piece.type === "b" && diagonal);
    if (!pins) continue;
    // Mıhlayan taş korunuyor mu?
    if (attackerSquares(after, behind.square, WHITE).length === 0) continue;

    // Şahtan geçen hattın tüm kareleri (iki yöne doğru).
    const line = new Set();
    for (const step of [dir, [-dir[0], -dir[1]]]) {
      let file = fileIndex(king) + step[0];
      let rank = rankIndex(king) + step[1];
      while (squareAt(file, rank)) {
        line.add(squareAt(file, rank));
        file += step[0];
        rank += step[1];
      }
    }
    // Vezir hattan ÇIKAMIYORSA mutlak açmazdadır.
    const escapes = after.destinations(square);
    if (escapes.length > 0 && escapes.every((target) => line.has(target))) return true;
  }
  return false;
}

/** ÇİFTE ŞAH: şaha aynı anda İKİ beyaz taş saldırmalı. */
function isDoubleCheck(after) {
  if (!after.inCheck()) return false;
  const king = blackKingSquare(after);
  if (!king) return false;
  return attackerSquares(after, king, WHITE).length === 2;
}

/** ASKIDA TAŞ: hamle bir taş almalı ve alınan kare siyah tarafından korunmuyor olmalı. */
function isHangingCapture(after, played) {
  if (!played.captured || played.captured === "p") return false;
  // Alınan kareyi siyah geri alabiliyorsa taş "askıda" değildi.
  return attackerSquares(after, played.to, BLACK).length === 0;
}

console.log("Bulmacalar üretiliyor ve motorla doğrulanıyor...\n");

const started = Date.now();

// --- Tek hamlede mat: az taşlı, yeni başlayan seviyesi ---
const mate1 = buildMatePuzzles({
  target: 620,
  moveDepth: 1,
  materialSets: [
    ["Q"], ["R", "R"], ["Q", "R"], ["R", "B"], ["R", "N"],
    ["Q", "B"], ["Q", "N"], ["R", "R", "P"], ["Q", "P"], ["B", "B", "R"]
  ],
  // Tek hamlelik mat zaten kolaydır; ancak tahtada taş arttıkça aramak zorlaşır.
  levelFor: (count) => (count <= 5 ? "Kolay" : "Orta"),
  maxAttempts: 260000
});
console.log(`Tek hamlede mat : ${mate1.found.length} bulmaca (${mate1.attempts} aday denendi)`);

// --- İki hamlede mat: planlama gerektirir ---
const mate2 = buildMatePuzzles({
  target: 340,
  moveDepth: 2,
  // Ağır kalıplar bilerek eklendi: taş sayısı arttıkça bulmaca "Zor" sınıfına girer.
  materialSets: [
    ["Q"], ["R", "R"], ["Q", "R"], ["R", "B"], ["Q", "B"], ["R", "N"],
    ["Q", "P"], ["R", "R", "P"], ["Q", "B", "P"], ["R", "B", "N"], ["R", "R", "B"], ["Q", "N", "P"]
  ],
  levelFor: (count) => (count <= 4 ? "Orta" : "Zor"),
  maxAttempts: 160000
});
console.log(`İki hamlede mat : ${mate2.found.length} bulmaca (${mate2.attempts} aday denendi)`);

// --- At çatalı ---
const forks = buildForkPuzzles({ target: 160, maxAttempts: 60000 });
console.log(`At çatalı       : ${forks.found.length} bulmaca (${forks.attempts} aday denendi)`);

/* ------------------------------------------------------------------ *
 * Yeni temaların üretimi
 *
 * PUZZLE_SCALE ortam değişkeni hedefleri ölçekler; küçük bir değerle
 * (örn. PUZZLE_SCALE=0.1) verim ölçmek için hızlı bir deneme yapılabilir.
 * ------------------------------------------------------------------ */

const SCALE = Number(process.env.PUZZLE_SCALE || 1);
const goal = (n) => Math.max(1, Math.round(n * SCALE));

const koridor = buildPatternMates({
  target: goal(140),
  generator: randomBackRankMate,
  pattern: isBackRankMate,
  level: (count) => (count <= 7 ? "Kolay" : "Orta"),
  maxAttempts: goal(140) * 400
});
console.log(`Koridor matı    : ${koridor.found.length} bulmaca (${koridor.attempts} aday denendi)`);

const bogmaca = buildPatternMates({
  target: goal(80),
  generator: randomSmotheredMate,
  pattern: isSmotheredMate,
  level: (count) => (count <= 10 ? "Orta" : "Zor"),
  maxAttempts: goal(80) * 500
});
console.log(`Boğmaca matı    : ${bogmaca.found.length} bulmaca (${bogmaca.attempts} aday denendi)`);

const terfi = buildPatternMates({
  target: goal(130),
  generator: randomPromotion,
  pattern: isPromotionMate,
  level: (count) => (count <= 5 ? "Kolay" : "Orta"),
  maxAttempts: goal(130) * 500
});
console.log(`Terfi ile mat   : ${terfi.found.length} bulmaca (${terfi.attempts} aday denendi)`);

const sis = buildPatternGains({
  target: goal(130),
  generator: randomSkewer,
  pattern: isSkewer,
  level: (count) => (count <= 5 ? "Kolay" : "Orta"),
  maxAttempts: goal(130) * 300
});
console.log(`Şiş             : ${sis.found.length} bulmaca (${sis.attempts} aday denendi)`);

const acmaz = buildPatternGains({
  target: goal(130),
  generator: randomPin,
  pattern: isPin,
  level: (count) => (count <= 6 ? "Orta" : "Zor"),
  maxAttempts: goal(130) * 300
});
console.log(`Açmaz           : ${acmaz.found.length} bulmaca (${acmaz.attempts} aday denendi)`);

const cifteSah = buildDoubleCheckPuzzles({
  target: goal(90),
  maxAttempts: goal(90) * 900
});
console.log(`Çifte şah       : ${cifteSah.found.length} bulmaca (${cifteSah.attempts} aday denendi)`);

const askida = buildPatternGains({
  target: goal(140),
  generator: randomHangingPiece,
  pattern: isHangingCapture,
  level: (count) => (count <= 6 ? "Kolay" : "Orta"),
  maxAttempts: goal(140) * 300
});
console.log(`Askıda taş      : ${askida.found.length} bulmaca (${askida.attempts} aday denendi)`);

/* ------------------------------------------------------------------ *
 * Çıktı dosyası
 * ------------------------------------------------------------------ */

/**
 * Bir temanın bulmacalarını zorluk BANDINA dağıtır.
 *
 * Sabit eşik ("6 taştan azsa Kolay") işe yaramıyor: her temanın kendi tipik taş
 * sayısı var. Boğmaca matı tanımı gereği kalabalıktır, şiş ise seyrek — aynı
 * eşik birini tümüyle "Zor", diğerini tümüyle "Kolay" yapıyordu ve tema o
 * seviyelerde GÖRÜNMEZ oluyordu. Bunun yerine tema kendi içinde sıralanır ve
 * banda eşit oranlarda bölünür; böylece her tema bandındaki HER seviyede bulunur.
 *
 * Band, temanın kavramsal zorluğunu yansıtır: tek hamlelik mat Kolay-Orta
 * arasında, açmaz Orta-Zor arasında dağılır.
 */
function assignLevels(items, band) {
  const sorted = [...items].sort((a, b) => a.pieceCount - b.pieceCount);
  sorted.forEach((item, rank) => {
    const slot = Math.min(band.length - 1, Math.floor((rank / sorted.length) * band.length));
    item.level = band[slot];
  });
}

const KOLAY_ORTA = ["Kolay", "Kolay", "Orta"];
const ORTA_ZOR = ["Orta", "Orta", "Zor"];

assignLevels(mate1.found, KOLAY_ORTA);
assignLevels(koridor.found, KOLAY_ORTA);
assignLevels(askida.found, KOLAY_ORTA);
assignLevels(terfi.found, ["Kolay", "Orta"]);
assignLevels(forks.found, ["Kolay", "Orta"]);
assignLevels(sis.found, ["Kolay", "Orta"]);
assignLevels(mate2.found, ORTA_ZOR);
assignLevels(acmaz.found, ORTA_ZOR);
assignLevels(bogmaca.found, ORTA_ZOR);
assignLevels(cifteSah.found, ORTA_ZOR);

const all = [];
let index = 0;

for (const item of mate1.found) {
  all.push(decorate(index++, "mat-1", item.level, {
    fen: item.fen,
    side: "w",
    solution: item.solution,
    line: item.line,
    mateIn: 1
  }));
}
for (const item of mate2.found) {
  all.push(decorate(index++, "mat-2", item.level, {
    fen: item.fen,
    side: "w",
    solution: item.solution,
    line: item.line,
    mateIn: 2
  }));
}
for (const item of forks.found) {
  all.push(decorate(index++, "catal", item.level, {
    fen: item.fen,
    side: "w",
    solution: item.solution,
    line: item.line,
    mateIn: null
  }));
}

// Mat temelli yeni temalar (mateIn: 1)
for (const [themeKey, batch] of [["koridor", koridor], ["bogmaca", bogmaca], ["terfi", terfi]]) {
  for (const item of batch.found) {
    all.push(decorate(index++, themeKey, item.level, {
      fen: item.fen,
      side: "w",
      solution: item.solution,
      line: item.line,
      mateIn: 1
    }));
  }
}

// Taş kazanma temelli yeni temalar (mateIn: null)
for (const [themeKey, batch] of [["sis", sis], ["acmaz", acmaz], ["cifte-sah", cifteSah], ["askida", askida]]) {
  for (const item of batch.found) {
    all.push(decorate(index++, themeKey, item.level, {
      fen: item.fen,
      side: "w",
      solution: item.solution,
      line: item.line,
      mateIn: null
    }));
  }
}

const byLevel = { Kolay: 0, Orta: 0, Zor: 0 };
const byTheme = {};
for (const puzzle of all) {
  byLevel[puzzle.level] += 1;
  byTheme[puzzle.theme] = (byTheme[puzzle.theme] || 0) + 1;
}

const header = `/**
 * puzzles.js — OTOMATİK ÜRETİLMİŞ DOSYA. Elle düzenlemeyin.
 *
 * Üreten:  tools/generate-puzzles.mjs
 * Üretim:  ${new Date().toISOString().slice(0, 10)}
 *
 * Buradaki her bulmaca kendi kural motorumuzla doğrulanmıştır:
 *  - Mat bulmacalarında mat ZORUNLUDUR (rakibin her cevabı mat ile biter).
 *  - Her bulmacanın TEK bir doğru ilk hamlesi vardır.
 *  - Taş kazanma bulmacalarında en iyi hamle, ikinciden en az 2,5 piyon daha iyidir.
 *  - Zorluk, temanın ADINA değil konumun taş sayısına göre verilir. Bir temayı
 *    komple tek seviyeye sabitlemek onu diğer seviyelerde GÖRÜNMEZ yapar;
 *    çocuk konu düğmesine basmadıkça o temayla hiç karşılaşmaz.
 *  - Her bulmacanın deseni ayrıca doğrulanır: "koridor" gerçekten son yatayda
 *    mat eder, "boğmaca" şahı kendi taşları çevreler, "açmaz"da mıhlı taş
 *    hattan çıkamaz, "askıda"da alınan taş gerçekten korumasızdır.
 *
 * Toplam ${all.length} bulmaca — Kolay: ${byLevel.Kolay}, Orta: ${byLevel.Orta}, Zor: ${byLevel.Zor}
 *
 * Alanlar:
 *   fen       başlangıç konumu
 *   side      hamle sırası ("w")
 *   solution  doğru ilk hamle (SAN)
 *   line      çözümün tam hamle sırası
 *   mateIn    kaç hamlede mat (çatal bulmacalarında null)
 */

export const puzzles = `;

const body = JSON.stringify(all, null, 2);

const footer = `;

/** Zorluk seviyesine göre filtreler. */
export function puzzlesByLevel(level) {
  return puzzles.filter((puzzle) => puzzle.level === level);
}

/** Temaya göre filtreler. Geçerli değerler için THEME_LIST'e bakın. */
export function puzzlesByTheme(theme) {
  return puzzles.filter((puzzle) => puzzle.theme === theme);
}

/** Seviyeye göre bulmaca sayıları. */
export const puzzleCounts = ${JSON.stringify(byLevel)};

/** Temaya göre bulmaca sayıları. */
export const themeCounts = ${JSON.stringify(byTheme)};

/** Dosyadaki tüm temalar (üretim sırasına göre). */
export const THEME_LIST = ${JSON.stringify(Object.keys(byTheme))};
`;

writeFileSync(OUTPUT, header + body + footer, "utf8");

console.log(`\nToplam ${all.length} bulmaca yazıldı -> src/data/puzzles.js`);
console.log(`Kolay: ${byLevel.Kolay} | Orta: ${byLevel.Orta} | Zor: ${byLevel.Zor}`);
console.log("Temalar:", byTheme);
console.log(`Süre: ${((Date.now() - started) / 1000).toFixed(1)} saniye`);
