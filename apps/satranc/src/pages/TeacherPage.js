/**
 * TeacherPage.js — "Yapay Zeka Öğretmeni" ekranı.
 *
 * Öğretmen artık ezberlenmiş cümleler döndürmez: TAHTADAKİ GERÇEK KONUMU analiz
 * eder. Çocuk iki tarafı da serbestçe oynayabilir, istediği an "Tahtayı İncele"
 * diyerek konum hakkında somut geri bildirim alır:
 *   - şah / mat durumu
 *   - korumasız (asılı) taşlar
 *   - rakibin bedava taşları
 *   - motorun önerdiği hamle ve nedeni
 *
 * Analiz src/engine/Coach.js içinde yapılır; bu sayfa yalnızca sunum katmanıdır.
 */

import { el } from "../utils/dom.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { coachPosition, answerQuestion } from "../engine/Coach.js";
import { icon } from "../components/Icon.js";
import { pageShell } from "./pageUtils.js";
import { sanTr } from "../engine/Chess.js";

/** Hazır soru düğmeleri. */
const QUICK_QUESTIONS = [
  "En iyi hamle ne?",
  "Tehlikede miyim?",
  "Mat var mı?",
  "Açılışta ne yapmalıyım?",
  "Çatal nedir?",
  "Taş değerleri neler?"
];

export function TeacherPage({ sound }) {
  const chess = new Chess();
  let busy = false;

  const chat = el("div", { className: "teacher-chat" });
  const input = el("input", {
    className: "teacher-input",
    placeholder: "Öğretmene soru sor...",
    "aria-label": "Öğretmene soru sor"
  });

  const board = ChessBoard({
    chess,
    orientation: "w",
    interactive: true,
    onMove: (move) => {
      const played = chess.move(move);
      if (!played) return false;
      sound.play("move");
      board.update({ from: played.from, to: played.to });
      addBubble(`${sanTr(played.san)} oynadım.`, "student");
      // Her hamleden sonra kısa bir yorum: sürekli konuşan bir öğretmen gibi.
      commentOnMove(played);
      return false;
    }
  });

  /* ---------------------------------------------------------------- *
   * Sohbet
   * ---------------------------------------------------------------- */

  /** Sohbete balon ekler. */
  function addBubble(text, from = "teacher") {
    const bubble = el("div", { className: `chat-bubble ${from}`, text });
    chat.append(bubble);
    chat.scrollTop = chat.scrollHeight;
    if (from === "teacher") sound.speak(text);
    return bubble;
  }

  /** "Düşünüyor" balonu — analiz sürerken gösterilir. */
  function addThinking() {
    const bubble = el("div", { className: "chat-bubble teacher thinking", text: "Tahtaya bakıyorum..." });
    chat.append(bubble);
    chat.scrollTop = chat.scrollHeight;
    return bubble;
  }

  /** Oynanan hamle hakkında kısa yorum. */
  async function commentOnMove(played) {
    if (busy) return;
    busy = true;
    const thinking = addThinking();
    try {
      const analysis = await coachPosition(chess);
      thinking.remove();

      // Oyun bittiyse ya da şah varsa bunu mutlaka söyleriz.
      const urgent = analysis.observations.find((item) => item.kind === "win" || item.kind === "danger");
      if (urgent) addBubble(`${urgent.icon} ${urgent.text}`);
      else if (played.captured) addBubble(`${sanTr(played.san)} ile taş aldın. ${analysis.summary}`);
      else addBubble(analysis.summary);
    } catch (error) {
      thinking.remove();
      addBubble("Bu konumu inceleyemedim, tekrar dener misin?");
    } finally {
      busy = false;
    }
  }

  /** Tam analiz: tüm gözlemleri sırayla yazar. */
  async function inspectBoard() {
    if (busy) return;
    busy = true;
    const thinking = addThinking();
    try {
      const analysis = await coachPosition(chess);
      thinking.remove();
      for (const observation of analysis.observations) {
        addBubble(`${observation.icon} ${observation.text}`);
      }
    } catch (error) {
      thinking.remove();
      addBubble("Bu konumu inceleyemedim, tekrar dener misin?");
    } finally {
      busy = false;
    }
  }

  /** Soru sorma. */
  async function ask(text) {
    const message = String(text || "").trim();
    if (!message || busy) return;
    busy = true;
    addBubble(message, "student");
    input.value = "";

    const thinking = addThinking();
    try {
      const answer = await answerQuestion(chess, message);
      thinking.remove();
      addBubble(answer);
      sound.play("success");
    } catch (error) {
      thinking.remove();
      addBubble("Bunu anlayamadım, başka türlü sorar mısın?");
    } finally {
      busy = false;
    }
  }

  /* ---------------------------------------------------------------- *
   * Kontroller
   * ---------------------------------------------------------------- */

  const controls = el("div", { className: "teacher-controls" }, [
    el("button", {
      className: "primary",
      type: "button",
      html: `${icon("target")} Tahtayı İncele`,
      onClick: () => {
        sound.play("click");
        inspectBoard();
      }
    }),
    el("button", {
      className: "ghost",
      type: "button",
      html: `${icon("route")} Hamleyi Geri Al`,
      onClick: () => {
        const undone = chess.undo();
        if (!undone) return;
        sound.play("click");
        board.update(null);
        addBubble(`${undone.san ? sanTr(undone.san) : "Hamle"} geri alındı.`, "student");
      }
    }),
    el("button", {
      className: "ghost",
      type: "button",
      html: `${icon("board")} Tahtayı Sıfırla`,
      onClick: () => {
        sound.play("click");
        chess.reset();
        board.attach(chess);
        addBubble("Tahtayı başlangıç konumuna kurdum. İstediğin gibi oyna, ben izliyorum!");
      }
    }),
    el("button", {
      className: "ghost",
      type: "button",
      html: `${icon("sparkles")} Tahtayı Çevir`,
      onClick: () => {
        sound.play("click");
        board.flip();
      }
    })
  ]);

  addBubble(
    "Merhaba! Ben senin satranç öğretmeninim. Tahtada istediğin gibi oyna — iki tarafı da sen oynayabilirsin. Sonra 'Tahtayı İncele' düğmesine bas, sana konumu anlatayım."
  );

  return pageShell(
    "Yapay Zeka Öğretmeni",
    "Tahtada oyna, öğretmene sor. Cevaplar ezber değil — gerçekten senin konumuna bakılarak veriliyor.",
    [
      el("section", { className: "teacher-layout" }, [
        el("div", { className: "teacher-board" }, [board.element, controls]),
        el("aside", { className: "teacher-panel" }, [
          el("h2", { text: "Sohbet" }),
          chat,
          el("div", { className: "quick-prompts" }, QUICK_QUESTIONS.map((question) =>
            el("button", {
              className: "ghost small",
              type: "button",
              text: question,
              onClick: () => {
                sound.play("click");
                ask(question);
              }
            })
          )),
          el("form", {
            className: "teacher-form",
            onSubmit: (event) => {
              event.preventDefault();
              ask(input.value);
            }
          }, [input, el("button", { className: "primary", type: "submit", text: "Sor" })])
        ])
      ])
    ],
    // Tahtalı sayfada büyük başlık ~150 piksel yer kaplıyor ve tahtayı
    // ekrandan taşırıyordu; başlık bloğu kompakt tutulur.
    { compact: true }
  );
}
