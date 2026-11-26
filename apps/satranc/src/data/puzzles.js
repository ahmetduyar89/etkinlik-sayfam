/**
 * puzzles.js — OTOMATİK ÜRETİLMİŞ DOSYA. Elle düzenlemeyin.
 *
 * Üreten:  tools/generate-puzzles.mjs
 * Üretim:  2026-09-02
 *
 * Buradaki her bulmaca kendi kural motorumuzla doğrulanmıştır:
 *  - Mat bulmacalarında mat ZORUNLUDUR (rakibin her cevabı mat ile biter).
 *  - Her bulmacanın TEK bir doğru ilk hamlesi vardır.
 *  - Taş kazanma bulmacalarında en iyi hamle, ikinciden en az 2,5 piyon daha iyidir.
 *  - Zorluk, temanın ADINA değil konumun taş sayısına göre verilir. Bir temayı
 *    komple tek seviyeye sabitlemek onu diğer seviyelerde GÖRÜNMEZ yapar;
 *    çocuk konu düğmesine basmadıkça o temayla hiç karşılaşmaz.
 *  - Her bulmacanın deseni ayrıca doğrulanır: "koridor" gerçekten son yatayda
 *    mat eder, "boğmaca" şahı kendi taşları çevreler, "açmaz"da mıhlı taş
 *    hattan çıkamaz, "askıda"da alınan taş gerçekten korumasızdır.
 *
 * Toplam 1934 bulmaca — Kolay: 799, Orta: 923, Zor: 212
 *
 * Alanlar:
 *   fen       başlangıç konumu
 *   side      hamle sırası ("w")
 *   solution  doğru ilk hamle (SAN)
 *   line      çözümün tam hamle sırası
 *   mateIn    kaç hamlede mat (çatal bulmacalarında null)
 */

export const puzzles = [
  {
    "id": "puzzle-0001",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #1",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7K/3R4/1R6/8/8/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0002",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #2",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4Q3/2K4P/k7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa1#",
    "line": [
      "Qa1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0003",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #3",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4Q3/8/k1K5/8/N7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0004",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #4",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4P1K1/4R3/7k/8/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0005",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #5",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/6Q1/8/1R6/8/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Qa6#",
    "line": [
      "Qa6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0006",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #6",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7Q/3N4/8/5K2/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0007",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #7",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7B/5K1k/8/5R2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0008",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #8",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1Q6/8/5P2/8/2K5/k7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb3#",
    "line": [
      "Qb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0009",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #9",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K1k3/R6R/8/8/8/P7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0010",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #10",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R5/8/8/7R/8/2P1K1k1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7#",
    "line": [
      "Rg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0011",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #11",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/8/7K/8/8/6B1/4Q3/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0012",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #12",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/4R3/8/8/8/8/4K3/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0013",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #13",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/7R/1K6/8/8/8/1B6/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0014",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #14",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/k7/6Q1/5K2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb6#",
    "line": [
      "Qb6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0015",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #15",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7k/5KR1/8/4R3/5P2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0016",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #16",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/4N3/2Q2K1k/8 w - - 0 1",
    "side": "w",
    "solution": "Qh7#",
    "line": [
      "Qh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0017",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #17",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3Q4/K7/8/8/7R/1k6 w - - 0 1",
    "side": "w",
    "solution": "Qd1#",
    "line": [
      "Qd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0018",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #18",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/5Q2/8/3K4/8/8/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0019",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #19",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7Q/8/8/8/K7/8/R7/6k1 w - - 0 1",
    "side": "w",
    "solution": "Qa1#",
    "line": [
      "Qa1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0020",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #20",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2NQ4/8/K1k5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd3#",
    "line": [
      "Qd3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0021",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #21",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/R1P5/8/8/4K3/R7/4k3 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0022",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #22",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/8/6R1/1Q6/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0023",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #23",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q4/8/8/5K2/8/4R3/k7 w - - 0 1",
    "side": "w",
    "solution": "Qd1#",
    "line": [
      "Qd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0024",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #24",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7R/2R5/4P3/8/8/3k1K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rd7#",
    "line": [
      "Rd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0025",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #25",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4K3/4P3/8/8/6R1/3R4/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0026",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #26",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q4/7P/8/8/8/8/5K1k w - - 0 1",
    "side": "w",
    "solution": "Qh3#",
    "line": [
      "Qh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0027",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #27",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6Q1/8/8/8/K7/4R3/5k2 w - - 0 1",
    "side": "w",
    "solution": "Qg2#",
    "line": [
      "Qg2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0028",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #28",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/8/1K3P2/8/8/8/1R6/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0029",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #29",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K6/8/8/6Q1/8/8/4k1N1 w - - 0 1",
    "side": "w",
    "solution": "Qe2#",
    "line": [
      "Qe2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0030",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #30",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5K2/8/8/8/2Q5/6B1/3k4 w - - 0 1",
    "side": "w",
    "solution": "Bf3#",
    "line": [
      "Bf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0031",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #31",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K5k/8/8/8/8/6R1/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0032",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #32",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k5K1/8/8/3R4/8/8/1Q6/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0033",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #33",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/6Q1/8/8/5K2/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0034",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #34",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6R1/8/8/4Q3/k7/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0035",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #35",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/R7/3R4/8/P7/8/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0036",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #36",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R4Q1/8/8/8/k7/6K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa2#",
    "line": [
      "Qa2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0037",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #37",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/6Q1/5K2/7k/4P3/8 w - - 0 1",
    "side": "w",
    "solution": "Qg3#",
    "line": [
      "Qg3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0038",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #38",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/3Q3K/8/1R6/2k5 w - - 0 1",
    "side": "w",
    "solution": "Qd2#",
    "line": [
      "Qd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0039",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #39",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "B7/8/6K1/3Q4/5k2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg5#",
    "line": [
      "Qg5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0040",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #40",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/4R3/2K5/8/8/7R/4P3/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0041",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #41",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2K5/k7/1N6/4Q3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa3#",
    "line": [
      "Qa3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0042",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #42",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/1R6/8/8/2K5/R7/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0043",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #43",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4N2k/3Q4/8/8/8/8/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0044",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #44",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/3R4/5K2/3R4/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rd1#",
    "line": [
      "Rd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0045",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #45",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3K4/k7/8/8/1R6/6R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0046",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #46",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/1R1B4/8/2B5/3K4/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Be5#",
    "line": [
      "Be5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0047",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #47",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/4RK2/8/7R/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0048",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #48",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/8/8/8/2Q1B3/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0049",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #49",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/6Q1/8/8/8/KR6/8 w - - 0 1",
    "side": "w",
    "solution": "Qa6#",
    "line": [
      "Qa6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0050",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #50",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5R2/8/3K4/8/8/7P/7R/k7 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0051",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #51",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K5/k7/2R5/6Q1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa4#",
    "line": [
      "Qa4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0052",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #52",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4PR2/5R2/8/8/2K1k3 w - - 0 1",
    "side": "w",
    "solution": "Re4#",
    "line": [
      "Re4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0053",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #53",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4K1Q1/8/8/7k/8/8/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0054",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #54",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/7R/8/7K/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0055",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #55",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/Q7/8/K7/8/8/3R4/1k6 w - - 0 1",
    "side": "w",
    "solution": "Qg1#",
    "line": [
      "Qg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0056",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #56",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/1Q6/8/k7/3K4/2R5 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0057",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #57",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/4R3/1R6/8/3K4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0058",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #58",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "kB3K2/2Q5/8/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa7#",
    "line": [
      "Qa7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0059",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #59",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/6R1/8/2Q5/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0060",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #60",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5R2/8/8/7K/P7/2R5/k7 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0061",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #61",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/2Q5/8/8/8/8/3R4/5k2 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0062",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #62",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4k1K1/4P3/8/3Q4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd6#",
    "line": [
      "Qd6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0063",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #63",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1R6/4K3/2k5/4Q3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd5#",
    "line": [
      "Qd5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0064",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #64",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7R/kP6/7K/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0065",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #65",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6R1/5P2/8/5K2/7k/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0066",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #66",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5K2/2Q5/5k2/8/7N/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe6#",
    "line": [
      "Qe6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0067",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #67",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/7R/8/8/8/5R2/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0068",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #68",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6N1/8/R7/8/8/8/8/5K1k w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0069",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #69",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6B1/8/2B5/4K3/5R2/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0070",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #70",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/3R4/8/8/8/7P/8/2R1K3 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0071",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #71",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3Q4/8/6K1/4k3/8/5B2 w - - 0 1",
    "side": "w",
    "solution": "Qf4#",
    "line": [
      "Qf4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0072",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #72",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/1K5Q/4B3/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf7#",
    "line": [
      "Qf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0073",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #73",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/1Q5K/8/3R4/k7 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0074",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #74",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K1k/8/8/2Q5/2P5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh5#",
    "line": [
      "Qh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0075",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #75",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K1k5/R7/8/5R2/8/7P/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0076",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #76",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K6/8/8/3B4/6Q1/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Qf2#",
    "line": [
      "Qf2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0077",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #77",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/R7/8/K7/6P1/8/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0078",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #78",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/K1k5/8/5R2/8/8/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rc5#",
    "line": [
      "Rc5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0079",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #79",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/1R6/8/8/8/k7/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0080",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #80",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/5R2/8/6R1/K2k4 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0081",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #81",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/1Q6/3kP3/8/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Qd5#",
    "line": [
      "Qd5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0082",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #82",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/6R1/4R3/8/3K4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0083",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #83",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/5Q1B/7k/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Qg4#",
    "line": [
      "Qg4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0084",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #84",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/2RK4/P7/8/8/8/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0085",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #85",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/8/8/8/8/5KR1/7P/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0086",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #86",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5K2/6R1/7k/5P2/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0087",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #87",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/7Q/8/2K1k3/7N w - - 0 1",
    "side": "w",
    "solution": "Qf2#",
    "line": [
      "Qf2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0088",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #88",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/8/7K/8/8/N3Q3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0089",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #89",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/3R4/8/K7/N7/k7 w - - 0 1",
    "side": "w",
    "solution": "Rd1#",
    "line": [
      "Rd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0090",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #90",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/6R1/3P4/6K1/8/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0091",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #91",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/3B4/3K4/4R3/8/7B/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0092",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #92",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5R2/8/8/6R1/8/7k/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0093",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #93",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/N2K4/8/8/2Q5/k7 w - - 0 1",
    "side": "w",
    "solution": "Nb3#",
    "line": [
      "Nb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0094",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #94",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7k/5K1P/3Q4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0095",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #95",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/2K3R1/8/8/8/1N6/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0096",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #96",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "N7/7R/8/8/8/4K3/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0097",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #97",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/8/8/2K5/8/2k5/4Q3/8 w - - 0 1",
    "side": "w",
    "solution": "Rd3#",
    "line": [
      "Rd3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0098",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #98",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/8/6RK/8/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kg4#",
    "line": [
      "Kg4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0099",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #99",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K6/8/7k/7B/8/8/8/1Q6 w - - 0 1",
    "side": "w",
    "solution": "Qg6#",
    "line": [
      "Qg6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0100",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #100",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/3R4/8/8/8/3K4/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0101",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #101",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3K3k/8/8/2P5/8/3R4/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0102",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #102",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3R4/8/8/8/6R1/2K1k3 w - - 0 1",
    "side": "w",
    "solution": "Rd1#",
    "line": [
      "Rd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0103",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #103",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/1R6/2P5/8/8/8/8/R4K2 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0104",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #104",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7K/8/7R/8/8/1R6/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0105",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #105",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4P3/8/8/8/5K2/6RR/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0106",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #106",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/2K5/8/6R1/8/8/3N4 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0107",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #107",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/5R2/3K4/5P2/8/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0108",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #108",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/QR6/8/5K2/7k w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0109",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #109",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/3R4/8/8/8/8/8/4R2K w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0110",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #110",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7R/8/k7/7K/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0111",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #111",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/6R1/8/8/7R/2K5/1P6/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0112",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #112",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6K1/8/8/8/1Q6/R7/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qb1#",
    "line": [
      "Qb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0113",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #113",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K6/8/R7/8/6R1/8/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0114",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #114",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/3N1R2/8/5K1k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0115",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #115",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4B3/4R3/1B5k/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Be1#",
    "line": [
      "Be1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0116",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #116",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7k/8/2R5/8/6Q1/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0117",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #117",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5K1k/8/4P3/3Q4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh3#",
    "line": [
      "Qh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0118",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #118",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/2R5/8/8/8/8/7k/3K4 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0119",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #119",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2QR4/8/8/8/8/8/6K1/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qe6#",
    "line": [
      "Qe6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0120",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #120",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/8/8/8/1R4K1/2Q5/8 w - - 0 1",
    "side": "w",
    "solution": "Qa2#",
    "line": [
      "Qa2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0121",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #121",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5R2/8/6R1/8/2K1k3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re6#",
    "line": [
      "Re6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0122",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #122",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K2/2Q5/7k/3R4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0123",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #123",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/R7/8/2P5/8/5R2/5K1k w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0124",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #124",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7k/5K2/8/6Q1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0125",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #125",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/5R2/8/8/8/8/2R5/k7 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0126",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #126",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/5Q2/8/8/R7/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0127",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #127",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6P1/k7/4K3/1R6/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0128",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #128",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4Q3/8/2K5/1R6/2k5 w - - 0 1",
    "side": "w",
    "solution": "Qe1#",
    "line": [
      "Qe1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0129",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #129",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/1Q6/3k4/1K2R3 w - - 0 1",
    "side": "w",
    "solution": "Qe3#",
    "line": [
      "Qe3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0130",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #130",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3Q4/8/8/7k/5K2/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg5#",
    "line": [
      "Qg5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0131",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #131",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3RR3/5K1k/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0132",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #132",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4R3/k7/7P/K7/4R3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "R4e7#",
    "line": [
      "R4e7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0133",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #133",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/1K6/8/R7/8/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0134",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #134",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/1K6/2B5/8/8/2Q5/5k2 w - - 0 1",
    "side": "w",
    "solution": "Qf2#",
    "line": [
      "Qf2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0135",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #135",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/8/8/3K2R1/3R4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0136",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #136",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/2K5/8/N7/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0137",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #137",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K2/Q7/6k1/1R6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0138",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #138",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4K3/2R5/1R6/8/k7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0139",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #139",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/2K5/8/2R5/8/8/P5R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0140",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #140",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7R/K7/8/8/8/8/3R4/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0141",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #141",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5K2/7k/5R2/8/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0142",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #142",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5B2/7k/8/8/8/2Q5/4K3 w - - 0 1",
    "side": "w",
    "solution": "Qg6#",
    "line": [
      "Qg6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0143",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #143",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K1k5/Q7/8/8/8/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0144",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #144",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6K1/6R1/7P/8/1R6/8/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0145",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #145",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/7K/8/6R1/8/8/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0146",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #146",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/8/8/8/2Q3B1/8/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qe2#",
    "line": [
      "Qe2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0147",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #147",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4PQ2/8/4K3/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Qb1#",
    "line": [
      "Qb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0148",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #148",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6P1/8/4K3/2R5/7R/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0149",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #149",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6K1/4R3/8/1P6/8/8/1R6/6k1 w - - 0 1",
    "side": "w",
    "solution": "Re1#",
    "line": [
      "Re1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0150",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #150",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/K6k/3P4/6R1/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0151",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #151",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/4R3/8/8/2R5/7K/6P1/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0152",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #152",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5R2/8/7R/8/8/4K1k1 w - - 0 1",
    "side": "w",
    "solution": "Rg6#",
    "line": [
      "Rg6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0153",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #153",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/1K6/Q7/2k5 w - - 0 1",
    "side": "w",
    "solution": "Qc2#",
    "line": [
      "Qc2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0154",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #154",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4B3/5K1k/8/8/2Q5 w - - 0 1",
    "side": "w",
    "solution": "Qh1#",
    "line": [
      "Qh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0155",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #155",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2R5/8/6K1/2R5/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0156",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #156",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5B2/2R5/8/8/8/5K1k w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0157",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #157",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/K7/8/k6P/2R5/8/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rf5#",
    "line": [
      "Rf5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0158",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #158",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4K3/3P2k1/2R4R/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rcg5#",
    "line": [
      "Rcg5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0159",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #159",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/6R1/8/6K1/1R6/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0160",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #160",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K4R/4P3/2k5/4R3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0161",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #161",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/7k/8/6R1/Q2K4 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0162",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #162",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5R2/1k6/7R/1K6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0163",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #163",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/1B4K1/7Q/k7 w - - 0 1",
    "side": "w",
    "solution": "Qa2#",
    "line": [
      "Qa2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0164",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #164",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/8/8/8/8/8/8/2N2K1k w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0165",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #165",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/5R2/1K4R1/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0166",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #166",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6Q1/8/8/4K3/2R5/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0167",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #167",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/8/7k/8/P5K1/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0168",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #168",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q3K/8/8/7k/8/5N2/8 w - - 0 1",
    "side": "w",
    "solution": "Qg4#",
    "line": [
      "Qg4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0169",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #169",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6R1/8/5P2/2R5/8/1K5k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0170",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #170",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/1K6/4R3/k7/2R5 w - - 0 1",
    "side": "w",
    "solution": "Re2#",
    "line": [
      "Re2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0171",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #171",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6Q1/8/6R1/5k2/3K4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf7#",
    "line": [
      "Qf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0172",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #172",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/3R4/8/8/k1K4R w - - 0 1",
    "side": "w",
    "solution": "Ra4#",
    "line": [
      "Ra4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0173",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #173",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4Q3/5K1k/8/8/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0174",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #174",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3R4/8/2B5/7k/4BK2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0175",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #175",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k1K1N3/8/8/8/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0176",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #176",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K5k/8/4R3/8/8/8/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0177",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #177",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/3R4/8/8/5Q2/8/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0178",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #178",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/1R6/8/8/8/6R1/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0179",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #179",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2B5/8/6R1/8/3KBk2 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0180",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #180",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/8/k1K5/7Q w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0181",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #181",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3Q4/6k1/8/6K1/8/1B6 w - - 0 1",
    "side": "w",
    "solution": "Qg6#",
    "line": [
      "Qg6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0182",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #182",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/8/8/1P6/7k/8/1K4R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0183",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #183",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/P2K4/4R2R/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0184",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #184",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6B1/8/8/8/R4K2/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0185",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #185",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/2R5/BB6/8/4K3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0186",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #186",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/4K3/1P6/Q7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0187",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #187",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4R3/8/8/7K/8/7k/2R5 w - - 0 1",
    "side": "w",
    "solution": "Re2#",
    "line": [
      "Re2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0188",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #188",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4Q3/8/8/8/K7/8/3R4/7k w - - 0 1",
    "side": "w",
    "solution": "Qe1#",
    "line": [
      "Qe1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0189",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #189",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4B3/8/8/2K2R2/6B1/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0190",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #190",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4B3/8/8/6k1/3Q4/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Qf3#",
    "line": [
      "Qf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0191",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #191",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1B6/8/8/7R/6k1/8/2B4K/8 w - - 0 1",
    "side": "w",
    "solution": "Bd1#",
    "line": [
      "Bd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0192",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #192",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3K4/8/8/8/8/7Q/2kB4 w - - 0 1",
    "side": "w",
    "solution": "Qc2#",
    "line": [
      "Qc2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0193",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #193",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/8/8/8/k7/8/1Q6/4R3 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0194",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #194",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/8/8/1R6/8/3R3K/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0195",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #195",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4B3/8/8/8/8/4Bk1K/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Bc6#",
    "line": [
      "Bc6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0196",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #196",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/8/4K3/8/1Q6/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0197",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #197",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K6/8/1R6/2Q5/8/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qa4#",
    "line": [
      "Qa4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0198",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #198",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/8/P1Q5/8/8/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb7#",
    "line": [
      "Qb7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0199",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #199",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1R6/7K/4R3/8/8/k6P/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0200",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #200",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/8/k7/4K3/8/8/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0201",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #201",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/5Q2/6K1/7R/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0202",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #202",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5R2/4P3/2K1k3/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Re2#",
    "line": [
      "Re2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0203",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #203",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/8/8/8/6R1/K7/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0204",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #204",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7R/5KP1/8/5k2/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0205",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #205",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2R5/8/4K3/6P1/3k4/2R5 w - - 0 1",
    "side": "w",
    "solution": "R6c2#",
    "line": [
      "R6c2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0206",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #206",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2KB4/8/8/4B3/5R2/7k w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0207",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #207",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5R2/8/8/8/8/6Q1/K1k5 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0208",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #208",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/P7/8/7K/3R4/8/5R2/7k w - - 0 1",
    "side": "w",
    "solution": "Rd1#",
    "line": [
      "Rd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0209",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #209",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/2N5/8/8/8/8/k1K5/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0210",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #210",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1B3R2/8/5K1k/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0211",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #211",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4R3/8/8/8/5K1k/3R4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0212",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #212",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7R/8/8/8/2K5/6B1/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0213",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #213",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2R5/8/8/1K6/8/8/7R/k7 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0214",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #214",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/1B5k/1R6/8/K7/2B5 w - - 0 1",
    "side": "w",
    "solution": "Be8#",
    "line": [
      "Be8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0215",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #215",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K5/8/k7/8/1R6/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0216",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #216",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/3R4/8/2R5/8/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0217",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #217",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/R7/8/8/K7/6Q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0218",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #218",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/8/1R6/8/1K6/7Q/8 w - - 0 1",
    "side": "w",
    "solution": "Qa2#",
    "line": [
      "Qa2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0219",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #219",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/6B1/2R5/B7/5K1k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0220",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #220",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R5/8/7k/3K4/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0221",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #221",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5Q2/7k/2B5/8/8/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Be4#",
    "line": [
      "Be4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0222",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #222",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6Q1/8/1R6/7k/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Qg3#",
    "line": [
      "Qg3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0223",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #223",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K6/8/8/8/8/5N2/7Q/3k4 w - - 0 1",
    "side": "w",
    "solution": "Qd2#",
    "line": [
      "Qd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0224",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #224",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4N2k/5K2/8/8/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0225",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #225",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R5/2R5/8/8/3K4/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0226",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #226",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/6R1/3k4/7Q/2K5 w - - 0 1",
    "side": "w",
    "solution": "Qd2#",
    "line": [
      "Qd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0227",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #227",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/K6B/8/5R2/8/8/B7 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0228",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #228",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/4R3/6R1/5K1k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0229",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #229",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2QN4/k7/8/8/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb7#",
    "line": [
      "Qb7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0230",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #230",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7K/8/7k/2Q5/4N3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg4#",
    "line": [
      "Qg4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0231",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #231",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5Q2/8/2B1k1K1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf5#",
    "line": [
      "Qf5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0232",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #232",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/5R2/8/8/8/3R4/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0233",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #233",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/5Q2/8/K7/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qf1#",
    "line": [
      "Qf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0234",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #234",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/8/1K2R3/6B1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0235",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #235",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6P1/8/8/1Q6/1K6/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qe1#",
    "line": [
      "Qe1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0236",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #236",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k1K5/3R4/8/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0237",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #237",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/7R/8/8/4R3/6K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0238",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #238",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5R2/8/8/8/1K6/8/6RP/k7 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0239",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #239",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/8/7Q/4K3/8/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0240",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #240",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3QB3/8/8/8/K7/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qd1#",
    "line": [
      "Qd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0241",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #241",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2Q5/8/8/8/K7/8/k2N4 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0242",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #242",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2R5/8/4K3/7P/5R2/k7 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0243",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #243",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4Q3/2N5/8/k7/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Qb4#",
    "line": [
      "Qb4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0244",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #244",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/R7/3K4/8/2R5/7k w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0245",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #245",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/8/2P5/1R5K/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0246",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #246",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/K7/4R3/2P5/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0247",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #247",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/1R6/8/8/6R1/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0248",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #248",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2R5/8/6R1/8/8/8/4P3/3K1k2 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0249",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #249",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5R2/1R6/8/8/k7/8/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0250",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #250",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1Q6/B7/k7/4K3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb5#",
    "line": [
      "Qb5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0251",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #251",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/QR3K2/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0252",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #252",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/6K1/8/k7/8/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0253",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #253",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2K4R/8/8/8/6R1/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0254",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #254",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/4K3/R7/8/6N1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0255",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #255",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/K7/8/k1N5/6Q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa3#",
    "line": [
      "Qa3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0256",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #256",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K2/3Q4/8/1R6/8/8/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Qa7#",
    "line": [
      "Qa7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0257",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #257",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/8/6R1/6K1/8/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0258",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #258",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k1K5/5B2/8/8/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0259",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #259",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1Q6/2R5/8/k7/8/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0260",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #260",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/1B4K1/8/2Q5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf7#",
    "line": [
      "Qf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0261",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #261",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/7K/8/8/4R3/8/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0262",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #262",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4B3/8/6R1/B4K2/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0263",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #263",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1R3P2/8/5R2/8/1K6/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0264",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #264",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6R1/8/1Q6/6K1/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0265",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #265",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q4/8/8/6K1/6R1/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Qh7#",
    "line": [
      "Qh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0266",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #266",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3K4/8/8/8/8/8/4Q3/1k1N4 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0267",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #267",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4B3/8/2Q5/k6K/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb4#",
    "line": [
      "Qb4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0268",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #268",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q4/k7/8/1R6/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa4#",
    "line": [
      "Qa4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0269",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #269",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/8/1K6/8/Q7/8/8/3B4 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0270",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #270",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K1k3/8/5R2/8/8/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re3#",
    "line": [
      "Re3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0271",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #271",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/6P1/7R/8/k1K4R/8 w - - 0 1",
    "side": "w",
    "solution": "Ra4#",
    "line": [
      "Ra4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0272",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #272",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/8/3K4/3N4/8/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0273",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #273",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3R4/8/k7/8/1Q6/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0274",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #274",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4kB2/7K/8/8/1Q6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe7#",
    "line": [
      "Qe7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0275",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #275",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "R7/8/7k/1K6/8/6R1/1P6/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0276",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #276",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/3K1Q2/8/2P5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe7#",
    "line": [
      "Qe7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0277",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #277",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5Q2/8/B7/8/1K6/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qf1#",
    "line": [
      "Qf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0278",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #278",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/R7/8/8/8/8/8/1K5R w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0279",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #279",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/6k1/8/6K1/8/8/P3R3/8 w - - 0 1",
    "side": "w",
    "solution": "Re7#",
    "line": [
      "Re7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0280",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #280",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/k7/8/8/1Q6/8/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0281",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #281",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/1R6/8/8/8/8/4K2Q/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0282",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #282",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5K2/3B3R/8/6B1/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0283",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #283",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/8/2Q5/8/B7/8/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Qd7#",
    "line": [
      "Qd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0284",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #284",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/3Q1K1k/8/4N3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh1#",
    "line": [
      "Qh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0285",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #285",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/4k3/8/4K3/2PR4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "R4d7#",
    "line": [
      "R4d7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0286",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #286",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K2/7k/8/8/8/8/6Q1/5B2 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0287",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #287",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/2Q5/5K2/8/8/8/4P3/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0288",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #288",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6Q1/8/8/8/8/1Pk5/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Qc4#",
    "line": [
      "Qc4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0289",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #289",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/2K5/8/6Q1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa5#",
    "line": [
      "Qa5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0290",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #290",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1Q6/8/k7/8/8/8/6K1/2R5 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0291",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #291",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2Q5/8/8/8/8/6R1/7k/4K3 w - - 0 1",
    "side": "w",
    "solution": "Qh3#",
    "line": [
      "Qh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0292",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #292",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/8/8/5P2/5R2/8/8/k4K2 w - - 0 1",
    "side": "w",
    "solution": "Ra4#",
    "line": [
      "Ra4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0293",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #293",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4K3/8/3R4/8/7k/1P6/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0294",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #294",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/8/N5K1/8/1R6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0295",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #295",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K5/8/6Q1/5N2/8/8/7k w - - 0 1",
    "side": "w",
    "solution": "Qg2#",
    "line": [
      "Qg2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0296",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #296",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/8/1P2K2k/8/8/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0297",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #297",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/8/2K5/8/8/8/4Q3/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0298",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #298",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K6/8/8/8/1Q6/5N2/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Qd2#",
    "line": [
      "Qd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0299",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #299",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5K2/8/5R2/8/1R6/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0300",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #300",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/5Q2/B7/6K1/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Qb1#",
    "line": [
      "Qb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0301",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #301",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/8/6K1/8/8/8/4Q3/4R3 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0302",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #302",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7k/2K5/8/1R6/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0303",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #303",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K6/8/8/1Q6/5R2/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0304",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #304",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/8/4KR2/8/7k/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0305",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #305",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R5/8/7k/4P3/6R1/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0306",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #306",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5K2/1P5k/2R5/8/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0307",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #307",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/7Q/5P2/8/8/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe7#",
    "line": [
      "Qe7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0308",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #308",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/3K4/5R2/8/8/1R3P2/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0309",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #309",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1B6/8/8/6R1/8/2K2B2/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra4#",
    "line": [
      "Ra4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0310",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #310",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/8/8/5R2/8/8/P3R3/7k w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0311",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #311",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k4K2/8/8/1Q6/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0312",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #312",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6R1/3B4/8/k1K5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0313",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #313",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2R5/4K3/8/8/7R/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0314",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #314",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/1R6/4R3/8/k7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0315",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #315",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/8/8/8/8/6R1/1K6/7k w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0316",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #316",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/2R5/8/8/2K4R/8/7P/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0317",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #317",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k1K5/8/8/8/6R1/2N5 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0318",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #318",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6K1/8/8/7k/5Q2/8/3B4/8 w - - 0 1",
    "side": "w",
    "solution": "Qg5#",
    "line": [
      "Qg5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0319",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #319",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/5Q2/8/2K3N1/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qf1#",
    "line": [
      "Qf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0320",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #320",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/8/5K2/8/8/1NR5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0321",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #321",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "B7/8/8/8/8/8/3K1k2/1Q6 w - - 0 1",
    "side": "w",
    "solution": "Qe1#",
    "line": [
      "Qe1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0322",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #322",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4K3/8/4R3/8/8/8/7Q/1k6 w - - 0 1",
    "side": "w",
    "solution": "Re1#",
    "line": [
      "Re1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0323",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #323",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/K7/8/8/8/8/Q7 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0324",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #324",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/2K5/8/8/8/1B6/8/3Q4 w - - 0 1",
    "side": "w",
    "solution": "Qd8#",
    "line": [
      "Qd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0325",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #325",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/8/8/R7/6R1/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0326",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #326",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/1R6/8/8/2R5/4KP2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0327",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #327",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K5/8/8/8/5N2/3R4/7k w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0328",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #328",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1R6/8/2RK4/8/8/2P5/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0329",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #329",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4R3/8/8/8/k7/2K5/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0330",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #330",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5Q2/8/8/8/8/8/4R3/3K3k w - - 0 1",
    "side": "w",
    "solution": "Qf1#",
    "line": [
      "Qf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0331",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #331",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4R3/6k1/3R4/6K1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd6#",
    "line": [
      "Rd6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0332",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #332",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/1Q6/8/7k/4N3/7K w - - 0 1",
    "side": "w",
    "solution": "Qh5#",
    "line": [
      "Qh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0333",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #333",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2P5/8/5R2/4R3/1k6/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Rf3#",
    "line": [
      "Rf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0334",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #334",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k5K/3R4/8/8/5R2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0335",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #335",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/2R5/8/3P4/KR6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0336",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #336",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4K3/4Q3/2k5/8/8/4B3 w - - 0 1",
    "side": "w",
    "solution": "Qd5#",
    "line": [
      "Qd5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0337",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #337",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/Q7/5P2/8/8/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0338",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #338",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5R1K/8/8/8/8/8/6R1/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0339",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #339",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4R3/3K4/3P4/6R1/2k5 w - - 0 1",
    "side": "w",
    "solution": "Re1#",
    "line": [
      "Re1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0340",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #340",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1R6/8/5R2/8/1K6/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0341",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #341",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/7R/8/8/7K/2R5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0342",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #342",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4R3/1P6/8/6K1/8/6k1/2R5 w - - 0 1",
    "side": "w",
    "solution": "Re2#",
    "line": [
      "Re2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0343",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #343",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6Bk/8/4K3/8/4Q3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh7#",
    "line": [
      "Qh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0344",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #344",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/5K2/8/8/7Q/6B1/8 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0345",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #345",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "B7/8/4Q3/8/8/1K6/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Qe1#",
    "line": [
      "Qe1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0346",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #346",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6R1/8/8/7k/8/2R5/3K4 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0347",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #347",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/2P5/7K/8/8/1Q6/8 w - - 0 1",
    "side": "w",
    "solution": "Qb7#",
    "line": [
      "Qb7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0348",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #348",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4K3/8/8/4B3/3Q4/8/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0349",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #349",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/2R5/8/K7/Q7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0350",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #350",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2B3k1/8/4K3/8/8/2B4R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0351",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #351",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/KBR5/8/6B1/3k4 w - - 0 1",
    "side": "w",
    "solution": "Bf3#",
    "line": [
      "Bf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0352",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #352",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3K4/3P4/8/5R2/8/R7/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0353",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #353",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2K4Q/8/8/8/4k1N1 w - - 0 1",
    "side": "w",
    "solution": "Qe2#",
    "line": [
      "Qe2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0354",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #354",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R1K4/8/8/k7/8/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0355",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #355",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/3K4/8/k7/8/8/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0356",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #356",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/2R5/4R3/8/3K4/3P4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0357",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #357",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/k6P/8/1R6/8/4R3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0358",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #358",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/K7/3R4/8/8/8/6Q1/k7 w - - 0 1",
    "side": "w",
    "solution": "Rd1#",
    "line": [
      "Rd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0359",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #359",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6Q1/8/8/N7/8/8/1k5K w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0360",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #360",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2B5/8/8/2B2R2/8/7k/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0361",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #361",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R5/8/5R2/8/1K6/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0362",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #362",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/8/k7/4R3/8/2R5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc6#",
    "line": [
      "Rc6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0363",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #363",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/8/3K4/8/5R2/1R4P1/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0364",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #364",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7R/8/2N5/8/8/K7/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0365",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #365",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6R1/4R3/8/8/7k/1P3K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0366",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #366",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K2/8/8/8/8/8/2Q4B/k7 w - - 0 1",
    "side": "w",
    "solution": "Be5#",
    "line": [
      "Be5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0367",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #367",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4R3/8/8/5B2/k7/2K5/8/5B2 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0368",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #368",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2R5/8/7k/6R1/5K2 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0369",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #369",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "N7/8/3R4/8/8/8/8/k1K5 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0370",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #370",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3K2Q1/8/5R2/8/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0371",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #371",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/R7/8/8/4K3/8/4k3/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0372",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #372",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/5Q2/8/8/8/8/6R1/1k6 w - - 0 1",
    "side": "w",
    "solution": "Qf1#",
    "line": [
      "Qf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0373",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #373",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4R3/8/8/8/8/k1K5/N7 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0374",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #374",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/5K1k/B4B2/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0375",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #375",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7R/8/P7/R7/2k5/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0376",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #376",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6B1/8/8/3K4/2Q5/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qe2#",
    "line": [
      "Qe2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0377",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #377",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/3P4/8/8/4R3/4K3/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0378",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #378",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k2K/8/5Q2/8/8/3B4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bb5#",
    "line": [
      "Bb5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0379",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #379",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7k/8/5N2/8/2K3Q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0380",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #380",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/3K4/3Q4/8/8/8/1B6 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0381",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #381",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/1K6/P6Q/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0382",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #382",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k1K2/8/8/8/2R5/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Rd2#",
    "line": [
      "Rd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0383",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #383",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/K5R1/8/7k/8/8/2PR4/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0384",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #384",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/k6P/8/4R3/1R4K1/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0385",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #385",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k1B3/8/7K/8/8/6B1/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0386",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #386",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/k1B5/8/8/4B3/3R4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0387",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #387",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2R5/8/8/8/8/8/2K5/k3N3 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0388",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #388",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/2K5/6R1/4Q3/k7 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0389",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #389",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4RP2/7R/8/3K4/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0390",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #390",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/3K4/8/6P1/R6R/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rhb4#",
    "line": [
      "Rhb4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0391",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #391",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/8/1PR5/6R1/8/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0392",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #392",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7R/8/6K1/8/8/1Q6/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0393",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #393",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4K3/1R6/8/8/8/8/kB4B1 w - - 0 1",
    "side": "w",
    "solution": "Bd4#",
    "line": [
      "Bd4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0394",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #394",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K2R3/7P/k7/3R4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re5#",
    "line": [
      "Re5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0395",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #395",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/5R2/8/1Q6/8/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0396",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #396",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/4R3/8/8/8/8/7R/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0397",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #397",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/2B5/6K1/1R6/B5k1 w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0398",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #398",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5R2/8/1K6/8/6R1/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0399",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #399",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4R3/1Q6/8/8/8/k7/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0400",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #400",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4Q3/5P1k/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Qg5#",
    "line": [
      "Qg5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0401",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #401",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/5B2/8/8/Q7/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Qe7#",
    "line": [
      "Qe7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0402",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #402",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1R6/8/8/6K1/k7/8/7R w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0403",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #403",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7R/8/7R/k1K5/6P1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0404",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #404",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/6R1/8/8/K7/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0405",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #405",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3K4/5B2/3k4/8/8/5Q2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd5#",
    "line": [
      "Qd5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0406",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #406",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2B5/8/8/8/6Q1/K7/7k w - - 0 1",
    "side": "w",
    "solution": "Qh2#",
    "line": [
      "Qh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0407",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #407",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5R2/8/8/B7/8/5K1k w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0408",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #408",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2Q5/k3B3/8/8/2K5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc5#",
    "line": [
      "Bc5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0409",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #409",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/1R3P2/3R4/8/8/k7/3K4 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0410",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #410",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/7R/8/8/8/8/4R3/6K1 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0411",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #411",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6R1/8/5K1k/8/1N6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0412",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #412",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4B3/8/4K3/6k1/1R6/8/5B2/8 w - - 0 1",
    "side": "w",
    "solution": "Be3#",
    "line": [
      "Be3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0413",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #413",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2K5/2R5/8/R6P/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0414",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #414",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/8/8/5R2/1Q6/8/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0415",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #415",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/K3PR2/8/8/8/7k/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0416",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #416",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/8/1B6/8/8/5K2/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rd1#",
    "line": [
      "Rd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0417",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #417",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/8/K7/1R6/8/8/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0418",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #418",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2B5/8/3K4/7R/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0419",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #419",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/2K5/R7/5P2/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0420",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #420",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3R4/8/8/6Q1/k1K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0421",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #421",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/1Q6/2R3K1/3k4 w - - 0 1",
    "side": "w",
    "solution": "Qb1#",
    "line": [
      "Qb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0422",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #422",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/2k5/8/6Q1/3R4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc5#",
    "line": [
      "Qc5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0423",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #423",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/2K3P1/8/8/8/8/7Q w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0424",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #424",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6K1/6R1/2R5/8/8/8/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0425",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #425",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6R1/8/8/1R4K1/8/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0426",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #426",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3Q4/8/8/8/8/5K1k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0427",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #427",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/R7/8/P1R5/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0428",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #428",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/8/8/8/8/1R4K1/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0429",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #429",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/8/5B2/8/8/8/7Q/1k6 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0430",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #430",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/3KR3/8/8/8/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0431",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #431",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/Q7/6K1/B7/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf7#",
    "line": [
      "Qf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0432",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #432",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2Q5/8/8/8/K5R1/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0433",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #433",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k1K5/8/8/7B/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0434",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #434",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/4K3/4N3/6R1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0435",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #435",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/6k1/8/6K1/8/3R2P1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd7#",
    "line": [
      "Rd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0436",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #436",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/8/4Q3/5B2/8/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Qc7#",
    "line": [
      "Qc7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0437",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #437",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/R7/8/6K1/8/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0438",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #438",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1B6/8/8/8/8/Q4K2/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0439",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #439",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/R7/8/5K1k/1R6/8/2P5/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0440",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #440",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3R4/8/6R1/8/1K6/8/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0441",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #441",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "B7/8/8/1R6/8/8/k1K5/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0442",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #442",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/1Q6/8/8/8/1K6/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0443",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #443",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/k7/8/5B2/8/8/8/7Q w - - 0 1",
    "side": "w",
    "solution": "Qb7#",
    "line": [
      "Qb7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0444",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #444",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/7Q/7K/8/8/6R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0445",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #445",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6K1/8/7k/3R4/8/1Q6 w - - 0 1",
    "side": "w",
    "solution": "Qb4#",
    "line": [
      "Qb4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0446",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #446",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2K2Q2/8/4k3/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Qf3#",
    "line": [
      "Qf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0447",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #447",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/1B6/1K6/4R3/3k4 w - - 0 1",
    "side": "w",
    "solution": "Re1#",
    "line": [
      "Re1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0448",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #448",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/8/2Q5/8/B7/1K6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd7#",
    "line": [
      "Qd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0449",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #449",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R5/6K1/8/8/8/3Q4/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0450",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #450",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k3K3/P7/8/1Q6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb7#",
    "line": [
      "Qb7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0451",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #451",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1Q6/8/8/2N5/8/k5K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb3#",
    "line": [
      "Qb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0452",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #452",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2R5/6k1/3Q4/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Qg3#",
    "line": [
      "Qg3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0453",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #453",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/3NK3/8/4Q3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0454",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #454",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/7Q/8/8/8/2R5/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0455",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #455",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/5R2/8/5KR1/8/7P/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0456",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #456",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2K4B/6Q1/8/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qe2#",
    "line": [
      "Qe2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0457",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #457",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1k1K4/8/8/6Q1/8/8/R7 w - - 0 1",
    "side": "w",
    "solution": "Qb4#",
    "line": [
      "Qb4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0458",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #458",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/8/7k/8/8/2K5/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0459",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #459",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5R2/3Q4/8/8/8/8/4k1K1 w - - 0 1",
    "side": "w",
    "solution": "Re7#",
    "line": [
      "Re7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0460",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #460",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7R/8/8/8/1K6/8/1k6/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Rh2#",
    "line": [
      "Rh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0461",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #461",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7k/2P5/8/4R3/6R1/3K4 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0462",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #462",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7Q/8/8/3R4/8/K7/2k5/8 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0463",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #463",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/8/K7/4R3/2Q5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0464",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #464",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2R5/8/2K5/k1B5/8/8/6B1/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0465",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #465",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k5K1/8/8/1R6/2R5/P7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0466",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #466",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/7R/5P2/5K2/8/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0467",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #467",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/1R6/8/8/8/7R/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0468",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #468",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/3Q4/8/8/8/2B5/5K2 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0469",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #469",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K2/8/8/4R3/8/8/1R6/7k w - - 0 1",
    "side": "w",
    "solution": "Re1#",
    "line": [
      "Re1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0470",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #470",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6Q1/8/8/1K3B2/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qg1#",
    "line": [
      "Qg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0471",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #471",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/3R4/8/8/8/2K5/8/7R w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0472",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #472",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/2KR4/6R1/8/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0473",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #473",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k1KQ4/8/8/8/8/1N6 w - - 0 1",
    "side": "w",
    "solution": "Qa3#",
    "line": [
      "Qa3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0474",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #474",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6R1/8/1R6/3K4/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh4#",
    "line": [
      "Rh4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0475",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #475",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1Q6/8/B7/8/7K/8/5k2/8 w - - 0 1",
    "side": "w",
    "solution": "Qg3#",
    "line": [
      "Qg3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0476",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #476",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/7R/8/8/8/1K6/Q7/8 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0477",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #477",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3R4/8/8/6R1/K4P2/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0478",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #478",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/1Q6/7R/3K4/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0479",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #479",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/K7/5Q2/8/8/R7/6k1 w - - 0 1",
    "side": "w",
    "solution": "Qb1#",
    "line": [
      "Qb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0480",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #480",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/1R6/6K1/8/2Q5/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0481",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #481",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/1R6/8/8/2K5/8/7Q w - - 0 1",
    "side": "w",
    "solution": "Qb7#",
    "line": [
      "Qb7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0482",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #482",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R3Q1/8/8/8/k1K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0483",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #483",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/3P4/3R4/8/8/8/1R6/2K5 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0484",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #484",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3K3k/8/8/8/2P5/8/6R1/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0485",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #485",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/k7/2K5/8/2B5/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Qa7#",
    "line": [
      "Qa7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0486",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #486",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k6K/B7/3Q4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb6#",
    "line": [
      "Qb6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0487",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #487",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/kBK5/6B1/8/8/8/7R w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0488",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #488",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/3R4/5K2/7P/5k2/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rd2#",
    "line": [
      "Rd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0489",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #489",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4R3/8/7R/8/8/7K/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rf5#",
    "line": [
      "Rf5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0490",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #490",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/PR2K3/k7/8/8/8/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "a8=Q#",
    "line": [
      "a8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0491",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #491",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k1K1/5R2/8/6B1/8/8/4B3/8 w - - 0 1",
    "side": "w",
    "solution": "Bb5#",
    "line": [
      "Bb5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0492",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #492",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7R/8/8/2K1N3/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0493",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #493",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3K4/1R6/2k5/8/8/B7/4B3 w - - 0 1",
    "side": "w",
    "solution": "Bf2#",
    "line": [
      "Bf2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0494",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #494",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q4/8/B7/7k/5K2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg4#",
    "line": [
      "Qg4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0495",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #495",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/1k1K4/8/8/Q3R3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb3#",
    "line": [
      "Rb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0496",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #496",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6B1/8/8/1R6/6K1/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0497",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #497",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/QK6/R7/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0498",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #498",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1R6/4R3/8/8/8/8/3K4/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0499",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #499",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K4Q1/8/2k5/R7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe5#",
    "line": [
      "Qe5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0500",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #500",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2R4R/8/7P/8/8/5K2/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rhd7#",
    "line": [
      "Rhd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0501",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #501",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/5R2/k1K5/8/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0502",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #502",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1Q6/8/6K1/8/6k1/8/8/7N w - - 0 1",
    "side": "w",
    "solution": "Qg3#",
    "line": [
      "Qg3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0503",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #503",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7k/8/8/1K6/8/6R1/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0504",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #504",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/3Q1K2/8/8/6N1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe7#",
    "line": [
      "Qe7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0505",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #505",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2R5/6K1/8/8/8/8/2Q5/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0506",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #506",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/8/1k1K4/R1R5 w - - 0 1",
    "side": "w",
    "solution": "Rcb1#",
    "line": [
      "Rcb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0507",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #507",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/4R3/8/1RK5/k7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0508",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #508",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/8/8/8/k7/P7/1Q6/8 w - - 0 1",
    "side": "w",
    "solution": "Qb4#",
    "line": [
      "Qb4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0509",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #509",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K6k/8/8/8/2B5/8/3Q4/8 w - - 0 1",
    "side": "w",
    "solution": "Qh6#",
    "line": [
      "Qh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0510",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #510",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/6Q1/K7/3R4/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0511",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #511",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/8/2k5/4R3/8/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0512",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #512",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5K2/7k/2Q5/8/6R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh3#",
    "line": [
      "Rh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0513",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #513",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6B1/8/k7/2B5/K7/R7 w - - 0 1",
    "side": "w",
    "solution": "Be8#",
    "line": [
      "Be8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0514",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #514",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/R7/8/P7/8/7K/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0515",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #515",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6K1/8/1R6/5R2/8/6P1/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0516",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #516",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/5Q2/3B4/8/k1K5/8 w - - 0 1",
    "side": "w",
    "solution": "Qa5#",
    "line": [
      "Qa5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0517",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #517",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/K7/2k5/8/8/3Q4/R7 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0518",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #518",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4B3/8/8/8/8/4K3/2k5/Q7 w - - 0 1",
    "side": "w",
    "solution": "Ba4#",
    "line": [
      "Ba4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0519",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #519",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/7R/4K3/k7/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0520",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #520",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/4K3/8/8/N7/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0521",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #521",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/1K6/8/4P3/8/8/5Q2 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0522",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #522",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k4K1/7R/4R3/8/8/8/7P/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0523",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #523",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/8/K7/6Q1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd8#",
    "line": [
      "Qd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0524",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #524",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1Q6/8/8/1P6/3K4/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Qh1#",
    "line": [
      "Qh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0525",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #525",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/6K1/8/5R1Q/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rf1#",
    "line": [
      "Rf1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0526",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #526",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k7/7K/8/8/1R6/2R5 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0527",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #527",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/R7/8/6K1/8/7k/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Ra3#",
    "line": [
      "Ra3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0528",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #528",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/6R1/3P4/7R/3k4/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Rg3#",
    "line": [
      "Rg3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0529",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #529",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/8/6K1/6B1/8/3B4/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0530",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #530",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3k4/6Q1/8/8/8/4K3/8/7R w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0531",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #531",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/5K2/6R1/8/8/2R5/k7 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0532",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #532",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7Q/k7/8/K7/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg5#",
    "line": [
      "Rg5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0533",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #533",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/7K/k7/8/4R3/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0534",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #534",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4R2P/R7/8/5k1K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf5#",
    "line": [
      "Rf5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0535",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #535",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/8/8/8/8/2R5/3R4/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rc1#",
    "line": [
      "Rc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0536",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #536",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4B3/6K1/8/2Q5/7k w - - 0 1",
    "side": "w",
    "solution": "Qh2#",
    "line": [
      "Qh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0537",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #537",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K6/8/8/8/8/R5P1/1R6/3k4 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0538",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #538",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K5/k7/8/3N4/8/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0539",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #539",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/2R5/R7/8/8/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0540",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #540",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6P1/8/8/5K2/2R5/5k2/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rc2#",
    "line": [
      "Rc2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0541",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #541",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/5Q2/2R5/8/8/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0542",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #542",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/8/8/8/8/1R1Q4/K7 w - - 0 1",
    "side": "w",
    "solution": "Qa5#",
    "line": [
      "Qa5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0543",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #543",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/k7/8/8/2R5/1RK5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra4#",
    "line": [
      "Ra4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0544",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #544",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7K/8/8/7Q/1R6/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qa4#",
    "line": [
      "Qa4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0545",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #545",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/7k/8/4Q3/8/2B5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7#",
    "line": [
      "Qg7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0546",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #546",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6B1/8/8/8/6K1/8/8/k3BR2 w - - 0 1",
    "side": "w",
    "solution": "Bc3#",
    "line": [
      "Bc3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0547",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #547",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3K3k/7B/6Q1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg6#",
    "line": [
      "Qg6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0548",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #548",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/R3B3/6K1/8/8/B7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0549",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #549",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/1B4Q1/2K1k3/8 w - - 0 1",
    "side": "w",
    "solution": "Bc4#",
    "line": [
      "Bc4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0550",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #550",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/8/5K2/R7/8/8/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0551",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #551",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/2N5/8/8/1Q6/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0552",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #552",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/3R4/8/4P3/8/6R1/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0553",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #553",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5K1k/8/8/8/8/P7/2Q5/8 w - - 0 1",
    "side": "w",
    "solution": "Qh2#",
    "line": [
      "Qh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0554",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #554",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/6B1/8/1K6/5Q2/1k6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa4#",
    "line": [
      "Qa4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0555",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Son Vuruş #555",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "kB6/8/8/8/8/K7/8/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Qa7#",
    "line": [
      "Qa7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0556",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #556",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K6/7Q/k7/8/3N4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa6#",
    "line": [
      "Qa6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0557",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #557",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1Q6/8/8/3R4/4K3/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra4#",
    "line": [
      "Ra4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0558",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #558",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3B4/8/8/8/6K1/8/7k/5Q2 w - - 0 1",
    "side": "w",
    "solution": "Bc7#",
    "line": [
      "Bc7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0559",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #559",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/5K1k/8/B4R2/8/8/8/1B6 w - - 0 1",
    "side": "w",
    "solution": "Rh5#",
    "line": [
      "Rh5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0560",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #560",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/1Q1K4/8/2k5/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0561",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #561",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/B1Q5/8/8/8/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0562",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #562",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/R7/8/3R4/1K6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0563",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #563",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6B1/8/6K1/3Q4/8/8/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qa2#",
    "line": [
      "Qa2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0564",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #564",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2K3Q1/8/7k/8/8/8/2B5/8 w - - 0 1",
    "side": "w",
    "solution": "Qg6#",
    "line": [
      "Qg6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0565",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #565",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K3R2/6R1/8/8/8/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0566",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #566",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K5/5P2/7R/8/8/5R2/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0567",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #567",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "3K4/6Q1/R7/7k/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0568",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #568",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/4R3/8/8/4K3/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0569",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #569",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1Q2K3/8/8/8/8/3N4/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0570",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #570",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q4/5K2/4P2k/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh3#",
    "line": [
      "Qh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0571",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #571",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/k7/8/1K1Q2B1 w - - 0 1",
    "side": "w",
    "solution": "Bc5#",
    "line": [
      "Bc5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0572",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #572",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/8/8/8/1K6/6Q1/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0573",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Matı Bul #573",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/3K4/3Q4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0574",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #574",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/1R6/1P2K3/8/8/8/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0575",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #575",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5k2/8/1R2K3/8/3B4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0576",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #576",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "5QR1/8/5K2/8/8/8/8/7k w - - 0 1",
    "side": "w",
    "solution": "Qh6#",
    "line": [
      "Qh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0577",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #577",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/8/8/8/2N5/2Q5/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Qd2#",
    "line": [
      "Qd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0578",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #578",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/1R6/3K4/8/k7/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0579",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #579",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/7R/8/8/4R3/7K/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rf6#",
    "line": [
      "Rf6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0580",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #580",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1K6/5B2/1Q6/8/8/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Qb2#",
    "line": [
      "Qb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0581",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #581",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/8/R7/2K1R3/6k1 w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0582",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #582",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4Q3/8/k1K5/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0583",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #583",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/8/8/4R3/8/8/R7/7k w - - 0 1",
    "side": "w",
    "solution": "Re1#",
    "line": [
      "Re1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0584",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #584",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/7Q/8/8/8/8/8/1Bk4K w - - 0 1",
    "side": "w",
    "solution": "Qc2#",
    "line": [
      "Qc2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0585",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #585",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K5/k7/7R/8/2B4B/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5#",
    "line": [
      "Ra5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0586",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #586",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/4R3/3k4/8/2K5/2Q5 w - - 0 1",
    "side": "w",
    "solution": "Qf4#",
    "line": [
      "Qf4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0587",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #587",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3R2P1/k7/8/1K3R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf5#",
    "line": [
      "Rf5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0588",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #588",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2K2R2/4k3/8/8/8/5Q2 w - - 0 1",
    "side": "w",
    "solution": "Qf4#",
    "line": [
      "Qf4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0589",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #589",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1Q6/8/8/8/2N5/8/2k1K3 w - - 0 1",
    "side": "w",
    "solution": "Qb1#",
    "line": [
      "Qb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0590",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #590",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2N5/8/8/8/3R1K2/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rd1#",
    "line": [
      "Rd1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0591",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #591",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2Q5/8/3B4/5K2/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0592",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #592",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/7R/2P5/8/8/1K6/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0593",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #593",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/3R4/4P3/k7/8/8/KR6 w - - 0 1",
    "side": "w",
    "solution": "Ra6#",
    "line": [
      "Ra6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0594",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #594",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6R1/3R4/8/8/8/7k/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Rh7#",
    "line": [
      "Rh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0595",
    "level": "Kolay",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #595",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2Q5/8/8/8/8/6K1/8/7k w - - 0 1",
    "side": "w",
    "solution": "Qc1#",
    "line": [
      "Qc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0596",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #596",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/4R3/4R3/5P2/6K1/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Re1#",
    "line": [
      "Re1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0597",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #597",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/2K4R/8/8/8/8/5Q2/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rh1#",
    "line": [
      "Rh1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0598",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #598",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "4k3/8/2N5/2Q5/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Qe7#",
    "line": [
      "Qe7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0599",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #599",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1k6/7R/1P6/3R4/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0600",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #600",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/2KQ4/8/8/7k/5P2/8 w - - 0 1",
    "side": "w",
    "solution": "Qg3#",
    "line": [
      "Qg3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0601",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #601",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/k1K5/5P2/8/8/1R5R w - - 0 1",
    "side": "w",
    "solution": "Ra1#",
    "line": [
      "Ra1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0602",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #602",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/k7/8/8/1R4K1/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2#",
    "line": [
      "Ra2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0603",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #603",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/8/8/4K2B/8/4k3/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Qe1#",
    "line": [
      "Qe1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0604",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #604",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "K7/8/8/1R6/8/8/2R5/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rb1#",
    "line": [
      "Rb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0605",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #605",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/3Q4/8/8/K1k5/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Rc2#",
    "line": [
      "Rc2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0606",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #606",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2R5/6P1/1R6/8/8/8/k6K/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0607",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Tek Hamlede Mat #607",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/8/1R6/8/8/8/3N1K2/7k w - - 0 1",
    "side": "w",
    "solution": "Rh6#",
    "line": [
      "Rh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0608",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #608",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K6/8/8/4P3/8/6R1/7R/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rg1#",
    "line": [
      "Rg1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0609",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #609",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/Q7/8/8/8/7N/8/1K3k2 w - - 0 1",
    "side": "w",
    "solution": "Qf2#",
    "line": [
      "Qf2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0610",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #610",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/7R/8/8/8/3K2R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0611",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #611",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2k5/8/1KB5/Q7/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0612",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #612",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "8/1R5P/2k5/8/2K5/8/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "R1b6#",
    "line": [
      "R1b6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0613",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Son Vuruş #613",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7K/8/8/1Q6/8/8/4R3/7k w - - 0 1",
    "side": "w",
    "solution": "Qb1#",
    "line": [
      "Qb1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0614",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #614",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2R2R2/8/8/8/3k1K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rfd8#",
    "line": [
      "Rfd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0615",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #615",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/8/5K2/1R4N1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0616",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #616",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Rakip şahın kaçabileceği kareleri say. Hepsini kapatan hamleyi ara.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "k7/8/1Q6/8/8/1B6/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Bd5#",
    "line": [
      "Bd5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0617",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #617",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "7k/R7/1K6/8/4P3/8/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0618",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #618",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "6k1/R7/8/1R6/8/8/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0619",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Matı Bul #619",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şaha en yakın taşını kullan ve kaçış karelerini kapat.",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "2Bk4/Q7/8/8/2K5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd7#",
    "line": [
      "Qd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0620",
    "level": "Orta",
    "theme": "mat-1",
    "title": "Şah Mat Zamanı #620",
    "goal": "Beyaz oynar ve tek hamlede mat eder.",
    "hint": "Şah çeken hamleleri tek tek dene; hangisinden sonra şah kaçamıyor?",
    "explanation": "Şah tehdit altında, kaçamıyor, araya taş koyamıyor ve saldıran taşı alamıyor. İşte bu şah mattır!",
    "fen": "1K6/2R5/1R6/2P5/8/8/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Ra7#",
    "line": [
      "Ra7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-0621",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #621",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/8/8/1R6/5K2/8/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Qa7",
    "line": [
      "Qa7",
      "Ke8",
      "Rb8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0622",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #622",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/8/2K5/7Q/5k2 w - - 0 1",
    "side": "w",
    "solution": "Kd3",
    "line": [
      "Kd3",
      "Ke1",
      "Qg1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0623",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #623",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/7k/R7/3R3P/8/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rg4",
    "line": [
      "Rg4",
      "Kh7",
      "Rh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0624",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #624",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/k7/8/1R6/5P2/8/5KR1 w - - 0 1",
    "side": "w",
    "solution": "Rg5",
    "line": [
      "Rg5",
      "Ka7",
      "Ra5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0625",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #625",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/6R1/8/5k2/3K2R1 w - - 0 1",
    "side": "w",
    "solution": "R1g3",
    "line": [
      "R1g3",
      "Kf1",
      "Rf4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0626",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #626",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4K3/Q7/2k5/8/5P2/2N5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kd8",
    "line": [
      "Kd8",
      "Kd6",
      "Qb6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0627",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #627",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "R7/8/K4Q2/7k/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7",
    "line": [
      "Qg7",
      "Kh4",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0628",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #628",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/k2K4/8/7Q/1P6/8/2N5/8 w - - 0 1",
    "side": "w",
    "solution": "Kc7",
    "line": [
      "Kc7",
      "Ka8",
      "Qa5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0629",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #629",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/Q7/8/4K3/6Pk/8 w - - 0 1",
    "side": "w",
    "solution": "Kf2",
    "line": [
      "Kf2",
      "Kh1",
      "Qh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0630",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #630",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k6/8/8/8/8/8/2K5/3R2Q1 w - - 0 1",
    "side": "w",
    "solution": "Qb6+",
    "line": [
      "Qb6+",
      "Kc8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0631",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #631",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/8/8/8/4R3/4K3/7Q w - - 0 1",
    "side": "w",
    "solution": "Qh7",
    "line": [
      "Qh7",
      "Kc8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0632",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #632",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/7R/K7/7P/7k/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rhg7",
    "line": [
      "Rhg7",
      "Kxh5",
      "Rh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0633",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #633",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4R3/1K6/4B3/8/8/4R3/8/7k w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh2",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0634",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #634",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4K3/6k1/2R5/8/4R3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4",
    "line": [
      "Rh4",
      "Kg8",
      "Rg6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0635",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #635",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "Q7/2k5/7R/8/8/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Qa7+",
    "line": [
      "Qa7+",
      "Kc8",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0636",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #636",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2k5/2P5/6N1/8/4K3/2Q5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc5",
    "line": [
      "Qc5",
      "Kd7",
      "c8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0637",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #637",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/8/8/1K6/8/8/8/5Q2 w - - 0 1",
    "side": "w",
    "solution": "Kb6",
    "line": [
      "Kb6",
      "Kb8",
      "Qf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0638",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #638",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4K3/8/k7/6B1/8/8/2Q5 w - - 0 1",
    "side": "w",
    "solution": "Qc5+",
    "line": [
      "Qc5+",
      "Ka6",
      "Bc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0639",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #639",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/R7/8/Q7/5k2/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Re6",
    "line": [
      "Re6",
      "Kg3",
      "Re3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0640",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #640",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R1K/8/8/8/8/4Q3/1k6/8 w - - 0 1",
    "side": "w",
    "solution": "Rf2+",
    "line": [
      "Rf2+",
      "Kb1",
      "Qe1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0641",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #641",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k6/8/K1P5/8/2R5/6R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kb6",
    "line": [
      "Kb6",
      "Kc8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0642",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #642",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/2R5/5K2/5B2/4R3/8/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rc2",
    "line": [
      "Rc2",
      "Kg1",
      "Re1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0643",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #643",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6k1/4Q3/4K3/8/4P3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf6",
    "line": [
      "Kf6",
      "Kh8",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0644",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #644",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/K7/2k5/8/6R1/3R2P1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg4",
    "line": [
      "Rg4",
      "Kc6",
      "Rc4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0645",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #645",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/3R4/8/4PK2/k7/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rb5",
    "line": [
      "Rb5",
      "Ka3",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0646",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #646",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/k7/8/6QK/8/8/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Qb5",
    "line": [
      "Qb5",
      "Ka8",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0647",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #647",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7K/8/5Q2/8/R7/8/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Ra2",
    "line": [
      "Ra2",
      "Kd1",
      "Qf1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0648",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #648",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/3P4/N7/8/8/1K6/1Q6 w - - 0 1",
    "side": "w",
    "solution": "Qh7",
    "line": [
      "Qh7",
      "Ke8",
      "Qe7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0649",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #649",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/3K4/8/3Q4/5k2/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rb2+",
    "line": [
      "Rb2+",
      "Kg1",
      "Qd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0650",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #650",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/4K3/8/6k1/8/7Q/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rf1",
    "line": [
      "Rf1",
      "Kg5",
      "Rg1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0651",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #651",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/2R5/1k6/R7/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rac5",
    "line": [
      "Rac5",
      "Ka6",
      "R5c6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0652",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #652",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "R7/4K3/Q7/8/8/8/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Qe2",
    "line": [
      "Qe2",
      "Kh1",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0653",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #653",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/K7/8/P7/7k/4R3/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rg1",
    "line": [
      "Rg1",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0654",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #654",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/7R/8/8/R6K/8/7k/2B5 w - - 0 1",
    "side": "w",
    "solution": "Rg4",
    "line": [
      "Rg4",
      "Kh1",
      "Kg5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0655",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #655",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/QP6/8/8/N7/8/3k2K1 w - - 0 1",
    "side": "w",
    "solution": "Qd3+",
    "line": [
      "Qd3+",
      "Ke1",
      "Nc2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0656",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #656",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/k7/2R1K3/5R2/8/6P1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb5",
    "line": [
      "Rb5",
      "Ka8",
      "Ra6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0657",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #657",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3R2K1/8/k7/8/8/8/8/7Q w - - 0 1",
    "side": "w",
    "solution": "Rb8",
    "line": [
      "Rb8",
      "Ka7",
      "Qb7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0658",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #658",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/k1K5/2R5/8/4N3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kc7",
    "line": [
      "Kc7",
      "Ka7",
      "Ra5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0659",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #659",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3k4/5R2/8/1B5K/8/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Re7+",
    "line": [
      "Re7+",
      "Kc8",
      "Rf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0660",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #660",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/1Q6/7k/8/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf4",
    "line": [
      "Kf4",
      "Kh4",
      "Qh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0661",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #661",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5K2/5R2/8/8/k6B/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Rb6",
    "line": [
      "Rb6",
      "Ka4",
      "Ra2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0662",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #662",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k2KB/8/6R1/R7/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Ke8",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0663",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #663",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3N4/P5K1/6Q1/k7/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb1",
    "line": [
      "Qb1",
      "Ka6",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0664",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #664",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4N3/4R3/4K2k/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf4",
    "line": [
      "Kf4",
      "Kh4",
      "Rh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0665",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #665",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5P2/8/4k2K/8/3Q4/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q",
    "line": [
      "f8=Q",
      "Ke6",
      "Qdd6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0666",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #666",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/P7/1Q1K4/8/k7/8/8 w - - 0 1",
    "side": "w",
    "solution": "a7",
    "line": [
      "a7",
      "Ka2",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0667",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #667",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5R2/1K2k3/4P3/8/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kc5",
    "line": [
      "Kc5",
      "Kxe5",
      "Re7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0668",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #668",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/1R6/7k/3K4/8/8/4Q3 w - - 0 1",
    "side": "w",
    "solution": "Qg1",
    "line": [
      "Qg1",
      "Kh4",
      "Rh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0669",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #669",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "B1k5/8/8/8/8/K7/8/4Q3 w - - 0 1",
    "side": "w",
    "solution": "Qe7",
    "line": [
      "Qe7",
      "Kb8",
      "Qb7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0670",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #670",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/8/8/4R3/8/7P/8/R2K4 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kg8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0671",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #671",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/k6K/2B5/2R5/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rb3",
    "line": [
      "Rb3",
      "Ka4",
      "Ra2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0672",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #672",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "K7/1P6/8/8/8/8/6k1/4Q3 w - - 0 1",
    "side": "w",
    "solution": "b8=Q",
    "line": [
      "b8=Q",
      "Kf3",
      "Qbg3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0673",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #673",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/6B1/8/6k1/8/3Q2K1 w - - 0 1",
    "side": "w",
    "solution": "Qe2",
    "line": [
      "Qe2",
      "Kh3",
      "Qf3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0674",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #674",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3R2R1/8/8/5B2/6K1/8/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Kf3",
    "line": [
      "Kf3",
      "Kf1",
      "Rd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0675",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #675",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1K6/3kP3/8/8/8/8/4Q3/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q+",
    "line": [
      "e8=Q+",
      "Kd6",
      "Q2e5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0676",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #676",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1Q6/7k/8/6K1/P7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf5",
    "line": [
      "Kf5",
      "Kh5",
      "Qh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0677",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #677",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "K3R3/7Q/8/8/8/8/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8",
    "line": [
      "Rb8",
      "Ka3",
      "Qa7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0678",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #678",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3K4/8/8/7R/R7/4k3/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2+",
    "line": [
      "Rh2+",
      "Kf1",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0679",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #679",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7Q/8/3K4/5k2/P7/8/8/2B5 w - - 0 1",
    "side": "w",
    "solution": "Qh5+",
    "line": [
      "Qh5+",
      "Kf6",
      "Bb2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0680",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #680",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/2P5/8/8/8/8/2Q5/5K2 w - - 0 1",
    "side": "w",
    "solution": "Qh7",
    "line": [
      "Qh7",
      "Ke8",
      "c8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0681",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #681",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "B7/3K4/8/7R/8/R7/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Ra2",
    "line": [
      "Ra2",
      "Kf1",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0682",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #682",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6k1/8/2P5/R4R2/8/8/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kh8",
      "Rf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0683",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #683",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7k/8/8/8/7B/8/6QP/5K2 w - - 0 1",
    "side": "w",
    "solution": "Bf6+",
    "line": [
      "Bf6+",
      "Kh7",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0684",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #684",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/P7/8/8/8/3K4/7k/R7 w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh3",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0685",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #685",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6k1/4K3/3R4/8/8/8/8/Q7 w - - 0 1",
    "side": "w",
    "solution": "Rg6+",
    "line": [
      "Rg6+",
      "Kh7",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0686",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #686",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/8/1Q6/8/1B6/8/5P2/3K4 w - - 0 1",
    "side": "w",
    "solution": "Qa6+",
    "line": [
      "Qa6+",
      "Kb8",
      "Bd6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0687",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #687",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k6/5K2/8/8/3Q2B1/8/2P5/8 w - - 0 1",
    "side": "w",
    "solution": "Qb6+",
    "line": [
      "Qb6+",
      "Ka8",
      "Bf3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0688",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #688",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2K5/5k2/3R4/8/2R5/8/7P/8 w - - 0 1",
    "side": "w",
    "solution": "Rc7+",
    "line": [
      "Rc7+",
      "Ke8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0689",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #689",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "Q7/3kP3/8/8/2K5/2N5/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q+",
    "line": [
      "e8=Q+",
      "Kd6",
      "Qab8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0690",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #690",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2K5/8/3k4/8/P7/8/4R3/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rf5",
    "line": [
      "Rf5",
      "Kc6",
      "Re6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0691",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #691",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/8/8/4R3/1K6/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kc8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0692",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #692",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/6k1/8/5K2/5P1R/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8",
    "line": [
      "Rb8",
      "Kf7",
      "Rh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0693",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #693",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/3K3P/6Q1/8/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "h7",
    "line": [
      "h7",
      "Kh2",
      "h8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0694",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #694",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/8/8/8/4KQ2/1B6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc7",
    "line": [
      "Qc7",
      "Kf8",
      "Qf7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0695",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #695",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7k/8/4K3/8/8/1Q6/4P3/8 w - - 0 1",
    "side": "w",
    "solution": "Kf7",
    "line": [
      "Kf7",
      "Kh7",
      "Qh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0696",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #696",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4K3/8/7k/1R6/8/8/5B2/8 w - - 0 1",
    "side": "w",
    "solution": "Kf7",
    "line": [
      "Kf7",
      "Kh7",
      "Rh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0697",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #697",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2Q5/5P2/7k/8/8/8/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Qf5",
    "line": [
      "Qf5",
      "Kg7",
      "f8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0698",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #698",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/6K1/1R6/7k/2P5/4R3 w - - 0 1",
    "side": "w",
    "solution": "Re2",
    "line": [
      "Re2",
      "Kg3",
      "Rb3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0699",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #699",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3B4/8/8/8/4KR2/8/7k/3R4 w - - 0 1",
    "side": "w",
    "solution": "Kf3",
    "line": [
      "Kf3",
      "Kh3",
      "Rh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0700",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #700",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/4K3/7Q/3k4/3B4 w - - 0 1",
    "side": "w",
    "solution": "Qd3+",
    "line": [
      "Qd3+",
      "Ke1",
      "Qe2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0701",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #701",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4Q3/8/8/8/3K4/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Kc2",
    "line": [
      "Kc2",
      "Ka1",
      "Qa3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0702",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #702",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4K3/8/6Q1/8/8/5R2/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qg2",
    "line": [
      "Qg2",
      "Kd1",
      "Rf1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0703",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #703",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/B7/5K2/3k4/6R1/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rc1",
    "line": [
      "Rc1",
      "Kd5",
      "Rd3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0704",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #704",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1R6/5R2/7k/5B2/8/8/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh5",
      "Rh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0705",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #705",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4k3/1K5R/2R5/8/7B/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc7+",
    "line": [
      "Rc7+",
      "Kd8",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0706",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #706",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4QK2/8/3k4/8/8/8/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Qe4",
    "line": [
      "Qe4",
      "Kd7",
      "Qd5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0707",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #707",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2Q5/8/3B3K/k7/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb7",
    "line": [
      "Qb7",
      "Ka4",
      "Qb4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0708",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #708",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3R4/8/8/8/1K6/4R3/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Kb3",
    "line": [
      "Kb3",
      "Kc1",
      "Re1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0709",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #709",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/6k1/8/P6K/8/5R2/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rd7",
    "line": [
      "Rd7",
      "Kh6",
      "Rf6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0710",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #710",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/4K3/7k/4R3/1N6 w - - 0 1",
    "side": "w",
    "solution": "Kf4",
    "line": [
      "Kf4",
      "Kh4",
      "Rh2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0711",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #711",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7Q/1k2P3/8/K7/2N5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q",
    "line": [
      "e8=Q",
      "Kc7",
      "Qc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0712",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #712",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6Q1/P4K2/k7/5B2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8",
    "line": [
      "Qb8",
      "Ka5",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0713",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #713",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/1K5k/8/5RR1/8 w - - 0 1",
    "side": "w",
    "solution": "Rf3",
    "line": [
      "Rf3",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0714",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #714",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/1R2KB2/7R/8/8/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rb2",
    "line": [
      "Rb2",
      "Ke1",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0715",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #715",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1k6/4R3/8/5R2/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf7+",
    "line": [
      "Rf7+",
      "Ka8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0716",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #716",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2k5/R7/8/8/2B5/2R5/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Rb3",
    "line": [
      "Rb3",
      "Kd8",
      "Rb8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0717",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #717",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "K7/4R3/8/8/7R/8/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rh2",
    "line": [
      "Rh2",
      "Kc1",
      "Re1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0718",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #718",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/8/4Q1B1/1K6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kb6",
    "line": [
      "Kb6",
      "Kb8",
      "Qe8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0719",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #719",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4K3/8/4R1P1/8/8/k7/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rb5",
    "line": [
      "Rb5",
      "Ka3",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0720",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #720",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/8/4P1K1/Q7/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qc2",
    "line": [
      "Qc2",
      "Kf1",
      "Qf2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0721",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #721",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5R2/5R2/2k5/4K3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb7",
    "line": [
      "Rb7",
      "Kc4",
      "Rc6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0722",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #722",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/6Q1/8/8/8/2K3Bk/8 w - - 0 1",
    "side": "w",
    "solution": "Bf1",
    "line": [
      "Bf1",
      "Kh1",
      "Qg2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0723",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #723",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4K3/8/3R4/8/4R3/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg6",
    "line": [
      "Rg6",
      "Kh2",
      "Rh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0724",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #724",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/8/7K/5R2/6k1/8/8/B7 w - - 0 1",
    "side": "w",
    "solution": "Rf3",
    "line": [
      "Rf3",
      "Kh4",
      "R8f4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0725",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #725",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5Q2/8/8/8/4B2k/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Qf5+",
    "line": [
      "Qf5+",
      "Kh4",
      "Bf2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0726",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #726",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/k7/8/6Q1/8/7R/7K w - - 0 1",
    "side": "w",
    "solution": "Qb4",
    "line": [
      "Qb4",
      "Ka7",
      "Ra2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0727",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #727",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7k/P7/8/8/3N4/1Q2K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb7",
    "line": [
      "Qb7",
      "Kg8",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0728",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #728",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4R3/8/8/2B5/7k/3R4/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0729",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #729",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/6K1/3Q4/8/8/8/8/B7 w - - 0 1",
    "side": "w",
    "solution": "Qa6+",
    "line": [
      "Qa6+",
      "Kb8",
      "Be5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0730",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #730",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/2K2N2/3R4/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Kb3",
    "line": [
      "Kb3",
      "Kb1",
      "Rd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0731",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #731",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4R3/8/5K2/5R2/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Rg4",
    "line": [
      "Rg4",
      "Kh3",
      "Rh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0732",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #732",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4K3/4Q3/8/1k6/8/8/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Qb7+",
    "line": [
      "Qb7+",
      "Ka4",
      "Ra2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0733",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #733",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5P2/1R6/8/R7/8/4K2k/8 w - - 0 1",
    "side": "w",
    "solution": "Kf2",
    "line": [
      "Kf2",
      "Kh3",
      "Rh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0734",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #734",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3R4/1k6/3K4/8/8/4Q3/8 w - - 0 1",
    "side": "w",
    "solution": "Qa2",
    "line": [
      "Qa2",
      "Kb5",
      "Rb7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0735",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #735",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3BR3/7k/8/8/4K3/2R5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg3",
    "line": [
      "Rg3",
      "Kh6",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0736",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #736",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2R5/6R1/4K3/4B3/8/8/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rb7+",
    "line": [
      "Rb7+",
      "Ka2",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0737",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #737",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/4KB2/1P5k/8/2Q5/8 w - - 0 1",
    "side": "w",
    "solution": "Kf4",
    "line": [
      "Kf4",
      "Kh5",
      "Qh2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0738",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #738",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5Q2/8/8/8/6k1/3K4/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rg1+",
    "line": [
      "Rg1+",
      "Kh5",
      "Qh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0739",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #739",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5P2/8/4K3/B1Q5/8/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "f8=Q",
    "line": [
      "f8=Q",
      "Kd2",
      "Qf2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0740",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #740",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/8/1Q6/8/4K3/8/6k1/8 w - - 0 1",
    "side": "w",
    "solution": "Qg6+",
    "line": [
      "Qg6+",
      "Kh3",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0741",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #741",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/2R5/8/8/1k4K1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8+",
    "line": [
      "Rb8+",
      "Ka5",
      "Ra7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0742",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #742",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7k/2P5/8/1R2R3/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Re7",
    "line": [
      "Re7",
      "Kg8",
      "c8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0743",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #743",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2K5/6Q1/8/8/2P5/8/6Nk/8 w - - 0 1",
    "side": "w",
    "solution": "Nf4",
    "line": [
      "Nf4",
      "Kh1",
      "Qg2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0744",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #744",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1B6/8/3Q4/6K1/8/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Kf3",
    "line": [
      "Kf3",
      "Kf1",
      "Qd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0745",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #745",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/4Q2P/1K5N/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Kc3",
    "line": [
      "Kc3",
      "Kc1",
      "Qh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0746",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #746",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/4N3/7k/8/K2B4/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc4",
    "line": [
      "Rc4",
      "Kh6",
      "Rh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0747",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #747",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/2Q5/2P1K2k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf2",
    "line": [
      "Kf2",
      "Kh2",
      "Qh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0748",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #748",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7R/k7/8/3B4/8/8/3K4/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rb1",
    "line": [
      "Rb1",
      "Ka6",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0749",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #749",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1B6/8/8/7k/K7/5R2/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Rg3",
    "line": [
      "Rg3",
      "Kh6",
      "Rh2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0750",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #750",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/1Q6/P7/8/8/6K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "a7",
    "line": [
      "a7",
      "Kf8",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0751",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #751",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1K5k/8/8/5Q2/8/7P/6B1/8 w - - 0 1",
    "side": "w",
    "solution": "Qf8+",
    "line": [
      "Qf8+",
      "Kh7",
      "Be4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0752",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #752",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4R3/k7/8/4K3/4R3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb4",
    "line": [
      "Rb4",
      "Ka6",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0753",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #753",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5N2/7P/8/8/8/1Q1K4/8/7k w - - 0 1",
    "side": "w",
    "solution": "Qg8",
    "line": [
      "Qg8",
      "Kh2",
      "h8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0754",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #754",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1B6/8/8/8/1Q6/4k3/2K5 w - - 0 1",
    "side": "w",
    "solution": "Qg3",
    "line": [
      "Qg3",
      "Kf1",
      "Ba6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0755",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #755",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7R/8/8/7K/8/8/7k/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh3",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0756",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #756",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7B/5R2/8/8/7k/3KR3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0757",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #757",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5P2/4k3/8/8/3Q4/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "f8=Q",
    "line": [
      "f8=Q",
      "Ke5",
      "Qff5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0758",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #758",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/2Q2P2/8/8/8/3KN3/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Kc2",
    "line": [
      "Kc2",
      "Ka3",
      "Qa5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0759",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #759",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/6PK/5k2/8/1B6/6Q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q",
    "line": [
      "g8=Q",
      "Kf5",
      "Q8g6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0760",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #760",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/4R3/7k/8/8/8/2K1R3 w - - 0 1",
    "side": "w",
    "solution": "Rg1",
    "line": [
      "Rg1",
      "Kh4",
      "Rh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0761",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #761",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6k1/8/3RP3/8/8/4K3/8/7R w - - 0 1",
    "side": "w",
    "solution": "Rd7",
    "line": [
      "Rd7",
      "Kf8",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0762",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #762",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/3K4/5k2/1Q6/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Rg2",
    "line": [
      "Rg2",
      "Kf5",
      "Qf3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0763",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #763",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/k7/1R1K4/8/8/3B4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kc7",
    "line": [
      "Kc7",
      "Ka8",
      "Ra6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0764",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #764",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4R3/3B4/8/kN6/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re5",
    "line": [
      "Re5",
      "Ka3",
      "Ra5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0765",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #765",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/2R3R1/8/8/8/K2k4 w - - 0 1",
    "side": "w",
    "solution": "Rg2",
    "line": [
      "Rg2",
      "Ke1",
      "Rc1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0766",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #766",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2K1k3/7Q/8/8/8/4B3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg6+",
    "line": [
      "Qg6+",
      "Kf8",
      "Bc5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0767",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #767",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4Q3/7P/7k/8/8/8/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Qg8",
    "line": [
      "Qg8",
      "Kh5",
      "h8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0768",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #768",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/kP4Q1/8/2K5/3N4/8 w - - 0 1",
    "side": "w",
    "solution": "Qc5",
    "line": [
      "Qc5",
      "Ka4",
      "Qb4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0769",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #769",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/1R6/8/6R1/K7/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rb2",
    "line": [
      "Rb2",
      "Ke1",
      "Rg1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0770",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #770",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/7Q/8/6R1/8/8/1k2K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rb5+",
    "line": [
      "Rb5+",
      "Ka3",
      "Qa7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0771",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #771",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/Q7/8/5K2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf6",
    "line": [
      "Kf6",
      "Kg8",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0772",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #772",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6B1/3P4/8/6k1/8/5Q2/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "d8=Q+",
    "line": [
      "d8=Q+",
      "Kg6",
      "Qdf6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0773",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #773",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3R4/3R4/3K4/5B1k/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh6",
      "Rh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0774",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #774",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3k4/7Q/8/R7/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Ra7+",
    "line": [
      "Ra7+",
      "Kc8",
      "Qf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0775",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #775",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3B4/8/8/8/5K2/3R4/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Kf3",
    "line": [
      "Kf3",
      "Kf1",
      "Rd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0776",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #776",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/8/8/2R5/6R1/8/B4K2 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Ke8",
      "Rc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0777",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #777",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/8/8/2K1R2R/5k2 w - - 0 1",
    "side": "w",
    "solution": "Reg2",
    "line": [
      "Reg2",
      "Ke1",
      "Rg1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0778",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #778",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/5P2/K7/8/5Q2/1k5N w - - 0 1",
    "side": "w",
    "solution": "Kb3",
    "line": [
      "Kb3",
      "Kc1",
      "Qe1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0779",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #779",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7N/8/2P5/3Q4/6k1/8/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Ng6",
    "line": [
      "Ng6",
      "Kh3",
      "Qg2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0780",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #780",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/3K4/2Q5/7k/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rc2+",
    "line": [
      "Rc2+",
      "Kh1",
      "Qe1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0781",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #781",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/8/8/8/k2K2Q1 w - - 0 1",
    "side": "w",
    "solution": "Kc2+",
    "line": [
      "Kc2+",
      "Ka2",
      "Qa7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0782",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #782",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/8/R3R3/8/8/6B1/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kg8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0783",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #783",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/k2K4/8/5R2/2N5/8/7B w - - 0 1",
    "side": "w",
    "solution": "Kc7",
    "line": [
      "Kc7",
      "Ka7",
      "Ra4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0784",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #784",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/5Q2/5K2/8/8/5k2/3R4 w - - 0 1",
    "side": "w",
    "solution": "Kg4+",
    "line": [
      "Kg4+",
      "Ke3",
      "Qf3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0785",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #785",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/8/7R/8/6R1/8/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Rh7",
    "line": [
      "Rh7",
      "Ke8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0786",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #786",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/R7/4k3/8/8/3R1K2/8 w - - 0 1",
    "side": "w",
    "solution": "Kf3",
    "line": [
      "Kf3",
      "Kf5",
      "Rd5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0787",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #787",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/2R5/8/2R5/6k1/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6",
    "line": [
      "Rh6",
      "Kg2",
      "Rg4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0788",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #788",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4Q3/8/2K5/2R5/8/k7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb5",
    "line": [
      "Rb5",
      "Ka4",
      "Qa8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0789",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #789",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/6k1/3K2P1/6Q1/8/8/8/6B1 w - - 0 1",
    "side": "w",
    "solution": "Bd4+",
    "line": [
      "Bd4+",
      "Kf8",
      "Qd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0790",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #790",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/Q7/8/8/7k/4K3 w - - 0 1",
    "side": "w",
    "solution": "Kf2",
    "line": [
      "Kf2",
      "Kh3",
      "Qh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0791",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #791",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "K5R1/8/8/8/8/7R/3k4/1B6 w - - 0 1",
    "side": "w",
    "solution": "Rg2+",
    "line": [
      "Rg2+",
      "Ke1",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0792",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #792",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3k4/R7/8/2Q5/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Qf7+",
    "line": [
      "Qf7+",
      "Kc8",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0793",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #793",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6RB/8/6R1/k6K/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8",
    "line": [
      "Rb8",
      "Ka4",
      "Ra6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0794",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #794",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/2P5/8/1Q2K3/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Kf2",
    "line": [
      "Kf2",
      "Kh1",
      "Qh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0795",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #795",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1K3k2/8/4P2R/8/6R1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7",
    "line": [
      "Rh7",
      "Ke8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0796",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #796",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/1Q6/3k1K2/8/8/4B3 w - - 0 1",
    "side": "w",
    "solution": "Qc6",
    "line": [
      "Qc6",
      "Kd3",
      "Qe4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0797",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #797",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3B4/4R3/7R/8/k7/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rb5",
    "line": [
      "Rb5",
      "Ka4",
      "Ra6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0798",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #798",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/k1K4Q/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe3",
    "line": [
      "Qe3",
      "Ka5",
      "Qa3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0799",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #799",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/K7/3R4/8/7B/8/k7/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rb6",
    "line": [
      "Rb6",
      "Ka3",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0800",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #800",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/4P3/4Q3/7k/8/6K1/7N w - - 0 1",
    "side": "w",
    "solution": "Kf3",
    "line": [
      "Kf3",
      "Kh3",
      "Qh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0801",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #801",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5R2/8/1K6/4R3/7P/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rf2",
    "line": [
      "Rf2",
      "Kc1",
      "Re1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0802",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #802",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3R4/4k3/7Q/2K5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf7",
    "line": [
      "Rf7",
      "Kd6",
      "Qd5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0803",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #803",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "K7/7k/8/8/2Q5/8/8/6B1 w - - 0 1",
    "side": "w",
    "solution": "Qf7+",
    "line": [
      "Qf7+",
      "Kh8",
      "Bd4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0804",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #804",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/k7/3K1R2/8/8/8/4B3/8 w - - 0 1",
    "side": "w",
    "solution": "Kc7",
    "line": [
      "Kc7",
      "Ka8",
      "Ra6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0805",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #805",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/2B2K2/3R4/8/2R5/8/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rc2",
    "line": [
      "Rc2",
      "Kf1",
      "Rd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0806",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #806",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5Q2/8/8/2R5/7K/k7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb5+",
    "line": [
      "Rb5+",
      "Ka4",
      "Qb4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0807",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #807",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6k1/8/1R6/8/4K3/P7/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Rb7",
    "line": [
      "Rb7",
      "Kf8",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0808",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #808",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2k3K1/8/8/8/5Q2/8/8/7R w - - 0 1",
    "side": "w",
    "solution": "Rh7",
    "line": [
      "Rh7",
      "Kd8",
      "Qb8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0809",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #809",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6B1/3k4/5K2/2R5/1N6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Be6+",
    "line": [
      "Be6+",
      "Kd8",
      "Rc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0810",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #810",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/2R5/4K3/8/8/B6k/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rg6",
    "line": [
      "Rg6",
      "Kh3",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0811",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #811",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/P7/8/1B6/3Q3K/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Qf2+",
    "line": [
      "Qf2+",
      "Kh1",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0812",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #812",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "R7/8/8/8/6R1/2k5/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Rb8",
    "line": [
      "Rb8",
      "Kd3",
      "Rb3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0813",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #813",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6K1/3P4/2N5/3k4/1Q6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "d8=Q+",
    "line": [
      "d8=Q+",
      "Kxc6",
      "Qdd6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0814",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #814",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1R1R4/8/8/7P/6K1/4k3/8 w - - 0 1",
    "side": "w",
    "solution": "Rb1",
    "line": [
      "Rb1",
      "Ke3",
      "Re1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0815",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #815",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2R5/3K4/8/8/8/8/k7/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rb8",
    "line": [
      "Rb8",
      "Ka3",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0816",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #816",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/R2B4/8/R7/7K/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Rf4",
    "line": [
      "Rf4",
      "Kh1",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0817",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #817",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4B3/7k/8/1K3R2/3R4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg3",
    "line": [
      "Rg3",
      "Kh7",
      "Rh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0818",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #818",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4B3/8/3K3k/5P2/8/2Q5/8 w - - 0 1",
    "side": "w",
    "solution": "Qf5+",
    "line": [
      "Qf5+",
      "Kh6",
      "Bf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0819",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #819",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1Q6/8/8/7k/4K3/8/7B w - - 0 1",
    "side": "w",
    "solution": "Kf4",
    "line": [
      "Kf4",
      "Kh5",
      "Qh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0820",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #820",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/8/4R3/R7/6K1/4B3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kg8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0821",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #821",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/8/8/4Q3/6R1/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Qc7",
    "line": [
      "Qc7",
      "Ke8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0822",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #822",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5P1k/3Q4/8/3K4/4N3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf5",
    "line": [
      "Nf5",
      "Kh8",
      "Qh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0823",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #823",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/4B2P/2K5/8/5Q2/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qa3+",
    "line": [
      "Qa3+",
      "Kb1",
      "Bf5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0824",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #824",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/7k/7N/4B3/5KR1/8 w - - 0 1",
    "side": "w",
    "solution": "Kf3",
    "line": [
      "Kf3",
      "Kxh4",
      "Rh2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0825",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #825",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4R3/3K4/k7/8/8/8/3Q4/8 w - - 0 1",
    "side": "w",
    "solution": "Kc6",
    "line": [
      "Kc6",
      "Ka7",
      "Qa5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0826",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #826",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/2R5/8/8/R2K4/8/4B3 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Ke8",
      "Rc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0827",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #827",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/8/3R4/4KR2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf6",
    "line": [
      "Kf6",
      "Kf8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0828",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #828",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5Q2/7k/8/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg8",
    "line": [
      "Qg8",
      "Kh5",
      "Qh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0829",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #829",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/8/8/3P4/8/8/5RR1/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Kd8",
      "Rf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0830",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #830",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/8/8/3Q1K2/8/8/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Kf6",
    "line": [
      "Kf6",
      "Kf8",
      "Qa8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0831",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #831",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/6R1/1R6/6K1/8/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Kf3+",
    "line": [
      "Kf3+",
      "Kh2",
      "Rh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0832",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #832",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/6k1/3K4/8/2Q5/8/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Rg2+",
    "line": [
      "Rg2+",
      "Kf8",
      "Qg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0833",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #833",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1k6/6R1/8/7P/8/7K/4R3 w - - 0 1",
    "side": "w",
    "solution": "Re7+",
    "line": [
      "Re7+",
      "Ka8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0834",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #834",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6R1/6K1/8/1k6/8/8/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rb8+",
    "line": [
      "Rb8+",
      "Ka6",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0835",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #835",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/4K3/7k/Q7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf5",
    "line": [
      "Kf5",
      "Kh5",
      "Qh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0836",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #836",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/5R2/KR6/8/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rf2",
    "line": [
      "Rf2",
      "Kd1",
      "Rb1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0837",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #837",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4R3/8/8/3k4/8/2K5/P7/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg6",
    "line": [
      "Rg6",
      "Kc5",
      "Re5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0838",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #838",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "R7/8/8/6R1/7K/5P2/8/7k w - - 0 1",
    "side": "w",
    "solution": "Kg3",
    "line": [
      "Kg3",
      "Kg1",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0839",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #839",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/8/8/5Q2/1k1K2B1 w - - 0 1",
    "side": "w",
    "solution": "Qc2+",
    "line": [
      "Qc2+",
      "Ka1",
      "Bd4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0840",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #840",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3N4/4B3/k7/8/2K5/8/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Bc5",
    "line": [
      "Bc5",
      "Ka5",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0841",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #841",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k5K1/8/8/8/2R5/8/B7/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rb1",
    "line": [
      "Rb1",
      "Ka7",
      "Ra4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0842",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #842",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7k/8/8/5K2/8/8/8/3Q4 w - - 0 1",
    "side": "w",
    "solution": "Kg6",
    "line": [
      "Kg6",
      "Kg8",
      "Qd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0843",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #843",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4P3/3Q4/8/1N1K4/8/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Kc3",
    "line": [
      "Kc3",
      "Kb1",
      "Qd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0844",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #844",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/8/8/8/8/3K1Q2/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Qb7",
    "line": [
      "Qb7",
      "Kd8",
      "Rf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0845",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #845",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/8/R7/8/8/6k1/1P6/3K4 w - - 0 1",
    "side": "w",
    "solution": "Rg6+",
    "line": [
      "Rg6+",
      "Kh4",
      "Rh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0846",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #846",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1K6/8/2k5/7R/6R1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd4",
    "line": [
      "Rd4",
      "Kb6",
      "Rd6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0847",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #847",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/Q6P/1K6/8/7k/1N6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7",
    "line": [
      "Qg7",
      "Kh5",
      "h8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0848",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #848",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/k7/3R4/8/8/4P3/3R1K2 w - - 0 1",
    "side": "w",
    "solution": "Rb1",
    "line": [
      "Rb1",
      "Ka7",
      "Ra5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0849",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #849",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/7k/K3R3/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Rg2",
    "line": [
      "Rg2",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0850",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #850",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/6Q1/k7/8/8/8/7R/K7 w - - 0 1",
    "side": "w",
    "solution": "Rb2",
    "line": [
      "Rb2",
      "Ka5",
      "Qa7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0851",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #851",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/5K2/3k4/B7/2Q5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf5",
    "line": [
      "Kf5",
      "Kd6",
      "Qe5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0852",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #852",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4K3/3B4/1R6/8/5R2/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rb2",
    "line": [
      "Rb2",
      "Kd1",
      "Rf1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0853",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #853",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7R/B4k2/8/4K3/R7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg4",
    "line": [
      "Rg4",
      "Ke7",
      "Rg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0854",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #854",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/3R4/8/3K4/k7/4B3 w - - 0 1",
    "side": "w",
    "solution": "Kc2",
    "line": [
      "Kc2",
      "Ka3",
      "Ra5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0855",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #855",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3N4/8/k7/P5Q1/8/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd5",
    "line": [
      "Qd5",
      "Ka7",
      "Qb7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0856",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #856",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/6k1/3P4/8/3R4/8/2K2R2 w - - 0 1",
    "side": "w",
    "solution": "Rg3+",
    "line": [
      "Rg3+",
      "Kh7",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0857",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #857",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k6/8/2K5/8/8/4N3/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Ra1",
    "line": [
      "Ra1",
      "Kc8",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0858",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #858",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/4Q3/4P2k/3K4/8/8/7B w - - 0 1",
    "side": "w",
    "solution": "Bf3+",
    "line": [
      "Bf3+",
      "Kh4",
      "Qg4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0859",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #859",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5Q2/3k4/6R1/8/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf7+",
    "line": [
      "Qf7+",
      "Kc8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0860",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #860",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1R6/8/8/k6K/8/1B6/N7 w - - 0 1",
    "side": "w",
    "solution": "Bc3",
    "line": [
      "Bc3",
      "Ka3",
      "Ra7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0861",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #861",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7k/8/B7/4P3/8/4Q2K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh6+",
    "line": [
      "Qh6+",
      "Kg8",
      "Bc4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0862",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #862",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "Q7/8/7K/8/R7/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg8",
    "line": [
      "Qg8",
      "Kh2",
      "Rh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0863",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #863",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "K6R/Q7/8/8/8/8/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rh2",
    "line": [
      "Rh2",
      "Ke1",
      "Qg1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0864",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #864",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1K6/4R2B/8/8/7R/1k6/8 w - - 0 1",
    "side": "w",
    "solution": "Re2+",
    "line": [
      "Re2+",
      "Kb1",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0865",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #865",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/Q7/4B3/1K5k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg5",
    "line": [
      "Qg5",
      "Kh2",
      "Qg2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0866",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #866",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/4QR2/8/8/8/1k6/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Rf4",
    "line": [
      "Rf4",
      "Kc3",
      "Qe3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0867",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #867",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3K3k/8/8/8/8/8/2Q2R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rf7",
    "line": [
      "Rf7",
      "Kg8",
      "Qh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0868",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #868",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/1R6/8/8/7k/K1R5 w - - 0 1",
    "side": "w",
    "solution": "Rg5",
    "line": [
      "Rg5",
      "Kh3",
      "Rh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0869",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #869",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/K1k5/8/6B1/8/8/Q7 w - - 0 1",
    "side": "w",
    "solution": "Qd4",
    "line": [
      "Qd4",
      "Kc7",
      "Qb6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0870",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #870",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/P7/8/8/3Q4/8/2K1N3/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7",
    "line": [
      "Qg7",
      "Kd8",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0871",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #871",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/6P1/6Q1/1K1k4/6N1/8 w - - 0 1",
    "side": "w",
    "solution": "Qc4+",
    "line": [
      "Qc4+",
      "Kd2",
      "Qc2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0872",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #872",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7B/7R/8/8/8/k7/2KN4/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4",
    "line": [
      "Rh4",
      "Ka2",
      "Ra4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0873",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #873",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/1B6/2Q5/3K4/6k1 w - - 0 1",
    "side": "w",
    "solution": "Qh3",
    "line": [
      "Qh3",
      "Kf2",
      "Bc5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0874",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #874",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5B1R/8/8/1R6/6k1/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Ke2",
    "line": [
      "Ke2",
      "Kg2",
      "Rg4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0875",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #875",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/8/8/2K5/7k/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0876",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #876",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/7Q/k7/8/3K2P1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kc4",
    "line": [
      "Kc4",
      "Ka4",
      "Qa6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0877",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #877",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k3K2/8/2P5/8/8/1B5Q/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd7",
    "line": [
      "Qd7",
      "Ka8",
      "Qb7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0878",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #878",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/6Q1/8/8/2K5/1P6/k7 w - - 0 1",
    "side": "w",
    "solution": "Kc2",
    "line": [
      "Kc2",
      "Ka2",
      "Qa6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0879",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #879",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/5R2/8/4R3/1k6/3K4 w - - 0 1",
    "side": "w",
    "solution": "Ra5",
    "line": [
      "Ra5",
      "Kb1",
      "Rb3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0880",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #880",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "K2R4/8/8/3B4/7k/2R5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8",
    "line": [
      "Rg8",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0881",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #881",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4R3/2B3K1/8/8/7k/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Re4+",
    "line": [
      "Re4+",
      "Kg5",
      "Rb5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0882",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #882",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1K6/8/2Q5/8/8/8/1k6/2R5 w - - 0 1",
    "side": "w",
    "solution": "Qc3+",
    "line": [
      "Qc3+",
      "Ka2",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0883",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #883",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1K4N1/3k4/8/P5Q1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf6",
    "line": [
      "Qf6",
      "Ke8",
      "Qe7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0884",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #884",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/8/8/R7/8/3R4/8/B6K w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kf8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0885",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #885",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/2k5/5R2/5Q2/8/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh7+",
    "line": [
      "Qh7+",
      "Kb8",
      "Rf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0886",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #886",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/7k/4K3/8/Q7/3P4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf7",
    "line": [
      "Kf7",
      "Kh8",
      "Qh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0887",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #887",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/8/6R1/2K5/5N2/8/8/B7 w - - 0 1",
    "side": "w",
    "solution": "Kb6",
    "line": [
      "Kb6",
      "Kb8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0888",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #888",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/5P2/8/R7/2k5/4K3/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rb1",
    "line": [
      "Rb1",
      "Kc3",
      "Rc5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0889",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #889",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/8/4K3/8/8/3B4/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rg1",
    "line": [
      "Rg1",
      "Ke8",
      "Rg8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0890",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #890",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/8/2KR4/8/2kB4 w - - 0 1",
    "side": "w",
    "solution": "Bb3",
    "line": [
      "Bb3",
      "Kb1",
      "Rd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0891",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #891",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2N2k2/8/5P2/5K2/8/8/8/2Q5 w - - 0 1",
    "side": "w",
    "solution": "Qc7",
    "line": [
      "Qc7",
      "Kg8",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0892",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #892",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/2P3K1/2N2Q2/8/8/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Qc2+",
    "line": [
      "Qc2+",
      "Ka3",
      "Qb3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0893",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #893",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6Q1/8/7k/8/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kf5",
    "line": [
      "Kf5",
      "Kh5",
      "Qh8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0894",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #894",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/P1Q5/8/8/4K2k/8 w - - 0 1",
    "side": "w",
    "solution": "Kf2",
    "line": [
      "Kf2",
      "Kh3",
      "Qh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0895",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #895",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/8/8/8/8/K2Q4/8/4B3 w - - 0 1",
    "side": "w",
    "solution": "Qa6+",
    "line": [
      "Qa6+",
      "Kb8",
      "Bg3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0896",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #896",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7B/8/8/5k2/8/8/3KR1R1/8 w - - 0 1",
    "side": "w",
    "solution": "Kd3",
    "line": [
      "Kd3",
      "Kf4",
      "Ref2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0897",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #897",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2N5/8/8/8/7k/3Q4/3P1K2/8 w - - 0 1",
    "side": "w",
    "solution": "Qg6",
    "line": [
      "Qg6",
      "Kh3",
      "Qh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0898",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #898",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/5Q2/K1R5/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rc2",
    "line": [
      "Rc2",
      "Kd1",
      "Qd2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0899",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #899",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k2B3/3R4/8/8/K7/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc3",
    "line": [
      "Rc3",
      "Ka8",
      "Rc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0900",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #900",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2K1B3/8/8/8/8/1Q6/8/k7 w - - 0 1",
    "side": "w",
    "solution": "Qa3+",
    "line": [
      "Qa3+",
      "Kb1",
      "Bg6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0901",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #901",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/8/8/3P4/8/R7/8/1K2k3 w - - 0 1",
    "side": "w",
    "solution": "Ra2",
    "line": [
      "Ra2",
      "Kd1",
      "Rf1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0902",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #902",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/1R6/1R6/8/7K/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc6",
    "line": [
      "Rc6",
      "Ke8",
      "Rc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0903",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #903",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/5Q2/k4K2/8/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rb2",
    "line": [
      "Rb2",
      "Ka4",
      "Qa6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0904",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #904",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1Q6/8/k7/8/8/1K6/B7/8 w - - 0 1",
    "side": "w",
    "solution": "Kc4",
    "line": [
      "Kc4",
      "Ka5",
      "Qb5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0905",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #905",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5R2/6P1/4k3/8/K2R4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q+",
    "line": [
      "g8=Q+",
      "Ke7",
      "Qf7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0906",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #906",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k6/1P6/1Q2K3/8/8/N7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qb5",
    "line": [
      "Qb5",
      "Kc7",
      "b8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0907",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #907",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2k5/8/7K/8/8/3R4/8/4Q3 w - - 0 1",
    "side": "w",
    "solution": "Qe7",
    "line": [
      "Qe7",
      "Kb8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0908",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #908",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/5R2/8/2B5/R7/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rf7",
    "line": [
      "Rf7",
      "Ke8",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0909",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #909",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3R4/4R3/K6k/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Kh4",
      "Rh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0910",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #910",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2k4K/8/7R/8/8/3R4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh7",
    "line": [
      "Rh7",
      "Kb8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0911",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #911",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/k7/3K1R2/8/8/8/8/5Q2 w - - 0 1",
    "side": "w",
    "solution": "Kc7",
    "line": [
      "Kc7",
      "Ka8",
      "Ra6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0912",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #912",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3Q4/8/3R2K1/8/6k1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd3",
    "line": [
      "Rd3",
      "Kf4",
      "Qd4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0913",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #913",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1P5R/8/8/1R6/4K1k1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ke2",
    "line": [
      "Ke2",
      "Kg2",
      "Rg4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0914",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #914",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7k/8/2B5/8/8/5Q2/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Qf8+",
    "line": [
      "Qf8+",
      "Kh7",
      "Be4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0915",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #915",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/BP1k4/6Q1/8/8/8/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q",
    "line": [
      "b8=Q",
      "Ke7",
      "Qbe8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0916",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #916",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/KR6/2B4k/8/8/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg3",
    "line": [
      "Rg3",
      "Kh5",
      "Rh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0917",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #917",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k6/8/6K1/8/R7/8/8/5Q2 w - - 0 1",
    "side": "w",
    "solution": "Qf7",
    "line": [
      "Qf7",
      "Kc8",
      "Ra8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0918",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #918",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/3K4/1R6/8/6R1/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rg2",
    "line": [
      "Rg2",
      "Kd1",
      "Rb1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0919",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #919",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/7K/2R5/7R/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Rb4",
    "line": [
      "Rb4",
      "Ka1",
      "Ra3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0920",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #920",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2R5/1P6/8/3K4/8/R7/5k2/8 w - - 0 1",
    "side": "w",
    "solution": "Rc2+",
    "line": [
      "Rc2+",
      "Kg1",
      "Ra1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0921",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #921",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2k5/8/3K4/8/8/R7/8/N7 w - - 0 1",
    "side": "w",
    "solution": "Rb3",
    "line": [
      "Rb3",
      "Kd8",
      "Rb8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0922",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #922",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7R/3k4/5K2/3P4/1R6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc4",
    "line": [
      "Rc4",
      "Kd6",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0923",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #923",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/4R3/3R4/2k5/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Red5",
    "line": [
      "Red5",
      "Kc2",
      "Rc5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0924",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #924",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/8/8/2K2Q2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kb6",
    "line": [
      "Kb6",
      "Kb8",
      "Qf8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0925",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #925",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/7k/3Q3P/8/8/8/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Qf6",
    "line": [
      "Qf6",
      "Kg8",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0926",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #926",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2K5/P4R2/8/8/7k/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Kh5",
      "Rh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0927",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #927",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/2R5/4K3/1R6/2P4k/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Kh3",
      "Rh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0928",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #928",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "4k3/8/8/5B2/8/3P2Q1/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Qg7",
    "line": [
      "Qg7",
      "Kd8",
      "Qd7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0929",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #929",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1R6/8/3K4/8/8/7k/4Q3 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7",
      "Kh3",
      "Qg3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0930",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #930",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/P7/8/2Q5/3K4/8/8/6N1 w - - 0 1",
    "side": "w",
    "solution": "Qa5",
    "line": [
      "Qa5",
      "Kb7",
      "a8=Q#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0931",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #931",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/5B2/7Q/8/1k6/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Qb5+",
    "line": [
      "Qb5+",
      "Ka3",
      "Be7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0932",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #932",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "1k6/3R4/8/8/3R4/1K6/4P3/8 w - - 0 1",
    "side": "w",
    "solution": "Rc4",
    "line": [
      "Rc4",
      "Ka8",
      "Rc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0933",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #933",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/R3N3/8/K7/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rc5",
    "line": [
      "Rc5",
      "Ka1",
      "Rc1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0934",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #934",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/1Q6/1K6/R7/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Qf1",
    "line": [
      "Qf1",
      "Kc2",
      "Ra2#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0935",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #935",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "R7/8/8/2K5/3Q4/1k6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf2",
    "line": [
      "Qf2",
      "Kc3",
      "Ra3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0936",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #936",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2k5/4R3/1K6/7N/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6",
    "line": [
      "Nf6",
      "Kd8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0937",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #937",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/B1R5/7K/8/7R/8/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rh2",
    "line": [
      "Rh2",
      "Ka1",
      "Rc1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0938",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #938",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/6k1/2R5/8/8/2K5/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rd7+",
    "line": [
      "Rd7+",
      "Kf8",
      "Rc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0939",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #939",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "2K2k2/8/3R4/8/RP6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kg8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0940",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #940",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/6R1/8/7Q/3k4/8/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rc7",
    "line": [
      "Rc7",
      "Ke4",
      "Rc4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0941",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #941",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/7k/Q7/8/8/4K3/R7 w - - 0 1",
    "side": "w",
    "solution": "Rg1",
    "line": [
      "Rg1",
      "Kh7",
      "Qh5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0942",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #942",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3R4/8/2K5/8/8/7R/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rh2",
    "line": [
      "Rh2",
      "Kf1",
      "Rd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0943",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #943",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/K7/8/1k6/8/Q4B2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc3",
    "line": [
      "Qc3",
      "Ka4",
      "Bc6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0944",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #944",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/5R2/8/2R5/1K5k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg6",
    "line": [
      "Rg6",
      "Kh2",
      "Rh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0945",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #945",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/1B6/3Q1K2/8/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc7",
    "line": [
      "Bc7",
      "Kh4",
      "Qh1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0946",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #946",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/2R5/1B5k/8/8/8/4R3/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rg2",
    "line": [
      "Rg2",
      "Kh5",
      "Rh7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0947",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #947",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/4R3/8/8/4B2k/2K5/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rg1",
    "line": [
      "Rg1",
      "Kh4",
      "Rh6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0948",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #948",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/8/8/8/8/8/3k1KQ1/R7 w - - 0 1",
    "side": "w",
    "solution": "Qc6",
    "line": [
      "Qc6",
      "Kd3",
      "Rd1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0949",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #949",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3k4/8/8/5K2/2Q5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ke6",
    "line": [
      "Ke6",
      "Ke8",
      "Qc8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0950",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #950",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5B2/7k/8/Q7/2K5/2P5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg5",
    "line": [
      "Qg5",
      "Kh8",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0951",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #951",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "3R2B1/7R/k7/8/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rb8",
    "line": [
      "Rb8",
      "Ka5",
      "Ra7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0952",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Mat Ağı Kur #952",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "5k2/8/R7/8/K7/4R3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7",
    "line": [
      "Ra7",
      "Kg8",
      "Re8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0953",
    "level": "Orta",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #953",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/1k6/3R4/6K1/8/8/8/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Qb6+",
    "line": [
      "Qb6+",
      "Ka8",
      "Rd8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0954",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #954",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "R2Bk3/3N4/8/8/8/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne5",
    "line": [
      "Ne5",
      "Kf8",
      "Bf6#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0955",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #955",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "7K/7R/8/6k1/8/8/5Q2/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7+",
    "line": [
      "Rg7+",
      "Kh6",
      "Qh4#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0956",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Planlı Mat #956",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6K1/Q7/6k1/8/2R5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc5",
    "line": [
      "Rc5",
      "Kh6",
      "Qg7#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0957",
    "level": "Orta",
    "theme": "mat-2",
    "title": "Zorunlu Mat #957",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Önce şahı istediğin kareye zorla, sonra matı yap.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "k7/3QB3/8/5K2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc8+",
    "line": [
      "Qc8+",
      "Ka7",
      "Bc5#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0958",
    "level": "Zor",
    "theme": "mat-2",
    "title": "İki Hamlede Mat #958",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "Rakip ne oynarsa oynasın mat olmalı; tüm cevapları kontrol et.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/3P4/8/K7/6B1/Q7/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Qe3+",
    "line": [
      "Qe3+",
      "Kf1",
      "Bh3#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0959",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Planlı Mat #959",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "8/k5K1/8/4N3/1Q6/8/7P/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7",
    "line": [
      "Nd7",
      "Ka8",
      "Qb8#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0960",
    "level": "Zor",
    "theme": "mat-2",
    "title": "Zorunlu Mat #960",
    "goal": "Beyaz oynar ve en fazla iki hamlede mat eder.",
    "hint": "İlk hamlen şahın kaçış karelerini azaltmalı.",
    "explanation": "Önce şahı hazırlık hamlesiyle sıkıştırdık, sonra kaçışı olmayan matı yaptık.",
    "fen": "6R1/8/4P2K/1R6/8/8/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Rb2",
    "line": [
      "Rb2",
      "Ke1",
      "Rg1#"
    ],
    "mateIn": 2
  },
  {
    "id": "puzzle-0961",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #961",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "3NK3/8/8/4k1q1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0962",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #962",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/6N1/8/8/5q2/2K3k1/8 w - - 0 1",
    "side": "w",
    "solution": "Nh4+",
    "line": [
      "Nh4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0963",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #963",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "3q4/8/8/k1N5/8/8/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Nb7+",
    "line": [
      "Nb7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0964",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #964",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "K7/8/1k6/2r5/8/2N5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Na4+",
    "line": [
      "Na4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0965",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #965",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/3q1k2/8/8/2N5/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0966",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #966",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/5NK1/8/5q2/6k1/8 w - - 0 1",
    "side": "w",
    "solution": "Nh4+",
    "line": [
      "Nh4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0967",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #967",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/N3k3/3q4/8/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Nc8+",
    "line": [
      "Nc8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0968",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #968",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/1k6/N7/8/q7/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Nc4+",
    "line": [
      "Nc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0969",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #969",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "2K5/8/8/8/8/2k5/1q3N2/8 w - - 0 1",
    "side": "w",
    "solution": "Nd1+",
    "line": [
      "Nd1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0970",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #970",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6r1/1K5N/8/3k4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0971",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #971",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "2N5/5K2/6r1/5k2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne7+",
    "line": [
      "Ne7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0972",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #972",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/6k1/8/8/3N1q2/2K5 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0973",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #973",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2k5/3N4/8/8/2q5/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Nb5+",
    "line": [
      "Nb5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0974",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #974",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7q/4N3/8/2K1k3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6+",
    "line": [
      "Ng6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0975",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #975",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/3K4/8/4q3/5N1k/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6+",
    "line": [
      "Ng6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0976",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #976",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7K/8/8/8/8/N1k5/3q4/8 w - - 0 1",
    "side": "w",
    "solution": "Nb1+",
    "line": [
      "Nb1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0977",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #977",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7q/8/3N3k/8/8/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0978",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #978",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2K5/8/8/5N1q/4k3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng2+",
    "line": [
      "Ng2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0979",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #979",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/4k3/1N1q4/8/8/8/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Nc8+",
    "line": [
      "Nc8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0980",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #980",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "3N4/7K/3r4/4k3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0981",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #981",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "1N6/2r5/8/2k5/8/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Na6+",
    "line": [
      "Na6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0982",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #982",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "4q3/8/8/5N1k/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Ng7+",
    "line": [
      "Ng7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0983",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #983",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "4q3/8/8/1N6/4k1K1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd6+",
    "line": [
      "Nd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0984",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #984",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2k5/3N2K1/8/8/q7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb5+",
    "line": [
      "Nb5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0985",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #985",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "K7/8/8/8/1N6/2k1q3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0986",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #986",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/5k2/6q1/2K5/6N1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0987",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #987",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7K/8/8/7k/8/8/8/5N1q w - - 0 1",
    "side": "w",
    "solution": "Ng3+",
    "line": [
      "Ng3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0988",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #988",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "q3N3/8/8/3k4/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7+",
    "line": [
      "Nc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0989",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #989",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/2q5/8/6N1/5k1K w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0990",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #990",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/3N4/q1k5/8/8/1K6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb8+",
    "line": [
      "Nb8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0991",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #991",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/4N3/8/4k3/5r2/3K4 w - - 0 1",
    "side": "w",
    "solution": "Ng4+",
    "line": [
      "Ng4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0992",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #992",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6K1/8/5k2/4r3/8/4N3/8 w - - 0 1",
    "side": "w",
    "solution": "Ng3+",
    "line": [
      "Ng3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0993",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #993",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/5k1q/8/1K6/8/7N/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng5+",
    "line": [
      "Ng5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0994",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #994",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/4N3/5k1q/8/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Ng8+",
    "line": [
      "Ng8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0995",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #995",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/5k1N/4q3/8/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Ng4+",
    "line": [
      "Ng4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0996",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #996",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/7q/4k3/8/8/7N/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Ng5+",
    "line": [
      "Ng5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0997",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #997",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2K5/8/5k2/8/1N6/4q3/8 w - - 0 1",
    "side": "w",
    "solution": "Nd4+",
    "line": [
      "Nd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0998",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #998",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/6N1/5q2/1K6/5k2 w - - 0 1",
    "side": "w",
    "solution": "Nh2+",
    "line": [
      "Nh2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-0999",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #999",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "2K5/8/8/8/3k4/8/3r4/4N3 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1000",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #1000",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "1K6/8/8/8/5N2/4k3/8/4q3 w - - 0 1",
    "side": "w",
    "solution": "Ng2+",
    "line": [
      "Ng2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1001",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1001",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6K1/8/8/3r4/8/3k4/2N5 w - - 0 1",
    "side": "w",
    "solution": "Nb3+",
    "line": [
      "Nb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1002",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1002",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "2k5/8/2q5/1N6/8/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Na7+",
    "line": [
      "Na7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1003",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1003",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/6K1/8/2q5/8/2k5/1N6 w - - 0 1",
    "side": "w",
    "solution": "Na3+",
    "line": [
      "Na3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1004",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1004",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7K/8/8/8/5k2/8/1N6/4q3 w - - 0 1",
    "side": "w",
    "solution": "Nd3+",
    "line": [
      "Nd3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1005",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1005",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/3N3q/6k1/8/8/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf8+",
    "line": [
      "Nf8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1006",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1006",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/1N6/1K2k3/8/8/3q4 w - - 0 1",
    "side": "w",
    "solution": "Nc3+",
    "line": [
      "Nc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1007",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1007",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "K1k1q3/8/8/1N6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd6+",
    "line": [
      "Nd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1008",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1008",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "5k2/8/5q2/6N1/8/8/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Nh7+",
    "line": [
      "Nh7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1009",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1009",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/N1q5/3k4/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Nb3+",
    "line": [
      "Nb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1010",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1010",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/1K6/5q2/6k1/8/2N5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1011",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1011",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7K/8/8/5q2/2k3N1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1012",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #1012",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/2N1q3/2K5/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Nd2+",
    "line": [
      "Nd2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1013",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1013",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/3K4/5k2/8/5r2/6N1 w - - 0 1",
    "side": "w",
    "solution": "Nh3+",
    "line": [
      "Nh3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1014",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1014",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/K7/8/2N5/8/2k5/1q6/8 w - - 0 1",
    "side": "w",
    "solution": "Na4+",
    "line": [
      "Na4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1015",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1015",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/2K4N/8/7k/6q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf5+",
    "line": [
      "Nf5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1016",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #1016",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/3N4/8/3q4/6k1/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Nf5+",
    "line": [
      "Nf5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1017",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1017",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/4r3/8/N7/3k4/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Nc5+",
    "line": [
      "Nc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1018",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1018",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/K7/8/6N1/7q/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1019",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1019",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6K1/8/q7/8/N7/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Nc4+",
    "line": [
      "Nc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1020",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1020",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/8/2k4K/1q3N2/8 w - - 0 1",
    "side": "w",
    "solution": "Nd1+",
    "line": [
      "Nd1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1021",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1021",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/3K4/8/8/1k6/2N1r3/8 w - - 0 1",
    "side": "w",
    "solution": "Nd4+",
    "line": [
      "Nd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1022",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1022",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/1N6/1K6/8/8/1k1q4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc5+",
    "line": [
      "Nc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1023",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1023",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "K7/8/2k5/3r4/8/8/N7/8 w - - 0 1",
    "side": "w",
    "solution": "Nb4+",
    "line": [
      "Nb4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1024",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1024",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/k7/1q1N4/6K1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc8+",
    "line": [
      "Nc8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1025",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1025",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6N1/5k2/8/5r2/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Nh6+",
    "line": [
      "Nh6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1026",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1026",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/1k6/2q5/8/2N5/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Na4+",
    "line": [
      "Na4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1027",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #1027",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/6N1/5k2/8/5r2/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Nh4+",
    "line": [
      "Nh4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1028",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1028",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2N5/3k1q2/8/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Ne8+",
    "line": [
      "Ne8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1029",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1029",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "K7/8/2k3r1/3N4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne7+",
    "line": [
      "Ne7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1030",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1030",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7K/8/8/8/3N4/8/3q3k/8 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1031",
    "level": "Kolay",
    "theme": "catal",
    "title": "İki Hedef Birden #1031",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/8/5k2/2N3q1/3K4 w - - 0 1",
    "side": "w",
    "solution": "Ne1+",
    "line": [
      "Ne1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1032",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1032",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/q1k1K3/8/8/8/2N5/8 w - - 0 1",
    "side": "w",
    "solution": "Nb4+",
    "line": [
      "Nb4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1033",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1033",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/7K/8/8/8/4k3/1N3r2/8 w - - 0 1",
    "side": "w",
    "solution": "Nd1+",
    "line": [
      "Nd1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1034",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1034",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "2k5/8/2q5/1N6/8/8/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Na7+",
    "line": [
      "Na7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1035",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1035",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/3N4/q1k2K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb6+",
    "line": [
      "Nb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1036",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1036",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/q7/8/3K4/3N4/2k5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb5+",
    "line": [
      "Nb5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1037",
    "level": "Kolay",
    "theme": "catal",
    "title": "Atın Sürprizi #1037",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/3q4/8/8/N4K2/1k6 w - - 0 1",
    "side": "w",
    "solution": "Nc3+",
    "line": [
      "Nc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1038",
    "level": "Kolay",
    "theme": "catal",
    "title": "At Çatalı #1038",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/5N2/8/5k2/6r1/1K6 w - - 0 1",
    "side": "w",
    "solution": "Nh4+",
    "line": [
      "Nh4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1039",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1039",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2q5/3N4/8/3K4/k7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb5+",
    "line": [
      "Nb5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1040",
    "level": "Kolay",
    "theme": "catal",
    "title": "Çifte Saldırı #1040",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/1k3q2/4N3/8/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Nd8+",
    "line": [
      "Nd8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1041",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1041",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/6k1/7q/8/1K5N/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1042",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1042",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/6q1/3N4/8/3k4/5K2 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1043",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1043",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "5q1k/8/8/8/5N2/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6+",
    "line": [
      "Ng6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1044",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1044",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6N1/5q2/8/5k2/8/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Nh6+",
    "line": [
      "Nh6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1045",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1045",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6k1/8/8/3N2K1/4q3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1046",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1046",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "5N2/8/5q2/6k1/8/1K6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nh7+",
    "line": [
      "Nh7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1047",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1047",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "5N1r/8/8/4k3/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6+",
    "line": [
      "Ng6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1048",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1048",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/7K/8/8/r7/8/N3k3 w - - 0 1",
    "side": "w",
    "solution": "Nc2+",
    "line": [
      "Nc2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1049",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1049",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "1K3N2/4k3/8/4r3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6+",
    "line": [
      "Ng6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1050",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1050",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/8/2k1q3/5N2/1K6 w - - 0 1",
    "side": "w",
    "solution": "Nd1+",
    "line": [
      "Nd1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1051",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1051",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6K1/8/8/8/k7/3N4/8/3q4 w - - 0 1",
    "side": "w",
    "solution": "Nb2+",
    "line": [
      "Nb2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1052",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1052",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/3q3k/4N3/8/8/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Nf8+",
    "line": [
      "Nf8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1053",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1053",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/7K/1k1N4/q7/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc4+",
    "line": [
      "Nc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1054",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1054",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/7K/8/1N6/2q5/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Na2+",
    "line": [
      "Na2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1055",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1055",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "1N3k2/8/5q2/8/8/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7+",
    "line": [
      "Nd7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1056",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1056",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/5q2/2N1k3/8/4K3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd8+",
    "line": [
      "Nd8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1057",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1057",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/5k2/8/1q6/4N3/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1058",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1058",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/3q4/k1N5/8/8/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Nb8+",
    "line": [
      "Nb8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1059",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1059",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/5K2/8/8/5N1k/4q3/8 w - - 0 1",
    "side": "w",
    "solution": "Ng1+",
    "line": [
      "Ng1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1060",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1060",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "7K/8/8/8/1N1k4/q7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc2+",
    "line": [
      "Nc2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1061",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1061",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "K7/3k4/N3q3/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc5+",
    "line": [
      "Nc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1062",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1062",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/K7/6q1/3N4/8/3k4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1063",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1063",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/K7/8/8/2k5/8/2r5/1N6 w - - 0 1",
    "side": "w",
    "solution": "Na3+",
    "line": [
      "Na3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1064",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1064",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6K1/8/3k1r2/8/8/8/5N2 w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1065",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1065",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/1KN5/8/2q5/1k6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Na5+",
    "line": [
      "Na5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1066",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1066",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "1k6/8/1N6/2q5/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7+",
    "line": [
      "Nd7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1067",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1067",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "N1k5/3q4/5K2/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb6+",
    "line": [
      "Nb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1068",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1068",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "3q4/8/3k4/1KN5/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb7+",
    "line": [
      "Nb7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1069",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1069",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/5q2/2N5/8/K7/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1070",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1070",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/1K6/8/8/5k2/6r1/8/6N1 w - - 0 1",
    "side": "w",
    "solution": "Ne2+",
    "line": [
      "Ne2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1071",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1071",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/K3k3/5r2/8/5N2 w - - 0 1",
    "side": "w",
    "solution": "Nd2+",
    "line": [
      "Nd2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1072",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1072",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/5K2/6N1/5k2/8/5q2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nh4+",
    "line": [
      "Nh4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1073",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1073",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "2K5/8/8/8/8/3r1k2/6N1/8 w - - 0 1",
    "side": "w",
    "solution": "Ne1+",
    "line": [
      "Ne1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1074",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1074",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/5k2/6q1/8/6N1/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Ne5+",
    "line": [
      "Ne5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1075",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1075",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/1q6/2k2K2/8/2N5 w - - 0 1",
    "side": "w",
    "solution": "Na2+",
    "line": [
      "Na2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1076",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1076",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/5k2/8/8/4r3/5NK1/8 w - - 0 1",
    "side": "w",
    "solution": "Ng4+",
    "line": [
      "Ng4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1077",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1077",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "4k3/8/4q3/3N4/8/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7+",
    "line": [
      "Nc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1078",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1078",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/1K6/8/2k3N1/8/6q1 w - - 0 1",
    "side": "w",
    "solution": "Ne2+",
    "line": [
      "Ne2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1079",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1079",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "4K3/8/8/1k6/2N5/8/8/1q6 w - - 0 1",
    "side": "w",
    "solution": "Na3+",
    "line": [
      "Na3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1080",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1080",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "N7/3q4/8/8/2k5/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb6+",
    "line": [
      "Nb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1081",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1081",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/K7/8/8/8/8/5N2/2q1k3 w - - 0 1",
    "side": "w",
    "solution": "Nd3+",
    "line": [
      "Nd3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1082",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1082",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6K1/8/8/8/4k3/7N/8/7q w - - 0 1",
    "side": "w",
    "solution": "Nf2+",
    "line": [
      "Nf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1083",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1083",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/k7/7K/8/8/q1N5/8 w - - 0 1",
    "side": "w",
    "solution": "Nb4+",
    "line": [
      "Nb4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1084",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1084",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6K1/8/8/q1N5/3k4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb3+",
    "line": [
      "Nb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1085",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1085",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6q1/5k2/8/5N2/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Nh5+",
    "line": [
      "Nh5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1086",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1086",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6r1/7N/8/3k4/8/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Nf5+",
    "line": [
      "Nf5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1087",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1087",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/1k6/2q5/7K/2N5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Na5+",
    "line": [
      "Na5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1088",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1088",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/7q/8/8/8/5N1k/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Ng5+",
    "line": [
      "Ng5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1089",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1089",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/1N5K/2q5/8/8/1k6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Na5+",
    "line": [
      "Na5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1090",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1090",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/3N4/k1q5/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb7+",
    "line": [
      "Nb7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1091",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1091",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/5k1q/8/8/8/5K1N w - - 0 1",
    "side": "w",
    "solution": "Ng3+",
    "line": [
      "Ng3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1092",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1092",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6K1/1q6/2k5/8/2N5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Na4+",
    "line": [
      "Na4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1093",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1093",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6K1/8/8/2N5/5q2/8/1k6/8 w - - 0 1",
    "side": "w",
    "solution": "Nd3+",
    "line": [
      "Nd3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1094",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1094",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2N1k3/1q6/8/8/8/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1095",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1095",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/3k4/N1q5/8/8/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Nb8+",
    "line": [
      "Nb8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1096",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1096",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/3k4/1K6/8/6N1/5r2 w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1097",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1097",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/1k3q2/4N3/8/6K1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd8+",
    "line": [
      "Nd8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1098",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1098",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "1N3k2/8/5q2/8/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7+",
    "line": [
      "Nd7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1099",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1099",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/K7/2k5/3N4/8/8/2r5/8 w - - 0 1",
    "side": "w",
    "solution": "Nb4+",
    "line": [
      "Nb4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1100",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1100",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/8/2k1N3/5q2/2K5 w - - 0 1",
    "side": "w",
    "solution": "Nd1+",
    "line": [
      "Nd1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1101",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1101",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/7K/N1k5/3r4/8 w - - 0 1",
    "side": "w",
    "solution": "Nb1+",
    "line": [
      "Nb1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1102",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1102",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "4N3/8/4k3/1q6/8/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Nc7+",
    "line": [
      "Nc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1103",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1103",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/2N3K1/8/2q5/1k6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Na6+",
    "line": [
      "Na6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1104",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1104",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "6K1/8/k7/8/8/3N4/2q5/8 w - - 0 1",
    "side": "w",
    "solution": "Nb4+",
    "line": [
      "Nb4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1105",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1105",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/6k1/5q2/8/5N2/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nh5+",
    "line": [
      "Nh5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1106",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1106",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/3N4/k1q5/8/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Nb8+",
    "line": [
      "Nb8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1107",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1107",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/q7/3k4/8/5K2/2N5/8 w - - 0 1",
    "side": "w",
    "solution": "Nb4+",
    "line": [
      "Nb4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1108",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1108",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/7K/8/4k3/3r3N/8 w - - 0 1",
    "side": "w",
    "solution": "Nf1+",
    "line": [
      "Nf1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1109",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1109",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/7K/8/4k1r1/8/8/3N4/8 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1110",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1110",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/k1q5/3N4/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Nb3+",
    "line": [
      "Nb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1111",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1111",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "4k3/8/4q3/2KN4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7+",
    "line": [
      "Nc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1112",
    "level": "Orta",
    "theme": "catal",
    "title": "At Çatalı #1112",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/7K/8/4q3/8/8/3k3N w - - 0 1",
    "side": "w",
    "solution": "Nf2+",
    "line": [
      "Nf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1113",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1113",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/1K6/8/8/1k6/8/1q3N2 w - - 0 1",
    "side": "w",
    "solution": "Nd2+",
    "line": [
      "Nd2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1114",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1114",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Atın L hareketiyle aynı anda iki taşa saldırabileceği kareyi bul.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "1K6/8/3k4/2N5/8/8/5r2/8 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1115",
    "level": "Orta",
    "theme": "catal",
    "title": "İki Hedef Birden #1115",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/8/5N2/2r1k3/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1116",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1116",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/4N3/7k/3K4/7q/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1117",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1117",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/3N4/7K/3k4/2q5/8 w - - 0 1",
    "side": "w",
    "solution": "Nb4+",
    "line": [
      "Nb4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1118",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1118",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "Şah ve vezire birlikte bakan kare hangisi?",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "2K5/8/4k3/7N/8/8/6r1/8 w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1119",
    "level": "Orta",
    "theme": "catal",
    "title": "Çifte Saldırı #1119",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/8/q1k5/3N4/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb3+",
    "line": [
      "Nb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1120",
    "level": "Orta",
    "theme": "catal",
    "title": "Atın Sürprizi #1120",
    "goal": "Beyaz oynar ve atıyla çatal atarak taş kazanır.",
    "hint": "At taşların üzerinden atlayabilir; uzaktaki kareleri de kontrol et.",
    "explanation": "At aynı anda iki hedefe saldırdı. Rakip şahını kurtarmak zorunda, biz de diğer taşı kazanıyoruz.",
    "fen": "8/8/7N/4k1r1/8/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1121",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1121",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/8/2K3Q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qg8#",
    "line": [
      "Qg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1122",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1122",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/8/7K/8/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Qg8#",
    "line": [
      "Qg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1123",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1123",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/8/3K4/Q7/8 w - - 0 1",
    "side": "w",
    "solution": "Qg8#",
    "line": [
      "Qg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1124",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1124",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/8/1K6/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1125",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1125",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/8/8/8/5R1K w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1126",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1126",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/3ppp2/8/8/8/8/8/2R4K w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1127",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1127",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1pppK3/8/8/8/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1128",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1128",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k1K3/1ppp4/8/8/8/8/8/Q7 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1129",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1129",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/8/8/RK6/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1130",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1130",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/R1ppp3/8/8/8/6K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1131",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1131",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/1K2ppp1/8/2Q5/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1132",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1132",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/8/8/8/7Q/4K3 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1133",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1133",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/3Kppp1/1R6/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1134",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1134",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/8/8/7R/7K w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1135",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1135",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/2R5/8/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1136",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1136",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp1R1/7K/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1137",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1137",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/5K2/8/8/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1138",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1138",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/8/K7/7Q/8 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1139",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1139",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/K7/8/8/8/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1140",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1140",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k2K/3ppp2/6R1/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1141",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1141",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/2K5/8/8/6Q1 w - - 0 1",
    "side": "w",
    "solution": "Qg8#",
    "line": [
      "Qg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1142",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1142",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/5Rpp/8/8/8/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1143",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1143",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/7R/8/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1144",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1144",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/3ppp2/5Q2/8/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1145",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1145",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp3R/8/8/8/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1146",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1146",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/5R2/2K5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1147",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1147",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/8/R7/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1148",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1148",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/5R2/8/8/5K2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1149",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1149",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/2R5/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1150",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1150",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/6R1/8/8/8/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1151",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1151",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/4K3/5Q2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1152",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1152",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "K3k3/3ppp2/8/8/8/8/8/7Q w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1153",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1153",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/5R2/8/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1154",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1154",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/4Q3/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1155",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1155",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/8/4K3/8/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1156",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1156",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/8/2Q5/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1157",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1157",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/7Q/3K4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1158",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1158",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/1K3R2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1159",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1159",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/8/8/8/1Q3K2/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1160",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1160",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp4R/8/8/1K6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1161",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1161",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/8/5Q2/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1162",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1162",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1K4k1/3R1ppp/8/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1163",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1163",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/5K2/8/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1164",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1164",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1K5k/2R3pp/8/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1165",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1165",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/3ppp2/8/8/4K3/8/8/R7 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1166",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1166",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/K4ppp/8/8/8/8/4Q3/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1167",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1167",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/2K5/4Q3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1168",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1168",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1pppK3/8/8/8/8/8/5Q2 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1169",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1169",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/8/7K/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1170",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1170",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp1K3/8/8/6R1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1171",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1171",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp4K1/8/8/8/8/8/2Q5 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1172",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1172",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp1R2/8/2K5/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1173",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1173",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/8/3K4/8/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1174",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1174",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/K7/6R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1175",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1175",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/4K3/8/1Q6/8 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1176",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1176",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/8/8/8/2K5/7R w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1177",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1177",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2K1k3/3ppp2/8/8/3Q4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1178",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1178",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/4R3/8/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1179",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1179",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/8/8/8/K3Q3 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1180",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1180",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/3ppp2/8/R7/8/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1181",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1181",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/5K2/1Q6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1182",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1182",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/7R/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1183",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1183",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/8/1K6/8/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1184",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1184",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp5R/4K3/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1185",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1185",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/K4ppp/8/8/8/8/1Q6/8 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1186",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1186",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/4K3/8/8/8/5Q2/8 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1187",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1187",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp4R/8/8/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1188",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1188",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/5Q2/8/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1189",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1189",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/4R2K/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1190",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1190",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/8/2R5/1K6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1191",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1191",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/7R/8/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1192",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1192",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/3K4/8/6Q1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1193",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1193",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/2Rppp2/8/8/8/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1194",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1194",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/8/1K6/2R5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1195",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1195",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/8/8/3K4/R7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1196",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1196",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/3ppp1K/8/1R6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1197",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1197",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/8/1K6/8/R7 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1198",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1198",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/2K5/8/4R3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1199",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1199",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/R3K3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1200",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1200",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/7R/8/8/8/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1201",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1201",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/6R1/8/5K2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1202",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1202",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/8/5R2/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1203",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1203",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/8/8/6Q1/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1204",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1204",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/K7/4Q3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1205",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1205",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2pppK2/8/8/8/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1206",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1206",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/6K1/8/8/Q7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qf8#",
    "line": [
      "Qf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1207",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1207",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/8/5R2/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1208",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1208",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/1Q6/5K2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qd8#",
    "line": [
      "Qd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1209",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1209",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp4R1/8/8/8/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1210",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1210",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/8/2Q5/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1211",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1211",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/8/3K4/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1212",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1212",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/8/8/7Q/3K4 w - - 0 1",
    "side": "w",
    "solution": "Qh8#",
    "line": [
      "Qh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1213",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1213",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/ppK5/8/8/8/8/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1214",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1214",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp1K2/8/6R1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1215",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1215",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/7K/8/8/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1216",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1216",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp2K1/8/8/8/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1217",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1217",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/8/8/4R3/5K2 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1218",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1218",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/ppK5/8/7R/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1219",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1219",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp2R1/8/8/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1220",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1220",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/5R2/8/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1221",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1221",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/5R2/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1222",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1222",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/2RK4/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1223",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1223",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/5R2/8/8/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1224",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1224",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/4K3/6Q1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1225",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1225",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/6K1/8/8/8/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1226",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1226",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/8/8/6R1/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1227",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1227",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/6K1/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1228",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1228",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/8/4Q3/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Qa8#",
    "line": [
      "Qa8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1229",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1229",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/K7/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1230",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1230",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/3R2pp/8/8/8/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1231",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1231",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/2K5/3R4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1232",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1232",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/8/K7/8/2R5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1233",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1233",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/1K6/7R/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1234",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1234",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/8/8/6K1/4Q3 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1235",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1235",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/4K3/8/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1236",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1236",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/8/8/6K1/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rd8#",
    "line": [
      "Rd8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1237",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1237",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/R3K3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1238",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1238",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/K2pppR1/8/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1239",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1239",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp3K2/8/8/8/4R3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1240",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1240",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/3K4/8/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1241",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1241",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/6K1/8/8/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1242",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1242",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/4R3/8/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1243",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1243",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/8/8/1Q6/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Qb8#",
    "line": [
      "Qb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1244",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1244",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k3/3ppp2/8/8/8/1R6/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1245",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1245",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "4k1K1/3ppp2/8/8/8/8/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1246",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1246",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/5R2/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1247",
    "level": "Orta",
    "theme": "koridor",
    "title": "Son Yatay #1247",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/8/8/K7/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1248",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Kaçış Yok #1248",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/6K1/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra8#",
    "line": [
      "Ra8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1249",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1249",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/6pp/8/8/3K4/8/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rc8#",
    "line": [
      "Rc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1250",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1250",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp3/8/8/6Q1/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Qg8#",
    "line": [
      "Qg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1251",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Son Yatay #1251",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/8/4R1K1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1252",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1252",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "1k6/ppp5/8/8/1K3R2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1253",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1253",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "5k2/4ppp1/4Q3/8/8/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qc8#",
    "line": [
      "Qc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1254",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1254",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "7k/4K1pp/8/8/8/8/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1255",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1255",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/1R3ppp/1K6/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8#",
    "line": [
      "Rb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1256",
    "level": "Kolay",
    "theme": "koridor",
    "title": "Koridor Matı #1256",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şah yukarı çıkamıyorsa, yatay boyunca şah çekmek yeter.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "k7/pp6/5K2/8/7R/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8#",
    "line": [
      "Rh8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1257",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1257",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "3k4/2ppp1R1/8/8/3K4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8#",
    "line": [
      "Rg8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1258",
    "level": "Orta",
    "theme": "koridor",
    "title": "Arka Sıra Tuzağı #1258",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Son yatayı boydan boya tarayan bir hamle ara.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "6k1/5ppp/8/2K5/8/8/4Q3/8 w - - 0 1",
    "side": "w",
    "solution": "Qe8#",
    "line": [
      "Qe8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1259",
    "level": "Orta",
    "theme": "koridor",
    "title": "Koridor Matı #1259",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/K7/8/8/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Re8#",
    "line": [
      "Re8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1260",
    "level": "Orta",
    "theme": "koridor",
    "title": "Kaçış Yok #1260",
    "goal": "Beyaz oynar ve son yatayda mat eder.",
    "hint": "Şahın önündeki kendi piyonları ona engel oluyor; yan taraftan gel.",
    "explanation": "Şahın önü kendi piyonlarıyla kapalıydı. Son yataydan gelen şah çekişten kaçamadı — buna koridor matı denir.",
    "fen": "2k5/1ppp4/8/8/8/8/5RK1/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8#",
    "line": [
      "Rf8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1261",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1261",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/4N2K/8/rbp5/rkn5 w - - 0 1",
    "side": "w",
    "solution": "Nd2#",
    "line": [
      "Nd2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1262",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1262",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/8/4N2K/bp6/kr6 w - - 0 1",
    "side": "w",
    "solution": "Nc2#",
    "line": [
      "Nc2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1263",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1263",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/np1N4/kp6/pn6/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Nb8#",
    "line": [
      "Nb8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1264",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1264",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "K7/8/8/3N4/8/8/prn5/nkb5 w - - 0 1",
    "side": "w",
    "solution": "Nc3#",
    "line": [
      "Nc3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1265",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1265",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/7K/1N6/8/8/prr5/rkr5 w - - 0 1",
    "side": "w",
    "solution": "Na3#",
    "line": [
      "Na3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1266",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1266",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/6pn/6pk/4N1pp/8/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1267",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1267",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "6rk/6pn/8/8/7N/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6#",
    "line": [
      "Ng6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1268",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1268",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/K7/8/8/pp6/kp2N3/np6/8 w - - 0 1",
    "side": "w",
    "solution": "Nc4#",
    "line": [
      "Nc4#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1269",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1269",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/K1N5/8/8/1rpp4/1bkn4 w - - 0 1",
    "side": "w",
    "solution": "Nd3#",
    "line": [
      "Nd3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1270",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1270",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/4N3/8/7K/3nnp2/3nkr2 w - - 0 1",
    "side": "w",
    "solution": "Nd3#",
    "line": [
      "Nd3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1271",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1271",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "bn6/kb6/np5K/8/3N4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb5#",
    "line": [
      "Nb5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1272",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1272",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "rkr5/npp5/8/2N5/8/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7#",
    "line": [
      "Nd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1273",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1273",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/6N1/8/8/5rnp/3K1bkr w - - 0 1",
    "side": "w",
    "solution": "Nh3#",
    "line": [
      "Nh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1274",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1274",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/6nr/5Npk/6pp/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6#",
    "line": [
      "Ng6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1275",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1275",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/bp6/kp6/pp1N4/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7#",
    "line": [
      "Nc7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1276",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1276",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/1K6/8/8/7N/8/3nrp2/3nkr2 w - - 0 1",
    "side": "w",
    "solution": "Ng2#",
    "line": [
      "Ng2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1277",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1277",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/5N2/8/8/4bpr1/2K1nkn1 w - - 0 1",
    "side": "w",
    "solution": "Ne3#",
    "line": [
      "Ne3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1278",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1278",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/8/3K2br/3N2pk/6rn w - - 0 1",
    "side": "w",
    "solution": "Nf3#",
    "line": [
      "Nf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1279",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1279",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "nkn5/nnb5/8/8/1N6/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Na6#",
    "line": [
      "Na6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1280",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1280",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/7N/6pp/6rk/3K2pn/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6#",
    "line": [
      "Nf6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1281",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1281",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/N7/8/8/1bppK3/1bkn4 w - - 0 1",
    "side": "w",
    "solution": "Nb3#",
    "line": [
      "Nb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1282",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1282",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "6nk/6pp/3N4/8/8/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1283",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1283",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/3K4/8/1N6/8/8/npr5/bkr5 w - - 0 1",
    "side": "w",
    "solution": "Na3#",
    "line": [
      "Na3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1284",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1284",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "br6/kr2N3/pp6/8/4K3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc6#",
    "line": [
      "Nc6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1285",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1285",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/5N2/8/8/6bn/6pk/6br/6K1 w - - 0 1",
    "side": "w",
    "solution": "Ng5#",
    "line": [
      "Ng5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1286",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1286",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "6nk/6pp/8/K3N3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1287",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1287",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/bb6/krN5/np6/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Nb3#",
    "line": [
      "Nb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1288",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1288",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/8/8/pn1N4/knK5 w - - 0 1",
    "side": "w",
    "solution": "Nb3#",
    "line": [
      "Nb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1289",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1289",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/7K/5N2/8/8/6pp/6nk w - - 0 1",
    "side": "w",
    "solution": "Ng3#",
    "line": [
      "Ng3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1290",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1290",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "2K5/8/8/8/6rp/5Nrk/6bn/8 w - - 0 1",
    "side": "w",
    "solution": "Ng1#",
    "line": [
      "Ng1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1291",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1291",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "7K/8/8/8/8/8/1ppb1N2/1bkb4 w - - 0 1",
    "side": "w",
    "solution": "Nd3#",
    "line": [
      "Nd3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1292",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1292",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "1K6/8/8/8/5N2/8/5rpp/5rkr w - - 0 1",
    "side": "w",
    "solution": "Nh3#",
    "line": [
      "Nh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1293",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1293",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "4rkn1/3Kpnp1/8/8/7N/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6#",
    "line": [
      "Ng6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1294",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1294",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "bb6/kb6/nn1N4/8/8/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Nb5#",
    "line": [
      "Nb5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1295",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1295",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "bkn5/pbp5/8/4N3/8/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7#",
    "line": [
      "Nd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1296",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1296",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/3K4/6N1/8/8/5rnp/5rkb w - - 0 1",
    "side": "w",
    "solution": "Nh3#",
    "line": [
      "Nh3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1297",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1297",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/2K3N1/8/4npr1/4nkb1 w - - 0 1",
    "side": "w",
    "solution": "Ne3#",
    "line": [
      "Ne3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1298",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1298",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/2K5/8/pp6/kr2N3/nr6 w - - 0 1",
    "side": "w",
    "solution": "Nc3#",
    "line": [
      "Nc3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1299",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1299",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "6rk/6np/8/6N1/8/6K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1300",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1300",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "2nkn3/2bbp3/8/6N1/8/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1301",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1301",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/K7/8/5N2/8/5ppr/5nkn w - - 0 1",
    "side": "w",
    "solution": "Ne2#",
    "line": [
      "Ne2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1302",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1302",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/4K3/8/8/4N1pr/6bk w - - 0 1",
    "side": "w",
    "solution": "Ng3#",
    "line": [
      "Ng3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1303",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1303",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "3K4/8/8/8/8/pb6/kn2N3/bn6 w - - 0 1",
    "side": "w",
    "solution": "Nc1#",
    "line": [
      "Nc1#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1304",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1304",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "3K4/8/8/8/8/3N4/2bnp3/2nkb3 w - - 0 1",
    "side": "w",
    "solution": "Nb2#",
    "line": [
      "Nb2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1305",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1305",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/6pp/6bk/3KN1bn/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng2#",
    "line": [
      "Ng2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1306",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1306",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "7N/8/8/6bp/6bk/6np/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6#",
    "line": [
      "Ng6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1307",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1307",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/7K/5N2/4rpp1/4rkr1 w - - 0 1",
    "side": "w",
    "solution": "Nh2#",
    "line": [
      "Nh2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1308",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1308",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/7K/8/3N4/8/rp6/kb6 w - - 0 1",
    "side": "w",
    "solution": "Nb3#",
    "line": [
      "Nb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1309",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1309",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "kr6/pp6/4N3/8/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7#",
    "line": [
      "Nc7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1310",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1310",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "4N3/rp6/kp6/pb6/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7#",
    "line": [
      "Nc7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1311",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1311",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "5bkn/5prp/8/5N2/8/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Nh6#",
    "line": [
      "Nh6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1312",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1312",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "2nkr3/2pbb3/8/6N1/8/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1313",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1313",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "4bkr1/4ppn1/5N2/8/8/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Nh7#",
    "line": [
      "Nh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1314",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1314",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "1nkr4/1ppp4/8/3N4/3K4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne7#",
    "line": [
      "Ne7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1315",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1315",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/1KN5/8/8/pp6/kn6 w - - 0 1",
    "side": "w",
    "solution": "Nb3#",
    "line": [
      "Nb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1316",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1316",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/6bn/5Nrk/6np/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Ng6#",
    "line": [
      "Ng6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1317",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1317",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/K5N1/8/8/3ppp2/3rkb2 w - - 0 1",
    "side": "w",
    "solution": "Nf3#",
    "line": [
      "Nf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1318",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1318",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/7N/6pp/6pk/4K1pp/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf5#",
    "line": [
      "Nf5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1319",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1319",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/6pn/5Npk/6pp/1K6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng8#",
    "line": [
      "Ng8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1320",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1320",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "2nkr2N/2bnp3/8/8/8/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1321",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1321",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/pp1N1K2/kr6/nr6/8 w - - 0 1",
    "side": "w",
    "solution": "Nb5#",
    "line": [
      "Nb5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1322",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1322",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "1K1N4/6pn/6pk/6pb/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1323",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1323",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "bkn2N2/pbp5/8/8/8/8/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Nd7#",
    "line": [
      "Nd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1324",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1324",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "6rb/6pk/4N1nn/8/8/6K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng5#",
    "line": [
      "Ng5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1325",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1325",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/3N4/8/6K1/rpb5/rkb5 w - - 0 1",
    "side": "w",
    "solution": "Nc3#",
    "line": [
      "Nc3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1326",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1326",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/3N4/8/8/1K2pnp1/4nkn1 w - - 0 1",
    "side": "w",
    "solution": "Ne3#",
    "line": [
      "Ne3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1327",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1327",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "nkr5/bbb5/8/4N3/8/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Nd7#",
    "line": [
      "Nd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1328",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1328",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/pp6/kp6/pr1N4/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7#",
    "line": [
      "Nc7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1329",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1329",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "1rkn4/1brn4/8/3N4/8/8/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Ne7#",
    "line": [
      "Ne7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1330",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1330",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "5bkn/5nnp/8/3N4/8/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6#",
    "line": [
      "Nf6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1331",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1331",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "bb6/kp2N3/br6/6K1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc8#",
    "line": [
      "Nc8#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1332",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1332",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "nkn5/rpb5/1N3K2/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7#",
    "line": [
      "Nd7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1333",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1333",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/5K2/8/8/4N3/bp6/kn6 w - - 0 1",
    "side": "w",
    "solution": "Nc2#",
    "line": [
      "Nc2#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1334",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1334",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "4rkr1/4rrn1/8/6N1/8/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nh7#",
    "line": [
      "Nh7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1335",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1335",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/1N4K1/8/rp6/kp6/rp6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc5#",
    "line": [
      "Nc5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1336",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1336",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "4K3/6pp/6pk/4N1pp/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7#",
    "line": [
      "Nf7#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1337",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Sıkışan Şah #1337",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/4K3/4N3/8/8/5nnp/5bkb w - - 0 1",
    "side": "w",
    "solution": "Nf3#",
    "line": [
      "Nf3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1338",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Kendi Taşları Engel #1338",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şahın çevresindeki bütün kareler kendi taşlarıyla dolu; hangi taş üzerinden atlayabilir?",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/8/8/8/8/5K2/np6/kbN5 w - - 0 1",
    "side": "w",
    "solution": "Nb3#",
    "line": [
      "Nb3#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1339",
    "level": "Orta",
    "theme": "bogmaca",
    "title": "Atın Zaferi #1339",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Şah kıpırdayamıyor — tek gereken doğru kareden şah çekmek.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "kb6/np6/8/3N4/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb6#",
    "line": [
      "Nb6#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1340",
    "level": "Zor",
    "theme": "bogmaca",
    "title": "Boğmaca Matı #1340",
    "goal": "Beyaz oynar ve atıyla mat eder.",
    "hint": "Yalnızca at, taşların üzerinden atlayarak şaha ulaşabilir.",
    "explanation": "Şah kendi taşlarıyla çevrili olduğu için hiçbir yere kaçamadı. Taşların üzerinden atlayan at mat etti — buna boğmaca matı denir.",
    "fen": "8/6rb/3N2nk/6pn/1K6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf5#",
    "line": [
      "Nf5#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1341",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1341",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "3k4/1P3K2/8/8/Q7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1342",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1342",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/5Pk1/8/3K4/8/3B4/5R1R/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1343",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1343",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/P7/k7/4Q3/8/4Q3/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "a8=Q#",
    "line": [
      "a8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1344",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1344",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/KPk5/4B3/8/B7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1345",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1345",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5k2/7P/4K3/8/2Q5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1346",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1346",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4Q3/1Pk5/8/8/8/8/2K1R3/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1347",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1347",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "N2Q4/5kP1/8/6K1/1B6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1348",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1348",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/3kP2K/6N1/4Q3/8/8/2B5/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1349",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1349",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4k1K1/2P5/8/2Q5/8/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1350",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1350",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "3k4/5P2/2Q5/8/8/5K2/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1351",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1351",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4k3/2P5/5Q2/8/3K4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1352",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1352",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "7k/5P2/4K3/8/8/8/2B5/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1353",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1353",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "R7/5Pk1/8/5B2/8/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1354",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1354",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4R3/2kP4/8/8/B3B3/8/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1355",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1355",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "6k1/4P3/7Q/8/8/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1356",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1356",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5Q2/N5Pk/8/1B6/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1357",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1357",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/BPk5/8/8/B7/3K4/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1358",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1358",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "2k5/P7/3K4/8/8/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "a8=Q#",
    "line": [
      "a8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1359",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1359",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/6Pk/4B3/2RR3K/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1360",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1360",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/2P3B1/2k5/4K3/8/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1361",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1361",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/1P5R/k7/8/1K1B4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=N#",
    "line": [
      "b8=N#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1362",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1362",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P5/8/8/3Q4/7K/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1363",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1363",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "1R4B1/3Pk3/8/8/8/8/8/6NK w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1364",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1364",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "1k6/3P4/K7/8/8/8/3Q4/8 w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1365",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1365",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/kP6/3Q4/5R2/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1366",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1366",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "6k1/4P3/7K/3R4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1367",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1367",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/4K2P/7k/R7/5N2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1368",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1368",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "6k1/4P3/2B4K/8/8/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1369",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1369",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/7P/7k/5Q2/8/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1370",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1370",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4Q3/1Pk5/8/4K3/8/8/8/2B5 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1371",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1371",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/P7/k7/8/1K6/8/8/1R4B1 w - - 0 1",
    "side": "w",
    "solution": "a8=Q#",
    "line": [
      "a8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1372",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1372",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "Q7/2kP3Q/8/8/4B3/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1373",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1373",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "R7/6Pk/8/4R1K1/8/4B3/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1374",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1374",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P5/3K4/2B5/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1375",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1375",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "3K4/2P5/N2k4/8/4Q3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=N#",
    "line": [
      "c8=N#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1376",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1376",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "7k/5P2/8/8/4B3/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1377",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1377",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5k2/3P4/8/8/8/1Q6/8/BK6 w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1378",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1378",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/kP6/8/1Q3BK1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1379",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1379",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/4P1K1/4k3/2Q5/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1380",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1380",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5R2/4P3/4k3/2K5/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1381",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1381",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "7k/5P2/1KB5/8/8/8/2B5/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1382",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1382",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P5/8/8/2KB4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1383",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1383",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "3k4/5P2/2Q5/8/8/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1384",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1384",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/3kPB2/8/K7/8/B5Q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1385",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1385",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "3k4/1P3K2/8/4N3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1386",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1386",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/7P/7k/8/7K/8/8/1B6 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1387",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1387",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "3Q4/Pk6/8/8/3K4/8/1B6/8 w - - 0 1",
    "side": "w",
    "solution": "a8=Q#",
    "line": [
      "a8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1388",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1388",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k4K2/2P5/8/8/3B4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1389",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1389",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5B2/2Pk4/8/1KR5/8/3B4/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1390",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1390",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/1k1P3Q/8/8/2QK4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1391",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1391",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "7R/1Pk3K1/4Q3/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1392",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1392",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/4Pk2/8/4Q3/8/1K6/R7/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1393",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1393",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "2Q5/1PB5/k7/8/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1394",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1394",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k5K1/2P5/1B6/8/2R5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1395",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1395",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/kP6/2R5/8/1RR5/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1396",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1396",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/6Pk/3R4/8/8/1B1K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1397",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1397",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/4Pk1K/2Q5/8/8/8/3NB3/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1398",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1398",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/1P6/1k6/8/1BQ5/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1399",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1399",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/4P3/3k1K1N/1Q6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=N#",
    "line": [
      "e8=N#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1400",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1400",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5R2/6Pk/8/6K1/8/8/5Q2/6R1 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1401",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Terfi ile Mat #1401",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "7k/5P2/8/4K3/4B3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1402",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1402",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P5/8/1N6/8/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1403",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1403",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/2P5/2k5/5Q2/3Q1K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1404",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1404",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/Pk3N2/3K4/Q7/8/3B4/8/8 w - - 0 1",
    "side": "w",
    "solution": "a8=Q#",
    "line": [
      "a8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1405",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1405",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/5B1P/7k/8/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1406",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1406",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "2k5/P7/3Q4/8/8/K7/3B4/8 w - - 0 1",
    "side": "w",
    "solution": "a8=Q#",
    "line": [
      "a8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1407",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1407",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P5/8/K7/8/8/5B1R/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1408",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1408",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "B2R4/4Pk2/8/8/3Q4/1K6/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1409",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1409",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P5/8/4K3/8/8/8/6B1 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1410",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1410",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/3kPQ2/8/8/8/B7/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1411",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1411",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P5/8/1N6/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1412",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Son Adım #1412",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5k2/3P4/7K/8/2Q5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1413",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1413",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4RN2/1Pk5/4Q3/8/1K6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1414",
    "level": "Kolay",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1414",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4R3/3P4/3k4/1K6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1415",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1415",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4k3/2P5/5K2/8/8/8/8/Q1N5 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1416",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1416",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/2QP4/4k3/1R4K1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "d8=N#",
    "line": [
      "d8=N#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1417",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1417",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "1K6/B4kPB/8/3N4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1418",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1418",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/5Pk1/Q7/8/1B6/3Q2K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1419",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1419",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/kP4K1/8/4Q3/4R3/3B4/8/8 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1420",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1420",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/1kP5/8/8/K7/8/Q7/2Q3B1 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1421",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1421",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "1K4k1/4P3/5B2/8/8/8/2B5/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1422",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1422",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/1Pk3N1/8/1Q6/8/8/3Q4/1K6 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1423",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1423",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/N3kPK1/8/5B2/8/8/8/7R w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1424",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1424",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "2K5/4kP2/N7/8/3N4/8/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1425",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1425",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/6kP/4B3/5K2/8/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1426",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1426",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "k7/2P1K3/8/8/8/7R/5Q2/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1427",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1427",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "B3k3/6P1/3K4/8/8/8/6N1/8 w - - 0 1",
    "side": "w",
    "solution": "g8=Q#",
    "line": [
      "g8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1428",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1428",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "5k2/7P/4K3/8/8/4R3/3N4/8 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1429",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1429",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "Q7/2kP4/8/8/N7/8/7N/7K w - - 0 1",
    "side": "w",
    "solution": "d8=Q#",
    "line": [
      "d8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1430",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1430",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/1kP1K3/8/Q1Q5/8/8/8/1B6 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1431",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1431",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/2P5/2k5/4K3/1Q6/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1432",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1432",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/5Pk1/N7/8/1B6/8/2Q2K2/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1433",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1433",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/2R2P1k/1K6/8/8/6R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1434",
    "level": "Orta",
    "theme": "terfi",
    "title": "Sekizinci Yatay #1434",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4R3/5P2/5k2/7Q/8/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1435",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1435",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "7k/5P2/8/3K1B2/8/8/4N3/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1436",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1436",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/2Pk4/6KN/2Q5/8/8/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "c8=Q#",
    "line": [
      "c8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1437",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1437",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/3kP3/8/1N5K/1B6/4R3/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1438",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1438",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/K2kP3/5R2/4Q3/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "e8=Q#",
    "line": [
      "e8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1439",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1439",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "1Q6/6kP/8/7B/8/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1440",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1440",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Piyon sekizinci yataya varınca istediğin taşa dönüşebilir.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "6BR/4kP2/2K4B/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1441",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1441",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Hangi taşa terfi edersen şah kaçamaz?",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/5P2/5k2/3B3Q/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "f8=Q#",
    "line": [
      "f8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1442",
    "level": "Orta",
    "theme": "terfi",
    "title": "Terfi ile Mat #1442",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/7P/7k/8/6K1/3BN3/8/8 w - - 0 1",
    "side": "w",
    "solution": "h8=Q#",
    "line": [
      "h8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1443",
    "level": "Orta",
    "theme": "terfi",
    "title": "Piyon Vezir Oluyor #1443",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "8/kP6/8/8/2B5/8/7Q/BK6 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1444",
    "level": "Orta",
    "theme": "terfi",
    "title": "Son Adım #1444",
    "goal": "Beyaz oynar, piyonunu terfi ettirerek mat eder.",
    "hint": "Son yataya bir adım kalan piyonu bul.",
    "explanation": "Piyon son yataya ulaşıp yeni bir taşa dönüştü ve aynı hamlede mat etti. Piyonlar küçüktür ama sonuna kadar giderse en güçlü taş olur.",
    "fen": "4Q3/1Pk5/8/6N1/5R2/8/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "b8=Q#",
    "line": [
      "b8=Q#"
    ],
    "mateIn": 1
  },
  {
    "id": "puzzle-1445",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1445",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/4k2r/8/K7/8/8/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc7+",
    "line": [
      "Rc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1446",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1446",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3K4/7R/8/8/2q1k3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh4+",
    "line": [
      "Rh4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1447",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1447",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/2R5/8/8/5kq1/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Rc4+",
    "line": [
      "Rc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1448",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1448",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5K2/8/8/8/5R2/1q1k4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf3+",
    "line": [
      "Rf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1449",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1449",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "4R3/8/8/5K2/8/8/6kq/8 w - - 0 1",
    "side": "w",
    "solution": "Re2+",
    "line": [
      "Re2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1450",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1450",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/1r2k3/8/8/8/7R/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Rh7+",
    "line": [
      "Rh7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1451",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1451",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/3k2r1/8/1R6/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rb6+",
    "line": [
      "Rb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1452",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1452",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/K7/8/8/4k2q/8/2R5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc4+",
    "line": [
      "Rc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1453",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1453",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/4K3/8/q7/k7/8/4R3/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2+",
    "line": [
      "Ra2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1454",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1454",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/q1k5/8/8/8/5R1K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf7+",
    "line": [
      "Rf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1455",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1455",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/7R/8/2k5/8/8/2r5/7K w - - 0 1",
    "side": "w",
    "solution": "Rc7+",
    "line": [
      "Rc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1456",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1456",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/4RK2/r2k4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re5+",
    "line": [
      "Re5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1457",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1457",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7K/2r2k2/8/8/8/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg7+",
    "line": [
      "Rg7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1458",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1458",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7K/8/8/q2k4/8/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg5+",
    "line": [
      "Rg5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1459",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1459",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/R7/8/2k5/7K/8/2r5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc7+",
    "line": [
      "Rc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1460",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1460",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/4q3/4k3/8/3K4/6R1 w - - 0 1",
    "side": "w",
    "solution": "Re1+",
    "line": [
      "Re1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1461",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1461",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3q4/K2k4/8/8/1R6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd4+",
    "line": [
      "Rd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1462",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1462",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3K4/8/7q/8/8/7k/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Rh1+",
    "line": [
      "Rh1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1463",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1463",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/K7/8/5kq1/8/8/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Rc5+",
    "line": [
      "Rc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1464",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1464",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "K7/8/8/1R6/8/8/3k2r1/8 w - - 0 1",
    "side": "w",
    "solution": "Rb2+",
    "line": [
      "Rb2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1465",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1465",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/6R1/8/k7/8/6K1/q7/8 w - - 0 1",
    "side": "w",
    "solution": "Ra7+",
    "line": [
      "Ra7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1466",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1466",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "R7/8/5k2/8/8/5q2/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8+",
    "line": [
      "Rf8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1467",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1467",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/q7/8/k2K4/8/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2+",
    "line": [
      "Ra2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1468",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1468",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/2q5/8/2k5/8/3R4/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rc3+",
    "line": [
      "Rc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1469",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1469",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2K5/8/1q6/8/1k6/8/8/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rb1+",
    "line": [
      "Rb1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1470",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1470",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/5R2/8/6K1/q1k5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf3+",
    "line": [
      "Rf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1471",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1471",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "1qk5/8/5R2/6K1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8+",
    "line": [
      "Rf8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1472",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1472",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/qk6/8/8/8/3R4/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rd6+",
    "line": [
      "Rd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1473",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1473",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/1K6/R7/8/6k1/6q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg6+",
    "line": [
      "Rg6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1474",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1474",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7R/8/K7/8/8/8/3q1k2/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2+",
    "line": [
      "Rh2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1475",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1475",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/7r/5K2/8/7k/8/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Rh2+",
    "line": [
      "Rh2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1476",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1476",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7R/8/8/3k4/6K1/8/3r4/8 w - - 0 1",
    "side": "w",
    "solution": "Rd8+",
    "line": [
      "Rd8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1477",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1477",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/5R2/8/8/8/6K1/8/q1k5 w - - 0 1",
    "side": "w",
    "solution": "Rf1+",
    "line": [
      "Rf1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1478",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1478",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/8/6R1/1r2k3/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Rg3+",
    "line": [
      "Rg3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1479",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1479",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/8/6kq/4K3/3R4/8 w - - 0 1",
    "side": "w",
    "solution": "Rd4+",
    "line": [
      "Rd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1480",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1480",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2K5/8/1r2k3/7R/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6+",
    "line": [
      "Rh6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1481",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1481",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/4k2r/8/2R5/8/5K2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc7+",
    "line": [
      "Rc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1482",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1482",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2q5/8/8/2k5/8/8/6R1/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rc2+",
    "line": [
      "Rc2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1483",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1483",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/5R2/2qk4/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Rf4+",
    "line": [
      "Rf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1484",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1484",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/5R2/1qk5/8/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rf5+",
    "line": [
      "Rf5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1485",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1485",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2K5/8/4k2q/8/8/8/1R6/8 w - - 0 1",
    "side": "w",
    "solution": "Rb6+",
    "line": [
      "Rb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1486",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1486",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/5K1R/8/8/6k1/8/8/6r1 w - - 0 1",
    "side": "w",
    "solution": "Rg7+",
    "line": [
      "Rg7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1487",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1487",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/R7/3K4/8/3k2r1/8 w - - 0 1",
    "side": "w",
    "solution": "Ra2+",
    "line": [
      "Ra2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1488",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1488",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/5R2/8/8/6K1/3qk3/8 w - - 0 1",
    "side": "w",
    "solution": "Rf2+",
    "line": [
      "Rf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1489",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1489",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "qk6/8/8/8/4R3/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Re8+",
    "line": [
      "Re8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1490",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1490",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2k3B1/8/q7/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Be8+",
    "line": [
      "Be8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1491",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1491",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/1R6/4K3/6k1/8/8/6q1 w - - 0 1",
    "side": "w",
    "solution": "Rg6+",
    "line": [
      "Rg6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1492",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1492",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2q1k3/8/8/6R1/8/5K2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8+",
    "line": [
      "Rg8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1493",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1493",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5r2/8/8/5k1K/8/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rf2+",
    "line": [
      "Rf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1494",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1494",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2R5/8/1k6/8/8/1q6/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8+",
    "line": [
      "Rb8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1495",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1495",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "r2k4/8/8/8/8/8/2K5/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg8+",
    "line": [
      "Rg8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1496",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1496",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3qk1K1/5R2/8/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8+",
    "line": [
      "Rf8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1497",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1497",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/3qk3/8/7R/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rh6+",
    "line": [
      "Rh6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1498",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1498",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2q5/8/2k5/8/3R4/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rc2+",
    "line": [
      "Rc2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1499",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1499",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "6R1/8/1K6/2rk4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg5+",
    "line": [
      "Rg5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1500",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1500",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2R2K2/8/3k4/3q4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd6+",
    "line": [
      "Rd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1501",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1501",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2K5/6kq/8/8/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rd5+",
    "line": [
      "Rd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1502",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1502",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/K3k2r/8/8/1R6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb7+",
    "line": [
      "Rb7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1503",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1503",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/8/8/2R5/K3k2q/8 w - - 0 1",
    "side": "w",
    "solution": "Rc2+",
    "line": [
      "Rc2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1504",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1504",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/2K5/8/2R5/8/4kq2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc3+",
    "line": [
      "Rc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1505",
    "level": "Kolay",
    "theme": "sis",
    "title": "Hat Üzerinde #1505",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2K5/5R2/8/8/1qk5/8 w - - 0 1",
    "side": "w",
    "solution": "Rf2+",
    "line": [
      "Rf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1506",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1506",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/1K1k2r1/2R5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc5+",
    "line": [
      "Rc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1507",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şişe Diz #1507",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/q1k5/5R2/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Rf5+",
    "line": [
      "Rf5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1508",
    "level": "Kolay",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1508",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2R5/4K3/6k1/8/8/6q1 w - - 0 1",
    "side": "w",
    "solution": "Rg6+",
    "line": [
      "Rg6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1509",
    "level": "Kolay",
    "theme": "sis",
    "title": "Şiş #1509",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7R/8/3k4/3q4/8/8/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Rd8+",
    "line": [
      "Rd8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1510",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1510",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/1r6/8/8/1k6/3K4/R7 w - - 0 1",
    "side": "w",
    "solution": "Rb1+",
    "line": [
      "Rb1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1511",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1511",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/4K3/5r2/5k2/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Rf1+",
    "line": [
      "Rf1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1512",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1512",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "q1k5/8/8/8/5R2/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf8+",
    "line": [
      "Rf8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1513",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1513",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "4k2r/8/8/K7/8/2R5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8+",
    "line": [
      "Rc8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1514",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1514",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3R4/8/8/2K5/8/8/qk6/8 w - - 0 1",
    "side": "w",
    "solution": "Rd2+",
    "line": [
      "Rd2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1515",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1515",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/4qk2/2K5/8/8/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6+",
    "line": [
      "Rh6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1516",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1516",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "6R1/8/7k/5K2/7q/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8+",
    "line": [
      "Rh8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1517",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1517",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/6R1/8/5k2/5q2/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Rf6+",
    "line": [
      "Rf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1518",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1518",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "4q3/4k3/8/8/R7/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re4+",
    "line": [
      "Re4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1519",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1519",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/5R2/8/r2k4/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Rf3+",
    "line": [
      "Rf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1520",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1520",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "6R1/8/2qk4/K7/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg6+",
    "line": [
      "Rg6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1521",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1521",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2qk4/8/6R1/8/1K6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8+",
    "line": [
      "Rg8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1522",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1522",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/1K6/7R/2k5/8/8/2r5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc6+",
    "line": [
      "Rc6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1523",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1523",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/4K3/8/8/R7/2k2r2 w - - 0 1",
    "side": "w",
    "solution": "Ra1+",
    "line": [
      "Ra1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1524",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1524",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "6K1/4R3/8/8/3k4/8/8/3r4 w - - 0 1",
    "side": "w",
    "solution": "Rd7+",
    "line": [
      "Rd7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1525",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1525",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/6kq/4K3/8/5R2/8 w - - 0 1",
    "side": "w",
    "solution": "Rf5+",
    "line": [
      "Rf5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1526",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1526",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/5R2/8/8/1k6/5K2/1q6 w - - 0 1",
    "side": "w",
    "solution": "Rb6+",
    "line": [
      "Rb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1527",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1527",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5K2/8/6R1/8/8/8/8/3qk3 w - - 0 1",
    "side": "w",
    "solution": "Rg1+",
    "line": [
      "Rg1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1528",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1528",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "2q5/2k5/8/5R2/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc5+",
    "line": [
      "Rc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1529",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1529",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/6R1/8/2k5/2r5/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Rc6+",
    "line": [
      "Rc6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1530",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1530",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/3k2q1/8/8/1R6/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rb6+",
    "line": [
      "Rb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1531",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1531",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2R5/8/2K5/4k3/8/4q3 w - - 0 1",
    "side": "w",
    "solution": "Re6+",
    "line": [
      "Re6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1532",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1532",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5K2/4R3/8/3k4/8/8/3r4/8 w - - 0 1",
    "side": "w",
    "solution": "Rd7+",
    "line": [
      "Rd7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1533",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1533",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2q1k3/8/1K6/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh6+",
    "line": [
      "Rh6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1534",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1534",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/8/1R6/4kq2/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Rb3+",
    "line": [
      "Rb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1535",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1535",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/R7/8/1K3k2/8/5q2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf7+",
    "line": [
      "Rf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1536",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1536",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/4K3/R7/8/3k2r1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra4+",
    "line": [
      "Ra4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1537",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1537",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/5r2/8/8/3K1k2/8/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rf1+",
    "line": [
      "Rf1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1538",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1538",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/2R5/8/8/4kq2/K7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc4+",
    "line": [
      "Rc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1539",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1539",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7q/8/7k/8/1R6/8/8/7K w - - 0 1",
    "side": "w",
    "solution": "Rh4+",
    "line": [
      "Rh4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1540",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1540",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/K2kq3/8/8/8/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rb6+",
    "line": [
      "Rb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1541",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1541",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/3R4/8/2k5/4K3/8/2r5/8 w - - 0 1",
    "side": "w",
    "solution": "Rc7+",
    "line": [
      "Rc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1542",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1542",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/r7/8/8/k6K/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Ra1+",
    "line": [
      "Ra1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1543",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1543",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/8/7q/1K5k/8/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rh1+",
    "line": [
      "Rh1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1544",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1544",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3qk3/8/6R1/7K/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8+",
    "line": [
      "Rg8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1545",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1545",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "1K1R4/8/7k/7q/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rh8+",
    "line": [
      "Rh8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1546",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1546",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/2q5/8/6K1/2k5/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rc1+",
    "line": [
      "Rc1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1547",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1547",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/R6K/8/8/2kq4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra4+",
    "line": [
      "Ra4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1548",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1548",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/1q6/1k4K1/8/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb3+",
    "line": [
      "Rb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1549",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1549",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7K/8/4q3/8/4k3/8/7R/8 w - - 0 1",
    "side": "w",
    "solution": "Re2+",
    "line": [
      "Re2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1550",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1550",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/7q/8/K6k/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rh1+",
    "line": [
      "Rh1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1551",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1551",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/5RK1/8/8/1qk5/8 w - - 0 1",
    "side": "w",
    "solution": "Rf2+",
    "line": [
      "Rf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1552",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1552",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/6K1/8/1q1k4/8/8/8/6R1 w - - 0 1",
    "side": "w",
    "solution": "Rg5+",
    "line": [
      "Rg5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1553",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1553",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "7K/8/6r1/8/8/6k1/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rg1+",
    "line": [
      "Rg1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1554",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1554",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/K7/8/3q4/8/3k4/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Rd1+",
    "line": [
      "Rd1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1555",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1555",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "1K6/8/3R4/8/4k3/8/4q3/8 w - - 0 1",
    "side": "w",
    "solution": "Re6+",
    "line": [
      "Re6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1556",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1556",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/1q1k4/8/8/5R2/6K1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf7+",
    "line": [
      "Rf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1557",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1557",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5K2/2r5/8/8/2k5/8/8/4R3 w - - 0 1",
    "side": "w",
    "solution": "Rc1+",
    "line": [
      "Rc1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1558",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1558",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2K5/4q3/4k3/8/6R1/8 w - - 0 1",
    "side": "w",
    "solution": "Re2+",
    "line": [
      "Re2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1559",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1559",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5R2/8/8/8/8/2qk4/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rf3+",
    "line": [
      "Rf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1560",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1560",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/5K2/6R1/8/8/8/8/1r2k3 w - - 0 1",
    "side": "w",
    "solution": "Rg1+",
    "line": [
      "Rg1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1561",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1561",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5K2/3r4/8/8/3k4/8/8/1R6 w - - 0 1",
    "side": "w",
    "solution": "Rd1+",
    "line": [
      "Rd1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1562",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1562",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/2r5/8/8/2k5/7K/7R w - - 0 1",
    "side": "w",
    "solution": "Rc1+",
    "line": [
      "Rc1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1563",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1563",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3k2q1/8/1R6/8/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rb8+",
    "line": [
      "Rb8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1564",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1564",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şaha şah çek; kaçmak zorunda kalınca arkasındaki taş açıkta kalır.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "4R2K/8/2k5/8/8/2r5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8+",
    "line": [
      "Rc8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1565",
    "level": "Orta",
    "theme": "sis",
    "title": "Hat Üzerinde #1565",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "1K6/8/8/2k2q2/8/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ra5+",
    "line": [
      "Ra5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1566",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1566",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "5K2/6R1/8/8/k7/8/8/r7 w - - 0 1",
    "side": "w",
    "solution": "Ra7+",
    "line": [
      "Ra7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1567",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1567",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/5R2/K7/8/2k5/8/2q5 w - - 0 1",
    "side": "w",
    "solution": "Rc6+",
    "line": [
      "Rc6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1568",
    "level": "Orta",
    "theme": "sis",
    "title": "Öndeki Kaçsın #1568",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/4K3/7R/8/8/8/8/2r2k2 w - - 0 1",
    "side": "w",
    "solution": "Rh1+",
    "line": [
      "Rh1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1569",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1569",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "1R6/8/8/4K1k1/8/8/6r1/8 w - - 0 1",
    "side": "w",
    "solution": "Rg8+",
    "line": [
      "Rg8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1570",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1570",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/8/8/5R2/8/6K1/1q2k3/8 w - - 0 1",
    "side": "w",
    "solution": "Rf2+",
    "line": [
      "Rf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1571",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1571",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "3r4/8/8/3k4/8/R7/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Rd3+",
    "line": [
      "Rd3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1572",
    "level": "Orta",
    "theme": "sis",
    "title": "Şiş #1572",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Açmazın tersini düşün: burada ÖNDEKİ taş daha değerli.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/5R2/8/7K/k7/8/8/q7 w - - 0 1",
    "side": "w",
    "solution": "Ra7+",
    "line": [
      "Ra7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1573",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1573",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "8/4R3/8/3k4/8/3q4/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Rd7+",
    "line": [
      "Rd7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1574",
    "level": "Orta",
    "theme": "sis",
    "title": "Şişe Diz #1574",
    "goal": "Beyaz oynar, şiş yaparak arkadaki taşı kazanır.",
    "hint": "Şah ile arkasındaki değerli taşı aynı hat üzerinde yakala.",
    "explanation": "Şah ile arkasındaki taşı aynı hatta yakaladık. Şah çekilince kaçmak zorunda kaldı ve arkadaki taş bize kaldı.",
    "fen": "6kq/8/8/8/8/K3R3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re8+",
    "line": [
      "Re8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1575",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1575",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "2N2BK1/8/8/8/5q2/6k1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bd6",
    "line": [
      "Bd6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1576",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1576",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/5k2/4q3/8/4B3/4N3/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Bd5",
    "line": [
      "Bd5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1577",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1577",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5k2/4q3/8/8/8/7K/1BN5/8 w - - 0 1",
    "side": "w",
    "solution": "Ba3",
    "line": [
      "Ba3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1578",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1578",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/7k/3N2q1/8/5K2/7B/8 w - - 0 1",
    "side": "w",
    "solution": "Bf4",
    "line": [
      "Bf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1579",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1579",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "2k5/3q4/K7/7B/8/4N3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bg4",
    "line": [
      "Bg4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1580",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1580",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "2B5/8/8/N5K1/8/5q2/6k1/8 w - - 0 1",
    "side": "w",
    "solution": "Bb7",
    "line": [
      "Bb7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1581",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1581",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/5N2/5B2/8/5q2/1K4k1/8 w - - 0 1",
    "side": "w",
    "solution": "Be4",
    "line": [
      "Be4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1582",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1582",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "kq3K2/2R1N3/8/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8",
    "line": [
      "Rc8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1583",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1583",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3k4/B1q5/8/8/N7/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Bb6",
    "line": [
      "Bb6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1584",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1584",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/6k1/1B3q2/8/2K5/8/2N5/8 w - - 0 1",
    "side": "w",
    "solution": "Bd4",
    "line": [
      "Bd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1585",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1585",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/7k/6q1/4K3/8/5B2/5N2 w - - 0 1",
    "side": "w",
    "solution": "Be3",
    "line": [
      "Be3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1586",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1586",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/2k5/2q5/1R6/8/3N4/7K w - - 0 1",
    "side": "w",
    "solution": "Rc4",
    "line": [
      "Rc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1587",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1587",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/B5k1/5q2/8/K7/5N2 w - - 0 1",
    "side": "w",
    "solution": "Bd2",
    "line": [
      "Bd2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1588",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1588",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/6K1/k7/1q6/8/8/6BN/8 w - - 0 1",
    "side": "w",
    "solution": "Bf1",
    "line": [
      "Bf1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1589",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1589",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1K6/8/8/8/8/3q1BN1/2k5/8 w - - 0 1",
    "side": "w",
    "solution": "Be4",
    "line": [
      "Be4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1590",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1590",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/5K2/8/8/8/2q2N2/1k3B2 w - - 0 1",
    "side": "w",
    "solution": "Bd3",
    "line": [
      "Bd3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1591",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1591",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/K3k3/3q4/8/N2B4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc4",
    "line": [
      "Bc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1592",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1592",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/1q2N3/k7/5BK1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc8",
    "line": [
      "Bc8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1593",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1593",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/3N2B1/8/6q1/1K5k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bf5",
    "line": [
      "Bf5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1594",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1594",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/k4K2/1q1B4/8/8/1N6/8 w - - 0 1",
    "side": "w",
    "solution": "Bc4",
    "line": [
      "Bc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1595",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1595",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/3k3K/4q2N/8/8/8/8/1B6 w - - 0 1",
    "side": "w",
    "solution": "Bf5",
    "line": [
      "Bf5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1596",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1596",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5N2/5B2/8/3K4/8/8/2q5/1k6 w - - 0 1",
    "side": "w",
    "solution": "Bg6",
    "line": [
      "Bg6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1597",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1597",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1K6/N7/8/4R3/8/8/1q6/1k6 w - - 0 1",
    "side": "w",
    "solution": "Rb5",
    "line": [
      "Rb5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1598",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1598",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2N5/8/3B1q2/6k1/8/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Be6",
    "line": [
      "Be6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1599",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1599",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "4B1K1/8/8/8/4q2N/3k4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bg6",
    "line": [
      "Bg6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1600",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1600",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/6k1/5q2/8/2N5/8/3K4/2B5 w - - 0 1",
    "side": "w",
    "solution": "Bb2",
    "line": [
      "Bb2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1601",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1601",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/B7/8/1N6/8/6K1/1q6/k7 w - - 0 1",
    "side": "w",
    "solution": "Bd4",
    "line": [
      "Bd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1602",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1602",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "k7/1q1B4/8/8/1N6/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc6",
    "line": [
      "Bc6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1603",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1603",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5N1K/8/2B5/8/6q1/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bd7",
    "line": [
      "Bd7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1604",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1604",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "7K/8/6qk/8/3RN3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd6",
    "line": [
      "Rd6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1605",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1605",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/3K1N2/8/8/8/B5q1/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Bd6",
    "line": [
      "Bd6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1606",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1606",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2K5/8/8/B7/5k2/1N2q3/8 w - - 0 1",
    "side": "w",
    "solution": "Bd1",
    "line": [
      "Bd1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1607",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1607",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5N2/4K3/1R6/8/8/4q3/4k3/8 w - - 0 1",
    "side": "w",
    "solution": "Re6",
    "line": [
      "Re6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1608",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1608",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/3NB3/8/8/8/7K/5q2/6k1 w - - 0 1",
    "side": "w",
    "solution": "Bc5",
    "line": [
      "Bc5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1609",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1609",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "6K1/8/8/5k2/1N2q3/8/8/3B4 w - - 0 1",
    "side": "w",
    "solution": "Bc2",
    "line": [
      "Bc2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1610",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1610",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "k7/1q6/8/8/2BK4/2N5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bd5",
    "line": [
      "Bd5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1611",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1611",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/2N3K1/8/8/2q3B1/1k6/8 w - - 0 1",
    "side": "w",
    "solution": "Be5",
    "line": [
      "Be5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1612",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1612",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3B2N1/8/3q4/2k5/8/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Be7",
    "line": [
      "Be7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1613",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1613",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2K5/8/8/8/7N/3q3B/2k5 w - - 0 1",
    "side": "w",
    "solution": "Bf4",
    "line": [
      "Bf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1614",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1614",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/8/4q2N/3k3B/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Bf5",
    "line": [
      "Bf5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1615",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1615",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/4k3/5q1B/8/8/5N2/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Bg5",
    "line": [
      "Bg5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1616",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1616",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "2K5/8/8/8/2k5/3q4/6BN/8 w - - 0 1",
    "side": "w",
    "solution": "Bf1",
    "line": [
      "Bf1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1617",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1617",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3N2B1/8/3K4/5q2/6k1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Be6",
    "line": [
      "Be6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1618",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1618",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/1N6/8/8/1q1B4/k7/2K5 w - - 0 1",
    "side": "w",
    "solution": "Bc4",
    "line": [
      "Bc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1619",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1619",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/1B5k/6q1/K7/8/2N5/8 w - - 0 1",
    "side": "w",
    "solution": "Be3",
    "line": [
      "Be3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1620",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1620",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/5k2/6q1/8/6B1/1K4N1/8 w - - 0 1",
    "side": "w",
    "solution": "Bh4",
    "line": [
      "Bh4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1621",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1621",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5k2/6q1/4K3/8/6N1/4B3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bh6",
    "line": [
      "Bh6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1622",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1622",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "k7/1q3B2/5N2/8/8/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Bd5",
    "line": [
      "Bd5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1623",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1623",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/K7/5k2/1N2q3/8/8/5B2/8 w - - 0 1",
    "side": "w",
    "solution": "Bd4",
    "line": [
      "Bd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1624",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1624",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/k7/1q6/5N2/8/8/8/2BK4 w - - 0 1",
    "side": "w",
    "solution": "Be3",
    "line": [
      "Be3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1625",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1625",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/B3K3/8/8/7k/3N2q1/8 w - - 0 1",
    "side": "w",
    "solution": "Bf1",
    "line": [
      "Bf1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1626",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1626",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/4K3/1k6/1q6/R7/8/2N5/8 w - - 0 1",
    "side": "w",
    "solution": "Rb4",
    "line": [
      "Rb4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1627",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1627",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5k2/4q3/N7/8/8/8/2K2B2/8 w - - 0 1",
    "side": "w",
    "solution": "Bc5",
    "line": [
      "Bc5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1628",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1628",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "2K5/8/6N1/8/8/6q1/3B3k/8 w - - 0 1",
    "side": "w",
    "solution": "Bf4",
    "line": [
      "Bf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1629",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1629",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2k5/2q5/8/5R2/4N3/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Rc4",
    "line": [
      "Rc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1630",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1630",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/2N1K3/8/8/B1q5/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Bb4",
    "line": [
      "Bb4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1631",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1631",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/4K3/8/8/1B6/6k1/2N2q2/8 w - - 0 1",
    "side": "w",
    "solution": "Be1",
    "line": [
      "Be1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1632",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1632",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/7B/7N/3q4/2k5/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Bg8",
    "line": [
      "Bg8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1633",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1633",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/k7/1q6/6K1/8/8/2N5/2B5 w - - 0 1",
    "side": "w",
    "solution": "Be3",
    "line": [
      "Be3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1634",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1634",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1K6/NB6/8/5q2/6k1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc8",
    "line": [
      "Bc8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1635",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1635",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/1k6/2q5/6N1/5K2/8/8/1B6 w - - 0 1",
    "side": "w",
    "solution": "Be4",
    "line": [
      "Be4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1636",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1636",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/K4qk1/4R3/3N4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Re6",
    "line": [
      "Re6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1637",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1637",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/3B3k/3N2q1/8/8/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Bf5",
    "line": [
      "Bf5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1638",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1638",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/4k3/5q2/8/K4B2/5N2/8 w - - 0 1",
    "side": "w",
    "solution": "Bg4",
    "line": [
      "Bg4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1639",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1639",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "k7/1q6/8/8/1N6/8/B3K3/8 w - - 0 1",
    "side": "w",
    "solution": "Bd5",
    "line": [
      "Bd5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1640",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1640",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "4B2N/8/8/4K3/8/3q4/2k5/8 w - - 0 1",
    "side": "w",
    "solution": "Bg6",
    "line": [
      "Bg6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1641",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1641",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "6K1/k7/1q6/8/8/7N/8/4B3 w - - 0 1",
    "side": "w",
    "solution": "Bf2",
    "line": [
      "Bf2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1642",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1642",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/3q1BN1/2k5/8/K7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Be8",
    "line": [
      "Be8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1643",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1643",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/4K3/8/6B1/6N1/8/1q6/k7 w - - 0 1",
    "side": "w",
    "solution": "Bf6",
    "line": [
      "Bf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1644",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1644",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/k2KB3/1q6/8/4N3/8 w - - 0 1",
    "side": "w",
    "solution": "Bc3",
    "line": [
      "Bc3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1645",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1645",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/8/8/4B3/1q2N2K/k7 w - - 0 1",
    "side": "w",
    "solution": "Bd4",
    "line": [
      "Bd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1646",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1646",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/1k5K/2q5/5B2/8/8/3N4/8 w - - 0 1",
    "side": "w",
    "solution": "Be4",
    "line": [
      "Be4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1647",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1647",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5K2/8/8/1N6/8/1R6/2q5/2k5 w - - 0 1",
    "side": "w",
    "solution": "Rc3",
    "line": [
      "Rc3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1648",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1648",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5k1K/2B1q3/8/1N6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bd6",
    "line": [
      "Bd6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1649",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1649",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3K4/8/8/1N6/1R6/8/3q4/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rd4",
    "line": [
      "Rd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1650",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1650",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/7K/7B/k7/1q6/5N2/8 w - - 0 1",
    "side": "w",
    "solution": "Bd1",
    "line": [
      "Bd1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1651",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1651",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/B7/N2q4/4k3/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bb7",
    "line": [
      "Bb7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1652",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1652",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "7N/8/8/7B/4q3/3k4/8/1K6 w - - 0 1",
    "side": "w",
    "solution": "Bg6",
    "line": [
      "Bg6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1653",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1653",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "kq4K1/8/4N3/3R4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rd8",
    "line": [
      "Rd8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1654",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1654",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2NB1q2/6k1/8/8/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Be8",
    "line": [
      "Be8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1655",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1655",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "7K/8/8/5k2/2B1q3/8/8/4N3 w - - 0 1",
    "side": "w",
    "solution": "Bd3",
    "line": [
      "Bd3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1656",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1656",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "2K3N1/6B1/8/6q1/7k/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bf6",
    "line": [
      "Bf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1657",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1657",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/KNB1q3/5k2/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bd8",
    "line": [
      "Bd8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1658",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1658",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "7K/8/8/8/7N/3q3B/2k5/8 w - - 0 1",
    "side": "w",
    "solution": "Bf5",
    "line": [
      "Bf5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1659",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1659",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/6B1/8/1K6/6N1/8/3q4/2k5 w - - 0 1",
    "side": "w",
    "solution": "Bh6",
    "line": [
      "Bh6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1660",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Açmaz #1660",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/3K4/1k6/2q5/8/7N/7B/8 w - - 0 1",
    "side": "w",
    "solution": "Bg1",
    "line": [
      "Bg1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1661",
    "level": "Orta",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1661",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/k7/1q2N3/8/1B6/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Bc5",
    "line": [
      "Bc5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1662",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1662",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/K7/4qk2/8/RN6/8 w - - 0 1",
    "side": "w",
    "solution": "Ra4",
    "line": [
      "Ra4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1663",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1663",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "7k/6q1/8/B7/N7/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc3",
    "line": [
      "Bc3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1664",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1664",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "7k/6q1/8/2BK4/8/8/2N5/8 w - - 0 1",
    "side": "w",
    "solution": "Bd4",
    "line": [
      "Bd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1665",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1665",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5K2/8/2N5/8/8/2q5/1k6/6B1 w - - 0 1",
    "side": "w",
    "solution": "Bd4",
    "line": [
      "Bd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1666",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1666",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/1q1BN3/k7/7K/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc8",
    "line": [
      "Bc8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1667",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1667",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/1K6/3k4/4q3/8/4B2N w - - 0 1",
    "side": "w",
    "solution": "Bf2",
    "line": [
      "Bf2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1668",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1668",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1k6/2q5/8/8/4N3/3K4/8/4B3 w - - 0 1",
    "side": "w",
    "solution": "Bg3",
    "line": [
      "Bg3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1669",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1669",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1K3N2/8/8/5q2/6k1/8/B7/8 w - - 0 1",
    "side": "w",
    "solution": "Be6",
    "line": [
      "Be6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1670",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1670",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/5k1K/5q2/8/7R/7N/8 w - - 0 1",
    "side": "w",
    "solution": "Rf3",
    "line": [
      "Rf3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1671",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1671",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1K3R2/8/1kq5/8/4N3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf6",
    "line": [
      "Rf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1672",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1672",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2K5/B3k3/3q4/8/8/1N6/8 w - - 0 1",
    "side": "w",
    "solution": "Bc4",
    "line": [
      "Bc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1673",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1673",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1k6/2q5/K7/5N2/7B/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bg3",
    "line": [
      "Bg3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1674",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1674",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5N2/5B2/8/5q2/1K2k3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bg6",
    "line": [
      "Bg6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1675",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1675",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2k3K1/1q6/8/8/1N6/8/4B3 w - - 0 1",
    "side": "w",
    "solution": "Ba5",
    "line": [
      "Ba5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1676",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1676",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "k7/1q5B/5K2/8/8/6N1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Be4",
    "line": [
      "Be4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1677",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1677",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1NR2K2/8/4qk2/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc6",
    "line": [
      "Rc6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1678",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1678",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/4K2k/6q1/8/8/6NB/8 w - - 0 1",
    "side": "w",
    "solution": "Bf4",
    "line": [
      "Bf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1679",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1679",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3k4/4q3/8/8/K7/6B1/6N1/8 w - - 0 1",
    "side": "w",
    "solution": "Bh4",
    "line": [
      "Bh4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1680",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1680",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1k6/2q5/8/8/2N5/8/8/B1K5 w - - 0 1",
    "side": "w",
    "solution": "Be5",
    "line": [
      "Be5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1681",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1681",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "K5B1/8/8/8/1N2q3/5k2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bd5",
    "line": [
      "Bd5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1682",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1682",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5K2/8/7k/6q1/8/8/1B2N3/8 w - - 0 1",
    "side": "w",
    "solution": "Bc1",
    "line": [
      "Bc1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1683",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1683",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "5B2/1N6/8/8/8/4q3/5k1K/8 w - - 0 1",
    "side": "w",
    "solution": "Bc5",
    "line": [
      "Bc5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1684",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1684",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/2R5/6N1/8/4q3/2K1k3/8 w - - 0 1",
    "side": "w",
    "solution": "Re6",
    "line": [
      "Re6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1685",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1685",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/1k6/2q2N2/8/8/1B5K w - - 0 1",
    "side": "w",
    "solution": "Bd3",
    "line": [
      "Bd3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1686",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1686",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3K4/3N4/8/8/5B2/2q5/1k6/8 w - - 0 1",
    "side": "w",
    "solution": "Be5",
    "line": [
      "Be5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1687",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1687",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "4N3/8/7R/5q2/5k1K/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rf6",
    "line": [
      "Rf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1688",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1688",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/1k6/2q5/8/8/4N3/B4K2/8 w - - 0 1",
    "side": "w",
    "solution": "Bd5",
    "line": [
      "Bd5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1689",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1689",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3K4/8/8/k7/1q6/5N2/8/2B5 w - - 0 1",
    "side": "w",
    "solution": "Bd2",
    "line": [
      "Bd2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1690",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1690",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "k7/1q6/6K1/4N3/8/8/4B3/8 w - - 0 1",
    "side": "w",
    "solution": "Bf3",
    "line": [
      "Bf3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1691",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1691",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/3k3K/2q5/8/8/2NB4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bb5",
    "line": [
      "Bb5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1692",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1692",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3K4/8/3k4/3q4/8/8/1N6/4R3 w - - 0 1",
    "side": "w",
    "solution": "Rd1",
    "line": [
      "Rd1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1693",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1693",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "7k/4B1q1/8/8/4N3/4K3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bf6",
    "line": [
      "Bf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1694",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1694",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "1K6/8/8/3k4/4q3/8/4B3/6N1 w - - 0 1",
    "side": "w",
    "solution": "Bf3",
    "line": [
      "Bf3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1695",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1695",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/5R2/4N3/8/6q1/6k1/8/5K2 w - - 0 1",
    "side": "w",
    "solution": "Rg7",
    "line": [
      "Rg7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1696",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1696",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/8/8/1K6/5N2/1kq5/3R4 w - - 0 1",
    "side": "w",
    "solution": "Rd2",
    "line": [
      "Rd2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1697",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1697",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "6k1/5q2/8/1KN5/6B1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Be6",
    "line": [
      "Be6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1698",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1698",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "N7/8/8/B1q5/3k4/8/8/K7 w - - 0 1",
    "side": "w",
    "solution": "Bb6",
    "line": [
      "Bb6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1699",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1699",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/2k5/3q4/7N/8/1K6/8/2B5 w - - 0 1",
    "side": "w",
    "solution": "Bf4",
    "line": [
      "Bf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1700",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Mıhlanmış Vezir #1700",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/8/6K1/8/8/5R2/3kq3/7N w - - 0 1",
    "side": "w",
    "solution": "Rf2",
    "line": [
      "Rf2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1701",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Açmaz #1701",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Ucuz bir taşla pahalı bir taşı mıhlamak en kârlı taktiktir.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "3R4/N7/8/8/2q5/K1k5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rc8",
    "line": [
      "Rc8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1702",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1702",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "K7/8/8/8/8/4k3/NB1q4/8 w - - 0 1",
    "side": "w",
    "solution": "Bc1",
    "line": [
      "Bc1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1703",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Kıpırdayamaz #1703",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir ile şah aynı hatta duruyor; o hattın arkasına geç.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "K7/8/1k6/1q6/8/R7/3N4/8 w - - 0 1",
    "side": "w",
    "solution": "Rb3",
    "line": [
      "Rb3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1704",
    "level": "Zor",
    "theme": "acmaz",
    "title": "Hatta Kilitle #1704",
    "goal": "Beyaz oynar, siyah veziri açmaza alarak kazanır.",
    "hint": "Vezir kaçarsa şah açıkta kalır — yani kaçamaz.",
    "explanation": "Vezir, şahının önünde mıhlandı. Kaçarsa şah tehdit altında kalacağı için kıpırdayamıyor ve düşüyor.",
    "fen": "8/k7/1q6/5K2/8/B2N4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bc5",
    "line": [
      "Bc5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1705",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1705",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/3k4/4N1b1/5B2/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1706",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1706",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/2RN3k/8/6K1/8/8/1r6/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1707",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1707",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "2K5/8/B7/8/8/3N3r/4k3/8 w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1708",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1708",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/K4n2/8/1k3NR1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd4+",
    "line": [
      "Nd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1709",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1709",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/7K/8/1b6/8/RN3k2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd4+",
    "line": [
      "Nd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1710",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1710",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "6r1/8/8/2K4k/6N1/5B2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1711",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1711",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "7K/8/2b5/1B6/2N5/3k4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne5+",
    "line": [
      "Ne5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1712",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1712",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/3K4/8/2R1N1k1/8/5b2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxf3+",
    "line": [
      "Nxf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1713",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1713",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/3R4/8/3N4/1r6/3k3K w - - 0 1",
    "side": "w",
    "solution": "Nxb2+",
    "line": [
      "Nxb2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1714",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1714",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/6r1/8/8/8/3RN1k1/1K6 w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1715",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1715",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/1R6/3K4/1N6/8/1k3n2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd4+",
    "line": [
      "Nd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1716",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1716",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/2B5/6n1/4N3/5k2/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Nxg5+",
    "line": [
      "Nxg5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1717",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1717",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/4n3/8/8/8/2K1k1NR w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1718",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1718",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/4K3/8/2R5/1b6/2N5/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Na2+",
    "line": [
      "Na2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1719",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1719",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/2RN3k/8/5K2/8/8/7b/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1720",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1720",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "7k/8/7N/6b1/K7/7R/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1721",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1721",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/4R3/4N3/8/b3k3/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Nc4+",
    "line": [
      "Nc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1722",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1722",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "4n3/8/R2N1k2/8/8/8/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Nxe8+",
    "line": [
      "Nxe8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1723",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1723",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/2R1N1k1/8/7K/8/6r1/8 w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1724",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1724",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/2r5/8/7K/1k3NR1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1725",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1725",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/2K5/2R5/2N5/8/2k3r1 w - - 0 1",
    "side": "w",
    "solution": "Ne2+",
    "line": [
      "Ne2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1726",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1726",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "5K2/8/8/5R2/5N2/8/5k2/2r5 w - - 0 1",
    "side": "w",
    "solution": "Nd3+",
    "line": [
      "Nd3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1727",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1727",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/K7/8/8/4b3/1k1N2R1 w - - 0 1",
    "side": "w",
    "solution": "Nc3+",
    "line": [
      "Nc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1728",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1728",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/2K5/3R4/8/3N4/5r2/3k4 w - - 0 1",
    "side": "w",
    "solution": "Nxf2+",
    "line": [
      "Nxf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1729",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1729",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/3b4/2R5/1K6/2N5/8/2k5 w - - 0 1",
    "side": "w",
    "solution": "Ne2+",
    "line": [
      "Ne2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1730",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1730",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "k1N2R2/8/2K5/5n2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb6+",
    "line": [
      "Nb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1731",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1731",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "3r4/8/8/8/3k1N1R/8/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Ne6+",
    "line": [
      "Ne6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1732",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1732",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "3K4/6b1/3k1N1R/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne8+",
    "line": [
      "Ne8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1733",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1733",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "1k3b2/8/1N6/8/1R6/8/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Nd7+",
    "line": [
      "Nd7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1734",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1734",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "K5k1/8/8/8/4n1N1/6R1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1735",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1735",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/1b3K2/8/k1NR4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxb6+",
    "line": [
      "Nxb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1736",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1736",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "2k1N1R1/8/8/1n3K2/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd6+",
    "line": [
      "Nd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1737",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1737",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/8/1RN1k3/8/K2b4/8 w - - 0 1",
    "side": "w",
    "solution": "Nxd2+",
    "line": [
      "Nxd2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1738",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1738",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "5B2/8/K2N4/2k5/8/8/3b4/8 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1739",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1739",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/8/3n3k/8/3K3N/7R w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1740",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1740",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/5k2/4N2K/8/2B5/3b4 w - - 0 1",
    "side": "w",
    "solution": "Ng3+",
    "line": [
      "Ng3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1741",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1741",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/1b6/8/8/3K4/1k1NR3 w - - 0 1",
    "side": "w",
    "solution": "Nc3+",
    "line": [
      "Nc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1742",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1742",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/8/3k4/r1N5/8/B5K1 w - - 0 1",
    "side": "w",
    "solution": "Nb5+",
    "line": [
      "Nb5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1743",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1743",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "7k/8/6KN/8/7R/8/3b4/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1744",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1744",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "1K6/2RN3k/5r2/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxf6+",
    "line": [
      "Nxf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1745",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1745",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/3R4/3N1n2/8/8/8/3k4/5K2 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1746",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1746",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "2K5/8/8/7r/8/8/8/2R2N1k w - - 0 1",
    "side": "w",
    "solution": "Ng3+",
    "line": [
      "Ng3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1747",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1747",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "k7/8/2K5/8/N3r3/R7/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nb6+",
    "line": [
      "Nb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1748",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1748",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/2b5/5k2/8/5N2/5R2/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1749",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1749",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/4K3/6b1/8/8/R2N1k2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne5+",
    "line": [
      "Ne5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1750",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1750",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/6R1/K7/8/6N1/8/2r3k1/8 w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1751",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1751",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/5K2/8/2RN3k/8/7r w - - 0 1",
    "side": "w",
    "solution": "Nf2+",
    "line": [
      "Nf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1752",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1752",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/5r2/8/8/2K5/k1NR4 w - - 0 1",
    "side": "w",
    "solution": "Nb3+",
    "line": [
      "Nb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1753",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1753",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/6n1/8/2k3NR/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1754",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1754",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "5K2/R7/8/N7/8/k3n3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc4+",
    "line": [
      "Nc4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1755",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1755",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/8/1K2k1NR/8/8/3b4 w - - 0 1",
    "side": "w",
    "solution": "Nf2+",
    "line": [
      "Nf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1756",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1756",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "2K5/8/6B1/1b3N2/4k3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd6+",
    "line": [
      "Nd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1757",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1757",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "k1N1R3/8/2K5/8/8/8/8/b7 w - - 0 1",
    "side": "w",
    "solution": "Nb6+",
    "line": [
      "Nb6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1758",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1758",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "4k3/6n1/4N3/8/8/4R3/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Nxg7+",
    "line": [
      "Nxg7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1759",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1759",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/K1k3r1/8/2N5/8/8/2R5 w - - 0 1",
    "side": "w",
    "solution": "Ne5+",
    "line": [
      "Ne5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1760",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1760",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/5b2/K7/8/8/R2N1k2 w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1761",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1761",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/R1N1k3/1n6/8/8/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1762",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1762",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "1R6/2n5/1N6/8/1k6/8/8/3K4 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1763",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1763",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "3R1N1k/4n3/8/1K6/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ng6+",
    "line": [
      "Ng6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1764",
    "level": "Orta",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1764",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/6K1/R7/N7/8/k3r3/8 w - - 0 1",
    "side": "w",
    "solution": "Nc3+",
    "line": [
      "Nc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1765",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1765",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/7K/4n3/7k/8/7N/8/7R w - - 0 1",
    "side": "w",
    "solution": "Nf4+",
    "line": [
      "Nf4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1766",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1766",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/1k1N2R1/3K4/8/b7/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc5+",
    "line": [
      "Nc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1767",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1767",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "1k1K4/4r3/8/8/1N6/1R6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nc6+",
    "line": [
      "Nc6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1768",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1768",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/7K/3n4/2R1N1k1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1769",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1769",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/2b5/1R1N1k2/8/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Ne6+",
    "line": [
      "Ne6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1770",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1770",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/7K/8/2R1N1k1/8/8/8/6r1 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1771",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1771",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "3k3r/8/3N4/8/8/3R4/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1772",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1772",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/7K/8/2k5/3N4/1b2B3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxb3+",
    "line": [
      "Nxb3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1773",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1773",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "3R4/3N4/8/3k4/6r1/8/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Nf6+",
    "line": [
      "Nf6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1774",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1774",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "5r2/8/8/8/2RN1k2/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Ne6+",
    "line": [
      "Ne6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1775",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1775",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/6r1/3k4/7K/3N4/3R4 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1776",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1776",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/7K/3k1NR1/8/8/2n5/8 w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1777",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1777",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/1n2K3/8/8/8/1k1NR3 w - - 0 1",
    "side": "w",
    "solution": "Nc3+",
    "line": [
      "Nc3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1778",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1778",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/RN3k2/8/8/4r3/6K1/8 w - - 0 1",
    "side": "w",
    "solution": "Nd5+",
    "line": [
      "Nd5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1779",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1779",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/1r6/4k3/8/4N3/8/K7/4R3 w - - 0 1",
    "side": "w",
    "solution": "Nc5+",
    "line": [
      "Nc5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1780",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1780",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "3r4/8/8/4k1NR/8/8/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Nf7+",
    "line": [
      "Nf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1781",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1781",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/8/4K3/k3NR2/2n5/8 w - - 0 1",
    "side": "w",
    "solution": "Nxc2+",
    "line": [
      "Nxc2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1782",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1782",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/8/1K6/5b2/2RN3k/8 w - - 0 1",
    "side": "w",
    "solution": "Nxf3+",
    "line": [
      "Nxf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1783",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1783",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/5B2/6N1/3b3k/8/6K1 w - - 0 1",
    "side": "w",
    "solution": "Nf2+",
    "line": [
      "Nf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1784",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1784",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/4B3/n7/2NK4/1k6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxa5+",
    "line": [
      "Nxa5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1785",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1785",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "K7/8/8/5b2/8/8/8/1R1N1k2 w - - 0 1",
    "side": "w",
    "solution": "Ne3+",
    "line": [
      "Ne3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1786",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1786",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/2k5/3N1r2/2K5/5B2/8 w - - 0 1",
    "side": "w",
    "solution": "Ne6+",
    "line": [
      "Ne6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1787",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1787",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "5R2/5N2/8/1b3k2/8/8/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Nd6+",
    "line": [
      "Nd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1788",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1788",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "K7/8/8/8/k1N1R3/8/1r6/8 w - - 0 1",
    "side": "w",
    "solution": "Nxb2+",
    "line": [
      "Nxb2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1789",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1789",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "2K5/8/4k3/1n3N2/6B1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd4+",
    "line": [
      "Nd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1790",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1790",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/R2N1k2/2n5/8/8/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Ne4+",
    "line": [
      "Ne4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1791",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Açarak Şah #1791",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "4b3/2K5/B7/1N6/2k5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nd6+",
    "line": [
      "Nd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1792",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Kaçmaktan Başka Çare Yok #1792",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Bir taşı oynatınca arkasındaki taşın yolu açılıyor mu?",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/7B/6N1/5k2/7n/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Nxh3+",
    "line": [
      "Nxh3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1793",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "İki Taş Birden #1793",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Çifte şahta şah MUTLAKA oynamak zorundadır.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "6B1/8/r3N3/3k4/8/8/1K6/8 w - - 0 1",
    "side": "w",
    "solution": "Nc7+",
    "line": [
      "Nc7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1794",
    "level": "Zor",
    "theme": "cifte-sah",
    "title": "Çifte Şah #1794",
    "goal": "Beyaz oynar ve çifte şah çeker.",
    "hint": "Aynı anda iki taş şah çekerse araya taş koymak işe yaramaz.",
    "explanation": "İki taş aynı anda şah çekti. Çifte şahta araya taş konamaz ve saldıran alınamaz — şah kaçmak zorundadır.",
    "fen": "8/8/8/6b1/8/8/1K6/2R1N1k1 w - - 0 1",
    "side": "w",
    "solution": "Nf3+",
    "line": [
      "Nf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1795",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1795",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "7q/8/6K1/1k2B3/8/8/8/2p5 w - - 0 1",
    "side": "w",
    "solution": "Bxh8",
    "line": [
      "Bxh8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1796",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1796",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4k3/2n5/8/8/K7/2B5/1r6/5b2 w - - 0 1",
    "side": "w",
    "solution": "Bxb2",
    "line": [
      "Bxb2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1797",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1797",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/k7/8/3r4/4K3/1n3B2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Kxd5",
    "line": [
      "Kxd5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1798",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1798",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/k4K2/2B3n1/1r6/1p6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxb5",
    "line": [
      "Bxb5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1799",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1799",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "3BK1p1/2p5/5r2/8/1k6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxf6",
    "line": [
      "Bxf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1800",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1800",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2k5/b6K/6B1/8/4b3/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxe4",
    "line": [
      "Bxe4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1801",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1801",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/8/5K2/8/3k1N2/7q w - - 0 1",
    "side": "w",
    "solution": "Nxh1",
    "line": [
      "Nxh1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1802",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1802",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/8/6n1/6Q1/2K1k3/8 w - - 0 1",
    "side": "w",
    "solution": "Qxg4+",
    "line": [
      "Qxg4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1803",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1803",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/4r3/6k1/4Q3/7K/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxe6",
    "line": [
      "Qxe6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1804",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1804",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "1K6/8/8/q7/1Bk5/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxa5",
    "line": [
      "Bxa5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1805",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1805",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "k7/5q2/1K6/8/8/5R2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxf7",
    "line": [
      "Rxf7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1806",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1806",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/5k2/8/3K4/8/8/1Q2r3/8 w - - 0 1",
    "side": "w",
    "solution": "Qxe2",
    "line": [
      "Qxe2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1807",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1807",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/8/7K/1N2b3/8/r5k1 w - - 0 1",
    "side": "w",
    "solution": "Nxa1",
    "line": [
      "Nxa1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1808",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1808",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5r2/6Q1/8/8/3b4/8/3k4/5K2 w - - 0 1",
    "side": "w",
    "solution": "Qxf8",
    "line": [
      "Qxf8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1809",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1809",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/3k4/8/5rp1/2K5/4N3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxf5",
    "line": [
      "Nxf5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1810",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1810",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "n7/1p6/8/8/6r1/8/7N/5K1k w - - 0 1",
    "side": "w",
    "solution": "Nxg4",
    "line": [
      "Nxg4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1811",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1811",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/4R3/8/4q3/8/1k6/7K/8 w - - 0 1",
    "side": "w",
    "solution": "Rxe5",
    "line": [
      "Rxe5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1812",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1812",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/2p5/8/8/4b3/2k5/K4N2 w - - 0 1",
    "side": "w",
    "solution": "Nxe3+",
    "line": [
      "Nxe3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1813",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1813",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "K7/8/8/8/3R4/8/5k1b/3r4 w - - 0 1",
    "side": "w",
    "solution": "Rxd1",
    "line": [
      "Rxd1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1814",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1814",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/1k6/3b4/5Q2/8/5r1K/8 w - - 0 1",
    "side": "w",
    "solution": "Qxf2+",
    "line": [
      "Qxf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1815",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1815",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/7n/K7/2k5/8/6Rr/8 w - - 0 1",
    "side": "w",
    "solution": "Rxh2",
    "line": [
      "Rxh2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1816",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1816",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/3k4/r3R3/2p5/8/8/5K2/8 w - - 0 1",
    "side": "w",
    "solution": "Rxa6",
    "line": [
      "Rxa6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1817",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1817",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/n1b5/8/8/k7/5r2/8/2K1N3 w - - 0 1",
    "side": "w",
    "solution": "Nxf3",
    "line": [
      "Nxf3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1818",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1818",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2n5/1R6/6b1/5K2/8/1n6/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Kxg6",
    "line": [
      "Kxg6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1819",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1819",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/5k2/8/5b2/5Q2/K7 w - - 0 1",
    "side": "w",
    "solution": "Qxf3+",
    "line": [
      "Qxf3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1820",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1820",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "1b6/2Q3n1/3K4/7k/3p4/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxb8",
    "line": [
      "Qxb8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1821",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1821",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2R1q3/8/1p6/3K4/8/8/6k1/8 w - - 0 1",
    "side": "w",
    "solution": "Rxe8",
    "line": [
      "Rxe8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1822",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1822",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/k4K2/8/2N5/8/3b4/6b1 w - - 0 1",
    "side": "w",
    "solution": "Nxd2",
    "line": [
      "Nxd2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1823",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1823",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6k1/8/8/8/8/2R5/8/K1q5 w - - 0 1",
    "side": "w",
    "solution": "Rxc1",
    "line": [
      "Rxc1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1824",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1824",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/5b2/8/5kN1/8/8/1K6/3p4 w - - 0 1",
    "side": "w",
    "solution": "Nxf7",
    "line": [
      "Nxf7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1825",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1825",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2K2k1p/8/4B3/8/6q1/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxg4",
    "line": [
      "Bxg4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1826",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1826",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/4n2q/5N2/k7/4K3/8 w - - 0 1",
    "side": "w",
    "solution": "Nxh5",
    "line": [
      "Nxh5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1827",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1827",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2Q2q2/8/8/3k4/5K2/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxf8",
    "line": [
      "Qxf8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1828",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1828",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6BK/5q2/8/8/8/8/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Bxf7",
    "line": [
      "Bxf7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1829",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1829",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6b1/8/8/8/7K/4k3/1b6/R6q w - - 0 1",
    "side": "w",
    "solution": "Rxh1",
    "line": [
      "Rxh1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1830",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1830",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "K7/5k2/8/7b/3q4/8/4N3/8 w - - 0 1",
    "side": "w",
    "solution": "Nxd4",
    "line": [
      "Nxd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1831",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1831",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/q2k4/8/8/8/R3K3/8 w - - 0 1",
    "side": "w",
    "solution": "Rxa6+",
    "line": [
      "Rxa6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1832",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1832",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "3b4/8/4N3/3p3b/8/K7/8/7k w - - 0 1",
    "side": "w",
    "solution": "Nxd8",
    "line": [
      "Nxd8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1833",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1833",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/8/4r3/1nN5/7K/5k2 w - - 0 1",
    "side": "w",
    "solution": "Nxe4",
    "line": [
      "Nxe4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1834",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1834",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "K5r1/2k4B/b7/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxg8",
    "line": [
      "Bxg8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1835",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1835",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4q3/8/6Q1/p2k4/8/8/6K1/3b4 w - - 0 1",
    "side": "w",
    "solution": "Qxe8",
    "line": [
      "Qxe8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1836",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1836",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4k1b1/3R4/8/8/8/8/2K5/3b4 w - - 0 1",
    "side": "w",
    "solution": "Rxd1",
    "line": [
      "Rxd1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1837",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1837",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4K3/8/B7/8/8/4k3/8/5r1b w - - 0 1",
    "side": "w",
    "solution": "Bxf1",
    "line": [
      "Bxf1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1838",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1838",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/q7/5k2/K7/8/8/5B2/8 w - - 0 1",
    "side": "w",
    "solution": "Bxa7",
    "line": [
      "Bxa7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1839",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1839",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/b5k1/Q7/8/7p/2K5 w - - 0 1",
    "side": "w",
    "solution": "Qxa5+",
    "line": [
      "Qxa5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1840",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1840",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2k5/8/5K2/B7/1q6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxb4",
    "line": [
      "Bxb4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1841",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1841",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/7k/8/5K2/3N4/1b6/8/2b5 w - - 0 1",
    "side": "w",
    "solution": "Nxb3",
    "line": [
      "Nxb3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1842",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1842",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/5k2/2N5/8/1r5K/3b4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxb4",
    "line": [
      "Nxb4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1843",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1843",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/8/8/2b2B2/1K3k2/7q w - - 0 1",
    "side": "w",
    "solution": "Kxc3",
    "line": [
      "Kxc3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1844",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1844",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/1k6/3B4/3K4/5q2/8 w - - 0 1",
    "side": "w",
    "solution": "Bxf2",
    "line": [
      "Bxf2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1845",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1845",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/3k4/5K2/3q4/8/4N3/8 w - - 0 1",
    "side": "w",
    "solution": "Nxd4",
    "line": [
      "Nxd4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1846",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1846",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/1p6/8/k7/4K3/5Q2/4b3 w - - 0 1",
    "side": "w",
    "solution": "Qxe1",
    "line": [
      "Qxe1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1847",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1847",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/2k5/4K3/8/8/8/2n3R1/8 w - - 0 1",
    "side": "w",
    "solution": "Rxc2+",
    "line": [
      "Rxc2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1848",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1848",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "7r/8/8/8/3Bb3/8/k7/4K3 w - - 0 1",
    "side": "w",
    "solution": "Bxh8",
    "line": [
      "Bxh8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1849",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1849",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6r1/8/7N/8/3n4/8/7k/5K2 w - - 0 1",
    "side": "w",
    "solution": "Nxg8",
    "line": [
      "Nxg8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1850",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1850",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/1N6/8/q6k/3n4/8/8/2p1K3 w - - 0 1",
    "side": "w",
    "solution": "Nxa5",
    "line": [
      "Nxa5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1851",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1851",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/1k4b1/8/7K/8/8/8/2r1Q3 w - - 0 1",
    "side": "w",
    "solution": "Qxc1",
    "line": [
      "Qxc1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1852",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1852",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/7R/8/8/1K6/7b/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Rxh3",
    "line": [
      "Rxh3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1853",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1853",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "Q7/n7/8/8/8/8/p1k5/4K3 w - - 0 1",
    "side": "w",
    "solution": "Qxa7",
    "line": [
      "Qxa7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1854",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1854",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/6K1/4k3/8/8/6bR/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxg3",
    "line": [
      "Rxg3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1855",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1855",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/2k5/6Rr/8/8/8/5p1K w - - 0 1",
    "side": "w",
    "solution": "Rxh5",
    "line": [
      "Rxh5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1856",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1856",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2K5/8/4N3/8/5q2/8/7k/8 w - - 0 1",
    "side": "w",
    "solution": "Nxf4",
    "line": [
      "Nxf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1857",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1857",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "1K6/7b/8/8/8/1n6/8/1k1B4 w - - 0 1",
    "side": "w",
    "solution": "Bxb3",
    "line": [
      "Bxb3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1858",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1858",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/5N2/8/6q1/8/3K4/1k6/8 w - - 0 1",
    "side": "w",
    "solution": "Nxg5",
    "line": [
      "Nxg5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1859",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1859",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "7K/3k4/8/1N6/8/r7/6p1/8 w - - 0 1",
    "side": "w",
    "solution": "Nxa3",
    "line": [
      "Nxa3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1860",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1860",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "N7/2q5/8/8/4k3/8/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Nxc7",
    "line": [
      "Nxc7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1861",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1861",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "b2r4/8/4N3/2K5/8/3k4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxd8",
    "line": [
      "Nxd8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1862",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1862",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/3r4/8/2k5/3R4/2K5/5n2 w - - 0 1",
    "side": "w",
    "solution": "Rxd6",
    "line": [
      "Rxd6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1863",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1863",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/k4bR1/6n1/8/8/6r1/3K4/8 w - - 0 1",
    "side": "w",
    "solution": "Rxf7+",
    "line": [
      "Rxf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1864",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1864",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5k2/8/1n6/2b5/2N5/7K/3q4/8 w - - 0 1",
    "side": "w",
    "solution": "Nxd2",
    "line": [
      "Nxd2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1865",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1865",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/3p4/4N3/6r1/K3k3/6p1 w - - 0 1",
    "side": "w",
    "solution": "Nxg3+",
    "line": [
      "Nxg3+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1866",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1866",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6k1/8/1K1n4/8/8/8/8/r4R2 w - - 0 1",
    "side": "w",
    "solution": "Rxa1",
    "line": [
      "Rxa1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1867",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1867",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4b3/8/5k2/8/8/4Q3/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Qxe8",
    "line": [
      "Qxe8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1868",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1868",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "1k6/8/5K2/8/7q/8/5B2/8 w - - 0 1",
    "side": "w",
    "solution": "Bxh4",
    "line": [
      "Bxh4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1869",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1869",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/4B3/3q4/8/1k6/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxd6+",
    "line": [
      "Bxd6+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1870",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1870",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/3p4/2B2K2/8/7k/5b2 w - - 0 1",
    "side": "w",
    "solution": "Bxf1",
    "line": [
      "Bxf1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1871",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1871",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/7k/8/7r/8/8/5K2/3Q4 w - - 0 1",
    "side": "w",
    "solution": "Qxh5+",
    "line": [
      "Qxh5+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1872",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1872",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/3q4/8/4N3/8/5K2/8/1k6 w - - 0 1",
    "side": "w",
    "solution": "Nxd7",
    "line": [
      "Nxd7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1873",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1873",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/r1R5/7K/8/8/1k6/8 w - - 0 1",
    "side": "w",
    "solution": "Rxa6",
    "line": [
      "Rxa6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1874",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1874",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/K7/8/4B3/8/8/p7/n4k2 w - - 0 1",
    "side": "w",
    "solution": "Bxa1",
    "line": [
      "Bxa1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1875",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1875",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2K5/8/3N4/5q2/8/3k3p/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxf5",
    "line": [
      "Nxf5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1876",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1876",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4n3/6k1/n1B5/8/6K1/8/1n6/8 w - - 0 1",
    "side": "w",
    "solution": "Bxe8",
    "line": [
      "Bxe8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1877",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1877",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/r2Rp3/2Kb4/8/8/7k/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxa7",
    "line": [
      "Rxa7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1878",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1878",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/1k1K4/8/8/8/8/4rR2/8 w - - 0 1",
    "side": "w",
    "solution": "Rxe2",
    "line": [
      "Rxe2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1879",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1879",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/1K6/8/8/8/8/2k2r2/5R2 w - - 0 1",
    "side": "w",
    "solution": "Rxf2+",
    "line": [
      "Rxf2+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1880",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1880",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/1q4R1/8/K2k4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxb7",
    "line": [
      "Rxb7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1881",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1881",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4R3/1k2r3/8/8/8/1K6/8/4p3 w - - 0 1",
    "side": "w",
    "solution": "Rxe7+",
    "line": [
      "Rxe7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1882",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1882",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "B7/8/3K4/4b3/6k1/8/6r1/8 w - - 0 1",
    "side": "w",
    "solution": "Kxe5",
    "line": [
      "Kxe5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1883",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1883",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6N1/8/5r2/8/4K3/8/8/2n1k3 w - - 0 1",
    "side": "w",
    "solution": "Nxf6",
    "line": [
      "Nxf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1884",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1884",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5r1n/8/8/6K1/8/B7/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Bxf8",
    "line": [
      "Bxf8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1885",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1885",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5Q2/5n2/1K6/3k4/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxf7+",
    "line": [
      "Qxf7+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1886",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1886",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4k1n1/2n5/8/8/8/6R1/2K5/8 w - - 0 1",
    "side": "w",
    "solution": "Rxg8+",
    "line": [
      "Rxg8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1887",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1887",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4r2R/8/8/8/K2n4/5k2/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxe8",
    "line": [
      "Rxe8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1888",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1888",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5q2/8/8/1K3R2/8/8/8/3k4 w - - 0 1",
    "side": "w",
    "solution": "Rxf8",
    "line": [
      "Rxf8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1889",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1889",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/3K4/8/6q1/p7/3k4/3B4/8 w - - 0 1",
    "side": "w",
    "solution": "Bxg5",
    "line": [
      "Bxg5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1890",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1890",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6K1/1b6/4b3/1k5b/8/4Q3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxe6",
    "line": [
      "Qxe6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1891",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1891",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5b1K/8/8/8/8/3rR3/k7/8 w - - 0 1",
    "side": "w",
    "solution": "Rxd3",
    "line": [
      "Rxd3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1892",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1892",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/4p3/8/3K4/7B/2b3q1/8/6k1 w - - 0 1",
    "side": "w",
    "solution": "Bxg3",
    "line": [
      "Bxg3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1893",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1893",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/6b1/5K2/6r1/2k5/8/3B4/8 w - - 0 1",
    "side": "w",
    "solution": "Kxg5",
    "line": [
      "Kxg5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1894",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1894",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "1k2r3/8/7b/4R3/1n6/8/8/4K3 w - - 0 1",
    "side": "w",
    "solution": "Rxe8+",
    "line": [
      "Rxe8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1895",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1895",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/K1k5/8/8/8/4N3/8/3q4 w - - 0 1",
    "side": "w",
    "solution": "Nxd1",
    "line": [
      "Nxd1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1896",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1896",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/1r1k4/3N1K2/1b6/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxb6",
    "line": [
      "Nxb6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1897",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1897",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/1k6/8/1K6/2Q5/3b4 w - - 0 1",
    "side": "w",
    "solution": "Qxd1",
    "line": [
      "Qxd1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1898",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1898",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/1p4k1/p4N2/3K4/6q1/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxg3",
    "line": [
      "Nxg3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1899",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1899",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "K6Q/8/2k5/8/8/1b6/8/7q w - - 0 1",
    "side": "w",
    "solution": "Qxh1+",
    "line": [
      "Qxh1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1900",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1900",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5b2/8/8/7K/k1r5/8/8/5B2 w - - 0 1",
    "side": "w",
    "solution": "Bxc4",
    "line": [
      "Bxc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1901",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1901",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "r2R4/8/8/8/8/6K1/k1n5/8 w - - 0 1",
    "side": "w",
    "solution": "Rxa8+",
    "line": [
      "Rxa8+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1902",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1902",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/2p5/8/8/1r6/2B4k/8/2K5 w - - 0 1",
    "side": "w",
    "solution": "Bxb4",
    "line": [
      "Bxb4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1903",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1903",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/1K6/5b2/7b/6B1/8/5k2 w - - 0 1",
    "side": "w",
    "solution": "Bxh4",
    "line": [
      "Bxh4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1904",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1904",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/2K5/8/3k4/Q7/1n6 w - - 0 1",
    "side": "w",
    "solution": "Qxb1+",
    "line": [
      "Qxb1+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1905",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1905",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/6K1/3k4/8/2r4R/2p5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxc4",
    "line": [
      "Rxc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1906",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1906",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "K7/8/8/6n1/3k4/8/N7/2b5 w - - 0 1",
    "side": "w",
    "solution": "Nxc1",
    "line": [
      "Nxc1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1907",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1907",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4q3/8/8/K7/8/1k1nQ3/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxe8",
    "line": [
      "Qxe8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1908",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1908",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "1b1k4/6K1/8/8/6b1/4N3/8/6n1 w - - 0 1",
    "side": "w",
    "solution": "Nxg4",
    "line": [
      "Nxg4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1909",
    "level": "Kolay",
    "theme": "askida",
    "title": "Bedava Taş #1909",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2r4R/5k2/8/8/8/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxc8",
    "line": [
      "Rxc8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1910",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1910",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4N3/3k2r1/1n6/8/8/7b/8/7K w - - 0 1",
    "side": "w",
    "solution": "Nxg7",
    "line": [
      "Nxg7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1911",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1911",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "1K6/6r1/8/8/3Q4/1k6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxg7",
    "line": [
      "Qxg7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1912",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1912",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5p2/8/8/8/3n4/1k3N2/8/7K w - - 0 1",
    "side": "w",
    "solution": "Nxd4+",
    "line": [
      "Nxd4+"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1913",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1913",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "k7/8/8/5K2/p7/3r4/b7/4N3 w - - 0 1",
    "side": "w",
    "solution": "Nxd3",
    "line": [
      "Nxd3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1914",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1914",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4K3/8/8/8/Rq5b/8/8/4k3 w - - 0 1",
    "side": "w",
    "solution": "Rxb4",
    "line": [
      "Rxb4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1915",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1915",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/5K2/5p2/4N3/k7/3r4/8 w - - 0 1",
    "side": "w",
    "solution": "Nxd2",
    "line": [
      "Nxd2"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1916",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1916",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/5K2/8/6B1/5q2/2k5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxf4",
    "line": [
      "Bxf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1917",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1917",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/5R2/5n2/8/8/8/2k5/6K1 w - - 0 1",
    "side": "w",
    "solution": "Rxf6",
    "line": [
      "Rxf6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1918",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1918",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/6k1/n7/8/8/K4r1R/8/p7 w - - 0 1",
    "side": "w",
    "solution": "Rxf3",
    "line": [
      "Rxf3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1919",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1919",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "3N4/1q6/8/8/3k4/1K6/8/8 w - - 0 1",
    "side": "w",
    "solution": "Nxb7",
    "line": [
      "Nxb7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1920",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1920",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/8/2R2r2/K7/3k4/8 w - - 0 1",
    "side": "w",
    "solution": "Rxf4",
    "line": [
      "Rxf4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1921",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1921",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "6Q1/8/8/3r4/8/1b6/K2k4/8 w - - 0 1",
    "side": "w",
    "solution": "Kxb3",
    "line": [
      "Kxb3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1922",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1922",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "K1k5/4rp2/3B4/8/8/2p5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxe7",
    "line": [
      "Bxe7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1923",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1923",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/2K5/8/8/6k1/8/6Np/4r3 w - - 0 1",
    "side": "w",
    "solution": "Nxe1",
    "line": [
      "Nxe1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1924",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1924",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/2k5/8/8/2pQr3/2K5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxe4",
    "line": [
      "Qxe4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1925",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1925",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/2R5/k7/7K/8/2r5/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxc3",
    "line": [
      "Rxc3"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1926",
    "level": "Kolay",
    "theme": "askida",
    "title": "Korumasız #1926",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/8/8/2k4B/8/1K6/4r3 w - - 0 1",
    "side": "w",
    "solution": "Bxe1",
    "line": [
      "Bxe1"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1927",
    "level": "Kolay",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1927",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "5Q2/k7/3r4/8/8/3K4/8/8 w - - 0 1",
    "side": "w",
    "solution": "Qxd6",
    "line": [
      "Qxd6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1928",
    "level": "Kolay",
    "theme": "askida",
    "title": "Askıda Taş #1928",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "3rR3/k7/5K2/8/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Rxd8",
    "line": [
      "Rxd8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1929",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1929",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/5Bb1/k1K3r1/8/8/8/8 w - - 0 1",
    "side": "w",
    "solution": "Bxg5",
    "line": [
      "Bxg5"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1930",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1930",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "R5r1/8/2k2K2/8/8/8/4n3/2b5 w - - 0 1",
    "side": "w",
    "solution": "Rxg8",
    "line": [
      "Rxg8"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1931",
    "level": "Orta",
    "theme": "askida",
    "title": "Sahipsiz Kalmış #1931",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Rakibin hiçbir taşının korumadığı bir taş var; onu bul.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "2B4n/1n6/8/8/8/8/8/4k1K1 w - - 0 1",
    "side": "w",
    "solution": "Bxb7",
    "line": [
      "Bxb7"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1932",
    "level": "Orta",
    "theme": "askida",
    "title": "Bedava Taş #1932",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Her hamleden önce tahtadaki korumasız taşlara bakmak iyi bir alışkanlıktır.",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "4k3/8/4r3/4b3/5N2/8/K7/8 w - - 0 1",
    "side": "w",
    "solution": "Nxe6",
    "line": [
      "Nxe6"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1933",
    "level": "Orta",
    "theme": "askida",
    "title": "Askıda Taş #1933",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/7p/3k4/3B4/2q5/4K3/8/7p w - - 0 1",
    "side": "w",
    "solution": "Bxc4",
    "line": [
      "Bxc4"
    ],
    "mateIn": null
  },
  {
    "id": "puzzle-1934",
    "level": "Orta",
    "theme": "askida",
    "title": "Korumasız #1934",
    "goal": "Beyaz oynar ve korumasız taşı kazanır.",
    "hint": "Almadan önce sor: bu taşı alırsam beni kim alabilir?",
    "explanation": "Bu taşı hiçbir siyah taş korumuyordu. Satrançta ilk bakılacak şey budur: korumasız taşlar.",
    "fen": "8/8/5K2/8/2k5/6p1/4N3/6r1 w - - 0 1",
    "side": "w",
    "solution": "Nxg1",
    "line": [
      "Nxg1"
    ],
    "mateIn": null
  }
];

/** Zorluk seviyesine göre filtreler. */
export function puzzlesByLevel(level) {
  return puzzles.filter((puzzle) => puzzle.level === level);
}

/** Temaya göre filtreler. Geçerli değerler için THEME_LIST'e bakın. */
export function puzzlesByTheme(theme) {
  return puzzles.filter((puzzle) => puzzle.theme === theme);
}

/** Seviyeye göre bulmaca sayıları. */
export const puzzleCounts = {"Kolay":799,"Orta":923,"Zor":212};

/** Temaya göre bulmaca sayıları. */
export const themeCounts = {"mat-1":620,"mat-2":340,"catal":160,"koridor":140,"bogmaca":80,"terfi":104,"sis":130,"acmaz":130,"cifte-sah":90,"askida":140};

/** Dosyadaki tüm temalar (üretim sırasına göre). */
export const THEME_LIST = ["mat-1","mat-2","catal","koridor","bogmaca","terfi","sis","acmaz","cifte-sah","askida"];
