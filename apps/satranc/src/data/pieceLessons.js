/**
 * pieceLessons.js — Her taş için etkileşimli ders içeriği.
 *
 * Her taş yedi aşamada öğretilir ve çocuk her aşamada tahtayla BİZZAT çalışır:
 *   1. Keşfet   — Taş tahtada; çocuk dokunup yasal hamlelerini kendi görür.
 *   2. Engel    — Taşın önü kesildiğinde ne olduğunu keşfeder (atın farkı burada!).
 *   3. Görevler — Taşı belirli karelere götürme alıştırmaları (3-4 adet).
 *   4. Yolculuk — Taşı uzak bir kareye BİRKAÇ hamlede götürme; en kısa yol aranır.
 *   5. Taş Alma — Rakip taşı doğru şekilde alma.
 *   6. Quiz     — Kısa bilgi soruları (2 adet).
 *
 * Buradaki tüm FEN, hedef ve hamleler `tools/verify-lessons.mjs` ile doğrulanır:
 * her görevin hedefine gerçekten gidilebiliyor mu, her alma hamlesi yasal mı.
 */

export const pieceLessons = [
  {
    id: "pawn",
    name: "Piyon",
    symbol: "♙",
    value: "1 puan",
    summary: "En küçük taş ama en cesur olanı. Asla geri dönmez!",
    rules: [
      "Sadece ileri gider, asla geri dönmez.",
      "İlk hamlesinde istersen iki kare gidebilir.",
      "Düz giderken taş ALAMAZ; taşı çapraz alır.",
      "Önü kapalıysa hiç ilerleyemez.",
      "Son yatağa ulaşırsa vezire terfi eder!"
    ],
    exploreFen: "4k3/8/8/3p1p2/8/8/3PPP2/4K3 w - - 0 1",
    exploreNote: "Piyonun ilk hamlesinde iki kare gidebildiğine dikkat et.",

    // Engel dersi: d3 piyonunun önünde d4'te siyah piyon var — hiç hamlesi yok.
    obstacleFen: "4k3/8/8/8/3p4/3P4/4P3/4K3 w - - 0 1",
    obstacleNote:
      "d3 piyonuna dokun: hiç yeşil nokta yok! Önü kapalı olduğu için ilerleyemiyor ve karşısındaki piyonu da ALAMAZ — piyon düz alamaz.",

    challenges: [
      { from: "e2", target: "e4", prompt: "Piyonu ilk hamlesinde İKİ kare ilerlet: e2'den e4'e." },
      { from: "d2", target: "d3", prompt: "Şimdi tek kare ilerlet: d2'den d3'e." },
      { from: "f2", target: "f4", prompt: "f2 piyonunu da iki kare ilerlet." }
    ],

    journey: {
      fen: "4k3/8/8/8/8/8/4P3/4K3 w - - 0 1",
      from: "e2",
      target: "e7",
      par: 4,
      prompt: "Piyonu e2'den e7'ye götür. İlk hamlede iki kare gidebildiğini unutma!",
      successNote: "Bir adım daha atsa vezir olacaktı!"
    },

    captureFen: "4k3/8/8/4p3/3P4/8/8/4K3 w - - 0 1",
    captureSolution: "dxe5",
    capturePrompt: "Piyon çapraz alır! d4 piyonuyla e5'teki siyah piyonu al.",

    quizzes: [
      {
        question: "Piyon taşı nasıl alır?",
        options: ["Düz ileri giderek", "Çapraz olarak", "Yanlamasına", "L şeklinde"],
        answer: "Çapraz olarak"
      },
      {
        question: "Piyonun tam önünde bir taş varsa ne olur?",
        options: ["İlerleyemez", "Üstünden atlar", "O taşı alır", "Geri gider"],
        answer: "İlerleyemez"
      }
    ]
  },

  {
    id: "knight",
    name: "At",
    symbol: "♘",
    value: "3 puan",
    summary: "Tahtanın tek zıplayan taşı. L harfi çizer!",
    rules: [
      "L şeklinde gider: iki kare düz, sonra bir kare yana.",
      "Tek taş odur ki diğer taşların ÜZERİNDEN atlar.",
      "Her zaman durduğu karenin renginden farklı bir kareye iner.",
      "Merkezde 8 kareye, köşede sadece 2 kareye gidebilir.",
      "Etrafı tamamen çevrili olsa bile hapsolmaz!"
    ],
    exploreFen: "4k3/8/3p1p2/8/4N3/8/8/4K3 w - - 0 1",
    exploreNote: "At L çizerek 8 farklı kareye gidebiliyor.",

    // Atın süper gücü: kendi piyonlarıyla tamamen çevrili ama yine de zıplıyor.
    obstacleFen: "4k3/8/8/2PPP3/2PNP3/2PPP3/8/4K3 w - - 0 1",
    obstacleNote:
      "At d4'te ve HER YANI kendi piyonlarıyla çevrili — ama yine de 8 kareye zıplayabiliyor! İşte atı özel yapan şey bu: engelleri umursamaz.",

    challenges: [
      { from: "e4", target: "d6", prompt: "Atı e4'ten d6'ya götür ve siyah piyonu al." },
      { from: "e4", target: "f2", prompt: "Şimdi atı e4'ten f2'ye zıplat." },
      { from: "e4", target: "c3", prompt: "Atı e4'ten c3'e götür — iki kare sola, bir kare aşağı." },
      { from: "e4", target: "g5", prompt: "Son görev: atı g5 karesine zıplat." }
    ],

    journey: {
      fen: "4k3/8/8/8/8/8/8/N3K3 w - - 0 1",
      from: "a1",
      target: "h8",
      par: 6,
      prompt: "At turu! Atı a1'den h8'e götür. Kaç hamlede yapabilirsin?",
      successNote: "At tahtayı böyle kat eder — köşeden köşeye zıplayarak."
    },

    captureFen: "4k3/8/3p4/8/4N3/8/8/4K3 w - - 0 1",
    captureSolution: "Nxd6+",
    capturePrompt: "Atla d6'daki piyonu al — üstelik şah da çekmiş olursun!",

    quizzes: [
      {
        question: "At başka taşların üzerinden atlayabilir mi?",
        options: ["Evet, tek atlayan taş odur", "Hayır, asla", "Sadece kendi taşlarının", "Sadece ilk hamlede"],
        answer: "Evet, tek atlayan taş odur"
      },
      {
        question: "At merkezde mi yoksa köşede mi daha güçlüdür?",
        options: ["Merkezde", "Köşede", "Fark etmez", "Kenarda"],
        answer: "Merkezde"
      }
    ]
  },

  {
    id: "bishop",
    name: "Fil",
    symbol: "♗",
    value: "3 puan",
    summary: "Çapraz koşucu. Başladığı kare rengini asla değiştirmez.",
    rules: [
      "Sadece çapraz gider, istediği kadar kare ilerler.",
      "Başladığı karenin rengini asla değiştiremez.",
      "Her oyuncunun biri açık biri koyu kare fili vardır.",
      "Yolunda bir taş varsa onu geçemez.",
      "Açık tahtada çok güçlüdür; kapalı tahtada sıkışır."
    ],
    exploreFen: "4k3/1p6/6p1/8/4B3/8/8/4K3 w - - 0 1",
    exploreNote: "Filin sadece çapraz çizgilerde ilerlediğine dikkat et.",

    // e3 piyonu, filin g1 yönündeki çaprazını kesiyor.
    obstacleFen: "4k3/8/8/8/3B4/4P3/8/4K3 w - - 0 1",
    obstacleNote:
      "Fil d4'te. Kendi piyonun e3'te durduğu için o çapraza hiç giremiyor — fil at gibi atlayamaz, yolu açık olmalı.",

    challenges: [
      { from: "e4", target: "b7", prompt: "Fili e4'ten b7'ye götür ve piyonu al." },
      { from: "e4", target: "h1", prompt: "Fili uzun çaprazdan h1'e götür." },
      // a8'e gidilemez: b7'deki siyah piyon o çaprazı keser. Bu yüzden hedef b1.
      { from: "e4", target: "b1", prompt: "Fili aşağı çaprazdan b1 karesine indir." }
    ],

    journey: {
      fen: "4k3/8/8/8/8/8/8/B3K3 w - - 0 1",
      from: "a1",
      target: "h2",
      par: 2,
      prompt: "Fil a1'de (koyu kare). Onu h2 karesine götür — dikkat, tek hamlede olmaz!",
      successNote: "Fil renk değiştiremediği için bazen dolambaçlı gitmek gerekir."
    },

    captureFen: "4k3/8/6p1/8/4B3/8/8/4K3 w - - 0 1",
    captureSolution: "Bxg6+",
    capturePrompt: "Filinle g6'daki piyonu al.",

    quizzes: [
      {
        question: "Fil hangi renk karelerde kalır?",
        options: ["Başladığı karenin renginde", "Her renkte", "Sadece beyazda", "Sadece siyahta"],
        answer: "Başladığı karenin renginde"
      },
      {
        question: "Filin yolunda bir taş varsa ne yapar?",
        options: ["Onu geçemez", "Üstünden atlar", "Yanından dolaşır", "Taşı yok eder"],
        answer: "Onu geçemez"
      }
    ]
  },

  {
    id: "rook",
    name: "Kale",
    symbol: "♖",
    value: "5 puan",
    summary: "Düz giden güçlü taş. Açık sütunları çok sever.",
    rules: [
      "Satır ve sütun boyunca düz gider, istediği kadar kare.",
      "Çapraz gidemez.",
      "Yolunda bir taş varsa onu geçemez.",
      "Açık sütunlarda (piyonsuz) çok güçlüdür.",
      "Şah ile birlikte ROK adlı özel hamleyi yapar."
    ],
    exploreFen: "4k3/4p3/8/8/1p2R3/8/8/4K3 w - - 0 1",
    exploreNote: "Kale düz çizgilerde ilerliyor, çapraz gidemiyor.",

    // d5'teki siyah piyon kaleyi durduruyor: d7'ye ulaşamaz.
    obstacleFen: "4k3/8/8/3p4/3R4/8/8/4K3 w - - 0 1",
    obstacleNote:
      "Kale d4'te ve yukarıda d5'te siyah piyon var. Kale d5'e kadar gidip piyonu ALABİLİR ama onun ötesine geçemez.",

    challenges: [
      { from: "e4", target: "b4", prompt: "Kaleyi e4'ten b4'e götür ve piyonu al." },
      { from: "e4", target: "e7", prompt: "Kaleyi e-sütunundan yukarı, e7'ye çıkar." },
      { from: "e4", target: "h4", prompt: "Kaleyi yatay olarak h4'e sür." }
    ],

    journey: {
      // Siyah şah e5'te: 8. yatayı ve a-sütununu boş bırakır, böylece kale
      // gerçekten iki hamlede köşeden köşeye gidebilir. (e8'de dursaydı
      // 8. yatayı keser ve en kısa yol 3 hamle olurdu.)
      fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
      from: "a1",
      target: "h8",
      par: 2,
      prompt: "Kaleyi a1'den h8'e götür. Kale düz gider — en kısa yol kaç hamle?",
      successNote: "Kale her yere en fazla iki hamlede gider: bir yatay, bir dikey."
    },

    captureFen: "4k3/8/8/8/1p1R4/8/8/4K3 w - - 0 1",
    captureSolution: "Rxb4",
    capturePrompt: "Kaleyle b4'teki piyonu al.",

    quizzes: [
      {
        question: "Kale çapraz gidebilir mi?",
        options: ["Hayır, sadece düz gider", "Evet, her yöne", "Sadece alırken", "Sadece rok yaparken"],
        answer: "Hayır, sadece düz gider"
      },
      {
        question: "Boş bir tahtada kale bir köşeden diğerine kaç hamlede gider?",
        options: ["2 hamlede", "1 hamlede", "4 hamlede", "8 hamlede"],
        answer: "2 hamlede"
      }
    ]
  },

  {
    id: "queen",
    name: "Vezir",
    symbol: "♕",
    value: "9 puan",
    summary: "Tahtanın en güçlü taşı: kale ve filin gücü birlikte!",
    rules: [
      "Hem düz hem çapraz gider — kale + fil demektir.",
      "En güçlü taştır, 9 piyon değerindedir.",
      "Sekiz yöne birden hareket edebilir.",
      "Yolunda bir taş varsa onu geçemez.",
      "Çok değerli olduğu için erken çıkarsa kovalanabilir."
    ],
    exploreFen: "4k3/3p2p1/8/8/p2Q4/8/8/4K3 w - - 0 1",
    exploreNote: "Vezir hem düz hem çapraz gidebiliyor — sekiz yöne birden!",

    obstacleFen: "4k3/8/8/3p4/3Q4/4P3/8/4K3 w - - 0 1",
    obstacleNote:
      "Vezir güçlü ama sihirli değil: yukarıda d5 piyonunda durur, e3'teki kendi piyonu da o çaprazı kapatır. Vezir de atlayamaz!",

    challenges: [
      { from: "d4", target: "d7", prompt: "Veziri düz yukarı, d7'ye götür ve piyonu al." },
      { from: "d4", target: "a4", prompt: "Şimdi veziri yatay olarak a4'e götür." },
      { from: "d4", target: "g7", prompt: "Veziri çapraz olarak g7'ye götür ve piyonu al." },
      { from: "d4", target: "a1", prompt: "Veziri çaprazdan a1 köşesine indir." }
    ],

    journey: {
      fen: "4k3/8/8/8/8/8/8/3QK3 w - - 0 1",
      from: "d1",
      target: "h5",
      par: 1,
      prompt: "Veziri d1'den h5'e götür. Vezir çok güçlü — belki tek hamlede olur?",
      successNote: "Vezir hem düz hem çapraz gittiği için çoğu kareye tek hamlede ulaşır."
    },

    captureFen: "4k3/6p1/8/8/3Q4/8/8/4K3 w - - 0 1",
    captureSolution: "Qxg7",
    capturePrompt: "Vezirle çaprazdan g7 piyonunu al.",

    quizzes: [
      {
        question: "Vezir hangi taşların gücünü birleştirir?",
        options: ["Kale ve fil", "At ve fil", "Kale ve at", "Şah ve piyon"],
        answer: "Kale ve fil"
      },
      {
        question: "Vezir taşların üzerinden atlayabilir mi?",
        options: ["Hayır, sadece at atlar", "Evet, her zaman", "Sadece çaprazda", "Sadece ilk hamlede"],
        answer: "Hayır, sadece at atlar"
      }
    ]
  },

  {
    id: "king",
    name: "Şah",
    symbol: "♔",
    value: "Paha biçilemez",
    summary: "En önemli taş. Oyun onu korumakla ilgilidir!",
    rules: [
      "Her yöne yalnızca BİR kare gider.",
      "Asla tehdit altındaki bir kareye gidemez.",
      "Diğer şahın yanına gidemez.",
      "Korunan bir taşı alamaz.",
      "Alınamaz — ama mat olursa oyun biter."
    ],
    exploreFen: "4k3/8/8/4p3/3pK3/8/8/8 w - - 0 1",
    exploreNote: "Şah her yöne sadece bir kare gidebiliyor.",

    // Siyah kale d8'de: d-sütununu tutuyor, şah d1 ve d2'ye gidemez.
    obstacleFen: "3r2k1/8/8/8/8/8/8/4K3 w - - 0 1",
    obstacleNote:
      "Siyah kale d8'de ve tüm d-sütununu tutuyor. Şaha dokun: d1 ve d2 kareleri YOK! Çünkü şah asla tehdit altındaki kareye giremez.",

    challenges: [
      { from: "e4", target: "e5", prompt: "Şahla e5'teki piyonu al." },
      { from: "e4", target: "d3", prompt: "Şahı d3 karesine indir — her yöne bir kare!" },
      { from: "e4", target: "f5", prompt: "Şahı çapraz olarak f5'e götür." }
    ],

    journey: {
      fen: "4k3/8/8/8/8/8/8/4K3 w - - 0 1",
      from: "e1",
      target: "a1",
      par: 4,
      prompt: "Şahı e1'den a1 köşesine yürüt. Her hamlede sadece bir kare!",
      successNote: "Şah yavaştır ama oyun sonunda en önemli taşlardan biri olur."
    },

    captureFen: "4k3/8/8/4p3/4K3/8/8/8 w - - 0 1",
    captureSolution: "Kxe5",
    capturePrompt: "Şahınla e5'teki piyonu al.",

    quizzes: [
      {
        question: "Şah bir hamlede kaç kare gidebilir?",
        options: ["Sadece bir kare", "İki kare", "İstediği kadar", "L şeklinde"],
        answer: "Sadece bir kare"
      },
      {
        question: "Şah tehdit altındaki bir kareye gidebilir mi?",
        options: ["Hayır, asla", "Evet, isterse", "Sadece taş alırken", "Sadece rok yaparken"],
        answer: "Hayır, asla"
      }
    ]
  }
];
