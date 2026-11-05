/**
 * LessonBoard.js — Etkileşimli ders tahtası.
 *
 * Ders sayfalarının tamamı (taşlar, kurallar, açılışlar, taktikler, oyun sonları)
 * aynı dört etkileşim kalıbını kullanır. Bu bileşen o kalıpları tek yerde toplar,
 * böylece her sayfa yalnızca kendi içeriğini tarif eder.
 *
 * Modlar:
 *  "kesfet"  — Serbest keşif. Çocuk taşa dokunur, YASAL hamleleri noktalarla görür.
 *              Amaç yoktur; taşın nasıl hareket ettiğini kendi kendine keşfeder.
 *  "hedef"   — Belirtilen taşı parlayan hedef kareye götürme görevi.
 *  "bul"     — Konumdaki tek doğru hamleyi bulma (taktik ve mat alıştırmaları).
 *  "sira"    — Verilen hamle dizisini adım adım oynama (açılışlar, rok, terfi...).
 *              Çocuk kendi rengini oynar, karşı tarafın hamleleri otomatik gelir.
 *  "yolculuk"— Taşı hedefe BİRKAÇ hamlede götürme. Tek hamlelik "hedef"ten farkı,
 *              taşın tahtayı nasıl kat ettiğini öğretmesidir (özellikle at için).
 *              Hamle sayılır; `par` verilirse en kısa yol da ödüllendirilir.
 *
 * Hamle doğrulaması DAİMA gerçek kural motoruyla yapılır; bu yüzden bir ders
 * "yanlış" derse gerçekten yanlıştır.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "./ChessBoard.js";
import { sanTr } from "../engine/Chess.js";

/** Karşı tarafın senaryo hamlesi öncesi bekleme (ms) — çocuk hamleyi görebilsin. */
const REPLY_DELAY = 700;

export function LessonBoard({ sound, onComplete } = {}) {
  let chess = new Chess();
  let lesson = null;
  let stepIndex = 0;
  let done = false;
  /** "yolculuk" modunda yapılan hamle sayısı. */
  let moveCount = 0;
  /** "yolculuk" modunda yürüyüşü yapan tarafın rengi. */
  let journeyColor = "w";

  const status = el("p", { className: "lesson-status", text: "" });
  const stepsRow = el("div", { className: "lesson-steps" });

  const board = ChessBoard({
    chess,
    orientation: "w",
    interactive: true,
    onMove: (move) => {
      handleMove(move);
      return false; // hamleyi motora biz uygularız
    }
  });

  /* ---------------------------------------------------------------- *
   * Ders yükleme
   * ---------------------------------------------------------------- */

  /**
   * Bir ders adımını yükler.
   * @param {object} config
   * @param {string} config.mode "kesfet" | "hedef" | "bul" | "sira"
   * @param {string} config.fen Başlangıç konumu
   * @param {string} config.orientation Tahtanın yönü
   * @param {string[]} config.line "sira" modunda oynanacak SAN dizisi
   * @param {string} config.solution "bul" modunda tek doğru hamle (SAN)
   * @param {string} config.from "hedef" modunda hareket ettirilecek taşın karesi
   * @param {string} config.target "hedef" modunda hedef kare
   * @param {string} config.prompt Çocuğa gösterilecek yönerge
   */
  function load(config) {
    lesson = config;
    chess = new Chess(config.fen);
    stepIndex = 0;
    moveCount = 0;
    journeyColor = chess.turnColor();
    done = false;

    board.attach(chess);
    board.setOrientation(config.orientation || chess.turnColor());
    board.setInteractive(config.mode !== "izle");
    // Hedef ve yolculuk modlarında varış karesi kalıcı olarak parlar.
    const marksTarget = (config.mode === "hedef" || config.mode === "yolculuk") && config.target;
    board.setMarks(marksTarget ? [config.target] : []);

    say(config.prompt || defaultPrompt(config.mode), "");
    renderSteps();
  }

  /** Mod için varsayılan yönerge. */
  function defaultPrompt(mode) {
    switch (mode) {
      case "kesfet":
        return "Bir taşa dokun ve gidebileceği kareleri gör. İstediğin kadar dene!";
      case "hedef":
        return "Taşı parlayan kareye götür.";
      case "bul":
        return "Bu konumda en güçlü hamleyi bul.";
      case "sira":
        return "Hamleleri sırayla oyna.";
      case "yolculuk":
        return "Taşı hedefe götür — kaç hamlede yapabilirsin?";
      default:
        return "";
    }
  }

  /* ---------------------------------------------------------------- *
   * Hamle işleme
   * ---------------------------------------------------------------- */

  function handleMove(move) {
    if (!lesson || done) return;

    const probe = chess.clone();
    const played = probe.move(move);
    if (!played) return; // tahta zaten yasadışı hamleyi engeller

    switch (lesson.mode) {
      case "kesfet":
        return handleExplore(move, played);
      case "hedef":
        return handleTarget(move, played);
      case "bul":
        return handleFind(move, played, probe);
      case "sira":
        return handleSequence(move, played);
      case "yolculuk":
        return handleJourney(move, played);
      default:
        break;
    }
  }

  /** Serbest keşif: her yasal hamle kabul edilir ve açıklanır. */
  function handleExplore(move, played) {
    chess.move(move);
    sound?.play("move");
    board.update({ from: played.from, to: played.to });

    let message = `${sanTr(played.san)} oynandı.`;
    if (played.captured) message += " Bir taş aldın!";
    if (chess.inCheck()) message += " Ve şah çektin!";
    if (lesson.exploreNote) message += ` ${lesson.exploreNote}`;
    say(message, "info");
  }

  /** Hedef modu: doğru kareye varıldı mı? */
  function handleTarget(move, played) {
    if (move.to !== lesson.target) {
      sound?.play("error");
      board.shake(move.from);
      say(`Bu yasal bir hamle ama hedef ${lesson.target.toUpperCase()} karesiydi. Tekrar dene!`, "wrong");
      return;
    }
    chess.move(move);
    sound?.play("success");
    board.update({ from: played.from, to: played.to });
    board.setMarks([]);
    finish(lesson.successNote || `🎯 Harika! ${sanTr(played.san)} ile hedefe ulaştın.`);
  }

  /**
   * Yolculuk modu: taşı hedefe BİRKAÇ hamlede götürme.
   *
   * Her yasal hamle kabul edilir; amaç hedefe varmaktır. Hamleler sayılır ve
   * `par` (en kısa yol) verilmişse çocuk en verimli rotayı bulmaya özendirilir.
   * Bu, "hedef" modunun aksine taşın tahtayı NASIL kat ettiğini öğretir.
   */
  function handleJourney(move, played) {
    chess.move(move);
    moveCount += 1;
    sound?.play("move");

    // Yolculuk tek taraflı bir yürüyüştür: rakip hiç oynamaz. Hamleden sonra
    // sıra normalde karşı tarafa geçeceği için çocuk ikinci hamlesini
    // yapamazdı; bu yüzden sırayı kendisine geri veririz.
    handOverTurnBack();
    board.update({ from: played.from, to: played.to });

    if (move.to === lesson.target) {
      const par = lesson.par;
      let message;
      if (par && moveCount <= par) {
        message = `🏆 Mükemmel! ${moveCount} hamlede vardın — en kısa yol bu!`;
      } else if (par) {
        message = `🎯 Vardın! ${moveCount} hamle kullandın. En kısası ${par} hamle — tekrar dener misin?`;
      } else {
        message = `🎯 Vardın! ${moveCount} hamlede ulaştın.`;
      }
      board.setMarks([]);
      finish(lesson.successNote ? `${message} ${lesson.successNote}` : message);
      return;
    }

    // Henüz varmadı: kaç hamle yaptığını ve hedefi hatırlatırız.
    const kalan = lesson.par ? ` (en kısa yol ${lesson.par} hamle)` : "";
    say(`${sanTr(played.san)} — ${moveCount}. hamle. Hedef: ${lesson.target.toUpperCase()}${kalan}`, "info");
  }

  /**
   * Konumu, sırayı yolculuğu yapan tarafa geri vererek yeniden kurar.
   * Geçerken alma hakkı da temizlenir; tek taraflı yürüyüşte anlamı yoktur.
   */
  function handOverTurnBack() {
    const parts = chess.fen().split(" ");
    parts[1] = journeyColor;
    parts[3] = "-";
    chess = new Chess(parts.join(" "));
    board.attach(chess);
  }

  /** Bul modu: tek doğru hamle. */
  function handleFind(move, played, probe) {
    if (played.san !== lesson.solution) {
      sound?.play("error");
      board.shake(move.from);
      const note = probe.inCheck()
        ? `${sanTr(played.san)} şah çekiyor ama aradığımız hamle bu değil.`
        : `${sanTr(played.san)} çözüm değil.`;
      say(`${note} ${lesson.retryHint || "Tekrar bak!"}`, "wrong");
      return;
    }
    chess.move(move);
    sound?.play("success");
    board.update({ from: played.from, to: played.to });
    finish(lesson.successNote || `✅ Doğru! ${sanTr(played.san)}`);
  }

  /** Sıra modu: senaryodaki hamleyi bekleriz. */
  function handleSequence(move, played) {
    const expected = lesson.line[stepIndex];
    if (played.san !== expected) {
      sound?.play("error");
      board.shake(move.from);
      say(`Sıradaki hamle ${sanTr(expected)}. Sen ${sanTr(played.san)} oynadın — tekrar dene!`, "wrong");
      return;
    }

    chess.move(move);
    stepIndex += 1;
    sound?.play("move");
    board.update({ from: played.from, to: played.to });
    renderSteps();

    if (stepIndex >= lesson.line.length) {
      finish(lesson.successNote || "🎉 Diziyi tamamladın!");
      return;
    }

    say(noteForStep(stepIndex - 1) || `${sanTr(played.san)} — doğru!`, "correct");

    // Karşı tarafın hamlesi senaryodan otomatik oynanır.
    if (isOpponentStep(stepIndex)) {
      board.setInteractive(false);
      setTimeout(() => playScriptedMove(), REPLY_DELAY);
    }
  }

  /** Senaryodaki sıradaki hamleyi otomatik oynar. */
  function playScriptedMove() {
    if (done || !lesson) return;
    const san = lesson.line[stepIndex];
    const played = chess.move(san);
    if (!played) {
      // Veri hatası: ders dizisi konuma uymuyor.
      say(`Ders verisi hatalı görünüyor (${sanTr(san)} oynanamadı).`, "wrong");
      return;
    }
    stepIndex += 1;
    sound?.play("move");
    board.update({ from: played.from, to: played.to });
    renderSteps();

    if (stepIndex >= lesson.line.length) {
      finish(lesson.successNote || "🎉 Diziyi tamamladın!");
      return;
    }

    say(noteForStep(stepIndex - 1) || `Rakip ${sanTr(played.san)} oynadı. Sıra sende.`, "info");
    board.setInteractive(true);
  }

  /** Bu adım karşı tarafa mı ait? (çocuk kendi rengini oynar) */
  function isOpponentStep(index) {
    const playerColor = lesson.playerColor || "w";
    // Dizinin çift indeksleri beyaz, tek indeksleri siyahtır.
    const moveColor = index % 2 === 0 ? "w" : "b";
    return moveColor !== playerColor;
  }

  /** Adıma ait açıklama metni. */
  function noteForStep(index) {
    return lesson.notes?.[index] || null;
  }

  /** Dersi tamamlar. */
  function finish(message) {
    done = true;
    board.setInteractive(false);
    say(message, "correct");
    onComplete?.(lesson);
  }

  /* ---------------------------------------------------------------- *
   * Görsel yardımcılar
   * ---------------------------------------------------------------- */

  /** Durum satırını yazar. */
  function say(message, tone = "") {
    status.className = `lesson-status ${tone}`;
    status.textContent = message;
  }

  /** Sıra modunda ilerleme noktalarını çizer. */
  function renderSteps() {
    if (lesson?.mode !== "sira") {
      stepsRow.replaceChildren();
      return;
    }
    stepsRow.replaceChildren(
      ...lesson.line.map((san, index) =>
        el("span", {
          className: `lesson-step ${index < stepIndex ? "done" : ""} ${index === stepIndex ? "current" : ""}`,
          text: sanTr(san)
        })
      )
    );
  }

  /**
   * Hedefe en kısa yoldan götüren İLK hamleyi bulur (genişlik öncelikli arama).
   *
   * Yolculuk ipucunda kullanılır. Konumu kopyalar; gerçek tahtaya dokunmaz.
   * Derinlik 4 ile sınırlıdır — at için tahtanın her karesi en fazla 6 hamlede
   * ulaşılır, ama ipucu için ilk adımı bulmak yeter ve arama hızlı kalır.
   */
  function shortestStep(position, target, maxDepth = 4) {
    const start = position.fen();
    const seen = new Set([start]);
    // Kuyruk: { fen, ilkHamle }
    let frontier = [{ fen: start, first: null }];

    for (let depth = 0; depth < maxDepth; depth += 1) {
      const next = [];
      for (const node of frontier) {
        const probe = new Chess(node.fen);
        for (const candidate of probe.moves()) {
          const branch = new Chess(node.fen);
          const played = branch.move({ from: candidate.from, to: candidate.to, promotion: candidate.promotion });
          if (!played) continue;

          const first = node.first || { from: played.from, to: played.to, san: played.san };
          if (played.to === target) return first;

          // Yürüyüş tek taraflıdır: sırayı yürüyen tarafta sabit tutarız,
          // yoksa arama rakibin hamlelerini de dallandırır ve yanlış yol bulur.
          const parts = branch.fen().split(" ");
          parts[1] = journeyColor;
          parts[3] = "-";
          const key = parts.join(" ");
          if (seen.has(key)) continue;
          seen.add(key);
          next.push({ fen: key, first });
        }
      }
      if (next.length === 0) break;
      frontier = next;
    }
    return null;
  }

  const root = el("div", { className: "lesson-board" }, [board.element, status, stepsRow]);

  return {
    element: root,
    load,

    /** Dersi baştan başlatır. */
    reset() {
      if (lesson) load(lesson);
    },

    /** Doğru hamleyi tahtada gösterir (ipucu). */
    showHint() {
      if (!lesson) return null;
      let san = null;
      if (lesson.mode === "bul") san = lesson.solution;
      else if (lesson.mode === "sira") san = lesson.line[stepIndex];

      if (san) {
        const probe = chess.clone();
        const move = probe.move(san);
        if (move) {
          board.showHint(move.from, move.to);
          return san;
        }
      }
      if (lesson.mode === "hedef") {
        board.setMarks([lesson.target]);
        return lesson.target;
      }

      // Yolculukta ipucu: hedefe EN YAKIN götüren hamleyi genişlik-öncelikli
      // arama ile buluruz, böylece çocuk gerçekten kısa yolu öğrenir.
      if (lesson.mode === "yolculuk") {
        const best = shortestStep(chess, lesson.target);
        if (best) {
          board.showHint(best.from, best.to);
          return best.san;
        }
        board.setMarks([lesson.target]);
        return lesson.target;
      }
      return null;
    },

    /** Geçerli konumu döndürür (test ve hata ayıklama için). */
    get position() {
      return chess;
    }
  };
}
