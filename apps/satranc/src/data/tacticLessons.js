/**
 * tacticLessons.js — Taktik desenlerinin etkileşimli dersleri.
 *
 * Her taktikte çocuk konumu görür ve doğru hamleyi KENDİSİ bulur.
 * Konumlar bilinçli olarak sadedir: deseni gizleyen gereksiz taş yoktur.
 *
 * Her dersin sonunda bir soru vardır: tahtada deseni bulmak "nasıl"ı öğretir,
 * soru ise "neden"i sınar. Soru, tahtadaki alıştırma çözüldükten SONRA açılır
 * ve ders ancak doğru cevapla tamamlanır.
 *
 * Tüm FEN ve çözümler `tools/verify-lessons.mjs` ile doğrulanır.
 */

export const tacticLessons = [
  {
    id: "catal",
    title: "Çatal",
    icon: "target",
    summary: "Tek taşla aynı anda iki hedefe saldırmak.",
    detail:
      "Rakip aynı anda iki tehdide cevap veremez. Şahını kurtarır, sen de diğer taşı kazanırsın. At çatalları en tehlikelisidir çünkü at zıplar!",
    fen: "4k3/8/8/1q6/4N3/8/8/6K1 w - - 0 1",
    solution: "Nd6+",
    prompt: "Atınla hem şaha hem vezire aynı anda saldır.",
    successNote: "Çatal! Siyah şahını kurtarmak zorunda, sen de veziri kazanıyorsun.",
    retryHint: "Atın hangi kareden hem e8'e hem b5'e bakabilir?",
    quiz: {
      question: "Çatal neden bu kadar güçlüdür?",
      options: [
        "Rakip iki tehdide birden cevap veremez",
        "Rakibin şahını hemen mat eder",
        "Taşımızı korunaklı bir kareye götürür",
        "Rakibin taşlarını hareketsiz bırakır"
      ],
      answer: "Rakip iki tehdide birden cevap veremez"
    },
    quizHint: "Şahını kurtardığında diğer hedefe ne olur?"
  },

  {
    id: "sis",
    title: "Şiş",
    icon: "target",
    summary: "Öndeki değerli taşı tehdit et; kaçınca arkadaki taşı al.",
    detail:
      "Şiş, açmazın tersidir. Açmazda arkadaki taş daha değerlidir; şişte öndeki daha değerlidir ve kaçmak zorundadır.",
    fen: "1q6/8/8/1k6/8/8/8/3R3K w - - 0 1",
    solution: "Rb1+",
    prompt: "Kaleni siyah şahla vezirin aynı hatta olduğu sütuna getir.",
    successNote: "Şiş! Şah kaçmak zorunda, sonra vezir senindir.",
    retryHint: "Şah b5'te, vezir b8'de. Hangi sütun ikisini birden içine alır?",
    quiz: {
      question: "Şiş ile açmaz arasındaki fark nedir?",
      options: [
        "Şişte ÖNDEKİ taş daha değerlidir ve kaçmak zorundadır",
        "Şişte arkadaki taş daha değerlidir",
        "Şiş yalnızca atla yapılır",
        "Şişte iki taş birden şah çeker"
      ],
      answer: "Şişte ÖNDEKİ taş daha değerlidir ve kaçmak zorundadır"
    },
    quizHint: "Önde şah varsa kaçmak ZORUNDA; arkadaki taş açıkta kalır."
  },

  {
    id: "acmaz",
    title: "Açmaz",
    icon: "target",
    summary: "Bir taşı, arkasındaki daha değerli taş yüzünden hareketsiz bırakmak.",
    detail:
      "Açmazdaki taş oynayamaz (ya da oynarsa arkadaki taşı kaybeder). Açmazdaki taşa saldırarak kazanç sağlayabilirsin.",
    fen: "4k3/8/2n5/8/8/8/8/5BK1 w - - 0 1",
    solution: "Bb5",
    prompt: "Filini, at ile şahın aynı çapraz üzerinde olduğu kareye götür.",
    successNote: "Açmaz! At artık kıpırdayamaz, çünkü arkasında şah var.",
    retryHint: "e8'deki şah ile c6'daki at hangi çaprazda? O çaprazın devamına bak.",
    quiz: {
      question: "Açmazdaki bir taşa karşı en iyi fikir nedir?",
      options: [
        "Üzerine bir kez daha saldırmak — kaçamaz",
        "Onu görmezden gelmek",
        "Kendi şahımızı ona yaklaştırmak",
        "Hemen beraberlik teklif etmek"
      ],
      answer: "Üzerine bir kez daha saldırmak — kaçamaz"
    },
    quizHint: "Kıpırdayamayan bir taş kendini savunamaz."
  },

  {
    id: "cifte-sah",
    title: "Çifte Şah",
    icon: "crown",
    summary: "İki taşın aynı anda şah çekmesi — şah KAÇMAK zorundadır.",
    detail:
      "Çifte şahta araya taş koymak veya saldıranı almak işe yaramaz, çünkü iki saldıran vardır. Şah mutlaka kaçmalıdır. Bu yüzden çok güçlü bir kozdur.",
    // Şah a8, kale a1, at a4. At b6'ya zıplayınca:
    //  - atın kendisi a8'e şah çeker,
    //  - aynı anda a-sütunu açılır ve kale de şah çeker.
    // a-sütunu kenarda olduğu için şaha saldıran TEK at karesi b6'dır;
    // böylece çözüm benzersizdir. (Merkezdeki kurulumlarda iki at karesi
    // birden şah çektiği için ders "tek doğru cevap" ilkesini bozardı.)
    fen: "k7/8/8/8/N7/8/8/R3K3 w - - 0 1",
    solution: "Nb6+",
    prompt: "Atını oynat ki hem at hem de arkasındaki kale AYNI ANDA şah çeksin.",
    successNote: "Çifte şah! Araya taş koymak ya da birini almak kurtarmaz — şah kaçmak ZORUNDA.",
    retryHint: "At a4'ten çekilirse a1 kalesinin önü açılır. At hangi kareden a8'e de saldırır?",
    quiz: {
      question: "Çifte şahta rakip ne yapabilir?",
      options: [
        "Sadece şahını oynatabilir",
        "Araya bir taş koyabilir",
        "Saldıran taşlardan birini alabilir",
        "Rok yapabilir"
      ],
      answer: "Sadece şahını oynatabilir"
    },
    quizHint: "Araya taş koysa ya da birini alsa, öteki saldıran hâlâ şah çekiyor olur."
  },

  {
    id: "mat-agi",
    title: "Mat Ağı",
    icon: "crown",
    summary: "Şahın kaçış karelerini tek tek kapatarak matı hazırlamak.",
    detail:
      "Mat etmeden önce şahın nereye kaçabileceğini SAY. Sonra o kareleri kapatan hamleyi ara. İyi oyuncular matı hamle hamle örer.",
    fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
    solution: "Ra8#",
    prompt: "Siyah şah son sırada sıkışmış ve piyonları önünü kapatmış. Matı bul!",
    successNote: "Geri sıra matı! Piyonlar kendi şahlarının kaçışını engelledi.",
    retryHint: "Şahın kaçabileceği kareleri say: f7, g7, h7 piyonlarla dolu. Geriye ne kalıyor?",
    quiz: {
      question: "Mat ağı kurarken ilk iş nedir?",
      options: [
        "Şahın kaçabileceği kareleri saymak",
        "En değerli taşı feda etmek",
        "Piyonları ilerletmek",
        "Vezirle şah çekmek"
      ],
      answer: "Şahın kaçabileceği kareleri saymak"
    },
    quizHint: "Kaçış karesi kalmadıysa şah çekmek mat olur."
  },

  {
    id: "feda",
    title: "Feda ve Boğma Matı",
    icon: "sparkles",
    summary: "Vezirini vererek matı zorlamak — satrancın en güzel deseni.",
    detail:
      "Feda ancak SOMUT bir karşılığı varsa doğrudur: mat, daha değerli bir taş ya da çok güçlü bir saldırı. Burada veziri veriyoruz ki rakip kalesi kendi şahının kaçış karesini kapatsın. Buna 'boğma matı' denir.",
    // Beş hamlelik klasik boğma matı dizisi; tamamı motorla oynanarak doğrulanır.
    mode: "sira",
    fen: "5rk1/6pp/8/6N1/8/8/8/3Q2K1 w - - 0 1",
    playerColor: "w",
    line: ["Qd5+", "Kh8", "Nf7+", "Kg8", "Nh6+", "Kh8", "Qg8+", "Rxg8", "Nf7#"],
    notes: [
      "1.Vd5+ — Vezir uzun çaprazdan şah çekiyor.",
      "1...Şh8 — Şah köşeye kaçıyor.",
      "2.Af7+ — At şah çekiyor, şah geri dönmek zorunda.",
      "2...Şg8 — Şah geri döndü.",
      "3.Ah6+ — ÇİFTE ŞAH! Hem at hem vezir saldırıyor, şah kaçmalı.",
      "3...Şh8 — Tek kare: köşe.",
      "4.Vg8+!! — İşte feda! Vezir kendini veriyor.",
      "4...Kxg8 — Kale almak zorunda... ve g8 karesini kendi kapatıyor.",
      "5.Af7# — Boğma matı! Şah kendi taşlarıyla boğuldu."
    ],
    prompt: "Beyazı sen oynuyorsun. Diziyi adım adım oyna ve boğma matını keşfet!",
    successNote: "🏆 Boğma matı! Vezirini verdin ama rakip şah kendi taşları arasında boğuldu.",
    quiz: {
      question: "Boğma matında vezir neden feda edilir?",
      options: [
        "Rakip kale, şahının son kaçış karesini kapatsın diye",
        "Vezir zaten tehdit altında olduğu için",
        "Beraberlik yapmak için",
        "Rakibin vezirini de almak için"
      ],
      answer: "Rakip kale, şahının son kaçış karesini kapatsın diye"
    },
    quizHint: "Kale g8'i almak ZORUNDA — ve o kareyi kendi şahına kapatmış olur."
  }
];
