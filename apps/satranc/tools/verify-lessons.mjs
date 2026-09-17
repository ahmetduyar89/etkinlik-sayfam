/**
 * verify-lessons.mjs — Ders verilerinin denetimi.
 *
 * Çalıştırma: node tools/verify-lessons.mjs
 *
 * Ders dosyalarındaki FEN'ler ve hamleler ELLE yazılmıştır; yani hata yapmanın
 * en kolay olduğu yer burasıdır. Bu araç hepsini gerçek kural motoruyla dener:
 *
 *  - Her FEN okunabiliyor mu ve kurallara uygun mu?
 *  - Her "çözüm" o konumda yasal bir hamle mi?
 *  - "bul" derslerinde çözüm gerçekten en iyi hamle mi? (motor görüşü)
 *  - Mat iddiası olan derslerde gerçekten mat oluyor mu?
 *  - Görev karelerine (hedef modu) o taşla gerçekten gidilebiliyor mu?
 *  - Açılış/kural dizileri baştan sona oynanabiliyor mu?
 *  - Quiz cevabı şıklar arasında mı?
 */

import { Chess, WHITE, BLACK } from "../src/engine/Chess.js";
import { ai } from "../src/engine/Ai.js";
import { pieceLessons } from "../src/data/pieceLessons.js";
import { ruleLessons } from "../src/data/ruleLessons.js";
import { openingLines } from "../src/data/openingLines.js";
import { tacticLessons } from "../src/data/tacticLessons.js";
import { endgameLessons } from "../src/data/endgameLessons.js";

const problems = [];
const notes = [];
const fail = (where, reason) => problems.push(`${where}: ${reason}`);
const note = (where, reason) => notes.push(`${where}: ${reason}`);

/** FEN'i yükler; kurallara uygun değilse null döner. */
function load(where, fen) {
  let chess;
  try {
    chess = new Chess(fen);
  } catch (error) {
    fail(where, `FEN okunamadı — ${error.message}`);
    return null;
  }
  const waiting = chess.turnColor() === WHITE ? BLACK : WHITE;
  if (chess.isKingAttacked(waiting)) {
    fail(where, "kural dışı konum: sırası GELMEYEN tarafın şahı tehdit altında");
    return null;
  }
  if (chess.moves().length === 0 && !chess.isGameOver()) {
    fail(where, "konumda hiç yasal hamle yok");
    return null;
  }
  return chess;
}

/** Bir SAN hamlesinin yasal olup olmadığını sınar ve oynanmış konumu döndürür. */
function tryMove(where, chess, san, label = "çözüm") {
  const probe = chess.clone();
  const played = probe.move(san);
  if (!played) {
    fail(where, `${label} "${san}" bu konumda yasal değil. Yasal hamleler: ${chess.moves().map((m) => m.san).join(" ")}`);
    return null;
  }
  return { probe, played };
}

/** "bul" tipi bir dersin çözümünü motorun görüşüyle karşılaştırır. */
function checkBestMove(where, chess, san) {
  const results = ai.search(chess.clone(), "orta");
  if (results.length === 0) return;
  const probe = chess.clone();
  const target = probe.move(san);
  if (!target) return;

  const best = results[0];
  const bestProbe = chess.clone();
  const bestPlayed = bestProbe.move({
    from: "abcdefgh"[best.move.from & 15] + (8 - (best.move.from >> 4)),
    to: "abcdefgh"[best.move.to & 15] + (8 - (best.move.to >> 4)),
    promotion: best.move.promotion
  });

  if (bestPlayed && bestPlayed.san !== san) {
    // Hata değil ama dikkat edilmeli: çocuk motorun tercihini oynarsa "yanlış" duyar.
    note(where, `motor "${bestPlayed.san}" hamlesini tercih ediyor, ders "${san}" bekliyor`);
  }
}

console.log("Ders verileri denetleniyor...\n");

/* ------------------------------------------------------------------ *
 * Taş dersleri
 * ------------------------------------------------------------------ */

for (const lesson of pieceLessons) {
  const base = `taş/${lesson.id}`;

  const explore = load(`${base}.exploreFen`, lesson.exploreFen);
  if (explore) {
    // Keşif konumunda o taş gerçekten var mı ve oynayabiliyor mu?
    const hasPiece = explore
      .moves()
      .some((move) => move.piece === lesson.id.replace("knight", "n").replace("bishop", "b")
        .replace("rook", "r").replace("queen", "q").replace("king", "k").replace("pawn", "p"));
    if (!hasPiece) fail(`${base}.exploreFen`, `konumda oynayabilen ${lesson.name} yok`);
  }

  for (const [index, challenge] of lesson.challenges.entries()) {
    const where = `${base}.challenge[${index}]`;
    if (!explore) continue;
    const destinations = explore.destinations(challenge.from);
    if (destinations.length === 0) {
      fail(where, `${challenge.from} karesinde oynayabilen taş yok`);
    } else if (!destinations.includes(challenge.target)) {
      fail(where, `${challenge.from} → ${challenge.target} yasal değil. Gidilebilenler: ${destinations.join(" ")}`);
    }
  }

  // --- Engel dersi: taş gerçekten kısıtlanmış mı? ---
  const obstacle = load(`${base}.obstacleFen`, lesson.obstacleFen);
  if (obstacle && !lesson.obstacleNote) {
    fail(`${base}.obstacleNote`, "engel dersinin açıklaması yok");
  }

  // --- Yolculuk: hedefe ulaşılabiliyor mu ve `par` doğru mu? ---
  const journey = lesson.journey;
  if (!journey) {
    fail(base, "yolculuk etkinliği tanımlanmamış");
  } else {
    const start = load(`${base}.journey`, journey.fen);
    if (start) {
      if (!start.get(journey.from)) {
        fail(`${base}.journey`, `${journey.from} karesinde taş yok`);
      }
      const shortest = shortestPath(start, journey.from, journey.target);
      if (shortest === null) {
        fail(`${base}.journey`, `${journey.from} → ${journey.target} hiçbir şekilde ulaşılamıyor`);
      } else if (shortest !== journey.par) {
        // `par` yanlışsa çocuk ya asla "mükemmel" alamaz ya da hep alır.
        fail(`${base}.journey`, `par ${journey.par} yazılmış ama en kısa yol ${shortest} hamle`);
      }
    }
  }

  const capture = load(`${base}.captureFen`, lesson.captureFen);
  if (capture) {
    const result = tryMove(`${base}.captureSolution`, capture, lesson.captureSolution);
    if (result && !result.played.captured) {
      fail(`${base}.captureSolution`, `"${lesson.captureSolution}" bir taş almıyor (alma dersi)`);
    }
  }

  if (!Array.isArray(lesson.quizzes) || lesson.quizzes.length === 0) {
    fail(`${base}.quizzes`, "quiz sorusu yok");
  } else {
    for (const [index, quiz] of lesson.quizzes.entries()) {
      if (!quiz.options.includes(quiz.answer)) {
        fail(`${base}.quizzes[${index}]`, `doğru cevap "${quiz.answer}" şıklar arasında yok`);
      }
      if (new Set(quiz.options).size !== quiz.options.length) {
        fail(`${base}.quizzes[${index}]`, "şıklarda tekrar var");
      }
    }
  }
}

/**
 * Bir taşı `from` karesinden `target` karesine götüren EN KISA hamle sayısını
 * genişlik öncelikli aramayla bulur. Yolculuk etkinliğinin `par` değerini
 * doğrulamak için kullanılır. Ulaşılamıyorsa null döner.
 */
function shortestPath(position, from, target, maxDepth = 8) {
  const startFen = position.fen();
  const seen = new Set([startFen]);
  let frontier = [startFen];

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const next = [];
    for (const fen of frontier) {
      const probe = new Chess(fen);
      for (const candidate of probe.moves()) {
        const branch = new Chess(fen);
        const played = branch.move({ from: candidate.from, to: candidate.to, promotion: candidate.promotion });
        if (!played) continue;
        if (played.to === target) return depth;

        // Sıra karşı tarafa geçmesin diye tek taraflı yürüyüş kurgusu:
        // konumu yeniden beyazın sırasıyla kurarız.
        const nextFen = branch.fen().replace(/ b /, " w ");
        if (seen.has(nextFen)) continue;
        seen.add(nextFen);
        next.push(nextFen);
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Kural dersleri
 * ------------------------------------------------------------------ */

for (const lesson of ruleLessons) {
  const base = `kural/${lesson.id}`;
  if (!lesson.mode) continue; // yalnızca metin

  const chess = load(`${base}.fen`, lesson.fen);
  if (!chess) continue;

  if (lesson.mode === "bul") {
    const result = tryMove(base, chess, lesson.solution);
    if (result) {
      if (lesson.solution.includes("#") && !result.probe.isCheckmate()) {
        fail(base, `"${lesson.solution}" mat olarak yazılmış ama konum mat değil`);
      }
      if (lesson.solution.includes("+") && !result.probe.inCheck()) {
        fail(base, `"${lesson.solution}" şah olarak yazılmış ama şah çekmiyor`);
      }
      checkBestMove(base, chess, lesson.solution);
    }
  }

  if (lesson.mode === "sira") {
    let work = chess.clone();
    for (const [index, san] of lesson.line.entries()) {
      const played = work.move(san);
      if (!played) {
        fail(base, `dizinin ${index + 1}. hamlesi "${san}" oynanamadı`);
        break;
      }
    }
  }

  if (lesson.mode === "izle" && lesson.id === "pat") {
    if (!chess.isStalemate()) fail(base, "pat dersi ama konum pat değil");
  }
}

/* ------------------------------------------------------------------ *
 * Açılışlar
 * ------------------------------------------------------------------ */

for (const opening of openingLines) {
  const base = `açılış/${opening.id}`;
  const chess = new Chess();
  for (const [index, san] of opening.line.entries()) {
    const played = chess.move(san);
    if (!played) {
      fail(base, `${index + 1}. hamle "${san}" oynanamadı. Yasal: ${chess.moves().map((m) => m.san).join(" ")}`);
      break;
    }
  }
  if (opening.notes.length !== opening.line.length) {
    fail(base, `hamle sayısı ${opening.line.length} ama açıklama sayısı ${opening.notes.length}`);
  }
  if (!opening.quiz.options.includes(opening.quiz.answer)) {
    fail(`${base}.quiz`, `doğru cevap "${opening.quiz.answer}" şıklar arasında yok`);
  }
}

/* ------------------------------------------------------------------ *
 * Taktikler
 * ------------------------------------------------------------------ */

for (const tactic of tacticLessons) {
  const base = `taktik/${tactic.id}`;
  const chess = load(`${base}.fen`, tactic.fen);
  if (!chess) continue;

  // Dizi tipli taktikler (örn. boğma matı) baştan sona oynanarak sınanır.
  if (tactic.mode === "sira") {
    const work = chess.clone();
    for (const [index, san] of tactic.line.entries()) {
      const played = work.move(san);
      if (!played) {
        fail(base, `dizinin ${index + 1}. hamlesi "${san}" oynanamadı. Yasal: ${work.moves().map((m) => m.san).join(" ")}`);
        break;
      }
    }
    if (tactic.line[tactic.line.length - 1].includes("#") && !work.isCheckmate()) {
      fail(base, "dizi mat ile bitmeliydi ama konum mat değil");
    }
    if (tactic.notes && tactic.notes.length !== tactic.line.length) {
      fail(base, `hamle sayısı ${tactic.line.length} ama açıklama sayısı ${tactic.notes.length}`);
    }
    continue;
  }

  const result = tryMove(base, chess, tactic.solution);
  if (!result) continue;

  if (tactic.solution.includes("#") && !result.probe.isCheckmate()) {
    fail(base, `"${tactic.solution}" mat yazılmış ama mat değil`);
  }
  if (tactic.solution.includes("+") && !result.probe.inCheck()) {
    fail(base, `"${tactic.solution}" şah yazılmış ama şah çekmiyor`);
  }
  checkBestMove(base, chess, tactic.solution);
}

/* ------------------------------------------------------------------ *
 * Oyun sonları
 * ------------------------------------------------------------------ */

for (const lesson of endgameLessons) {
  const base = `oyunsonu/${lesson.id}`;
  if (lesson.fen) {
    const chess = load(`${base}.fen`, lesson.fen);
    if (chess && lesson.mode === "bul") {
      const result = tryMove(base, chess, lesson.solution);
      if (result) {
        if (lesson.solution.includes("#") && !result.probe.isCheckmate()) {
          fail(base, `"${lesson.solution}" mat yazılmış ama mat değil`);
        }
        checkBestMove(base, chess, lesson.solution);
      }
    }
  }
  if (lesson.practice) {
    load(`${base}.practice`, lesson.practice.fen);
  }
}

/* ------------------------------------------------------------------ *
 * Sonuç
 * ------------------------------------------------------------------ */

if (notes.length > 0) {
  console.log(`ℹ️  ${notes.length} not (hata değil, gözden geçirilmeli):\n`);
  for (const line of notes) console.log("  " + line);
  console.log("");
}

if (problems.length === 0) {
  console.log("✅ TÜM DERS VERİLERİ DOĞRULANDI.");
} else {
  console.log(`❌ ${problems.length} HATA:\n`);
  for (const line of problems) console.log("  " + line);
  process.exitCode = 1;
}
