/**
 * MateDash.js — "Matı Bul" (süreli)
 *
 * 60 saniye içinde olabildiğince çok "tek hamlede mat" çözme yarışı.
 * Konumlar, derleme zamanında doğrulanmış bulmaca havuzundan gelir; bu yüzden
 * her sorunun kesin ve tek bir doğru cevabı vardır.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { puzzles } from "../data/puzzles.js";
import { sanTr } from "../engine/Chess.js";

/** Yalnızca tek hamlelik matlar — hızlı tempo için ideal. */
const POOL = puzzles.filter((puzzle) => puzzle.theme === "mat-1");

export function createMateDash() {
  let board = null;
  let current = null;
  let chess = null;
  let solved = false;

  return {
    id: "mati-bul",
    title: "Matı Bul",
    description: "60 saniye! Kaç tane tek hamlelik mat bulabilirsin?",
    icon: "crown",
    duration: 60,

    setup(api) {
      chess = new Chess();
      board = ChessBoard({
        chess,
        interactive: true,
        onMove: (move) => {
          if (solved) return false;

          const probe = chess.clone();
          const played = probe.move(move);
          if (!played) return false;

          if (probe.isCheckmate()) {
            solved = true;
            // Doğru hamleyi tahtada da gösteririz.
            chess.move(move);
            board.update({ from: played.from, to: played.to });
            api.correct(`⚡ Mat! ${sanTr(played.san)}`);
          } else if (probe.inCheck()) {
            api.wrong(`${sanTr(played.san)} şah çekiyor ama kaçış var. Başka bir hamle dene!`);
          } else {
            api.wrong(`${sanTr(played.san)} mat etmiyor. Şahı köşeye sıkıştıracak hamleyi ara.`);
          }
          return false;
        }
      });
      api.setStage(el("div", { className: "mate-dash" }, [board.element]));
    },

    nextRound(api) {
      current = POOL[Math.floor(Math.random() * POOL.length)];
      chess = new Chess(current.fen);
      solved = false;
      board.attach(chess);
      board.setOrientation(current.side);
      board.setInteractive(true);
      api.say("Beyaz oynar, tek hamlede mat eder!");
    }
  };
}
