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
 * Ai.js — Satranç Eğitimi'nin satranç motoru (yapay zekâ rakip).
 *
 * Klasik bir alfa-beta budamalı negamax araması kullanır:
 *  - Yinelemeli derinleştirme (iterative deepening) + süre bütçesi
 *  - Sessizlik araması (quiescence) ile "yarım kalmış alışverişleri" doğru sayar
 *  - MVV-LVA hamle sıralaması ve öldürücü hamle (killer) tablosu ile hızlı budama
 *
 * Üç zorluk seviyesi çocukların gelişimine göre ayarlanmıştır. Kolay seviye
 * kasıtlı olarak hata yapar; amaç çocuğun kazanabilmesi ve cesaretinin kırılmamasıdır.
 */

import { MOVE_BITS, toAlgebraic } from "./Chess.js";
import { evaluate, PIECE_VALUES } from "./Evaluator.js";

/** Mat puanı. Ply eklenerek "daha erken mat daha iyidir" kuralı sağlanır. */
const MATE_SCORE = 100000;

/** Alma / terfi içeren hamleler sessizlik aramasına girer. */
const NOISY = MOVE_BITS.CAPTURE | MOVE_BITS.EP_CAPTURE | MOVE_BITS.PROMOTION;

/**
 * Zorluk seviyeleri.
 *  depth        : temel arama derinliği
 *  timeBudget   : milisaniye cinsinden düşünme süresi üst sınırı
 *  blunderChance: tamamen rastgele hamle oynama olasılığı (kasıtlı hata)
 *  choiceSpread : en iyi hamleden kaç santipiyon geride kalan hamleler de seçilebilir
 */
export const LEVELS = {
  kolay: {
    id: "kolay",
    label: "Kolay",
    elo: "≈400-600",
    description: "Yeni başlayanlar için. Bazen taşlarını korumayı unutur.",
    depth: 1,
    timeBudget: 200,
    quiescence: false,
    blunderChance: 0.35,
    choiceSpread: 250
  },
  orta: {
    id: "orta",
    label: "Orta",
    elo: "≈900-1200",
    description: "Taş kazanmayı ve basit taktikleri görür.",
    depth: 3,
    timeBudget: 800,
    quiescence: true,
    blunderChance: 0.08,
    choiceSpread: 60
  },
  zor: {
    id: "zor",
    label: "Zor",
    elo: "≈1500-1800",
    description: "Planlı oynar, taktikleri ve matları hesaplar.",
    depth: 4,
    timeBudget: 2000,
    quiescence: true,
    blunderChance: 0,
    choiceSpread: 0
  }
};

/** Türkçe/serbest yazılmış seviye adını normalleştirir. */
export function resolveLevel(level) {
  if (!level) return LEVELS.kolay;
  if (typeof level === "object" && level.depth) return level;
  const key = String(level).toLowerCase().replace("ı", "i");
  return LEVELS[key] || LEVELS.kolay;
}

export class Ai {
  constructor() {
    this.nodes = 0;
    this.killers = [];
    this.deadline = Infinity;
    this.aborted = false;
  }

  /**
   * Verilen konum için bir hamle seçer.
   * @param {import("./Chess.js").Chess} chess Oynanacak konum (değiştirilmez).
   * @param {string|object} level "kolay" | "orta" | "zor"
   * @returns {Promise<{from:string,to:string,promotion?:string,score:number,depth:number,nodes:number}|null>}
   */
  async chooseMove(chess, level = "kolay") {
    const config = resolveLevel(level);
    // Arayüzün "düşünüyorum" animasyonunu çizebilmesi için bir kare bekleriz.
    await new Promise((resolve) => setTimeout(resolve, 16));

    const work = chess.clone();
    const moves = work.generateMoves({ legal: true, verbose: false });
    if (moves.length === 0) return null;

    // Kasıtlı hata: kolay seviyede ara sıra tamamen rastgele oynar.
    if (config.blunderChance > 0 && Math.random() < config.blunderChance) {
      const random = moves[Math.floor(Math.random() * moves.length)];
      return this.#toResult(random, { score: 0, depth: 0, nodes: 0, blunder: true });
    }

    const scored = this.search(work, config);
    if (scored.length === 0) return null;

    // En iyi hamleye yakın olanlar arasından rastgele seçmek oyunu çeşitlendirir.
    const best = scored[0].score;
    const pool = scored.filter((entry) => best - entry.score <= config.choiceSpread);
    const picked = pool[Math.floor(Math.random() * pool.length)];

    return this.#toResult(picked.move, {
      score: picked.score,
      depth: this.lastDepth,
      nodes: this.nodes,
      blunder: false
    });
  }

  #toResult(move, extra) {
    return {
      from: toAlgebraic(move.from),
      to: toAlgebraic(move.to),
      promotion: move.promotion,
      ...extra
    };
  }

  /**
   * Kök hamleleri puanlar ve en iyiden kötüye sıralı liste döndürür.
   * Yinelemeli derinleştirme kullanır; süre dolarsa son tamamlanan derinlik geçerlidir.
   * @returns {Array<{move:object, score:number}>}
   */
  search(chess, level = "orta") {
    const config = resolveLevel(level);
    this.nodes = 0;
    this.killers = Array.from({ length: 32 }, () => []);
    this.deadline = Date.now() + config.timeBudget;
    this.aborted = false;
    this.lastDepth = 0;

    const rootMoves = chess.generateMoves({ legal: true, verbose: false });
    if (rootMoves.length === 0) return [];

    let results = rootMoves.map((move) => ({ move, score: 0 }));

    for (let depth = 1; depth <= config.depth; depth += 1) {
      const current = [];

      // Bir önceki derinliğin sıralamasını kullanmak alt ağaçlarda budamayı hızlandırır.
      // Kökte ise DAİMA tam pencere kullanırız: hamleleri birbiriyle kıyaslayıp
      // "en iyiye yakın" olanlar arasından seçtiğimiz için her hamlenin puanı
      // kesin olmalıdır. Daraltılmış pencere yalnızca sınır değeri döndürür ve
      // kötü hamleler en iyi hamle gibi görünür.
      for (const entry of results) {
        chess.searchMake(entry.move);
        const score = -this.#negamax(chess, depth - 1, -Infinity, Infinity, 1, config);
        chess.searchUndo();

        if (this.aborted) break;
        current.push({ move: entry.move, score });
      }

      if (this.aborted && current.length < results.length) break;
      current.sort((a, b) => b.score - a.score);
      results = current;
      this.lastDepth = depth;
      if (Date.now() > this.deadline) break;
    }

    return results;
  }

  /** Negamax + alfa-beta. Puan, sırası gelen oyuncunun gözünden döner. */
  #negamax(chess, depth, alpha, beta, ply, config) {
    this.nodes += 1;

    // Süre kontrolünü her 1024 düğümde bir yapmak ölçüm maliyetini düşürür.
    if ((this.nodes & 1023) === 0 && Date.now() > this.deadline) this.aborted = true;
    if (this.aborted) return this.#staticScore(chess);

    // Beraberlik durumları arama içinde de sıfır puandır.
    if (chess.halfMoves >= 100 || chess.isInsufficientMaterial()) return 0;

    const moves = chess.generateMoves({ legal: true, verbose: false });
    if (moves.length === 0) {
      // Hamle yoksa ya mat ya pat. Erken mat daha değerlidir.
      return chess.inCheck() ? -MATE_SCORE + ply : 0;
    }

    if (depth <= 0) {
      return config.quiescence ? this.#quiesce(chess, alpha, beta, ply, 4) : this.#staticScore(chess);
    }

    this.#orderMoves(moves, ply);

    let bestScore = -Infinity;
    for (const move of moves) {
      chess.searchMake(move);
      const score = -this.#negamax(chess, depth - 1, -beta, -alpha, ply + 1, config);
      chess.searchUndo();

      if (score > bestScore) bestScore = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) {
        // Beta kesmesi: alma olmayan bu hamleyi "öldürücü" olarak not ederiz.
        if (!(move.flags & NOISY) && this.killers[ply]) {
          this.killers[ply] = [move, this.killers[ply][0]].filter(Boolean).slice(0, 2);
        }
        break;
      }
    }

    return bestScore;
  }

  /**
   * Sessizlik araması: yalnızca alma ve terfi hamlelerini oynayarak
   * "yarım kalmış taş alışverişi" yüzünden yanlış değerlendirme yapmayı önler.
   */
  #quiesce(chess, alpha, beta, ply, depth) {
    this.nodes += 1;
    const standPat = this.#staticScore(chess);
    if (depth <= 0) return standPat;

    // "Fail-soft": daima gerçek en iyi puanı döndürürüz, alfa/beta sınırını değil.
    // Sınır döndürmek, üst düğümlerde sahte mat puanlarına yol açar.
    let best = standPat;
    if (best >= beta) return best;
    if (best > alpha) alpha = best;

    const noisy = chess.generateMoves({ legal: true, verbose: false }).filter((move) => move.flags & NOISY);
    if (noisy.length === 0) return best;
    this.#orderMoves(noisy, ply);

    for (const move of noisy) {
      chess.searchMake(move);
      const score = -this.#quiesce(chess, -beta, -alpha, ply + 1, depth - 1);
      chess.searchUndo();
      if (score > best) best = score;
      if (score > alpha) alpha = score;
      if (alpha >= beta) break;
    }
    return best;
  }

  /** Değerlendirme her zaman beyazın gözündendir; sıradaki oyuncuya çeviririz. */
  #staticScore(chess) {
    const score = evaluate(chess);
    return chess.turn === "w" ? score : -score;
  }

  /**
   * Hamle sıralaması. İyi hamleyi önce denemek alfa-beta budamasını kat kat hızlandırır.
   * MVV-LVA: değerli taşı değersiz taşla almak en umut verici hamledir.
   */
  #orderMoves(moves, ply) {
    const killers = this.killers[ply] || [];
    for (const move of moves) {
      let score = 0;
      if (move.captured) score += 10000 + PIECE_VALUES[move.captured] * 10 - PIECE_VALUES[move.piece];
      if (move.flags & MOVE_BITS.PROMOTION) score += 9000 + PIECE_VALUES[move.promotion];
      if (move.flags & (MOVE_BITS.KSIDE_CASTLE | MOVE_BITS.QSIDE_CASTLE)) score += 500;
      if (killers.some((killer) => killer && killer.from === move.from && killer.to === move.to)) score += 800;
      move._order = score;
    }
    moves.sort((a, b) => b._order - a._order);
  }
}

/** Uygulama genelinde tek bir motor örneği yeter. */
export const ai = new Ai();

/**
 * Konumu analiz eder: en iyi hamle ve puan.
 * @returns {Promise<{best:object|null, score:number, moves:Array}>}
 */
export async function analysePosition(chess, level = "orta") {
  await new Promise((resolve) => setTimeout(resolve, 0));
  const work = chess.clone();
  const results = ai.search(work, level);
  if (results.length === 0) return { best: null, score: 0, moves: [] };
  return {
    best: {
      from: toAlgebraic(results[0].move.from),
      to: toAlgebraic(results[0].move.to),
      promotion: results[0].move.promotion
    },
    score: results[0].score,
    moves: results.map((entry) => ({
      from: toAlgebraic(entry.move.from),
      to: toAlgebraic(entry.move.to),
      promotion: entry.move.promotion,
      score: entry.score
    }))
  };
}

/**
 * Oynanan hamleyi, en iyi hamleye kıyasla sınıflandırır.
 * Çocuklara gösterilecek etiketleri ve renkleri üretir.
 *
 * @param {number} bestScore   En iyi hamlenin puanı (oynayanın gözünden)
 * @param {number} playedScore Oynanan hamlenin puanı (oynayanın gözünden)
 * @param {boolean} isOnlyMove Tek yasal hamle miydi?
 */
export function classifyMove(bestScore, playedScore, isOnlyMove = false) {
  const loss = bestScore - playedScore;

  if (isOnlyMove) return { key: "forced", label: "Tek Hamle", emoji: "➡️", color: "#8aa0b4", note: "Başka seçenek yoktu." };
  if (loss <= 0 && bestScore > 250) {
    return { key: "brilliant", label: "Muhteşem", emoji: "✨", color: "#7c5cff", note: "Harika buluş! En iyi hamleyi buldun." };
  }
  if (loss <= 10) return { key: "best", label: "En İyi", emoji: "⭐", color: "#2f8f83", note: "Motorun da seçtiği hamle." };
  if (loss <= 50) return { key: "good", label: "İyi", emoji: "👍", color: "#4aa96c", note: "Sağlam bir hamle." };
  if (loss <= 120) return { key: "inaccuracy", label: "Küçük Hata", emoji: "🤔", color: "#e0a13a", note: "Daha iyisi vardı." };
  if (loss <= 300) return { key: "mistake", label: "Hata", emoji: "⚠️", color: "#e07a3a", note: "Bu hamle avantajını azalttı." };
  return { key: "blunder", label: "Büyük Hata", emoji: "💥", color: "#d64545", note: "Dikkat! Burada taş veya avantaj kaybı var." };
}

/** Santipiyon puanını çocukların anlayacağı bir cümleye çevirir. */
export function scoreToText(score) {
  if (Math.abs(score) >= MATE_SCORE - 200) {
    return score > 0 ? "Mat var! Kazanan taraf sensin." : "Dikkat, rakip mat ediyor!";
  }
  const pawns = score / 100;
  if (Math.abs(pawns) < 0.5) return "Konum eşit, herkesin şansı var.";
  if (Math.abs(pawns) < 1.5) return score > 0 ? "Biraz daha iyisin." : "Rakip biraz daha iyi.";
  if (Math.abs(pawns) < 3.5) return score > 0 ? "Belirgin şekilde öndesin." : "Rakip belirgin şekilde önde.";
  return score > 0 ? "Kazanan konumdasın!" : "Konum zor, dikkatli oyna.";
}

export { MATE_SCORE };
