/**
 * PlanPage.js — 36 haftalık ders programı ekranı.
 *
 * İki görünümü vardır:
 *   1. Haftalar ızgarası — üniteler renkli bantlar hâlinde, 36 hafta kartı.
 *   2. Hafta detayı — öğretmenin sınıfta açıp anlatacağı ders planı:
 *      kazanım, 40 dakikalık akış (ısınma / anlatım / uygulama / kapanış)
 *      ve tek tıkla açılan etkinlik bağlantıları.
 *
 * Öğretmen "#/plan?hafta=8" ile doğrudan bir haftaya girebilir; bu sayede
 * ders bağlantısı sınıf panosuna asılabilir.
 */

import { el } from "../utils/dom.js";
import { navigate, routeParam } from "../utils/router.js";
import { weeklyPlan, units, unitOf, weekByNumber, totalWeeks } from "../data/weeklyPlan.js";
import { icon } from "../components/Icon.js";
import { symbolHTML } from "../components/PieceGlyph.js";
import { burst } from "../animations/effects.js";
import { pageShell } from "./pageUtils.js";

/** Tamamlanan haftalar ilerleme kaydında bu önekle tutulur. */
const weekId = (week) => `week-${week}`;

export function PlanPage({ progress, sound }) {
  const host = el("div", { className: "plan-host" });

  /* ---------------------------------------------------------------- *
   * Haftalar ızgarası
   * ---------------------------------------------------------------- */

  /** Tamamlanan hafta sayısı. */
  function doneCount() {
    return weeklyPlan.filter((entry) => progress.state.completedLessons.includes(weekId(entry.week))).length;
  }

  function renderGrid() {
    const done = doneCount();
    const percent = Math.round((done / totalWeeks) * 100);

    host.replaceChildren(
      // Üstte yıl boyu ilerleme
      el("section", { className: "plan-progress" }, [
        el("div", { className: "plan-progress-text" }, [
          el("strong", { text: `${done} / ${totalWeeks} hafta tamamlandı` }),
          el("span", { text: percent === 100 ? "🎉 Yıl tamamlandı!" : "Her hafta bir ders" })
        ]),
        el("div", { className: "plan-progress-bar" }, [
          el("div", { className: "plan-progress-fill", style: `width:${percent}%` })
        ])
      ]),

      // Üniteler ve haftaları
      ...units.map((unit) => {
        const weeks = weeklyPlan.filter((e) => e.week >= unit.weeks[0] && e.week <= unit.weeks[1]);
        const unitDone = weeks.filter((e) => progress.state.completedLessons.includes(weekId(e.week))).length;

        return el("section", { className: "unit-block", style: `--unit:${unit.color}` }, [
          el("header", { className: "unit-head" }, [
            el("span", { className: "unit-emoji", html: symbolHTML(unit.emoji) }),
            el("div", { className: "unit-title" }, [
              el("h2", { text: unit.title }),
              el("p", { text: unit.goal })
            ]),
            el("span", { className: "unit-count", text: `${unitDone}/${weeks.length}` })
          ]),
          el("div", { className: "week-grid" }, weeks.map(weekCard))
        ]);
      })
    );
  }

  /** Tek bir hafta kartı. */
  function weekCard(entry) {
    const unit = unitOf(entry.week);
    const isDone = progress.state.completedLessons.includes(weekId(entry.week));

    return el("button", {
      className: `week-card ${isDone ? "done" : ""}`,
      style: `--unit:${unit.color}`,
      type: "button",
      onClick: () => {
        sound.play("click");
        navigate("plan", { hafta: entry.week });
      }
    }, [
      el("span", { className: "week-number", text: String(entry.week) }),
      el("span", { className: "week-emoji", html: symbolHTML(entry.emoji) }),
      el("span", { className: "week-title", text: entry.title }),
      isDone ? el("span", { className: "week-check", text: "✓" }) : null
    ]);
  }

  /* ---------------------------------------------------------------- *
   * Hafta detayı
   * ---------------------------------------------------------------- */

  function renderWeek(entry) {
    const unit = unitOf(entry.week);
    const isDone = progress.state.completedLessons.includes(weekId(entry.week));
    const previous = weekByNumber(entry.week - 1);
    const next = weekByNumber(entry.week + 1);

    /** 40 dakikalık akışın tek bir bölümü. */
    function block(minutes, title, iconName, body) {
      return el("section", { className: "flow-block" }, [
        el("header", { className: "flow-head" }, [
          el("span", { className: "flow-icon", html: icon(iconName) }),
          el("h3", { text: title }),
          el("span", { className: "flow-time", text: `${minutes} dk` })
        ]),
        body
      ]);
    }

    host.replaceChildren(
      el("article", { className: "week-detail", style: `--unit:${unit.color}` }, [
        // Başlık
        el("header", { className: "week-hero" }, [
          el("button", {
            className: "ghost small back-button",
            type: "button",
            text: "← Tüm haftalar",
            onClick: () => {
              sound.play("click");
              navigate("plan");
            }
          }),
          el("div", { className: "week-hero-main" }, [
            el("span", { className: "week-hero-emoji", html: symbolHTML(entry.emoji) }),
            el("div", {}, [
              el("span", { className: "week-badge", text: `${entry.week}. HAFTA · ${unit.title}` }),
              el("h1", { text: entry.title })
            ])
          ])
        ]),

        // Kazanım
        el("section", { className: "objective-box" }, [
          el("span", { className: "objective-label", text: "🎯 KAZANIM" }),
          el("p", { text: entry.objective })
        ]),

        // 40 dakikalık akış
        el("div", { className: "flow-grid" }, [
          block(5, "Isınma", "sparkles", el("p", { text: entry.warmUp })),
          block(10, "Anlatım", "book",
            el("ul", { className: "teach-list" }, entry.teach.map((line) => el("li", { text: line })))),
          block(20, "Uygulama", "game", el("div", {}, [
            el("p", { text: entry.practice }),
            el("div", { className: "activity-row" }, entry.activities.map(activityButton))
          ])),
          block(5, "Kapanış", "target", el("p", { text: entry.closing }))
        ]),

        // Anahtar kelimeler
        el("section", { className: "words-box" }, [
          el("span", { className: "words-label", text: "Anahtar kelimeler" }),
          el("div", { className: "word-chips" }, entry.words.map((word) =>
            el("span", { className: "word-chip", text: word })
          ))
        ]),

        // Tamamlandı işareti
        el("section", { className: "week-footer" }, [
          el("button", {
            className: `primary ${isDone ? "is-done" : ""}`,
            type: "button",
            text: isDone ? "✓ Bu hafta tamamlandı" : "Bu haftayı tamamladım",
            onClick: (event) => {
              if (isDone) return;
              progress.completeLesson(weekId(entry.week), 20, 1);
              sound.play("badge");
              burst(event.currentTarget);
              renderWeek(entry);
            }
          }),
          el("div", { className: "week-nav" }, [
            previous
              ? el("button", {
                  className: "ghost small",
                  type: "button",
                  text: `← ${previous.week}. hafta`,
                  onClick: () => {
                    sound.play("click");
                    navigate("plan", { hafta: previous.week });
                  }
                })
              : null,
            next
              ? el("button", {
                  className: "ghost small",
                  type: "button",
                  text: `${next.week}. hafta →`,
                  onClick: () => {
                    sound.play("click");
                    navigate("plan", { hafta: next.week });
                  }
                })
              : null
          ])
        ])
      ])
    );
  }

  /** Etkinliği açan büyük düğme. */
  function activityButton(activity) {
    return el("button", {
      className: "activity-button",
      type: "button",
      onClick: () => {
        sound.play("click");
        navigate(activity.route, activity.params || null);
      }
    }, [
      el("span", { className: "activity-icon", html: icon(activity.icon || "sparkles") }),
      el("span", { className: "activity-label", text: activity.label }),
      el("span", { className: "activity-arrow", text: "→" })
    ]);
  }

  /* ---------------------------------------------------------------- *
   * Giriş
   * ---------------------------------------------------------------- */

  const requested = routeParam("hafta");
  const entry = requested ? weekByNumber(requested) : null;

  if (entry) renderWeek(entry);
  else renderGrid();

  return pageShell(
    entry ? "Ders Programı" : "36 Haftalık Ders Programı",
    entry
      ? "Bu haftanın dersini buradan anlatabilirsin. Etkinlik düğmeleri doğrudan alıştırmayı açar."
      : "Haftada bir ders saati. Altı ünite, 36 hafta, temelden başlayıp turnuvaya kadar.",
    [host]
  );
}
