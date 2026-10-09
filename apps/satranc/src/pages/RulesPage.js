/**
 * RulesPage.js — "Kurallar" ekranı.
 *
 * Kuralların çoğu tahtada denenerek öğretilir: rok yapılır, geçerken alma
 * uygulanır, piyon terfi ettirilir, mat kurulur. Yalnızca anlatılması yeterli
 * olan kurallar (50 hamle, üç tekrar, dokunulan taş) kart olarak sunulur.
 */

import { el } from "../utils/dom.js";
import { routeParam } from "../utils/router.js";
import { LessonBoard } from "../components/LessonBoard.js";
import { ruleLessons } from "../data/ruleLessons.js";
import { icon } from "../components/Icon.js";
import { pageShell } from "./pageUtils.js";

export function RulesPage({ progress, sound }) {
  // Etkileşimli kurallar üstte, yalnızca metin olanlar altta kart olarak.
  const interactive = ruleLessons.filter((rule) => rule.mode);
  const textOnly = ruleLessons.filter((rule) => !rule.mode);

  // Derin bağlantı: #/rules?ders=kisa-rok
  let active = interactive.find((rule) => rule.id === routeParam("ders")) || interactive[0];

  const listHost = el("div", { className: "lesson-list" });
  const infoPanel = el("aside", { className: "lesson-panel" });

  const lessonBoard = LessonBoard({
    sound,
    onComplete: () => {
      progress.completeLesson(`rule-${active.id}`, 20, 1);
      sound.play("badge");
      renderList();
    }
  });

  /** Kural listesini çizer. */
  function renderList() {
    listHost.replaceChildren(
      ...interactive.map((rule) =>
        el("button", {
          className: `lesson-item ${rule.id === active.id ? "active" : ""}`,
          type: "button",
          onClick: () => {
            sound.play("click");
            active = rule;
            loadRule();
          }
        }, [
          el("span", { className: "lesson-item-icon", html: icon(rule.icon) }),
          el("span", { className: "lesson-item-text" }, [
            el("strong", { text: rule.title }),
            el("small", { text: rule.summary })
          ]),
          progress.state.completedLessons.includes(`rule-${rule.id}`)
            ? el("span", { className: "lesson-item-check", text: "✓" })
            : null
        ])
      )
    );
  }

  /** Seçili kuralı tahtaya yükler. */
  function loadRule() {
    renderList();
    renderInfo();
    lessonBoard.load({
      mode: active.mode,
      fen: active.fen,
      line: active.line,
      playerColor: active.playerColor,
      solution: active.solution,
      prompt: active.prompt,
      successNote: active.successNote,
      retryHint: active.retryHint,
      notes: active.notes
    });
  }

  /** Açıklama panelini çizer. */
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

  loadRule();

  return pageShell(
    "Kurallar",
    "Kuralları okumakla kalma — tahtada kendin uygula. Rok yap, geçerken al, piyonunu vezire terfi ettir!",
    [
      el("section", { className: "lesson-layout wide-list" }, [
        listHost,
        el("div", { className: "lesson-main" }, [lessonBoard.element]),
        infoPanel
      ]),
      el("h2", { className: "section-heading", text: "Bilmen gereken diğer kurallar" }),
      el("section", { className: "card-grid" }, textOnly.map((rule) =>
        el("article", { className: "info-card" }, [
          el("div", { className: "card-icon", html: icon(rule.icon) }),
          el("h3", { text: rule.title }),
          el("p", { text: rule.summary }),
          el("p", { className: "card-detail", text: rule.detail })
        ])
      ))
    ],
    // Tahtalı sayfada büyük başlık ~150 piksel yer kaplıyor ve tahtayı
    // ekrandan taşırıyordu; başlık bloğu kompakt tutulur.
    { compact: true }
  );
}
