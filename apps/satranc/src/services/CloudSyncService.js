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
  let db;
  try {
    db = storeSdk.initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    db = storeSdk.getFirestore(app);
  }
  return { auth, db, storeSdk };
}

function classIdForProfile(classroom, profileId) {
  if (profileId.startsWith("class:")) return profileId.slice(6);
  if (!profileId.startsWith("student:")) return null;
  const studentId = profileId.slice(8);
  return classroom.classes.find((item) => item.students.some((student) => student.id === studentId))?.id || null;
}

function repairOrphanedClassIds(classroom) {
  const classIds = new Set(classroom.classes.map((item) => item.id));
  const classByStudent = new Map();
  for (const item of classroom.classes) {
    for (const student of item.students || []) classByStudent.set(student.id, item.id);
  }

  const inferClassId = (studentIds) => {
    const candidates = [...new Set(studentIds.map((id) => classByStudent.get(id)).filter(Boolean))];
    return candidates.length === 1 ? candidates[0] : null;
  };

  let changed = false;
  for (const match of classroom.state.matches || []) {
    if (classIds.has(match.classId)) continue;
    const inferred = inferClassId([match.whiteId, match.blackId]);
    if (inferred) {
      match.classId = inferred;
      changed = true;
    }
  }
  for (const tournament of classroom.state.tournaments || []) {
    if (classIds.has(tournament.classId)) continue;
    const boardIds = (tournament.rounds || []).flatMap((round) =>
      (round || []).flatMap((board) => [board?.whiteId, board?.blackId])
    );
    const inferred = inferClassId([...(tournament.playerIds || []), ...boardIds].filter(Boolean));
    if (inferred) {
      tournament.classId = inferred;
      changed = true;
    }
  }
  if (changed) classroom.save();
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
  if (typeof auth.authStateReady === "function") await auth.authStateReady();

  const user = auth.currentUser;
  let tokenClaims = {};
  if (user) {
    try {
      const tokenResult = await user.getIdTokenResult();
      tokenClaims = tokenResult.claims || {};
    } catch (e) {
      console.warn("[bulut] token okunamadı:", e);
    }
  }

  // 1. Firebase Auth token içindeki doğrulanmış classId (en yetkili kaynak)
  let sessionClassId = null;
  if (tokenClaims.role === "class" && typeof tokenClaims.classId === "string") {
    sessionClassId = tokenClaims.classId;
  }
  // 2. Portal oturum kaydı
  if (!sessionClassId) {
    try {
      const session = JSON.parse(localStorage.getItem("etkinlik_oturum"));
      if (session?.role === "class") sessionClassId = session.classId || null;
    } catch { /* yok say */ }
  }
  // 3. URL parametresi (?classId=...)
  if (!sessionClassId) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlClassId = urlParams.get("classId");
      if (urlClassId) sessionClassId = urlClassId;
    } catch { /* yok say */ }
  }
  // 4. Classroom aktif sınıfı
  if (!sessionClassId && classroom.state.activeClassId) {
    sessionClassId = classroom.state.activeClassId;
  }

  const isTeacherUser = tokenClaims.role === "teacher";
  const isClassUser = tokenClaims.role === "class" || Boolean(sessionClassId);

  // Doğrulanmış bir oturum yoksa veya anonimse hata fırlatmak yerine bulut senkronizasyonunu zararsızca durdururuz.
  if (!user || user.isAnonymous) {
    announce("signed-out", "Bulut senkronizasyonu için öğretmen veya sınıf oturumu gereklidir.");
    return () => {};
  }
  if (!isTeacherUser && !sessionClassId) {
    announce("signed-out", "Sınıf bilgisi bulunamadı; bulut senkronizasyonu bekletiliyor.");
    return () => {};
  }

  repairOrphanedClassIds(classroom);

  const {
    collection,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where
  } = storeSdk;

  let applyingRemote = false;
  let classroomTimer = 0;
  let progressTimer = 0;
  let heartbeatTimer = 0;
  const stops = [];
  const device = deviceId();

  const docKey = (classId, localId) => key(classId, localId);
  const matchDoc = (item) => item._cloudDocId || docKey(item.classId, item.id);
  const tournamentDoc = (item) => item._cloudDocId || docKey(item.classId, item.id);
  const progressDoc = (classId, profileId) => docKey(classId, profileId);

  const visibleCollection = (name) => {
    if (sessionClassId) {
      return query(collection(db, name), where("classId", "==", sessionClassId));
    }
    if (isTeacherUser) {
      return collection(db, name);
    }
    return null;
  };

  const cloudData = (item) => {
    const { _cloudDocId, ...data } = clean(item);
    return data;
  };

  function serializeTournament(item) {
    const data = clean(item);
    // Firestore iç içe dizileri (nested arrays) desteklemez.
    // rounds: [[board1], [board2]] yapısını nesne dizisine dönüştürürüz:
    if (Array.isArray(data.rounds)) {
      data.rounds = data.rounds.map((round, idx) => ({
        roundNumber: idx + 1,
        boards: Array.isArray(round) ? round : []
      }));
    }
    return data;
  }

  function deserializeTournament(item) {
    if (Array.isArray(item?.rounds)) {
      item.rounds = item.rounds.map((r) => {
        if (Array.isArray(r)) return r;
        if (r && Array.isArray(r.boards)) return r.boards;
        return [];
      });
    }
    return item;
  }

  async function writeRecord(collectionName, id, data, _initial) {
    const ref = doc(db, collectionName, id);
    return setDoc(ref, data, { merge: true });
  }

  async function pushClassroom(initial = false) {
    if (applyingRemote) return;
    const matches = classroom.state.matches.filter((item) =>
      item?.id && item?.classId && (!sessionClassId || item.classId === sessionClassId));
    const tournaments = classroom.state.tournaments.filter((item) =>
      item?.id && item?.classId && (!sessionClassId || item.classId === sessionClassId));

    await Promise.all([
      ...matches.map((item) => writeRecord("chess_matches", matchDoc(item), {
        ...cloudData(item), localId: item.id, ownerUid: item.ownerUid || user?.uid || "shared",
        deviceId: device, syncedAt: serverTimestamp()
      }, initial).catch((err) => console.warn(`[bulut] maç aktarılamadı (${item.id}):`, err))),
      ...tournaments.map((item) => writeRecord("chess_tournaments", tournamentDoc(item), {
        ...cloudData(serializeTournament(item)), localId: item.id, ownerUid: item.ownerUid || user?.uid || "shared",
        deviceId: device, syncedAt: serverTimestamp()
      }, initial).catch((err) => console.warn(`[bulut] turnuva aktarılamadı (${item.id}):`, err)))
    ]);
  }

  async function pushProgress(initial = false) {
    if (applyingRemote) return;
    const writes = [];
    for (const [profileId, value] of Object.entries(progress.store.profiles || {})) {
      const classId = classIdForProfile(classroom, profileId) || (profileId.startsWith(`class:${sessionClassId}`) ? sessionClassId : null);
      if (!classId || (sessionClassId && classId !== sessionClassId)) continue;
      writes.push(writeRecord("chess_progress", progressDoc(classId, profileId), {
        classId,
        profileId,
        profileName: progress.store.profileNames?.[profileId] || (profileId.startsWith("class:") ? (classroom.activeClass?.name || "Sınıf") : "Öğrenci"),
        progress: clean(value),
        ownerUid: user?.uid || "shared",
        deviceId: device,
        syncedAt: serverTimestamp()
      }, initial).catch((err) => console.warn(`[bulut] profil aktarılamadı (${profileId}):`, err)));
    }
    await Promise.all(writes);
  }

  const syncRef = doc(db, "chess_sync", `${sessionClassId ? encodeURIComponent(sessionClassId) + "--" : ""}${encodeURIComponent(device)}`);
  const writeHeartbeat = () => setDoc(syncRef, {
    classId: sessionClassId || (isTeacherUser ? (classroom.state.activeClassId || null) : null),
    deviceId: device,
    userId: user?.uid || "anonymous",
    ownerUid: user?.uid || "anonymous",
    anonymous: Boolean(user?.isAnonymous),
    classIds: sessionClassId ? [sessionClassId] : classroom.classes.map((item) => item.id),
    activeClassId: sessionClassId || classroom.state.activeClassId || null,
    lastSeenAt: serverTimestamp(),
    userAgent: navigator.userAgent.slice(0, 180)
  }, { merge: true }).catch((err) => {
    console.warn("[bulut] kalp atışı gönderilemedi:", err);
  });

  // İlk işlem yereldeki kayıtları aktarmaktır
  try {
    await pushClassroom(true);
    await pushProgress(true);
    await writeHeartbeat();
  } catch (error) {
    console.warn("[bulut] ilk aktarım uyarısı:", error);
  }

  const matchesQuery = visibleCollection("chess_matches");
  if (matchesQuery) {
    stops.push(onSnapshot(matchesQuery, (snapshot) => {
      const remote = snapshot.docs.map((snap) => {
        const data = snap.data();
        const { localId, deviceId: _device, syncedAt: _synced, ...item } = data;
        return { ...item, id: localId || item.id, _cloudDocId: snap.id };
      }).filter((item) => item.id && item.classId);

      applyingRemote = true;
      const matchMap = new Map();
      for (const m of classroom.state.matches || []) {
        if (m?.id) matchMap.set(m.id, m);
      }
      for (const r of remote) {
        matchMap.set(r.id, r);
      }
      classroom.state.matches = Array.from(matchMap.values());
      classroom.save();
      applyingRemote = false;
      announce("online");
    }, (error) => {
      console.warn("[bulut] maç dinleyici hatası:", error);
      announce("error", error.message);
    }));
  }

  const tournamentsQuery = visibleCollection("chess_tournaments");
  if (tournamentsQuery) {
    stops.push(onSnapshot(tournamentsQuery, (snapshot) => {
      const remote = snapshot.docs.map((snap) => {
        const data = deserializeTournament(snap.data());
        const { localId, deviceId: _device, syncedAt: _synced, ...item } = data;
        return { ...item, id: localId || item.id, _cloudDocId: snap.id };
      }).filter((item) => item.id && item.classId);

      applyingRemote = true;
      const tourMap = new Map();
      for (const t of classroom.state.tournaments || []) {
        if (t?.id) tourMap.set(t.id, t);
      }
      for (const r of remote) {
        tourMap.set(r.id, r);
      }
      classroom.state.tournaments = Array.from(tourMap.values());
      classroom.save();
      applyingRemote = false;
      announce("online");
    }, (error) => {
      console.warn("[bulut] turnuva dinleyici hatası:", error);
      announce("error", error.message);
    }));
  }

  const progressQuery = visibleCollection("chess_progress");
  if (progressQuery) {
    stops.push(onSnapshot(progressQuery, (snapshot) => {
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
    }, (error) => {
      console.warn("[bulut] ilerleme dinleyici hatası:", error);
      announce("error", error.message);
    }));
  }

  stops.push(classroom.onChange(() => {
    if (applyingRemote) return;
    window.clearTimeout(classroomTimer);
    classroomTimer = window.setTimeout(() => void pushClassroom().catch((error) => console.warn("[bulut] sınıf eşitleme hatası:", error)), 450);
  }));
  stops.push(progress.onChange(() => {
    if (applyingRemote) return;
    window.clearTimeout(progressTimer);
    progressTimer = window.setTimeout(() => void pushProgress().catch((error) => console.warn("[bulut] ilerleme eşitleme hatası:", error)), 450);
  }));

  heartbeatTimer = window.setInterval(() => {
    void writeHeartbeat();
  }, 60_000);

  announce("online");
  return () => {
    window.clearTimeout(classroomTimer);
    window.clearTimeout(progressTimer);
    window.clearInterval(heartbeatTimer);
    for (const stop of stops) stop();
  };
}
