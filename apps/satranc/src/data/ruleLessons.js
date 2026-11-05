/**
 * ruleLessons.js — Satranç kurallarının etkileşimli anlatımı.
 *
 * Her kural, çocuğun tahtada BİZZAT yapabileceği bir konumla öğretilir.
 * Anlatılması yeterli olan kurallar (dokunulan taş, süre) yalnızca metin içerir.
 *
 * Tüm FEN ve hamleler `tools/verify-lessons.mjs` ile doğrulanır.
 */

export const ruleLessons = [
  {
    id: "sah",
    title: "Şah",
    icon: "crown",
    summary: "Şah tehdit altındaysa buna 'şah' denir ve hemen kurtarılmalıdır.",
    detail:
      "Şahını kurtarmanın üç yolu vardır: (1) şahı kaçırmak, (2) araya bir taş koymak, (3) saldıran taşı almak. Başka seçenek yoktur!",
    mode: "bul",
    // Kale a1'de: e-sütununda dursaydı konum daha başlarken şah olurdu (kural dışı).
    fen: "4k3/8/8/8/8/8/8/R3K3 w - - 0 1",
    solution: "Ra8+",
    prompt: "Kaleyi a1'den a8'e sürüp siyah şaha şah çek.",
    successNote: "İşte bu şah! Siyah şimdi şahını kurtarmak zorunda.",
    retryHint: "Kaleyi siyah şahla aynı YATAYA getir — 8. yatay."
  },

  {
    id: "sah-mat",
    title: "Şah Mat",
    icon: "crown",
    summary: "Şah tehdit altında ve kurtulmanın hiçbir yolu yoksa oyun biter.",
    detail:
      "Mat, satrancın amacıdır. Şah kaçamıyor, araya taş konulamıyor ve saldıran taş alınamıyorsa oyun o anda sona erer.",
    mode: "bul",
    // Aptal mat (fool's mate): 1.f3 e5 2.g4 sonrası siyah oynar ve mat eder.
    fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2",
    solution: "Qh4#",
    prompt: "Siyah oynar ve TEK hamlede mat eder. Vezirini kullan!",
    successNote: "Şah mat! Buna 'iki hamlelik mat' denir, satrancın en hızlı matıdır.",
    retryHint: "Beyaz şahın önündeki f ve g piyonları ilerlemiş — hangi çapraz açıldı?"
  },

  {
    id: "pat",
    title: "Pat (Beraberlik)",
    icon: "book",
    summary: "Oynayacak yasal hamlesi olmayan ama şahı tehditte olmayan taraf pat olur.",
    detail:
      "Pat BERABERLİKTİR — kazanmak değil! Kazanan tarafta olduğunda rakibine hamle bırakmaya dikkat et, yoksa kazandığın oyun berabere biter.",
    mode: "izle",
    // Siyah oynayacak ama hiçbir yasal hamlesi yok; şahı da tehditte değil.
    fen: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1",
    prompt: "Sıra siyahta ama hiçbir yasal hamlesi yok — ve şahı tehditte DEĞİL. İşte bu pat!",
    successNote: "Pat: oyun berabere biter."
  },

  {
    id: "kisa-rok",
    title: "Kısa Rok (0-0)",
    icon: "board",
    summary: "Şahı güvene alan, tek hamlede iki taş oynatan özel hamle.",
    detail:
      "Rok için: şah ve kale hiç oynamamış olmalı, aralarındaki kareler boş olmalı, şah tehditte olmamalı ve geçtiği karelerin hiçbiri tehdit altında olmamalıdır.",
    mode: "sira",
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1",
    line: ["O-O"],
    playerColor: "w",
    prompt: "Şahını güvene al: kısa rok yap! Şaha dokun ve g1 karesine götür.",
    successNote: "Rok tamam! Şah köşede güvende, kale de oyuna katıldı."
  },

  {
    id: "uzun-rok",
    title: "Uzun Rok (0-0-0)",
    icon: "board",
    summary: "Vezir kanadına yapılan rok. Şah iki, kale üç kare gider.",
    detail:
      "Uzun rokta şah c1 karesine, kale d1 karesine gelir. Şah ve kale arasındaki ÜÇ karenin de boş olması gerekir.",
    mode: "sira",
    fen: "r3kbnr/pppqpppp/2npb3/8/3PP3/2N1B3/PPPQ1PPP/R3KBNR w KQkq - 0 1",
    line: ["O-O-O"],
    playerColor: "w",
    prompt: "Uzun rok yap: şahı e1'den c1'e götür.",
    successNote: "Uzun rok tamam! Şah c1'de, kale d1'de."
  },

  {
    id: "gecerken-alma",
    title: "Geçerken Alma (en passant)",
    icon: "pawn",
    summary: "Yanından iki kare atlayan piyonu, sanki bir kare gitmiş gibi alma hakkı.",
    detail:
      "Bu hak SADECE rakip piyon iki kare ilerledikten hemen sonraki hamlede kullanılabilir. Bir hamle beklersen hak kaybolur!",
    mode: "bul",
    // Siyah az önce d7-d5 oynadı; beyaz e5 piyonu geçerken alabilir.
    fen: "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
    solution: "exd6",
    prompt: "Siyah az önce piyonunu d7'den d5'e sürdü. e5 piyonunla onu 'geçerken al'!",
    successNote: "Geçerken alma! Piyonun d6'ya gitti ve d5'teki piyonu aldı.",
    retryHint: "e5 piyonuna dokun ve d6 karesine bak."
  },

  {
    id: "terfi",
    title: "Terfi",
    icon: "sparkles",
    summary: "Son yatağa ulaşan piyon istediği taşa dönüşür — genellikle vezire.",
    detail:
      "Piyon son sıraya varınca vezir, kale, fil veya at olabilir. Neredeyse her zaman vezir seçilir çünkü en güçlüsüdür. Bir oyunda birden fazla vezirin olabilir!",
    mode: "sira",
    fen: "8/4P3/8/8/8/8/6k1/4K3 w - - 0 1",
    line: ["e8=Q+"],
    playerColor: "w",
    prompt: "Piyonu e8'e sür ve vezire terfi ettir! (Açılan pencereden vezir seç.)",
    successNote: "Terfi! Küçük piyonun koca bir vezir oldu."
  },

  {
    id: "elli-hamle",
    title: "50 Hamle Kuralı",
    icon: "book",
    summary: "50 hamle boyunca taş alınmaz ve piyon sürülmezse beraberlik istenebilir.",
    detail:
      "Bu kural, kazanma şansı olmayan oyunların sonsuza kadar sürmesini engeller. Sayaç her taş alışında ve her piyon hamlesinde sıfırlanır.",
    mode: null
  },

  {
    id: "uc-tekrar",
    title: "Üç Kez Tekrar",
    icon: "book",
    summary: "Aynı konum üç kez oluşursa beraberlik istenebilir.",
    detail:
      "Konumun aynı olması demek; taşların aynı yerde olması, sıranın aynı tarafta olması ve rok/geçerken alma haklarının aynı olması demektir.",
    mode: null
  },

  {
    id: "dokunulan-tas",
    title: "Dokunulan Taş",
    icon: "book",
    summary: "Dokunduğun taşı, yasal bir hamlesi varsa oynamak zorundasın.",
    detail:
      "Taşı düzeltmek istiyorsan önce 'düzeltiyorum' demelisin. Rakip taşına dokunursan ve alabiliyorsan onu almak zorundasın. Bu yüzden önce düşün, sonra dokun!",
    mode: null
  }
];
