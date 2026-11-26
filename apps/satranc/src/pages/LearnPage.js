/**
 * LearnPage.js — "Satrancı Tanıyalım" ekranı.
 *
 * Beş bölümlük bir yolculuk: satranç nedir, nereden geldi, dünyada ve Türkiye'de
 * satranç, zekâyı nasıl geliştirir ve nasıl başlanır. Her bölümün sonunda bir
 * soru vardır; doğru cevap bölümü tamamlar ve XP kazandırır.
 */

import { el } from "../utils/dom.js";
import { navigate, routeParam } from "../utils/router.js";
import { introSections } from "../data/introLessons.js";
import { icon } from "../components/Icon.js";
import { burst } from "../animations/effects.js";
import { pageShell } from "./pageUtils.js";

export function LearnPage({ progress, sound }) {
  // Derin bağlantı: #/learn?bolum=tarih
  const requested = introSections.findIndex((s) => s.id === routeParam("bolum"));
  let index = requested >= 0 ? requested : 0;

  const stepRow = el("div", { className: "stage-row" });
  const content = el("article", { className: "intro-card" });
  const navRow = el("div", { className: "intro-nav" });

  /** Bir bölümün tamamlanma kimliği. */
  const lessonId = (section) => `intro-${section.id}`;

  /** Üstteki bölüm çipleri. */
  function renderSteps() {
    stepRow.replaceChildren(
      ...introSections.map((section, position) =>
        el("button", {
          className: `stage-chip ${position === index ? "active" : ""} ${
            progress.state.completedLessons.includes(lessonId(section)) ? "done" : ""
          }`,
          type: "button",
          text: `${position + 1}. ${section.title}`,
          onClick: () => {
            sound.play("click");
            index = position;
            render();
          }
        })
      )
    );
  }

  /** Alt gezinme düğmeleri. */
  function renderNav() {
    navRow.replaceChildren(
      el("button", {
        className: "ghost small",
        type: "button",
        text: "← Önceki",
        disabled: index === 0 ? "true" : null,
        onClick: () => {
          sound.play("click");
          index = Math.max(0, index - 1);
          render();
        }
      }),
      el("span", { className: "intro-counter", text: `${index + 1} / ${introSections.length}` }),
      index < introSections.length - 1
        ? el("button", {
            className: "primary small",
            type: "button",
            text: "Sonraki →",
            onClick: () => {
              sound.play("click");
              index += 1;
              render();
            }
          })
        : el("button", {
            className: "primary small",
            type: "button",
            text: "Taşları Öğrenmeye Başla →",
            onClick: () => {
              sound.play("click");
              navigate("pieces");
            }
          })
    );
  }

  /** Bölüm içeriğini çizer. */
  function render() {
    const section = introSections[index];
    const done = progress.state.completedLessons.includes(lessonId(section));
    renderSteps();
    renderNav();

    const result = el("p", { className: "quiz-result", text: done ? "✓ Bu bölümü tamamladın." : "Bir cevap seç." });
    if (done) result.className = "quiz-result correct";
    let answered = done;

    content.replaceChildren(
      el("div", { className: "intro-head" }, [
        el("span", { className: "intro-emoji", text: section.emoji }),
        el("div", {}, [
          el("h2", { text: section.title }),
          done ? el("span", { className: "pill done", text: "✓ Tamamlandı" }) : null
        ])
      ]),

      el("p", { className: "intro-text", text: section.text }),

      el("ul", { className: "intro-points" }, section.points.map((point) => el("li", { text: point }))),

      el("div", { className: "fun-fact" }, [
        el("span", { className: "fun-fact-icon", text: "💡" }),
        el("p", { text: section.funFact })
      ]),

      el("button", {
        className: "ghost small",
        type: "button",
        html: `${icon("sound")} Bu Bölümü Dinle`,
        onClick: () => {
          sound.play("click");
          sound.speak(`${section.title}. ${section.text} ${section.points.join(" ")}`);
        }
      }),

      el("div", { className: "quiz-box" }, [
        el("h3", { text: section.quiz.question }),
        el("div", { className: "quiz-options" }, section.quiz.options.map((option) =>
          el("button", {
            className: `quiz-option ${done && option === section.quiz.answer ? "correct" : ""}`,
            type: "button",
            text: option,
            onClick: (event) => {
              if (answered) return;
              const correct = option === section.quiz.answer;
              event.currentTarget.classList.add(correct ? "correct" : "wrong");
              if (correct) {
                answered = true;
                result.textContent = "✅ Doğru! Bu bölümü tamamladın.";
                result.className = "quiz-result correct";
                progress.completeLesson(lessonId(section), 20, 1);
                sound.play("badge");
                burst(event.currentTarget);
                renderSteps();
              } else {
                result.textContent = "Bu değil. Yukarıdaki maddeleri tekrar oku.";
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

  render();

  return pageShell(
    "Satrancı Tanıyalım",
    "Satrancın ne olduğunu, nereden geldiğini ve zekâyı nasıl geliştirdiğini öğren. Beş kısa bölüm, beş soru.",
    [stepRow, content, navRow]
  );
}
