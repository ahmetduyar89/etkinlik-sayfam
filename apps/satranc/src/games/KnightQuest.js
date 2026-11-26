/**
 * KnightQuest.js — "Kaşif At"
 *
 * Tahtaya yıldızlar serpilir; at sınırlı sayıda hamleyle hepsini toplamalıdır.
 * Oyun iki şeyi aynı anda çalıştırır: atın "L" hareketi ve YOL PLANLAMA — hangi
 * yıldıza önce gitmek gerektiğini düşünmeden hamle hakkı biter.
 *
 * Hamle hakkı rastgele verilmez: her turda yıldızlar arasında en yakın komşu
 * turu hesaplanır (at mesafeleri genişlik-önce arama ile bulunur) ve buna iki
 * hamle pay eklenir. Yani her tur ÇÖZÜLEBİLİR, ama savurgan bir rota yetmez.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";

const FILES = "abcdefgh".split("");
const EMPTY = "8/8/8/8/8/8/8/8 w - - 0 1";

/** Atın sekiz sıçraması. */
const JUMPS = [
  [1, 2], [2, 1], [2, -1], [1, -2],
  [-1, -2], [-2, -1], [-2, 1], [-1, 2]
];

const randomSquare = () => FILES[Math.floor(Math.random() * 8)] + (Math.floor(Math.random() * 8) + 1);

/** Bir kareden atın gidebileceği kareler. */
function knightMoves(square) {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]) - 1;
  const result = [];
  for (const [df, dr] of JUMPS) {
    const nf = file + df;
    const nr = rank + dr;
    if (nf < 0 || nf > 7 || nr < 0 || nr > 7) continue;
    result.push(`${FILES[nf]}${nr + 1}`);
  }
  return result;
}

/** İki kare arasında atın en az kaç hamlede gittiği (genişlik-önce arama). */
function knightDistance(from, to) {
  if (from === to) return 0;
  const seen = new Set([from]);
  let frontier = [from];
  let depth = 0;
  while (frontier.length) {
    depth += 1;
    const next = [];
    for (const square of frontier) {
      for (const step of knightMoves(square)) {
        if (seen.has(step)) continue;
        if (step === to) return depth;
        seen.add(step);
        next.push(step);
      }
    }
    frontier = next;
  }
  return 99;
}

/** En yakın yıldıza gitmeyi sürdüren basit turun uzunluğu. */
function tourLength(start, stars) {
  let at = start;
  let left = [...stars];
  let total = 0;
  while (left.length) {
    let best = left[0];
    let bestDistance = knightDistance(at, best);
    for (const star of left.slice(1)) {
      const distance = knightDistance(at, star);
      if (distance < bestDistance) {
        best = star;
        bestDistance = distance;
      }
    }
    total += bestDistance;
    at = best;
    left = left.filter((square) => square !== best);
  }
  return total;
}

/** Tek atlı bir konumun FEN'i. */
function fenWithKnight(square) {
  const rows = [];
  for (let rank = 8; rank >= 1; rank -= 1) {
    let row = "";
    let empty = 0;
    for (const file of FILES) {
      if (`${file}${rank}` === square) {
        if (empty) row += empty;
        empty = 0;
        row += "N";
      } else empty += 1;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} w - - 0 1`;
}

export function createKnightQuest() {
  let board = null;
  let chess = null;
  let promptNode = null;

  let knight = null;
  let stars = [];
  let movesLeft = 0;
  let locked = false;
  let round = 0;

  /** Üstteki sayaç satırını tazeler. */
  function refresh() {
    promptNode.replaceChildren(
      el("span", { className: "quest-chip stars", text: `⭐ Kalan yıldız: ${stars.length}` }),
      el("span", { className: `quest-chip moves ${movesLeft <= 2 ? "low" : ""}`, text: `🐴 Kalan hamle: ${movesLeft}` })
    );
  }

  /** Ata dokunulan kareye sıçratmayı dener. */
  function jump(square, api) {
    if (locked) return;

    if (!knightMoves(knight).includes(square)) {
      board.shake(square);
      api.wrong("At oraya sıçrayamaz. At L çizer: iki kare düz, sonra bir kare yana.");
      return;
    }

    const from = knight;
    knight = square;
    movesLeft -= 1;

    // Aynı Chess örneği yeniden yüklenir; böylece tahta atı L yolu boyunca uçurur.
    chess.load(fenWithKnight(knight));
    board.update({ from, to: knight });

    const collected = stars.includes(knight);
    if (collected) stars = stars.filter((star) => star !== knight);
    board.setMarks(stars);
    refresh();

    if (stars.length === 0) {
      locked = true;
      api.correct(`⭐ Hepsini topladın! ${movesLeft} hamlen daha vardı.`);
      return;
    }

    if (movesLeft === 0) {
      locked = true;
      api.wrong(`Hamle hakkın bitti, ${stars.length} yıldız kaldı. En yakın yıldızdan başlamayı dene!`, { skip: true });
      return;
    }

    if (collected) {
      api.sound.play("success");
      api.say(`Yıldız senin! ${stars.length} yıldız kaldı.`, "partial");
    } else {
      api.sound.play("move");
      api.say(`${movesLeft} hamlen kaldı.`, "partial");
    }
  }

  return {
    id: "kasif-at",
    title: "Kaşif At",
    description: "Atı sıçrata sıçrata bütün yıldızları topla. Hamle hakkın sayılı!",
    icon: "knight",
    rounds: 6,

    setup(api) {
      round = 0;
      promptNode = el("div", { className: "quest-bar" });
      chess = new Chess(EMPTY);
      board = ChessBoard({
        chess,
        interactive: false,
        coordinates: true,
        onSquareClick: (square) => jump(square, api)
      });
      api.setStage(el("div", { className: "knight-quest" }, [promptNode, board.element]));
    },

    nextRound(api) {
      round += 1;
      locked = false;

      // Tur ilerledikçe yıldız sayısı 3'ten 6'ya çıkar.
      const count = Math.min(3 + Math.floor((round - 1) / 2), 6);

      knight = randomSquare();
      stars = [];
      while (stars.length < count) {
        const square = randomSquare();
        if (square === knight || stars.includes(square)) continue;
        stars.push(square);
      }

      // Hamle hakkı: makul bir rotanın uzunluğu + pay. İlk turlarda pay geniştir,
      // son turlarda daralır — yani rota planlamak giderek zorunlu hale gelir.
      const slack = round <= 2 ? 4 : round <= 4 ? 3 : 2;
      movesLeft = tourLength(knight, stars) + slack;

      chess.load(fenWithKnight(knight));
      board.attach(chess);
      board.setMarks(stars);
      refresh();

      api.say("Atı yıldızların üstüne sıçrat!");
    }
  };
}
