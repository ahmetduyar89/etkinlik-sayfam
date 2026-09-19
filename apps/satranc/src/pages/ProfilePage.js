/**
 * ProfilePage.js — "Profil" ekranı.
 *
 * Çocuğun gerçek ilerlemesini gösterir: seviye ve XP, bölüm bölüm tamamlanma,
 * oyun istatistikleri, bulmaca başarısı ve mini oyun rekorları. Tüm sayılar
 * curriculum.js'ten hesaplanır; hiçbir yerde sabit "toplam ders sayısı" yoktur.
 */

import { el } from "../utils/dom.js";
import { navigate } from "../utils/router.js";
import { curriculum, sectionProgress, overallProgress, levelInfo } from "../data/curriculum.js";
import { badges, badgeStatus } from "../data/badges.js";
import { puzzles } from "../data/puzzles.js";
import { icon } from "../components/Icon.js";
import { ProgressRing } from "../components/ProgressRing.js";
import { pageShell } from "./pageUtils.js";

/** Mini oyunların okunabilir adları. */
const MINI_NAMES = {
  "tasi-surukle": "Taşı Yerine Sürükle",
  "kare-bul": "Doğru Kareyi Bul",
  "tasi-tani": "Taşı Tanı",
  "mati-bul": "Matı Bul",
  "hamleyi-tahmin": "Hamleyi Tahmin Et",
  "hizli-hafiza": "Hızlı Hafıza",
  eslestirme: "Eşleştirme"
};

export function ProfilePage({ progress, sound }) {
  const state = progress.state;
  const overall = overallProgress(state.completedLessons);
  const level = levelInfo(state.xp);
  const earnedBadges = badges.filter((badge) => badgeStatus(badge, state).unlocked);

  const games = state.games;
  const totalGames = games.won + games.lost + games.drawn;
  const winRate = totalGames === 0 ? 0 : Math.round((games.won / totalGames) * 100);

  const miniRecords = Object.entries(state.miniGames || {});

  /** Küçük istatistik kutusu. */
  const statBox = (label, value, hint) =>
    el("div", { className: "profile-stat" }, [
      el("strong", { text: String(value) }),
      el("span", { text: label }),
      hint ? el("small", { text: hint }) : null
    ]);

  return pageShell("Profil", "İlerlemeni, seviyeni ve rozetlerini buradan takip et.", [
    // --- Seviye kartı ---
    el("section", { className: "profile-hero" }, [
      el("div", { className: "level-badge" }, [
        el("span", { className: "level-number", text: String(level.level) }),
        el("span", { className: "level-word", text: "Seviye" })
      ]),
      el("div", { className: "level-info" }, [
        el("h2", { text: level.title }),
        el("div", { className: "level-bar" }, [
          el("div", { className: "level-bar-fill", style: `width:${level.percent}%` })
        ]),
        el("small", { text: `${level.into} / ${level.needed} XP — sonraki seviyeye ${level.needed - level.into} XP` })
      ]),
      ProgressRing(overall.percent, "Ders ilerlemesi")
    ]),

    // --- Ana istatistikler ---
    el("section", { className: "profile-stats" }, [
      statBox("Toplam XP", state.xp),
      statBox("Yıldız", state.stars),
      statBox("Rozet", `${earnedBadges.length}/${badges.length}`),
      statBox("Tamamlanan Ders", `${overall.done}/${overall.total}`),
      statBox("Çözülen Bulmaca", `${state.solvedPuzzles.length}`, `${puzzles.length} bulmacadan`),
      statBox("Kazanma Oranı", `%${winRate}`, `${totalGames} oyun`)
    ]),

    // --- Bölüm bölüm ilerleme ---
    el("h2", { className: "section-heading", text: "Bölüm ilerlemen" }),
    el("section", { className: "section-progress-list" }, curriculum.map((section) => {
      const info = sectionProgress(section, state.completedLessons);
      return el("button", {
        className: "section-progress-item",
        type: "button",
        title: `${section.title} bölümüne git`,
        onClick: () => {
          sound.play("click");
          navigate(section.route);
        }
      }, [
        el("span", { className: "section-progress-icon", html: icon(section.icon) }),
        el("span", { className: "section-progress-text" }, [
          el("strong", { text: section.title }),
          el("div", { className: "section-progress-bar" }, [
            el("div", { className: "section-progress-fill", style: `width:${info.percent}%` })
          ])
        ]),
        el("span", { className: "section-progress-count", text: `${info.done}/${info.total}` })
      ]);
    })),

    // --- Oyun geçmişi ---
    el("h2", { className: "section-heading", text: "Bilgisayara karşı" }),
    el("section", { className: "profile-stats" }, [
      statBox("Kazanılan", games.won),
      statBox("Berabere", games.drawn),
      statBox("Kaybedilen", games.lost)
    ]),

    // --- Mini oyun rekorları ---
    el("h2", { className: "section-heading", text: "Mini oyun rekorların" }),
    miniRecords.length === 0
      ? el("p", { className: "empty-note", text: "Henüz mini oyun oynamadın. Mini Oyunlar bölümünden başlayabilirsin!" })
      : el("section", { className: "mini-record-list" }, miniRecords.map(([id, record]) =>
          el("div", { className: "mini-record" }, [
            el("span", { className: "mini-record-name", text: MINI_NAMES[id] || id }),
            el("span", { className: "mini-record-best", text: `🏆 ${record.best}` }),
            el("small", { text: `${record.plays} kez oynandı` })
          ])
        )),

    // --- Son kazanılan rozetler ---
    earnedBadges.length > 0
      ? el("div", {}, [
          el("h2", { className: "section-heading", text: "Kazandığın rozetler" }),
          el("section", { className: "badge-strip" }, earnedBadges.map((badge) =>
            el("span", { className: "badge-chip", title: badge.description }, [
              el("span", { className: "badge-chip-icon", html: icon(badge.icon) }),
              el("span", { text: badge.title })
            ])
          ))
        ])
      : null
  ]);
}
