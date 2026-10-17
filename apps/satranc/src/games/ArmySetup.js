/**
 * ArmySetup.js — "Ordunu Diz"
 *
 * Boş tahtaya bir ordunun arka sırası dizilir. Çocuk aşağıdaki taş rafından
 * bir taş seçer ve onu ait olduğu kareye koyar. Yanlış kareye konursa taş rafa
 * geri döner ve KURALI söyleyen bir ipucu verilir — ilkokul çağında en çok
 * karıştırılan iki şey ("vezir kendi rengine", "at kalenin yanında") böylece
 * ezberle değil, hatayı düzelterek öğrenilir.
 *
 * Tur ilerledikçe destek kaldırılır:
 *   1-2. tur  piyonlar tahtada + boş evler işaretli   (kolay)
 *   3-4. tur  piyon yok, işaret yok                   (orta)
 *   5-6. tur  koordinatlar da kapalı                  (zor)
 */

import { el } from "../utils/dom.js";
import { Chess, PIECE_NAMES_TR } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { pieceHTML } from "../components/PieceGlyph.js";

const FILES = "abcdefgh".split("");
const EMPTY = "8/8/8/8/8/8/8/8 w - - 0 1";

/** Başlangıç dizilişinde her sütunun sahibi. Her iki renk için de aynıdır. */
const HOME = { a: "r", b: "n", c: "b", d: "q", e: "k", f: "b", g: "n", h: "r" };

/** Rafta soldan sağa duracak sıra — aynı taşlar yan yana gelsin diye. */
const TRAY_ORDER = ["r", "n", "b", "q", "k"];

/** Diziyi karıştırır. */
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

/** "kale" → "Kale". Motorun taş adları küçük harflidir; etiket ve cümle başında büyük yazılır. */
const capitalize = (word) => word.charAt(0).toLocaleUpperCase("tr") + word.slice(1);

/**
 * Yanlış yerleştirmede söylenecek kural cümlesi.
 * Kareyi doğrudan söylemek yerine KURALI hatırlatır; çocuk kareyi kendi bulur.
 */
function hintFor(type, backRank) {
  switch (type) {
    case "r": return `Kaleler tahtanın iki köşesinde durur: a${backRank} ve h${backRank}.`;
    case "n": return `Atlar kalelerin hemen yanında durur: b${backRank} ve g${backRank}.`;
    case "b": return `Filler atların yanında, şah ile vezirin komşusudur: c${backRank} ve f${backRank}.`;
    case "q": return backRank === 1
      ? "Vezir kendi rengindeki kareye oturur: beyaz vezir açık kare olan d1'e."
      : "Vezir kendi rengindeki kareye oturur: siyah vezir koyu kare olan d8'e.";
    case "k": return `Şah, vezirin yanındaki kareye oturur: e${backRank}.`;
    default: return "Bu taş buraya ait değil.";
  }
}

export function createArmySetup() {
  let board = null;
  let host = null;
  let promptNode = null;
  let trayNode = null;

  let color = "w";
  let backRank = 1;
  let placed = {};      // kare → taş kodu ("wq")
  let remaining = [];   // rafta bekleyen taş tipleri
  let selected = null;  // rafta seçili taş tipi
  let round = 0;
  let locked = false;   // tur biterken tıklamaları yok sayar

  /** Taş haritasından FEN üretir. */
  function toFen(pieces) {
    const rows = [];
    for (let rank = 8; rank >= 1; rank -= 1) {
      let row = "";
      let empty = 0;
      for (const file of FILES) {
        const code = pieces[`${file}${rank}`];
        if (code) {
          if (empty) row += empty;
          empty = 0;
          // Kod "wq" biçimindedir: beyazlar büyük, siyahlar küçük harf.
          row += code[0] === "w" ? code[1].toUpperCase() : code[1];
        } else empty += 1;
      }
      if (empty) row += empty;
      rows.push(row);
    }
    return `${rows.join("/")} w - - 0 1`;
  }

  /** Tahtayı mevcut yerleşime göre tazeler. */
  function drawBoard() {
    board.attach(new Chess(toFen(placed)));
    // Kolay turlarda boş evler işaretlenir; bu, "arka sıra" kavramını görünür kılar.
    const scaffold = round <= 2
      ? FILES.map((file) => `${file}${backRank}`).filter((square) => !placed[square])
      : [];
    board.setMarks(scaffold);
  }

  /** Taş rafını yeniden çizer. */
  function drawTray() {
    const counts = new Map();
    for (const type of remaining) counts.set(type, (counts.get(type) || 0) + 1);

    const items = TRAY_ORDER.filter((type) => counts.has(type)).map((type) =>
      el("button", {
        className: `army-piece ${selected === type ? "selected" : ""}`,
        type: "button",
        "aria-label": `${PIECE_NAMES_TR[type]} seç`,
        "aria-pressed": selected === type ? "true" : "false",
        onClick: () => {
          selected = selected === type ? null : type;
          drawTray();
        }
      }, [
        el("span", { className: "army-piece-glyph", html: pieceHTML(color + type) }),
        el("span", { className: "army-piece-name", text: capitalize(PIECE_NAMES_TR[type]) }),
        counts.get(type) > 1
          ? el("span", { className: "army-piece-count", text: `×${counts.get(type)}` })
          : null
      ])
    );

    trayNode.replaceChildren(...items);
  }

  /** Bir kareye taş koyma denemesi. */
  function place(square, api) {
    if (locked) return;

    if (!selected) {
      api.say("Önce aşağıdaki raftan bir taş seç, sonra kareye dokun.", "partial");
      return;
    }
    if (placed[square]) {
      api.say(`${square.toUpperCase()} karesi dolu. Boş bir kare seç.`, "partial");
      return;
    }

    const type = selected;
    const correct = square[1] === String(backRank) && HOME[square[0]] === type;

    if (!correct) {
      board.shake(square);
      api.wrong(`${capitalize(PIECE_NAMES_TR[type])} ${square.toUpperCase()} karesine gitmez. ${hintFor(type, backRank)}`);
      return;
    }

    placed[square] = color + type;
    remaining.splice(remaining.indexOf(type), 1);
    // Aynı taştan kalmadıysa seçim düşer; kalıyorsa (kale, at, fil) seçili kalır
    // ki çocuk ikinciyi koymak için rafa geri dönmek zorunda kalmasın.
    if (!remaining.includes(type)) selected = null;

    drawBoard();
    drawTray();

    if (remaining.length === 0) {
      locked = true;
      api.correct(`👑 Ordu hazır! ${color === "w" ? "Beyaz" : "Siyah"} taşların hepsi doğru yerde.`);
      return;
    }

    api.sound.play("move");
    api.say(`Doğru! ${remaining.length} taş kaldı.`, "partial");
  }

  return {
    id: "ordunu-diz",
    title: "Ordunu Diz",
    description: "Taşları başlangıç karelerine yerleştir. Vezir kendi rengine oturur!",
    icon: "crown",
    rounds: 6,

    setup(api) {
      round = 0;
      promptNode = el("p", { className: "army-prompt", text: "" });
      trayNode = el("div", { className: "army-tray" });

      board = ChessBoard({
        chess: new Chess(EMPTY),
        interactive: false,
        coordinates: true,
        onSquareClick: (square) => place(square, api)
      });

      host = el("div", { className: "army-setup" }, [promptNode, board.element, trayNode]);
      api.setStage(host);
    },

    nextRound(api) {
      round += 1;
      locked = false;
      selected = null;
      placed = {};

      // Turlar beyaz–siyah diye dönüşür: iki ordunun dizilişi aynadır ve
      // çocuğun bunu kendi görmesi, ezberden çok daha kalıcıdır.
      color = round % 2 === 1 ? "w" : "b";
      backRank = color === "w" ? 1 : 8;

      // Kolay turlarda piyonlar tahtadadır; arka sıra onların önünde kurulur.
      if (round <= 2) {
        const pawnRank = color === "w" ? 2 : 7;
        for (const file of FILES) placed[`${file}${pawnRank}`] = `${color}p`;
      }

      remaining = shuffle(["r", "n", "b", "q", "k", "b", "n", "r"]);

      drawBoard();
      drawTray();

      // Son iki turda koordinatlar kapanır: artık kareyi bilerek bulmak gerekir.
      const hard = round > 4;
      host.classList.toggle("hide-coords", hard);

      const army = color === "w" ? "Beyaz" : "Siyah";
      promptNode.textContent = hard
        ? `Koordinatlar kapalı! ${army} ordunun arka sırasını diz.`
        : round <= 2
          ? `Piyonlar yerinde. ${army} ordunun arkasındaki 8 taşı diz.`
          : `Tahta bomboş. ${army} ordunun arka sırasını hafızandan diz.`;

      api.say("Raftan taş seç, sonra evine dokun!");
    }
  };
}
