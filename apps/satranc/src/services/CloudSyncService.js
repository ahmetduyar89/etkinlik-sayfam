/**
 * CloudSyncService — Satranç Okulu'nun çevrimdışı kayıtlarını Firestore ile
 * iki yönlü eşitler.
 *
 * Bu dosya yalnızca http/https altında ve doğrulanmış Firebase öğretmen
 * oturumu bulunduğunda devreye girer. USB / file:// sürümü hiçbir ağ modülü
 * yüklemeden eski davranışıyla çalışmaya devam eder.
 */

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
  return { auth, db: storeSdk.getFirestore(app), storeSdk };
}

function classIdForProfile(classroom, profileId) {
  if (profileId.startsWith("class:")) return profileId.slice(6);
  if (!profileId.startsWith("student:")) return null;
  const studentId = profileId.slice(8);
  return classroom.classes.find((item) => item.students.some((student) => student.id === studentId))?.id || null;
}

export async function startCloudSync({ classroom, progress }) {
  if (!location.protocol.startsWith("http")) return () => {};
  announce("connecting");

  let firebase;
  try {
    firebase = await loadFirebase();
  } catch (error) {
    console.warn("[bulut] başlatılamadı:", error);
    announce("offline", error.message || "Bulut bağlantısı kurulamadı.");
    return () => {};
  }

  const { auth, db, storeSdk } = firebase;
  if (!auth.currentUser) {
    announce("signed-out", "Bulut kaydı için Atölye öğretmen girişi gerekir.");
    return () => {};
  }

  const {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    runTransaction,
    serverTimestamp,
    setDoc
  } = storeSdk;

  let applyingRemote = false;
  let classroomTimer = 0;
  let progressTimer = 0;
  let knownMatches = new Set();
  let knownTournaments = new Set();
  const stops = [];
  const device = deviceId();

  const matchDoc = (item) => key(item.classId, item.id);
  const tournamentDoc = (item) => key(item.classId, item.id);

  async function writeRecord(collectionName, id, data, initial) {
    const ref = doc(db, collectionName, id);
    if (!initial) return setDoc(ref, data);
    // İlk göçte bulutta daha önce oluşmuş bir kaydın üzerine eski sınıf
    // bilgisayarı verisini yazma. Yalnızca eksik dokümanı oluştur.
    return runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) transaction.set(ref, data);
    });
  }

  async function pushClassroom(initial = false) {
    if (applyingRemote) return;
    const matches = classroom.state.matches.filter((item) => item?.id && item?.classId);
    const tournaments = classroom.state.tournaments.filter((item) => item?.id && item?.classId);
    const nextMatches = new Set(matches.map(matchDoc));
    const nextTournaments = new Set(tournaments.map(tournamentDoc));

    await Promise.all([
      ...matches.map((item) => writeRecord("chess_matches", matchDoc(item), {
        ...clean(item), localId: item.id, deviceId: device, syncedAt: serverTimestamp()
      }, initial)),
      ...tournaments.map((item) => writeRecord("chess_tournaments", tournamentDoc(item), {
        ...clean(item), localId: item.id, deviceId: device, syncedAt: serverTimestamp()
      }, initial)),
      ...[...knownMatches].filter((id) => !nextMatches.has(id)).map((id) => deleteDoc(doc(db, "chess_matches", id))),
      ...[...knownTournaments].filter((id) => !nextTournaments.has(id)).map((id) => deleteDoc(doc(db, "chess_tournaments", id)))
    ]);
    knownMatches = nextMatches;
    knownTournaments = nextTournaments;
  }

  async function pushProgress(initial = false) {
    if (applyingRemote) return;
    const writes = [];
    for (const [profileId, value] of Object.entries(progress.store.profiles || {})) {
      const classId = classIdForProfile(classroom, profileId);
      if (!classId) continue;
      writes.push(writeRecord("chess_progress", key(classId, profileId), {
        classId,
        profileId,
        profileName: progress.store.profileNames?.[profileId] || "Öğrenci",
        progress: clean(value),
        deviceId: device,
        syncedAt: serverTimestamp()
      }, initial));
    }
    await Promise.all(writes);
  }

  // İlk işlem yereldeki eski kayıtları yüklemektir. Böylece sınıf bilgisayarında
  // yıllardır duran turnuvalar ilk bağlantıda kaybolmadan buluta taşınır.
  try {
    await pushClassroom(true);
    await pushProgress(true);
    await setDoc(doc(db, "chess_sync", device), {
      deviceId: device,
      userId: auth.currentUser.uid,
      classIds: classroom.classes.map((item) => item.id),
      lastSeenAt: serverTimestamp(),
      userAgent: navigator.userAgent.slice(0, 180)
    }, { merge: true });
  } catch (error) {
    console.warn("[bulut] ilk aktarım başarısız:", error);
    announce("error", error.message || "İlk aktarım tamamlanamadı.");
    return () => {};
  }

  stops.push(onSnapshot(collection(db, "chess_matches"), (snapshot) => {
    const remote = snapshot.docs.map((snap) => {
      const data = snap.data();
      const { localId, deviceId: _device, syncedAt: _synced, ...item } = data;
      return { ...item, id: localId || item.id };
    }).filter((item) => item.id && item.classId);
    applyingRemote = true;
    classroom.state.matches = remote;
    classroom.save();
    knownMatches = new Set(snapshot.docs.map((snap) => snap.id));
    applyingRemote = false;
    announce("online");
  }, (error) => announce("error", error.message)));

  stops.push(onSnapshot(collection(db, "chess_tournaments"), (snapshot) => {
    const remote = snapshot.docs.map((snap) => {
      const data = snap.data();
      const { localId, deviceId: _device, syncedAt: _synced, ...item } = data;
      return { ...item, id: localId || item.id };
    }).filter((item) => item.id && item.classId);
    applyingRemote = true;
    classroom.state.tournaments = remote;
    classroom.save();
    knownTournaments = new Set(snapshot.docs.map((snap) => snap.id));
    applyingRemote = false;
    announce("online");
  }, (error) => announce("error", error.message)));

  stops.push(onSnapshot(collection(db, "chess_progress"), (snapshot) => {
    applyingRemote = true;
    for (const snap of snapshot.docs) {
      const data = snap.data();
      if (!data.profileId || !data.progress) continue;
      progress.store.profiles[data.profileId] = data.progress;
      progress.store.profileNames[data.profileId] = data.profileName || "Öğrenci";
    }
    progress.state = progress.store.profiles[progress.activeProfileId] || progress.state;
    progress.save();
    applyingRemote = false;
    announce("online");
  }, (error) => announce("error", error.message)));

  stops.push(classroom.onChange(() => {
    if (applyingRemote) return;
    window.clearTimeout(classroomTimer);
    classroomTimer = window.setTimeout(() => void pushClassroom().catch((error) => announce("error", error.message)), 450);
  }));
  stops.push(progress.onChange(() => {
    if (applyingRemote) return;
    window.clearTimeout(progressTimer);
    progressTimer = window.setTimeout(() => void pushProgress().catch((error) => announce("error", error.message)), 450);
  }));

  announce("online");
  return () => {
    window.clearTimeout(classroomTimer);
    window.clearTimeout(progressTimer);
    for (const stop of stops) stop();
  };
}
