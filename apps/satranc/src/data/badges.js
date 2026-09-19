/**
 * badges.js — Rozet tanımları.
 *
 * Her rozet, ilerleme durumundan kendi durumunu HESAPLAR. Böylece rozet
 * mantığı tek yerde durur ve yeni bir rozet eklemek yalnızca bu listeye satır
 * eklemek demektir. (Önceden koşullar ProgressService içine gömülüydü ve yeni
 * içerik eklendiğinde güncellenmeyi unutuyordu.)
 *
 * Her rozet iki fonksiyon sunar:
 *   current(state) — şu ana kadarki ilerleme (sayı)
 *   target         — rozetin açılması için gereken değer
 * Rozet, current >= target olduğunda açılır. Bu yapı sayesinde arayüz
 * "3/10" gibi ilerleme çubukları da gösterebilir.
 */

import { curriculum, totalLessons } from "./curriculum.js";

/** Belirli bir bölümde tamamlanan ders sayısı. */
function sectionDone(state, sectionId) {
  const section = curriculum.find((item) => item.id === sectionId);
  if (!section) return 0;
  return section.ids.filter((id) => state.completedLessons.includes(id)).length;
}

/** Toplam oynanan oyun sayısı. */
function totalGames(state) {
  return state.games.won + state.games.lost + state.games.drawn;
}

/** Tüm mini oyunlarda toplam oynanış. */
function miniGamePlays(state) {
  return Object.values(state.miniGames || {}).reduce((sum, record) => sum + record.plays, 0);
}

/** En az bir mini oyunda ulaşılan en yüksek skor. */
function bestMiniScore(state) {
  const records = Object.values(state.miniGames || {});
  return records.length === 0 ? 0 : Math.max(...records.map((record) => record.best));
}

export const badges = [
  // --- Öğrenme ---
  {
    id: "first-lesson",
    title: "İlk Adım",
    description: "İlk dersini tamamla",
    icon: "sparkles",
    group: "Öğrenme",
    target: 1,
    current: (state) => state.completedLessons.length
  },
  {
    id: "piece-master",
    title: "Taş Ustası",
    description: "Altı taşın dersini de bitir",
    icon: "pawn",
    group: "Öğrenme",
    target: 6,
    current: (state) => sectionDone(state, "pieces")
  },
  {
    id: "rule-keeper",
    title: "Kural Bekçisi",
    description: "Tüm kural derslerini tamamla",
    icon: "book",
    group: "Öğrenme",
    target: curriculum.find((item) => item.id === "rules").ids.length,
    current: (state) => sectionDone(state, "rules")
  },
  {
    id: "tactician",
    title: "Taktik Avcısı",
    description: "Tüm taktik derslerini tamamla",
    icon: "target",
    group: "Öğrenme",
    target: curriculum.find((item) => item.id === "tactics").ids.length,
    current: (state) => sectionDone(state, "tactics")
  },
  {
    id: "opening-explorer",
    title: "Açılış Kâşifi",
    description: "Üç açılış öğren",
    icon: "route",
    group: "Öğrenme",
    target: 3,
    current: (state) => sectionDone(state, "openings")
  },
  {
    id: "endgame-expert",
    title: "Oyun Sonu Uzmanı",
    description: "Tüm oyun sonu derslerini bitir",
    icon: "crown",
    group: "Öğrenme",
    target: curriculum.find((item) => item.id === "endgames").ids.length,
    current: (state) => sectionDone(state, "endgames")
  },
  {
    id: "graduate",
    title: "Mezun",
    description: "Tüm dersleri tamamla",
    icon: "badge",
    group: "Öğrenme",
    target: totalLessons,
    current: (state) =>
      curriculum.reduce(
        (sum, section) => sum + section.ids.filter((id) => state.completedLessons.includes(id)).length,
        0
      )
  },

  // --- Bulmaca ---
  {
    id: "first-puzzle",
    title: "İlk Bulmaca",
    description: "Bir bulmaca çöz",
    icon: "puzzle",
    group: "Bulmaca",
    target: 1,
    current: (state) => state.solvedPuzzles.length
  },
  {
    id: "puzzle-10",
    title: "Bulmaca Sever",
    description: "10 bulmaca çöz",
    icon: "puzzle",
    group: "Bulmaca",
    target: 10,
    current: (state) => state.solvedPuzzles.length
  },
  {
    id: "puzzle-50",
    title: "Bulmaca Avcısı",
    description: "50 bulmaca çöz",
    icon: "puzzle",
    group: "Bulmaca",
    target: 50,
    current: (state) => state.solvedPuzzles.length
  },
  {
    id: "puzzle-100",
    title: "Bulmaca Şampiyonu",
    description: "100 bulmaca çöz",
    icon: "crown",
    group: "Bulmaca",
    target: 100,
    current: (state) => state.solvedPuzzles.length
  },

  // --- Oyun ---
  {
    id: "first-game",
    title: "İlk Oyun",
    description: "Bilgisayara karşı bir oyun bitir",
    icon: "game",
    group: "Oyun",
    target: 1,
    current: totalGames
  },
  {
    id: "first-win",
    title: "İlk Zafer",
    description: "Bilgisayarı bir kez yen",
    icon: "crown",
    group: "Oyun",
    target: 1,
    current: (state) => state.games.won
  },
  {
    id: "win-10",
    title: "Kazanan",
    description: "10 oyun kazan",
    icon: "badge",
    group: "Oyun",
    target: 10,
    current: (state) => state.games.won
  },

  // --- Mini oyun ---
  {
    id: "mini-first",
    title: "Oyuncu",
    description: "Bir mini oyun oyna",
    icon: "game",
    group: "Mini Oyun",
    target: 1,
    current: miniGamePlays
  },
  {
    id: "mini-20",
    title: "Mini Oyun Delisi",
    description: "20 mini oyun oyna",
    icon: "game",
    group: "Mini Oyun",
    target: 20,
    current: miniGamePlays
  },
  {
    id: "mini-high",
    title: "Yüksek Skor",
    description: "Bir mini oyunda 150 puan yap",
    icon: "sparkles",
    group: "Mini Oyun",
    target: 150,
    current: bestMiniScore
  },

  // --- Genel ---
  {
    id: "ten-stars",
    title: "Yıldız Toplayıcı",
    description: "10 yıldız kazan",
    icon: "sparkles",
    group: "Genel",
    target: 10,
    current: (state) => state.stars
  },
  {
    id: "super-player",
    title: "Süper Oyuncu",
    description: "500 XP'ye ulaş",
    icon: "target",
    group: "Genel",
    target: 500,
    current: (state) => state.xp
  },
  {
    id: "legend",
    title: "Efsane",
    description: "1500 XP'ye ulaş",
    icon: "crown",
    group: "Genel",
    target: 1500,
    current: (state) => state.xp
  }
];

/** Bir rozetin ilerleme durumunu verir. */
export function badgeStatus(badge, state) {
  const current = Math.max(0, badge.current(state));
  const unlocked = current >= badge.target;
  return {
    current: Math.min(current, badge.target),
    target: badge.target,
    unlocked,
    percent: Math.min(100, Math.round((current / badge.target) * 100))
  };
}

/** Rozetleri gruplarına göre sıralı biçimde verir. */
export function badgeGroups() {
  const order = ["Öğrenme", "Bulmaca", "Oyun", "Mini Oyun", "Genel"];
  return order
    .map((group) => ({ group, items: badges.filter((badge) => badge.group === group) }))
    .filter((entry) => entry.items.length > 0);
}
