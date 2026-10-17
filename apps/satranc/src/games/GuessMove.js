/**
 * GuessMove.js — "Hamleyi Tahmin Et"
 *
 * Konum gösterilir ve üç aday hamle sunulur: biri doğrulanmış en iyi hamle,
 * ikisi gerçek ama zayıf yasal hamlelerdir. Çocuk tahtaya dokunmadan, sadece
 * bakarak karar vermeyi öğrenir — bu, hesaplama becerisinin temelidir.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { puzzles } from "../data/puzzles.js";
import { sanTr } from "../engine/Chess.js";

const POOL = puzzles.filter((puzzle) => puzzle.theme === "mat-1" || puzzle.theme === "catal");

const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

export function createGuessMove() {
  let board = null;
  let chess = null;
  let optionsNode = null;

  return {
    id: "hamleyi-tahmin",
    title: "Hamleyi Tahmin Et",
    description: "Üç hamleden en güçlüsünü seç. Tahtaya dokunmadan düşün!",
    icon: "target",
    rounds: 8,

    setup(api) {
      chess = new Chess();
      board = ChessBoard({ chess, interactive: false });
      optionsNode = el("div", { className: "guess-options" });
      api.setStage(el("div", { className: "guess-move" }, [board.element, optionsNode]));
    },

    nextRound(api) {
      // En az iki alternatif hamlesi olan bir konum bulana kadar deneriz.
      // (Özyineleme yerine döngü: havuz uygunsuz olsa bile takılıp kalmaz.)
      let puzzle = null;
      let others = [];
      for (let attempt = 0; attempt < 25; attempt += 1) {
        const candidate = POOL[Math.floor(Math.random() * POOL.length)];
        const probe = new Chess(candidate.fen);
        const alternatives = probe
          .moves()
          .filter((move) => move.san !== candidate.solution)
          .map((move) => move.san);
        if (alternatives.length >= 2) {
          puzzle = candidate;
          others = alternatives;
          break;
        }
      }
      if (!puzzle) {
        api.say("Uygun konum bulunamadı, sıradaki tura geçiliyor.");
        return;
      }

      chess = new Chess(puzzle.fen);
      board.attach(chess);
      board.setOrientation(puzzle.side);

      const wrong = shuffle(others).slice(0, 2);
      const choices = shuffle([puzzle.solution, ...wrong]);

      optionsNode.replaceChildren(
        ...choices.map((san) =>
          el("button", {
            className: "guess-option",
            type: "button",
            text: sanTr(san), // etiket Türkçe; karşılaştırma aşağıda uluslararası san ile
            onClick: (event) => {
              if (san === puzzle.solution) {
                event.currentTarget.classList.add("correct");
                // Doğru hamleyi tahtada oynatıp sonucu gösteririz.
                const played = chess.move(san);
                if (played) board.update({ from: played.from, to: played.to });
                api.correct(`✅ Evet! ${sanTr(san)} — ${puzzle.explanation}`);
              } else {
                event.currentTarget.classList.add("wrong");
                api.wrong(`${sanTr(san)} en güçlü hamle değil. Şaha ve savunmasız taşlara bak.`);
              }
            }
          })
        )
      );

      api.say("Hangi hamle en güçlü?");
    }
  };
}
