// ─────────────────────────────────────────────────────────────────────
// BU DOSYA SATRANÇ UYGULAMASINDAN ALINMIŞTIR — ELLE DÜZENLEMEYİN.
//
// Kaynak: https://github.com/ahmetduyar89/satranc  (src/engine, src/components)
// Kural motoru, değerlendirici, yapay zekâ ve taş çizimleri orada gelişir;
// Canlı Satranç sayfası aynı motoru kullansın diye buraya kopyalanmıştır.
// Böylece çocuğun derste öğrendiği kurallar ile çevrimiçi maçtaki kurallar
// birebir aynı davranır.
//
// Güncellemek için: scripts/sync-chess-engine.mjs çalıştırın.
// ─────────────────────────────────────────────────────────────────────
/**
 * PieceGlyph.js — Taşların çizimi.
 *
 * ALTI TAŞIN TAMAMI kendi vektör çizimimizdir; Unicode satranç sembolleri
 * (♙ ♞ ♜ ♛ ...) artık kullanılmaz. Bunun üç nedeni var:
 *
 * 1. HAÇ SORUNU. Unicode şahın (♔ ♚) ve filin (♗ ♝) tepesinde haç vardır.
 *    Bu uygulama Türk-İslam kültürüne uygun olsun diye şahı padişah kavuğu ve
 *    sorgucuyla, fili de tepe topuyla çizer.
 *
 * 2. GÖRÜNÜM. Unicode taşlar yazı tipinin kalın, tıknaz çizimleridir; ekranda
 *    beyaz taşın içi de boş kaldığı için altındaki karenin rengini gösterir.
 *    Kendi çizimimizde hat inceliğine, dolguya ve oranlara biz karar veririz.
 *
 * 3. TUTARLILIK. Satranç sembolleri sistem yazı tipinden gelir: macOS'ta Apple
 *    Symbols, Windows'ta Segoe UI Symbol. Ölçüleri farklıdır — taş bir
 *    bilgisayarda kareye otururken diğerinde kayıyor ve küçülüyordu. Vektör
 *    çizimde böyle bir belirsizlik yoktur: aynı dosya her yerde aynı görünür.
 *
 * ÇİZİM DİLİ
 * Bütün taşlar ortak bir sözlükten kurulur — kaide, bilezik, gövde, boyun
 * halkası, baş — ve ORTAK BİR GÖRÜŞ KUTUSU paylaşır. Kutu, en uzun taşın
 * (şah) mürekkebini çerçeveler; kaideler aynı çizgiye oturur. Böylece piyon
 * kısa, vezir uzun görünür — gerçek bir satranç takımındaki gibi.
 *
 * RENK
 * Gövde `currentColor` ile dolar, dış hat `--pc-line` ile çizilir:
 *   beyaz taş → fildişi dolgu + koyu ince hat   (.pc-w)
 *   siyah taş → mor-lacivert dolgu + koyu hat   (.pc-b)
 * İnce iç çizgiler (sarık katları, filin yarığı, atın yelesi) `--pc-detail`
 * rengini alır; dolgunun üstünde okunur kalsınlar diye.
 */

/** Unicode sembolü → [taş tipi, renk]. Veri dosyalarında geçtiğinde çevrilir. */
const SYMBOL_MAP = {
  "♙": ["p", "w"], "♟": ["p", "b"],
  "♘": ["n", "w"], "♞": ["n", "b"],
  "♗": ["b", "w"], "♝": ["b", "b"],
  "♖": ["r", "w"], "♜": ["r", "b"],
  "♕": ["q", "w"], "♛": ["q", "b"],
  "♔": ["k", "w"], "♚": ["k", "b"]
};

/**
 * ORTAK GÖRÜŞ KUTUSU.
 *
 * x 6..39, y 0..42.6 — en geniş kaide (şah) ve en yüksek tepe (şahın sorgucu)
 * hat kalınlığıyla birlikte tam olarak buraya sığar. Bütün taşlar bu kutuyu
 * paylaştığı için kaideleri aynı hizada durur, boyları ise kendi doğal
 * oranlarında kalır.
 */
const KUTU = "6 0 33 42.6";

/** Kaide (en alttaki geniş slab) ve üstündeki bilezik. */
const kaide = (x, w) =>
  `<rect x="${x}" y="38" width="${w}" height="3.6" rx="1.8"/>` +
  `<rect x="${(x + 3.8).toFixed(1)}" y="34.4" width="${(w - 7.6).toFixed(1)}" height="3.6" rx="1.5"/>`;

/** PİYON — en kısa taş: küre baş, ince boyun, yayılan gövde. */
const piyon = () =>
  "<g>" +
  `<circle cx="22.5" cy="16.8" r="6"/>` +
  `<rect x="17.4" y="22.6" width="10.2" height="3" rx="1.4"/>` +
  `<path d="M17.8 34.4C17.8 30.2 19.4 27.4 21.2 25.6h2.6c1.8 1.8 3.4 4.6 3.4 8.8z"/>` +
  kaide(11.4, 22.2) +
  "</g>";

/** KALE — dört mazgallı burç, aşağı doğru hafif daralan gövde. */
const kale = () =>
  "<g>" +
  `<path d="M11.6 16.6V9.2h4.3v3.2h1.6V9.2h4.3v3.2h1.6V9.2h4.3v3.2h1.6V9.2h4.3v7.4z"/>` +
  `<rect x="13.2" y="16.6" width="18.6" height="3" rx="1.2"/>` +
  `<path d="M15.2 19.6C15.2 25.6 13.8 29.4 13.8 34.4h17.4c0-5-1.4-8.8-1.4-14.8z"/>` +
  kaide(8.2, 28.6) +
  "</g>";

/**
 * AT — sola bakan at başı.
 *
 * Tek kapalı hat: boyun önü → çene altı → burun → alın → kulak → ense →
 * boyun arkası. Göz dolu bir nokta, yele ise ince bir iç çizgidir.
 */
const at = () =>
  "<g>" +
  `<path d="M15.4 34.4` +
  `C15.4 30 16 26.6 17.5 24` +
  `C16 25.4 14.6 26 13.5 25.5` +
  `C11.8 24.8 10.8 23.4 11.6 22.5` +
  `C12.6 20.6 14 18.4 15.5 16.4` +
  `C16.6 14.4 18.2 12 19 10` +
  `L20.6 5.6 24 9` +
  `C27.8 10.6 30.4 13.8 31.4 18` +
  `C32.4 23.4 31.8 29 30.4 34.4z"/>` +
  kaide(8.8, 27.4) +
  "</g>" +
  `<g class="ic-nokta"><circle cx="17.8" cy="17.6" r="1.15"/></g>` +
  `<g class="ic-cizgi"><path d="M23.2 10.6C26.4 12.8 28.6 16 29.4 19.8"/></g>`;

/** FİL — bilinen fil biçimi; tepesinde HAÇ değil sade bir top, yanda eğik yarık. */
const fil = () =>
  "<g>" +
  `<circle cx="22.5" cy="7" r="2.1"/>` +
  `<path d="M15.8 23.8C13.8 20.6 14 16.6 16.2 13 18 10.2 20.2 9 22.5 9s4.5 1.2 6.3 4c2.2 3.6 2.4 7.6 .4 10.8z"/>` +
  `<rect x="13.9" y="23.8" width="17.2" height="3.1" rx="1.4"/>` +
  `<path d="M15.6 34.4C15.6 31 16.8 28.6 18.8 26.9h7.4c2 1.7 3.2 4.1 3.2 7.5z"/>` +
  kaide(8.8, 27.4) +
  "</g>" +
  `<g class="ic-cizgi"><path d="M19.4 17.8 26 12.4"/></g>`;

/** VEZİR — beş toplu klasik taç, altında bilezik ve yayılan gövde. */
const vezir = () =>
  "<g>" +
  `<circle cx="11.8" cy="11.2" r="2.1"/><circle cx="17.1" cy="8.4" r="2.1"/>` +
  `<circle cx="22.5" cy="7" r="2.1"/><circle cx="27.9" cy="8.4" r="2.1"/>` +
  `<circle cx="33.2" cy="11.2" r="2.1"/>` +
  `<path d="M10.8 21.8 11.8 13.2 15.4 19.4 17.1 10.4 20.6 19 22.5 9 24.4 19 27.9 10.4 29.6 19.4 33.2 13.2 34.2 21.8z"/>` +
  `<rect x="11.6" y="21.8" width="21.8" height="3.2" rx="1.4"/>` +
  `<path d="M14.4 34.4C14.4 30.4 15.4 27.4 16.2 25h12.6c.8 2.4 1.8 5.4 1.8 9.4z"/>` +
  kaide(7, 31) +
  "</g>";

/** ŞAH — en uzun taş: padişah kavuğu ve sorgucu; haç yoktur. */
const sah = () =>
  "<g>" +
  `<path d="M20.2 10.4C19.4 6.8 20.8 3 24.2 1.2 27 4.2 26.4 7.6 24.9 10.6z"/>` +
  `<path d="M11.4 23.2C9.6 20.6 9.8 16.6 12 13.8 14.2 11 18 10 22.5 10s8.3 1 10.5 3.8c2.2 2.8 2.4 6.8 .6 9.4z"/>` +
  `<rect x="11.8" y="23.2" width="21.4" height="3.2" rx="1.4"/>` +
  `<path d="M14.4 34.4C14.4 31 15.8 28.4 17.8 26.4h9.4c2 2 3.4 4.6 3.4 8z"/>` +
  kaide(7, 31) +
  "</g>" +
  `<g class="ic-cizgi">` +
  `<path d="M10.4 17.8C13.7 20.5 17.9 21.8 22.5 21.8s8.8-1.3 12.1-4"/>` +
  `<path d="M11.8 13.8C14.6 16 18.3 17.2 22.5 17.2s7.9-1.2 10.7-3.4"/>` +
  "</g>";

const CIZIMLER = { p: piyon, r: kale, n: at, b: fil, q: vezir, k: sah };

/** Taş kodundan CSS sınıflarını üretir: "wq" → "pc pc-w". */
const pcClass = (color) => `pc pc-${color === "b" ? "b" : "w"}`;

/**
 * Bir taşın çizimini üretir.
 * @param {"p"|"n"|"b"|"r"|"q"|"k"} type Taş tipi.
 * @param {"w"|"b"} color Beyaz fildişi, siyah mor-lacivert dolar.
 * @returns {string} SVG işaretlemesi (bilinmeyen tip için boş dize).
 */
export function pieceSvg(type, color) {
  const ciz = CIZIMLER[type];
  if (!ciz) return "";
  return `<svg class="piece-svg ${pcClass(color)}" viewBox="${KUTU}" aria-hidden="true" focusable="false">${ciz()}</svg>`;
}

/**
 * Bir taş kodunu ("wk", "bq", "wb"...) gösterilecek HTML'e çevirir.
 *
 * İkinci parametre eskiden Unicode yedeğiydi; artık kullanılmaz ama çağıran
 * yerleri değiştirmemek için imzada bırakıldı.
 */
export function pieceHTML(code) {
  if (!code) return "";
  return pieceSvg(code[1], code[0]);
}

/**
 * Metin içinde geçen ♙ ♞ ♜ ♛ ♔ ♝ gibi sembolleri çizimimizle değiştirir.
 * Veri dosyalarındaki hazır sembol dizeleri için kullanılır; tanımadığı her
 * şeyi (emoji, düz metin) olduğu gibi geri verir.
 */
export function symbolHTML(symbol) {
  const found = SYMBOL_MAP[symbol];
  return found ? pieceSvg(found[0], found[1]) : symbol;
}

/**
 * Bir kutuya taşı yerleştirir. Aynı taş zaten duruyorsa DOM'a dokunmaz.
 * @returns {boolean} İçerik değiştiyse true.
 */
export function setPieceGlyph(node, code) {
  if (node.dataset.piece === (code || "")) return false;
  node.dataset.piece = code || "";
  if (!code) node.replaceChildren();
  else node.innerHTML = pieceHTML(code);
  return true;
}
