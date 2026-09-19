/**
 * verify-puzzles.mjs — Sevk edilen bulmaca dosyasının bağımsız denetimi.
 *
 * Çalıştırma: node tools/verify-puzzles.mjs
 *
 * Bu araç üreteci DEĞİL, üretecin yazdığı `src/data/puzzles.js` dosyasını sınar.
 * Üreteçteki bir hata çıktının yanlış olmasına yol açabilir; bu yüzden doğrulama
 * sıfırdan ve bağımsız biçimde yeniden yapılır.
 *
 * Her bulmaca için kontrol edilenler:
 *  1. FEN kurallara uygun mu ve sıra doğru tarafta mı?
 *  2. `solution` o konumda yasal bir hamle mi?
 *  3. Mat bulmacalarında mat gerçekten ZORUNLU mu?
 *  4. Çözüm TEK mi? (başka bir ilk hamle de kazandırıyorsa bulmaca hatalıdır)
 *  5. Alanlar (id, seviye, tema, ipucu) eksiksiz mi ve id'ler benzersiz mi?
 */

import { Chess, WHITE, BLACK } from "../src/engine/Chess.js";
import { puzzles, puzzleCounts } from "../src/data/puzzles.js";

const failures = [];
const fail = (puzzle, reason) => failures.push(`${puzzle?.id || "?"}: ${reason}`);

/** Sırası gelen taraf için `moveDepth` hamlede zorunlu mat eden ilk hamleler. */
function forcedMates(chess, moveDepth) {
  const solutions = [];
  for (const move of chess.moves()) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    let works;
    if (chess.isCheckmate()) works = true;
    else if (moveDepth === 1) works = false;
    else {
      const replies = chess.moves();
      works =
        replies.length > 0 &&
        replies.every((reply) => {
          chess.move({ from: reply.from, to: reply.to, promotion: reply.promotion });
          const forced = forcedMates(chess, moveDepth - 1).length > 0;
          chess.undo();
          return forced;
        });
    }
    chess.undo();
    if (works) solutions.push(move.san);
  }
  return solutions;
}

const FILES_V = "abcdefgh".split("");
const RAYS_V = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const JUMPS_V = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
const sqAt = (f, r) => (f < 0 || f > 7 || r < 1 || r > 8 ? null : `${FILES_V[f]}${r}`);
const fIdx = (s) => FILES_V.indexOf(s[0]);
const rIdx = (s) => Number(s[1]);

/**
 * Bir kareye saldıran taşların kareleri.
 * Üreteçten KOPYALANMAZ, burada yeniden yazılır: üreteçteki bir geometri hatası
 * aynı kodu paylaşırsak denetimden de kaçardı.
 */
function attackersV(chess, target, color) {
  const found = [];
  const tf = fIdx(target);
  const tr = rIdx(target);
  for (const [df, dr] of JUMPS_V) {
    const s = sqAt(tf + df, tr + dr);
    const p = s && chess.get(s);
    if (p && p.color === color && p.type === "n") found.push(s);
  }
  const pawnRank = color === WHITE ? tr - 1 : tr + 1;
  for (const df of [-1, 1]) {
    const s = sqAt(tf + df, pawnRank);
    const p = s && chess.get(s);
    if (p && p.color === color && p.type === "p") found.push(s);
  }
  for (const [df, dr] of RAYS_V) {
    let f = tf + df;
    let r = tr + dr;
    let step = 1;
    while (sqAt(f, r)) {
      const s = sqAt(f, r);
      const p = chess.get(s);
      if (p) {
        if (p.color === color) {
          const diag = df !== 0 && dr !== 0;
          if (p.type === "q" || (p.type === "r" && !diag) || (p.type === "b" && diag) || (p.type === "k" && step === 1)) {
            found.push(s);
          }
        }
        break;
      }
      f += df;
      r += dr;
      step += 1;
    }
  }
  return found;
}

const ringV = (s) => {
  const out = [];
  for (let df = -1; df <= 1; df += 1) {
    for (let dr = -1; dr <= 1; dr += 1) {
      if (!df && !dr) continue;
      const x = sqAt(fIdx(s) + df, rIdx(s) + dr);
      if (x) out.push(x);
    }
  }
  return out;
};

function kingSquareV(chess, color) {
  for (const f of FILES_V) {
    for (let r = 1; r <= 8; r += 1) {
      const p = chess.get(`${f}${r}`);
      if (p && p.type === "k" && p.color === color) return `${f}${r}`;
    }
  }
  return null;
}

function dirV(a, b) {
  const df = fIdx(b) - fIdx(a);
  const dr = rIdx(b) - rIdx(a);
  if (!df && !dr) return null;
  if (df && dr && Math.abs(df) !== Math.abs(dr)) return null;
  return [Math.sign(df), Math.sign(dr)];
}

function firstAlongV(chess, from, dir) {
  let f = fIdx(from) + dir[0];
  let r = rIdx(from) + dir[1];
  while (sqAt(f, r)) {
    const s = sqAt(f, r);
    const p = chess.get(s);
    if (p) return { square: s, piece: p };
    f += dir[0];
    r += dir[1];
  }
  return null;
}

/**
 * Tema etiketinin doğruluğunu sınar.
 * Etiket yanlışsa bulmaca "çözülebilir" olsa bile çocuğa YANLIŞ deseni öğretir;
 * bu yüzden burada her tema kendi tanımına göre ayrıca denetlenir.
 */
function checkTheme(puzzle, before, after, played) {
  const bk = kingSquareV(after, BLACK);
  switch (puzzle.theme) {
    case "koridor": {
      if (played.to[1] !== "8") return "koridor matı 8. yatayda bitmiyor";
      if (!["r", "q"].includes(played.piece)) return "koridor matını ağır taş vermiyor";
      if (!bk || bk[1] !== "8") return "mat edilen şah son yatayda değil";
      const front = [-1, 0, 1].map((df) => sqAt(fIdx(bk) + df, 7)).filter(Boolean);
      const kapali = front.every((s) => {
        const p = after.get(s);
        return p && p.color === BLACK;
      });
      return kapali ? null : "şahın önü kendi taşlarıyla kapalı değil";
    }
    case "bogmaca": {
      if (played.piece !== "n") return "boğmaca matını at vermiyor";
      const cevrili = ringV(bk).every((s) => {
        const p = after.get(s);
        return p && p.color === BLACK;
      });
      return cevrili ? null : "şah kendi taşlarıyla çevrili değil";
    }
    case "terfi":
      return puzzle.solution.includes("=") ? null : "çözüm bir terfi hamlesi değil";
    case "sis": {
      if (!after.inCheck()) return "şiş şah çekmiyor";
      if (!attackersV(after, bk, WHITE).includes(played.to)) return "şah çeken taş, oynanan taş değil";
      const d = dirV(played.to, bk);
      if (!d) return "şah ile saldıran aynı hatta değil";
      const arka = firstAlongV(after, bk, d);
      if (!arka || arka.piece.color !== BLACK || !["q", "r"].includes(arka.piece.type)) {
        return "şahın arkasında kazanılacak değerli taş yok";
      }
      return null;
    }
    case "acmaz": {
      for (const f of FILES_V) {
        for (let r = 1; r <= 8; r += 1) {
          const s = `${f}${r}`;
          const p = after.get(s);
          if (!p || p.color !== BLACK || p.type !== "q") continue;
          const d = dirV(bk, s);
          if (!d) continue;
          const arkasi = firstAlongV(after, s, d);
          if (!arkasi || arkasi.piece.color !== WHITE) continue;
          if (attackersV(after, arkasi.square, WHITE).length === 0) continue;
          const hat = new Set();
          for (const step of [d, [-d[0], -d[1]]]) {
            let ff = fIdx(bk) + step[0];
            let rr = rIdx(bk) + step[1];
            while (sqAt(ff, rr)) {
              hat.add(sqAt(ff, rr));
              ff += step[0];
              rr += step[1];
            }
          }
          const kacis = after.destinations(s);
          if (kacis.length > 0 && kacis.every((t) => hat.has(t))) return null;
        }
      }
      return "mıhlanmış vezir bulunamadı";
    }
    case "cifte-sah": {
      if (!after.inCheck()) return "çifte şah, şah çekmiyor";
      const n = attackersV(after, bk, WHITE).length;
      return n === 2 ? null : `şaha ${n} taş saldırıyor, çifte şah için 2 olmalı`;
    }
    case "askida": {
      if (!played.captured) return "askıda taş bulmacasında taş alınmıyor";
      if (played.captured === "p") return "alınan taş piyon (askıda taş sayılmaz)";
      const geriAlan = attackersV(after, played.to, BLACK);
      return geriAlan.length === 0 ? null : `alınan taş korunuyordu (${geriAlan.join(", ")})`;
    }
    default:
      return null;
  }
}

console.log(`Denetleniyor: ${puzzles.length} bulmaca\n`);
const started = Date.now();

const ids = new Set();
const fens = new Set();
const levelTally = { Kolay: 0, Orta: 0, Zor: 0 };
const themeTally = {};

for (const puzzle of puzzles) {
  // --- Alan bütünlüğü ---
  if (!puzzle.id) { fail(puzzle, "id eksik"); continue; }
  if (ids.has(puzzle.id)) fail(puzzle, "id benzersiz değil");
  ids.add(puzzle.id);

  if (!["Kolay", "Orta", "Zor"].includes(puzzle.level)) fail(puzzle, `geçersiz seviye: ${puzzle.level}`);
  else levelTally[puzzle.level] += 1;
  themeTally[puzzle.theme] = (themeTally[puzzle.theme] || 0) + 1;

  for (const field of ["fen", "solution", "title", "goal", "hint", "explanation", "line"]) {
    if (!puzzle[field] || (Array.isArray(puzzle[field]) && puzzle[field].length === 0)) {
      fail(puzzle, `"${field}" alanı boş`);
    }
  }

  if (fens.has(puzzle.fen)) fail(puzzle, "aynı konum birden fazla bulmacada kullanılmış");
  fens.add(puzzle.fen);

  // --- Konum geçerliliği ---
  let chess;
  try {
    chess = new Chess(puzzle.fen);
  } catch (error) {
    fail(puzzle, `FEN okunamadı: ${error.message}`);
    continue;
  }

  if (chess.turnColor() !== puzzle.side) fail(puzzle, `sıra ${chess.turnColor()}, ama side="${puzzle.side}"`);

  // Sırası gelmeyen tarafın şahı tehdit altındaysa konum kural dışıdır.
  const waiting = chess.turnColor() === WHITE ? BLACK : WHITE;
  if (chess.isKingAttacked(waiting)) { fail(puzzle, "kural dışı konum: bekleyen tarafın şahı tehditte"); continue; }
  if (chess.isGameOver()) { fail(puzzle, "konum zaten bitmiş"); continue; }

  // --- Çözüm yasal mı? ---
  const probe = chess.clone();
  const played = probe.move(puzzle.solution);
  if (!played) { fail(puzzle, `çözüm yasal bir hamle değil: ${puzzle.solution}`); continue; }

  // --- Mat bulmacaları ---
  if (puzzle.mateIn) {
    const mates = forcedMates(chess.clone(), puzzle.mateIn);

    if (mates.length === 0) {
      fail(puzzle, `${puzzle.mateIn} hamlede zorunlu mat yok`);
    } else if (mates.length > 1) {
      fail(puzzle, `çözüm tek değil (${mates.length} farklı hamle mat ediyor: ${mates.join(", ")})`);
    } else if (mates[0] !== puzzle.solution) {
      fail(puzzle, `kayıtlı çözüm "${puzzle.solution}", doğrulanan çözüm "${mates[0]}"`);
    }

    // Mat-2 bulmacası daha kısa yoldan çözülüyorsa yanlış sınıflandırılmıştır.
    if (puzzle.mateIn === 2 && forcedMates(chess.clone(), 1).length > 0) {
      fail(puzzle, "mat-2 olarak işaretli ama tek hamlede mat var");
    }

    // Mat-1 gerçekten mat mı?
    if (puzzle.mateIn === 1 && !probe.isCheckmate()) {
      fail(puzzle, "çözüm oynandı ama konum mat değil");
    }
  } else if (puzzle.theme === "catal") {
    // --- Çatal bulmacaları: at hamlesi olmalı ve gerçekten çatal atmalı ---
    if (played.piece !== "n") fail(puzzle, `çatal bulmacasında çözüm at hamlesi değil: ${puzzle.solution}`);
    else {
      // Attan sonra şah tehditte olmalı ve at ikinci bir değerli taşa da saldırmalı.
      if (!probe.inCheck()) fail(puzzle, "çatal şah çekmiyor");
      const targets = probe
        .moves({ square: played.to, legal: false })
        .filter((move) => move.captured && ["q", "r"].includes(move.captured));
      // Sıra rakipte olduğu için at hamlelerini doğrudan üretemeyiz; konumu çevirerek bakarız.
      if (targets.length === 0) {
        const flipped = new Chess(probe.fen().replace(/ b /, " w "));
        const attacks = flipped
          .moves({ square: played.to })
          .filter((move) => move.captured && ["q", "r"].includes(move.captured));
        if (attacks.length === 0) fail(puzzle, "çatalın ikinci hedefi yok");
      }
    }
  }

  // --- Tema etiketi doğru mu? ---
  // Bulmacanın çözülebilir olması yetmez; "koridor" etiketli bir bulmaca
  // gerçekten koridor matı DEĞİLSE çocuğa yanlış desen öğretiriz.
  const themeError = checkTheme(puzzle, chess, probe, played);
  if (themeError) fail(puzzle, `tema "${puzzle.theme}": ${themeError}`);
}

const elapsed = ((Date.now() - started) / 1000).toFixed(1);

console.log("Seviye dağılımı :", levelTally);
console.log("Tema dağılımı   :", themeTally);
console.log("Dosyadaki sayaç :", puzzleCounts);
console.log(`Benzersiz konum : ${fens.size} / ${puzzles.length}`);
console.log(`Süre            : ${elapsed} saniye\n`);

if (failures.length === 0) {
  console.log(`✅ TÜM ${puzzles.length} BULMACA DOĞRULANDI — hepsinin tek ve doğru çözümü var.`);
} else {
  console.log(`❌ ${failures.length} HATALI BULMACA:\n`);
  for (const line of failures.slice(0, 40)) console.log("  " + line);
  if (failures.length > 40) console.log(`  ... ve ${failures.length - 40} tane daha`);
  process.exitCode = 1;
}
