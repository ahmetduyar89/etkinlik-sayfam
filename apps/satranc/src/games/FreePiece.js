/**
 * FreePiece.js — "Bedava Taş Var!"
 *
 * Tahtada siyahın KORUMASIZ duran bir taşı vardır; çocuk onu alan hamleyi
 * oynar. Taktik gözünün ilk adımı budur: mat aramadan önce çocuk "hangi taş
 * korunmuyor?" sorusunu sormayı öğrenmelidir.
 *
 * Konumlar üretilir ve şu üç şart sağlanana kadar elenir:
 *   1. Konum kurallara uygundur ve beyaz şah çekilmiş durumda değildir.
 *   2. Beyazın alabileceği en kazançlı taş TEK ve en az bir at değerindedir.
 *   3. O taşı aldıktan sonra alan taş geri alınamaz — yani gerçekten bedavadır.
 *
 * Böylece her turun tek ve tartışmasız bir doğru cevabı olur.
 */

import { el } from "../utils/dom.js";
import { Chess, PIECE_NAMES_TR, toSquare } from "../engine/Chess.js";
import { SIMPLE_VALUES } from "../engine/Evaluator.js";
import { ChessBoard } from "../components/ChessBoard.js";

const FILES = "abcdefgh".split("");
const WHITE_POOL = ["N", "B", "R", "Q"];
const BLACK_POOL = ["n", "b", "r", "q"];

const randomSquare = () => FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** İki kare arasındaki şah mesafesi. */
function distance(a, b) {
  return Math.max(
    Math.abs(FILES.indexOf(a[0]) - FILES.indexOf(b[0])),
    Math.abs(Number(a[1]) - Number(b[1]))
  );
}

/** Taş haritasından FEN üretir; sıra beyazdadır. */
function toFen(pieces) {
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
  return `${rows.join("/")} w - - 0 1`;
}

/**
 * Beyazın bütün almalarını tarar ve her birinin GERÇEK kazancını hesaplar:
 * alınan taşın değeri eksi, kare hâlâ savunuluyorsa alan taşın değeri.
 */
function captureGains(chess) {
  const gains = [];
  for (const move of chess.moves()) {
    if (!move.captured) continue;
    const played = chess.move({ from: move.from, to: move.to, promotion: "q" });
    if (!played) continue;
    // Hamleden SONRA kare siyah tarafından hâlâ tehdit ediliyorsa taş geri alınır.
    const recaptured = chess.attacked("b", toSquare(move.to));
    chess.undo();

    gains.push({
      from: move.from,
      to: move.to,
      piece: move.piece,
      captured: move.captured,
      // "safe" = alan taş geri alınamaz; oyunun aradığı BEDAVA taş budur.
      safe: !recaptured,
      gain: SIMPLE_VALUES[move.captured] - (recaptured ? SIMPLE_VALUES[move.piece] : 0)
    });
  }
  return gains;
}

/**
 * Tek ve net bir "bedava taş" içeren konum arar.
 * @param {number} extra Fazladan taş çifti sayısı — tur ilerledikçe tahta kalabalıklaşır.
 */
function buildPosition(extra) {
  for (let attempt = 0; attempt < 260; attempt += 1) {
    const whiteKing = randomSquare();
    const blackKing = randomSquare();
    if (distance(whiteKing, blackKing) < 2) continue;

    const pieces = { [whiteKing]: "K", [blackKing]: "k" };
    // Her iki tarafa eşit sayıda taş konur; kareler çakışırsa bu deneme atılır.
    const count = 2 + extra;
    let clash = false;
    for (const pool of [WHITE_POOL, BLACK_POOL]) {
      for (let index = 0; index < count; index += 1) {
        const square = randomSquare();
        if (pieces[square]) {
          clash = true;
          break;
        }
        pieces[square] = pick(pool);
      }
      if (clash) break;
    }
    if (clash) continue;

    let chess;
    try {
      chess = new Chess(toFen(pieces));
    } catch {
      continue;
    }
    // Sıra beyazdayken siyah şah tehditteyse konum kural dışıdır.
    if (chess.isKingAttacked("b")) continue;
    // Beyaz şah çekilmişse görev "taş kazan" değil "şahı kurtar" olurdu.
    if (chess.inCheck()) continue;
    if (chess.isGameOver()) continue;

    const gains = captureGains(chess);
    if (gains.length === 0) continue;

    // Bedava taşlar: geri alınamayan ve en az bir at değerindeki almalar.
    // Aynı taşa iki beyaz taş birden saldırabilir; o yüzden KARE'ye göre sayılır.
    const freeTargets = new Set(
      gains.filter((entry) => entry.safe && SIMPLE_VALUES[entry.captured] >= 3).map((entry) => entry.to)
    );
    // Tahtada birden fazla bedava taş varsa "doğru cevap" tek olmaz.
    if (freeTargets.size !== 1) continue;

    const target = [...freeTargets][0];
    const best = gains.find((entry) => entry.to === target);
    // Başka bir alma en az bunun kadar kazandırıyorsa konum tartışmalı olur:
    // örneğin korunan bir veziri kaleyle almak da doğru sayılabilirdi.
    if (gains.some((entry) => entry.to !== target && entry.gain >= best.gain)) continue;

    return { fen: chess.fen(), target, captured: best.captured, gain: SIMPLE_VALUES[best.captured] };
  }
  return null;
}

export function createFreePiece() {
  let board = null;
  let chess = null;
  let promptNode = null;
  let current = null;
  let round = 0;
  let attempts = 0;

  return {
    id: "bedava-tas",
    title: "Bedava Taş Var!",
    description: "Siyahın korumasız taşını bul ve al. Kimse geri alamıyorsa taş bedavadır!",
    icon: "puzzle",
    rounds: 8,

    setup(api) {
      round = 0;
      promptNode = el("p", { className: "free-prompt", text: "" });
      chess = new Chess();
      board = ChessBoard({
        chess,
        interactive: true,
        onMove: (move) => {
          if (!current) return false;

          if (move.to === current.target) {
            const name = PIECE_NAMES_TR[current.captured];
            api.correct(`🎯 Bedava ${name}! ${current.gain} puanlık taşı kimse geri alamadı.`);
          } else {
            attempts += 1;
            api.wrong(
              attempts >= 2
                ? `Henüz değil. İpucu: aradığın taş ${current.target[0].toUpperCase()} sütununda.`
                : "Bu taş kazandırmıyor. Siyahın taşlarını tek tek gez: hangisine bir beyaz taş bakıyor ama hiçbir siyah taş korumuyor?"
            );
          }
          // Konum bozulmasın diye hamle geri alınır; tur zaten yenilenecek.
          return false;
        }
      });
      api.setStage(el("div", { className: "free-piece" }, [promptNode, board.element]));
    },

    nextRound(api) {
      round += 1;
      attempts = 0;

      // Tur ilerledikçe tahtaya taş eklenir; korumasız taşı bulmak zorlaşır.
      const extra = Math.min(Math.floor((round - 1) / 3), 2);
      current = buildPosition(extra);

      if (!current) {
        api.say("Konum hazırlanamadı, sıradaki tura geçiliyor.");
        return;
      }

      chess = new Chess(current.fen);
      board.attach(chess);
      board.setInteractive(true);
      promptNode.textContent = "Beyaz oynar. Siyahın korumasız taşını bul ve al!";
      api.say("Hangi siyah taşı kimse korumuyor?");
    }
  };
}
