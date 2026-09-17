import { defaultProgress } from "../models/progress.js";
import { badges, badgeStatus } from "../data/badges.js";

const KEY = "satranc-okulu-progress";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class ProgressService {
  constructor() {
    this.state = this.load();
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
      return { ...clone(defaultProgress), ...stored, settings: { ...defaultProgress.settings, ...stored?.settings } };
    } catch {
      return clone(defaultProgress);
    }
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
    try {
      localStorage.setItem(KEY, JSON.stringify(this.state));
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

  finishGame(result) {
    this.state.games[result] += 1;
    this.state.xp += result === "won" ? 30 : 12;
    this.checkBadges();
    this.save();
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
