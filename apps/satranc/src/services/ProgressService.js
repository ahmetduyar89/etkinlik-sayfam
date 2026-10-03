import { defaultProgress } from "../models/progress.js";
import { badges, badgeStatus } from "../data/badges.js";

const KEY = "satranc-okulu-progress";
const VERSION = 2;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function localDayKey(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Eski ya da eksik kaydı güncel ilerleme biçimine tamamlar. */
function normalizeProgress(value) {
  const raw = value && typeof value === "object" ? value : {};
  return {
    ...clone(defaultProgress),
    ...raw,
    completedLessons: Array.isArray(raw.completedLessons) ? raw.completedLessons : [],
    solvedPuzzles: Array.isArray(raw.solvedPuzzles) ? raw.solvedPuzzles : [],
    puzzleStats: raw.puzzleStats && typeof raw.puzzleStats === "object" ? raw.puzzleStats : {},
    dailyPractice: raw.dailyPractice && typeof raw.dailyPractice === "object" ? raw.dailyPractice : {},
    badges: Array.isArray(raw.badges) ? raw.badges : [],
    games: { ...defaultProgress.games, ...(raw.games || {}) },
    gamesArchive: Array.isArray(raw.gamesArchive)
      ? raw.gamesArchive.filter((entry) => entry?.id && Array.isArray(entry.moves)).slice(0, 100)
      : [],
    miniGames: raw.miniGames && typeof raw.miniGames === "object" ? raw.miniGames : {},
    settings: { ...defaultProgress.settings, ...(raw.settings || {}) }
  };
}

export class ProgressService {
  constructor() {
    this.store = this.load();
    this.activeProfileId = this.store.activeProfileId;
    this.state = this.store.profiles[this.activeProfileId];
    /** Değişiklik dinleyicileri — bkz. onChange(). */
    this.listeners = new Set();
  }

  /**
   * İlerleme her değiştiğinde haber verir.
   *
   * NEDEN GEREKLİ: XP ve yıldız sayacı üst çubukta durur, ders ekranları ise
   * kendi içinde çalışır. Ders bitince kayda XP işleniyordu ama üst çubuk
   * yalnızca sayfa değişince yeniden çizildiği için sayaç "0" kalıyordu.
   * Çocuk ödülü göremiyordu.
   *
   * Sayfayı baştan çizmek çözüm DEĞİLDİR: çocuk dersin ortasındayken ekran
   * sıfırlanır, az önce cevapladığı soru kaybolurdu. Bunun yerine yalnızca
   * ilgilenen parça (üst çubuk sayaçları) kendini günceller.
   *
   * @param {Function} listener Değişiklikte çağrılır.
   * @returns {Function} Aboneliği bırakan fonksiyon.
   */
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Dinleyicileri uyarır.
   *
   * Bir dinleyicinin hatası diğerlerini engellememelidir; ilerleme kaydı
   * arayüzden daha önemlidir.
   */
  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (error) {
        console.warn("[ilerleme] dinleyici hatası:", error);
      }
    }
  }

  load() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      if (stored?.version === VERSION && stored.profiles && typeof stored.profiles === "object") {
        const profiles = Object.fromEntries(
          Object.entries(stored.profiles).map(([id, value]) => [id, normalizeProgress(value)])
        );
        if (!profiles.teacher) profiles.teacher = normalizeProgress(null);
        const activeProfileId = profiles[stored.activeProfileId] ? stored.activeProfileId : "teacher";
        return {
          version: VERSION,
          activeProfileId,
          profiles,
          profileNames: stored.profileNames && typeof stored.profileNames === "object"
            ? stored.profileNames
            : { teacher: "Öğretmen" }
        };
      }

      // Sürüm 1 tek profildi. Bütün mevcut ilerlemeyi öğretmen profiline
      // taşıyarak hiçbir XP, rozet veya tamamlanan dersi kaybetmeyiz.
      return {
        version: VERSION,
        activeProfileId: "teacher",
        profiles: { teacher: normalizeProgress(stored) },
        profileNames: { teacher: "Öğretmen" }
      };
    } catch {
      return {
        version: VERSION,
        activeProfileId: "teacher",
        profiles: { teacher: normalizeProgress(null) },
        profileNames: { teacher: "Öğretmen" }
      };
    }
  }

  /** Aktif profili değiştirir; profil yoksa temiz bir kayıt oluşturur. */
  switchProfile(id, name = "Öğrenci") {
    const profileId = String(id || "guest");
    if (!this.store.profiles[profileId]) {
      this.store.profiles[profileId] = normalizeProgress(null);
    }
    this.store.profileNames[profileId] = String(name || "Öğrenci").slice(0, 40);
    this.activeProfileId = profileId;
    this.store.activeProfileId = profileId;
    this.state = this.store.profiles[profileId];
    this.save();
  }

  /** Raporlarda kullanılmak üzere bir profil kaydını salt okunur biçimde bulur. */
  profile(id) {
    return this.store.profiles[String(id)] || null;
  }

  get activeProfileName() {
    return this.store.profileNames[this.activeProfileId] || "Öğrenci";
  }

  /** Sınıf yedeğine eklenebilen tüm profil verisi. */
  exportData() {
    return clone(this.store);
  }

  /** Yeni birleşik yedekten profilleri yükler; eski yedeklerde çağrılmaz. */
  importData(data) {
    if (!data || data.version !== VERSION || !data.profiles || typeof data.profiles !== "object") {
      return false;
    }
    const profiles = Object.fromEntries(
      Object.entries(data.profiles).map(([id, value]) => [id, normalizeProgress(value)])
    );
    if (!profiles.teacher) profiles.teacher = normalizeProgress(null);
    this.store = {
      version: VERSION,
      activeProfileId: profiles[data.activeProfileId] ? data.activeProfileId : "teacher",
      profiles,
      profileNames: data.profileNames && typeof data.profileNames === "object"
        ? { ...data.profileNames, teacher: data.profileNames.teacher || "Öğretmen" }
        : { teacher: "Öğretmen" }
    };
    this.activeProfileId = this.store.activeProfileId;
    this.state = this.store.profiles[this.activeProfileId];
    this.save();
    return true;
  }

  /**
   * İlerlemeyi kaydeder.
   *
   * Kayıt başarısız olsa bile uygulama ÇALIŞMAYA DEVAM ETMELİDİR. Tek dosya
   * sürümü USB'den (file://) veya kısıtlı okul bilgisayarlarında açıldığında
   * localStorage engellenmiş olabilir; gizli sekmede kota dolabilir. Böyle bir
   * durumda ders akışının kesilmesi, ilerlemenin kaydedilmemesinden çok daha
   * kötüdür — o yüzden sessizce devam eder ve bir kez uyarırız.
   */
  save() {
    this.store.activeProfileId = this.activeProfileId;
    this.store.profiles[this.activeProfileId] = this.state;
    try {
      localStorage.setItem(KEY, JSON.stringify(this.store));
      this.storageBlocked = false;
    } catch {
      if (!this.storageBlocked) {
        this.storageBlocked = true;
        console.warn("[ilerleme] Kayıt yapılamıyor; bu oturumda ilerleme saklanmayacak.");
      }
    }
    // Kayıt başarısız olsa bile durum bellekte değişti; arayüz güncellenmeli.
    this.notify();
  }

  completeLesson(id, xp = 20, stars = 1) {
    if (!this.state.completedLessons.includes(id)) {
      this.state.completedLessons.push(id);
      this.state.xp += xp;
      this.state.stars += stars;
      this.checkBadges();
      this.save();
    }
  }

  solvePuzzle(id) {
    if (!this.state.solvedPuzzles.includes(id)) {
      this.state.solvedPuzzles.push(id);
      this.state.xp += 15;
      this.state.stars += 1;
      this.checkBadges();
      this.save();
    }
  }

  /** Bulmaca temasındaki doğru, yanlış ve ipucu kullanımını kaydeder. */
  recordPuzzleAttempt(theme, kind) {
    this.state.puzzleStats ||= {};
    const stats = this.state.puzzleStats[theme] || { solved: 0, wrong: 0, hints: 0, lastAt: null };
    if (kind === "solved") stats.solved += 1;
    else if (kind === "wrong") stats.wrong += 1;
    else if (kind === "hint") stats.hints += 1;
    stats.lastAt = new Date().toISOString();
    this.state.puzzleStats[theme] = stats;
    this.save();
  }

  /** Günlük çalışma içinde çözülen soru sayısını bugünün kaydına ekler. */
  recordDailyPuzzle() {
    this.state.dailyPractice ||= {};
    const day = localDayKey();
    this.state.dailyPractice[day] = (this.state.dailyPractice[day] || 0) + 1;
    this.save();
    return this.state.dailyPractice[day];
  }

  dailyCount(day = localDayKey()) {
    return this.state.dailyPractice?.[day] || 0;
  }

  finishGame(result) {
    this.state.games[result] += 1;
    this.state.xp += result === "won" ? 30 : 12;
    this.checkBadges();
    this.save();
  }

  /**
   * Tamamlanmış bir bilgisayar oyununu aktif profil arşivine ekler.
   * Aynı oyun geri alınıp yeniden tamamlanırsa kimliğine göre güncellenir.
   */
  saveGame(game) {
    if (!game?.id || !Array.isArray(game.moves)) return false;
    this.state.gamesArchive ||= [];
    const safe = clone(game);
    const existing = this.state.gamesArchive.findIndex((entry) => entry.id === safe.id);
    if (existing >= 0) this.state.gamesArchive.splice(existing, 1);
    this.state.gamesArchive.unshift(safe);
    this.state.gamesArchive = this.state.gamesArchive.slice(0, 100);
    this.save();
    return true;
  }

  /**
   * XP ekler. `source` yalnızca hata ayıklama ve ileride istatistik için tutulur.
   */
  addXp(amount, source = "") {
    this.state.xp += Math.max(0, Math.round(amount));
    this.checkBadges();
    this.save();
    return this.state.xp;
  }

  /**
   * Bir mini oyun sonucunu kaydeder ve en yüksek skoru günceller.
   * @returns {boolean} Yeni rekor kırıldıysa true.
   */
  recordMiniGame(gameId, score) {
    this.state.miniGames ||= {};
    const record = this.state.miniGames[gameId] || { best: 0, plays: 0, total: 0 };
    const isRecord = score > record.best;

    record.best = Math.max(record.best, score);
    record.plays += 1;
    record.total += score;
    this.state.miniGames[gameId] = record;

    this.checkBadges();
    this.save();
    return isRecord;
  }

  /** Oynanan tüm mini oyunların toplam sayısı. */
  miniGamePlays() {
    return Object.values(this.state.miniGames || {}).reduce((sum, record) => sum + record.plays, 0);
  }

  toggleSetting(key) {
    this.state.settings[key] = !this.state.settings[key];
    this.save();
  }

  reset() {
    this.state = clone(defaultProgress);
    this.store.profiles[this.activeProfileId] = this.state;
    this.save();
  }

  /**
   * Rozetleri yeniden hesaplar ve YENİ açılanların listesini döndürür.
   *
   * Koşullar rozet tanımlarının içinde yaşar (src/data/badges.js); burada
   * kopyalanmaz. Önceden koşullar bu metoda gömülüydü ve yeni içerik
   * eklendiğinde (mini oyunlar, taktik/açılış dersleri) sessizce güncel
   * kalmıyordu.
   *
   * @returns {Array} Bu çağrıda ilk kez açılan rozetler.
   */
  checkBadges() {
    const previous = new Set(this.state.badges);
    const earned = badges.filter((badge) => badgeStatus(badge, this.state).unlocked);

    this.state.badges = earned.map((badge) => badge.id);
    return earned.filter((badge) => !previous.has(badge.id));
  }
}
