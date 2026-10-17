/**
 * CheckOrMate.js — "Şah mı, Mat mı, Pat mı?"
 *
 * Tahtada siyahın oynama sırası olan bir konum gösterilir; çocuk üç durumdan
 * birini seçer. İlkokul çağında en çok karıştırılan üçlü budur: "şah" ile
 * "şah mat" ayrımı ve özellikle PAT, çünkü pat tahtada mat gibi görünür ama
 * sonucu berabereliktir.
 *
 * Konumlar ÜRETİLİR, hazır listeden gelmez: rastgele bir şah–vezir sonu kurulur,
 * beyazın bütün hamleleri denenir ve ortaya çıkan konumlar motorun
 * isCheckmate/isStalemate/inCheck sonuçlarına göre sınıflanır. Böylece her
 * sorunun cevabı kural motorunun kendisi tarafından garanti edilir.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";

const FILES = "abcdefgh".split("");

/** Üç durumun etiketi ve açıklaması. */
const STATES = {
  sah: {
    label: "Şah",
    explain: "Şah tehdit altında ama kurtulabiliyor. Buna sadece ŞAH denir, oyun devam eder."
  },
  mat: {
    label: "Şah Mat",
    explain: "Şah tehdit altında ve kurtulamıyor: kaçamıyor, araya taş koyamıyor, saldıranı alamıyor. Bu ŞAH MAT."
  },
  pat: {
    label: "Pat",
    explain: "Siyahın hiç yasal hamlesi yok ama şahı tehdit altında DEĞİL. Bu PAT, yani berabere."
  }
};

/** Üretim tutmazsa kullanılacak, elle doğrulanmış yedek konumlar. */
const FALLBACK = {
  sah: "7k/8/6K1/8/8/8/8/7R b - - 0 1",
  mat: "6k1/6Q1/6K1/8/8/8/8/8 b - - 0 1",
  pat: "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"
};

const randomSquare = () => FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);

/** İki kare arasındaki şah mesafesi (en büyük eksen farkı). */
function distance(a, b) {
  return Math.max(
    Math.abs(FILES.indexOf(a[0]) - FILES.indexOf(b[0])),
    Math.abs(Number(a[1]) - Number(b[1]))
  );
}

/** Siyah şahı kenara koyar: mat ve pat konumları kenarda doğar. */
function edgeSquare() {
  const file = FILES[Math.floor(Math.random() * 8)];
  const rank = Math.floor(Math.random() * 8) + 1;
  // Kareyi en yakın kenara it.
  return Math.random() < 0.5
    ? `${Math.random() < 0.5 ? "a" : "h"}${rank}`
    : `${file}${Math.random() < 0.5 ? 1 : 8}`;
}

/** Taş haritasından FEN üretir; sıra verilen renktedir. */
function toFen(pieces, turn) {
  const rows = [];
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = "";
    let empty = 0;
    for (const file of FILES) {
      const symbol = pieces[`${file}${rank}`];
      if (symbol) {
        if (empty) row += empty;
        empty = 0;
        row += symbol;
      } else empty += 1;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} ${turn} - - 0 1`;
}

/**
 * İstenen durumu (şah / mat / pat) üreten bir konum arar.
 *
 * Rastgele bir konum kurar, beyazın her hamlesini oynar ve sonucu sınıflar.
 * Aranan sınıf çıkarsa o konumun FEN'i döner — sıra artık siyahtadır.
 */
function findPosition(wanted, withRook) {
  for (let attempt = 0; attempt < 220; attempt += 1) {
    const blackKing = edgeSquare();
    const whiteKing = randomSquare();
    // Şahlar yan yana duramaz; arada en az bir kare olmalı.
    if (distance(blackKing, whiteKing) < 2) continue;

    const pieces = { [blackKing]: "k", [whiteKing]: "K" };

    const queen = randomSquare();
    if (pieces[queen]) continue;
    pieces[queen] = "Q";

    if (withRook) {
      const rook = randomSquare();
      if (pieces[rook]) continue;
      pieces[rook] = "R";
    }

    let chess;
    try {
      chess = new Chess(toFen(pieces, "w"));
    } catch {
      continue;
    }
    // Sıra beyazdayken siyah şah tehdit altındaysa konum kural dışıdır.
    if (chess.isKingAttacked("b")) continue;

    // Arama hamleleri kullanılır (SAN üretilmez): tur başına yüzlerce konum
    // denendiği için ucuz olan yol seçilir.
    const moves = chess.moves({ verbose: false });
    // Aranan durumu ilk bulan hamleyi kullanmak konumları tek tip yapardı;
    // bu yüzden hamleler karıştırılır.
    for (const move of moves.sort(() => Math.random() - 0.5)) {
      chess.searchMake(move);
      const state = chess.isCheckmate() ? "mat" : chess.isStalemate() ? "pat" : chess.inCheck() ? "sah" : null;
      const fen = chess.fen();
      chess.searchUndo();

      if (state === wanted) return fen;
    }
  }
  return FALLBACK[wanted];
}

export function createCheckOrMate() {
  let board = null;
  let optionsNode = null;
  let promptNode = null;
  let answered = false;
  let round = 0;

  return {
    id: "sah-mat-pat",
    title: "Şah mı, Mat mı, Pat mı?",
    description: "Siyahın durumuna bak ve karar ver. Pat, mat gibi görünür ama beraberedir!",
    icon: "target",
    rounds: 10,

    setup(api) {
      round = 0;
      promptNode = el("p", { className: "state-prompt", text: "Sıra siyahta. Siyahın durumu nedir?" });
      optionsNode = el("div", { className: "quiz-options" });
      board = ChessBoard({
        chess: new Chess(),
        interactive: false,
        coordinates: true
      });
      api.setStage(el("div", { className: "state-quiz" }, [promptNode, board.element, optionsNode]));
    },

    nextRound(api) {
      round += 1;
      answered = false;

      // Her tur üç durumdan biri sorulur; sıra rastgeledir ki çocuk
      // "sırayla geliyor" diye tahmin yürütemesin.
      const wanted = ["sah", "mat", "pat"][Math.floor(Math.random() * 3)];
      // Son turlarda tahtaya kale eklenir: konum kalabalıklaşır, karar zorlaşır.
      const fen = findPosition(wanted, round > 5);

      board.attach(new Chess(fen));
      // Tehdit altındaki şahın kırmızı halkası ipucu vermesin diye değil —
      // TAM TERSİNE, çocuk "tehdit var mı?" sorusunu tahtaya bakarak
      // cevaplasın diye tahta olduğu gibi gösterilir.
      promptNode.textContent = "Sıra siyahta. Siyahın durumu nedir?";

      optionsNode.replaceChildren(
        ...["sah", "mat", "pat"].map((key) =>
          el("button", {
            className: "quiz-option",
            type: "button",
            text: STATES[key].label,
            onClick: (event) => {
              if (answered) return;
              if (key === wanted) {
                answered = true;
                event.currentTarget.classList.add("correct");
                api.correct(`✅ ${STATES[wanted].explain}`);
              } else {
                event.currentTarget.classList.add("wrong");
                event.currentTarget.disabled = true;
                api.wrong(hintFor(wanted, key));
              }
            }
          })
        )
      );
    }
  };
}

/**
 * Yanlış cevaba, doğruyu söylemeden yön veren ipucu.
 * Çocuğun bakması gereken YERİ gösterir: önce tehdit, sonra kaçış.
 */
function hintFor(wanted, guessed) {
  if (guessed === "pat") return "Şaha iyi bak: tehdit altında mı? Patta şah TEHDİT ALTINDA DEĞİLDİR.";
  if (wanted === "pat") return "Şah tehdit altında mı? Değilse bu şah da mat da olamaz. Siyahın hiç hamlesi var mı, say.";
  if (guessed === "mat") return "Şah kaçabiliyor ya da tehdit engellenebiliyor mu? Bir tek kurtuluş varsa bu mat değildir.";
  return "Şahın gidebileceği tüm kareleri tek tek dene. Hiçbiri yoksa ve tehdit kaldırılamıyorsa bu mattır.";
}
