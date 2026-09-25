/**
 * SquareFinder.js — "Doğru Kareyi Bul"
 *
 * Ekranda bir kare adı belirir (örn. "f6") ve çocuk o kareye dokunur.
 * Koordinat okumayı otomatikleşmiş bir beceriye dönüştürmek için tasarlanmıştır:
 * son turlarda kenar koordinatları gizlenir, böylece çocuk artık ezberden değil,
 * sistemi anlayarak bulur.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";

const FILES = "abcdefgh".split("");
const EMPTY_BOARD = "8/8/8/8/8/8/8/8 w - - 0 1";

export function createSquareFinder() {
  let target = null;
  let board = null;
  let prompt = null;
  let boardHost = null;
  let round = 0;

  /** Rastgele bir kare adı üretir. */
  function randomSquare() {
    return FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);
  }

  return {
    id: "kare-bul",
    title: "Doğru Kareyi Bul",
    description: "Söylenen karenin yerini tahtada bul. Sütun harfi + satır sayısı!",
    icon: "board",
    rounds: 10,

    setup(api) {
      round = 0;
      prompt = el("div", { className: "square-prompt" }, [
        el("span", { className: "square-prompt-label", text: "Bu kareye dokun:" }),
        el("strong", { className: "square-prompt-value", text: "—" })
      ]);

      board = ChessBoard({
        chess: new Chess(EMPTY_BOARD),
        interactive: false,
        coordinates: true,
        onSquareClick: (square) => {
          if (!target) return;
          if (square === target) {
            api.correct(`🎯 Evet! ${target.toUpperCase()} tam burası.`);
            target = null;
          } else {
            api.wrong(`${square.toUpperCase()} değil. Önce ${target[0].toUpperCase()} sütununu bul, sonra ${target[1]}. satıra çık.`);
          }
        }
      });

      boardHost = el("div", { className: "square-finder" }, [prompt, board.element]);
      api.setStage(boardHost);
    },

    nextRound(api) {
      round += 1;
      target = randomSquare();
      prompt.querySelector(".square-prompt-value").textContent = target.toUpperCase();

      // Son üç turda koordinat yazıları gizlenir: asıl beceri sınavı budur.
      const hard = round > 7;
      boardHost.classList.toggle("hide-coords", hard);
      prompt.querySelector(".square-prompt-label").textContent = hard
        ? "Koordinatlar kapalı! Bu kareye dokun:"
        : "Bu kareye dokun:";
    }
  };
}
