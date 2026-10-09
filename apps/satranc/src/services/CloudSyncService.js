/** Central records are authoritative; local storage is only a display cache. */
import { defaultProgress } from "../models/progress.js";
import { recordData, changesBetween, serializeTournament, deserializeTournament } from "./CloudRecords.js";

const SDK = "https://www.gstatic.com/firebasejs/10.8.0";
const DEVICE_KEY = "satranc-okulu-device-id";

const clean = (value) => JSON.parse(JSON.stringify(value));
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

function announce(status, detail = "") {
  window.dispatchEvent(new CustomEvent("satranc-cloud-status", { detail: { status, detail } }));
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
    db = storeSdk.initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    db = storeSdk.getFirestore(app);
  }
  return { auth, db, storeSdk, authSdk };
}

export async function startCloudSync({ classroom, progress, connect = loadFirebase }) {
  announce("connecting", "Güncel sınıflar ve satranç kayıtları sunucudan alınıyor.");
  // Keep the original offline data separately. Never upload it on startup.
  try {
    if (!localStorage.getItem("satranc-online-migration-backup")) {
      localStorage.setItem("satranc-online-migration-backup", JSON.stringify({
        exportedAt: new Date().toISOString(), classroom: classroom.state, progress: progress.store
      }));
    }
  } catch (error) { console.warn("[satranç] eski kayıt yedeği alınamadı", error); }
  if (!location.protocol.startsWith("http")) {
    announce("error", "Çevrimiçi satranç için Atölye web adresinden giriş yapın. Dosya üzerinden eşzamanlı kayıt yapılamaz.");
    return () => {};
  }
  let firebase;
  try { firebase = await connect(); }
  catch (error) { announce("error", error.message); return () => {}; }
  const { auth, db, storeSdk, authSdk } = firebase;
  const { collection, doc, query, where, onSnapshot, runTransaction, serverTimestamp } = storeSdk;
  const user = auth.currentUser;
  if (!user || user.isAnonymous) {
    announce("signed-out", "Atölye üzerinden öğretmen veya sınıf hesabınızla giriş yapın.");
    return () => {};
  }
  let claims;
  try { claims = (await user.getIdTokenResult()).claims; }
  catch (error) { announce("error", error.message); return () => {}; }
  const teacher = claims.role === "teacher";
  const classId = ["class", "student"].includes(claims.role) ? claims.classId : null;
  if (!teacher && !classId) {
    announce("signed-out", "Bu oturumun satranç eğitim kayıtlarına erişimi bulunmuyor.");
    return () => {};
  }
  window.dispatchEvent(new CustomEvent("satranc-cloud-session", { detail: claims }));
  let stopped = false;
  let applyingRemote = false;
  let writing = false;
  let timer;
  let failure = "";
  const stops = [];
  const ready = new Set();
  const cached = new Set(["classes", "chess_matches", "chess_tournaments", "chess_progress"]);
  const base = { chess_matches: new Map(), chess_tournaments: new Map(), chess_progress: new Map() };
  let serverClasses = [];
  const device = deviceId();
  const pending = new Map();
  const scoped = (name) => teacher ? collection(db, name) : claims.role === "student" && name === "chess_progress"
    ? query(collection(db, name), where("classId", "==", classId), where("profileId", "==", `student:${claims.studentId}`))
    : query(collection(db, name), where("classId", "==", classId));
  const writable = () => !stopped && !failure && navigator.onLine && ready.size === 4 && cached.size === 0;
  const status = () => {
    if (stopped) return;
    if (failure) announce("error", failure);
    else if (!navigator.onLine || cached.size && ready.size === 4) announce("offline", "Sunucu bağlantısı kesildi. Bağlantı gelene kadar yeni kayıt yapılamaz.");
    else if (ready.size < 4) announce("connecting", "Sunucudan güncel kayıtlar bekleniyor.");
    else if (writing || pending.size || timer) announce("saving", "Değişiklik sunucu onayı bekliyor.");
    else announce("online", "Güncel kayıtlar sunucudan alındı; değişiklikler canlı izleniyor.");
  };
  function apply() {
    applyingRemote = true;
    try {
      classroom.state.classes = clean(serverClasses);
      if (!teacher) classroom.state.activeClassId = classId;
      else if (!serverClasses.some(c => c.id === classroom.state.activeClassId)) classroom.state.activeClassId = serverClasses[0]?.id || null;
      for (const [name, field] of [["chess_matches", "matches"], ["chess_tournaments", "tournaments"]]) {
        const records = new Map(base[name]);
        for (const change of pending.values()) if (change.collection === name) {
          if (change.after) records.set(change.id, change.after); else records.delete(change.id);
        }
        classroom.state[field] = [...records].map(([id, data]) => ({
          ...(name === "chess_tournaments" ? deserializeTournament(clean(data)) : clean(data)),
          id: data.localId || data.id || id, _cloudDocId: id
        }));
      }
      const profiles = { teacher: clean(defaultProgress) };
      const names = { teacher: "Öğretmen" };
      const records = new Map(base.chess_progress);
      for (const change of pending.values()) if (change.collection === "chess_progress") {
        if (change.after) records.set(change.id, change.after); else records.delete(change.id);
      }
      for (const data of records.values()) if (data.profileId && data.progress) {
        profiles[data.profileId] = { ...clean(defaultProgress), ...clean(data.progress), settings: { ...defaultProgress.settings, ...data.progress.settings } };
        names[data.profileId] = data.profileName || "Öğrenci";
      }
      progress.store.profiles = profiles;
      progress.store.profileNames = names;
      progress.state = profiles[progress.activeProfileId] || clean(defaultProgress);
      classroom.save();
      progress.state = profiles[progress.activeProfileId] || progress.state;
      progress.save();
    } finally { applyingRemote = false; }
  }
  function currentRecords() {
    const values = { chess_matches: new Map(), chess_tournaments: new Map(), chess_progress: new Map() };
    for (const [name, field] of [["chess_matches", "matches"], ["chess_tournaments", "tournaments"]]) {
      for (const item of classroom.state[field]) if (item.classId && (teacher || item.classId === classId)) {
        const data = name === "chess_tournaments" ? serializeTournament(item) : clean(item);
        const id = item._cloudDocId || key(item.classId, item.id);
        const existing = base[name].get(id);
        const value = recordData({ ...data, localId: item.id });
        if (existing && !("localId" in existing)) delete value.localId;
        if (existing && !("id" in existing)) delete value.id;
        values[name].set(id, value);
      }
    }
    for (const [profileId, value] of Object.entries(progress.store.profiles)) {
      const ownerClass = profileId.startsWith("class:") ? profileId.slice(6) : serverClasses.find(c => c.students.some(s => profileId === `student:${s.id}`))?.id;
      if (!ownerClass || (!teacher && ownerClass !== classId) || (claims.role === "student" && profileId !== `student:${claims.studentId}`)) continue;
      values.chess_progress.set(key(ownerClass, profileId), {
        classId: ownerClass, profileId, profileName: progress.store.profileNames[profileId] || "Öğrenci", progress: clean(value)
      });
    }
    return values;
  }
  async function flush() {
    timer = null;
    if (!writable()) { pending.clear(); apply(); status(); return; }
    writing = true;
    status();
    const changes = [...pending.values()];
    try {
      if (changes.length > 450) throw new Error("Çok fazla kayıt değişti. Yedek aktarımını küçük gruplar halinde yapın.");
      await runTransaction(db, async transaction => {
        const snapshots = await Promise.all(changes.map(c => transaction.get(doc(db, c.collection, c.id))));
        snapshots.forEach((snapshot, index) => {
          const c = changes[index];
          const current = snapshot.exists() ? recordData(snapshot.data()) : null;
          if (JSON.stringify(current) !== JSON.stringify(c.before)) throw new Error("Bu kayıt başka bir cihazda değişti. Güncel veri alındı; işlemi tekrar yapın.");
        });
        changes.forEach(c => {
          const ref = doc(db, c.collection, c.id);
          if (!c.after) transaction.delete(ref);
          else transaction.set(ref, { ...c.after, ownerUid: user.uid, deviceId: device, syncedAt: serverTimestamp() });
        });
      });
      // Listener may arrive before or after the transaction acknowledgement.
      for (const c of changes) {
        const seen = base[c.collection].get(c.id) || null;
        if (JSON.stringify(recordData(seen)) === JSON.stringify(c.before)) {
          if (c.after) base[c.collection].set(c.id, c.after); else base[c.collection].delete(c.id);
        }
      }
    } catch (error) {
      failure = error.message || "Kayıt sunucuya gönderilemedi.";
    } finally {
      pending.clear(); writing = false;
      apply(); status();
    }
  }
  function changed() {
    if (applyingRemote || stopped) return;
    if (!writable() || writing) { apply(); status(); return; }
    if (JSON.stringify(classroom.state.classes) !== JSON.stringify(serverClasses)) {
      classroom.state.classes = clean(serverClasses);
      window.alert("Sınıf ve öğrenci listesini Atölye’nin Sınıflar bölümünden düzenleyin. Satranç listesi oradan canlı güncellenir.");
      apply();
      return;
    }
    const values = currentRecords();
    const previous = new Map(pending);
    pending.clear();
    for (const name of Object.keys(base)) for (const change of changesBetween(base[name], values[name])) {
      const id = `${name}/${change.id}`;
      pending.set(id, { collection: name, ...change, before: previous.has(id) ? previous.get(id).before : change.before });
    }
    if (timer) window.clearTimeout(timer);
    timer = pending.size ? window.setTimeout(() => void flush(), 250) : null;
    status();
  }
  // Initial state is hidden until all four authoritative server streams are ready.
  const watch = (name, target) => stops.push(onSnapshot(target, { includeMetadataChanges: true }, snapshot => {
    if (stopped) return;
    if (snapshot.metadata.fromCache) { cached.add(name); status(); return; }
    if (snapshot.metadata.hasPendingWrites) return;
    cached.delete(name); ready.add(name);
    if (name === "classes") {
      const docs = Array.isArray(snapshot.docs) ? snapshot.docs : snapshot.exists() ? [snapshot] : [];
      serverClasses = docs.map(d => ({ id: d.id, name: d.data().name || "Sınıf", students: (d.data().students || []).map(s => ({ id: s.id, name: s.name, removed: s.active === false || Boolean(s.removed) })) }));
    } else base[name] = new Map(snapshot.docs.map(d => [d.id, recordData(d.data())]));
    if (ready.size === 4) apply();
    status();
    window.dispatchEvent(new CustomEvent("satranc-cloud-data"));
  }, error => { failure = error.message; status(); }));
  watch("classes", teacher ? collection(db, "classes") : doc(db, "classes", classId));
  for (const name of Object.keys(base)) watch(name, scoped(name));
  stops.push(classroom.onChange(changed), progress.onChange(changed));
  const networkChanged = () => status();
  window.addEventListener("online", networkChanged);
  window.addEventListener("offline", networkChanged);
  const retry = () => window.location.reload();
  window.addEventListener("satranc-cloud-retry", retry);
  if (authSdk?.onIdTokenChanged) stops.push(authSdk.onIdTokenChanged(auth, next => {
    if (!next || next.uid !== user.uid) { failure = "Oturum değişti. Atölye üzerinden tekrar giriş yapın."; status(); }
  }));
  status();
  return () => {
    stopped = true;
    window.clearTimeout(timer);
    for (const stop of stops) stop();
    window.removeEventListener("online", networkChanged);
    window.removeEventListener("offline", networkChanged);
    window.removeEventListener("satranc-cloud-retry", retry);
  };
}
