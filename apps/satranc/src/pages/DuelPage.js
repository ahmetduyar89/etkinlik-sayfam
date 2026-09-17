/**
 * DuelPage.js — "İki Kişilik Oyun": iki öğrenci aynı ekranda karşı karşıya.
 *
 * Sınıfta iki çocuk tahtaya kalkar ve birbirleriyle oynar. Ekran iki aşamalıdır:
 *
 *  1) KURULUM — Tahta BOŞ gelir. Çocuklar taşları kendileri dizer: paletten bir
 *     taş seçilir, tahtada konulacak kareye dokunulur. "Standart Diziliş" düğmesi
 *     hazır kuruluşu getirir; öğretmen isterse yalnızca birkaç taşlı bir oyun
 *     sonu konumu da kurdurabilir.
 *
 *  2) OYUN — İki düzen seçeneği vardır:
 *       • Tek Tahta   : iki oyuncu aynı tahtayı paylaşır (istenirse her hamlede
 *                       tahta otomatik çevrilir).
 *       • İki Tahta   : AYNI SAYFADA yan yana iki tahta. Soldaki tahta beyaz
 *                       oyuncuyu, sağdaki siyah oyuncuyu temsil eder ve her biri
 *                       kendi oyuncusunun gözünden çizilir. İki tahta TEK konumu
 *                       paylaşır: birinde yapılan hamle diğerinde anında görünür.
 *
 * Oyunun üstünde bir SKOR TAHTASI durur: iki satranç saati, materyal farkı ve
 * maç skoru. Üçü de gerçek satrançtan gelir — saat turnuvanın vazgeçilmez
 * aracıdır, materyal puanı (piyon 1, at/fil 3, kale 5, vezir 9) çocuğun "kim
 * önde?" sorusunu kendi kendine yanıtlamasını sağlar, maç skoru ise arka arkaya
 * oynanan oyunları turnuvadaki gibi 1 / ½ / 0 olarak toplar.
 *
 * Bilgisayar yoktur, yapay zekâ yoktur; kuralları yine kendi motorumuz denetler.
 */

import { el } from "../utils/dom.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { Chess, PIECE_NAMES_TR, sanTr } from "../engine/Chess.js";
import { SIMPLE_VALUES } from "../engine/Evaluator.js";
import { icon } from "../components/Icon.js";
import { pieceHTML } from "../components/PieceGlyph.js";
import { burst } from "../animations/effects.js";
import { pageShell, focusToggle } from "./pageUtils.js";
import { navigate, routeParam } from "../utils/router.js";
import { classroom } from "../services/ClassroomService.js";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

/** Kurulumun başladığı boş tahta. */
const EMPTY_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

/** Palet sırası: önce güçlü taşlar, sonda piyon — ders kitaplarındaki sıra. */
const PALETTE_TYPES = ["k", "q", "r", "b", "n", "p"];

const COLOR_NAMES = { w: "Beyaz", b: "Siyah" };

/**
 * Satranç saati seçenekleri.
 *
 * Gerçek satrançta her oyuncunun KENDİ süresi vardır: hamleni yapıp saate
 * basınca senin saatin durur, rakibinin saati işlemeye başlar. Turnuva
 * temposu "15+10" gibi yazılır — 15 dakika süre, her hamleden sonra 10 saniye
 * EKLEME (Fischer eklemesi). Ekleme, son saniyelerde bile hamleyi tahtaya
 * koyacak kadar zaman bırakır; çocuk oyunlarında bu, "süre bitti" ile biten
 * oyunların sayısını belirgin biçimde azaltır.
 */
const TIME_CONTROLS = [
  { id: "yok", label: "Süresiz", detail: "Saat yok", icon: "⚪", base: 0, increment: 0 },
  { id: "5", label: "5 dk", detail: "Yıldırım", icon: "⚡", base: 300, increment: 0 },
  { id: "10", label: "10 dk", detail: "Hızlı", icon: "🏃", base: 600, increment: 0 },
  { id: "15+10", label: "15+10", detail: "Turnuva", icon: "🏆", base: 900, increment: 10 },
  { id: "ozel", label: "Özel Süre", detail: "Kendin belirle", icon: "⚙️", base: 180, increment: 2 }
];

/** Maç puanını satranç geleneğine göre yazar: 0.5 → "½", 1.5 → "1½". */
function scoreText(value) {
  const whole = Math.floor(value);
  if (value - whole < 0.5) return String(whole);
  return whole === 0 ? "½" : `${whole}½`;
}

/**
 * Kalan süreyi saat gibi yazar.
 * Son 10 saniyede onda birler görünür — gerçek dijital satranç saatleri de
 * tam orada saliseye geçer, çünkü son saniyeler oyunun en gergin anıdır.
 */
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

/** Standart başlangıç dizilişini kare → taş kodu haritası olarak verir. */
function standardSetup() {
  const setup = new Map();
  for (const [square, piece] of Object.entries(new Chess().pieceMap())) {
    setup.set(square, piece.color + piece.type);
  }
  return setup;
}

export function DuelPage({ sound }) {
  /* ---------------------------------------------------------------- *
   * Durum
   * ---------------------------------------------------------------- */

  /** İki tahta da BU konumu paylaşır; eşitlemenin sırrı budur. */
  const chess = new Chess(EMPTY_FEN);

  /** Kurulum sırasındaki taş yerleşimi: "e1" → "wk". */
  let setup = new Map();

  let layout = "dual"; // "dual" (yan yana iki tahta) | "single" (tek tahta)
  let phase = "setup"; // "setup" (taşları diz) | "play" (oyna)
  let brush = "wp"; // paletten seçili taş, ya da "erase"
  let startTurn = "w"; // kurulum bitince ilk hamleyi kim yapacak
  let singleOrientation = "w"; // tek tahta düzeninde tahtanın yönü
  let autoFlip = false; // tek tahtada her hamleden sonra çevir
  let startFen = ""; // oyunun başladığı konum ("aynı dizilişle yeniden" için)
  let finished = false; // sonuç kartı bir kez gösterilsin

  const names = { w: "Beyaz Oyuncu", b: "Siyah Oyuncu" };

  /* --- Sınıf ve turnuva kaydı --- */

  /** Seçili öğrencilerin kimlikleri; misafir oyuncu için null. */
  const players = { w: null, b: null };

  /**
   * Turnuva masası: Turnuva ekranındaki "Tahtada Oyna" buraya
   * #/duello?turnuva=…&masa=… ile gelir. Oyuncular ve renkleri masadan gelir.
   */
  const tourCtx = classroom.findBoard(routeParam("turnuva"), routeParam("masa"));
  if (tourCtx && tourCtx.board.blackId !== null) {
    players.w = tourCtx.board.whiteId;
    players.b = tourCtx.board.blackId;
    names.w = classroom.studentName(players.w);
    names.b = classroom.studentName(players.b);
  }
  const tourBoard = tourCtx && tourCtx.board.blackId !== null ? tourCtx : null;

  let savedMatch = null; // bu oyunun kaydı; oyun geri alınırsa silinir
  let tourRecorded = false; // turnuva masasına bir kez yazılır

  /* --- Saat --- */

  let timeControl = TIME_CONTROLS[0]; // seçili tempo (varsayılan: süresiz)
  const clock = { w: 0, b: 0 }; // oyuncuların BANKASI: kalan süre (ms)
  let clockSide = null; // saati işleyen taraf
  let clockRunning = false; // saat akıyor mu (duraklatma bunu kapatır)
  let clockSince = 0; // işleyen tarafın saatinin başladığı an
  let timerId = null; // ekranı tazeleyen sayaç
  let timeoutLoser = null; // süresi biten taraf; oyun geri alınamaz
  const lowWarned = { w: false, b: false }; // "son 10 saniye" uyarısı bir kez çalar

  /* --- Puan --- */

  /** Maç skoru: kazanan 1, beraberlik ½ — turnuvadaki gibi oyunlar boyunca birikir. */
  const match = { w: 0, b: 0 };
  let lastAward = null; // son oyunun maç puanı; hamle geri alınırsa iade edilir

  /** Ekrandaki tahtalar: { side, api, card, turnTag, captured, nameTag }. */
  let seats = [];

  /* ---------------------------------------------------------------- *
   * Sabit arayüz parçaları
   * ---------------------------------------------------------------- */

  const boardsHost = el("div", { className: "duel-boards" });
  const noticeEl = el("p", { className: "duel-notice" });
  const statusEl = el("p", { className: "duel-status" });
  const moveList = el("ol", { className: "move-list" });
  const resultHost = el("div", { className: "duel-result" });
  const paletteHost = el("div", { className: "duel-palette" });

  /* ---------------------------------------------------------------- *
   * Skor tahtası — iki saat, materyal farkı ve maç skoru
   *
   * Tahtaların ÜSTÜNDE, iki düzende de aynı yerde durur. Bilerek tek bir
   * şerittir: akıllı tahtaya yansıtılan sınıfta iki çocuk da, izleyen sınıf da
   * aynı yere bakar. (Saatleri tahta kartlarının içine koymak yan yana iki
   * tahta düzeninde ikisini de küçültür ve uzaktan okunmaz kılardı.)
   * ---------------------------------------------------------------- */

  const clockViews = {}; // renk → saat kutusu
  const scoreSides = {}; // renk → skor şeridindeki oyuncu kutusu
  const scoreNames = {}; // renk → ad yazısı
  const leadEl = el("span", { className: "duel-lead" });
  const matchEl = el("span", { className: "duel-match-score" });

  function scoreSide(color) {
    const nameTag = el("strong", { className: "duel-score-name" });
    const clockTag = el("span", { className: "duel-clock" });
    const box = el("div", { className: "duel-score-side", "data-side": color }, [
      el("span", { className: "duel-score-piece", html: pieceHTML(`${color}k`) }),
      el("div", { className: "duel-score-id" }, [
        nameTag,
        el("small", { text: `${COLOR_NAMES[color]} taşlar` })
      ]),
      clockTag
    ]);
    clockViews[color] = clockTag;
    scoreNames[color] = nameTag;
    scoreSides[color] = box;
    return box;
  }

  const scoreBar = el("div", { className: "duel-scorebar", hidden: "" }, [
    scoreSide("w"),
    el("div", { className: "duel-score-center" }, [leadEl, matchEl]),
    scoreSide("b")
  ]);

  /* ---------------------------------------------------------------- *
   * Kurulum: taş dizme
   * ---------------------------------------------------------------- */

  /** Kurulumdaki konumu FEN'e çevirir. */
  function setupFen(turn) {
    let placement = "";
    for (const rank of RANKS) {
      let empty = 0;
      for (const file of FILES) {
        const code = setup.get(`${file}${rank}`);
        if (!code) {
          empty += 1;
          continue;
        }
        if (empty > 0) placement += empty;
        empty = 0;
        placement += code[0] === "w" ? code[1].toUpperCase() : code[1];
      }
      if (empty > 0) placement += empty;
      if (rank > 1) placement += "/";
    }
    return `${placement} ${turn} ${castlingRights()} - 0 1`;
  }

  /**
   * Rok hakları konumdan ÇIKARILIR: şah ve kale hiç kıpırdamamış gibi
   * duruyorsa (e1 + a1/h1) o yöne rok hakkı verilir. Çocuk standart dizilişi
   * kurduğunda rok kendiliğinden çalışsın diye böyledir.
   */
  function castlingRights() {
    let rights = "";
    if (setup.get("e1") === "wk") {
      if (setup.get("h1") === "wr") rights += "K";
      if (setup.get("a1") === "wr") rights += "Q";
    }
    if (setup.get("e8") === "bk") {
      if (setup.get("h8") === "br") rights += "k";
      if (setup.get("a8") === "br") rights += "q";
    }
    return rights || "-";
  }

  /** Kurulumu tahtalara yansıtır. */
  function applySetup() {
    chess.load(setupFen(startTurn));
    for (const seat of seats) seat.api.attach(chess);
    updateNotice();
    refresh();
  }

  /** Bir kareye seçili taşı koyar, aynı taş duruyorsa kaldırır. */
  function paint(square) {
    if (phase !== "setup") return;

    const current = setup.get(square) || "";

    if (brush === "erase") {
      if (!current) return;
      setup.delete(square);
    } else if (current === brush) {
      // Aynı taşa ikinci dokunuş taşı kaldırır — silgiye geçmeden düzeltme.
      setup.delete(square);
    } else {
      const rank = square[1];
      if (brush[1] === "p" && (rank === "1" || rank === "8")) {
        warn("Piyon 1. ve 8. yataya konulamaz; orada zaten terfi ederdi.");
        sound.play("error");
        return;
      }
      // Her renkten TEK şah olur: yeni şah konunca eskisi yerinden kalkar.
      if (brush[1] === "k") {
        for (const [name, code] of setup) if (code === brush) setup.delete(name);
      }
      setup.set(square, brush);
    }

    sound.play("click");
    applySetup();
  }

  /** Kurulumun oyuna hazır olup olmadığını söyler; hazırsa null döner. */
  function validateSetup() {
    const kings = { w: 0, b: 0 };
    for (const code of setup.values()) if (code[1] === "k") kings[code[0]] += 1;

    if (kings.w === 0 || kings.b === 0) {
      return "Oyuna başlamak için her iki tarafın da bir şahı olmalı.";
    }

    const test = new Chess(setupFen(startTurn));
    const waiting = startTurn === "w" ? "b" : "w";

    // Sırası GELMEYEN tarafın şahı tehdit altında olamaz: böyle bir konumda
    // sıradaki oyuncu rakip şahı alarak oyunu bitirirdi, bu satrançta olmaz.
    if (test.isKingAttacked(waiting)) {
      return `${COLOR_NAMES[waiting]} tarafın şahı tehdit altında ama sıra ${COLOR_NAMES[startTurn]} tarafında. Konumu düzelt ya da başlayan tarafı değiştir.`;
    }

    if (test.moves().length === 0) {
      return `${COLOR_NAMES[startTurn]} tarafın hiç hamlesi yok — bu konum daha ilk hamlede bitmiş sayılır.`;
    }

    return null;
  }

  /** Kurulum ipucu satırını tazeler. */
  function updateNotice() {
    if (phase !== "setup") return;

    if (setup.size === 0) {
      noticeEl.className = "duel-notice";
      noticeEl.textContent = "Aşağıdan bir taş seç, sonra tahtada koymak istediğin kareye dokun.";
      return;
    }

    const problem = validateSetup();
    if (problem) {
      noticeEl.className = "duel-notice warn";
      noticeEl.textContent = problem;
      return;
    }

    noticeEl.className = "duel-notice ready";
    noticeEl.textContent = `Konum hazır! ${COLOR_NAMES[startTurn]} başlıyor — “Oyunu Başlat”a bas.`;
  }

  /** Kurulum sırasında uyarı gösterir. */
  function warn(text) {
    noticeEl.className = "duel-notice warn";
    noticeEl.textContent = text;
  }

  /* ---------------------------------------------------------------- *
   * Satranç saati
   *
   * Süre TEK yerde tutulur: `clock[renk]` o oyuncunun bankasıdır ve yalnızca
   * saat el değiştirdiğinde güncellenir. Ekranda görünen kalan süre her
   * karede "banka − (şimdi − saatin başladığı an)" olarak HESAPLANIR.
   *
   * Sayaçtan bir tık düşürmek (remaining -= 1) daha kolay olurdu ama yanlış
   * olurdu: tarayıcı sekme arka plandayken zamanlayıcıları seyrekleştirir,
   * saniyeler sessizce kaybolur ve oyunun sonunda saatler gerçekte geçen
   * süreyi göstermez. Gerçek zamanı ölçmek her durumda doğru sonucu verir.
   * ---------------------------------------------------------------- */

  /** Saatli oyun mu? */
  function timed() {
    return timeControl.base > 0;
  }

  /** Bir oyuncunun O AN kalan süresi (ms). */
  function remaining(color) {
    let left = clock[color];
    if (clockRunning && clockSide === color) left -= Date.now() - clockSince;
    return Math.max(0, left);
  }

  /** İşleyen saati durdurur ve harcanan süreyi bankaya yazar. */
  function holdClock() {
    if (clockRunning && clockSide) {
      clock[clockSide] = Math.max(0, clock[clockSide] - (Date.now() - clockSince));
    }
    clockRunning = false;
  }

  /** Saati verilen oyuncuya geçirir ve çalıştırır. */
  function passClock(color) {
    holdClock();
    if (!timed()) return;
    clockSide = color;
    clockSince = Date.now();
    clockRunning = true;
  }

  /**
   * Hamleyi yapan oyuncu "saate basar": önce eklemesini alır, sonra saat
   * rakibe geçer. Ekleme hamleden SONRA verilir; gerçek saatlerde de böyledir.
   */
  function pressClock(mover) {
    if (!timed()) return;
    holdClock();
    clock[mover] += timeControl.increment * 1000;
    passClock(mover === "w" ? "b" : "w");
  }

  /** Saatleri seçili tempoya göre sıfırlar. */
  function resetClocks() {
    stopTicking();
    clock.w = timeControl.base * 1000;
    clock.b = timeControl.base * 1000;
    clockSide = null;
    clockRunning = false;
    timeoutLoser = null;
    lowWarned.w = false;
    lowWarned.b = false;
  }

  /** Ekranı tazeleyen sayacı kurar (200 ms: son saniyelerde saliseler akıcı görünsün). */
  function startTicking() {
    stopTicking();
    if (timed()) timerId = setInterval(tick, 200);
  }

  function stopTicking() {
    if (timerId === null) return;
    clearInterval(timerId);
    timerId = null;
  }

  /**
   * Saat tıkı.
   *
   * Yönlendirici sayfalara "kapanıyorsun" demez; başka bir ekrana geçildiğinde
   * bu sayfanın kökü DOM'dan kopar. Temizliği bu yüzden saatin KENDİSİ yapar,
   * yoksa sayaç arka planda işlemeye devam ederdi.
   */
  function tick() {
    if (!page.isConnected) {
      stopTicking();
      return;
    }
    paintClocks();
    if (clockRunning && clockSide && remaining(clockSide) <= 0) flagFall(clockSide);
  }

  /** Süresi biten oyuncu için oyunu bitirir. */
  function flagFall(color) {
    holdClock();
    clock[color] = 0;
    stopTicking();
    timeoutLoser = color;

    const rival = color === "w" ? "b" : "w";
    // FIDE kuralı: süre biter ama rakipte mat edecek taş yoksa oyun BERABERE
    // biter. Kimsenin kazanamayacağı bir konumda saat de kazandırmaz.
    const canMate = hasMatingMaterial(rival);

    endGame({
      winner: canMate ? rival : null,
      // Metinler oyuncu ADIYLA birleşecek biçimde kurulur: varsayılan ad zaten
      // "Beyaz Oyuncu" olduğu için "… oyuncunun" demek "Oyuncu oyuncunun"
      // gibi tuhaf bir cümle üretiyordu.
      reason: canMate
        ? `Süre bitti! ${names[color]} için zaman kalmadı.`
        : `Süre bitti ama ${names[rival]} mat edecek taşı olmadığı için kazanamaz — beraberlik.`
    });
  }

  /** Bir tarafın mat edebilecek taşı var mı? (Şah + tek hafif taş mat edemez.) */
  function hasMatingMaterial(color) {
    let minors = 0;
    for (const piece of Object.values(chess.pieceMap())) {
      if (piece.color !== color) continue;
      if (piece.type === "p" || piece.type === "r" || piece.type === "q") return true;
      if (piece.type === "n" || piece.type === "b") minors += 1;
    }
    return minors >= 2;
  }

  /** Saati duraklatır ya da devam ettirir. */
  function togglePause() {
    if (!timed() || phase !== "play" || finished) return;
    if (clockRunning) holdClock();
    else passClock(clockSide || chess.turnColor());
    sound.play("click");
    refresh();
  }

  /** Saat duraklatılmış mı? (Duraklatınca tahtalar da kilitlenir — gerçek saatte de sıra durur.) */
  function isPaused() {
    return timed() && phase === "play" && !finished && !clockRunning;
  }

  /** Saat kutularını yazar; azalan süre önce sararır, son 10 saniyede kızarır. */
  function paintClocks() {
    for (const color of ["w", "b"]) {
      const view = clockViews[color];
      view.hidden = !timed();
      if (!timed()) continue;

      const left = remaining(color);
      view.textContent = clockText(left);
      view.classList.toggle("running", clockRunning && clockSide === color);
      view.classList.toggle("low", left <= 60000 && left > 10000);
      view.classList.toggle("critical", left <= 10000);

      // Uyarı sesi oyun başına BİR KEZ çalar; her tıkta çalsaydı sınıfta
      // katlanılmaz bir gürültü olurdu.
      if (left <= 10000 && clockRunning && clockSide === color && !lowWarned[color]) {
        lowWarned[color] = true;
        sound.play("error");
      }
    }
  }

  /* ---------------------------------------------------------------- *
   * Puan hesabı
   * ---------------------------------------------------------------- */

  /** Her oyuncunun ALDIĞI taşların puan toplamı. */
  function capturedPoints() {
    const captured = chess.capturedPieces();
    const sum = (list) => list.reduce((total, type) => total + SIMPLE_VALUES[type], 0);
    // captured[renk] = O RENKTEN kaybedilen taşlar; onları rakibi almıştır.
    return { w: sum(captured.b), b: sum(captured.w) };
  }

  /**
   * Tahtada KALAN materyalin farkı (artı ise beyaz önde).
   *
   * Bilerek alınan taşların farkı değil, kalan taşların farkıdır: bu ekranda
   * konumu çocuklar kendileri kuruyor, oyun eşit materyalle başlamayabilir.
   * Kalan taşları saymak her kuruluşta doğru cevabı verir.
   */
  function materialLead() {
    let balance = 0;
    for (const piece of Object.values(chess.pieceMap())) {
      if (piece.type === "k") continue;
      balance += (piece.color === "w" ? 1 : -1) * SIMPLE_VALUES[piece.type];
    }
    return balance;
  }

  /** Biten oyunun maç puanını yazar (kazanan 1, beraberlik ½). */
  function awardMatch(winner) {
    lastAward = winner === null ? { w: 0.5, b: 0.5 } : { w: winner === "w" ? 1 : 0, b: winner === "b" ? 1 : 0 };
    match.w += lastAward.w;
    match.b += lastAward.b;
  }

  /** Skor şeridini tazeler. */
  function paintScore() {
    const lead = materialLead();
    leadEl.textContent = lead === 0 ? "Taşlar eşit" : `${COLOR_NAMES[lead > 0 ? "w" : "b"]} +${Math.abs(lead)}`;
    leadEl.className = `duel-lead ${lead === 0 ? "even" : lead > 0 ? "w" : "b"}`;
    matchEl.textContent = `Maç ${scoreText(match.w)} – ${scoreText(match.b)}`;

    const turn = chess.turnColor();
    for (const color of ["w", "b"]) {
      scoreNames[color].textContent = names[color];
      scoreSides[color].classList.toggle("active", phase === "play" && !finished && turn === color);
    }
    paintClocks();
  }

  /* ---------------------------------------------------------------- *
   * Aşama geçişleri
   * ---------------------------------------------------------------- */

  /**
   * Kurulum ekranını açar.
   * @param {Map|null} position Dizilecek konum; null ise tahta boş gelir.
   */
  function openSetup(position = null) {
    setup = position ? new Map(position) : new Map();
    phase = "setup";
    finished = false;
    lastAward = null;

    // BOŞ tahtadan başlamak yeni bir maç demektir; maç skoru sıfırlanır.
    // Var olan dizilişi düzeltmek ("Dizilişi değiştir") ise aynı maçın
    // içindedir — orada skorun silinmesi öğretmenin canını sıkardı.
    if (position === null) {
      match.w = 0;
      match.b = 0;
    }
    moveList.replaceChildren();
    resultHost.replaceChildren();
    setupPanel.hidden = false;
    playPanel.hidden = true;
    scoreBar.hidden = true;
    stageEl.classList.remove("playing");
    resetClocks();
    applySetup();
  }

  /** Kurulumu onaylayıp oyunu başlatır. */
  function startGame() {
    const problem = validateSetup();
    if (problem) {
      warn(problem);
      sound.play("error");
      return;
    }

    startFen = setupFen(startTurn);
    chess.load(startFen);
    savedMatch = null;
    phase = "play";
    finished = false;
    lastAward = null;
    moveList.replaceChildren();
    resultHost.replaceChildren();
    for (const seat of seats) seat.api.attach(chess);
    setupPanel.hidden = true;
    playPanel.hidden = false;
    scoreBar.hidden = false;
    stageEl.classList.add("playing");
    // Turnuvada olduğu gibi ilk hamleyi yapacak oyuncunun saati hemen işler.
    resetClocks();
    if (timed()) {
      passClock(startTurn);
      startTicking();
    }
    sound.play("success");
    refresh();
  }

  /** Oyunu aynı dizilişle baştan başlatır. */
  function restartGame() {
    if (!startFen) return;
    chess.load(startFen);
    finished = false;
    savedMatch = null;
    // Yeni oyunun puanı ayrı yazılır; biten oyunun puanı maç skorunda KALIR.
    lastAward = null;
    moveList.replaceChildren();
    resultHost.replaceChildren();
    for (const seat of seats) seat.api.attach(chess);
    resetClocks();
    if (timed()) {
      passClock(chess.turnColor());
      startTicking();
    }
    sound.play("click");
    refresh();
  }

  /* ---------------------------------------------------------------- *
   * Oyun
   * ---------------------------------------------------------------- */

  /**
   * Bir tahtadan gelen hamle.
   * @param {"w"|"b"|null} side Hamleyi yapan tahtanın rengi; tek tahtada null.
   */
  function handleMove(side, move) {
    if (phase !== "play") return;

    if (isPaused()) {
      statusEl.textContent = "Saat duraklatıldı — devam etmek için ▶ düğmesine bas.";
      sound.play("error");
      return;
    }

    const turn = chess.turnColor();
    if (side !== null && side !== turn) {
      statusEl.textContent = "Sıra rakipte — onun hamlesini bekle.";
      sound.play("error");
      return;
    }

    const played = chess.move(move);
    if (!played) {
      sound.play("error");
      for (const seat of seats) seat.api.shake(move.from);
      return;
    }

    sound.play(played.captured ? "success" : "move");
    appendMove(played);
    // TEK konum, İKİ görüntü: hamle her iki tahtada da aynı anda oynatılır.
    for (const seat of seats) seat.api.update({ from: played.from, to: played.to });
    pressClock(played.color);
    refresh();
    announceEnd();

    // Tek tahtada çevirme, taş uçuşu bittikten sonra yapılır; yoksa uçan taş
    // dönüşün ortasında kalır ve ters görünürdü.
    if (layout === "single" && autoFlip && !finished) setTimeout(faceTurn, 430);
  }

  /**
   * Tek tahtayı, sırası GELEN oyuncunun gözüne çevirir.
   *
   * "Her hamlede çevir" için `flip()` (ucu ucuna ters çevirme) yeterli DEĞİLDİR:
   * ayar oyunun ortasında açılırsa tahta yanlış tarafa döner. Yönü doğrudan
   * sıradaki renge bağlamak her durumda doğru sonucu verir.
   */
  function faceTurn() {
    if (layout !== "single" || seats.length === 0) return;
    singleOrientation = chess.turnColor();
    seats[0].api.setOrientation(singleOrientation);
  }

  /**
   * Sırası gelmeyen tahtaya dokunan çocuğa neden hiçbir şey olmadığını söyler.
   * Tahta zaten kilitlidir; sessiz kilit çocuğa "bozuk" gibi gelirdi.
   */
  function nudge(side, square) {
    if (side === null || phase !== "play") return;
    if (side === chess.turnColor()) return;
    const piece = chess.get(square);
    if (!piece || piece.color !== side) return;
    statusEl.textContent = `Sıra ${names[chess.turnColor()]} tarafında — onun hamlesini bekle.`;
  }

  /** Son hamleyi geri alır — sınıfta "yanlışlıkla oldu" anları için. */
  function undoMove() {
    if (phase !== "play") return;

    // Süre bittikten sonra geri almak anlamsızdır: saat zaten sıfırdadır,
    // geri alınan hamlenin ardından ilk tıkta yeniden biterdi.
    if (timeoutLoser) {
      statusEl.textContent = "Süre bittiği için hamle geri alınamaz — oyunu yeniden başlatabilirsiniz.";
      sound.play("error");
      return;
    }

    const undone = chess.undo();
    if (!undone) return;

    sound.play("click");

    // Oyun bitmişti ve geri alındıysa maç puanı da geri verilir.
    if (finished && lastAward) {
      match.w -= lastAward.w;
      match.b -= lastAward.b;
      lastAward = null;
    }
    // Biten oyunun kaydı da geri alınır; oyun devam edecek.
    if (finished) unsaveResult();
    finished = false;
    resultHost.replaceChildren();
    if (moveList.lastChild) moveList.lastChild.remove();

    // Saat de geri sarılır: hamleyle kazanılan ekleme silinir ve saat, hamleyi
    // yapan oyuncuya iade edilir — sıra yeniden onda olduğu için.
    if (timed()) {
      holdClock();
      clock[undone.color] = Math.max(0, clock[undone.color] - timeControl.increment * 1000);
      passClock(undone.color);
      startTicking();
    }

    const history = chess.getHistory({ verbose: true });
    const previous = history.length > 0 ? history[history.length - 1] : null;
    for (const seat of seats) {
      seat.api.setLastMove(previous ? { from: previous.from, to: previous.to } : null);
    }
    refresh();
  }

  /** Motorun kurallarına göre oyun bittiyse sonucu duyurur. */
  function announceEnd() {
    const status = chess.status();
    if (!status.over || finished) return;
    endGame({ winner: status.winner, reason: status.reason });
  }

  /**
   * Oyunu bitirir: saati durdurur, maç puanını yazar ve sonuç kartını gösterir.
   *
   * Hem motorun bulduğu sonuçlar (mat, pat, beraberlik) hem de motorun
   * BİLMEDİĞİ sonuç (süre bitmesi) buradan geçer; oyun tek bir yerde biter.
   */
  function endGame({ winner, reason }) {
    if (finished) return;

    finished = true;
    holdClock();
    stopTicking();
    awardMatch(winner);
    sound.play("badge");
    const saved = saveResult(winner, reason);

    const winnerLine =
      winner === null ? "Beraberlik — ikiniz de iyi oynadınız." : `Kazanan: ${names[winner]}`;

    resultHost.replaceChildren(
      el("section", { className: "duel-result-card" }, [
        el("span", { className: "duel-result-emoji", text: winner === null ? "🤝" : "🏆" }),
        el("h3", { text: reason }),
        el("p", { text: winnerLine }),
        el("p", {
          className: "duel-result-match",
          text: `Maç skoru — ${names.w} ${scoreText(match.w)} : ${scoreText(match.b)} ${names.b}`
        }),
        saved ? el("p", { className: `duel-result-saved ${saved.tone}`, text: saved.text }) : null,
        el("div", { className: "duel-result-actions" }, [
          tourBoard
            ? el("button", {
                className: "primary",
                type: "button",
                text: "Turnuvaya Dön",
                onClick: () => navigate("turnuva", { id: tourBoard.tournament.id })
              })
            : null,
          el("button", {
            className: "primary",
            type: "button",
            text: "Aynı Dizilişle Yeniden",
            onClick: () => restartGame()
          }),
          el("button", {
            className: "ghost",
            type: "button",
            text: "Yeni Diziliş",
            onClick: () => openSetup(null)
          })
        ])
      ])
    );
    burst(resultHost);
    refresh();
  }

  /**
   * Biten oyunu öğrencilerin kaydına (ya da turnuva masasına) yazar.
   * @returns {{text:string, tone:string}|null} Sonuç kartında gösterilecek not.
   */
  function saveResult(winner, reason) {
    const result = winner === null ? "½-½" : winner === "w" ? "1-0" : "0-1";
    const history = chess.getHistory();
    const meta = {
      reason,
      moves: Math.ceil(history.length / 2),
      timeControl: timeControl.id === "yok" ? "" : timeControl.label
    };

    if (tourBoard) {
      if (tourRecorded) {
        return { text: "Bu masanın sonucu zaten turnuvaya işlendi. Değiştirmek için turnuva ekranını kullan.", tone: "" };
      }
      savedMatch = classroom.setBoardResult(tourBoard.tournament.id, tourBoard.board.id, result, meta);
      tourRecorded = Boolean(savedMatch);
      return savedMatch
        ? { text: `✓ Sonuç turnuvaya işlendi: ${tourBoard.tournament.name}, ${tourBoard.round}. tur, Masa ${tourBoard.board.table}.`, tone: "ok" }
        : null;
    }

    const active = classroom.activeClass;
    if (!active || !players.w || !players.b || players.w === players.b) return null;
    savedMatch = classroom.recordMatch({ ...meta, classId: active.id, whiteId: players.w, blackId: players.b, result, source: "duel" });
    return savedMatch ? { text: `✓ Sonuç ${names.w} ve ${names.b} için ${active.name} kaydına işlendi.`, tone: "ok" } : null;
  }

  /** Geri alınan oyunun kaydını siler. */
  function unsaveResult() {
    if (!savedMatch) return;
    if (tourBoard) {
      classroom.setBoardResult(tourBoard.tournament.id, tourBoard.board.id, null);
      tourRecorded = false;
    } else {
      classroom.deleteMatch(savedMatch.id);
    }
    savedMatch = null;
  }

  /** Pes etme ve anlaşmalı beraberlik — motorun kendi bulamayacağı sonuçlar. */
  function resign(color) {
    if (phase !== "play" || finished) return;
    if (!window.confirm(`${names[color]} pes ediyor. Oyun bitirilsin mi?`)) return;
    endGame({ winner: color === "w" ? "b" : "w", reason: `${names[color]} pes etti.` });
  }

  function agreeDraw() {
    if (phase !== "play" || finished) return;
    if (!window.confirm("İki oyuncu beraberlikte anlaştı mı?")) return;
    endGame({ winner: null, reason: "Oyuncular beraberlikte anlaştı." });
  }

  /** Hamle listesine yeni satır ekler. */
  function appendMove(move) {
    moveList.append(
      el("li", { className: `move-item ${move.color === "w" ? "white" : "black"}` }, [
        el("span", { className: "move-san", text: sanTr(move.san) })
      ])
    );
    moveList.scrollTop = moveList.scrollHeight;
  }

  /* ---------------------------------------------------------------- *
   * Tahtalar
   * ---------------------------------------------------------------- */

  /**
   * Bir tahta kartı üretir.
   * @param {"w"|"b"|null} side Tahtanın temsil ettiği oyuncu; tek tahtada null.
   */
  function createSeat(side) {
    const api = ChessBoard({
      chess,
      orientation: side || singleOrientation,
      interactive: phase === "play",
      onSquareClick: (square) => {
        if (phase === "setup") paint(square);
        else nudge(side, square);
      },
      onMove: (move) => {
        handleMove(side, move);
        // Hamleyi motora biz uyguluyoruz; bileşen kendi başına ilerletmesin.
        return false;
      }
    });

    const nameTag = el("strong", { className: "seat-name" });
    const roleTag = el("small", { className: "seat-role" });
    const turnTag = el("span", { className: "seat-turn" });
    const captured = el("div", { className: "captured-row" });

    const card = el("article", { className: "duel-seat", "data-side": side || "both" }, [
      el("header", { className: "seat-head" }, [
        el("span", {
          className: "seat-badge",
          html: side ? pieceHTML(`${side}k`) : `${pieceHTML("wk")}${pieceHTML("bk")}`
        }),
        el("div", { className: "seat-id" }, [nameTag, roleTag]),
        turnTag
      ]),
      api.element,
      captured
    ]);

    const seat = { side, api, card, nameTag, roleTag, turnTag, captured };
    seats.push(seat);
    return card;
  }

  /** Düzen değiştiğinde tahtaları yeniden kurar. */
  function buildBoards() {
    seats = [];
    boardsHost.className = `duel-boards ${layout}`;
    boardsHost.replaceChildren(...(layout === "dual" ? ["w", "b"] : [null]).map(createSeat));
    refresh();
  }

  /** Alınan taş şeridini yazar. */
  function renderCaptured(seat) {
    const captured = chess.capturedPieces();
    const points = capturedPoints();

    /** Bir tarafın ALDIĞI taşlar: rakip renkte kaybedilenlerdir. */
    const group = (label, color) => {
      const list = captured[color];
      // Bu taşları ALAN oyuncu, taşların sahibinin rakibidir.
      const owner = color === "w" ? "b" : "w";
      return el("span", { className: "captured-group" }, [
        el("span", { className: "captured-label", text: label }),
        ...(list.length === 0
          ? [el("span", { className: "captured-empty", text: "—" })]
          : list.map((type) =>
              el("span", { className: "captured-piece", html: pieceHTML(color + type) })
            )),
        // Puan rozeti yalnızca taş alındığında görünür; "0 puan" yazmak
        // çocuğa kaybettiği bir şey varmış gibi gelirdi.
        list.length === 0 ? null : el("span", { className: "captured-points", text: `${points[owner]} puan` })
      ].filter(Boolean));
    };

    if (seat.side) {
      seat.captured.replaceChildren(group("Aldıkların", seat.side === "w" ? "b" : "w"));
    } else {
      seat.captured.replaceChildren(group("Beyaz aldı", "b"), group("Siyah aldı", "w"));
    }
  }

  /** Tüm arayüzü konuma göre tazeler. */
  function refresh() {
    const turn = chess.turnColor();
    const status = phase === "play" ? chess.status() : { over: false, reason: "" };
    const paused = isPaused();
    // Oyun motorun bulduğu bir sonuçla BİTMİŞ olabilir (mat, pat) ya da
    // motorun görmediği bir sonuçla (süre bitmesi); etiketler ikisini de
    // "bitti" saymalıdır.
    const ended = status.over || finished;

    for (const seat of seats) {
      const myTurn = seat.side === null || seat.side === turn;
      // Saat duraklatılmışken tahtalar kilitlenir; gerçek satrançta da saat
      // durduğunda hamle yapılamaz.
      const canPlay = phase === "play" && !ended && !paused && myTurn;

      seat.api.setInteractive(canPlay);
      seat.card.classList.toggle("active", canPlay && seat.side !== null);
      seat.card.classList.toggle("setup", phase === "setup");

      if (seat.side) {
        seat.nameTag.textContent = names[seat.side];
        seat.roleTag.textContent = `${COLOR_NAMES[seat.side]} taşlar`;
        seat.turnTag.textContent =
          phase === "setup" ? "Kurulum" : ended ? "Oyun bitti" : myTurn ? "Sıra sende" : "Bekliyor";
      } else {
        seat.nameTag.textContent = phase === "setup" ? "Kurulum tahtası" : names[turn];
        seat.roleTag.textContent =
          phase === "setup" ? "Taşları birlikte dizin" : `${COLOR_NAMES[turn]} taşları oynuyor`;
        seat.turnTag.textContent = ended ? "Oyun bitti" : phase === "setup" ? "" : "Sıra";
      }

      renderCaptured(seat);
    }

    if (phase === "play") {
      if (paused) {
        statusEl.textContent = "⏸ Saat duraklatıldı — devam etmek için ▶ düğmesine bas.";
      } else if (ended) {
        statusEl.textContent = status.over ? status.reason : "Oyun bitti — sonuç kartı yanda.";
      } else {
        statusEl.textContent =
          status.reason || `Sıra: ${names[turn]} — ${COLOR_NAMES[turn].toLowerCase()} taşlar.`;
      }
      paintScore();
    }

    pauseButton.hidden = !timed() || phase !== "play" || finished;
    pauseButton.innerHTML = icon(paused ? "play" : "pause");
    pauseButton.title = paused ? "Saati devam ettir" : "Saati duraklat";
    pauseButton.setAttribute("aria-label", pauseButton.title);

    flipButton.hidden = layout !== "single";
    autoFlipBox.hidden = layout !== "single";
  }

  /* ---------------------------------------------------------------- *
   * Düzen seçimi (tek tahta / iki tahta)
   * ---------------------------------------------------------------- */

  function layoutButton(id, title, subtitle) {
    return el("button", {
      className: `seg-button ${id === layout ? "active" : ""}`,
      type: "button",
      "data-layout": id,
      title: subtitle,
      onClick: (event) => {
        if (layout === id) return;
        layout = id;
        sound.play("click");
        for (const button of event.currentTarget.parentElement.children) {
          button.classList.toggle("active", button.dataset.layout === id);
        }
        buildBoards();
      }
    }, [el("strong", { text: title }), el("small", { text: subtitle })]);
  }

  const layoutBar = el("div", { className: "duel-modes" }, [
    el("span", { className: "panel-label", text: "Düzen" }),
    el("div", { className: "segmented" }, [
      layoutButton("dual", "İki Tahta", "Yan yana, her oyuncu kendi gözünden"),
      layoutButton("single", "Tek Tahta", "İki oyuncu aynı tahtada")
    ])
  ]);

  /* ---------------------------------------------------------------- *
   * Kurulum paneli
   * ---------------------------------------------------------------- */

  /** Palet düğmelerinin seçili görünümünü tazeler. */
  function markBrush() {
    for (const button of paletteHost.querySelectorAll(".brush")) {
      button.classList.toggle("active", button.dataset.code === brush);
    }
  }

  function selectBrush(code) {
    brush = code;
    sound.play("click");
    markBrush();
  }

  function brushButton(code, label, html) {
    return el("button", {
      className: `brush ${code === brush ? "active" : ""}`,
      type: "button",
      "data-code": code,
      title: label,
      "aria-label": label,
      onClick: () => selectBrush(code),
      html
    });
  }

  paletteHost.replaceChildren(
    ...["w", "b"].map((color) =>
      el("div", { className: "brush-row" }, [
        el("span", { className: "brush-row-label", text: `${COLOR_NAMES[color]} taşlar` }),
        el("div", { className: "brush-set" }, PALETTE_TYPES.map((type) =>
          brushButton(
            color + type,
            `${COLOR_NAMES[color]} ${PIECE_NAMES_TR[type]}`,
            pieceHTML(color + type)
          )
        ))
      ])
    ),
    el("div", { className: "brush-row" }, [
      el("span", { className: "brush-row-label", text: "Düzeltme" }),
      el("div", { className: "brush-set" }, [
        brushButton("erase", "Sil — dokunduğun kareyi boşaltır", "🧽")
      ])
    ])
  );

  const turnButtons = ["w", "b"].map((color) =>
    el("button", {
      className: `seg-button ${color === startTurn ? "active" : ""}`,
      type: "button",
      "data-turn": color,
      title: `${COLOR_NAMES[color]} ilk hamleyi yapar`,
      onClick: (event) => {
        startTurn = color;
        sound.play("click");
        for (const button of event.currentTarget.parentElement.children) {
          button.classList.toggle("active", button.dataset.turn === color);
        }
        applySetup();
      }
    }, [
      el("strong", { html: pieceHTML(`${color}k`) }),
      el("small", { text: COLOR_NAMES[color] })
    ])
  );

  /* --- Kurulum: satranç saati seçimi --- */

  let customMinutes = 3;
  let customIncrement = 2;

  const timeNote = el("p", { className: "duel-time-note" });

  /** Seçili temponun ne anlama geldiğini çocuk diliyle anlatır. */
  function timeHint() {
    if (!timed()) return "Saat kapalı: iki oyuncu da istediği kadar düşünebilir.";
    const mins = Math.floor(timeControl.base / 60);
    const secs = timeControl.base % 60;
    const baseStr = secs > 0 ? `${mins} dk ${secs} sn` : `${mins} dakika`;
    const base = `Her oyuncuya ${baseStr}. Süresi biten oyunu kaybeder.`;
    return timeControl.increment > 0
      ? `${base} Her hamleden sonra saatine ${timeControl.increment} saniye eklenir.`
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
    resetClocks();
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
        title: "Özel süre — istediğin süreyi kendin belirle",
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
        resetClocks();
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

  /** Oyuncu adı kutusu — sınıfta "Ali vs Ayşe" yazması oyunu ciddileştirir. */
  function nameInput(color) {
    return el("input", {
      className: "duel-name-input",
      type: "text",
      value: names[color],
      maxlength: "18",
      "aria-label": `${COLOR_NAMES[color]} oyuncunun adı`,
      placeholder: `${COLOR_NAMES[color]} oyuncu`,
      onInput: (event) => {
        names[color] = event.target.value.trim() || `${COLOR_NAMES[color]} Oyuncu`;
        refresh();
      }
    });
  }

  const recordNote = el("p", { className: "duel-record-note" });

  /** Sonucun nereye kaydedileceğini söyler. */
  function updateRecordNote() {
    const active = classroom.activeClass;
    let text;
    let tone = "";
    if (tourBoard) {
      const previous = classroom.boardResult(tourBoard.board);
      text = `🏆 ${tourBoard.tournament.name} · ${tourBoard.round}. tur · Masa ${tourBoard.board.table}. Sonuç turnuvaya işlenecek.` +
        (previous ? ` (Şu an girili sonuç: ${previous} — oyun bitince yenisi yazılır.)` : "");
      tone = "ok";
    } else if (!active) {
      text = "Sonuçları öğrencilere kaydetmek için üst çubuktan sınıf seç.";
    } else if (players.w && players.b && players.w === players.b) {
      text = "Aynı öğrenci iki tarafta seçili — sonuç kaydedilmez.";
      tone = "warn";
    } else if (players.w && players.b) {
      text = `✓ Sonuç ${names.w} ve ${names.b} için kaydedilecek.`;
      tone = "ok";
    } else {
      text = "Sonucun kaydedilmesi için iki öğrenci de seç.";
    }
    recordNote.textContent = text;
    recordNote.className = `duel-record-note ${tone}`;
  }

  /**
   * Oyuncu seçimi: sınıf seçiliyse öğrenci listesi, değilse serbest ad.
   * Turnuva masasında oyuncular sabittir.
   */
  function playerPicker(color) {
    const label = `${color === "w" ? "♔" : "♚"} ${COLOR_NAMES[color]}`;
    if (tourBoard) {
      return el("div", { className: "duel-player-fixed" }, [
        el("span", { text: label }),
        el("strong", { text: names[color] })
      ]);
    }

    const active = classroom.activeClass;
    const students = active ? classroom.students(active.id) : [];
    if (students.length === 0) return nameInput(color);

    const guest = nameInput(color);
    guest.hidden = true;
    const select = el("select", {
      className: "duel-name-input duel-player-select",
      "aria-label": `${COLOR_NAMES[color]} oyuncu`,
      onChange: (event) => {
        const value = event.target.value;
        guest.hidden = value !== "__guest";
        if (value && value !== "__guest") {
          players[color] = value;
          names[color] = classroom.studentName(value);
        } else {
          players[color] = null;
          names[color] = (value === "__guest" && guest.value.trim()) || `${COLOR_NAMES[color]} Oyuncu`;
        }
        sound.play("click");
        updateRecordNote();
        refresh();
      }
    }, [
      el("option", { value: "", text: `${label} — öğrenci seç` }),
      ...students.map((student) => el("option", { value: student.id, text: student.name })),
      el("option", { value: "__guest", text: "Misafir (kaydedilmez)" })
    ]);
    return el("div", { className: "duel-player-pick" }, [select, guest]);
  }

  const setupPanel = el("div", { className: "duel-panel-body" }, [
    el("h2", { className: "duel-panel-title", text: "1. Taşları dizin" }),
    noticeEl,
    paletteHost,
    el("div", { className: "duel-quick" }, [
      el("button", {
        className: "ghost",
        type: "button",
        html: `${icon("board")} Standart Diziliş`,
        onClick: () => {
          sound.play("click");
          setup = standardSetup();
          applySetup();
        }
      }),
      el("button", {
        className: "ghost",
        type: "button",
        html: `${icon("edit")} Tahtayı Boşalt`,
        onClick: () => {
          sound.play("click");
          setup = new Map();
          applySetup();
        }
      })
    ]),
    el("label", { className: "panel-label", text: "Kim başlıyor?" }),
    el("div", { className: "segmented" }, turnButtons),
    el("label", { className: "panel-label", text: "Satranç saati" }),
    timeButtonsContainer,
    customTimeBox,
    timeNote,
    el("label", { className: "panel-label", text: tourBoard ? "Turnuva masası" : "Oyuncular" }),
    el("div", { className: "duel-names" }, [playerPicker("w"), playerPicker("b")]),
    recordNote,
    tourBoard
      ? el("button", {
          className: "link-button",
          type: "button",
          text: "← Turnuvaya dön",
          onClick: () => navigate("turnuva", { id: tourBoard.tournament.id })
        })
      : null,
    el("button", {
      className: "primary duel-start",
      type: "button",
      text: "Oyunu Başlat",
      onClick: () => startGame()
    })
  ]);

  /* ---------------------------------------------------------------- *
   * Oyun paneli
   * ---------------------------------------------------------------- */

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

  const pauseButton = toolButton("pause", "Saati duraklat", () => togglePause());

  const flipButton = toolButton("board", "Tahtayı çevir", () => {
    sound.play("click");
    singleOrientation = seats[0].api.flip();
  });

  const autoFlipBox = el("label", { className: "duel-autoflip" }, [
    el("input", {
      type: "checkbox",
      onChange: (event) => {
        autoFlip = event.target.checked;
        sound.play("click");
        // Ayar açıldığı anda tahtayı doğru tarafa çevir; oyunun ortasında
        // açıldığında bir hamle boyunca ters kalmasın.
        if (autoFlip && phase === "play") faceTurn();
      }
    }),
    el("span", { text: "Her hamlede tahtayı çevir" })
  ]);

  const focusButton = focusToggle(sound);

  const playPanel = el("div", { className: "duel-panel-body", hidden: "" }, [
    el("div", { className: "panel-top" }, [
      el("div", { className: "play-tools" }, [
        toolButton("route", "Son hamleyi geri al", () => undoMove()),
        pauseButton,
        flipButton,
        toolButton("game", "Aynı dizilişle yeniden başla", () => restartGame()),
        toolButton("edit", "Dizilişi değiştir", () => {
          sound.play("click");
          // Oyunun BAŞLADIĞI konumu düzenletiriz; oyunun ortasındaki konumu
          // değil. Çocuk "şurayı yanlış dizmişiz" dediğinde beklediği budur.
          const position = new Map();
          for (const [square, piece] of Object.entries(new Chess(startFen).pieceMap())) {
            position.set(square, piece.color + piece.type);
          }
          openSetup(position);
        }),
        toolButton("pawn", "Yeni diziliş (boş tahta)", () => {
          sound.play("click");
          openSetup(null);
        })
      ]),
      focusButton
    ]),
    statusEl,
    autoFlipBox,
    el("div", { className: "duel-end-row" }, [
      el("button", { className: "ghost small", type: "button", text: "🏳 Beyaz pes etti", onClick: () => resign("w") }),
      el("button", { className: "ghost small", type: "button", text: "🤝 Beraberlik", onClick: () => agreeDraw() }),
      el("button", { className: "ghost small", type: "button", text: "🏳 Siyah pes etti", onClick: () => resign("b") })
    ]),
    moveList,
    resultHost
  ]);

  /* ---------------------------------------------------------------- *
   * Kuruluş
   * ---------------------------------------------------------------- */

  /*
   * Sahne, skor şeridi açıkken `.playing` sınıfını taşır: tahtanın yükseklik
   * hesabı şeridin kapladığı yeri buradan öğrenir (bkz. duel.css).
   */
  const stageEl = el("div", { className: "duel-stage" }, [layoutBar, scoreBar, boardsHost]);

  const page = pageShell(
    "İki Kişilik Oyun",
    "İki öğrenci karşı karşıya: taşları kendiniz dizin, sonra oynayın.",
    [
      el("section", { className: "duel-layout" }, [
        stageEl,
        el("aside", { className: "duel-panel" }, [setupPanel, playPanel])
      ])
    ],
    { compact: true }
  );

  buildBoards();
  openSetup(null);
  updateRecordNote();
  // Turnuva maçı standart dizilişle başlar; çocuklar yine de düzenleyebilir.
  if (tourBoard) {
    setup = standardSetup();
    applySetup();
  }

  return page;
}
