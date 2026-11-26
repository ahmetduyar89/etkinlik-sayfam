/** Stable business data; transport metadata must never trigger another write. */
export function recordData(value) {
  if (Array.isArray(value)) return value.map(recordData);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort()
    .filter(k => !["_cloudDocId", "deviceId", "syncedAt", "ownerUid"].includes(k) && value[k] !== undefined)
    .map(k => [k, recordData(value[k])]));
}
export function changesBetween(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])].flatMap(id => {
    const oldValue = before.has(id) ? recordData(before.get(id)) : null;
    const newValue = after.has(id) ? recordData(after.get(id)) : null;
    return JSON.stringify(oldValue) === JSON.stringify(newValue) ? [] : [{ id, before: oldValue, after: newValue }];
  });
}
export function serializeTournament(item) {
  return { ...item, rounds: (item.rounds || []).map((round, i) => ({ roundNumber: i + 1, boards: Array.isArray(round) ? round : round.boards || [] })) };
}
export function deserializeTournament(item) {
  return { ...item, rounds: (item.rounds || []).map(round => Array.isArray(round) ? round : round.boards || []) };
}

/*
 * İlerleme kaydı tek belgede durur ama birden çok cihaz (öğretmen bilgisayarı,
 * akıllı tahta, öğrencinin kendi oturumu, sunucu işlevleri) aynı belgeye yazar.
 * Bütün belgeyi üzerine yazmak diğer cihazın kazandığını siler; "önce aynı mı"
 * denetimi ise çakışmada kaydı reddeder. İkisi de ilerleme kaybettiriyordu.
 *
 * Bunun yerine yalnızca BU cihazda olan değişiklik sunucuya gider:
 *   • sayaçlar (XP, yıldız, oyun sayıları, günlük çalışma) → artış miktarı
 *   • listeler (tamamlanan ders/hafta, çözülen bulmaca, rozet) → eklenenler
 *   • oyun arşivi → yeni oyunlar
 *   • mini oyun ve ayar gibi kayıtlar → yalnız değişen anahtar
 * Böylece iki cihazın aynı anda yaptığı işler toplanır, hiçbiri kaybolmaz.
 */
const COUNTERS = ["xp", "stars"];
const SETS = ["completedLessons", "solvedPuzzles", "badges"];
const GAME_RESULTS = ["won", "lost", "drawn"];
const STAT_FIELDS = ["solved", "wrong", "hints"];
const HANDLED = new Set([...COUNTERS, ...SETS, "games", "dailyPractice", "puzzleStats", "miniGames", "gamesArchive"]);

const same = (a, b) => JSON.stringify(recordData(a ?? null)) === JSON.stringify(recordData(b ?? null));
const num = (value) => (Number.isFinite(value) ? value : 0);
const list = (value) => (Array.isArray(value) ? value : []);
const map = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

/**
 * Bu cihazdaki değişikliği sunucu işlemlerine çevirir.
 *
 * @param {object} before Son bilinen (sunucuyla uzlaşılmış) ilerleme.
 * @param {object} after  Bu cihazdaki güncel ilerleme.
 * @param {{increment:Function, arrayUnion:Function}} ops Firestore alan işlemleri.
 * @returns {{replace:boolean, patch:object|null}} `replace` ise ilerleme
 *   bütünüyle değiştirilmelidir (sıfırlama); değilse `patch` birleştirilir.
 */
export function progressPatch(before, after, ops) {
  const a = map(before);
  const b = map(after);
  // Sayaç azaldıysa ya da liste kısaldıysa bu bir sıfırlamadır; artış
  // mantığıyla anlatılamaz.
  const shrank = COUNTERS.some(k => num(b[k]) < num(a[k])) ||
    GAME_RESULTS.some(k => num(map(b.games)[k]) < num(map(a.games)[k])) ||
    SETS.some(k => list(a[k]).some(item => !list(b[k]).includes(item))) ||
    list(a.gamesArchive).length > 0 && list(b.gamesArchive).length === 0;
  if (shrank) return { replace: true, patch: null };

  const patch = {};
  for (const k of COUNTERS) {
    const delta = num(b[k]) - num(a[k]);
    if (delta) patch[k] = ops.increment(delta);
  }
  for (const k of SETS) {
    const added = list(b[k]).filter(item => !list(a[k]).includes(item));
    if (added.length) patch[k] = ops.arrayUnion(...added);
  }
  const games = {};
  for (const k of GAME_RESULTS) {
    const delta = num(map(b.games)[k]) - num(map(a.games)[k]);
    if (delta) games[k] = ops.increment(delta);
  }
  if (Object.keys(games).length) patch.games = games;

  const daily = {};
  for (const [day, count] of Object.entries(map(b.dailyPractice))) {
    const delta = num(count) - num(map(a.dailyPractice)[day]);
    if (delta) daily[day] = ops.increment(delta);
  }
  if (Object.keys(daily).length) patch.dailyPractice = daily;

  const stats = {};
  for (const [theme, value] of Object.entries(map(b.puzzleStats))) {
    const old = map(map(a.puzzleStats)[theme]);
    const entry = {};
    for (const k of STAT_FIELDS) {
      const delta = num(value?.[k]) - num(old[k]);
      if (delta) entry[k] = ops.increment(delta);
    }
    if (Object.keys(entry).length || value?.lastAt !== old.lastAt) {
      if (value?.lastAt) entry.lastAt = value.lastAt;
      stats[theme] = entry;
    }
  }
  if (Object.keys(stats).length) patch.puzzleStats = stats;

  const mini = {};
  for (const [id, value] of Object.entries(map(b.miniGames))) {
    if (!same(value, map(a.miniGames)[id])) mini[id] = value;
  }
  if (Object.keys(mini).length) patch.miniGames = mini;

  const knownGames = new Set(list(a.gamesArchive).map(game => game?.id));
  const newGames = list(b.gamesArchive).filter(game => game?.id && !knownGames.has(game.id));
  if (newGames.length) patch.gamesArchive = ops.arrayUnion(...newGames);

  for (const [k, value] of Object.entries(b)) {
    if (!HANDLED.has(k) && !same(value, a[k])) patch[k] = value;
  }
  return { replace: false, patch: Object.keys(patch).length ? patch : null };
}

/** Sunucudaki oyun arşivini en yeniden eskiye sıralar ve sınırlar. */
export function tidyArchive(games, limit = 100) {
  const seen = new Set();
  return list(games)
    .filter(game => game?.id && !seen.has(game.id) && seen.add(game.id))
    .sort((x, y) => String(y.playedAt || "").localeCompare(String(x.playedAt || "")))
    .slice(0, limit);
}
