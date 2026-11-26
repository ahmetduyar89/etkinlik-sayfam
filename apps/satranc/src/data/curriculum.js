/**
 * curriculum.js — Platformdaki TÜM derslerin tek kaynaklı listesi.
 *
 * Rozetler, profil yüzdeleri ve ilerleme çubukları buradan beslenir. Bir ders
 * eklendiğinde (örneğin yeni bir açılış) burada otomatik sayılır; hiçbir yerde
 * elle sayı güncellemek gerekmez. Sabit sayılar yazmak, içerik büyüdükçe
 * yüzdelerin sessizce yanlışlanmasına yol açardı.
 */

import { introSections } from "./introLessons.js";
import { weeklyPlan } from "./weeklyPlan.js";
import { pieceLessons } from "./pieceLessons.js";
import { ruleLessons } from "./ruleLessons.js";
import { tacticLessons } from "./tacticLessons.js";
import { openingLines } from "./openingLines.js";
import { endgameLessons } from "./endgameLessons.js";

/**
 * Her bölüm, tamamlandığında `progress.completedLessons` içine yazılan
 * kimliklerin listesini bildirir.
 */
export const curriculum = [
  {
    id: "weeks",
    title: "Haftalık Program",
    route: "plan",
    icon: "book",
    // 36 haftanın her biri öğretmen tarafından "tamamlandı" işaretlenebilir.
    ids: weeklyPlan.map((entry) => `week-${entry.week}`)
  },
  {
    id: "intro",
    title: "Satrancı Tanıyalım",
    route: "learn",
    icon: "sparkles",
    // Kimlikler LearnPage'in yazdığı biçimle birebir aynı olmalıdır.
    ids: introSections.map((section) => `intro-${section.id}`)
  },
  {
    id: "board",
    title: "Satranç Tahtası",
    route: "board",
    icon: "board",
    ids: ["board-basics"]
  },
  {
    id: "pieces",
    title: "Taşlar",
    route: "pieces",
    icon: "pawn",
    ids: pieceLessons.map((piece) => `piece-${piece.id}`)
  },
  {
    id: "rules",
    title: "Kurallar",
    route: "rules",
    icon: "book",
    // Yalnızca tahtada uygulanabilen kurallar "tamamlanabilir" sayılır.
    ids: ruleLessons.filter((rule) => rule.mode).map((rule) => `rule-${rule.id}`)
  },
  {
    id: "tactics",
    title: "Taktikler",
    route: "tactics",
    icon: "target",
    ids: tacticLessons.map((tactic) => `tactic-${tactic.id}`)
  },
  {
    id: "openings",
    title: "Açılışlar",
    route: "openings",
    icon: "route",
    ids: openingLines.map((opening) => `opening-${opening.id}`)
  },
  {
    id: "endgames",
    title: "Oyun Sonları",
    route: "endgames",
    icon: "crown",
    ids: endgameLessons.map((lesson) => `endgame-${lesson.id}`)
  }
];

/** Platformdaki toplam ders sayısı. */
export const totalLessons = curriculum.reduce((sum, section) => sum + section.ids.length, 0);

/**
 * Bir bölümün tamamlanma durumunu hesaplar.
 * @returns {{done:number, total:number, percent:number}}
 */
export function sectionProgress(section, completedLessons) {
  const done = section.ids.filter((id) => completedLessons.includes(id)).length;
  const total = section.ids.length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Tüm müfredatın tamamlanma yüzdesi. */
export function overallProgress(completedLessons) {
  const done = curriculum.reduce(
    (sum, section) => sum + section.ids.filter((id) => completedLessons.includes(id)).length,
    0
  );
  return { done, total: totalLessons, percent: totalLessons === 0 ? 0 : Math.round((done / totalLessons) * 100) };
}

/* ------------------------------------------------------------------ *
 * Seviye (XP) sistemi
 * ------------------------------------------------------------------ */

/** Her seviye bir öncekinden biraz daha fazla XP ister. */
const LEVEL_STEP = 120;

/** Seviyelere çocuk dostu unvanlar. */
const TITLES = [
  "Yeni Başlayan",
  "Satranç Çırağı",
  "Piyon Dostu",
  "At Binicisi",
  "Fil Terbiyecisi",
  "Kale Muhafızı",
  "Vezir Yardımcısı",
  "Şah Koruyucusu",
  "Taktik Avcısı",
  "Satranç Ustası",
  "Büyük Usta"
];

/**
 * XP'den seviye bilgisini hesaplar.
 * @returns {{level:number, title:string, into:number, needed:number, percent:number}}
 */
export function levelInfo(xp) {
  const level = Math.floor(xp / LEVEL_STEP) + 1;
  const into = xp % LEVEL_STEP;
  return {
    level,
    title: TITLES[Math.min(level - 1, TITLES.length - 1)],
    into,
    needed: LEVEL_STEP,
    percent: Math.round((into / LEVEL_STEP) * 100)
  };
}
