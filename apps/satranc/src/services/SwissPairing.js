/**
 * SwissPairing.js — İsviçre sistemi puan tablosu ve eşleştirme.
 *
 * Okul turnuvası için sadeleştirilmiş Hollanda (Dutch) yöntemi:
 *   • Oyuncular puana göre sıralanır; eşit puanlılar aynı gruptadır.
 *   • Grubun üst yarısı alt yarısıyla eşleşir (1.–5., 2.–6. ... gibi).
 *   • Aynı iki oyuncu ikinci kez karşılaşmaz. İmkânsızsa (az kişi, çok tur)
 *     tekrar eşleşmeye izin verilir — turnuva kilitlenmesin.
 *   • Tek sayıda oyuncu varsa en alttaki, daha önce BAY almamış oyuncu bay
 *     geçer ve 1 puan alır.
 *   • Renkler dengelenir: daha az beyaz oynamış olan beyaz alır.
 *
 * Modül saf fonksiyonlardan oluşur; kayıt ve arayüz bilmez. Bu sayede
 * ClassroomService dışında da (test, doğrulama) kullanılabilir.
 */

/** Sonuç kodu → beyazın aldığı puan. */
export const RESULT_POINTS = { "1-0": 1, "0-1": 0, "½-½": 0.5 };

/** Önerilen tur sayısı: kazananın netleşmesi için log2(n) + 1. */
export function suggestedRounds(playerCount) {
  if (playerCount < 2) return 1;
  return Math.max(1, Math.min(playerCount - 1, Math.ceil(Math.log2(playerCount)) + 1));
}

/**
 * Oyuncu başına özet çıkarır.
 *
 * @param {string[]} playerIds Turnuvadaki oyuncular (başlangıç sırası = seed).
 * @param {Array<Array<{whiteId:string, blackId:string|null, result:string|null}>>} rounds
 *        Her tur için masalar. `blackId === null` bay demektir; `result` henüz
 *        girilmediyse null'dır.
 * @returns {Map<string, object>} id → { points, wins, draws, losses, byes, opponents, colors, seed, buchholz }
 */
export function tally(playerIds, rounds) {
  const rows = new Map(
    playerIds.map((id, seed) => [
      id,
      { id, seed, points: 0, wins: 0, draws: 0, losses: 0, byes: 0, played: 0, opponents: [], colors: [], buchholz: 0 }
    ])
  );

  for (const round of rounds) {
    for (const board of round) {
      const white = rows.get(board.whiteId);
      if (board.blackId === null) {
        if (white) {
          white.byes += 1;
          white.points += 1;
        }
        continue;
      }
      const black = rows.get(board.blackId);
      // Eşleşme yapıldıysa sonuç girilmemiş olsa bile tekrar eşleşme sayılır.
      if (white && black) {
        white.opponents.push(black.id);
        black.opponents.push(white.id);
      }
      if (white) white.colors.push("w");
      if (black) black.colors.push("b");

      if (!board.result) continue;
      const whitePoints = RESULT_POINTS[board.result];
      for (const [row, points] of [[white, whitePoints], [black, 1 - whitePoints]]) {
        if (!row) continue;
        row.played += 1;
        row.points += points;
        if (points === 1) row.wins += 1;
        else if (points === 0) row.losses += 1;
        else row.draws += 1;
      }
    }
  }

  // Buchholz: rakiplerin puan toplamı. Eşit puanda "kiminle oynadığın" belirleyicidir.
  for (const row of rows.values()) {
    row.buchholz = row.opponents.reduce((sum, id) => sum + (rows.get(id)?.points || 0), 0);
  }
  return rows;
}

/** Puan tablosu sırası: puan → Buchholz → galibiyet → başlangıç sırası. */
export function rankRows(rows) {
  return [...rows].sort(
    (a, b) => b.points - a.points || b.buchholz - a.buchholz || b.wins - a.wins || a.seed - b.seed
  );
}

/**
 * Bir sonraki turun eşleşmelerini üretir.
 *
 * @param {string[]} activeIds Bu turda oynayacak oyuncular (çekilenler hariç).
 * @param {Map<string, object>} rows tally() çıktısı.
 * @returns {Array<{whiteId:string, blackId:string|null}>}
 */
export function pairRound(activeIds, rows) {
  // Eşleştirme sırası: puan, sonra başlangıç sırası. Buchholz burada
  // kullanılmaz; eşleştirmenin öngörülebilir olması daha önemlidir.
  const pool = activeIds
    .map((id) => rows.get(id))
    .filter(Boolean)
    .sort((a, b) => b.points - a.points || a.seed - b.seed);

  const toBoards = (pairs, bye) => [
    ...pairs.map(([a, b], index) => colored(a, b, index)),
    // Bay masası en sonda durur; masalar üst sıradakilerden başlar.
    ...(bye ? [{ whiteId: bye.id, blackId: null }] : [])
  ];

  if (pool.length % 2 === 0) {
    return toBoards(solve(pool, false) || solve(pool, true) || greedy(pool), null);
  }

  // Bay adayları: alttan yukarı, önce hiç bay almamışlar. Kalanlar tekrar
  // eşleşmesiz eşleşebiliyorsa o aday seçilir; bay'ı körü körüne en alttakine
  // vermek küçük gruplarda kaçınılabilir tekrar eşleşmelere yol açıyordu.
  const byeOrder = [...pool].reverse().sort((a, b) => a.byes - b.byes);
  const fewestByes = byeOrder[0].byes;
  for (const bye of byeOrder.filter((row) => row.byes === fewestByes)) {
    const pairs = solve(pool.filter((row) => row !== bye), false);
    if (pairs) return toBoards(pairs, bye);
  }
  // Hiçbir aday tekrarsız çözüm vermedi. İkinci kez bay almak, bir rakiple
  // yeniden oynamaktan daha kötüdür (çocuk o tur hiç oynamaz); bu yüzden
  // bay yine hiç bay almamış en alttaki oyuncuya verilir.
  const bye = byeOrder[0];
  const rest = pool.filter((row) => row !== bye);
  return toBoards(solve(rest, true) || greedy(rest), bye);
}

/**
 * Geri izlemeli eşleştirme. Başarısızsa null döner.
 * Adım sınırı, büyük ve kilitlenmiş durumlarda tarayıcının donmasını önler.
 */
function solve(players, allowRepeat) {
  let steps = 0;

  function walk(pool) {
    if (pool.length === 0) return [];
    if ((steps += 1) > 50000) return null;

    const [top, ...rest] = pool;
    let list = candidates(top, rest);
    if (allowRepeat) {
      // Tekrar kaçınılmazsa bile önce daha önce karşılaşmamış rakipler denenir.
      list = [...list.filter((row) => !top.opponents.includes(row.id)), ...list.filter((row) => top.opponents.includes(row.id))];
    } else {
      list = list.filter((row) => !top.opponents.includes(row.id));
    }
    for (const candidate of list) {
      const next = walk(rest.filter((row) => row !== candidate));
      if (next) return [[top, candidate], ...next];
    }
    return null;
  }

  return walk(players);
}

/**
 * `top` için rakip adaylarını tercih sırasına dizer.
 *
 * `top` her zaman kalan havuzun en üstündedir. Kendi puan grubunda grubun
 * ORTASINDAKİ oyuncu ilk tercihtir (üst yarı – alt yarı eşleşmesi); oradan
 * aşağı, sonra yukarı doğru gidilir. Gruptan kimse uymazsa bir alt puan
 * grubuna inilir.
 */
function candidates(top, rest) {
  const group = rest.filter((row) => row.points === top.points);
  const others = rest.filter((row) => row.points !== top.points);
  const start = Math.max(0, Math.floor((group.length + 1) / 2) - 1);
  return [...group.slice(start), ...group.slice(0, start).reverse(), ...others];
}

/** Hiçbir yol bulunamazsa sırayla eşleştirir (pratikte ulaşılmaz). */
function greedy(pool) {
  const pairs = [];
  for (let index = 0; index + 1 < pool.length; index += 2) pairs.push([pool[index], pool[index + 1]]);
  return pairs;
}

/** Renk dengesi: az beyaz oynamış beyaz alır; eşitse son turda siyah olan. */
function colored(a, b, boardIndex) {
  const balance = (row) => row.colors.filter((c) => c === "w").length - row.colors.filter((c) => c === "b").length;
  const diff = balance(a) - balance(b);
  let aWhite;
  if (diff !== 0) aWhite = diff < 0;
  else {
    const lastA = a.colors[a.colors.length - 1];
    const lastB = b.colors[b.colors.length - 1];
    if (lastA && lastB && lastA !== lastB) aWhite = lastA === "b";
    // İlk tur ya da tam eşitlik: masalar dönüşümlü (1. masada üstteki beyaz).
    else aWhite = boardIndex % 2 === 0;
  }
  return aWhite ? { whiteId: a.id, blackId: b.id } : { whiteId: b.id, blackId: a.id };
}
