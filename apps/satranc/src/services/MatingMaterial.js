/**
 * "Süresi biten oyuncuya karşı rakip mat edebilir mi?" sorusunun cevabı.
 *
 * FIDE Satranç Kuralları (Madde 6.9): bir oyuncunun süresi biterse oyunu
 * kaybeder; ANCAK konum, rakibin hiçbir yasal hamle dizisiyle şahı mat
 * edemeyeceği bir konumsa oyun beraberdir. Ölçüt "zorla mat" değil, "mat
 * teorik olarak mümkün mü"dür — karşı tarafın taşları da (siper olabilir)
 * hesaba girer:
 *
 *   • Rakipte piyon, kale ya da vezir varsa mat mümkündür.
 *   • Tek at ya da tek fil (aynı renkli filler dahil) tek başına mat edemez,
 *     ama süresi biten tarafta şah dışında bir taş varsa o taş siper olup
 *     matı mümkün kılar (örn. Ş+A — Ş+P). Tek istisna: iki tarafta da yalnızca
 *     aynı renkli kareli filler kalmışsa mat imkânsızdır.
 *   • İki at, at + fil ya da zıt renkli iki fil mat edebilir (karşı tarafın
 *     yardımıyla); şah-şah gibi çıplak konumlarda hiçbir şey yapılamaz.
 *
 * `pieces`: { "e1": { color: "w", type: "k" }, ... } (Chess#pieceMap çıktısı)
 */

/** Karenin rengi: a1 koyu, h1 açık. */
function isLight(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (file + rank) % 2 === 0;
}

export function canPossiblyMate(pieces, color) {
  const own = [];
  const rival = [];
  for (const [square, piece] of Object.entries(pieces)) {
    if (piece.type === "k") continue;
    (piece.color === color ? own : rival).push({ type: piece.type, light: isLight(square) });
  }

  if (own.some((p) => p.type === "p" || p.type === "r" || p.type === "q")) return true;
  if (own.length === 0) return false;

  const knights = own.filter((p) => p.type === "n").length;
  const bishops = own.filter((p) => p.type === "b");
  const hasBothShades = bishops.some((p) => p.light) && bishops.some((p) => !p.light);
  if (knights >= 2 || (knights >= 1 && bishops.length >= 1) || hasBothShades) return true;

  // Burada rakipte yalnızca tek at ya da aynı renkli fil(ler) var: mat ancak
  // karşı tarafın bir taşı siper olursa mümkün.
  if (rival.length === 0) return false;
  if (knights === 0) {
    const shade = bishops[0].light;
    if (rival.every((p) => p.type === "b" && p.light === shade)) return false;
  }
  return true;
}
