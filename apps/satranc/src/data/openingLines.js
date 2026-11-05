/**
 * openingLines.js — Çocuk seviyesinde açılış dersleri.
 *
 * Her açılış, çocuğun tahtada bizzat oynadığı bir hamle dizisidir. Çocuk beyazı
 * oynar; siyahın cevapları senaryodan otomatik gelir. `notes` dizisi, her
 * hamleden sonra gösterilecek açıklamayı tutar.
 *
 * Tüm diziler `tools/verify-lessons.mjs` ile baştan sona oynanarak doğrulanır.
 */

export const openingLines = [
  {
    id: "italyan",
    title: "İtalyan Açılışı",
    idea: "Merkezi tut, atı ve fili hızlıca geliştir, f7 karesini hedefle.",
    advantage: "Hızlı gelişim ve doğal saldırı fikirleri. Yeni başlayanlar için en iyi açılış!",
    line: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"],
    notes: [
      "1.e4 — Merkezde alan kazandın ve hem filin hem vezirin yolu açıldı.",
      "1...e5 — Siyah da merkezi paylaşıyor.",
      "2.Af3 — At gelişiyor ve e5 piyonuna saldırıyor. Ata dikkat: her zaman merkeze!",
      "2...Ac6 — Siyah atıyla piyonunu koruyor.",
      "3.Fc4 — Fil en güçlü çaprazına çıktı ve zayıf f7 karesine bakıyor.",
      "3...Fc5 — Siyah da aynı fikri uyguluyor. İşte İtalyan Açılışı!"
    ],
    quiz: {
      question: "İtalyan Açılışında fil neden c4 karesine gider?",
      options: ["Zayıf f7 karesini hedeflemek için", "Şahı korumak için", "Kaleyi açmak için", "Piyon kazanmak için"],
      answer: "Zayıf f7 karesini hedeflemek için"
    }
  },

  {
    id: "ispanyol",
    title: "İspanyol Açılışı (Ruy Lopez)",
    idea: "Fille e5 piyonunu koruyan atı rahatsız et.",
    advantage: "Dünyanın en çok oynanan açılışlarından biri; uzun vadeli baskı kurar.",
    line: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
    notes: [
      "1.e4 — Klasik merkez hamlesi.",
      "1...e5 — Simetrik cevap.",
      "2.Af3 — At e5'e saldırıyor.",
      "2...Ac6 — Piyon korunuyor.",
      "3.Fb5 — Fil, e5'i koruyan ATA saldırıyor. Koruyanı hedefle fikri!",
      "3...a6 — Siyah fili soruyor: 'ya al ya çekil'."
    ],
    quiz: {
      question: "İspanyol açılışında fil b5'te neyi hedefler?",
      options: ["e5 piyonunu koruyan atı", "Şahı", "Veziri", "Kaleyi"],
      answer: "e5 piyonunu koruyan atı"
    }
  },

  {
    id: "dort-at",
    title: "Dört At Oyunu",
    idea: "İki taraf da atlarını geliştirir; sakin ve öğretici bir açılış.",
    advantage: "Gelişim kurallarını öğrenmek için mükemmel. Sürpriz yok, sağlam oyun var.",
    line: ["e4", "e5", "Nf3", "Nc6", "Nc3", "Nf6"],
    notes: [
      "1.e4 — Merkez.",
      "1...e5 — Merkez.",
      "2.Af3 — Birinci at.",
      "2...Ac6 — Siyahın birinci atı.",
      "3.Ac3 — İkinci at da geliştiriliyor.",
      "3...Af6 — Dört at da sahnede! Şimdi filler ve rok sırası."
    ],
    quiz: {
      question: "Açılışta genellikle önce hangi taşlar geliştirilir?",
      options: ["Atlar ve filler", "Vezir", "Kaleler", "Şah"],
      answer: "Atlar ve filler"
    }
  },

  {
    id: "iskoc",
    title: "İskoç Açılışı",
    idea: "Merkezi erkenden aç ve taşlara yol ver.",
    advantage: "Açık oyun sever oyuncular için; taşlar hızlıca aktif olur.",
    line: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4", "Nxd4"],
    notes: [
      "1.e4 — Merkez.",
      "1...e5 — Merkez.",
      "2.Af3 — Gelişim ve tehdit.",
      "2...Ac6 — Savunma.",
      "3.d4 — İşte İskoç! Merkezi hemen açıyoruz.",
      "3...exd4 — Siyah piyonu alıyor.",
      "4.Axd4 — At merkezde harika bir kareye yerleşti."
    ],
    quiz: {
      question: "İskoç açılışının ana fikri nedir?",
      options: ["Merkezi erken açmak", "Rok yapmamak", "Veziri çıkarmak", "Piyonları korumak"],
      answer: "Merkezi erken açmak"
    }
  },

  {
    id: "sicilya",
    title: "Sicilya Savunması",
    idea: "Siyah, e5 yerine c5 oynayarak dengesiz ve mücadeleci bir oyun seçer.",
    advantage: "Siyah için en kazanç odaklı savunma. Oyun asla sıkıcı olmaz!",
    line: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4"],
    notes: [
      "1.e4 — Beyaz merkeze oynuyor.",
      "1...c5 — Sicilya! Siyah merkezi yandan kontrol ediyor.",
      "2.Af3 — Gelişim.",
      "2...d6 — Siyah e5 karesini destekliyor.",
      "3.d4 — Beyaz merkezi açıyor.",
      "3...cxd4 — Siyah alıyor.",
      "4.Axd4 — Beyazın merkezde atı var, siyahın fazladan merkez piyonu."
    ],
    quiz: {
      question: "Sicilya Savunmasında siyahın ilk hamlesi nedir?",
      options: ["c5", "e5", "d5", "Af6"],
      answer: "c5"
    }
  },

  {
    id: "fransiz",
    title: "Fransız Savunması",
    idea: "Siyah e6 oynar, sonra d5 ile merkeze sağlam biçimde meydan okur.",
    advantage: "Çok sağlam bir yapı. Siyahın c8 fili biraz sıkışır ama pozisyon dayanıklıdır.",
    line: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"],
    notes: [
      "1.e4 — Merkez.",
      "1...e6 — Fransız! Sessiz ama hazırlıklı bir hamle.",
      "2.d4 — Beyaz büyük merkez kuruyor.",
      "2...d5 — İşte fikir: siyah merkeze meydan okuyor.",
      "3.Ac3 — Beyaz e4 piyonunu koruyor.",
      "3...Af6 — Siyah baskıyı artırıyor."
    ],
    quiz: {
      question: "Fransız Savunmasında siyahın planı nedir?",
      options: ["e6 sonra d5 ile merkeze meydan okumak", "Hemen rok yapmak", "Veziri çıkarmak", "Kaleyi geliştirmek"],
      answer: "e6 sonra d5 ile merkeze meydan okumak"
    }
  },

  {
    id: "caro-kann",
    title: "Caro-Kann Savunması",
    idea: "c6 ile d5'i hazırlar; Fransız'a benzer ama c8 fili serbest kalır.",
    advantage: "Çok dayanıklı piyon yapısı ve güvenli gelişim. Sabırlı oyuncuların seçimi.",
    line: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4"],
    notes: [
      "1.e4 — Merkez.",
      "1...c6 — Caro-Kann. d5 hamlesine hazırlık.",
      "2.d4 — Beyaz merkezi büyütüyor.",
      "2...d5 — Planlanan hamle geldi.",
      "3.Ac3 — Piyon korunuyor.",
      "3...dxe4 — Siyah takası seçiyor.",
      "4.Axe4 — At merkezde. Siyahın yapısı hâlâ çok sağlam."
    ],
    quiz: {
      question: "Caro-Kann'ın Fransız'a göre avantajı nedir?",
      options: ["c8 fili sıkışmaz", "Daha hızlı mat eder", "Vezir erken çıkar", "Rok gerekmez"],
      answer: "c8 fili sıkışmaz"
    }
  }
];
