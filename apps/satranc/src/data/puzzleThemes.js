/** Bulmaca tema adları ve yanlış hamlede gösterilen öğretici yönlendirmeler. */
export const PUZZLE_THEME_LABELS = {
  "mat-1": "Tek hamlede mat",
  "mat-2": "İki hamlede mat",
  koridor: "Koridor matı",
  bogmaca: "Boğmaca matı",
  terfi: "Terfi ile mat",
  catal: "At çatalı",
  sis: "Şiş",
  acmaz: "Açmaz",
  "cifte-sah": "Çifte şah",
  askida: "Askıda taş"
};

export const PUZZLE_THEME_NUDGES = {
  koridor: "Şahın önü kendi piyonlarıyla kapalı. Son yatayı boydan boya tarayan hamleyi ara.",
  bogmaca: "Şah kendi taşlarıyla çevrili. Taşların üzerinden atlayabilen tek taş hangisi?",
  terfi: "Son yataya bir adım kalan piyonu bul; oraya varınca yeni bir taşa dönüşür.",
  catal: "Atının aynı anda İKİ hedefe saldırabileceği kareyi ara.",
  sis: "Şah ile arkasındaki değerli taşı aynı hatta yakala, sonra şah çek.",
  acmaz: "Siyah vezir şahıyla aynı hatta. O hattın arkasına geçersen vezir kıpırdayamaz.",
  "cifte-sah": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu? İki taş birden şah çeksin.",
  askida: "Rakibin hiçbir taşının korumadığı taşı bul."
};
