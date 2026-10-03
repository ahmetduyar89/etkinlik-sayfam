/**
 * PuzzlesPage.js — Bulmaca çözme ekranı.
 *
 * Bulmacalar `src/data/puzzles.js` dosyasından gelir ve hepsi derleme zamanında
 * kural motoruyla doğrulanmıştır (tools/generate-puzzles.mjs + verify-puzzles.mjs):
 * her birinin TEK ve kesin bir doğru ilk hamlesi vardır.
 *
 * Akış:
 *  1. Çocuk konumu görür, hedefi okur.
 *  2. Tahtada hamlesini yapar — yalnızca yasal hamleler oynanabilir.
 *  3. Doğruysa kutlama + açıklama; yanlışsa nazik geri bildirim ve tekrar deneme.
 *  4. İki hamlelik matlarda rakip cevap verir ve çocuk matı tamamlar.
 */

import { el } from "../utils/dom.js";
import { navigate, routeParam } from "../utils/router.js";
import { Chess } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { puzzles, puzzleCounts, themeCounts } from "../data/puzzles.js";
import { icon } from "../components/Icon.js";
import { burst } from "../animations/effects.js";
import { pageShell } from "./pageUtils.js";
import { sanTr } from "../engine/Chess.js";
import { PUZZLE_THEME_LABELS as THEME_LABELS, PUZZLE_THEME_NUDGES as THEME_NUDGE } from "../data/puzzleThemes.js";

const LEVELS = ["Kolay", "Orta", "Zor"];

/** "Tümü" seçeneği dahil tema listesi. */
const THEME_KEYS = ["hepsi", ...Object.keys(THEME_LABELS)];

export function PuzzlesPage({ progress, sound }) {
  const daily = routeParam("gunluk") === "1";
  const dailyThemes = String(routeParam("temalar", ""))
    .split(",")
    .filter((key) => Object.hasOwn(THEME_LABELS, key));
  if (dailyThemes.length === 0) dailyThemes.push("mat-1", "catal", "askida");
  const dailyGoal = 5;
  let dailySolved = Math.min(dailyGoal, progress.dailyCount());
  // Derin bağlantı: #/puzzles?seviye=Orta
  let level = LEVELS.includes(routeParam("seviye")) ? routeParam("seviye") : "Kolay";
  // Derin bağlantı: #/puzzles?tema=acmaz — öğretmen dersin konusuna uygun
  // bulmacaları tek tıkla açabilsin diye.
  let theme = THEME_KEYS.includes(routeParam("tema")) ? routeParam("tema") : "hepsi";
  let puzzle = null;
  let chess = null;
  let step = 0; // kaç doğru hamle yapıldı
  let solvedThisPuzzle = false;
  let attempts = 0;
  let streak = 0;
  let hintRecorded = false;
  let solutionRecorded = false;
  let nextButton = null;

  /* ---------------------------------------------------------------- *
   * Arayüz parçaları
   * ---------------------------------------------------------------- */

  const titleLine = el("h2", { className: "puzzle-title", text: "" });
  const themePill = el("span", { className: "pill", text: "" });
  const levelPill = el("span", { className: "pill level", text: "" });
  const goalLine = el("p", { className: "puzzle-goal", text: "" });
  const feedback = el("p", { className: "puzzle-feedback", text: "Tahtada hamleni yap." });

  /**
   * Geri bildirimi yazar ve sesli okur.
   *
   * Bulmacalar sistemin en büyük bölümü (1120 adet) ve tamamı yazılı geri
   * bildirim veriyor. 1-2. sınıfta çocuk henüz akıcı okuyamadığı için, ekrana
   * yazılan her açıklama aynı anda sesli de verilir; böylece bulmacaları
   * öğretmene sormadan tek başına çözebilir. (Ses, Ayarlar'daki "Sesli
   * anlatım" kapalıysa kendiliğinden susar.)
   */
  function setFeedback(text, kind = "") {
    feedback.className = `puzzle-feedback ${kind}`.trim();
    feedback.textContent = text;
    sound.speak(text);
  }
  const hintLine = el("p", { className: "puzzle-hint", hidden: "" });
  const solutionLine = el("p", { className: "puzzle-solution", hidden: "" });
  const streakLine = el("strong", { text: "0" });
  const solvedLine = el("strong", { text: "0" });
  const dailyLine = el("strong", { text: `${dailySolved}/${dailyGoal}` });

  const board = ChessBoard({
    chess: new Chess(),
    orientation: "w",
    onMove: (move) => {
      handleMove(move);
      return false; // hamleyi biz uyguluyoruz
    }
  });

  /* ---------------------------------------------------------------- *
   * Bulmaca yükleme
   * ---------------------------------------------------------------- */

  /**
   * Seçili seviye ve temadan, tercihen HENÜZ ÇÖZÜLMEMİŞ rastgele bir bulmaca seçer.
   *
   * Her tema her seviyede bulunmaz (örneğin boğmaca matının "Kolay"ı yoktur).
   * Böyle bir durumda çocuğu boş ekranla baş başa bırakmak yerine seviye
   * kısıtını gevşetir, temayı koruruz — çünkü seçilen KONU önemlidir.
   */
  function pickPuzzle() {
    const targetTheme = daily ? dailyThemes[dailySolved % dailyThemes.length] : theme;
    if (daily) theme = targetTheme;
    const byTheme = targetTheme === "hepsi" ? puzzles : puzzles.filter((item) => item.theme === targetTheme);
    let pool = byTheme.filter((item) => item.level === level);
    if (pool.length === 0) pool = byTheme;
    if (pool.length === 0) pool = puzzles;
    const unsolved = pool.filter((item) => !progress.state.solvedPuzzles.includes(item.id));
    const source = unsolved.length > 0 ? unsolved : pool;
    return source[Math.floor(Math.random() * source.length)];
  }

  /** Yeni bir bulmaca yükler ve tahtayı kurar. */
  function loadPuzzle(next = pickPuzzle()) {
    puzzle = next;
    chess = new Chess(puzzle.fen);
    step = 0;
    attempts = 0;
    solvedThisPuzzle = false;
    hintRecorded = false;
    solutionRecorded = false;

    board.attach(chess);
    board.setOrientation(puzzle.side);
    board.setInteractive(true);

    titleLine.textContent = puzzle.title;
    themePill.textContent = THEME_LABELS[puzzle.theme] || puzzle.theme;
    levelPill.textContent = puzzle.level;
    goalLine.textContent = puzzle.goal;
    feedback.textContent = "Sıra sende — en iyi hamleyi bul!";
    feedback.className = "puzzle-feedback";
    hintLine.hidden = true;
    solutionLine.hidden = true;
    if (nextButton) {
      nextButton.disabled = daily;
      nextButton.innerHTML = `${icon("puzzle")} ${daily ? "Sıradaki" : "Yeni Bulmaca"}`;
    }
    refreshStats();
  }

  /* ---------------------------------------------------------------- *
   * Hamle denetimi
   * ---------------------------------------------------------------- */

  /**
   * Oyuncunun hamlesini değerlendirir.
   *
   * İlk hamle: bulmacanın TEK doğru çözümüne eşit olmalıdır.
   * Sonraki hamleler: mat zorunlu olduğu için MAT EDEN her hamle kabul edilir
   * (rakip nasıl cevap verirse versin mat vardır; bu üreteçte kanıtlanmıştır).
   */
  function handleMove(move) {
    if (solvedThisPuzzle) return;

    // Hamleyi önce kopya üzerinde deneriz; yanlışsa gerçek konum bozulmaz.
    const probe = chess.clone();
    const played = probe.move(move);
    if (!played) {
      sound.play("error");
      board.shake(move.from);
      return;
    }

    const isFirstMove = step === 0;
    const correct = isFirstMove ? played.san === puzzle.solution : probe.isCheckmate();

    if (!correct) {
      attempts += 1;
      streak = 0;
      progress.recordPuzzleAttempt(puzzle.theme, "wrong");
      sound.play("error");
      board.shake(move.from);
      setFeedback(wrongMessage(played, probe), "wrong");
      refreshStats();
      return;
    }

    // --- Doğru hamle ---
    chess.move(move);
    step += 1;
    sound.play("success");
    board.update({ from: played.from, to: played.to });

    // Tek hamlelik bulmacalar (mateIn yok: çatal, şiş, açmaz, çifte şah, askıda
    // taş) doğru hamleyle biter. Daha önce burada tema adı sabit yazılıydı ve
    // yalnızca "catal" biliniyordu; yeni temalar eklenince bulmaca doğru
    // çözüldüğü hâlde bitmeyip rakip hamlesi beklerdi.
    if (chess.isCheckmate() || !puzzle.mateIn) {
      finishPuzzle(played);
      return;
    }

    // Mat henüz gelmedi: rakip cevap verir, çocuk matı tamamlar.
    const reply = playOpponentReply();
    setFeedback(reply
      ? `Doğru! ${sanTr(played.san)} güçlü bir hamle. Rakip ${sanTr(reply.san)} oynadı — şimdi matı tamamla.`
      : "Doğru! Devam et.", "partial");
  }

  /** Rakibin cevabını oynar (mat zorunlu olduğu için hangi cevabı seçtiği önemsizdir). */
  function playOpponentReply() {
    const replies = chess.moves();
    if (replies.length === 0) return null;
    const choice = replies[Math.floor(Math.random() * replies.length)];
    const played = chess.move({ from: choice.from, to: choice.to, promotion: choice.promotion });
    board.update({ from: played.from, to: played.to });
    return played;
  }

  /** Bulmaca çözüldüğünde ödül ve açıklama. */
  function finishPuzzle(played) {
    solvedThisPuzzle = true;
    board.setInteractive(false);

    // İpucu almadan ve hata yapmadan çözülen bulmaca seriyi büyütür.
    const clean = attempts === 0;
    if (clean) streak += 1;
    progress.recordPuzzleAttempt(puzzle.theme, "solved");
    progress.solvePuzzle(puzzle.id);
    if (daily) {
      dailySolved = Math.min(dailyGoal, progress.recordDailyPuzzle());
      if (nextButton) nextButton.disabled = false;
      if (dailySolved >= dailyGoal && nextButton) {
        nextButton.innerHTML = `${icon("sparkles")} Çalışmayı tamamla`;
      }
    }

    sound.play("badge");
    burst(feedback);

    setFeedback(clean
      ? `🎉 Harika! ${sanTr(played.san)} ile çözdün.`
      : `✅ Çözdün! ${sanTr(played.san)} doğru hamleydi.`, "correct");
    solutionLine.hidden = false;
    solutionLine.textContent = puzzle.explanation;
    refreshStats();
  }

  /** Yanlış hamlede çocuğa yol gösteren, suçlamayan geri bildirim. */
  function wrongMessage(played, after) {
    if (after.inCheck()) return `${sanTr(played.san)} şah çekiyor ama mat değil. Kaçış karelerini de kapatmalısın.`;
    if (played.captured) return `${sanTr(played.san)} bir taş alıyor ama bulmacanın çözümü bu değil. Daha güçlü bir fikir var!`;
    const nudge = THEME_NUDGE[puzzle.theme];
    if (nudge) return `${sanTr(played.san)} çözüm değil. ${nudge}`;
    return `${sanTr(played.san)} çözüm değil. Rakip şahın kaçış karelerini sayarak tekrar dene.`;
  }

  /** Üstteki sayaçları tazeler. */
  function refreshStats() {
    solvedLine.textContent = String(progress.state.solvedPuzzles.length);
    streakLine.textContent = String(streak);
    dailyLine.textContent = `${dailySolved}/${dailyGoal}`;
  }

  /* ---------------------------------------------------------------- *
   * Kontroller
   * ---------------------------------------------------------------- */

  const levelButtons = LEVELS.map((item) =>
    el("button", {
      className: `seg-button ${item === level ? "active" : ""}`,
      type: "button",
      onClick: (event) => {
        sound.play("click");
        for (const button of event.currentTarget.parentElement.children) button.classList.remove("active");
        event.currentTarget.classList.add("active");
        level = item;
        loadPuzzle();
      }
    }, [el("strong", { text: item }), el("small", { text: `${puzzleCounts[item]} adet` })])
  );

  const themeButtons = THEME_KEYS.map((key) =>
    el("button", {
      className: `chip ${key === theme ? "active" : ""}`,
      type: "button",
      title: key === "hepsi" ? "Bütün temalar" : `${THEME_LABELS[key]} — ${themeCounts[key] || 0} bulmaca`,
      text: key === "hepsi" ? "Tümü" : THEME_LABELS[key],
      onClick: (event) => {
        sound.play("click");
        for (const button of event.currentTarget.parentElement.children) button.classList.remove("active");
        event.currentTarget.classList.add("active");
        theme = key;
        loadPuzzle();
      }
    })
  );

  const controls = el("div", { className: "puzzle-controls" }, [
    el("button", {
      className: "ghost",
      type: "button",
      html: `${icon("sparkles")} İpucu`,
      onClick: () => {
        sound.play("click");
        attempts += 1; // ipucu kullanınca seri korunmaz
        if (!hintRecorded) {
          hintRecorded = true;
          progress.recordPuzzleAttempt(puzzle.theme, "hint");
        }
        hintLine.hidden = false;
        hintLine.textContent = `💡 ${puzzle.hint}`;
        sound.speak(puzzle.hint);
      }
    }),
    el("button", {
      className: "ghost",
      type: "button",
      html: `${icon("sound")} Sesli Oku`,
      onClick: () => {
        sound.play("click");
        // Görevi ve ekranda duran son geri bildirimi birlikte okur.
        // goal zaten noktayla bitiyor olabilir; çift nokta sesli okumada duraksama yapar.
        sound.speak(`${puzzle.goal.replace(/[.\s]+$/, "")}. ${feedback.textContent}`);
      }
    }),
    el("button", {
      className: "ghost",
      type: "button",
      html: `${icon("route")} Baştan Al`,
      onClick: () => {
        sound.play("click");
        loadPuzzle(puzzle);
      }
    }),
    el("button", {
      className: "ghost",
      type: "button",
      html: `${icon("target")} Çözümü Göster`,
      onClick: () => {
        sound.play("click");
        attempts += 1;
        if (!solutionRecorded) {
          solutionRecorded = true;
          progress.recordPuzzleAttempt(puzzle.theme, "hint");
        }
        solutionLine.hidden = false;
        solutionLine.textContent = `Doğru hamle: ${sanTr(puzzle.solution)} — ${puzzle.explanation}`;
        sound.speak(`Doğru hamle ${sanTr(puzzle.solution)}. ${puzzle.explanation}`);
        // Doğru hamleyi tahtada da işaretleriz.
        const probe = chess.clone();
        const move = probe.move(puzzle.solution);
        if (move) board.showHint(move.from, move.to);
      }
    }),
    nextButton = el("button", {
      className: "primary",
      type: "button",
      html: `${icon("puzzle")} ${daily ? "Sıradaki" : "Yeni Bulmaca"}`,
      onClick: () => {
        sound.play("click");
        if (daily && dailySolved >= dailyGoal) {
          navigate("daily");
          return;
        }
        loadPuzzle();
      }
    })
  ]);

  loadPuzzle();

  return pageShell(
    daily ? "Bugünkü Çalışmam" : "Bulmacalar",
    daily
      ? "Sana özel seçilen beş soruyu tamamla."
      : `${puzzles.length} doğrulanmış satranç problemi. Her bulmacanın tek bir doğru çözümü var — sen bulabilir misin?`,
    [
      el("section", { className: "puzzle-layout" }, [
        el("div", { className: "puzzle-board" }, [board.element]),
        el("aside", { className: "puzzle-panel" }, [
          el("div", { className: "puzzle-head" }, [themePill, levelPill]),
          titleLine,
          goalLine,
          el("div", { className: "puzzle-stats" }, [
            el("div", { className: "stat" }, [solvedLine, el("span", { text: "Çözülen" })]),
            el("div", { className: "stat" }, [streakLine, el("span", { text: "Seri" })]),
            daily ? el("div", { className: "stat" }, [dailyLine, el("span", { text: "Bugün" })]) : null
          ]),
          feedback,
          hintLine,
          solutionLine,
          daily ? el("p", { className: "daily-session-note", text: "Konu ve zorluk, önceki çalışmalarına göre otomatik seçiliyor." }) : el("label", { className: "panel-label", text: "Konu" }),
          daily ? null : el("div", { className: "puzzle-themes" }, themeButtons),
          daily ? null : el("label", { className: "panel-label", text: "Zorluk seviyesi" }),
          daily ? null : el("div", { className: "segmented" }, levelButtons),
          controls
        ])
      ])
    ],
    // Tahtalı sayfada büyük başlık ~150 piksel yer kaplıyor ve tahtayı
    // ekrandan taşırıyordu; başlık bloğu kompakt tutulur.
    { compact: true }
  );
}
