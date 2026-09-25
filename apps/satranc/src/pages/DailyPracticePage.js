/** DailyPracticePage.js — öğrenci verisine göre beş soruluk günlük çalışma. */

import { el } from "../utils/dom.js";
import { navigate } from "../utils/router.js";
import { themeCounts } from "../data/puzzles.js";
import { PUZZLE_THEME_LABELS } from "../data/puzzleThemes.js";
import { icon } from "../components/Icon.js";
import { pageShell } from "./pageUtils.js";

const GOAL = 5;
const STARTER_PRIORITY = { "mat-1": 50, catal: 49, askida: 48, "mat-2": 47, koridor: 46 };

function recommendations(progress) {
  const stats = progress.state.puzzleStats || {};
  const entries = Object.keys(PUZZLE_THEME_LABELS).map((theme, index) => {
    const item = stats[theme] || { solved: 0, wrong: 0, hints: 0 };
    const decisions = item.solved + item.wrong;
    const accuracy = decisions ? item.solved / decisions : null;
    // Yanlış ve ipucu önceliği artırır. Hiç çalışılmayan konular da listenin
    // sonunda kaybolmasın diye orta düzey başlangıç puanı alır.
    const priority = accuracy === null
      ? (STARTER_PRIORITY[theme] ?? 40 - index / 10)
      : (1 - accuracy) * 100 + Math.min(item.wrong, 10) * 2 + Math.min(item.hints, 5) * 3;
    return { theme, ...item, decisions, accuracy, priority };
  });
  return entries.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export function DailyPracticePage({ progress, sound }) {
  const suggested = recommendations(progress);
  const today = Math.min(GOAL, progress.dailyCount());
  const completed = today >= GOAL;
  const themes = suggested.map((item) => item.theme).join(",");

  return pageShell(
    "Bugünkü Çalışmam",
    `${progress.activeProfileName} için hatalara ve eksik konulara göre hazırlanan kısa çalışma.`,
    [
      el("section", { className: `daily-hero ${completed ? "complete" : ""}` }, [
        el("div", { className: "daily-ring", text: completed ? "✓" : `${today}/${GOAL}` }),
        el("div", { className: "daily-copy" }, [
          el("span", { className: "eyebrow", text: completed ? "Bugün tamamlandı" : "Yaklaşık 10 dakika" }),
          el("h2", { text: completed ? "Harika çalışma!" : "Beş bulmaca, üç önemli konu" }),
          el("p", { text: completed
            ? "Bugünkü hedefini tamamladın. İstersen tekrar ederek serini güçlendirebilirsin."
            : `Bugün ${GOAL - today} bulmaca daha çözerek hedefini tamamlayabilirsin.` }),
          el("button", {
            className: "primary",
            type: "button",
            html: `${icon(completed ? "sparkles" : "target")} ${completed ? "Bir tur daha çöz" : today ? "Çalışmaya devam et" : "Çalışmayı başlat"}`,
            onClick: () => {
              sound.play("click");
              navigate("puzzles", { gunluk: "1", temalar: themes });
            }
          })
        ])
      ]),

      el("section", { className: "daily-topics" }, suggested.map((item, index) => {
        const accuracy = item.accuracy === null ? null : Math.round(item.accuracy * 100);
        return el("article", { className: "daily-topic" }, [
          el("span", { className: "daily-topic-no", text: String(index + 1) }),
          el("div", {}, [
            el("h3", { text: PUZZLE_THEME_LABELS[item.theme] }),
            el("p", { text: accuracy === null
              ? "Bu konu henüz çalışılmadı; başlangıç setine eklendi."
              : `%${accuracy} doğruluk · ${item.wrong} yanlış · ${item.hints} ipucu` })
          ]),
          el("span", { className: "daily-topic-count", text: `${themeCounts[item.theme] || 0} soru` })
        ]);
      })),

      el("section", { className: "class-card" }, [
        el("h2", { className: "class-card-title", text: "Nasıl seçiliyor?" }),
        el("p", { className: "class-hint", text: "Yanlış yaptığın, ipucu kullandığın veya henüz hiç çalışmadığın konular öne alınır. Sonuçların geliştikçe yarının çalışma seti kendiliğinden değişir." })
      ])
    ]
  );
}
