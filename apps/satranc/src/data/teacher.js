export const teacherPrompts = [
  {
    id: "wrong-move",
    title: "Yanlış hamle yaptım",
    answer: "Önce şahın güvende mi diye bak. Sonra taşın gittiği karede korunup korunmadığını kontrol et. Satrançta acele yok; iyi oyuncu önce tehlikeyi görür."
  },
  {
    id: "best-move",
    title: "En iyi hamleyi nasıl bulurum?",
    answer: "Üç soruyla başla: Şah çekebiliyor muyum, taş kazanabiliyor muyum, rakibin tehdidi var mı? Bu üçlü küçük bir satranç pusulası gibidir."
  },
  {
    id: "opening",
    title: "Açılışta ne yapmalıyım?",
    answer: "Merkezi kontrol et, atlarını ve fillerini geliştir, şahını rok ile güvene al. Aynı taşı gereksiz yere tekrar tekrar oynama."
  },
  {
    id: "fork",
    title: "Çatal nedir?",
    answer: "Çatal, bir taşın aynı anda iki hedefe saldırmasıdır. At çatalları çok eğlencelidir çünkü at taşların üzerinden zıplayabilir."
  },
  {
    id: "mate",
    title: "Matı nasıl anlarım?",
    answer: "Rakip şah tehdit altındaysa ve kaçamıyor, araya taş koyamıyor, saldıran taşı alamıyorsa bu şah mattır."
  }
];

export function answerFor(message) {
  const text = String(message || "").toLocaleLowerCase("tr");
  if (text.includes("mat")) return teacherPrompts.find((item) => item.id === "mate").answer;
  if (text.includes("açılış") || text.includes("acilis")) return teacherPrompts.find((item) => item.id === "opening").answer;
  if (text.includes("çatal") || text.includes("catal")) return teacherPrompts.find((item) => item.id === "fork").answer;
  if (text.includes("yanlış") || text.includes("hata")) return teacherPrompts.find((item) => item.id === "wrong-move").answer;
  return teacherPrompts.find((item) => item.id === "best-move").answer;
}
