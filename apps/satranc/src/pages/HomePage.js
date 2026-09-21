/**
 * HomePage.js — Ana menü.
 *
 * Öğretmenin sınıfta ilk gördüğü ekrandır; bu yüzden en üstte "bu haftanın
 * dersi" kartı bulunur. Sıradaki hafta, tamamlanmamış ilk haftadır — böylece
 * öğretmen her ders açtığında doğrudan o haftanın planına girebilir.
 */

import { el } from "../utils/dom.js";
import { navigate } from "../utils/router.js";
import { weeklyPlan, unitOf, totalWeeks } from "../data/weeklyPlan.js";
import { overallProgress } from "../data/curriculum.js";
import { ProgressRing } from "../components/ProgressRing.js";
import { icon } from "../components/Icon.js";
import { symbolHTML } from "../components/PieceGlyph.js";
import { stat } from "./pageUtils.js";

export function HomePage({ progress, sound, role = "teacher" }) {
  const done = progress.state.completedLessons;
  const overall = overallProgress(done);

  /** Tamamlanmamış ilk hafta; hepsi bittiyse son hafta. */
  const nextWeek =
    weeklyPlan.find((entry) => !done.includes(`week-${entry.week}`)) || weeklyPlan[weeklyPlan.length - 1];
  const nextUnit = unitOf(nextWeek.week);
  const finishedWeeks = weeklyPlan.filter((entry) => done.includes(`week-${entry.week}`)).length;

  return el("main", { className: "home-page page" }, [
    el("section", { className: "welcome-panel" }, [
      el("div", { className: "welcome-copy" }, [
        el("span", { className: "eyebrow", text: "1-4. sınıflar için · 36 haftalık program" }),
        el("h1", { text: "Satranç Eğitimi" }),
        el("p", { text: "Taşları tanı, taktikleri keşfet, bulmacaları çöz ve bilgisayara karşı güvenle oyna." }),
        el("div", { className: "hero-actions" }, [
          el("button", {
            className: "primary",
            type: "button",
            onClick: () => { sound.play("click"); navigate("plan"); },
            html: `${icon("book")} Ders Programı`
          }),
          el("button", {
            className: "ghost",
            type: "button",
            onClick: () => { sound.play("click"); navigate("play"); },
            html: `${icon("game")} Oyna`
          })
        ])
      ]),
      el("div", { className: "hero-board" }, [
        ProgressRing(overall.percent, "Ders ilerlemesi"),
        stat("XP", progress.state.xp),
        stat("Yıldız", progress.state.stars)
      ])
    ]),

    // --- Bu haftanın dersi ---
    el("section", { className: "next-week-card", style: `--unit:${nextUnit.color}` }, [
      el("div", { className: "next-week-left" }, [
        el("span", { className: "next-week-label", text: `${finishedWeeks} / ${totalWeeks} hafta tamamlandı` }),
        el("div", { className: "next-week-main" }, [
          el("span", { className: "next-week-emoji", html: symbolHTML(nextWeek.emoji) }),
          el("div", {}, [
            el("span", { className: "next-week-badge", text: `${nextWeek.week}. HAFTA · ${nextUnit.title}` }),
            el("h2", { text: nextWeek.title })
          ])
        ]),
        el("p", { className: "next-week-objective", text: nextWeek.objective })
      ]),
      el("button", {
        className: "next-week-button",
        type: "button",
        onClick: () => { sound.play("click"); navigate("plan", { hafta: nextWeek.week }); },
        html: `Dersi Aç ${icon("route")}`
      })
    ]),

    el("section", { className: "home-shortcuts", "aria-label": "Hızlı başlangıç" }, [
      ["plan", "Derse devam et", "36 haftalık program", "book"],
      ["puzzles", "Bulmaca çöz", "Seviyene uygun taktikler", "puzzle"],
      ["play", "Oyun oyna", "Bilgisayara karşı dene", "bot"],
      role === "teacher"
        ? ["reports", "Sınıf raporu", "Maç ve turnuva özeti", "chart"]
        : ["profile", "Gelişimim", "XP, rozet ve başarılar", "user"]
    ].map(([route, title, description, iconName]) =>
      el("button", {
        className: "home-shortcut",
        type: "button",
        onClick: () => { sound.play("click"); navigate(route); },
        html: `${icon(iconName)}<span><strong>${title}</strong><small>${description}</small></span>`
      })
    )),

    // Ana sayfanın altındaki imza kartı.
    el("footer", { className: "home-credit" }, [
      el("span", { className: "credit-piece", text: "♞" }),
      el("p", {}, [
        el("span", { text: "Bu uygulama " }),
        el("strong", { text: "Ahmet DUYAR" }),
        el("span", { text: " tarafından hazırlanmıştır." })
      ])
    ])
  ]);
}
