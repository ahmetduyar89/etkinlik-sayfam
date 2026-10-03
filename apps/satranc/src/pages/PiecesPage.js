/**
 * PiecesPage.js — "Taşları Öğren" ekranı.
 *
 * Her taş beş aşamada öğretilir ve çocuk her aşamada tahtayla BİZZAT çalışır:
 *   Keşfet → Görev 1 → Görev 2 → Taş Alma → Quiz
 *
 * Tüm hamleler gerçek kural motoruyla doğrulanır; tahta yasadışı hamleyi zaten
 * kabul etmez, yanlış hedefe gidilirse ders nazikçe uyarır.
 */

import { el } from "../utils/dom.js";
import { routeParam } from "../utils/router.js";
import { LessonBoard } from "../components/LessonBoard.js";
import { pieceLessons } from "../data/pieceLessons.js";
import { icon } from "../components/Icon.js";
import { symbolHTML } from "../components/PieceGlyph.js";
import { burst } from "../animations/effects.js";
import { pageShell } from "./pageUtils.js";

export function PiecesPage({ progress, sound }) {
  // Ders programından gelen derin bağlantı: #/pieces?tas=knight&asama=6
  let piece = pieceLessons.find((item) => item.id === routeParam("tas")) || pieceLessons[0];
  let stageIndex = Number(routeParam("asama", 0)) || 0;

  const stageRow = el("div", { className: "stage-row" });
  const infoPanel = el("aside", { className: "lesson-panel" });
  const quizHost = el("div", { className: "quiz-host", hidden: "" });

  const lessonBoard = LessonBoard({
    sound,
    onComplete: () => sound.play("success")
  });

  /**
   * Taşın aşama listesini üretir.
   * Sıra bilinçlidir: önce serbest keşif, sonra engel farkındalığı, ardından
   * hedefli görevler, çok hamleli yolculuk, taş alma ve en sonda quiz.
   */
  function stagesFor(item) {
    return [
      {
        label: "Keşfet",
        config: {
          mode: "kesfet",
          fen: item.exploreFen,
          exploreNote: item.exploreNote,
          prompt: `${item.name} taşına dokun ve gidebileceği TÜM kareleri gör. İstediğin kadar oyna!`
        }
      },
      {
        label: "Engeller",
        config: {
          mode: "kesfet",
          fen: item.obstacleFen,
          exploreNote: item.obstacleNote,
          prompt: item.obstacleNote
        }
      },
      ...item.challenges.map((challenge, index) => ({
        label: `Görev ${index + 1}`,
        config: {
          mode: "hedef",
          fen: item.exploreFen,
          from: challenge.from,
          target: challenge.target,
          prompt: challenge.prompt
        }
      })),
      {
        label: "Yolculuk",
        config: {
          mode: "yolculuk",
          fen: item.journey.fen,
          from: item.journey.from,
          target: item.journey.target,
          par: item.journey.par,
          prompt: item.journey.prompt,
          successNote: item.journey.successNote
        }
      },
      {
        label: "Taş Alma",
        config: {
          mode: "bul",
          fen: item.captureFen,
          solution: item.captureSolution,
          prompt: item.capturePrompt,
          retryHint: `${item.name} taşının nasıl aldığını hatırla.`
        }
      },
      { label: "Quiz", quiz: true }
    ];
  }

  /** Aşama düğmelerini çizer. */
  function renderStages() {
    stageRow.replaceChildren(
      ...stagesFor(piece).map((stage, index) =>
        el("button", {
          className: `stage-chip ${index === stageIndex ? "active" : ""}`,
          type: "button",
          text: stage.label,
          onClick: () => {
            sound.play("click");
            stageIndex = index;
            showStage();
          }
        })
      )
    );
  }

  /** Seçili aşamayı gösterir. */
  function showStage() {
    const stage = stagesFor(piece)[stageIndex];
    renderStages();
    // Panel, aşamaya göre farklı düğmeler gösterdiği için birlikte tazelenir.
    renderInfo();

    if (stage.quiz) {
      quizHost.hidden = false;
      lessonBoard.element.hidden = true;
      renderQuiz();
    } else {
      quizHost.hidden = true;
      quizHost.replaceChildren();
      lessonBoard.element.hidden = false;
      lessonBoard.load(stage.config);
    }
  }

  /**
   * Taşın mini quizini çizer. Ders ancak TÜM sorular doğru cevaplanınca tamamlanır.
   */
  function renderQuiz() {
    const solved = new Set();

    /** Tek bir soru kutusu üretir. */
    function questionBox(quiz, index) {
      const result = el("p", { className: "quiz-result", text: "Bir cevap seç." });
      let answered = false;

      return el("div", { className: "quiz-box" }, [
        el("h3", { text: `${index + 1}. ${quiz.question}` }),
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
                result.textContent = "Bu değil, tekrar düşün. Yandaki kuralları okuyabilirsin.";
                result.className = "quiz-result wrong";
                sound.play("error");
                return;
              }

              answered = true;
              solved.add(index);
              result.textContent = "✅ Doğru!";
              result.className = "quiz-result correct";
              sound.play("success");

              // Tüm sorular bitince ders tamamlanır ve ödül verilir.
              if (solved.size === piece.quizzes.length) {
                result.textContent = `✅ Doğru! ${piece.name} dersini tamamladın.`;
                progress.completeLesson(`piece-${piece.id}`, 30, 2);
                sound.play("badge");
                burst(event.currentTarget);
                renderInfo();
              }
            }
          })
        )),
        result
      ]);
    }

    quizHost.replaceChildren(...piece.quizzes.map(questionBox));
  }

  /** Sağdaki bilgi panelini çizer. */
  function renderInfo() {
    const completed = progress.state.completedLessons.includes(`piece-${piece.id}`);
    infoPanel.replaceChildren(
      el("div", { className: "piece-hero" }, [
        el("span", { className: "piece-hero-symbol", html: symbolHTML(piece.symbol) }),
        el("div", { className: "piece-hero-text" }, [
          el("h2", { text: piece.name }),
          el("div", { className: "pill-row" }, [
            el("span", { className: "pill", text: piece.value }),
            completed ? el("span", { className: "pill done", text: "✓ Tamamlandı" }) : null
          ])
        ])
      ]),
      el("p", { className: "piece-summary", text: piece.summary }),
      el("h3", { className: "panel-heading", text: "Kuralları" }),
      el("ul", { className: "rule-list" }, piece.rules.map((rule) => el("li", { text: rule }))),
      el("div", { className: "panel-buttons" }, [
        // İpucu ve "baştan" yalnızca hedefli aşamalarda anlamlıdır.
        stagesFor(piece)[stageIndex]?.quiz
          ? null
          : el("button", {
              className: "ghost small",
              type: "button",
              html: `${icon("sparkles")} İpucu`,
              onClick: () => {
                sound.play("click");
                const hint = lessonBoard.showHint();
                if (hint) sound.speak(`İpucu: ${hint}`);
              }
            }),
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("route")} Baştan`,
          onClick: () => {
            sound.play("click");
            showStage();
          }
        }),
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("sound")} Sesli Anlat`,
          onClick: () => {
            sound.play("click");
            sound.speak(`${piece.name}. ${piece.summary} ${piece.rules.join(" ")}`);
          }
        })
      ])
    );
  }

  const picker = el("div", { className: "piece-picker" }, pieceLessons.map((item) =>
    el("button", {
      className: `piece-chip ${item.id === piece.id ? "active" : ""}`,
      type: "button",
      onClick: (event) => {
        sound.play("click");
        for (const button of event.currentTarget.parentElement.children) button.classList.remove("active");
        event.currentTarget.classList.add("active");
        piece = item;
        stageIndex = 0;
        // showStage paneli de tazeler.
        showStage();
      }
    }, [
      el("span", { className: "piece-chip-symbol", html: symbolHTML(item.symbol) }),
      el("span", { text: item.name })
    ])
  ));

  showStage();

  return pageShell(
    "Taşları Öğren",
    "Her taşı önce keşfet, sonra görevlerle çalış, en sonunda quizle pekiştir. Tahtada yalnızca kurallara uyan hamleler yapılabilir.",
    [
      picker,
      el("section", { className: "lesson-layout" }, [
        el("div", { className: "lesson-main" }, [stageRow, lessonBoard.element, quizHost]),
        infoPanel
      ])
    ],
    // Tahtalı sayfada büyük başlık ~150 piksel yer kaplıyor ve tahtayı
    // ekrandan taşırıyordu; başlık bloğu kompakt tutulur.
    { compact: true }
  );
}
