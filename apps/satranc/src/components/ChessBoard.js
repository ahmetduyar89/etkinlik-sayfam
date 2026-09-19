/**
 * ChessBoard.js — Etkileşimli satranç tahtası bileşeni.
 *
 * Bu bileşen gerçek oyun içindir (ders diyagramlarından farklı olarak):
 *  - Tıkla-seç / tıkla-oyna ve sürükle-bırak
 *  - Yalnızca YASAL hamleleri gösteren noktalar ve alma halkaları
 *  - Son hamle vurgusu, şah çekilen şahın kırmızı halkası
 *  - Piyon terfisinde taş seçme penceresi
 *  - Tahtayı çevirme (siyahın gözünden oynama)
 *  - Taşların İZLEMESİ GEREKEN YOL boyunca hareket etmesi:
 *    at L çizer, kale düz gider, fil çapraz gider, rokta şah ve kale birlikte kayar
 *
 * DOM'u her hamlede baştan kurmaz; kareleri bir kez üretir ve sadece içeriği günceller.
 * Bu sayede animasyonlar kesintisiz kalır.
 */

import { el } from "../utils/dom.js";
import { PIECE_NAMES_TR, isLightSquare, toSquare } from "../engine/Chess.js";
import { pieceHTML, setPieceGlyph } from "./PieceGlyph.js";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

/** Terfi penceresinde gösterilecek taşlar. */
const PROMOTION_CHOICES = [
  { type: "q", label: "Vezir" },
  { type: "r", label: "Kale" },
  { type: "b", label: "Fil" },
  { type: "n", label: "At" }
];

/**
 * @param {object} options
 * @param {import("../engine/Chess.js").Chess} options.chess Gösterilecek konum.
 * @param {(move:{from:string,to:string,promotion?:string}) => boolean|void} options.onMove
 *        Oyuncu hamle yapmak istediğinde çağrılır. false dönerse hamle geri alınır.
 * @param {"w"|"b"} options.orientation Tahtanın altında hangi renk duracak.
 * @param {boolean} options.interactive Oyuncu hamle yapabilir mi.
 * @param {(square:string) => void} options.onSquareClick Serbest kare tıklaması (ders modu).
 * @param {boolean} options.coordinates Kenar koordinatları gösterilsin mi.
 */
export function ChessBoard({
  chess,
  onMove,
  orientation = "w",
  interactive = true,
  onSquareClick = null,
  coordinates = true
} = {}) {
  let selected = null;
  let legalTargets = [];
  let lastMove = null;
  let pendingPromotion = null;
  let dragFrom = null;
  // Kalıcı işaretler: ders ve mini oyunlarda "hedef kare" göstermek için.
  // showHint'ten farkı, kendiliğinden sönmemesidir.
  let marks = [];

  const squares = new Map();

  const grid = el("div", {
    className: "cb-grid",
    role: "grid",
    "aria-label": "Satranç tahtası"
  });

  const overlay = el("div", { className: "cb-overlay", hidden: "" });

  /**
   * Hareket animasyonu katmanı.
   *
   * Izgaranın İÇİNDE durur; böylece tahtanın eğim (rotateX) ve çevirme
   * (rotate 180°) dönüşümlerini kendiliğinden miras alır ve uçan taş her zaman
   * tahta düzlemiyle hizalı görünür. Konumlandırma `offsetLeft/offsetTop`
   * ile yapılır — bunlar dönüşümden ETKİLENMEYEN yerleşim koordinatlarıdır.
   */
  const animLayer = el("div", { className: "cb-anim-layer", "aria-hidden": "true" });

  const stage = el("div", { className: `cb-stage ${orientation === "b" ? "flipped" : ""}` }, [grid, overlay]);
  const root = el("div", { className: "cb-root" }, [stage]);

  /**
   * Animasyon sürerken hedef karelerin taşları gizlenir (çift görünmesin diye).
   * Küme, çünkü rokta İKİ taş birden uçar: şah ve kale.
   */
  const hidden = new Set();
  /** Süren animasyonlar — yeni hamle gelirse hemen bitirilirler. */
  let running = [];

  /* ---------------------------------------------------------------- *
   * Kare üretimi — yalnızca bir kez çalışır
   * ---------------------------------------------------------------- */

  for (const rank of RANKS) {
    for (let fileIndex = 0; fileIndex < FILES.length; fileIndex += 1) {
      const file = FILES[fileIndex];
      const name = `${file}${rank}`;
      // Kare rengini MOTORDAN sorarız; formülü burada tekrarlamayız.
      // Önceden burada ayrı bir hesap vardı ve tersti: a1 açık, h1 koyu çiziliyordu.
      // Bu yüzden tahta, motorun isLightSquare() sonucuna dayanan ders içerikleriyle
      // (kare rengi oyunu, "sağ alt köşe açık olmalı" kuralı) çelişiyordu.
      const isDark = !isLightSquare(toSquare(name));

      const pieceLayer = el("span", { className: "cb-piece", "aria-hidden": "true" });
      const hint = el("span", { className: "cb-hint", "aria-hidden": "true" });

      const square = el("button", {
        className: `cb-square ${isDark ? "dark" : "light"}`,
        type: "button",
        role: "gridcell",
        "data-square": name,
        "aria-label": name,
        draggable: "false",
        onClick: () => handleClick(name),
        onDragstart: (event) => handleDragStart(event, name),
        onDragover: (event) => event.preventDefault(),
        onDrop: (event) => handleDrop(event, name)
      }, [
        hint,
        pieceLayer,
        coordinates && fileIndex === 0 ? el("span", { className: "cb-rank", text: String(rank) }) : null,
        coordinates && rank === 1 ? el("span", { className: "cb-file", text: file }) : null
      ]);

      squares.set(name, { node: square, piece: pieceLayer, hint });
      grid.append(square);
    }
  }

  // Katman kareler yerleştikten SONRA eklenir ki en üstte kalsın.
  grid.append(animLayer);

  /* ---------------------------------------------------------------- *
   * Hareket animasyonu
   * ---------------------------------------------------------------- */

  /** Karenin ızgara içindeki yerleşim kutusu (dönüşümlerden bağımsız). */
  function boxOf(name) {
    const node = squares.get(name)?.node;
    if (!node) return null;
    return { x: node.offsetLeft, y: node.offsetTop, w: node.offsetWidth, h: node.offsetHeight };
  }

  /**
   * Taşın izleyeceği ara noktayı verir.
   *
   * Atın hareketi "L" şeklindedir: önce uzun eksende İKİ kare, sonra kısa
   * eksende BİR kare. Bunu görsel olarak da göstermek, çocuğun at hareketini
   * kavramasını kolaylaştırır — düz çizgide süzülen at, kuralı yanlış öğretir.
   * Diğer taşlar zaten düz ya da çapraz gittiği için ara nokta gerekmez.
   */
  function waypointFor(type, from, to) {
    if (type !== "n") return null;

    const fileDelta = Math.abs(FILES.indexOf(to[0]) - FILES.indexOf(from[0]));
    const fromBox = boxOf(from);
    const toBox = boxOf(to);
    if (!fromBox || !toBox) return null;

    // Uzun eksen yatay ise önce yatay git; değilse önce dikey git.
    return fileDelta === 2 ? { x: toBox.x, y: fromBox.y } : { x: fromBox.x, y: toBox.y };
  }

  /**
   * Bir taşı `from` karesinden `to` karesine, izlemesi gereken yol boyunca
   * hareket ettirir.
   *
   * @param {string} code Uçan taşın kodu ("wq", "bk"...).
   * @returns {Promise<void>} Animasyon bitince çözülür.
   */
  function glide(from, to, code, type) {
    const fromBox = boxOf(from);
    const toBox = boxOf(to);
    if (!fromBox || !toBox || !code) return Promise.resolve();

    // Uçan taş: karenin tam üstüne konur, sonra hedefe taşınır.
    // Şah, kavuklu çizimimizle uçar; diğer taşlar Unicode sembolüyle.
    const ghost = el("span", { className: "cb-ghost", html: pieceHTML(code) });
    ghost.style.width = `${fromBox.w}px`;
    ghost.style.height = `${fromBox.h}px`;
    // Tahta çevrildiğinde kareler içeriklerini geri döndürüyor; uçan taş da
    // aynı düzeltmeyi uygulamazsa baş aşağı görünür.
    const spin = orientation === "b" ? " rotate(180deg)" : "";
    animLayer.append(ghost);

    const at = (box) => `translate(${box.x}px, ${box.y}px)${spin}`;
    const waypoint = waypointFor(type, from, to);

    const frames = [{ transform: at(fromBox) }];
    if (waypoint) {
      // İki bacaklı yol: uzun bacak biraz daha uzun sürer.
      frames.push({ transform: at(waypoint), offset: 0.6, easing: "linear" });
    }
    frames.push({ transform: at(toBox) });

    // Yol uzunluğuna göre süre: uzak kareler biraz daha uzun sürer ama
    // oyun akışını yavaşlatmayacak kadar.
    const distance = Math.hypot(toBox.x - fromBox.x, toBox.y - fromBox.y) / (fromBox.w || 1);
    const duration = Math.min(520, 200 + distance * 55);

    const animation = ghost.animate(frames, {
      duration,
      easing: waypoint ? "linear" : "cubic-bezier(0.33, 0.9, 0.35, 1)",
      fill: "forwards"
    });

    running.push(animation);
    return animation.finished
      .catch(() => {}) // iptal edilirse sessizce geç
      .finally(() => {
        ghost.remove();
        running = running.filter((item) => item !== animation);
      });
  }

  /** Süren animasyonları hemen bitirir (hızlı ardışık hamlelerde). */
  function flushAnimations() {
    for (const animation of running) animation.finish();
    running = [];
    animLayer.replaceChildren();
    hidden.clear();
  }

  /** Kullanıcı animasyonları kapattıysa (erişilebilirlik) atlarız. */
  function motionOff() {
    return (
      document.body.classList.contains("reduced-motion") ||
      !("animate" in Element.prototype)
    );
  }

  /* ---------------------------------------------------------------- *
   * Etkileşim
   * ---------------------------------------------------------------- */

  /** Bir kareye tıklandığında: seç, seçimi değiştir ya da hamleyi dene. */
  function handleClick(square) {
    if (onSquareClick) onSquareClick(square);
    if (!interactive || pendingPromotion) return;

    const piece = chess.get(square);

    // Hedef kareye tıklandıysa hamleyi dene.
    if (selected && legalTargets.includes(square)) {
      attemptMove(selected, square);
      return;
    }

    // Kendi taşına tıklandıysa seçimi oraya taşı.
    if (piece && piece.color === chess.turnColor()) {
      selectSquare(square);
      return;
    }

    clearSelection();
    render();
  }

  function handleDragStart(event, square) {
    if (!interactive || pendingPromotion) {
      event.preventDefault();
      return;
    }
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turnColor()) {
      event.preventDefault();
      return;
    }
    dragFrom = square;
    selectSquare(square);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", square);
  }

  function handleDrop(event, square) {
    event.preventDefault();
    const from = dragFrom || event.dataTransfer.getData("text/plain");
    dragFrom = null;
    if (!from || !interactive) return;
    if (legalTargets.includes(square)) attemptMove(from, square);
    else {
      clearSelection();
      render();
    }
  }

  /** Kareyi seçer ve o kareden çıkan yasal hamleleri hesaplar. */
  function selectSquare(square) {
    selected = square;
    legalTargets = chess.destinations(square);
    render();
  }

  function clearSelection() {
    selected = null;
    legalTargets = [];
  }

  /**
   * Hamleyi uygular. Terfi gerekiyorsa önce taş seçtirir.
   */
  function attemptMove(from, to) {
    const moving = chess.get(from);
    const isPromotion =
      moving &&
      moving.type === "p" &&
      ((moving.color === "w" && to[1] === "8") || (moving.color === "b" && to[1] === "1"));

    if (isPromotion) {
      openPromotion(from, to, moving.color);
      return;
    }
    commitMove({ from, to });
  }

  function commitMove(move) {
    clearSelection();
    const accepted = onMove ? onMove(move) : true;
    // onMove false dönerse (örn. yasadışı ya da sıra oyuncuda değil) sadece yeniden çizeriz.
    if (accepted !== false) lastMove = { from: move.from, to: move.to };
    render();
  }

  /** Terfi taşı seçme penceresini açar. */
  function openPromotion(from, to, color) {
    pendingPromotion = { from, to };
    overlay.replaceChildren(
      el("div", { className: "cb-promotion" }, [
        el("p", { className: "cb-promotion-title", text: "Piyonun hangi taşa dönüşsün?" }),
        el("div", { className: "cb-promotion-row" }, PROMOTION_CHOICES.map((choice) =>
          el("button", {
            className: "cb-promotion-choice",
            type: "button",
            title: choice.label,
            "aria-label": choice.label,
            onClick: () => {
              pendingPromotion = null;
              overlay.hidden = true;
              commitMove({ from, to, promotion: choice.type });
            }
          }, [
            el("span", {
              className: "cb-promotion-symbol",
              // Vezir ve fil kendi çizimimizle gelir; kale ve at Unicode sembolüyle.
              html: pieceHTML(color + choice.type)
            }),
            el("span", { className: "cb-promotion-label", text: choice.label })
          ])
        )),
        el("button", {
          className: "cb-promotion-cancel",
          type: "button",
          text: "Vazgeç",
          onClick: () => {
            pendingPromotion = null;
            overlay.hidden = true;
            clearSelection();
            render();
          }
        })
      ])
    );
    overlay.hidden = false;
  }

  /* ---------------------------------------------------------------- *
   * Çizim
   * ---------------------------------------------------------------- */

  /** Tahtayı mevcut konuma göre günceller. */
  function render() {
    const pieces = chess.pieceMap();
    const checkedKing = chess.checkedKingSquare();
    const canPlay = interactive && !pendingPromotion;

    for (const [name, parts] of squares) {
      const piece = pieces[name];
      // Animasyon sürerken hedef karenin taşı gizlenir; yoksa taş hem uçarken
      // hem de varış karesinde aynı anda görünürdü.
      const code = piece && !hidden.has(name) ? piece.color + piece.type : "";

      // Şah kavuklu çizimle, diğer taşlar Unicode sembolüyle çizilir.
      if (setPieceGlyph(parts.piece, code) && code) {
        // Taş değiştiğinde küçük bir "yerleşme" animasyonu oynatırız.
        parts.piece.classList.remove("cb-drop");
        void parts.piece.offsetWidth; // animasyonu yeniden başlatmak için reflow
        parts.piece.classList.add("cb-drop");
      }

      const isOwn = piece && piece.color === chess.turnColor();
      parts.node.draggable = Boolean(canPlay && isOwn);
      parts.node.classList.toggle("selected", selected === name);
      parts.node.classList.toggle("last-from", lastMove?.from === name);
      parts.node.classList.toggle("last-to", lastMove?.to === name);
      parts.node.classList.toggle("in-check", checkedKing === name);
      parts.node.classList.toggle("playable", Boolean(canPlay && isOwn));

      parts.node.classList.toggle("goal", marks.includes(name));

      const isTarget = legalTargets.includes(name);
      parts.node.classList.toggle("target", isTarget);
      parts.node.classList.toggle("target-capture", isTarget && Boolean(piece));

      // Ekran okuyucular için anlamlı etiket.
      parts.node.setAttribute(
        "aria-label",
        piece ? `${name}, ${piece.color === "w" ? "beyaz" : "siyah"} ${PIECE_NAMES_TR[piece.type]}` : `${name}, boş kare`
      );
    }
  }

  /* ---------------------------------------------------------------- *
   * Dışa açılan arayüz
   * ---------------------------------------------------------------- */

  render();

  return {
    element: root,

    /**
     * Tahtayı başka bir konum nesnesine bağlar.
     * Yeni oyun başlatıldığında GameService yepyeni bir Chess örneği ürettiği için
     * tahtanın da o örneği izlemesi gerekir.
     */
    attach(nextChess) {
      flushAnimations();
      chess = nextChess;
      clearSelection();
      lastMove = null;
      pendingPromotion = null;
      overlay.hidden = true;
      render();
    },

    /**
     * Konum dışarıdan değiştiğinde (hamle, geri alma, yeni oyun) çağrılır.
     *
     * `move` verilirse taş, ışınlanmak yerine kendi karesinden hedefe
     * İZLEMESİ GEREKEN YOL boyunca hareket eder (at için L, kale için düz,
     * fil için çapraz). Rok'ta kale de birlikte kayar.
     */
    update(move = undefined) {
      // Önceki animasyon hâlâ sürüyorsa hemen bitir; hamleler üst üste binmesin.
      flushAnimations();

      if (move !== undefined) lastMove = move;
      clearSelection();

      const from = move?.from;
      const to = move?.to;
      const arrived = to ? chess.get(to) : null;

      // Animasyon gereksizse (geri alma, yeni oyun, hareket kapalı) düz çiz.
      if (!from || !to || !arrived || motionOff()) {
        render();
        return;
      }

      // Uçacak taşları belirle: normalde bir tane, rokta şah + kale.
      const flights = [{ from, to, piece: arrived }];

      // Rok: şah iki kare yana giderse kale de yer değiştirir; ikisi
      // birlikte kaymazsa kale ışınlanmış gibi görünürdü.
      if (arrived.type === "k" && Math.abs(FILES.indexOf(to[0]) - FILES.indexOf(from[0])) === 2) {
        const rank = to[1];
        const kingSide = to[0] === "g";
        const rookTo = `${kingSide ? "f" : "d"}${rank}`;
        const rook = chess.get(rookTo);
        if (rook) flights.push({ from: `${kingSide ? "h" : "a"}${rank}`, to: rookTo, piece: rook });
      }

      // Hedeflerdeki taşları gizleyip tahtayı çiz, sonra uçur.
      for (const flight of flights) hidden.add(flight.to);
      render();

      Promise.all(
        flights.map((flight) =>
          glide(flight.from, flight.to, flight.piece.color + flight.piece.type, flight.piece.type)
        )
      ).then(() => {
        hidden.clear();
        render();
      });
    },

    /** Son hamle vurgusunu ayarlar. */
    setLastMove(move) {
      lastMove = move;
      render();
    },

    /** Oyuncunun hamle yapıp yapamayacağını değiştirir (örn. bilgisayar düşünürken kilitle). */
    setInteractive(value) {
      interactive = value;
      if (!value) clearSelection();
      render();
    },

    /** Tahtayı çevirir ve yeni yönü döndürür. */
    flip() {
      orientation = orientation === "w" ? "b" : "w";
      stage.classList.toggle("flipped", orientation === "b");
      return orientation;
    },

    /** Tahtayı belirli bir yöne çevirir. */
    setOrientation(value) {
      orientation = value === "b" ? "b" : "w";
      stage.classList.toggle("flipped", orientation === "b");
    },

    /**
     * Kareleri kalıcı olarak işaretler (hedef kare, ders vurgusu vb.).
     * Temizlemek için boş dizi verin.
     */
    setMarks(squares = []) {
      marks = squares;
      render();
    },

    /** İpucu okunu/vurgusunu gösterir. */
    showHint(from, to) {
      squares.get(from)?.node.classList.add("hint-from");
      squares.get(to)?.node.classList.add("hint-to");
      setTimeout(() => {
        squares.get(from)?.node.classList.remove("hint-from");
        squares.get(to)?.node.classList.remove("hint-to");
      }, 2400);
    },

    /** Yanlış hamlede kısa bir titreme geri bildirimi. */
    shake(square) {
      const parts = squares.get(square);
      if (!parts) return;
      parts.node.classList.remove("cb-shake");
      void parts.node.offsetWidth;
      parts.node.classList.add("cb-shake");
    },

    get orientation() {
      return orientation;
    }
  };
}
