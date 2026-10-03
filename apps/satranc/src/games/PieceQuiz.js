/**
 * PieceQuiz.js — "Taşı Tanı"
 *
 * Büyük bir taş sembolü gösterilir; çocuk taşın adını ya da nasıl hareket
 * ettiğini seçer. İki soru tipi dönüşümlü sorulur, böylece oyun hem tanımayı
 * hem de hareket bilgisini pekiştirir.
 */

import { el } from "../utils/dom.js";
import { PIECE_NAMES_TR } from "../engine/Chess.js";
import { pieceHTML } from "../components/PieceGlyph.js";

/** Oyunda kullanılan taşlar ve hareket açıklamaları. */
const PIECES = [
  { type: "p", name: "Piyon", move: "Düz ilerler, çapraz alır" },
  { type: "n", name: "At", move: "L şeklinde gider, taş üstünden atlar" },
  { type: "b", name: "Fil", move: "Sadece çapraz gider" },
  { type: "r", name: "Kale", move: "Düz gider: satır ve sütun" },
  { type: "q", name: "Vezir", move: "Hem düz hem çapraz, her yöne" },
  { type: "k", name: "Şah", move: "Her yöne sadece bir kare" }
];

/** Diziyi karıştırır. */
function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

export function createPieceQuiz() {
  let symbolNode = null;
  let questionNode = null;
  let optionsNode = null;

  return {
    id: "tasi-tani",
    title: "Taşı Tanı",
    description: "Taşın adını ve nasıl hareket ettiğini bil.",
    icon: "pawn",
    rounds: 10,

    setup(api) {
      symbolNode = el("div", { className: "quiz-symbol", text: "♟" });
      questionNode = el("p", { className: "quiz-question", text: "" });
      optionsNode = el("div", { className: "quiz-options" });
      api.setStage(el("div", { className: "piece-quiz" }, [symbolNode, questionNode, optionsNode]));
    },

    nextRound(api) {
      const answer = PIECES[Math.floor(Math.random() * PIECES.length)];
      // Soru tipi: adını mı yoksa hareketini mi soralım?
      const askName = Math.random() < 0.5;
      const color = Math.random() < 0.5 ? "w" : "b";

      // Şah, haçlı Unicode sembolü yerine kavuklu çizimimizle gösterilir.
      symbolNode.innerHTML = pieceHTML(color + answer.type);
      symbolNode.className = `quiz-symbol ${color === "w" ? "light-piece" : "dark-piece"}`;
      questionNode.textContent = askName ? "Bu taşın adı nedir?" : `Bu ${answer.name.toLocaleLowerCase("tr")} nasıl hareket eder?`;

      // Üç yanlış seçenek diğer taşlardan seçilir.
      const distractors = shuffle(PIECES.filter((piece) => piece.type !== answer.type)).slice(0, 3);
      const choices = shuffle([answer, ...distractors]);

      optionsNode.replaceChildren(
        ...choices.map((choice) =>
          el("button", {
            className: "quiz-option",
            type: "button",
            text: askName ? choice.name : choice.move,
            onClick: (event) => {
              if (choice.type === answer.type) {
                event.currentTarget.classList.add("correct");
                api.correct(
                  askName
                    ? `✅ Doğru, bu bir ${answer.name.toLocaleLowerCase("tr")}!`
                    : `✅ Doğru! ${answer.name}: ${answer.move.toLocaleLowerCase("tr")}.`
                );
              } else {
                event.currentTarget.classList.add("wrong");
                api.wrong(
                  askName
                    ? `Bu ${choice.name.toLocaleLowerCase("tr")} değil. İpucu: ${PIECE_NAMES_TR[answer.type]} taşına iyi bak.`
                    : `Bu ${answer.name.toLocaleLowerCase("tr")}'ın hareketi değil. Tekrar dene!`
                );
              }
            }
          })
        )
      );
    }
  };
}
