/**
 * OpeningsPage.js — "Açılışlar" ekranı.
 *
 * Çocuk açılışı izlemez, OYNAR: beyazın hamlelerini kendisi yapar, siyahın
 * cevapları senaryodan gelir. Her hamleden sonra o hamlenin NEDEN yapıldığı
 * açıklanır — açılış ezberlemek değil, fikri anlamak hedeflenir.
 */

import { el } from "../utils/dom.js";
import { routeParam } from "../utils/router.js";
import { LessonBoard } from "../components/LessonBoard.js";
import { openingLines } from "../data/openingLines.js";
import { icon } from "../components/Icon.js";
import { burst } from "../animations/effects.js";
import { pageShell } from "./pageUtils.js";
import { sanTr } from "../engine/Chess.js";

export function OpeningsPage({ progress, sound }) {
  // Derin bağlantı: #/openings?ders=italyan
  let active = openingLines.find((o) => o.id === routeParam("ders")) || openingLines[0];
  let finished = false;

  const listHost = el("div", { className: "lesson-list" });
  const infoPanel = el("aside", { className: "lesson-panel" });
  const quizHost = el("div", { className: "quiz-host", hidden: "" });

  const lessonBoard = LessonBoard({
    sound,
    onComplete: () => {
      finished = true;
      sound.play("badge");
      // Açılış bitince quiz açılır; ödül quizden sonra verilir.
      quizHost.hidden = false;
      renderQuiz();
    }
  });

  function renderList() {
    listHost.replaceChildren(
      ...openingLines.map((opening) =>
        el("button", {
          className: `lesson-item ${opening.id === active.id ? "active" : ""}`,
          type: "button",
          onClick: () => {
            sound.play("click");
            active = opening;
            loadOpening();
          }
        }, [
          el("span", { className: "lesson-item-icon", html: icon("route") }),
          el("span", { className: "lesson-item-text" }, [
            el("strong", { text: opening.title }),
            el("small", { text: opening.line.join(" ") })
          ]),
          progress.state.completedLessons.includes(`opening-${opening.id}`)
            ? el("span", { className: "lesson-item-check", text: "✓" })
            : null
        ])
      )
    );
  }

  function loadOpening() {
    finished = false;
    quizHost.hidden = true;
    quizHost.replaceChildren();
    renderList();
    renderInfo();
    lessonBoard.load({
      mode: "sira",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      line: active.line,
      notes: active.notes,
      playerColor: "w",
      prompt: `${active.title}: beyazı sen oynuyorsun. İlk hamle ${active.line[0]}.`,
      successNote: `🎉 ${active.title} tamamlandı! Şimdi quizi çöz.`
    });
  }

  function renderInfo() {
    infoPanel.replaceChildren(
      el("h2", { text: active.title }),
      el("h3", { className: "panel-heading", text: "Ana fikir" }),
      el("p", { className: "lesson-summary", text: active.idea }),
      el("h3", { className: "panel-heading", text: "Ne kazandırır?" }),
      el("p", { className: "lesson-detail", text: active.advantage }),
      el("div", { className: "panel-buttons" }, [
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("sparkles")} Sıradaki Hamle`,
          onClick: () => {
            sound.play("click");
            const san = lessonBoard.showHint();
            if (san) sound.speak(`Sıradaki hamle ${sanTr(san)}`);
          }
        }),
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("route")} Baştan`,
          onClick: () => {
            sound.play("click");
            loadOpening();
          }
        }),
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("sound")} Sesli Anlat`,
          onClick: () => {
            sound.play("click");
            sound.speak(`${active.title}. ${active.idea} ${active.advantage}`);
          }
        })
      ])
    );
  }

  /** Açılış sonrası mini quiz. */
  function renderQuiz() {
    const quiz = active.quiz;
    const result = el("p", { className: "quiz-result", text: "Son bir soru!" });
    let answered = false;

    quizHost.replaceChildren(
      el("div", { className: "quiz-box" }, [
        el("h3", { text: quiz.question }),
        el("div", { className: "quiz-options" }, quiz.options.map((option) =>
          el("button", {
            className: "quiz-option",
            type: "button",
            text: option,
            onClick: (event) => {
              if (answered) return;
              const correct = option === quiz.answer;
              event.currentTarget.classList.add(correct ? "correct" : "wrong");
              if (correct) {
                answered = true;
                result.textContent = `✅ Doğru! ${active.title} dersini tamamladın.`;
                result.className = "quiz-result correct";
                progress.completeLesson(`opening-${active.id}`, 30, 2);
                sound.play("badge");
                burst(event.currentTarget);
                renderList();
              } else {
                result.textContent = "Bu değil. Yandaki 'Ana fikir' bölümünü tekrar oku.";
                result.className = "quiz-result wrong";
                sound.play("error");
              }
            }
          })
        )),
        result
      ])
    );
  }

  loadOpening();

  return pageShell(
    "Açılışlar",
    "Açılışı ezberleme — oyna ve nedenini anla. Her hamlede o hamlenin amacı açıklanır.",
    [
      el("section", { className: "lesson-layout wide-list" }, [
        listHost,
        el("div", { className: "lesson-main" }, [lessonBoard.element, quizHost]),
        infoPanel
      ])
    ],
    // Tahtalı sayfada büyük başlık ~150 piksel yer kaplıyor ve tahtayı
    // ekrandan taşırıyordu; başlık bloğu kompakt tutulur.
    { compact: true }
  );
}
