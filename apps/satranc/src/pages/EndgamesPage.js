/**
 * EndgamesPage.js — "Oyun Sonları" ekranı.
 *
 * İki bölümden oluşur:
 *  1. Ders     — Tekniğin adımları ve tahtada tek hamlelik uygulama.
 *  2. Alıştırma— Aynı tekniği MOTORA KARŞI baştan sona uygulama. Çocuk gerçekten
 *                mat edene kadar deneyebilir; motor her seferinde en iyi savunmayı
 *                oynadığı için teknik ezberle değil, anlayarak öğrenilir.
 */

import { el } from "../utils/dom.js";
import { routeParam } from "../utils/router.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { LessonBoard } from "../components/LessonBoard.js";
import { endgameLessons } from "../data/endgameLessons.js";
import { ai } from "../engine/Ai.js";
import { icon } from "../components/Icon.js";
import { burst } from "../animations/effects.js";
import { pageShell } from "./pageUtils.js";

export function EndgamesPage({ progress, sound }) {
  // Derin bağlantı: #/endgames?ders=muhalefet
  let active = endgameLessons.find((e) => e.id === routeParam("ders")) || endgameLessons[0];
  let tab = "ders";

  const listHost = el("div", { className: "lesson-list" });
  const infoPanel = el("aside", { className: "lesson-panel" });
  const tabRow = el("div", { className: "stage-row" });
  const mainHost = el("div", { className: "lesson-main-inner" });

  const lessonBoard = LessonBoard({
    sound,
    onComplete: () => {
      progress.completeLesson(`endgame-${active.id}`, 25, 2);
      sound.play("badge");
      renderList();
    }
  });

  /* ---------------------------------------------------------------- *
   * Alıştırma modu — motora karşı
   * ---------------------------------------------------------------- */

  /** Motora karşı serbest alıştırma tahtası kurar. */
  function buildPractice() {
    const chess = new Chess(active.practice.fen);
    let busy = false;

    const status = el("p", { className: "lesson-status", text: active.practice.prompt });
    const moveCount = el("span", { className: "practice-count", text: "0 hamle" });

    const board = ChessBoard({
      chess,
      orientation: "w",
      interactive: true,
      onMove: (move) => {
        makeMove(move);
        return false;
      }
    });

    /** Oyuncunun hamlesi, ardından motorun savunması. */
    async function makeMove(move) {
      if (busy) return;
      const played = chess.move(move);
      if (!played) return;

      sound.play("move");
      board.update({ from: played.from, to: played.to });
      moveCount.textContent = `${Math.ceil(chess.getHistory().length / 2)} hamle`;

      if (report()) return;

      // Motor savunmayı en iyi şekilde oynasın diye "zor" seviye kullanılır.
      busy = true;
      board.setInteractive(false);
      status.textContent = "Rakip savunuyor...";

      const reply = await ai.chooseMove(chess, "zor");
      if (reply) {
        const replyMove = chess.move(reply);
        if (replyMove) {
          sound.play("move");
          board.update({ from: replyMove.from, to: replyMove.to });
        }
      }

      busy = false;
      if (report()) return;
      board.setInteractive(true);
      status.className = "lesson-status";
      status.textContent = "Sıra sende — şahını yaklaştırmayı unutma!";
    }

    /** Oyun bittiyse sonucu yazar. */
    function report() {
      const state = chess.status();
      if (!state.over) return false;

      board.setInteractive(false);
      const won = state.winner === "w";
      status.className = `lesson-status ${won ? "correct" : "wrong"}`;
      status.textContent = won
        ? `🏆 ${state.reason} Tekniği başardın!`
        : `${state.reason} Tekrar dene — bu sefer şahını daha erken yaklaştır.`;

      if (won) {
        progress.completeLesson(`endgame-practice-${active.id}`, 40, 3);
        sound.play("badge");
        burst(status);
        renderList();
      }
      return true;
    }

    return el("div", { className: "practice-wrap" }, [
      el("div", { className: "practice-head" }, [
        el("span", { className: "pill", text: "Alıştırma" }),
        moveCount,
        el("button", {
          className: "ghost small",
          type: "button",
          text: "Baştan Al",
          onClick: () => {
            sound.play("click");
            showTab("alistirma");
          }
        })
      ]),
      board.element,
      status
    ]);
  }

  /* ---------------------------------------------------------------- *
   * Görünüm
   * ---------------------------------------------------------------- */

  function renderList() {
    listHost.replaceChildren(
      ...endgameLessons.map((lesson) =>
        el("button", {
          className: `lesson-item ${lesson.id === active.id ? "active" : ""}`,
          type: "button",
          onClick: () => {
            sound.play("click");
            active = lesson;
            tab = "ders";
            renderAll();
          }
        }, [
          el("span", { className: "lesson-item-icon", html: icon(lesson.icon) }),
          el("span", { className: "lesson-item-text" }, [
            el("strong", { text: lesson.title }),
            el("small", { text: lesson.summary })
          ]),
          progress.state.completedLessons.includes(`endgame-${lesson.id}`)
            ? el("span", { className: "lesson-item-check", text: "✓" })
            : null
        ])
      )
    );
  }

  /** Ders / Alıştırma sekmelerini çizer. */
  function renderTabs() {
    const tabs = [["ders", "Ders"]];
    if (active.practice) tabs.push(["alistirma", "Alıştırma"]);

    tabRow.replaceChildren(
      ...tabs.map(([id, label]) =>
        el("button", {
          className: `stage-chip ${tab === id ? "active" : ""}`,
          type: "button",
          text: label,
          onClick: () => {
            sound.play("click");
            showTab(id);
          }
        })
      )
    );
  }

  /** Seçili sekmeyi gösterir. */
  function showTab(id) {
    tab = id;
    renderTabs();

    if (id === "alistirma" && active.practice) {
      mainHost.replaceChildren(buildPractice());
      return;
    }

    mainHost.replaceChildren(lessonBoard.element);
    lessonBoard.load({
      mode: active.mode,
      fen: active.fen,
      solution: active.solution,
      prompt: active.prompt,
      successNote: active.successNote,
      retryHint: active.retryHint
    });
  }

  function renderInfo() {
    infoPanel.replaceChildren(
      el("h2", { text: active.title }),
      el("p", { className: "lesson-summary", text: active.summary }),
      el("h3", { className: "panel-heading", text: "Tekniğin adımları" }),
      el("ol", { className: "step-list" }, active.steps.map((step) => el("li", { text: step }))),
      el("div", { className: "panel-buttons" }, [
        active.mode === "bul"
          ? el("button", {
              className: "ghost small",
              type: "button",
              html: `${icon("sparkles")} İpucu`,
              onClick: () => {
                sound.play("click");
                lessonBoard.showHint();
              }
            })
          : null,
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("sound")} Sesli Anlat`,
          onClick: () => {
            sound.play("click");
            sound.speak(`${active.title}. ${active.summary} ${active.steps.join(" ")}`);
          }
        })
      ])
    );
  }

  function renderAll() {
    renderList();
    renderInfo();
    showTab(tab);
  }

  renderAll();

  return pageShell(
    "Oyun Sonları",
    "Kazanmayı asıl öğreten bölüm. Önce tekniği öğren, sonra motora karşı uygula — gerçekten mat edene kadar dene!",
    [
      el("section", { className: "lesson-layout wide-list" }, [
        listHost,
        el("div", { className: "lesson-main" }, [tabRow, mainHost]),
        infoPanel
      ])
    ],
    // Tahtalı sayfada büyük başlık ~150 piksel yer kaplıyor ve tahtayı
    // ekrandan taşırıyordu; başlık bloğu kompakt tutulur.
    { compact: true }
  );
}
