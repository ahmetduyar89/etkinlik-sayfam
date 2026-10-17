/**
 * MoveTarget.js — "Taşı Yerine Sürükle"
 *
 * Tahtada tek bir taş ve parlayan bir hedef kare vardır. Çocuk taşı o kareye
 * götürmelidir. Hedef kare DAİMA taşın gerçek yasal hamlelerinden seçilir;
 * yani oyun taşın hareket kurallarını doğrudan kas hafızasına yazar.
 *
 * Yanlış kareye gidilemez: tahta zaten yalnızca yasal hamleleri kabul eder.
 * Bu yüzden "yanlış" durumu, doğru taşı seçip yanlış yasal kareye gitmektir.
 */

import { el } from "../utils/dom.js";
import { Chess, PIECE_NAMES_TR } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";

const FILES = "abcdefgh".split("");
/** Oyunda kullanılan taşlar — piyon hariç, çünkü piyonun tek yönü oyunu tekdüze yapar. */
const TYPES = ["n", "b", "r", "q", "k", "p"];

const randomSquare = () => FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);

export function createMoveTarget() {
  let board = null;
  let chess = null;
  let target = null;
  let pieceName = "";
  let promptNode = null;

  /**
   * Tek taşlı bir konum kurar ve o taşın yasal hedeflerinden birini seçer.
   * Şahlar tahtada bulunur (kurallar gereği) ama birbirinden uzağa konur.
   */
  function buildPosition() {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      const square = randomSquare();
      // Piyonu 2.-6. yatayla sınırlarız:
      //  - 1. ve 8. yatayda piyon zaten duramaz,
      //  - 7. yataydaki piyonun TEK hedefi terfi karesidir; bu da terfi
      //    penceresini açar ve "taşı hedefe götür" görevini kilitlerdi.
      //    (Üstelik dört terfi seçeneği aynı kareye gittiği için bu konum
      //    "en az 3 hamlesi olsun" filtresini yanıltarak geçiyordu.)
      if (type === "p" && (square[1] < "2" || square[1] > "6")) continue;

      const pieces = {};
      pieces[square] = type === "k" ? "K" : type.toUpperCase();
      // Siyah şahı uzak bir köşeye koyarız ki konum kurallara uysun.
      const blackKing = square[0] < "e" ? "h8" : "a1";
      if (blackKing === square) continue;
      pieces[blackKing] = "k";
      // Beyaz şah zaten yerleştirilmediyse ekleriz.
      if (type !== "k") {
        const whiteKing = square[0] < "e" ? "h1" : "a8";
        if (whiteKing === square || whiteKing === blackKing) continue;
        pieces[whiteKing] = "K";
      }

      const fen = toFen(pieces);
      let candidate;
      try {
        candidate = new Chess(fen);
      } catch {
        continue;
      }

      const moves = candidate.moves({ square });
      // Piyonun boş tahtada yalnızca 1-2 hamlesi vardır; ona da tek hamle yeter,
      // zaten öğretilmek istenen şey "piyon düz ilerler" kuralıdır. Diğer taşlarda
      // birkaç seçenek olsun ki hedefi bulmak gerçekten düşünmeyi gerektirsin.
      const minimumMoves = type === "p" ? 1 : 3;
      if (moves.length < minimumMoves) continue;

      return {
        chess: candidate,
        from: square,
        type,
        target: moves[Math.floor(Math.random() * moves.length)].to
      };
    }
    return null;
  }

  /** Taş haritasından FEN üretir. */
  function toFen(pieces) {
    const rows = [];
    for (let rank = 8; rank >= 1; rank -= 1) {
      let row = "";
      let empty = 0;
      for (const file of FILES) {
        const piece = pieces[`${file}${rank}`];
        if (piece) {
          if (empty) row += empty;
          empty = 0;
          row += piece;
        } else empty += 1;
      }
      if (empty) row += empty;
      rows.push(row);
    }
    return `${rows.join("/")} w - - 0 1`;
  }

  return {
    id: "tasi-surukle",
    title: "Taşı Yerine Sürükle",
    description: "Taşı parlayan hedef kareye götür. Sadece kurallara uyan hamleler kabul edilir!",
    icon: "game",
    rounds: 10,

    setup(api) {
      promptNode = el("p", { className: "target-prompt", text: "" });
      chess = new Chess();
      board = ChessBoard({
        chess,
        interactive: true,
        onMove: (move) => {
          if (move.to === target) {
            api.correct(`🎯 Harika! ${pieceName} tam hedefe gitti.`);
          } else {
            api.wrong(`Bu yasal bir hamle ama hedef ${target.toUpperCase()} karesiydi. Tekrar dene!`);
          }
          return false; // taşı yerinde bırakırız; tur zaten yenilenecek
        }
      });
      api.setStage(el("div", { className: "move-target" }, [promptNode, board.element]));
    },

    nextRound(api) {
      const setup = buildPosition();
      if (!setup) {
        api.say("Konum hazırlanamadı, sıradaki tura geçiliyor.");
        return;
      }

      chess = setup.chess;
      target = setup.target;
      pieceName = PIECE_NAMES_TR[setup.type];

      board.attach(chess);
      board.setInteractive(true);
      // Hedef kare tur boyunca parlar (showHint kendiliğinden sönerdi).
      board.setMarks([target]);

      promptNode.textContent = `${setup.from.toUpperCase()} karesindeki ${pieceName} taşını ${target.toUpperCase()} karesine götür.`;
    }
  };
}
