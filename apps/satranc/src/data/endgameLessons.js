/**
 * endgameLessons.js — Temel oyun sonu teknikleri.
 *
 * Oyun sonları çocuklara genellikle en son öğretilir; oysa kazanmayı asıl
 * öğreten bölüm burasıdır. Her ders tek bir fikri anlatır ve çocuk o fikri
 * tahtada uygular.
 *
 * "alistirma" alanı olan dersler motora karşı oynanır: çocuk gerçekten mat
 * etmeyi öğrenene kadar deneyebilir.
 */

export const endgameLessons = [
  {
    id: "sah-vezir-mat",
    title: "Şah + Vezir ile Mat",
    icon: "crown",
    summary: "En temel mat tekniği. Vezirle şahı kenara sıkıştır, sonra şahınla destekle.",
    steps: [
      "Vezirle rakip şahı tahtanın kenarına doğru sıkıştır.",
      "Vezirini şaha 'at hamlesi' uzaklıkta tut — bu onu adım adım daraltır.",
      "Kendi şahını mutlaka yaklaştır; vezir tek başına mat edemez!",
      "Son adımda veziri şahın yanına koy, kendi şahın onu korusun.",
      "Dikkat: rakip şahın hamlesi kalmazsa PAT olur ve oyun berabere biter."
    ],
    // Tek hamlede mat: teknik doğru uygulandığında ulaşılan son konum.
    mode: "bul",
    fen: "7k/8/6K1/8/8/8/3Q4/8 w - - 0 1",
    // Bu konumdaki TEK mat hamlesi Qd8#'dir (motorla doğrulandı).
    solution: "Qd8#",
    prompt: "Şahın g6'da rakip şahın kaçışını kesmiş. Vezirle matı tamamla.",
    successNote: "Mat! Vezir 8. yatayı kapattı, şahın da g7 ve h7'yi tutuyor.",
    retryHint: "Siyah şahın kaçabileceği tek yatak 8. yatay. Vezirini oraya getir.",
    practice: {
      fen: "7k/8/8/3Q4/8/8/8/4K3 w - - 0 1",
      prompt: "Şimdi kendin dene: motora karşı mat et. Şahını yaklaştırmayı unutma!"
    }
  },

  {
    id: "sah-kale-mat",
    title: "Şah + Kale ile Mat",
    icon: "crown",
    summary: "Vezirden biraz daha zor ama aynı fikir: kenara sıkıştır ve merdiven kur.",
    steps: [
      "Kale, rakip şahın gidebileceği alanı bir çizgiyle böler.",
      "Kendi şahınla rakip şahı bölünen alana doğru it.",
      "İki şah karşı karşıya gelince (muhalefet) kaleyle şah çek.",
      "Rakip şah bir sıra geriler; bunu kenara varana kadar tekrarla.",
      "Son sırada kaleyle şah çektiğinde mat olur."
    ],
    mode: "bul",
    // Kale a1'de: h-sütununda dursaydı konum başlarken şah olurdu (kural dışı).
    fen: "7k/8/6K1/8/8/8/8/R7 w - - 0 1",
    solution: "Ra8#",
    prompt: "Şahın g6'da. Kaleyle 8. yatayda matı yap.",
    successNote: "Mat! Kale 8. yatayı kesti, şahın g7 ve h7'yi tutuyor.",
    retryHint: "Kaleyi siyah şahla aynı YATAYA getir — 8. yatay.",
    practice: {
      fen: "7k/8/8/8/3R4/8/8/4K3 w - - 0 1",
      prompt: "Kendin dene: kale ve şahla mat et. Sabırlı ol, adım adım sıkıştır."
    }
  },

  {
    id: "muhalefet",
    title: "Muhalefet",
    icon: "target",
    summary: "İki şah arasında tek kare varsa, hamle sırası KİMDEYSE o kaybeder alan.",
    steps: [
      "Şahlar aynı sütunda ve aralarında bir kare varsa 'muhalefet' vardır.",
      "Sıra kimdeyse o taraf çekilmek zorundadır.",
      "Bu yüzden muhalefeti ELE GEÇİRMEK piyon sonlarında kazandırır.",
      "Kuralı hatırla: muhalefeti alan taraf ilerler."
    ],
    mode: "izle",
    fen: "8/8/4k3/8/4K3/8/8/8 w - - 0 1",
    prompt:
      "İki şah arasında tek kare var — bu muhalefettir. Sıra beyazda olduğu için beyaz çekilmek zorunda; muhalefet siyahtadır."
  },

  {
    id: "piyon-terfi",
    title: "Piyonu Terfi Ettirmek",
    icon: "pawn",
    summary: "Oyun sonunda tek bir piyon oyunu kazanabilir — onu vezire ulaştır!",
    steps: [
      "Piyonun önünde şahın gitmeli, arkasında değil.",
      "Rakip şah piyonun önüne geçerse terfi zorlaşır.",
      "Muhalefeti kullanarak rakip şahı yoldan çekilmeye zorla.",
      "Kenar piyonları (a ve h) en zor olanlardır; çoğu zaman berabere biter."
    ],
    // Gösterim konumu: beyaz şah piyonun ÖNÜNDE. Anlatılmak istenen kural budur.
    mode: "izle",
    fen: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
    prompt:
      "Dikkat et: beyaz şah piyonun ÖNÜNDE duruyor, arkasında değil. Piyonu vezire ancak şah yol açarak ulaştırabilir.",
    practice: {
      fen: "8/8/8/4k3/8/8/4P3/4K3 w - - 0 1",
      prompt: "Kendin dene: piyonu vezire ulaştırıp mat et. Şahın önden gitsin!"
    }
  }
];
