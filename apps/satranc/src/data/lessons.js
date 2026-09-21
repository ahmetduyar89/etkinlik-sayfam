/**
 * lessons.js — Sol menüdeki gezinme öğeleri.
 *
 * NOT: Ders içeriklerinin tamamı kendi dosyalarına taşındı — introLessons.js,
 * pieceLessons.js, ruleLessons.js, tacticLessons.js, openingLines.js ve
 * endgameLessons.js. Hepsi etkileşimlidir ve tools/verify-lessons.mjs ile
 * doğrulanır. Bu dosyada yalnızca gezinme kalmıştır.
 */

export const navGroups = [
  {
    id: "baslangic",
    title: "Başlangıç",
    roles: ["student", "teacher"],
    items: [
      ["home", "Ana Menü", "home"],
      ["plan", "Ders Programı", "book"]
    ]
  },
  {
    id: "ogren",
    title: "Öğren",
    roles: ["student", "teacher"],
    items: [
      ["learn", "Satrancı Öğren", "sparkles"],
      ["board", "Satranç Tahtası", "board"],
      ["pieces", "Taşları Öğren", "pawn"],
      ["rules", "Kurallar", "book"],
      ["openings", "Açılışlar", "route"],
      ["endgames", "Oyun Sonları", "crown"]
    ]
  },
  {
    id: "calis",
    title: "Çalış ve Oyna",
    roles: ["student", "teacher"],
    items: [
      ["daily", "Bugünkü Çalışmam", "sparkles"],
      ["tactics", "Taktikler", "target"],
      ["puzzles", "Bulmacalar", "puzzle"],
      ["minigames", "Mini Oyunlar", "game"],
      ["play", "Bilgisayara Karşı", "bot"],
      ["duello", "İki Kişilik Oyun", "duo"],
      ["teacher", "Yapay Zeka Öğretmeni", "teacher"]
    ]
  },
  {
    id: "gelisim",
    title: "Gelişimim",
    roles: ["student", "teacher"],
    items: [
      ["games", "Oyun Arşivim", "archive"],
      ["badges", "Rozetler", "badge"],
      ["profile", "Profil", "user"]
    ]
  },
  {
    id: "yonetim",
    title: "Öğretmen Araçları",
    roles: ["teacher"],
    items: [
      ["siniflar", "Sınıflarım", "school"],
      ["turnuva", "Turnuva", "trophy"],
      ["reports", "Raporlar", "chart"]
    ]
  },
  {
    id: "sistem",
    title: "",
    roles: ["student", "teacher"],
    items: [["settings", "Ayarlar", "settings"]]
  }
];

/** Eski çağıranlar için düz liste; tek doğru kaynak yukarıdaki gruplardır. */
export const navItems = navGroups.flatMap((group) => group.items);



