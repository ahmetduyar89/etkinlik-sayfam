/**
 * TacticsPage.js — "Taktikler" ekranı.
 *
 * Her taktik deseni çocuk KENDİ bulur: konum sadeleştirilmiştir, gereksiz taş
 * yoktur ve doğru hamle gerçek motorla doğrulanmıştır. Boğma matı gibi çok
 * hamleli desenler adım adım oynanır.
 *
 * Desen tahtada bulunduktan SONRA bir soru açılır ve ders ancak o soru doğru
 * cevaplanınca tamamlanır. Tahtadaki alıştırma "nasıl"ı öğretir; soru ise
 * çocuğun deseni gerçekten anlayıp anlamadığını sınar — doğru hamleyi şans
 * eseri bulmuş olabilir.
 */

import { el } from "../utils/dom.js";
import { routeParam } from "../utils/router.js";
import { LessonBoard } from "../components/LessonBoard.js";
import { tacticLessons } from "../data/tacticLessons.js";
import { icon } from "../components/Icon.js";
import { burst } from "../animations/effects.js";
import { pageShell } from "./pageUtils.js";

export function TacticsPage({ progress, sound }) {
  // Derin bağlantı: #/tactics?ders=catal
  let active = tacticLessons.find((t) => t.id === routeParam("ders")) || tacticLessons[0];

  const listHost = el("div", { className: "lesson-list" });
  const infoPanel = el("aside", { className: "lesson-panel" });
  const quizHost = el("div", { className: "quiz-host", hidden: "" });

  const lessonBoard = LessonBoard({
    sound,
    onComplete: () => {
      // Desen bulundu; ödül soruya bırakılır.
      sound.play("success");
      quizHost.hidden = false;
      renderQuiz();
    }
  });

  function renderList() {
    listHost.replaceChildren(
      ...tacticLessons.map((tactic) =>
        el("button", {
          className: `lesson-item ${tactic.id === active.id ? "active" : ""}`,
          type: "button",
          onClick: () => {
            sound.play("click");
            active = tactic;
            loadTactic();
          }
        }, [
          el("span", { className: "lesson-item-icon", html: icon(tactic.icon) }),
          el("span", { className: "lesson-item-text" }, [
            el("strong", { text: tactic.title }),
            el("small", { text: tactic.summary })
          ]),
          progress.state.completedLessons.includes(`tactic-${tactic.id}`)
            ? el("span", { className: "lesson-item-check", text: "✓" })
            : null
        ])
      )
    );
  }

  function loadTactic() {
    quizHost.hidden = true;
    quizHost.replaceChildren();
    renderList();
    renderInfo();
    lessonBoard.load({
      // Çoğu taktik tek hamlelik "bul"dur; boğma matı gibi olanlar dizi modundadır.
      mode: active.mode || "bul",
      fen: active.fen,
      solution: active.solution,
      line: active.line,
      notes: active.notes,
      playerColor: active.playerColor,
      prompt: active.prompt,
      successNote: active.successNote,
      retryHint: active.retryHint
    });
  }

  function renderInfo() {
    infoPanel.replaceChildren(
      el("h2", { text: active.title }),
      el("p", { className: "lesson-summary", text: active.summary }),
      el("p", { className: "lesson-detail", text: active.detail }),
      el("div", { className: "panel-buttons" }, [
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("sparkles")} İpucu`,
          onClick: () => {
            sound.play("click");
            lessonBoard.showHint();
          }
        }),
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("route")} Baştan`,
          onClick: () => {
            sound.play("click");
            lessonBoard.reset();
          }
        }),
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("sound")} Sesli Anlat`,
          onClick: () => {
            sound.play("click");
            sound.speak(`${active.title}. ${active.summary} ${active.detail}`);
          }
        })
      ])
    );
  }

  /**
   * Desen bulunduktan sonraki tek soru.
   *
   * Yanlış cevapta ders KAPANMAZ: dersin kendi ipucu cümlesi gösterilir ve
   * çocuk tekrar dener. Amaç eleme değil, öğretmek.
   */
  function renderQuiz() {
    const quiz = active.quiz;
    if (!quiz) {
      // Soru yazılmamış bir ders kalırsa çocuk ödülsüz kalmasın.
      progress.completeLesson(`tactic-${active.id}`, 25, 2);
      sound.play("badge");
      renderList();
      return;
    }

    const result = el("p", { className: "quiz-result", text: "Deseni buldun! Son bir soru:" });
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

              if (!correct) {
                result.textContent = quiz.quizHint || active.quizHint || "Bu değil, tekrar düşün.";
                result.className = "quiz-result wrong";
                sound.play("error");
                return;
              }

              answered = true;
              result.textContent = `✅ Doğru! ${active.title} dersini tamamladın.`;
              result.className = "quiz-result correct";
              progress.completeLesson(`tactic-${active.id}`, 25, 2);
              sound.play("badge");
              burst(event.currentTarget);
              renderList();
            }
          })
        )),
        result
      ])
    );
  }

  loadTactic();

  return pageShell(
    "Taktikler",
    "Çatal, şiş, açmaz, çifte şah ve boğma matı — her deseni tahtada kendin bul. Taktikler oyunu kazandıran anlardır!",
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
