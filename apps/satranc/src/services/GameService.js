/**
 * GameService.js — "Bilgisayara Karşı Oyna" ekranının beyni.
 *
 * Kural motorunu (Chess) ve yapay zekâyı (Ai) bir araya getirir; arayüzün ihtiyaç
 * duyduğu her şeyi hazır hale getirir:
 *  - Oyuncu ve bilgisayar hamleleri
 *  - Her hamlenin kalite sınıflandırması (Muhteşem / En İyi / Hata / Büyük Hata ...)
 *  - İpucu, hamle geri alma, yanlış hamle uyarısı
 *  - Oyun sonunda doğruluk yüzdesi ve hata dökümü
 *
 * Arayüzden tamamen bağımsızdır; bu sayede test edilebilir ve yeniden kullanılabilir.
 */

import { Chess, PIECE_NAMES_TR } from "../engine/Chess.js";
import { ai, analysePosition, classifyMove, resolveLevel, scoreToText } from "../engine/Ai.js";
import { materialSummary } from "../engine/Evaluator.js";

/** Analiz sırasında kullanılan derinlik — oyun seviyesinden bağımsızdır. */
const REVIEW_LEVEL = "orta";

export class GameService {
  /**
   * @param {object} options
   * @param {string} options.level "kolay" | "orta" | "zor"
   * @param {"w"|"b"} options.playerColor Oyuncunun rengi.
   */
  constructor({ level = "kolay", playerColor = "w" } = {}) {
    this.chess = new Chess();
    this.level = resolveLevel(level);
    this.playerColor = playerColor;
    this.moveReports = [];
    this.thinking = false;
    this.lastMove = null;
    this.finished = false;
  }

  /** Yeni oyun başlatır. */
  newGame({ level = this.level.id, playerColor = this.playerColor } = {}) {
    this.chess = new Chess();
    this.level = resolveLevel(level);
    this.playerColor = playerColor;
    this.moveReports = [];
    this.lastMove = null;
    this.thinking = false;
    this.finished = false;
    return this;
  }

  /** Sıra oyuncuda mı? */
  isPlayerTurn() {
    return !this.finished && !this.thinking && this.chess.turnColor() === this.playerColor;
  }

  /** Bilgisayarın rengi. */
  get engineColor() {
    return this.playerColor === "w" ? "b" : "w";
  }

  /**
   * Oyuncunun hamlesini oynar ve kalitesini değerlendirir.
   * @returns {Promise<{ok:boolean, move?:object, report?:object, reason?:string}>}
   */
  async playerMove({ from, to, promotion }) {
    if (!this.isPlayerTurn()) return { ok: false, reason: "Sıra sende değil, biraz bekle." };

    // Hamleyi oynamadan ÖNCE en iyi seçeneği hesaplarız; kıyaslama buna göre yapılır.
    const before = await analysePosition(this.chess, REVIEW_LEVEL);
    const legalCount = this.chess.moves().length;

    // En iyi hamlenin SAN karşılığı da MUTLAKA hamle oynanmadan önceki konumdan
    // üretilmelidir; sonradan üretilirse yanlış konumda aranır ve null döner.
    const bestSan = this.#sanForMove(before.best);

    const played = this.chess.move({ from, to, promotion });
    if (!played) {
      return { ok: false, reason: "Bu hamle kurallara uymuyor. Başka bir kare dene." };
    }

    // Oynanan hamlenin puanı, arama listesinden okunur.
    const match = before.moves.find(
      (candidate) => candidate.from === from && candidate.to === to && (!promotion || candidate.promotion === promotion)
    );
    const playedScore = match ? match.score : before.score;
    const classification = classifyMove(before.score, playedScore, legalCount === 1);

    const report = {
      ply: this.chess.getHistory().length,
      san: played.san,
      color: played.color,
      by: "player",
      classification,
      bestSan,
      best: before.best,
      loss: Math.max(0, before.score - playedScore),
      advice: this.#advice(played, classification, bestSan)
    };
    this.moveReports.push(report);
    this.lastMove = { from: played.from, to: played.to };

    return { ok: true, move: played, report };
  }

  /**
   * Bilgisayarın hamlesini oynatır.
   * @returns {Promise<{ok:boolean, move?:object}>}
   */
  async engineMove() {
    if (this.finished || this.chess.turnColor() === this.playerColor) return { ok: false };
    this.thinking = true;
    try {
      const choice = await ai.chooseMove(this.chess, this.level);
      if (!choice) return { ok: false };
      const played = this.chess.move(choice);
      if (!played) return { ok: false };

      this.lastMove = { from: played.from, to: played.to };
      this.moveReports.push({
        ply: this.chess.getHistory().length,
        san: played.san,
        color: played.color,
        by: "engine",
        classification: null
      });
      return { ok: true, move: played };
    } finally {
      this.thinking = false;
    }
  }

  /**
   * Oyuncuya ipucu verir: en iyi hamle ve çocuk diliyle bir açıklama.
   * @returns {Promise<{from:string,to:string,san:string,text:string}|null>}
   */
  async hint() {
    if (this.chess.isGameOver()) return null;
    const analysis = await analysePosition(this.chess, REVIEW_LEVEL);
    if (!analysis.best) return null;

    const piece = this.chess.get(analysis.best.from);
    const target = this.chess.get(analysis.best.to);
    const name = piece ? PIECE_NAMES_TR[piece.type] : "taş";

    let text = `${analysis.best.from.toUpperCase()} karesindeki ${name} taşına bak.`;
    if (target) text += ` ${analysis.best.to.toUpperCase()} karesinde alabileceğin bir taş var!`;
    else text += ` ${analysis.best.to.toUpperCase()} karesi ona çok yakışıyor.`;

    return {
      from: analysis.best.from,
      to: analysis.best.to,
      san: this.#sanForMove(analysis.best),
      text
    };
  }

  /**
   * Bir tam hamle geri alır (oyuncunun ve bilgisayarın hamlesi birlikte).
   * Böylece sıra yine oyuncuya gelir.
   */
  undo() {
    if (this.chess.getHistory().length === 0) return false;

    // Bilgisayarın son hamlesini geri al.
    if (this.chess.turnColor() === this.playerColor) {
      this.chess.undo();
      this.moveReports.pop();
    }
    // Oyuncunun son hamlesini geri al.
    if (this.chess.getHistory().length > 0) {
      this.chess.undo();
      this.moveReports.pop();
    }

    this.finished = false;
    const history = this.chess.getHistory({ verbose: true });
    const last = history[history.length - 1];
    this.lastMove = last ? { from: last.from, to: last.to } : null;
    return true;
  }

  /** Oyun durumu — bittiyse nedeniyle birlikte. */
  status() {
    const status = this.chess.status();
    if (status.over) this.finished = true;
    return status;
  }

  /** Tahtanın altındaki bilgi şeridi için özet. */
  summary() {
    const material = materialSummary(this.chess);
    const status = this.chess.status();
    return {
      turn: this.chess.turnColor(),
      turnText: this.chess.turnColor() === this.playerColor ? "Sıra sende!" : "Bilgisayar düşünüyor...",
      material,
      check: this.chess.inCheck(),
      statusText: status.reason || material.text,
      captured: this.chess.capturedPieces(),
      moveCount: this.chess.getHistory().length
    };
  }

  /**
   * Oyun sonu raporu: doğruluk yüzdesi ve hamle kalitesi dökümü.
   * @returns {{accuracy:number, counts:object, total:number, best:object|null, worst:object|null, text:string}}
   */
  report() {
    const playerMoves = this.moveReports.filter((entry) => entry.by === "player" && entry.classification);
    const counts = { brilliant: 0, best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0, forced: 0 };
    for (const entry of playerMoves) counts[entry.classification.key] += 1;

    // Doğruluk: her hamlenin kaybettiği santipiyona göre ceza puanı.
    let accuracy = 100;
    if (playerMoves.length > 0) {
      const averageLoss = playerMoves.reduce((sum, entry) => sum + Math.min(entry.loss, 600), 0) / playerMoves.length;
      accuracy = Math.max(10, Math.round(100 - averageLoss / 6));
    }

    const sorted = [...playerMoves].sort((a, b) => a.loss - b.loss);
    const best = sorted[0] || null;
    const worst = sorted[sorted.length - 1] || null;

    let text = "Güzel bir oyundu!";
    if (accuracy >= 90) text = "Muhteşem! Neredeyse kusursuz oynadın.";
    else if (accuracy >= 75) text = "Çok iyi! Birkaç küçük detaya dikkat edersen daha da güçlü olacaksın.";
    else if (accuracy >= 55) text = "İyi gidiyorsun. Hamle yapmadan önce rakibin tehdidini kontrol etmeyi dene.";
    else text = "Acele etme! Her hamleden önce şahının güvende olup olmadığına bak.";

    return { accuracy, counts, total: playerMoves.length, best, worst, text };
  }

  /** Analiz motorunun gözünden anlık değerlendirme cümlesi. */
  async evaluationText() {
    const analysis = await analysePosition(this.chess, REVIEW_LEVEL);
    // Puan sıradaki oyuncunun gözünden gelir; oyuncunun gözüne çeviririz.
    const fromPlayer = this.chess.turnColor() === this.playerColor ? analysis.score : -analysis.score;
    return scoreToText(fromPlayer);
  }

  /** Hamle nesnesini SAN metnine çevirir (tahtayı bozmadan). */
  #sanForMove(move) {
    if (!move) return null;
    const probe = this.chess.clone();
    const played = probe.move(move);
    return played ? played.san : null;
  }

  /** Sınıflandırmaya göre çocuk diliyle öğüt üretir. */
  #advice(played, classification, bestSan) {
    if (classification.key === "best" || classification.key === "brilliant") {
      return `${classification.emoji} ${classification.note}`;
    }
    if (classification.key === "forced") return classification.note;

    let advice = `${classification.emoji} ${classification.note}`;
    // Küçük farklarda çocuğu yormamak için alternatif hamleyi yalnızca
    // gerçekten önemli bir fark varsa söyleriz.
    if (bestSan && classification.key !== "good") {
      advice += ` Bunun yerine ${bestSan} hamlesi daha güçlüydü.`;
    }
    if (classification.key === "blunder" && played.captured) {
      advice += " Taş alırken o karenin korunup korunmadığına da bak.";
    }
    return advice;
  }
}
