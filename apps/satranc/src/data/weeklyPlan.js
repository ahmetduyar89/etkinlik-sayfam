/**
 * weeklyPlan.js — 36 haftalık satranç ders programı.
 *
 * Haftada 1 ders saati (40 dakika) esas alınmıştır. Her hafta, platformdaki
 * BİR etkinliğe karşılık gelir; öğretmen dersi doğrudan bu ekrandan anlatabilir.
 *
 * Her haftanın yapısı 40 dakikaya bölünmüştür:
 *   Isınma   (5 dk)  — hatırlatma, merak uyandırma
 *   Anlatım  (10 dk) — yeni konunun tanıtımı (tahtada gösterim)
 *   Uygulama (20 dk) — çocukların bizzat yaptığı etkinlik
 *   Kapanış  (5 dk)  — özet, mini değerlendirme
 *
 * `activities` alanındaki her bağlantı gerçek bir ekrana gider ve doğru
 * alıştırmayı açar. `tools/verify-plan.mjs` bu bağlantıların tümünü denetler:
 * var olmayan bir derse ya da taşa işaret eden hafta olamaz.
 */

/** Üniteler — her birinin kendi rengi ve simgesi vardır. */
export const units = [
  { id: "tanisma", title: "Tanışma ve Tahta", weeks: [1, 4], color: "#2e9bf0", emoji: "👋",
    goal: "Satrancı tanımak, tahtayı ve kare adlarını öğrenmek." },
  { id: "taslar", title: "Taşları Tanıyorum", weeks: [5, 12], color: "#12a594", emoji: "♟️",
    goal: "Altı taşın hareketini ve değerini öğrenmek." },
  { id: "kurallar", title: "Oyunun Kuralları", weeks: [13, 20], color: "#ff6f61", emoji: "📕",
    goal: "Şah, mat, pat ve özel hamleleri öğrenmek." },
  { id: "oyun", title: "Oyunu Oynuyorum", weeks: [21, 26], color: "#7b5cf0", emoji: "🎮",
    goal: "Açılış ilkeleriyle gerçek oyun oynamak." },
  { id: "taktik", title: "Taktik Ustası", weeks: [27, 32], color: "#ff5fa2", emoji: "🎯",
    goal: "Çatal, şiş, açmaz gibi kazandıran desenleri görmek." },
  { id: "final", title: "Oyun Sonu ve Turnuva", weeks: [33, 36], color: "#ffb020", emoji: "🏆",
    goal: "Mat tekniklerini öğrenmek ve turnuvaya katılmak." }
];

/** Bir haftanın ait olduğu üniteyi verir. */
export function unitOf(week) {
  return units.find((unit) => week >= unit.weeks[0] && week <= unit.weeks[1]) || units[0];
}

/**
 * 36 hafta.
 *
 * Alanlar:
 *   week        hafta numarası
 *   title       ders başlığı
 *   emoji       tahtaya yazılacak simge
 *   objective   kazanım (öğretmen için)
 *   warmUp      ısınma etkinliği (5 dk)
 *   teach       anlatım adımları (10 dk)
 *   practice    uygulama yönergesi (20 dk)
 *   closing     kapanış / değerlendirme (5 dk)
 *   activities  platformdaki ekranlara bağlantılar
 *   words       ders anahtar kelimeleri
 */
export const weeklyPlan = [
  /* ---------------- ÜNİTE 1: TANIŞMA VE TAHTA ---------------- */
  {
    week: 1,
    title: "Satranç ile Tanışıyoruz",
    emoji: "👋",
    objective: "Satrancın ne olduğunu, amacını ve neden oynandığını söyler.",
    warmUp: "Çocuklara sor: 'Hiç satranç gördünüz mü? Nerede?' Cevapları dinle, tahtayı göster.",
    teach: [
      "Satranç iki kişinin sırayla oynadığı bir zekâ oyunudur.",
      "Amaç rakibin ŞAH taşını mat etmektir — yani kurtulamayacağı bir tuzağa düşürmek.",
      "Şans yoktur: zar yok, kart yok. Her şey senin kararına bağlıdır.",
      "Herkes aynı sayıda taşla başlar: 16 taş."
    ],
    practice: "Çocuklar 'Satrancı Tanıyalım' bölümünün 1. konusunu okuyup sorusunu cevaplasın.",
    closing: "Sor: 'Satrançta amaç nedir?' Cevap: Şahı mat etmek.",
    activities: [
      { label: "Satranç Nedir? dersi", route: "learn", params: { bolum: "nedir" }, icon: "sparkles" }
    ],
    words: ["satranç", "şah", "mat", "zekâ oyunu"]
  },
  {
    week: 2,
    title: "Satrancın Hikâyesi",
    emoji: "🏛️",
    objective: "Satrancın nereden geldiğini ve dünyada nasıl yayıldığını anlatır.",
    warmUp: "Geçen hafta ne öğrendik? 'Satrancın amacı ne?' diye sor.",
    teach: [
      "Satranç yaklaşık 1500 yıl önce Hindistan'da 'çaturanga' adıyla doğdu.",
      "Oradan İran'a geçti; 'şah mat' sözü bu dönemden kalmadır.",
      "Sonra Arap dünyası ve Avrupa'ya yayıldı, bugünkü kurallarını orada aldı.",
      "Bugün dünyanın her ülkesinde oynanıyor ve Türkiye'de okullarda ders olarak okutuluyor."
    ],
    practice: "'Nereden Geldi?' ve 'Dünyada ve Türkiye'de Satranç' bölümlerini okuyup soruları cevaplasınlar.",
    closing: "Sor: 'Satranç ilk hangi ülkede ortaya çıktı?' Cevap: Hindistan.",
    activities: [
      { label: "Satrancın tarihçesi", route: "learn", params: { bolum: "tarih" }, icon: "book" },
      { label: "Dünyada ve Türkiye'de", route: "learn", params: { bolum: "dunya" }, icon: "crown" }
    ],
    words: ["çaturanga", "Hindistan", "büyükusta", "FIDE"]
  },
  {
    week: 3,
    title: "Tahtayı Tanıyorum: 64 Kare",
    emoji: "🔲",
    objective: "Tahtanın 8x8 = 64 kareden oluştuğunu bilir, kare adlarını okur.",
    warmUp: "Tahtayı göster ve birlikte kareleri sayın: 8 sıra × 8 sütun = 64.",
    teach: [
      "Kare adı önce SÜTUN harfi (a-h), sonra YATAY sayısı (1-8) ile okunur.",
      "Örneğin e4: e sütunu, 4. yatay.",
      "Sütunlar aşağıdan yukarı, yataylar soldan sağa uzanır.",
      "Her karenin tek bir adı vardır — tıpkı sınıftaki sıraların numarası gibi."
    ],
    practice: "Çocuklar 'Kareler' ve 'Sütun & Yatay' derslerinde karelere dokunup adlarını görsün.",
    closing: "Tahtada bir kare göster, adını sor. Birkaç çocuğa sırayla sor.",
    activities: [
      { label: "Kareler dersi", route: "board", params: { ders: "0" }, icon: "board" },
      { label: "Sütun & Yatay", route: "board", params: { ders: "1" }, icon: "board" }
    ],
    words: ["kare", "sütun", "yatay", "koordinat"]
  },
  {
    week: 4,
    title: "Merkez, Renkler ve Kurulum",
    emoji: "🎨",
    objective: "Merkez kareleri gösterir, tahtayı doğru yönde kurar.",
    warmUp: "Hızlı oyun: 'f6 nerede?' diye sor, parmakla göstersinler.",
    teach: [
      "Tahtanın ortasındaki d4-e4-d5-e5 kareleri MERKEZ'dir; en değerli bölge burasıdır.",
      "Merkezdeki taş daha çok kareye ulaşır: at merkezde 8, köşede 2 kareye gider.",
      "Tahtada 32 açık, 32 koyu kare vardır.",
      "ALTIN KURAL: Tahtayı kurarken sağ alt köşe AÇIK renk olmalıdır."
    ],
    practice: "'Merkez', 'Kare Renkleri' ve 'Kurulum' derslerini yapsınlar; kare rengi oyununu oynasınlar.",
    closing: "Sor: 'Tahtayı kurarken sağ alt köşe ne renk olmalı?' Cevap: Açık.",
    activities: [
      { label: "Merkez dersi", route: "board", params: { ders: "2" }, icon: "target" },
      { label: "Kare Renkleri oyunu", route: "board", params: { ders: "3" }, icon: "sparkles" },
      { label: "Tahta kurulumu", route: "board", params: { ders: "4" }, icon: "board" }
    ],
    words: ["merkez", "açık kare", "koyu kare", "kurulum"]
  },

  /* ---------------- ÜNİTE 2: TAŞLARI TANIYORUM ---------------- */
  {
    week: 5,
    title: "Piyon: Küçük Ama Cesur",
    emoji: "♙",
    objective: "Piyonun nasıl ilerlediğini ve nasıl taş aldığını gösterir.",
    warmUp: "Tahtayı birlikte kurun. Piyonları en öne dizin.",
    teach: [
      "Piyon sadece İLERİ gider, asla geri dönmez.",
      "İlk hamlesinde istersen iki kare gidebilir, sonra hep birer kare.",
      "DİKKAT: Düz giderken taş ALAMAZ! Taşı ÇAPRAZ alır.",
      "Önü kapalıysa hiç ilerleyemez.",
      "Son yatağa ulaşırsa vezire terfi eder — küçük piyon koca vezir olur!"
    ],
    practice: "Piyon dersinin tüm aşamalarını yapsınlar: Keşfet, Engeller, Görevler, Yolculuk, Taş Alma.",
    closing: "Sor: 'Piyon taşı nasıl alır?' Cevap: Çapraz.",
    activities: [
      { label: "Piyon dersi", route: "pieces", params: { tas: "pawn" }, icon: "pawn" }
    ],
    words: ["piyon", "terfi", "çapraz alma"]
  },
  {
    week: 6,
    title: "Kale: Düz Giden Güç",
    emoji: "♖",
    objective: "Kalenin satır ve sütun boyunca hareket ettiğini gösterir.",
    warmUp: "Piyon tekrarı: 'Piyon geri gidebilir mi?' Hayır!",
    teach: [
      "Kale satır ve sütun boyunca DÜZ gider, istediği kadar kare.",
      "Çapraz gidemez.",
      "Yolunda bir taş varsa onu geçemez — ama rakip taşı ise alabilir.",
      "Boş tahtada kale her kareye en fazla İKİ hamlede ulaşır.",
      "Açık sütunlarda (piyon olmayan) çok güçlüdür."
    ],
    practice: "Kale dersini yapsınlar. Yolculuk etkinliğinde a1'den h8'e 2 hamlede gitmeyi denesinler.",
    closing: "Sor: 'Kale çapraz gidebilir mi?' Cevap: Hayır.",
    activities: [
      { label: "Kale dersi", route: "pieces", params: { tas: "rook" }, icon: "board" }
    ],
    words: ["kale", "sütun", "yatay", "açık sütun"]
  },
  {
    week: 7,
    title: "Fil: Çapraz Koşucu",
    emoji: "♗",
    objective: "Filin çapraz hareket ettiğini ve renk değiştiremediğini açıklar.",
    warmUp: "Kale tekrarı: tahtada kaleyi bir köşeden diğerine 2 hamlede götürtün.",
    teach: [
      "Fil sadece ÇAPRAZ gider, istediği kadar kare.",
      "Başladığı karenin rengini ASLA değiştiremez.",
      "Herkesin bir açık kare fili, bir koyu kare fili vardır.",
      "Yolunda taş varsa geçemez.",
      "Açık tahtada çok güçlü, kapalı tahtada sıkışır."
    ],
    practice: "Fil dersini yapsınlar. 'Engeller' aşamasında kendi piyonunun yolu kestiğini görsünler.",
    closing: "Sor: 'Koyu karede başlayan fil açık kareye geçebilir mi?' Cevap: Hayır.",
    activities: [
      { label: "Fil dersi", route: "pieces", params: { tas: "bishop" }, icon: "sparkles" }
    ],
    words: ["fil", "çapraz", "kare rengi"]
  },
  {
    week: 8,
    title: "At: Zıplayan Taş",
    emoji: "♘",
    objective: "Atın L şeklinde gittiğini ve taşların üzerinden atladığını gösterir.",
    warmUp: "Fil tekrarı. Sonra sor: 'Sizce hangi taş engelleri umursamaz?'",
    teach: [
      "At L şeklinde gider: iki kare düz, sonra bir kare yana.",
      "TEK ATLAYAN TAŞ ODUR — diğer taşların üzerinden zıplar!",
      "Her zaman durduğu karenin renginden FARKLI bir kareye iner.",
      "Merkezde 8 kareye, köşede sadece 2 kareye gidebilir.",
      "Etrafı tamamen çevrili olsa bile hapsolmaz."
    ],
    practice: "At dersini yapsınlar. 'Engeller' aşaması çok önemli: çevrili at yine 8 kareye zıplıyor. At turunu (a1→h8) denesinler.",
    closing: "Sor: 'At taşların üzerinden atlar mı?' Cevap: Evet, tek o atlar.",
    activities: [
      { label: "At dersi", route: "pieces", params: { tas: "knight" }, icon: "knight" },
      { label: "At turu (yolculuk)", route: "pieces", params: { tas: "knight", asama: "6" }, icon: "route" }
    ],
    words: ["at", "L hareketi", "atlama"]
  },
  {
    week: 9,
    title: "Vezir: En Güçlü Taş",
    emoji: "♕",
    objective: "Vezirin kale ve filin gücünü birleştirdiğini açıklar.",
    warmUp: "At tekrarı: bir çocuk tahtada atı L şeklinde oynatsın.",
    teach: [
      "Vezir hem DÜZ hem ÇAPRAZ gider — kale + fil demektir.",
      "Sekiz yöne birden hareket edebilir.",
      "En güçlü taştır: 9 piyon değerindedir.",
      "Ama sihirli değildir: yolunda taş varsa o da geçemez.",
      "Çok değerli olduğu için erken çıkarsa rakip onu kovalar."
    ],
    practice: "Vezir dersini yapsınlar. Yolculukta d1'den h5'e tek hamlede gidebildiğini keşfetsinler.",
    closing: "Sor: 'Vezir hangi iki taşın gücünü birleştirir?' Cevap: Kale ve fil.",
    activities: [
      { label: "Vezir dersi", route: "pieces", params: { tas: "queen" }, icon: "crown" }
    ],
    words: ["vezir", "en güçlü taş", "sekiz yön"]
  },
  {
    week: 10,
    title: "Şah: En Önemli Taş",
    emoji: "♔",
    objective: "Şahın her yöne bir kare gittiğini ve korunması gerektiğini bilir.",
    warmUp: "Vezir tekrarı. Sor: 'Peki en GÜÇLÜ taş vezirse, en ÖNEMLİ taş hangisi?'",
    teach: [
      "Şah her yöne yalnızca BİR kare gider.",
      "Asla tehdit altındaki bir kareye gidemez.",
      "Diğer şahın yanına gidemez.",
      "Korunan bir taşı alamaz.",
      "Şah alınmaz — ama mat olursa oyun biter. Bu yüzden en önemli taştır."
    ],
    practice: "Şah dersini yapsınlar. 'Engeller' aşamasında kalenin tuttuğu karelere giremediğini görsünler.",
    closing: "Sor: 'Şah tehdit altındaki kareye gidebilir mi?' Cevap: Asla.",
    activities: [
      { label: "Şah dersi", route: "pieces", params: { tas: "king" }, icon: "crown" }
    ],
    words: ["şah", "güvenlik", "tehdit"]
  },
  {
    week: 11,
    title: "Taş Değerleri",
    emoji: "💎",
    objective: "Taşların puan değerlerini söyler ve takas kararı verir.",
    warmUp: "Altı taşı da tahtada göster, isimlerini birlikte söyleyin.",
    teach: [
      "Piyon 1, at 3, fil 3, kale 5, vezir 9 puan.",
      "Şahın değeri yoktur — paha biçilemez!",
      "Bu sayılar 'takas kârlı mı?' sorusuna cevap verir.",
      "Örnek: atını verip kale alırsan (3 verip 5 alırsın) kârlısın.",
      "Ama sayılar her şey değildir: taşın durduğu yer de önemlidir."
    ],
    practice: "'Taşı Tanı' ve 'Eşleştirme' mini oyunlarını oynasınlar.",
    closing: "Sor: 'Vezir kaç puan?' Cevap: 9. 'Şah kaç puan?' Cevap: Paha biçilemez.",
    activities: [
      { label: "Taşı Tanı oyunu", route: "minigames", params: { oyun: "tasi-tani" }, icon: "game" },
      { label: "Eşleştirme oyunu", route: "minigames", params: { oyun: "eslestirme" }, icon: "puzzle" }
    ],
    words: ["değer", "takas", "puan"]
  },
  {
    week: 12,
    title: "Taşlar Ünitesi Değerlendirme",
    emoji: "✅",
    objective: "Altı taşın hareketini hatasız gösterir.",
    warmUp: "Hızlı soru turu: her taşın nasıl gittiğini sırayla sor.",
    teach: [
      "Bugün öğrendiklerimizi test ediyoruz.",
      "Piyon düz gider çapraz alır; kale düz; fil çapraz; at L; vezir hepsi; şah birer kare.",
      "Unutma: sadece AT taşların üzerinden atlar."
    ],
    practice: "'Taşı Yerine Sürükle' ve 'Doğru Kareyi Bul' oyunlarını oynasınlar. Puanlarını karşılaştırsınlar.",
    closing: "Her çocuk en sevdiği taşı ve nedenini söylesin.",
    activities: [
      { label: "Taşı Yerine Sürükle", route: "minigames", params: { oyun: "tasi-surukle" }, icon: "game" },
      { label: "Doğru Kareyi Bul", route: "minigames", params: { oyun: "kare-bul" }, icon: "board" },
      { label: "Rozetlerini gör", route: "badges", icon: "badge" },
      { label: "Askıda taş bulmacaları (94 kolay)", route: "puzzles", params: { tema: "askida", seviye: "Kolay" }, icon: "puzzle" }
    ],
    words: ["değerlendirme", "tekrar"]
  },

  /* ---------------- ÜNİTE 3: OYUNUN KURALLARI ---------------- */
  {
    week: 13,
    title: "Şah Çekme",
    emoji: "⚠️",
    objective: "Şahın tehdit altında olduğu durumu tanır ve 'şah' der.",
    warmUp: "Taş hareketlerini hızlıca tekrar edin.",
    teach: [
      "Bir taş rakip şaha saldırıyorsa buna ŞAH denir.",
      "Şah çekildiğinde rakip BAŞKA hiçbir şey yapamaz, önce şahını kurtarmalıdır.",
      "Şah çekmek her zaman iyi değildir — amaçsız şah çekme!",
      "Şahı kurtarmanın üç yolu vardır: kaç, araya gir, saldıranı al."
    ],
    practice: "'Şah' kural dersini yapsınlar: kaleyi 8. yataya sürüp şah çeksinler.",
    closing: "Tahtada bir konum kur, 'şah var mı?' diye sor.",
    activities: [
      { label: "Şah dersi", route: "rules", params: { ders: "sah" }, icon: "crown" }
    ],
    words: ["şah çekme", "tehdit"]
  },
  {
    week: 14,
    title: "Şahı Kurtarmanın 3 Yolu",
    emoji: "🛡️",
    objective: "Şah çekildiğinde üç kurtulma yolunu uygular.",
    warmUp: "Geçen hafta: 'Şah ne demek?' Cevapları dinle.",
    teach: [
      "1. KAÇ: Şahı tehdit altında olmayan bir kareye götür.",
      "2. ARAYA GİR: Saldıran taş ile şah arasına kendi taşını koy.",
      "3. SALDIRANI AL: Şah çeken taşı al.",
      "At şah çektiğinde araya girilemez — çünkü at atlar! Ya kaç ya atı al.",
      "Bu üç yoldan hiçbiri yoksa... işte o zaman MAT olur."
    ],
    practice: "Bilgisayara karşı kolay seviyede oynasınlar; şah çekildiğinde nasıl kurtulduklarını konuşun.",
    closing: "Sor: 'At şah çekerse araya taş koyabilir miyiz?' Cevap: Hayır.",
    activities: [
      { label: "Bilgisayara karşı oyna", route: "play", icon: "bot" },
      { label: "Yapay zekâ öğretmenine sor", route: "teacher", icon: "teacher" }
    ],
    words: ["kaçmak", "araya girmek", "saldıranı almak"]
  },
  {
    week: 15,
    title: "Şah Mat — Oyunun Amacı",
    emoji: "👑",
    objective: "Şah mat durumunu tanır ve tek hamlede mat bulur.",
    warmUp: "Şahı kurtarmanın üç yolunu birlikte sayın.",
    teach: [
      "Şah tehdit altında VE üç kurtuluş yolu da yoksa bu ŞAH MAT'tır.",
      "Mat olduğunda oyun o anda biter.",
      "Satrancın tüm amacı budur.",
      "En hızlı mat 2 hamlede olur — buna 'iki hamlelik mat' denir."
    ],
    practice: "'Şah Mat' kural dersini yapsınlar, sonra Kolay seviyede mat bulmacaları çözsünler.",
    closing: "Sor: 'Mat olunca ne olur?' Cevap: Oyun biter.",
    activities: [
      { label: "Şah Mat dersi", route: "rules", params: { ders: "sah-mat" }, icon: "crown" },
      { label: "Tek hamlede mat (414 kolay)", route: "puzzles", params: { tema: "mat-1", seviye: "Kolay" }, icon: "puzzle" }
    ],
    words: ["şah mat", "iki hamlelik mat"]
  },
  {
    week: 16,
    title: "Pat ve Beraberlik",
    emoji: "🤝",
    objective: "Pat durumunu tanır, beraberlik hâllerini sayar.",
    warmUp: "Mat tekrarı: tahtada bir mat konumu göster.",
    teach: [
      "PAT: Sırası gelen oyuncunun hiç yasal hamlesi yok AMA şahı da tehditte değil.",
      "Pat BERABERLİKTİR — kazanmak değil!",
      "Kazanıyorken dikkat: rakibe hamle bırakmazsan kazandığın oyun berabere biter.",
      "Diğer beraberlikler: 50 hamle kuralı, üç kez tekrar, yetersiz materyal."
    ],
    practice: "'Pat' dersini incelesinler; sonra 50 hamle ve üç tekrar kartlarını okusunlar.",
    closing: "Sor: 'Pat kazanmak mıdır?' Cevap: Hayır, beraberliktir.",
    activities: [
      { label: "Pat dersi", route: "rules", params: { ders: "pat" }, icon: "book" }
    ],
    words: ["pat", "beraberlik", "50 hamle"]
  },
  {
    week: 17,
    title: "Kısa Rok",
    emoji: "🏰",
    objective: "Kısa rok yapar ve şartlarını sayar.",
    warmUp: "Şahın güvenliği neden önemli? Tartışın.",
    teach: [
      "Rok, TEK hamlede iki taş oynatan özel bir harekettir.",
      "Şah iki kare kaleye doğru gider, kale şahın diğer yanına geçer.",
      "Şartlar: şah ve kale hiç oynamamış olmalı, araları boş olmalı.",
      "Şah tehdit altındayken rok yapılamaz, tehdit altındaki kareden geçemez.",
      "Rok hem şahı güvene alır hem kaleyi oyuna sokar — çifte kazanç!"
    ],
    practice: "'Kısa Rok' dersini yapsınlar: şaha dokunup g1'e götürsünler.",
    closing: "Sor: 'Şah tehdit altındayken rok yapabilir miyiz?' Cevap: Hayır.",
    activities: [
      { label: "Kısa Rok dersi", route: "rules", params: { ders: "kisa-rok" }, icon: "board" }
    ],
    words: ["rok", "0-0", "şah güvenliği"]
  },
  {
    week: 18,
    title: "Uzun Rok",
    emoji: "🏯",
    objective: "Uzun rok yapar, kısa roktan farkını söyler.",
    warmUp: "Kısa rok tekrarı: bir çocuk tahtada göstersin.",
    teach: [
      "Uzun rok vezir kanadına yapılır.",
      "Şah e1'den c1'e gider (iki kare), kale a1'den d1'e gelir (üç kare).",
      "Aradaki ÜÇ karenin de boş olması gerekir.",
      "Kısa rok daha hızlı ve güvenlidir; uzun rok kaleyi merkeze getirir."
    ],
    practice: "'Uzun Rok' dersini yapsınlar; iki rok türünü karşılaştırsınlar.",
    closing: "Sor: 'Uzun rokta şah hangi kareye gider?' Cevap: c1.",
    activities: [
      { label: "Uzun Rok dersi", route: "rules", params: { ders: "uzun-rok" }, icon: "board" }
    ],
    words: ["uzun rok", "0-0-0", "vezir kanadı"]
  },
  {
    week: 19,
    title: "Piyon Terfisi",
    emoji: "✨",
    objective: "Piyonu son yatağa ulaştırıp terfi ettirir.",
    warmUp: "Piyon tekrarı: 'Piyon geri gider mi?' Hayır.",
    teach: [
      "Piyon son yatağa (8. veya 1.) ulaşırsa BAŞKA BİR TAŞA dönüşür.",
      "Vezir, kale, fil veya at seçebilirsin.",
      "Neredeyse her zaman vezir seçilir çünkü en güçlüsüdür.",
      "Bir oyunda birden fazla vezirin olabilir!",
      "Bu yüzden oyun sonunda tek bir piyon bile oyunu kazandırabilir."
    ],
    practice: "'Terfi' dersini yapsınlar: piyonu e8'e sürüp vezir seçsinler.",
    closing: "Sor: 'Piyon son sıraya varınca ne olur?' Cevap: İstediği taşa dönüşür.",
    activities: [
      { label: "Terfi dersi", route: "rules", params: { ders: "terfi" }, icon: "sparkles" },
      { label: "Terfi ile mat bulmacaları (52 kolay)", route: "puzzles", params: { tema: "terfi", seviye: "Kolay" }, icon: "puzzle" }
    ],
    words: ["terfi", "vezir yapmak"]
  },
  {
    week: 20,
    title: "Geçerken Alma",
    emoji: "🎭",
    objective: "Geçerken alma kuralını doğru zamanda uygular.",
    warmUp: "Terfi tekrarı. Sonra: 'Satrancın en garip kuralını öğreneceğiz!'",
    teach: [
      "Piyonun iki kare atlaması bazen rakip piyonun yanından geçmesini sağlar.",
      "Bu durumda rakip, sanki piyon BİR kare gitmiş gibi onu alabilir.",
      "Buna 'geçerken alma' (en passant) denir.",
      "ÇOK ÖNEMLİ: Bu hak sadece HEMEN sonraki hamlede kullanılabilir. Beklersen kaybolur!"
    ],
    practice: "'Geçerken Alma' dersini yapsınlar. Alınan piyonun nerede durduğuna dikkat etsinler.",
    closing: "Sor: 'Geçerken almayı ne zaman yapabiliriz?' Cevap: Hemen bir sonraki hamlede.",
    activities: [
      { label: "Geçerken Alma dersi", route: "rules", params: { ders: "gecerken-alma" }, icon: "pawn" }
    ],
    words: ["geçerken alma", "en passant"]
  },

  /* ---------------- ÜNİTE 4: OYUNU OYNUYORUM ---------------- */
  {
    week: 21,
    title: "Oyun Görgüsü ve Kurallar",
    emoji: "🤝",
    objective: "Dokunulan taş kuralını ve oyun görgüsünü uygular.",
    warmUp: "Tüm özel hamleleri sayın: rok, terfi, geçerken alma.",
    teach: [
      "DOKUNULAN TAŞ: Dokunduğun taşı, yasal hamlesi varsa oynamak zorundasın.",
      "Taşı düzeltmek istersen önce 'düzeltiyorum' demelisin.",
      "Oyun başında ve sonunda rakiple tokalaşılır.",
      "Rakip düşünürken sessiz olunur, acele ettirilmez.",
      "Kaybetmek ayıp değildir — her yenilgi bir derstir."
    ],
    practice: "İkişerli eşleşip gerçek oyun oynasınlar (veya bilgisayara karşı).",
    closing: "Sınıfça satranç görgü kurallarını tahtaya yazın.",
    activities: [
      { label: "Kurallar sayfası", route: "rules", icon: "book" },
      { label: "Bilgisayara karşı oyna", route: "play", icon: "bot" }
    ],
    words: ["dokunulan taş", "saygı", "spor ahlakı"]
  },
  {
    week: 22,
    title: "Açılışın 3 Altın Kuralı",
    emoji: "🚀",
    objective: "Açılışta merkez, gelişim ve rok ilkelerini uygular.",
    warmUp: "Sor: 'Oyuna nasıl başlamalıyız? Hangi taşı önce oynarız?'",
    teach: [
      "1. MERKEZİ TUT: Bir merkez piyonunu (e4 veya d4) ilerlet.",
      "2. TAŞLARINI GELİŞTİR: Atlarını ve fillerini çıkar. Atlar merkeze!",
      "3. ROK YAP: Şahını güvene al.",
      "Yapma: Aynı taşı gereksiz tekrar tekrar oynama.",
      "Yapma: Vezirini çok erken çıkarma, kovalanır."
    ],
    practice: "Bilgisayara karşı oynayıp ilk 5 hamlede bu üç kuralı uygulasınlar.",
    closing: "Üç altın kuralı birlikte tekrarlayın.",
    activities: [
      { label: "Açılışlar sayfası", route: "openings", icon: "route" },
      { label: "Bilgisayara karşı dene", route: "play", icon: "bot" }
    ],
    words: ["merkez", "gelişim", "rok"]
  },
  {
    week: 23,
    title: "İtalyan Açılışı",
    emoji: "🇮🇹",
    objective: "İtalyan açılışının ilk hamlelerini oynar ve amacını açıklar.",
    warmUp: "Açılışın üç altın kuralını tekrarlayın.",
    teach: [
      "1.e4 e5 2.Af3 Ac6 3.Fc4 — İtalyan Açılışı.",
      "e4: merkezde alan; filin ve vezirin yolu açılır.",
      "Af3: at gelişir ve e5 piyonuna saldırır.",
      "Fc4: fil en güçlü çaprazına çıkar ve zayıf f7 karesini hedefler.",
      "f7 karesi siyahın en zayıf noktasıdır — sadece şah korur."
    ],
    practice: "İtalyan Açılışı dersini oynasınlar, sonundaki soruyu cevaplasınlar.",
    closing: "Sor: 'Fil neden c4'e gider?' Cevap: f7'yi hedeflemek için.",
    activities: [
      { label: "İtalyan Açılışı", route: "openings", params: { ders: "italyan" }, icon: "route" }
    ],
    words: ["İtalyan açılışı", "f7 zayıflığı"]
  },
  {
    week: 24,
    title: "İspanyol ve Dört At",
    emoji: "🇪🇸",
    objective: "İki açılış daha oynar, fikirlerini karşılaştırır.",
    warmUp: "İtalyan açılışını bir çocuk tahtada oynasın.",
    teach: [
      "İSPANYOL: 1.e4 e5 2.Af3 Ac6 3.Fb5 — fil, e5'i KORUYAN ata saldırır.",
      "Fikir: 'koruyanı hedefle' — rakibin savunmasını zorla.",
      "DÖRT AT: 1.e4 e5 2.Af3 Ac6 3.Ac3 Af6 — herkes atlarını geliştirir.",
      "Dört At sakin ve öğreticidir; sürpriz yoktur, sağlam gelişim vardır."
    ],
    practice: "Her iki açılışı da oynasınlar ve sorularını cevaplasınlar.",
    closing: "Sor: 'İspanyol'da fil b5'te neye saldırır?' Cevap: e5'i koruyan ata.",
    activities: [
      { label: "İspanyol Açılışı", route: "openings", params: { ders: "ispanyol" }, icon: "route" },
      { label: "Dört At Oyunu", route: "openings", params: { ders: "dort-at" }, icon: "route" }
    ],
    words: ["İspanyol", "Dört At", "gelişim"]
  },
  {
    week: 25,
    title: "Siyahla Savunma: Sicilya, Fransız, Caro-Kann",
    emoji: "🛡️",
    objective: "Siyahın 1.e4'e verebileceği farklı cevapları tanır.",
    warmUp: "Sor: 'Beyaz e4 oynadı. Siyah ne yapmalı?'",
    teach: [
      "SİCİLYA (1...c5): Merkezi yandan kontrol eder; mücadeleci ve dengesizdir.",
      "FRANSIZ (1...e6): Önce sessiz, sonra d5 ile merkeze meydan okur. Çok sağlam.",
      "CARO-KANN (1...c6): Fransız'a benzer ama c8 fili sıkışmaz.",
      "Hepsi doğrudur — hangisini sevdiğini oynayarak bulursun."
    ],
    practice: "Üç savunmadan en az ikisini oynasınlar.",
    closing: "Herkes en sevdiği savunmayı söylesin ve nedenini açıklasın.",
    activities: [
      { label: "Sicilya Savunması", route: "openings", params: { ders: "sicilya" }, icon: "route" },
      { label: "Fransız Savunması", route: "openings", params: { ders: "fransiz" }, icon: "route" },
      { label: "Caro-Kann", route: "openings", params: { ders: "caro-kann" }, icon: "route" }
    ],
    words: ["Sicilya", "Fransız", "Caro-Kann", "savunma"]
  },
  {
    week: 26,
    title: "Açılış Hataları ve İskoç",
    emoji: "⚡",
    objective: "Sık yapılan açılış hatalarından kaçınır.",
    warmUp: "Açılışın üç altın kuralını tekrar sayın.",
    teach: [
      "İSKOÇ: 1.e4 e5 2.Af3 Ac6 3.d4 — merkezi hemen açar, taşlar hızla aktifleşir.",
      "HATA 1: Vezirle erken saldırıya çıkmak (kovalanır, zaman kaybedersin).",
      "HATA 2: Kenar piyonlarını (a, h) gereksiz ilerletmek.",
      "HATA 3: Rok yapmayı geciktirmek — şah ortada kalır, tehlikeye girer.",
      "HATA 4: Aynı taşı defalarca oynamak."
    ],
    practice: "İskoç açılışını oynasınlar; sonra bilgisayara karşı bir oyun oynayıp raporda hatalarına baksınlar.",
    closing: "Sor: 'Vezirimizi neden erken çıkarmıyoruz?' Cevap: Kovalanır, zaman kaybederiz.",
    activities: [
      { label: "İskoç Açılışı", route: "openings", params: { ders: "iskoc" }, icon: "route" },
      { label: "Oyna ve raporunu incele", route: "play", icon: "bot" },
      { label: "Askıda taş bulmacaları (46 orta)", route: "puzzles", params: { tema: "askida", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["İskoç", "açılış hatası", "tempo"]
  },

  /* ---------------- ÜNİTE 5: TAKTİK USTASI ---------------- */
  {
    week: 27,
    title: "Çatal — İki Hedef Birden",
    emoji: "🍴",
    objective: "Çatal desenini tanır ve at çatalı kurar.",
    warmUp: "Sor: 'Bir taşla aynı anda iki şeye saldırabilir miyiz?'",
    teach: [
      "ÇATAL: Tek taşın aynı anda İKİ hedefe saldırması.",
      "Rakip aynı anda iki tehdide cevap veremez.",
      "Şahını kurtarır, sen de diğer taşı kazanırsın.",
      "At çatalları en tehlikelisidir — çünkü at zıplar, kaçamazsın!",
      "İpucu: Rakip şah ve vezir aynı 'at mesafesinde' ise orada çatal ara."
    ],
    practice: "Çatal dersini yapsınlar, sonra çatal bulmacaları çözsünler.",
    closing: "Sor: 'Çatal ne demek?' Cevap: Tek taşla iki hedefe saldırmak.",
    activities: [
      { label: "Çatal dersi", route: "tactics", params: { ders: "catal" }, icon: "target" },
      { label: "Çatal bulmacaları (80 kolay)", route: "puzzles", params: { tema: "catal", seviye: "Kolay" }, icon: "puzzle" },
      { label: "Çatal bulmacaları (80 orta)", route: "puzzles", params: { tema: "catal", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["çatal", "çifte saldırı"]
  },
  {
    week: 28,
    title: "Şiş — Öndekini Kaçır",
    emoji: "🍢",
    objective: "Şiş desenini tanır ve uygular.",
    warmUp: "Çatal tekrarı: bir çocuk tahtada at çatalı göstersin.",
    teach: [
      "ŞİŞ: Öndeki DEĞERLİ taşı tehdit edersin, kaçınca arkadakini alırsın.",
      "Kale, fil ve vezir şiş yapabilir — çünkü çizgi boyunca giderler.",
      "Şah şişte en sık hedeftir: şah kaçmak ZORUNDA olduğu için arkadaki taş düşer.",
      "Şiş ile açmaz karıştırılır: şişte ÖNDEKİ daha değerlidir."
    ],
    practice: "Şiş dersini yapsınlar; kaleyi doğru sütuna getirmeyi denesinler.",
    closing: "Sor: 'Şişte hangisi daha değerli — öndeki mi arkadaki mi?' Cevap: Öndeki.",
    activities: [
      { label: "Şiş dersi", route: "tactics", params: { ders: "sis" }, icon: "target" },
      { label: "Şiş bulmacaları (65 kolay)", route: "puzzles", params: { tema: "sis", seviye: "Kolay" }, icon: "puzzle" }
    ],
    words: ["şiş", "çizgi taktiği"]
  },
  {
    week: 29,
    title: "Açmaz — Kıpırdayamayan Taş",
    emoji: "📌",
    objective: "Açmaz desenini tanır ve açmazdaki taşa saldırır.",
    warmUp: "Şiş tekrarı. 'Şimdi şişin tersini öğreneceğiz.'",
    teach: [
      "AÇMAZ: Bir taş oynarsa ARKASINDAKİ daha değerli taş düşer.",
      "Bu yüzden o taş kıpırdayamaz — 'açmazda' kalır.",
      "Arkada ŞAH varsa taş hiç oynayamaz (mutlak açmaz).",
      "Açmazdaki taşa saldırmak çok etkilidir: savunamaz!",
      "Fil, kale ve vezir açmaz kurabilir."
    ],
    practice: "Açmaz dersini yapsınlar: fili doğru çapraza yerleştirsinler.",
    closing: "Sor: 'Açmazda hangisi daha değerli?' Cevap: Arkadaki.",
    activities: [
      { label: "Açmaz dersi", route: "tactics", params: { ders: "acmaz" }, icon: "target" },
      { label: "Açmaz bulmacaları (87 orta)", route: "puzzles", params: { tema: "acmaz", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["açmaz", "mutlak açmaz"]
  },
  {
    week: 30,
    title: "Çifte Şah",
    emoji: "⚡",
    objective: "Çifte şahın neden çok güçlü olduğunu açıklar.",
    warmUp: "Şahı kurtarmanın üç yolunu tekrar sayın.",
    teach: [
      "ÇİFTE ŞAH: İki taş AYNI ANDA şah çeker.",
      "Araya taş koymak işe yaramaz — iki saldıran var.",
      "Saldıranı almak da işe yaramaz — biri kalır.",
      "Geriye tek yol kalır: ŞAH KAÇMAK ZORUNDA.",
      "Bu yüzden çifte şah çok güçlü bir kozdur."
    ],
    practice: "Çifte Şah dersini yapsınlar: atı oynatıp arkadaki kalenin açılmasını sağlasınlar.",
    closing: "Sor: 'Çifte şahta ne yapmak zorundayız?' Cevap: Şahı kaçırmak.",
    activities: [
      { label: "Çifte Şah dersi", route: "tactics", params: { ders: "cifte-sah" }, icon: "crown" },
      { label: "Çifte şah bulmacaları (60 orta)", route: "puzzles", params: { tema: "cifte-sah", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["çifte şah", "keşif şahı"]
  },
  {
    week: 31,
    title: "Mat Ağı Kurmak",
    emoji: "🕸️",
    objective: "Şahın kaçış karelerini sayar ve matı planlar.",
    warmUp: "Bir mat konumu göster, 'neden mat?' diye sor.",
    teach: [
      "Mat etmeden önce şahın kaçabileceği kareleri SAY.",
      "Sonra o kareleri kapatan hamleyi ara.",
      "İyi oyuncular matı hamle hamle örer, aceleci davranmaz.",
      "Geri sıra matı: rakip şahın önündeki piyonlar hiç oynamamışsa son sıra zayıftır!"
    ],
    practice: "Mat Ağı dersini yapsınlar, sonra 'Matı Bul' oyununu 60 saniye oynasınlar.",
    closing: "Sor: 'Mat aramadan önce ne yaparız?' Cevap: Kaçış karelerini sayarız.",
    activities: [
      { label: "Mat Ağı dersi", route: "tactics", params: { ders: "mat-agi" }, icon: "crown" },
      { label: "Matı Bul oyunu", route: "minigames", params: { oyun: "mati-bul" }, icon: "game" },
      { label: "İki hamlede mat (227 orta)", route: "puzzles", params: { tema: "mat-2", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["mat ağı", "kaçış karesi", "geri sıra matı"]
  },
  {
    week: 32,
    title: "Feda ve Boğma Matı",
    emoji: "💥",
    objective: "Amaçlı fedayı tanır, boğma matını oynar.",
    warmUp: "Sor: 'Vezirimizi bilerek verir miyiz? Neden?'",
    teach: [
      "FEDA: Daha büyük bir kazanç için bilerek taş vermek.",
      "Feda ancak SOMUT bir karşılığı varsa doğrudur: mat, daha değerli taş ya da çok güçlü saldırı.",
      "'Güzel görünsün' diye taş verilmez!",
      "BOĞMA MATI: Vezir feda edilir, rakip kale kendi şahının kaçışını kapatır, at mat eder.",
      "Satrancın en güzel desenlerinden biridir."
    ],
    practice: "Boğma matı dizisini adım adım oynasınlar (5 hamle).",
    closing: "Sor: 'Feda ne zaman doğrudur?' Cevap: Somut bir karşılığı varsa.",
    activities: [
      { label: "Feda ve Boğma Matı", route: "tactics", params: { ders: "feda" }, icon: "sparkles" },
      { label: "Boğma matı bulmacaları (54 orta)", route: "puzzles", params: { tema: "bogmaca", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["feda", "boğma matı"]
  },

  /* ---------------- ÜNİTE 6: OYUN SONU VE TURNUVA ---------------- */
  {
    week: 33,
    title: "Şah ve Vezir ile Mat",
    emoji: "👑",
    objective: "Şah + vezir ile yalnız şahı mat eder.",
    warmUp: "Sor: 'Elimizde sadece vezir ve şah kaldı. Nasıl kazanırız?'",
    teach: [
      "Vezirle rakip şahı tahtanın KENARINA doğru sıkıştır.",
      "Vezirini şaha 'at hamlesi' uzaklıkta tut — alanı adım adım daralt.",
      "Kendi şahını mutlaka yaklaştır: vezir TEK BAŞINA mat edemez!",
      "Son adımda veziri şahın yanına koy, kendi şahın onu korusun.",
      "DİKKAT: Rakip şahın hamlesi kalmazsa PAT olur, kazanç gider!"
    ],
    practice: "Dersi yapıp sonra 'Alıştırma' sekmesinde motora karşı gerçekten mat etsinler.",
    closing: "Sor: 'Vezir tek başına mat edebilir mi?' Cevap: Hayır, şahın yardımı gerekir.",
    activities: [
      { label: "Şah + Vezir matı", route: "endgames", params: { ders: "sah-vezir-mat" }, icon: "crown" },
      { label: "Tek hamlede mat (206 orta)", route: "puzzles", params: { tema: "mat-1", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["oyun sonu", "sıkıştırma", "pat tehlikesi"]
  },
  {
    week: 34,
    title: "Şah ve Kale ile Mat",
    emoji: "🏰",
    objective: "Şah + kale ile merdiven matı uygular.",
    warmUp: "Şah+vezir matını bir çocuk tahtada göstersin.",
    teach: [
      "Kale, rakip şahın alanını bir çizgiyle BÖLER.",
      "Kendi şahınla rakip şahı o dar alana doğru it.",
      "İki şah karşı karşıya gelince (muhalefet) kaleyle şah çek.",
      "Rakip şah bir sıra geriler; bunu kenara varana kadar tekrarla.",
      "Buna 'merdiven matı' denir — adım adım yukarı çıkar gibi."
    ],
    practice: "Dersi yapıp 'Alıştırma' sekmesinde motora karşı mat etsinler. Sabırlı olsunlar!",
    closing: "Sor: 'Kale ne işe yarar bu matta?' Cevap: Şahın alanını böler.",
    activities: [
      { label: "Şah + Kale matı", route: "endgames", params: { ders: "sah-kale-mat" }, icon: "crown" },
      { label: "Koridor matı bulmacaları (46 orta)", route: "puzzles", params: { tema: "koridor", seviye: "Orta" }, icon: "puzzle" }
    ],
    words: ["merdiven matı", "alan bölme"]
  },
  {
    week: 35,
    title: "Muhalefet ve Piyon Sonu",
    emoji: "⚔️",
    objective: "Muhalefeti tanır, piyonu vezire ulaştırmayı dener.",
    warmUp: "İki şahı karşı karşıya koy, aralarında bir kare bırak. 'Kim çekilmek zorunda?'",
    teach: [
      "MUHALEFET: İki şah aynı sütunda, aralarında TEK kare varsa.",
      "Sırası gelen taraf çekilmek ZORUNDADIR — yani muhalefeti kaybeder.",
      "Bu yüzden muhalefeti ELE GEÇİRMEK piyon sonlarında kazandırır.",
      "Piyon sonunda şahın piyonun ÖNÜNDE gitmeli, arkasında değil.",
      "Kenar piyonları (a ve h) en zordur, çoğu zaman berabere biter."
    ],
    practice: "Muhalefet ve Piyon Terfisi derslerini inceleyip alıştırmayı denesinler.",
    closing: "Sor: 'Muhalefette sırası gelen ne yapmak zorunda?' Cevap: Çekilmek.",
    activities: [
      { label: "Muhalefet dersi", route: "endgames", params: { ders: "muhalefet" }, icon: "target" },
      { label: "Piyonu terfi ettir", route: "endgames", params: { ders: "piyon-terfi" }, icon: "pawn" }
    ],
    words: ["muhalefet", "piyon sonu", "terfi yarışı"]
  },
  {
    week: 36,
    title: "Sınıf Turnuvası ve Kapanış",
    emoji: "🏆",
    objective: "Öğrendiklerini gerçek oyunda uygular, sonucu saygıyla karşılar.",
    warmUp: "Yıl boyunca öğrendiklerimizi birlikte sayalım: tahta, taşlar, kurallar, taktikler, matlar.",
    teach: [
      "Bugün sınıf turnuvası yapıyoruz!",
      "Turnuva kuralları: tokalaşarak başla, sessiz oyna, sonuca saygı göster.",
      "Kazanmak güzeldir ama öğrenmek daha değerlidir.",
      "Her oyundan sonra 'hangi hamlem iyiydi, hangisi hatalıydı?' diye düşün."
    ],
    practice: "Eşleşmeler yapın ve oynatın. Bilgisayara karşı da oynayıp doğruluk raporlarını karşılaştırsınlar.",
    closing: "Rozet ve profil sayfasında yıl boyunca kazandıklarını görsünler. Herkesi alkışlayın!",
    activities: [
      { label: "Turnuva: bilgisayara karşı", route: "play", icon: "bot" },
      { label: "Profilim", route: "profile", icon: "user" },
      { label: "Rozetlerim", route: "badges", icon: "badge" }
    ],
    words: ["turnuva", "spor ahlakı", "değerlendirme"]
  }
];

/** Toplam hafta sayısı. */
export const totalWeeks = weeklyPlan.length;

/** Numarasına göre haftayı verir. */
export function weekByNumber(week) {
  return weeklyPlan.find((item) => item.week === Number(week)) || null;
}

/** Bir ünitenin haftalarını verir. */
export function weeksOfUnit(unitId) {
  const unit = units.find((item) => item.id === unitId);
  if (!unit) return [];
  return weeklyPlan.filter((item) => item.week >= unit.weeks[0] && item.week <= unit.weeks[1]);
}
