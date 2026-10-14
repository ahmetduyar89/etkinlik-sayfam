/**
 * Satranç kayıtlarının sunucu ile eşitlenmesi.
 *
 * Kurallar:
 *   • Sunucu ortak kaynaktır; öğretmen ekranı yalnız oradaki kaydı görür.
 *   • Bu cihazda yapılan HİÇBİR iş sessizce atılmaz. Bağlantı yoksa kayıt
 *     cihazda (Firestore'un kalıcı kuyruğunda) bekler, bağlantı gelince gider;
 *     sayfa yenilense bile kaybolmaz.
 *   • Açılışta bu cihazın eski yerel verisi sunucuya YÜKLENMEZ. Yalnız bu
 *     oturumda yapılan değişiklikler gönderilir.
 *   • İlerleme belgesine artış/ekleme olarak yazılır (bkz. progressPatch); iki
 *     cihaz aynı anda çalışsa da biri diğerinin işini silmez.
 *   • Maç her zaman kendi belgesidir; turnuva tek belgedir (son yazan geçerli).
 */
import { defaultProgress } from "../models/progress.js";
import { recordData, changesBetween, serializeTournament, deserializeTournament, progressPatch, tidyArchive } from "./CloudRecords.js";

const SDK = "https://www.gstatic.com/firebasejs/10.8.0";
const DEVICE_KEY = "satranc-okulu-device-id";
const STREAMS = ["classes", "chess_matches", "chess_tournaments", "chess_progress"];

const clean = (value) => JSON.parse(JSON.stringify(value ?? null));
const key = (classId, localId) => `${encodeURIComponent(classId)}--${encodeURIComponent(localId)}`;

function deviceId() {
  try {
    let value = localStorage.getItem(DEVICE_KEY);
    if (!value) {
      value = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(DEVICE_KEY, value);
    }
    return value;
  } catch {
    return `session-${Math.random().toString(36).slice(2, 9)}`;
  }
}

function announce(status, detail = "", extra = {}) {
  window.dispatchEvent(new CustomEvent("satranc-cloud-status", { detail: { status, detail, ...extra } }));
}

async function loadFirebase() {
  const configUrl = new URL("../../firebase-config.json", import.meta.url);
  const config = await fetch(configUrl, { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error("Firebase yapılandırması bulunamadı.");
    return response.json();
  });
  if (!config.apiKey || !config.projectId) throw new Error("Firebase yapılandırması eksik.");

  const [appSdk, authSdk, storeSdk] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`)
  ]);
  const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(config);
  const auth = authSdk.getAuth(app);
  if (typeof auth.authStateReady === "function") await auth.authStateReady();
  let db;
  try {
    // Kalıcı önbellek: bekleyen yazımlar sayfa kapansa da cihazda kalır.
    // Okul ağları akış bağlantısını sık keser; uzun yoklamaya kendiliğinden geçer.
    db = storeSdk.initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalAutoDetectLongPolling: true,
      localCache: storeSdk.persistentLocalCache({ tabManager: storeSdk.persistentMultipleTabManager() })
    });
  } catch {
    db = storeSdk.getFirestore(app);
  }
  return { auth, db, storeSdk, authSdk };
}

/** Öğretmen bir sınıf bağlantısıyla geldiyse (…?classId=) o sınıf açılır. */
function requestedClassId() {
  try { return new URLSearchParams(location.search).get("classId"); } catch { return null; }
}

export async function startCloudSync({ classroom, progress, connect = loadFirebase }) {
  announce("connecting", "Sunucuya bağlanılıyor.");
  try {
    if (!localStorage.getItem("satranc-online-migration-backup")) {
      localStorage.setItem("satranc-online-migration-backup", JSON.stringify({
        exportedAt: new Date().toISOString(), classroom: classroom.state, progress: progress.store
      }));
    }
  } catch (error) { console.warn("[satranç] eski kayıt yedeği alınamadı", error); }
  if (!location.protocol.startsWith("http")) {
    announce("signed-out", "Kayıtların öğretmen ekranına gitmesi için uygulamayı Atölye web adresinden açın.", { blocking: true });
    return () => {};
  }
  let firebase;
  try { firebase = await connect(); }
  catch (error) { announce("error", `Sunucuya bağlanılamadı: ${error.message}`, { blocking: true }); return () => {}; }
  const { auth, db, storeSdk, authSdk } = firebase;
  const { collection, doc, query, where, onSnapshot, setDoc, deleteDoc, serverTimestamp, increment, arrayUnion } = storeSdk;
  const user = auth.currentUser;
  if (!user || user.isAnonymous) {
    announce("signed-out", "Atölye üzerinden öğretmen veya sınıf hesabınızla giriş yapın.", { blocking: true });
    return () => {};
  }
  let claims;
  try { claims = (await user.getIdTokenResult()).claims; }
  catch (error) { announce("error", error.message, { blocking: true }); return () => {}; }
  const teacher = claims.role === "teacher";
  const classId = ["class", "student"].includes(claims.role) ? claims.classId : null;
  if (!teacher && !classId) {
    announce("signed-out", "Bu oturumun satranç eğitim kayıtlarına erişimi bulunmuyor.", { blocking: true });
    return () => {};
  }
  window.dispatchEvent(new CustomEvent("satranc-cloud-session", { detail: claims }));

  const device = deviceId();
  const wantedClassId = teacher ? requestedClassId() : classId;
  let stopped = false;
  let applyingRemote = false;
  let timer = null;
  let inflight = 0;
  let writeFailure = "";
  let readFailure = "";
  let pickedWanted = false;
  let readyAnnounced = false;
  const stops = [];
  const loaded = new Set();     // akıştan en az bir anlık görüntü geldi (önbellek dahil)
  const confirmed = new Set();  // sunucu onaylı anlık görüntü geldi
  let serverClasses = clean(classroom.state.classes) || [];

  const scoped = (name) => teacher ? collection(db, name) : claims.role === "student" && name === "chess_progress"
    ? query(collection(db, name), where("classId", "==", classId), where("profileId", "==", `student:${claims.studentId}`))
    : query(collection(db, name), where("classId", "==", classId));

  function profileClass(profileId) {
    if (profileId.startsWith("class:")) return profileId.slice(6);
    if (!profileId.startsWith("student:")) return null;
    const studentId = profileId.slice(8);
    if (claims.role === "student") return studentId === claims.studentId ? classId : null;
    return serverClasses.find(c => c.students.some(s => s.id === studentId))?.id || null;
  }

  /** Bu cihazın gönderebileceği kayıtlar, sunucudaki belge kimlikleriyle. */
  function currentRecords() {
    const values = { chess_matches: new Map(), chess_tournaments: new Map(), chess_progress: new Map() };
    for (const [name, field] of [["chess_matches", "matches"], ["chess_tournaments", "tournaments"]]) {
      for (const item of classroom.state[field] || []) {
        if (!item.classId || (!teacher && item.classId !== classId)) continue;
        const data = name === "chess_tournaments" ? serializeTournament(item) : clean(item);
        values[name].set(item._cloudDocId || key(item.classId, item.id), recordData({ ...data, localId: item.id }));
      }
    }
    for (const [profileId, value] of Object.entries(progress.store.profiles)) {
      const ownerClass = profileClass(profileId);
      if (!ownerClass || (!teacher && ownerClass !== classId)) continue;
      values.chess_progress.set(key(ownerClass, profileId), {
        classId: ownerClass, profileId, profileName: progress.store.profileNames[profileId] || "Öğrenci", progress: clean(value)
      });
    }
    return values;
  }

  // Karşılaştırma tabanı: açılıştaki yerel durum. Sunucudan görüntü geldikçe
  // onunla değişir. Böylece yalnız bu oturumda yapılan işler gönderilir.
  const base = currentRecords();
  for (const name of Object.keys(base)) base[name] = new Map([...base[name]].map(([id, v]) => [id, recordData(v)]));
  // Sunucudan gelen son görüntü. Ekrana (ve tabana) yalnız apply ile geçer;
  // bütün akışlar gelmeden yarım veriyle karşılaştırma yapılmaz.
  const server = { chess_matches: new Map(), chess_tournaments: new Map(), chess_progress: new Map() };

  function status() {
    if (stopped) return;
    const counts = { pending: inflight };
    const failure = writeFailure || readFailure;
    if (failure) return announce("error", failure, counts);
    if (teacher && !classroom.state.activeClassId) {
      return announce("no-class", "Ders ilerlemesinin kaydedilmesi için üst çubuktan sınıf seçin.", counts);
    }
    const online = navigator.onLine !== false;
    if (!online) {
      return announce("offline", inflight
        ? `İnternet yok. ${inflight} kayıt bu cihazda bekliyor; bağlantı gelince kendiliğinden gönderilecek.`
        : "İnternet yok. Yaptığınız çalışmalar bu cihazda saklanır, bağlantı gelince gönderilir.", counts);
    }
    if (confirmed.size < STREAMS.length) {
      return announce("connecting", inflight
        ? `Sunucuya bağlanılıyor. ${inflight} kayıt gönderilmeyi bekliyor; çalışmaya devam edebilirsiniz.`
        : "Sunucudan güncel kayıtlar alınıyor; çalışmaya devam edebilirsiniz.", counts);
    }
    if (inflight || timer) return announce("saving", "Kayıt sunucuya gönderiliyor.", counts);
    announce("online", "Bütün kayıtlar sunucuda. Öğretmen ekranı güncel.", counts);
  }

  /** Yazımı izler; hata kalıcıysa (yetki) kullanıcıya gösterilir. */
  function track(promise, label) {
    inflight += 1;
    status();
    promise.then(() => { writeFailure = ""; }, error => {
      console.warn("[satranç] kayıt gönderilemedi", label, error);
      writeFailure = error?.code === "permission-denied"
        ? "Bu oturumun bu kaydı değiştirme yetkisi yok. Atölye’den doğru sınıf ya da öğretmen hesabıyla tekrar giriş yapın."
        : `Kayıt gönderilemedi: ${error?.message || error}`;
    }).finally(() => {
      inflight -= 1;
      status();
    });
  }

  function writeProgress(id, before, after) {
    const { replace, patch } = progressPatch(before?.progress, after.progress, { increment, arrayUnion });
    const meta = { classId: after.classId, profileId: after.profileId, profileName: after.profileName,
      ownerUid: user.uid, deviceId: device, syncedAt: serverTimestamp() };
    const ref = doc(db, "chess_progress", id);
    if (replace) {
      track(setDoc(ref, { ...meta, progress: after.progress }, { mergeFields: [...Object.keys(meta), "progress"] }), id);
    } else if (patch || !before || before.profileName !== after.profileName) {
      track(setDoc(ref, { ...meta, ...(patch ? { progress: patch } : {}) }, { merge: true }), id);
    }
  }

  /** Bekleyen yerel değişiklikleri hemen sunucu kuyruğuna verir. */
  function flush() {
    if (timer) { window.clearTimeout(timer); timer = null; }
    if (stopped) return;
    const values = currentRecords();
    for (const name of Object.keys(base)) {
      for (const change of changesBetween(base[name], values[name])) {
        if (name === "chess_progress") {
          if (change.after) writeProgress(change.id, change.before, change.after);
          // İlerleme belgesi istemciden silinmez.
        } else {
          const ref = doc(db, name, change.id);
          track(change.after
            ? setDoc(ref, { ...change.after, ownerUid: user.uid, deviceId: device, syncedAt: serverTimestamp() })
            : deleteDoc(ref), `${name}/${change.id}`);
        }
        if (change.after) base[name].set(change.id, change.after); else base[name].delete(change.id);
      }
    }
    status();
  }

  function apply() {
    applyingRemote = true;
    try {
      classroom.state.classes = clean(serverClasses);
      if (!teacher) classroom.state.activeClassId = classId;
      else if (!pickedWanted && wantedClassId && serverClasses.some(c => c.id === wantedClassId)) {
        classroom.state.activeClassId = wantedClassId;
        pickedWanted = true;
      } else if (!serverClasses.some(c => c.id === classroom.state.activeClassId)) classroom.state.activeClassId = null;
      for (const [name, field] of [["chess_matches", "matches"], ["chess_tournaments", "tournaments"]]) {
        classroom.state[field] = [...server[name]].map(([id, data]) => ({
          ...(name === "chess_tournaments" ? deserializeTournament(clean(data)) : clean(data)),
          id: data.localId || data.id || id, _cloudDocId: id
        }));
      }
      const profiles = { teacher: progress.store.profiles.teacher || clean(defaultProgress) };
      const names = { teacher: "Öğretmen" };
      for (const data of server.chess_progress.values()) if (data.profileId && data.progress) {
        profiles[data.profileId] = {
          ...clean(defaultProgress), ...clean(data.progress),
          gamesArchive: tidyArchive(data.progress.gamesArchive),
          settings: { ...defaultProgress.settings, ...data.progress.settings }
        };
        names[data.profileId] = data.profileName || "Öğrenci";
      }
      // Sunucuda henüz belgesi olmayan aktif profil boş başlar; misafir ve
      // öğretmen profilleri yalnız bu cihazdadır.
      for (const id of [progress.activeProfileId, "guest"]) {
        if (!profiles[id] && progress.store.profiles[id] && !profileClass(id)) profiles[id] = progress.store.profiles[id];
        if (!names[id] && progress.store.profileNames[id]) names[id] = progress.store.profileNames[id];
      }
      progress.store.profiles = profiles;
      progress.store.profileNames = names;
      progress.state = profiles[progress.activeProfileId] || clean(defaultProgress);
      classroom.save();
      progress.state = progress.store.profiles[progress.activeProfileId] || progress.state;
      progress.save();
    } finally { applyingRemote = false; }
    // Taban, ekrandaki (biçimi tamamlanmış) hâle eşitlenir. Bekleyen yerel iş
    // apply'dan hemen önce kuyruğa verildiği için burada kaybolan bir şey yok;
    // bundan sonraki her fark gerçekten bu cihazda yapılmış bir iştir.
    const now = currentRecords();
    for (const name of Object.keys(base)) base[name] = new Map([...now[name]].map(([id, v]) => [id, recordData(v)]));
  }

  function changed() {
    if (applyingRemote || stopped) return;
    if (JSON.stringify(classroom.state.classes) !== JSON.stringify(serverClasses) && loaded.has("classes")) {
      classroom.state.classes = clean(serverClasses);
      window.alert("Sınıf ve öğrenci listesini Atölye’nin Sınıflar bölümünden düzenleyin. Satranç listesi oradan canlı güncellenir.");
      apply();
      return;
    }
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(flush, 250);
    status();
  }

  const watch = (name, target) => stops.push(onSnapshot(target, { includeMetadataChanges: true }, snapshot => {
    if (stopped) return;
    // Önce bu cihazdaki bekleyen değişiklik kuyruğa girer; sonra sunucu görüntüsü
    // (bekleyen yazımlar dahil) uygulanır. Böylece görüntü hiçbir işi ezmez.
    flush();
    loaded.add(name);
    if (snapshot.metadata.fromCache) confirmed.delete(name); else confirmed.add(name);
    if (name === "classes") {
      const docs = Array.isArray(snapshot.docs) ? snapshot.docs : snapshot.exists() ? [snapshot] : [];
      serverClasses = docs.map(d => ({ id: d.id, name: d.data().name || "Sınıf", students: (d.data().students || []).map(s => ({ id: s.id, name: s.name, removed: s.active === false || Boolean(s.removed) })) }));
    } else {
      server[name] = new Map(snapshot.docs.map(d => [d.id, recordData(d.data())]));
      if (name === "chess_progress" && !snapshot.metadata.fromCache) trimArchives(server[name]);
    }
    if (loaded.size === STREAMS.length) {
      const first = !readyAnnounced;
      apply();
      if (first) { readyAnnounced = true; window.dispatchEvent(new CustomEvent("satranc-cloud-ready")); }
    }
    if (!snapshot.metadata.fromCache) readFailure = "";
    status();
    window.dispatchEvent(new CustomEvent("satranc-cloud-data"));
  }, error => {
    readFailure = error?.code === "permission-denied"
      ? "Bu oturum satranç kayıtlarını okuyamıyor. Atölye’den tekrar giriş yapın."
      : `Sunucu bağlantı hatası: ${error.message}`;
    status();
  }));

  /** Sunucudaki oyun arşivi sınırı aşarsa en yeni 100 oyun bırakılır. */
  function trimArchives(records) {
    for (const [id, data] of records) {
      const games = data.progress?.gamesArchive;
      if (!Array.isArray(games) || games.length <= 120) continue;
      if (!teacher && data.classId !== classId) continue;
      track(setDoc(doc(db, "chess_progress", id), { progress: { gamesArchive: tidyArchive(games) } }, { merge: true }), `${id} arşiv`);
    }
  }

  watch("classes", teacher ? collection(db, "classes") : doc(db, "classes", classId));
  for (const name of STREAMS.slice(1)) watch(name, scoped(name));
  stops.push(classroom.onChange(changed), progress.onChange(changed));
  const networkChanged = () => status();
  window.addEventListener("online", networkChanged);
  window.addEventListener("offline", networkChanged);
  // Sekme kapanırken bekleyen değişiklik kuyruğa yazılır.
  const leaving = () => flush();
  window.addEventListener("pagehide", leaving);
  const doc_ = typeof document === "undefined" ? null : document;
  const hidden = () => { if (doc_?.visibilityState === "hidden") flush(); };
  doc_?.addEventListener("visibilitychange", hidden);
  const retry = () => window.location.reload();
  window.addEventListener("satranc-cloud-retry", retry);
  if (authSdk?.onIdTokenChanged) stops.push(authSdk.onIdTokenChanged(auth, next => {
    if (!next || next.uid !== user.uid) { readFailure = "Oturum değişti. Atölye üzerinden tekrar giriş yapın."; status(); }
  }));
  status();
  return () => {
    flush();
    stopped = true;
    for (const stop of stops) stop();
    window.removeEventListener("online", networkChanged);
    window.removeEventListener("offline", networkChanged);
    window.removeEventListener("pagehide", leaving);
    doc_?.removeEventListener("visibilitychange", hidden);
    window.removeEventListener("satranc-cloud-retry", retry);
  };
}
