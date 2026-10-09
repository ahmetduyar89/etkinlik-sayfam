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
