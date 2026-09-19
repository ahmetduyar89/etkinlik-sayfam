/**
 * PlayPage.js — "Bilgisayara Karşı Oyna" ekranı.
 *
 * Gerçek kural motoru (Chess), gerçek yapay zekâ (Ai) ve GameService üzerine kuruludur.
 * Ekranın sunduğu özellikler:
 *  - Üç zorluk seviyesi, renk seçimi, tahtayı çevirme
 *  - Sürükle-bırak ve tıkla-oyna ile yalnızca yasal hamleler
 *  - Hamleyi geri alma, ipucu, anlık değerlendirme
 *  - Her hamleden sonra yapay zekâ öğretmeninin geri bildirimi
 *  - Oyun sonunda doğruluk yüzdesi ve hata dökümü içeren rapor
 */

import { el } from "../utils/dom.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { GameService } from "../services/GameService.js";
import { LEVELS } from "../engine/Ai.js";
import { icon } from "../components/Icon.js";
import { pieceHTML, symbolHTML } from "../components/PieceGlyph.js";
import { burst } from "../animations/effects.js";
import { pageShell, focusToggle } from "./pageUtils.js";
import { sanTr } from "../engine/Chess.js";

const TIME_CONTROLS = [
  { id: "yok", label: "Süresiz", detail: "Saat yok", icon: "⚪", base: 0, increment: 0 },
  { id: "5", label: "5 dk", detail: "Yıldırım", icon: "⚡", base: 300, increment: 0 },
  { id: "10", label: "10 dk", detail: "Hızlı", icon: "🏃", base: 600, increment: 0 },
  { id: "15+10", label: "15+10", detail: "Turnuva", icon: "🏆", base: 900, increment: 10 },
  { id: "ozel", label: "Özel Süre", detail: "Kendin belirle", icon: "⚙️", base: 180, increment: 2 }
];

function clockText(ms) {
  if (ms <= 0) return "0:00";
  if (ms < 10000) return (Math.ceil(ms / 100) / 10).toFixed(1);
  const total = Math.ceil(ms / 1000);
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function PlayPage({ progress, sound }) {
  const game = new GameService({ level: "kolay", playerColor: "w" });
  let resultRecorded = false;

  /* ---------------------------------------------------------------- *
   * Arayüz parçaları
   * ---------------------------------------------------------------- */

  const statusLine = el("p", { className: "play-status", text: "Beyaz taşlarla sen başlıyorsun. İyi oyunlar!" });
  const teacherText = el("p", { className: "teacher-text", text: "Merhaba! Ben senin satranç öğretmeninim. Her hamlenden sonra sana ipucu vereceğim." });
  const teacherBubble = el("div", { className: "teacher-bubble" }, [
    el("span", { className: "teacher-avatar", text: "🦉" }),
    teacherText
  ]);
  const moveList = el("ol", { className: "move-list" });
  const capturedByPlayer = el("div", { className: "captured-row" });
  const capturedByEngine = el("div", { className: "captured-row" });
  const engineClockView = el("span", { className: "play-clock", hidden: "" });
  const playerClockView = el("span", { className: "play-clock", hidden: "" });
  const engineRow = el("div", { className: "play-board-row" }, [capturedByEngine, engineClockView]);
  const playerRow = el("div", { className: "play-board-row" }, [capturedByPlayer, playerClockView]);

  const thinkingBar = el("div", { className: "thinking-bar", hidden: "" }, [
    el("span", { className: "thinking-dot" }),
    el("span", { className: "thinking-dot" }),
    el("span", { className: "thinking-dot" }),
    el("span", { className: "thinking-label", text: "Bilgisayar düşünüyor" })
  ]);
  const reportHost = el("div", { className: "report-host" });

  /* --- Saat Durumu --- */

  let rootEl = null;
  let timeControl = TIME_CONTROLS[0];
  let customMinutes = 5;
  let customIncrement = 0;
  const clock = { w: 0, b: 0 };
  let clockSide = null;
  let clockRunning = false;
  let clockSince = 0;
  let timerId = null;
  const lowWarned = { w: false, b: false };

  function timed() {
    return timeControl.base > 0;
  }

  function remaining(color) {
    let left = clock[color];
    if (clockRunning && clockSide === color) left -= Date.now() - clockSince;
    return Math.max(0, left);
  }

  function holdClock() {
    if (clockRunning && clockSide) {
      clock[clockSide] = Math.max(0, clock[clockSide] - (Date.now() - clockSince));
    }
    clockRunning = false;
  }

  function passClock(color) {
    holdClock();
    clockSide = color;
    clockSince = Date.now();
    clockRunning = true;
    paintClocks();
  }

  function pressClock(mover) {
    if (!timed()) return;
    holdClock();
    clock[mover] += timeControl.increment * 1000;
    passClock(mover === "w" ? "b" : "w");
  }

  function resetClocks() {
    if (timerId) clearInterval(timerId);
    clock.w = timeControl.base * 1000;
    clock.b = timeControl.base * 1000;
    clockSide = null;
    clockRunning = false;
    lowWarned.w = false;
    lowWarned.b = false;
    paintClocks();
  }

  function startTicking() {
    if (timerId) clearInterval(timerId);
    if (!timed()) return;
    timerId = setInterval(() => {
      if (rootEl && !rootEl.isConnected) {
        clearInterval(timerId);
        return;
      }
      paintClocks();
      if (clockRunning && clockSide && remaining(clockSide) <= 0) {
        flagFall(clockSide);
      }
    }, 100);
  }

  function flagFall(color) {
    holdClock();
    clock[color] = 0;
    paintClocks();
    board.setInteractive(false);

    const isPlayer = color === game.playerColor;
    const msg = isPlayer
      ? "Süre bitti! Zamanın tükendi."
      : "Süre bitti! Bilgisayarın zamanı tükendi, oyunu kazandın!";
    statusLine.textContent = msg;
    say(msg);

    if (!resultRecorded) {
      resultRecorded = true;
      const outcome = isPlayer ? "lost" : "won";
      progress.finishGame(outcome);
      sound.play(outcome === "won" ? "badge" : "error");
      if (outcome === "won") burst(statusLine);
    }
    showReport({ over: true, reason: msg, winner: isPlayer ? game.engineColor : game.playerColor });
  }

  function paintClocks() {
    const show = timed();
    engineClockView.hidden = !show;
    playerClockView.hidden = !show;
    if (!show) return;

    const playerLeft = remaining(game.playerColor);
    const engineLeft = remaining(game.engineColor);

    playerClockView.textContent = clockText(playerLeft);
    playerClockView.classList.toggle("running", clockRunning && clockSide === game.playerColor);
    playerClockView.classList.toggle("low", playerLeft <= 60000 && playerLeft > 10000);
    playerClockView.classList.toggle("critical", playerLeft <= 10000);

    engineClockView.textContent = clockText(engineLeft);
    engineClockView.classList.toggle("running", clockRunning && clockSide === game.engineColor);
    engineClockView.classList.toggle("low", engineLeft <= 60000 && engineLeft > 10000);
    engineClockView.classList.toggle("critical", engineLeft <= 10000);

    if (playerLeft <= 10000 && clockRunning && clockSide === game.playerColor && !lowWarned[game.playerColor]) {
      lowWarned[game.playerColor] = true;
      sound.play("error");
    }
  }

  const board = ChessBoard({
    chess: game.chess,
    orientation: "w",
    onMove: (move) => {
      handlePlayerMove(move);
      // Hamleyi motora biz uyguluyoruz; bileşen kendi kendine ilerletmesin.
      return false;
    }
  });

  /* ---------------------------------------------------------------- *
   * Oyun akışı
   * ---------------------------------------------------------------- */

  /** Oyuncunun hamlesi: uygula, değerlendir, sonra bilgisayarı oynat. */
  async function handlePlayerMove(move) {
    if (!game.isPlayerTurn()) {
      say("Sıra sende değil, bilgisayarın hamlesini bekle.");
      return;
    }

    const result = await game.playerMove(move);
    if (!result.ok) {
      sound.play("error");
      board.shake(move.from);
      say(result.reason);
      return;
    }

    sound.play(result.move.captured ? "success" : "move");
    board.update(game.lastMove);
    appendMove(result.move, result.report);
    say(result.report.advice);
    refresh();

    if (await checkGameOver()) {
      holdClock();
      return;
    }
    pressClock(game.playerColor);
    await runEngine();
  }

  /** Bilgisayarın hamlesi. */
  async function runEngine() {
    board.setInteractive(false);
    thinkingBar.hidden = false;
    statusLine.textContent = "Bilgisayar düşünüyor...";

    const result = await game.engineMove();

    thinkingBar.hidden = true;
    if (result.ok) {
      sound.play("move");
      board.update(game.lastMove);
      appendMove(result.move, null);
    }

    refresh();
    if (await checkGameOver()) {
      holdClock();
      return;
    }
    pressClock(game.engineColor);
    board.setInteractive(true);
  }

  /** Oyun bittiyse raporu gösterir; bittiğinde true döner. */
  async function checkGameOver() {
    const status = game.status();
    if (!status.over) return false;

    holdClock();
    board.setInteractive(false);
    statusLine.textContent = status.reason;
    say(status.reason);

    if (!resultRecorded) {
      resultRecorded = true;
      const outcome = status.winner === null ? "drawn" : status.winner === game.playerColor ? "won" : "lost";
      progress.finishGame(outcome);
      sound.play(outcome === "won" ? "badge" : "success");
      if (outcome === "won") burst(statusLine);
    }

    showReport(status);
    return true;
  }

  /** Oyun sonu raporunu çizer. */
  function showReport(status) {
    const report = game.report();
    const rows = [
      ["brilliant", "Muhteşem", "✨"],
      ["best", "En İyi", "⭐"],
      ["good", "İyi", "👍"],
      ["inaccuracy", "Küçük Hata", "🤔"],
      ["mistake", "Hata", "⚠️"],
      ["blunder", "Büyük Hata", "💥"]
    ].filter(([key]) => report.counts[key] > 0);

    reportHost.replaceChildren(
      el("section", { className: "game-report" }, [
        el("h3", { text: status.reason }),
        el("div", { className: "accuracy-ring", style: `--value:${report.accuracy}` }, [
          el("strong", { text: `%${report.accuracy}` }),
          el("span", { text: "doğruluk" })
        ]),
        el("p", { className: "report-text", text: report.text }),
        el("div", { className: "report-rows" }, rows.map(([key, label, emoji]) =>
          el("div", { className: `report-row ${key}` }, [
            el("span", { className: "report-emoji", text: emoji }),
            el("span", { className: "report-label", text: label }),
            el("strong", { text: String(report.counts[key]) })
          ])
        )),
        report.best?.san ? el("p", { className: "report-note", text: `En iyi hamlen: ${sanTr(report.best.san)} ⭐` }) : null,
        report.worst && report.worst.loss > 120 && report.worst.bestSan
          ? el("p", { className: "report-note", text: `Çalışılacak hamle: ${sanTr(report.worst.san)} — burada ${sanTr(report.worst.bestSan)} daha güçlüydü.` })
          : null,
        el("button", { className: "primary", type: "button", text: "Yeni Oyun", onClick: () => startNewGame() })
      ])
    );
  }

  /** Yeni oyun kurar. */
  async function startNewGame({ level = game.level.id, playerColor = game.playerColor } = {}) {
    game.newGame({ level, playerColor });
    resultRecorded = false;
    reportHost.replaceChildren();
    moveList.replaceChildren();
    // GameService yeni bir Chess örneği ürettiği için tahtayı yeni konuma bağlarız.
    board.attach(game.chess);
    board.setOrientation(playerColor);
    board.update(null);
    board.setInteractive(true);
    say("Yeni oyun başladı. Merkezi kontrol etmeyi ve taşlarını geliştirmeyi unutma!");
    refresh();

    resetClocks();
    if (timed()) {
      passClock("w");
      startTicking();
    }

    // Oyuncu siyahsa bilgisayar başlar.
    if (playerColor === "b") await runEngine();
  }

  /* ---------------------------------------------------------------- *
   * Yardımcılar
   * ---------------------------------------------------------------- */

  /** Öğretmen balonuna metin yazar ve sesli anlatım açıksa okur. */
  function say(text) {
    if (!text) return;
    teacherText.textContent = text;
    sound.speak(text); // ayar denetimi SoundService.speak içinde
  }

  /** Hamle listesine yeni satır ekler. */
  function appendMove(move, report) {
    const item = el("li", { className: `move-item ${move.color === "w" ? "white" : "black"}` }, [
      el("span", { className: "move-san", text: sanTr(move.san) }),
      report?.classification
        ? el("span", {
            className: "move-tag",
            style: `--tag:${report.classification.color}`,
            title: report.classification.label,
            text: report.classification.emoji
          })
        : null
    ]);
    moveList.append(item);
    moveList.scrollTop = moveList.scrollHeight;
  }

  /** Durum çubuğunu, materyal farkını ve alınan taşları tazeler. */
  function refresh() {
    const summary = game.summary();

    if (!game.finished) {
      statusLine.textContent = summary.check
        ? "Şah! Şahını kurtaracak bir hamle yap."
        : summary.turn === game.playerColor
          ? `Sıra sende — ${summary.material.text}`
          : "Bilgisayar düşünüyor...";
    }

    renderCaptured(capturedByPlayer, summary.captured[game.engineColor], game.engineColor, "Aldığın taşlar");
    renderCaptured(capturedByEngine, summary.captured[game.playerColor], game.playerColor, "Kaybettiğin taşlar");
  }

  /** Alınan taşları sembollerle listeler. */
  function renderCaptured(host, list, color, label) {
    host.replaceChildren(
      el("span", { className: "captured-label", text: label }),
      ...(list.length === 0
        ? [el("span", { className: "captured-empty", text: "—" })]
        : list.map((type) => el("span", { className: "captured-piece", html: pieceHTML(color + type) })))
    );
  }

  /* ---------------------------------------------------------------- *
   * Kontrol paneli
   * ---------------------------------------------------------------- */

  /** Bir segment grubunda tıklanan düğmeyi etkin hale getirir. */
  function activate(event) {
    for (const button of event.currentTarget.parentElement.children) button.classList.remove("active");
    event.currentTarget.classList.add("active");
  }

  const levelButtons = Object.values(LEVELS).map((level) =>
    el("button", {
      className: `seg-button ${level.id === "kolay" ? "active" : ""}`,
      type: "button",
      title: `${level.label} — ${level.elo} · ${level.description}`,
      onClick: (event) => {
        sound.play("click");
        activate(event);
        startNewGame({ level: level.id });
      }
    }, [el("strong", { text: level.label }), el("small", { text: level.elo })])
  );

  const colorButtons = [
    ["w", "Beyaz", "♔"],
    ["b", "Siyah", "♚"]
  ].map(([color, label, symbol]) =>
    el("button", {
      className: `seg-button ${color === "w" ? "active" : ""}`,
      type: "button",
      title: `${label} taşlarla oyna`,
      onClick: (event) => {
        sound.play("click");
        activate(event);
        startNewGame({ playerColor: color });
      }
    }, [el("strong", { html: symbolHTML(symbol) }), el("small", { text: label })])
  );

  /**
   * Sık kullanılan eylemler yalnızca SİMGE düğmesidir; etiket ipucu olarak
   * görünür. Böylece panel dar kalır ve tahtaya daha çok yer kalır.
   */
  function toolButton(iconName, label, handler) {
    return el("button", {
      className: "tool-button",
      type: "button",
      title: label,
      "aria-label": label,
      onClick: handler,
      html: icon(iconName)
    });
  }

  const controls = el("div", { className: "play-tools" }, [
    toolButton("sparkles", "İpucu", async () => {
      sound.play("click");
      const hint = await game.hint();
      if (!hint) return;
      board.showHint(hint.from, hint.to);
      say(hint.text);
    }),
    toolButton("route", "Hamleyi geri al", () => {
      if (!game.undo()) return;
      sound.play("click");
      resultRecorded = false;
      reportHost.replaceChildren();
      // Hamle listesini motorun geçmişiyle eşitle.
      while (moveList.children.length > game.chess.getHistory().length) moveList.lastChild.remove();
      board.update(game.lastMove);
      board.setInteractive(true);
      if (timed()) {
        holdClock();
        passClock(game.playerColor);
      }
      say("Hamleyi geri aldık. Bu sefer daha dikkatli bak!");
      refresh();
    }),
    toolButton("target", "Konumu değerlendir", async () => {
      sound.play("click");
      say(await game.evaluationText());
    }),
    toolButton("board", "Tahtayı çevir", () => {
      sound.play("click");
      board.flip();
    }),
    toolButton("game", "Yeni oyun", () => {
      sound.play("click");
      startNewGame();
    })
  ]);

  /* ---------------------------------------------------------------- *
   * Tam ekran (odak) modu
   * ---------------------------------------------------------------- */

  // Tam ekran düğmesi ve Esc kısayolu pageUtils'te ortaktır;
  // iki kişilik oyun ekranı da aynı davranışı kullanır.
  const focusButton = focusToggle(sound);

  /* ---------------------------------------------------------------- *
   * Katlanabilir ayarlar (seviye + renk + süre)
   * ---------------------------------------------------------------- */

  const timeNote = el("p", { className: "play-time-note" });

  function timeHint() {
    if (!timed()) return "Saat kapalı: istediğin kadar düşünebilirsin.";
    const mins = Math.floor(timeControl.base / 60);
    const secs = timeControl.base % 60;
    const baseStr = secs > 0 ? `${mins} dk ${secs} sn` : `${mins} dakika`;
    const base = `Her iki tarafa ${baseStr}. Süresi biten oyunu kaybeder.`;
    return timeControl.increment > 0
      ? `${base} Her hamleden sonra saate ${timeControl.increment} saniye eklenir.`
      : base;
  }

  const minutesInput = el("input", {
    className: "custom-time-input",
    type: "number",
    min: "1",
    max: "180",
    value: String(customMinutes),
    "aria-label": "Süre dakika",
    onInput: (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 1) {
        customMinutes = Math.min(180, val);
        applyCustomTime();
      }
    }
  });

  const incrementInput = el("input", {
    className: "custom-time-input",
    type: "number",
    min: "0",
    max: "60",
    value: String(customIncrement),
    "aria-label": "Ekleme saniye",
    onInput: (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 0) {
        customIncrement = Math.min(60, val);
        applyCustomTime();
      }
    }
  });

  const minuteChips = [1, 3, 5, 7, 10, 15, 20, 30].map((m) =>
    el("button", {
      className: "custom-chip",
      type: "button",
      text: `${m} dk`,
      onClick: () => {
        sound.play("click");
        setCustomMinutes(m);
      }
    })
  );

  const incrementChips = [0, 1, 2, 5, 10].map((s) =>
    el("button", {
      className: "custom-chip",
      type: "button",
      text: `+${s} sn`,
      onClick: () => {
        sound.play("click");
        setCustomIncrement(s);
      }
    })
  );

  function updateCustomInputs() {
    minutesInput.value = String(customMinutes);
    incrementInput.value = String(customIncrement);
    minuteChips.forEach((chip, i) => {
      chip.classList.toggle("active", [1, 3, 5, 7, 10, 15, 20, 30][i] === customMinutes);
    });
    incrementChips.forEach((chip, i) => {
      chip.classList.toggle("active", [0, 1, 2, 5, 10][i] === customIncrement);
    });
  }

  const customTimeBox = el("div", { className: "duel-custom-time", hidden: "" }, [
    el("div", { className: "custom-time-group" }, [
      el("div", { className: "custom-time-label" }, [
        el("span", { text: "⏱ Ana Süre" }),
        el("span", { className: "custom-time-unit", text: "dakika" })
      ]),
      el("div", { className: "custom-time-stepper" }, [
        el("button", {
          className: "custom-time-btn",
          type: "button",
          text: "−",
          title: "1 dakika azalt",
          onClick: () => {
            sound.play("click");
            setCustomMinutes(customMinutes - 1);
          }
        }),
        minutesInput,
        el("button", {
          className: "custom-time-btn",
          type: "button",
          text: "+",
          title: "1 dakika artır",
          onClick: () => {
            sound.play("click");
            setCustomMinutes(customMinutes + 1);
          }
        })
      ]),
      el("div", { className: "custom-time-chips" }, minuteChips)
    ]),
    el("div", { className: "custom-time-group" }, [
      el("div", { className: "custom-time-label" }, [
        el("span", { text: "⚡ Hamle Başına Ekleme" }),
        el("span", { className: "custom-time-unit", text: "saniye" })
      ]),
      el("div", { className: "custom-time-stepper" }, [
        el("button", {
          className: "custom-time-btn",
          type: "button",
          text: "−",
          title: "1 saniye azalt",
          onClick: () => {
            sound.play("click");
            setCustomIncrement(customIncrement - 1);
          }
        }),
        incrementInput,
        el("button", {
          className: "custom-time-btn",
          type: "button",
          text: "+",
          title: "1 saniye artır",
          onClick: () => {
            sound.play("click");
            setCustomIncrement(customIncrement + 1);
          }
        })
      ]),
      el("div", { className: "custom-time-chips" }, incrementChips)
    ])
  ]);

  const customBadge = el("span", {
    className: "custom-opt-badge",
    text: `${customMinutes} dk` + (customIncrement > 0 ? ` + ${customIncrement} sn` : "")
  });

  function updateCustomBadge() {
    customBadge.textContent = `${customMinutes} dk` + (customIncrement > 0 ? ` + ${customIncrement} sn` : "");
  }

  function applyCustomTime() {
    timeControl = {
      id: "ozel",
      label: "Özel Süre",
      detail: `${customMinutes} dk`,
      base: Math.max(1, customMinutes) * 60,
      increment: Math.max(0, customIncrement)
    };
    for (const button of timeButtonsContainer.children) {
      button.classList.toggle("active", button.dataset.time === "ozel");
    }
    customTimeBox.hidden = false;
    updateCustomInputs();
    updateCustomBadge();
    startNewGame();
    timeNote.textContent = timeHint();
  }

  function setCustomMinutes(val) {
    customMinutes = Math.min(180, Math.max(1, Number(val) || 1));
    applyCustomTime();
  }

  function setCustomIncrement(val) {
    customIncrement = Math.min(60, Math.max(0, Number(val) || 0));
    applyCustomTime();
  }

  const timeButtonsContainer = el("div", { className: "duel-time-grid" });

  const timeButtons = TIME_CONTROLS.map((option) => {
    if (option.id === "ozel") {
      return el("button", {
        className: `time-btn custom-opt ${option.id === timeControl.id ? "active" : ""}`,
        type: "button",
        "data-time": "ozel",
        title: "Özel süre — istediğin dakikayı kendin belirle",
        onClick: () => {
          sound.play("click");
          applyCustomTime();
        }
      }, [
        el("div", { className: "custom-opt-left" }, [
          el("span", { className: "time-btn-icon", text: option.icon }),
          el("div", { className: "custom-opt-texts" }, [
            el("strong", { text: "Özel Süre" }),
            el("small", { text: "İstediğin süreyi belirle" })
          ])
        ]),
        customBadge
      ]);
    }

    return el("button", {
      className: `time-btn ${option.id === timeControl.id ? "active" : ""}`,
      type: "button",
      "data-time": option.id,
      title: `${option.label} — ${option.detail}`,
      onClick: (event) => {
        sound.play("click");
        timeControl = option;
        customTimeBox.hidden = true;
        if (option.base > 0) {
          customMinutes = Math.floor(option.base / 60);
          customIncrement = option.increment;
          updateCustomInputs();
          updateCustomBadge();
        }
        for (const button of timeButtonsContainer.children) {
          button.classList.toggle("active", button.dataset.time === option.id);
        }
        startNewGame();
        timeNote.textContent = timeHint();
      }
    }, [
      el("div", { className: "time-btn-head" }, [
        el("span", { className: "time-btn-icon", text: option.icon }),
        el("strong", { text: option.label })
      ]),
      el("small", { text: option.detail })
    ]);
  });
  timeButtonsContainer.append(...timeButtons);
  timeNote.textContent = timeHint();

  const settingsBody = el("div", { className: "play-settings-body" }, [
    el("label", { className: "panel-label", text: "Zorluk" }),
    el("div", { className: "segmented" }, levelButtons),
    el("label", { className: "panel-label", text: "Rengin" }),
    el("div", { className: "segmented" }, colorButtons),
    el("label", { className: "panel-label", text: "Satranç saati" }),
    timeButtonsContainer,
    customTimeBox,
    timeNote
  ]);

  const settingsBox = el("details", { className: "play-settings" }, [
    el("summary", { text: "⚙️ Oyun ayarları" }),
    settingsBody
  ]);

  refresh();

  // Oyun ekranında başlık kompakt: dikey alan tahtaya gitsin.
  rootEl = pageShell(
    "Bilgisayara Karşı Oyna",
    "Gerçek satranç kurallarıyla oyna.",
    [
      el("section", { className: "play-layout" }, [
        el("div", { className: "play-board" }, [
          engineRow,
          board.element,
          playerRow,
          thinkingBar
        ]),
        el("aside", { className: "play-panel" }, [
          el("div", { className: "panel-top" }, [controls, focusButton]),
          statusLine,
          teacherBubble,
          settingsBox,
          moveList,
          reportHost
        ])
      ])
    ],
    { compact: true }
  );

  return rootEl;
}
