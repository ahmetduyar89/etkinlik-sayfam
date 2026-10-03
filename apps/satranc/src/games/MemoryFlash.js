/**
 * MemoryFlash.js — "Hızlı Hafıza"
 *
 * Tahtada birkaç taş kısa süre görünür, sonra kaybolur. Çocuk taşların
 * durduğu kareleri hatırlayıp işaretler. Satranççıların "tahtayı görme"
 * becerisini doğrudan çalıştırır; tur ilerledikçe taş sayısı artar.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";

const FILES = "abcdefgh".split("");
const EMPTY = "8/8/8/8/8/8/8/8 w - - 0 1";
const TYPES = ["N", "B", "R", "Q", "P"];

const randomSquare = () => FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);

export function createMemoryFlash() {
  let board = null;
  let promptNode = null;
  let placed = [];
  let found = [];
  let showing = false;
  let round = 0;

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
    id: "hizli-hafiza",
    title: "Hızlı Hafıza",
    description: "Taşlar birkaç saniye görünür, sonra kaybolur. Nerede olduklarını hatırla!",
    icon: "sparkles",
    rounds: 8,

    setup(api) {
      round = 0;
      promptNode = el("p", { className: "memory-prompt", text: "" });
      board = ChessBoard({
        chess: new Chess(EMPTY),
        interactive: false,
        onSquareClick: (square) => {
          // Taşlar görünürken tıklama kabul edilmez.
          if (showing) return;
          if (found.includes(square)) return;

          if (placed.includes(square)) {
            found.push(square);
            board.setMarks(found);
            if (found.length === placed.length) {
              api.correct(`🧠 Hepsini buldun! ${placed.length} taşın da yerini hatırladın.`);
            } else {
              api.say(`Doğru! ${placed.length - found.length} taş kaldı.`, "partial");
              api.sound.play("move");
            }
          } else {
            api.wrong(`${square.toUpperCase()} karesinde taş yoktu. Kalan taşları bulmaya devam et!`);
          }
        }
      });
      api.setStage(el("div", { className: "memory-flash" }, [promptNode, board.element]));
    },

    nextRound(api) {
      round += 1;
      found = [];
      board.setMarks([]);

      // Tur ilerledikçe zorluk artar: 3 taştan başlayıp 6'ya çıkar.
      const count = Math.min(3 + Math.floor((round - 1) / 2), 6);
      const pieces = {};
      placed = [];
      while (placed.length < count) {
        const square = randomSquare();
        if (pieces[square]) continue;
        pieces[square] = TYPES[Math.floor(Math.random() * TYPES.length)];
        placed.push(square);
      }

      const chess = new Chess(toFen(pieces));
      board.attach(chess);
      showing = true;
      promptNode.textContent = `${count} taşa dikkatlice bak...`;
      api.say("Taşları ezberle!");

      // Ezberleme süresi taş sayısıyla birlikte artar.
      const showMs = 1600 + count * 400;
      setTimeout(() => {
        // Taşları gizlemek için tahtayı boş konuma bağlarız.
        board.attach(new Chess(EMPTY));
        showing = false;
        promptNode.textContent = `Şimdi ${count} taşın durduğu kareleri işaretle.`;
        api.say("Hatırladığın kareleri tıkla!");
      }, showMs);
    }
  };
}
