/**
 * ClassroomService.js — Sınıflar, öğrenciler, maç sonuçları ve turnuvalar.
 *
 * Öğretmen her sınıfın bilgisayarında uygulamayı açar; veriler o
 * bilgisayardaki tarayıcıda (localStorage) kalır. İlerleme kaydından
 * (ProgressService) AYRI bir anahtarda tutulur: çocuğun XP'sini sıfırlamak
 * sınıf listesini silmemeli, sınıf yedeğini geri yüklemek de XP'ye dokunmamalı.
 *
 * Tek doğru kaynak MAÇ kayıtlarıdır. Galibiyet/beraberlik/mağlubiyet ve
 * turnuva puanları her seferinde maçlardan HESAPLANIR; ayrıca saklanmaz.
 * Böylece yanlış girilen bir maç silindiğinde bütün sayılar kendiliğinden
 * düzelir.
 *
 * Öğrenci silindiğinde kayıt tamamen yok edilmez, `removed` işaretlenir:
 * geçmiş maçlarda ve turnuva tablolarında adı görünmeye devam etmelidir.
 */

import { RESULT_POINTS, tally, rankRows, pairRound } from "./SwissPairing.js";

const KEY = "satranc-okulu-siniflar";
const VERSION = 1;

/** Kısa, çakışması pratikte imkânsız kimlik. */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** Türkçe alfabetik sıralama. */
const byName = (a, b) => a.name.localeCompare(b.name, "tr");

/** "  ali   YILMAZ " → "Ali Yılmaz". e-Okul listeleri çoğunlukla büyük harflidir. */
export function tidyName(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toLocaleUpperCase("tr") + word.slice(1).toLocaleLowerCase("tr"))
    .join(" ")
    .slice(0, 40);
}

function emptyState() {
  return { version: VERSION, activeClassId: null, classes: [], matches: [], tournaments: [], rosterVersion: null };
}

export class ClassroomService {
  constructor() {
    this.state = this.load();
    this.listeners = new Set();
  }

  /* ---------------------------------------------------------------- *
   * Kayıt
   * ---------------------------------------------------------------- */

  load() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      return ClassroomService.normalize(stored) || emptyState();
    } catch {
      return emptyState();
    }
  }

  /** Dışarıdan gelen veriyi (kayıt ya da yedek dosyası) güvenli biçime sokar. */
  static normalize(data) {
    if (!data || typeof data !== "object" || !Array.isArray(data.classes)) return null;
    const state = emptyState();
    state.classes = data.classes
      .filter((item) => item && item.id && item.name)
      .map((item) => ({
        id: String(item.id),
        name: String(item.name),
        students: (Array.isArray(item.students) ? item.students : [])
          .filter((student) => student && student.id && student.name)
          .map((student) => ({ id: String(student.id), name: String(student.name), removed: Boolean(student.removed) }))
      }));
    state.matches = Array.isArray(data.matches) ? data.matches.filter((match) => match && RESULT_POINTS[match.result] !== undefined) : [];
    state.tournaments = Array.isArray(data.tournaments) ? data.tournaments.filter((t) => t && Array.isArray(t.rounds)) : [];
    state.activeClassId = state.classes.some((item) => item.id === data.activeClassId) ? data.activeClassId : null;
    state.rosterVersion = typeof data.rosterVersion === "string" ? data.rosterVersion : null;
    return state;
  }

  /** Kaydeder ve dinleyicileri uyarır. Kota dolarsa uygulama çökmesin. */
  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
    } catch (error) {
      console.warn("[sınıflar] kaydedilemedi:", error);
    }
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (error) {
        console.warn("[sınıflar] dinleyici hatası:", error);
      }
    }
  }

  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /* ---------------------------------------------------------------- *
   * Sınıflar
   * ---------------------------------------------------------------- */

  get classes() {
    return [...this.state.classes].sort(byName);
  }

  getClass(id) {
    return this.state.classes.find((item) => item.id === id) || null;
  }

  get activeClass() {
    return this.getClass(this.state.activeClassId);
  }

  setActiveClass(id) {
    this.state.activeClassId = this.getClass(id) ? id : null;
    this.save();
  }

  addClass(rawName) {
    const name = String(rawName || "").replace(/\s+/g, " ").trim().slice(0, 30);
    if (!name) return null;
    const item = { id: uid(), name, students: [] };
    this.state.classes.push(item);
    // Yeni eklenen sınıf hemen seçilir; öğretmen öğrenci eklemeye geçecektir.
    this.state.activeClassId = item.id;
    this.save();
    return item;
  }

  renameClass(id, rawName) {
    const item = this.getClass(id);
    const name = String(rawName || "").replace(/\s+/g, " ").trim().slice(0, 30);
    if (!item || !name) return;
    item.name = name;
    this.save();
  }

  /** Sınıfı, maçlarını ve turnuvalarını siler. */
  deleteClass(id) {
    this.state.classes = this.state.classes.filter((item) => item.id !== id);
    this.state.matches = this.state.matches.filter((match) => match.classId !== id);
    this.state.tournaments = this.state.tournaments.filter((t) => t.classId !== id);
    if (this.state.activeClassId === id) this.state.activeClassId = null;
    this.save();
  }

  /* ---------------------------------------------------------------- *
   * Öğrenciler
   * ---------------------------------------------------------------- */

  /** Sınıfın güncel (silinmemiş) öğrencileri, alfabetik. */
  students(classId) {
    return (this.getClass(classId)?.students || []).filter((student) => !student.removed).sort(byName);
  }

  /** Silinmiş olsa bile öğrenciyi bulur (geçmiş kayıtlarda ad gerekir). */
  findStudent(studentId) {
    for (const item of this.state.classes) {
      const student = item.students.find((s) => s.id === studentId);
      if (student) return student;
    }
    return null;
  }

  studentName(studentId) {
    return this.findStudent(studentId)?.name || "Silinmiş öğrenci";
  }

  /**
   * Bir ya da birden çok öğrenci ekler. Her satır bir öğrencidir; e-Okul'dan
   * kopyalanan satır başındaki sıra/okul numarası atılır.
   * @returns {{added:number, skipped:number}}
   */
  addStudents(classId, text) {
    const item = this.getClass(classId);
    if (!item) return { added: 0, skipped: 0 };

    const existing = new Set(item.students.filter((s) => !s.removed).map((s) => s.name.toLocaleLowerCase("tr")));
    let added = 0;
    let skipped = 0;

    for (const line of String(text).split(/\r?\n/)) {
      const name = tidyName(line.replace(/^\s*\d+[\s.)\-\t]*/, "").replace(/\t+/g, " "));
      if (!name) continue;
      const key = name.toLocaleLowerCase("tr");
      if (existing.has(key)) {
        skipped += 1;
        continue;
      }
      existing.add(key);
      item.students.push({ id: uid(), name, removed: false });
      added += 1;
    }

    if (added) this.save();
    return { added, skipped };
  }

  renameStudent(studentId, rawName) {
    const student = this.findStudent(studentId);
    const name = tidyName(rawName);
    if (!student || !name) return;
    student.name = name;
    this.save();
  }

  removeStudent(studentId) {
    const student = this.findStudent(studentId);
    if (!student) return;
    student.removed = true;
    this.save();
  }

  /* ---------------------------------------------------------------- *
   * Maçlar
   * ---------------------------------------------------------------- */

  /**
   * Maç sonucunu kaydeder.
   * @param {object} data { classId, whiteId, blackId, result: "1-0"|"0-1"|"½-½",
   *                        reason?, moves?, timeControl?, source?, tournamentId?, round? }
   */
  recordMatch(data) {
    if (RESULT_POINTS[data.result] === undefined || !data.whiteId || !data.blackId || data.whiteId === data.blackId) {
      return null;
    }
    const match = {
      id: uid(),
      date: new Date().toISOString(),
      classId: data.classId,
      whiteId: data.whiteId,
      blackId: data.blackId,
      result: data.result,
      reason: data.reason || "",
      moves: data.moves || 0,
      timeControl: data.timeControl || "",
      source: data.source || "duel",
      tournamentId: data.tournamentId || null,
      round: data.round || null
    };
    this.state.matches.push(match);
    this.save();
    return match;
  }

  deleteMatch(matchId) {
    this.state.matches = this.state.matches.filter((match) => match.id !== matchId);
    // Turnuva masası bu maça bağlıysa sonuçsuz kalır.
    for (const t of this.state.tournaments) {
      for (const round of t.rounds) {
        for (const board of round) if (board.matchId === matchId) board.matchId = null;
      }
    }
    this.save();
  }

  getMatch(matchId) {
    return this.state.matches.find((match) => match.id === matchId) || null;
  }

  /** Öğrencinin maçları, yeniden eskiye. */
  matchesOf(studentId) {
    return this.state.matches
      .filter((match) => match.whiteId === studentId || match.blackId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /** Öğrencinin maç özeti: { played, wins, draws, losses, points }. */
  statsOf(studentId) {
    const stats = { played: 0, wins: 0, draws: 0, losses: 0, points: 0 };
    for (const match of this.matchesOf(studentId)) {
      const white = RESULT_POINTS[match.result];
      const points = match.whiteId === studentId ? white : 1 - white;
      stats.played += 1;
      stats.points += points;
      if (points === 1) stats.wins += 1;
      else if (points === 0) stats.losses += 1;
      else stats.draws += 1;
    }
    return stats;
  }

  /** Sınıf sıralaması: puan → galibiyet → ad. */
  classStandings(classId) {
    return this.students(classId)
      .map((student) => ({ student, ...this.statsOf(student.id) }))
      .sort((a, b) => b.points - a.points || b.wins - a.wins || byName(a.student, b.student));
  }

  /* ---------------------------------------------------------------- *
   * Turnuvalar (İsviçre sistemi)
   * ---------------------------------------------------------------- */

  tournaments(classId) {
    return this.state.tournaments
      .filter((t) => t.classId === classId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getTournament(id) {
    return this.state.tournaments.find((t) => t.id === id) || null;
  }

  createTournament({ classId, name, rounds, playerIds }) {
    if (!this.getClass(classId) || playerIds.length < 2) return null;
    // Başlangıç sırası (seed) kurada belirlenir: öğrencilerin reytingi yok ve
    // alfabetik sıra hep aynı çocukları ilk turda karşılaştırırdı.
    const seeded = [...playerIds].sort(() => Math.random() - 0.5);
    const t = {
      id: uid(),
      classId,
      name: String(name || "").trim().slice(0, 40) || "Sınıf Turnuvası",
      createdAt: new Date().toISOString(),
      plannedRounds: Math.max(1, Math.min(20, Number(rounds) || 1)),
      playerIds: seeded,
      withdrawn: [],
      rounds: [],
      finished: false
    };
    this.state.tournaments.push(t);
    this.save();
    return t;
  }

  deleteTournament(id) {
    const matchIds = new Set();
    for (const round of this.getTournament(id)?.rounds || []) {
      for (const board of round) if (board.matchId) matchIds.add(board.matchId);
    }
    this.state.matches = this.state.matches.filter((match) => !matchIds.has(match.id));
    this.state.tournaments = this.state.tournaments.filter((t) => t.id !== id);
    this.save();
  }

  /** Masanın sonucu: "1-0" | "0-1" | "½-½" | "bay" | null. */
  boardResult(board) {
    if (board.blackId === null) return "bay";
    return this.getMatch(board.matchId)?.result || null;
  }

  /** SwissPairing'in beklediği biçimde turlar. */
  roundsForPairing(t) {
    return t.rounds.map((round) =>
      round.map((board) => ({
        whiteId: board.whiteId,
        blackId: board.blackId,
        result: board.blackId === null ? null : this.boardResult(board)
      }))
    );
  }

  /** Puan tablosu (sıralı). */
  tournamentStandings(t) {
    return rankRows(tally(t.playerIds, this.roundsForPairing(t)).values());
  }

  /** Son turun bütün sonuçları girildi mi? */
  roundComplete(t, index = t.rounds.length - 1) {
    const round = t.rounds[index];
    return Boolean(round) && round.every((board) => this.boardResult(board) !== null);
  }

  /** Sonraki turu eşleştirir. Son tur tamamlanmadıysa null döner. */
  pairNextRound(tournamentId) {
    const t = this.getTournament(tournamentId);
    if (!t || t.finished) return null;
    if (t.rounds.length > 0 && !this.roundComplete(t)) return null;

    const active = t.playerIds.filter((id) => !t.withdrawn.includes(id));
    if (active.length < 2) return null;

    const rows = tally(t.playerIds, this.roundsForPairing(t));
    const boards = pairRound(active, rows).map((board, index) => ({
      id: uid(),
      table: index + 1,
      whiteId: board.whiteId,
      blackId: board.blackId,
      matchId: null
    }));
    t.rounds.push(boards);
    this.save();
    return boards;
  }

  /** Son turu geri alır (yanlış eşleştirme ya da eklenecek oyuncu için). */
  undoLastRound(tournamentId) {
    const t = this.getTournament(tournamentId);
    if (!t || t.rounds.length === 0) return;
    const last = t.rounds.pop();
    const ids = new Set(last.map((board) => board.matchId).filter(Boolean));
    this.state.matches = this.state.matches.filter((match) => !ids.has(match.id));
    t.finished = false;
    this.save();
  }

  findBoard(tournamentId, boardId) {
    const t = this.getTournament(tournamentId);
    if (!t) return null;
    for (let index = 0; index < t.rounds.length; index += 1) {
      const board = t.rounds[index].find((item) => item.id === boardId);
      if (board) return { tournament: t, board, round: index + 1 };
    }
    return null;
  }

  /**
   * Masaya sonuç yazar. `result` null ise sonucu siler.
   * Maç kaydı öğrencinin geçmişine de işlenir.
   */
  setBoardResult(tournamentId, boardId, result, extra = {}) {
    const found = this.findBoard(tournamentId, boardId);
    if (!found || found.board.blackId === null) return null;
    const { tournament, board, round } = found;

    if (board.matchId) {
      this.state.matches = this.state.matches.filter((match) => match.id !== board.matchId);
      board.matchId = null;
    }
    if (!result) {
      this.save();
      return null;
    }

    const match = this.recordMatch({
      ...extra,
      classId: tournament.classId,
      whiteId: board.whiteId,
      blackId: board.blackId,
      result,
      source: "tournament",
      tournamentId: tournament.id,
      round
    });
    board.matchId = match?.id || null;
    this.save();
    return match;
  }

  /** Oyuncuyu sonraki turlardan çeker / geri alır. */
  toggleWithdrawn(tournamentId, studentId) {
    const t = this.getTournament(tournamentId);
    if (!t) return;
    t.withdrawn = t.withdrawn.includes(studentId)
      ? t.withdrawn.filter((id) => id !== studentId)
      : [...t.withdrawn, studentId];
    this.save();
  }

  /** Turnuva sürerken sınıfa katılan öğrenciyi ekler (kaçırdığı turlar 0 puan). */
  addTournamentPlayer(tournamentId, studentId) {
    const t = this.getTournament(tournamentId);
    if (!t || t.playerIds.includes(studentId)) return;
    t.playerIds.push(studentId);
    this.save();
  }

  setTournamentFinished(tournamentId, finished) {
    const t = this.getTournament(tournamentId);
    if (!t) return;
    t.finished = Boolean(finished);
    this.save();
  }

  /* ---------------------------------------------------------------- *
   * Gömülü okul listesi
   * ---------------------------------------------------------------- */

  /** Bu bilgisayar gömülü listenin bu sürümünü henüz almadı mı? */
  rosterPending(roster) {
    return Boolean(roster?.version) && this.state.rosterVersion !== roster.version;
  }

  /**
   * Çözülmüş okul listesini BİRLEŞTİREREK ekler; hiçbir şeyi silmez.
   *
   * Kimlikler listede sabittir (bkz. tools/sinif-listesi-gom.py): aynı sınıf
   * ve öğrenci her bilgisayarda aynı kimliği taşır. Bu yüzden:
   *   • bilgisayarda olmayan sınıf ve öğrenciler eklenir,
   *   • var olanlara dokunulmaz (öğretmenin düzelttiği ad korunur),
   *   • listeden çıkarılmış öğrenci bilgisayarda kalır; maç geçmişi bozulmaz.
   *
   * @returns {{classes:number, students:number}} Eklenen sayılar.
   */
  applyRoster(roster, version) {
    let addedClasses = 0;
    let addedStudents = 0;

    for (const source of roster?.classes || []) {
      let item = this.getClass(source.id);
      if (!item) {
        item = { id: source.id, name: source.name, students: [] };
        this.state.classes.push(item);
        addedClasses += 1;
      }
      for (const student of source.students || []) {
        // Öğretmenin bu bilgisayarda listeden çıkardığı öğrenci de "var" sayılır;
        // liste güncellemesi o kararı geri almaz.
        if (item.students.some((s) => s.id === student.id)) continue;
        item.students.push({ id: student.id, name: student.name, removed: false });
        addedStudents += 1;
      }
    }

    this.state.rosterVersion = version;
    this.save();
    return { classes: addedClasses, students: addedStudents };
  }

  /* ---------------------------------------------------------------- *
   * Yedek
   * ---------------------------------------------------------------- */

  exportJSON() {
    return JSON.stringify({ app: "satranc-okulu", exportedAt: new Date().toISOString(), ...this.state }, null, 2);
  }

  /** Yedek dosyasını yükler; geçersizse false döner ve mevcut veriye dokunmaz. */
  importJSON(text) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return false;
    }
    const state = ClassroomService.normalize(parsed);
    if (!state) return false;
    this.state = state;
    this.save();
    return true;
  }
}

/** Uygulama genelinde tek örnek: üst çubuk, sınıf, turnuva ve oyun ekranları paylaşır. */
export const classroom = new ClassroomService();
