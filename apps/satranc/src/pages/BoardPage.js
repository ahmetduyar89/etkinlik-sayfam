/**
 * BoardPage.js — "Satranç Tahtası" ekranı.
 *
 * Koordinat okuma, satranç öğrenmenin ilk ve en çok atlanan adımıdır. Bu sayfa
 * konuyu beş etkileşimli derse böler; çocuk her derste tahtaya dokunarak öğrenir:
 *   Kareler → Sütun & Yatay → Merkez → Kare Renkleri → Kurulum
 */

import { el } from "../utils/dom.js";
import { routeParam } from "../utils/router.js";
import { Chess, SQUARE_LIST, toAlgebraic, isLightSquare, toSquare, PIECE_NAMES_TR } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { icon } from "../components/Icon.js";
import { pieceHTML } from "../components/PieceGlyph.js";
import { pageShell } from "./pageUtils.js";

const EMPTY = "8/8/8/8/8/8/8/8 w - - 0 1";
const FILES = "abcdefgh".split("");

/** Başlangıç dizilişinde arka sıradaki her sütunun sahibi (iki renk için aynı). */
const HOME = { a: "r", b: "n", c: "b", d: "q", e: "k", f: "b", g: "n", h: "r" };

/** Kurulum rafındaki taşlar ve adetleri; raf bu sırayla dizilir. */
const TRAY = [["p", 8], ["r", 2], ["n", 2], ["b", 2], ["q", 1], ["k", 1]];

/** "kale" → "Kale". */
const capitalize = (word) => word.charAt(0).toLocaleUpperCase("tr") + word.slice(1);

/** Taş haritasından ({ e1: "wk" }) FEN üretir. */
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
        row += code[0] === "w" ? code[1].toUpperCase() : code[1];
      } else empty += 1;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} w - - 0 1`;
}

/** Taş ("wq") bu kareye mi ait? */
function belongsTo(code, square) {
  const [color, type] = code;
  const rank = square[1];
  if (type === "p") return rank === (color === "w" ? "2" : "7");
  return rank === (color === "w" ? "1" : "8") && HOME[square[0]] === type;
}

/**
 * Yanlış yerleştirmede KURALI hatırlatan cümle; kareyi çocuk kendisi bulur.
 */
function setupHint(code) {
  const [color, type] = code;
  const back = color === "w" ? 1 : 8;
  switch (type) {
    case "p": return `Piyonlar ordunun en önünde, ${color === "w" ? 2 : 7}. yatayda yan yana dizilir.`;
    case "r": return `Kaleler tahtanın köşelerinde durur: a${back} ve h${back}.`;
    case "n": return `Atlar kalelerin hemen yanında durur: b${back} ve g${back}.`;
    case "b": return `Filler atların yanında durur: c${back} ve f${back}.`;
    case "q": return color === "w"
      ? "Vezir kendi rengini sever: beyaz vezir açık kare olan d1'e oturur."
      : "Vezir kendi rengini sever: siyah vezir koyu kare olan d8'e oturur.";
    default: return `Şah, vezirin yanındaki kareye oturur: e${back}.`;
  }
}

/** Tüm kare adları. */
const ALL = SQUARE_LIST.map(toAlgebraic);

export function BoardPage({ progress, sound }) {
  // Derin bağlantı: #/board?ders=2
  let lessonIndex = Number(routeParam("ders", 0)) || 0;
  let quizTarget = null;
  let quizScore = 0;

  // Kurulum dersi: tahtaya konan taşlar ve rafta seçili taş.
  let placed = {};
  let brush = null;

  const tabRow = el("div", { className: "stage-row" });
  const status = el("p", { className: "lesson-status", text: "" });
  const infoPanel = el("aside", { className: "lesson-panel" });
  const trayNode = el("div", { className: "setup-tray", hidden: true });

  const board = ChessBoard({
    chess: new Chess(EMPTY),
    interactive: false,
    coordinates: true,
    onSquareClick: (square) => lessons[lessonIndex].onClick?.(square)
  });

  /** Durum satırını yazar. */
  function say(text, tone = "") {
    status.className = `lesson-status ${tone}`;
    status.textContent = text;
  }

  /* ---------------------------------------------------------------- *
   * Dersler
   * ---------------------------------------------------------------- */

  const lessons = [
    {
      title: "Kareler",
      heading: "Her karenin bir adı var",
      detail:
        "Kare adı önce SÜTUN harfi (a-h), sonra YATAY sayısı (1-8) ile okunur. Örneğin e4: e sütunu, 4. yatay. Tahtadaki her kareye dokunup adını gör.",
      setup() {
        board.attach(new Chess(EMPTY));
        board.setMarks([]);
        say("Bir kareye dokun ve adını öğren.");
      },
      onClick(square) {
        sound.play("move");
        board.setMarks([square]);
        const file = square[0].toUpperCase();
        const rank = square[1];
        say(`${square.toUpperCase()} — ${file} sütunu, ${rank}. yatay. ${isLightSquare(toSquare(square)) ? "Açık" : "Koyu"} kare.`, "info");
      }
    },

    {
      title: "Sütun & Yatay",
      heading: "Sütunlar dikey, yataylar yatay",
      detail:
        "Sütunlar (a'dan h'ye) aşağıdan yukarıya uzanır. Yataylar (1'den 8'e) soldan sağa uzanır. Bir kareye dokun; o karenin sütununu ve yatayını birlikte göstereyim.",
      setup() {
        board.attach(new Chess(EMPTY));
        board.setMarks([]);
        say("Bir kareye dokun; sütunu ve yatayı parlasın.");
      },
      onClick(square) {
        sound.play("move");
        const file = square[0];
        const rank = square[1];
        // Aynı sütundaki ve aynı yataydaki tüm kareleri işaretle.
        const marks = ALL.filter((name) => name[0] === file || name[1] === rank);
        board.setMarks(marks);
        say(`${file.toUpperCase()} sütunu ve ${rank}. yatay işaretlendi. Bu iki çizgi ${square.toUpperCase()} karesinde kesişiyor — kalenin gittiği yollar!`, "info");
      }
    },

    {
      title: "Merkez",
      heading: "Merkez en değerli bölgedir",
      detail:
        "d4, e4, d5 ve e5 kareleri tahtanın merkezidir. Merkezdeki taşlar daha çok kareye ulaşır: at merkezde 8 kareye gidebilirken köşede sadece 2 kareye gidebilir. Bu yüzden açılışta herkes merkezi ister.",
      setup() {
        board.attach(new Chess(EMPTY));
        board.setMarks(["d4", "e4", "d5", "e5"]);
        say("Parlayan dört kare merkezdir. Bir at koyup farkı görmek için karelere dokun.");
      },
      onClick(square) {
        // Seçilen kareye bir at koyup kaç kareye gidebildiğini gösteririz.
        sound.play("move");
        const index = FILES.indexOf(square[0]);
        const rank = Number(square[1]);
        const jumps = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
          .map(([df, dr]) => [index + df, rank + dr])
          .filter(([f, r]) => f >= 0 && f <= 7 && r >= 1 && r <= 8)
          .map(([f, r]) => `${FILES[f]}${r}`);

        board.setMarks([square, ...jumps]);
        const center = ["d4", "e4", "d5", "e5"].includes(square);
        say(
          `${square.toUpperCase()} karesindeki bir at ${jumps.length} kareye gidebilir.` +
            (center ? " Merkez! En yüksek sayı burada." : jumps.length <= 3 ? " Kenarda at çok zayıf kalıyor." : ""),
          center ? "correct" : "info"
        );
      }
    },

    {
      title: "Kare Renkleri",
      heading: "Açık ve koyu kareler",
      detail:
        "Tahtada 32 açık, 32 koyu kare vardır. Fil başladığı karenin rengini asla değiştiremez — bu yüzden herkesin bir açık kare fili, bir koyu kare fili olur. Aşağıdaki oyunu dene!",
      setup() {
        board.attach(new Chess(EMPTY));
        board.setMarks([]);
        newColorQuiz();
      },
      onClick(square) {
        if (!quizTarget) return;
        const light = isLightSquare(toSquare(square));
        const wanted = quizTarget === "light";
        if (light === wanted) {
          quizScore += 1;
          sound.play("success");
          board.setMarks([square]);
          say(`✅ Doğru! ${square.toUpperCase()} ${wanted ? "açık" : "koyu"} bir kare. Puan: ${quizScore}`, "correct");
          setTimeout(newColorQuiz, 900);
        } else {
          sound.play("error");
          board.shake(square);
          say(`${square.toUpperCase()} ${light ? "açık" : "koyu"} kare. ${wanted ? "Açık" : "Koyu"} bir kare arıyoruz!`, "wrong");
        }
      }
    },

    {
      title: "Kurulum",
      heading: "Tahta nasıl kurulur?",
      detail:
        "Altın kural: SAĞ ALT KÖŞE BEYAZ olmalı (h1 açık karedir). Kaleler köşelere, atlar yanlarına, filler onların yanına gelir. Vezir kendi rengindeki kareye oturur, şah da yanına. Piyonlar en öne dizilir. Yandaki raftan taş seç ve evine dokun!",
      tray: true,
      setup() {
        placed = {};
        brush = null;
        drawSetup();
        say("Tahta boş. Yandaki raftan bir taş seç, sonra ait olduğu kareye dokun.");
      },
      onClick(square) {
        if (!brush) {
          const code = placed[square];
          say(
            code
              ? `${square.toUpperCase()} — ${code[0] === "w" ? "beyaz" : "siyah"} ${PIECE_NAMES_TR[code[1]]}.`
              : "Önce yandaki raftan bir taş seç, sonra kareye dokun.",
            code ? "info" : ""
          );
          return;
        }
        if (placed[square]) {
          board.shake(square);
          say(`${square.toUpperCase()} karesi dolu. Boş bir kare seç.`, "wrong");
          return;
        }

        const name = capitalize(PIECE_NAMES_TR[brush[1]]);
        if (!belongsTo(brush, square)) {
          sound.play("error");
          board.shake(square);
          say(`${name} ${square.toUpperCase()} karesine gitmez. ${setupHint(brush)}`, "wrong");
          return;
        }

        placed[square] = brush;
        // Bu taştan rafta kalmadıysa seçim düşer; kalıyorsa (piyon, kale...) seçili
        // kalır ki ikincisi için rafa dönmek gerekmesin.
        if (remainingOf(brush) === 0) brush = null;
        drawSetup();

        const left = 32 - Object.keys(placed).length;
        if (left === 0) {
          sound.play("success");
          say("🎉 Harika! 32 taşın hepsi yerinde. Sağ alt köşe (h1) açık kare mi? Evet — tahta doğru kuruldu!", "correct");
          return;
        }
        sound.play("move");
        say(`✅ Doğru! ${name} ${square.toUpperCase()} karesinde. ${left} taş kaldı.`, "correct");
      }
    }
  ];

  /** Bir taştan rafta kaç tane kaldığını söyler. */
  function remainingOf(code) {
    const total = TRAY.find(([type]) => type === code[1])[1];
    return total - Object.values(placed).filter((value) => value === code).length;
  }

  /** Kurulum dersinde tahtayı ve taş rafını tazeler. */
  function drawSetup() {
    board.attach(new Chess(toFen(placed)));
    board.setMarks([]);

    const column = (color) =>
      el("div", { className: "setup-tray-column" }, [
        el("p", { className: "setup-tray-title", text: color === "w" ? "Beyaz" : "Siyah" }),
        ...TRAY.map(([type]) => {
          const code = color + type;
          const left = remainingOf(code);
          return el("button", {
            className: `setup-piece ${brush === code ? "selected" : ""}`,
            type: "button",
            disabled: left === 0 ? "" : null,
            "aria-label": `${color === "w" ? "Beyaz" : "Siyah"} ${PIECE_NAMES_TR[type]} seç, ${left} tane kaldı`,
            "aria-pressed": brush === code ? "true" : "false",
            title: capitalize(PIECE_NAMES_TR[type]),
            onClick: () => {
              sound.play("click");
              brush = brush === code ? null : code;
              drawSetup();
              if (brush) say(`${color === "w" ? "Beyaz" : "Siyah"} ${PIECE_NAMES_TR[type]} seçildi. Şimdi evine dokun.`);
            }
          }, [
            el("span", { className: "setup-piece-glyph", html: pieceHTML(code) }),
            el("span", { className: "setup-piece-count", text: `×${left}` })
          ]);
        })
      ]);

    trayNode.replaceChildren(
      el("div", { className: "setup-tray-columns" }, [column("w"), column("b")]),
      el("div", { className: "setup-tray-actions" }, [
        el("button", {
          className: "ghost small",
          type: "button",
          text: "Baştan Diz",
          onClick: () => {
            sound.play("click");
            lessons[lessonIndex].setup();
          }
        }),
        el("button", {
          className: "ghost small",
          type: "button",
          text: "Doğrusunu Göster",
          onClick: () => {
            sound.play("click");
            placed = startPlacement();
            brush = null;
            drawSetup();
            say("Başlangıç dizilişi bu. Vezir d1'de (beyaz vezir açık karede), şah e1'de, sağ alt köşe h1 açık renkte.", "info");
          }
        })
      ])
    );
  }

  /** Başlangıç dizilişinin taş haritası. */
  function startPlacement() {
    const pieces = {};
    for (const file of FILES) {
      pieces[`${file}1`] = `w${HOME[file]}`;
      pieces[`${file}2`] = "wp";
      pieces[`${file}7`] = "bp";
      pieces[`${file}8`] = `b${HOME[file]}`;
    }
    return pieces;
  }

  /** Kare rengi oyununda yeni soru üretir. */
  function newColorQuiz() {
    quizTarget = Math.random() < 0.5 ? "light" : "dark";
    board.setMarks([]);
    say(`${quizTarget === "light" ? "AÇIK" : "KOYU"} renkli bir kareye dokun. Puan: ${quizScore}`, "");
  }

  /* ---------------------------------------------------------------- *
   * Görünüm
   * ---------------------------------------------------------------- */

  function renderTabs() {
    tabRow.replaceChildren(
      ...lessons.map((lesson, index) =>
        el("button", {
          className: `stage-chip ${index === lessonIndex ? "active" : ""}`,
          type: "button",
          text: lesson.title,
          onClick: () => {
            sound.play("click");
            lessonIndex = index;
            showLesson();
          }
        })
      )
    );
  }

  function renderInfo() {
    const lesson = lessons[lessonIndex];
    infoPanel.replaceChildren(
      el("h2", { text: lesson.heading }),
      el("p", { className: "lesson-detail", text: lesson.detail }),
      el("div", { className: "panel-buttons" }, [
        el("button", {
          className: "ghost small",
          type: "button",
          html: `${icon("sound")} Sesli Anlat`,
          onClick: () => {
            sound.play("click");
            sound.speak(`${lesson.heading}. ${lesson.detail}`);
          }
        }),
        lessonIndex === lessons.length - 1
          ? el("button", {
              className: "primary small",
              type: "button",
              text: "Bu bölümü tamamladım",
              onClick: () => {
                progress.completeLesson("board-basics", 25, 2);
                sound.play("badge");
                say("🎉 Tahta bölümünü tamamladın! Artık her karenin adını biliyorsun.", "correct");
              }
            })
          : null
      ])
    );
  }

  function showLesson() {
    quizTarget = null;
    brush = null;
    trayNode.hidden = !lessons[lessonIndex].tray;
    renderTabs();
    renderInfo();
    lessons[lessonIndex].setup();
  }

  showLesson();

  return pageShell(
    "Satranç Tahtası",
    "8x8 = 64 kare. Koordinatları öğrenmek satrancın alfabesidir — her karenin adını bilmeden hamle konuşulamaz.",
    [
      el("section", { className: "lesson-layout" }, [
        el("div", { className: "lesson-main" }, [
          tabRow,
          el("div", { className: "setup-row" }, [board.element, trayNode]),
          status
        ]),
        infoPanel
      ])
    ],
    // Tahtalı sayfada büyük başlık ~150 piksel yer kaplıyor ve tahtayı
    // ekrandan taşırıyordu; başlık bloğu kompakt tutulur.
    { compact: true }
  );
}
