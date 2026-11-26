/**
 * introLessons.js — "Satrancı Tanıyalım" bölümünün içeriği.
 *
 * Satrancın ne olduğu, nereden geldiği ve neden zekâyı geliştirdiği ilkokul
 * seviyesinde anlatılır. Her bölümün sonunda kısa bir soru vardır.
 *
 * Tarihsel bilgiler bilinçli olarak genel tutulmuştur: kesin olmayan tarihler
 * ve rakamlar yerine, üzerinde uzlaşılan bilgiler verilir.
 */

export const introSections = [
  {
    id: "nedir",
    title: "Satranç Nedir?",
    icon: "board",
    emoji: "♟️",
    text:
      "Satranç, 64 kareli bir tahtada iki kişinin sırayla hamle yaptığı bir zekâ oyunudur. Her oyuncunun 16 taşı vardır. Amaç rakibin şahını MAT etmek, yani kurtulamayacağı bir tehdit altına almaktır.",
    points: [
      "Şans yoktur — zar yok, kart yok. Her şey senin kararına bağlı.",
      "İki oyuncu da tahtadaki her şeyi görür; gizli bilgi yoktur.",
      "Beyaz her zaman ilk hamleyi yapar.",
      "Oyun mat, pat, beraberlik ya da teslim ile biter."
    ],
    funFact: "Sadece ilk 4 hamlede 288 milyardan fazla farklı konum oluşabilir!",
    quiz: {
      question: "Satrançta asıl amaç nedir?",
      options: ["Rakibin şahını mat etmek", "En çok taşı almak", "Tahtayı doldurmak", "En hızlı oynamak"],
      answer: "Rakibin şahını mat etmek"
    }
  },

  {
    id: "tarih",
    title: "Nereden Geldi?",
    icon: "book",
    emoji: "🏛️",
    text:
      "Satrancın kökeni yaklaşık 1500 yıl önce Hindistan'da oynanan 'çaturanga' oyununa dayanır. Oyun buradan İran'a, sonra Arap dünyasına ve oradan Avrupa'ya yayıldı. Bugünkü kurallar, vezirin çok güçlü bir taş haline geldiği Avrupa'da şekillendi.",
    points: [
      "Hindistan'da 'çaturanga' adıyla ordu düzenini temsil ediyordu.",
      "İran'da 'şatranç' adını aldı; 'şah mat' sözü de buradan gelir.",
      "'Şah mat' kabaca 'şah çaresiz' anlamına gelir.",
      "Avrupa'da vezir ve fil bugünkü güçlü hareketlerine kavuştu."
    ],
    funFact: "Satranç taşlarının isimleri bir orduyu anlatır: piyonlar askerler, atlar süvariler, kaleler kuleler.",
    quiz: {
      question: "Satranç ilk olarak hangi ülkede ortaya çıkmıştır?",
      options: ["Hindistan", "Türkiye", "İtalya", "Rusya"],
      answer: "Hindistan"
    }
  },

  {
    id: "dunya",
    title: "Dünyada ve Türkiye'de Satranç",
    icon: "crown",
    emoji: "🌍",
    text:
      "Satranç bugün dünyanın hemen her ülkesinde oynanır. Uluslararası turnuvaları FIDE (Uluslararası Satranç Federasyonu) düzenler. Türkiye'de satranç okullarda seçmeli ders olarak okutulur ve Türkiye Satranç Federasyonu tarafından yürütülen çok sayıda öğrenci turnuvası vardır.",
    points: [
      "Dünya Şampiyonluğu satrancın en önemli unvanıdır.",
      "En yüksek unvan 'Büyükusta' (Grandmaster) unvanıdır.",
      "Türkiye'de ilkokullardan itibaren satranç turnuvaları düzenlenir.",
      "Satranç yaş sınırı olmayan bir spordur; 6 yaşındaki bir çocuk 60 yaşındaki birini yenebilir."
    ],
    funFact: "Satranç, olimpiyat komitesi tarafından resmi bir spor dalı olarak tanınır.",
    quiz: {
      question: "Satrançta ulaşılabilecek en yüksek unvan hangisidir?",
      options: ["Büyükusta", "Kaptan", "Şampiyon", "Usta çırağı"],
      answer: "Büyükusta"
    }
  },

  {
    id: "zeka",
    title: "Satranç Zekâyı Nasıl Geliştirir?",
    icon: "sparkles",
    emoji: "🧠",
    text:
      "Her satranç hamlesi küçük bir problem çözme çalışmasıdır: önce bakarsın, sonra düşünürsün, en son karar verirsin. Bu döngü tekrarlandıkça dikkat, sabır ve plan yapma becerisi güçlenir.",
    points: [
      "DİKKAT: Tahtadaki 64 kareyi ve 32 taşı aynı anda takip etmeyi öğrenirsin.",
      "PROBLEM ÇÖZME: Her konum yeni bir bulmacadır; ezber işe yaramaz.",
      "SABIR: Acele eden oyuncu taş kaybeder. Beklemeyi öğrenirsin.",
      "PLAN YAPMA: Tek hamle değil, birkaç hamle sonrasını düşünürsün.",
      "SORUMLULUK: Hatanı başkasına atamazsın — bu, hatadan öğrenmeyi öğretir."
    ],
    funFact: "Satranç oynarken beynin hem sol (mantık) hem sağ (görsel) tarafı birlikte çalışır.",
    quiz: {
      question: "İyi bir satranç oyuncusu hamle yapmadan önce ne yapar?",
      options: [
        "Tahtayı ve rakibin tehditlerini kontrol eder",
        "Hemen en hızlı hamleyi oynar",
        "Rakibin yüzüne bakar",
        "Taşları sayar"
      ],
      answer: "Tahtayı ve rakibin tehditlerini kontrol eder"
    }
  },

  {
    id: "nasil-baslarim",
    title: "Nasıl Başlarım?",
    icon: "target",
    emoji: "🚀",
    text:
      "Satranca başlamanın sırası vardır. Önce tahtayı ve taşları tanı, sonra kuralları öğren, ardından bol bol bulmaca çöz ve oyun oyna. Acele etme — herkes piyonla başlar!",
    points: [
      "1. Tahtayı tanı: karelerin adlarını öğren.",
      "2. Taşları öğren: her taşın nasıl hareket ettiğini bil.",
      "3. Kuralları öğren: rok, geçerken alma, terfi, mat ve pat.",
      "4. Taktik çalış: çatal, şiş ve açmaz en sık kazandıran desenlerdir.",
      "5. Oyna! Kaybetmekten korkma; her yenilgi bir derstir."
    ],
    funFact: "Dünya şampiyonları bile oyunlarını inceleyip hatalarını bulur. Kaybetmek öğrenmenin bir parçasıdır.",
    quiz: {
      question: "Satranca yeni başlayan biri önce ne yapmalı?",
      options: [
        "Tahtayı ve taşları tanımalı",
        "Ezbere açılış öğrenmeli",
        "Sadece turnuvalara katılmalı",
        "Hiç bulmaca çözmemeli"
      ],
      answer: "Tahtayı ve taşları tanımalı"
    }
  }
];
