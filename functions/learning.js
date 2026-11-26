// Shared assignment/result handlers. Firebase identity is the only student authority.
const KINDS = new Set(['activity', 'notebook', 'experiment', 'chess-week', 'chess-puzzle', 'chess-minigame', 'chess-bot']);
const MINI_GAMES = new Set(['ordunu-diz', 'tasi-surukle', 'sah-mat-pat', 'kasif-at', 'bedava-tas', 'kare-bul', 'tasi-tani', 'mati-bul', 'hamleyi-tahmin', 'hizli-hafiza', 'eslestirme']);
const idText = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(value) ? value : null;
const text = (value, max) => String(value || '').trim().slice(0, max);
const resultId = (assignmentId, studentId) => `${assignmentId}--${studentId}`;

function evidenceFor(assignment, progress = {}, baseline = {}) {
  const resource = assignment.resourceId;
  if (assignment.kind === 'chess-week') return (progress.completedLessons || []).includes(resource) ? { lesson: resource } : null;
  if (assignment.kind === 'chess-puzzle') return (progress.solvedPuzzles || []).includes(resource) ? { puzzle: resource } : null;
  if (assignment.kind === 'chess-minigame') {
    const game = progress.miniGames?.[resource];
    return game && game.plays > (baseline.miniGames?.[resource]?.plays || 0) ? { game: resource, plays: game.plays, best: game.best || 0, score: game.lastScore ?? (game.total || 0) - (baseline.miniGames?.[resource]?.total || 0) } : null;
  }
  if (assignment.kind === 'chess-bot') {
    const previous = new Set((baseline.gamesArchive || []).map(game => game.id));
    const game = (progress.gamesArchive || []).find(game => !previous.has(game.id) && (!resource || resource === 'all' || game.level?.id === resource));
    return game ? { gameId: game.id, result: game.result, level: game.level?.id || 'unknown', moves: game.moves?.length || 0 } : null;
  }
  return null;
}

function createLearningHandlers({ db, HttpsError, FieldValue, requireTeacher }) {
  const fail = (code, message) => { throw new HttpsError(code, message); };
  async function studentIdentity(request) {
    const token = request.auth?.token;
    if (token?.role !== 'student' || !idText(token.classId) || !idText(token.studentId)) fail('permission-denied', 'Öğrenci hesabınızla giriş yapın.');
    const classroom = await db.collection('classes').doc(token.classId).get();
    const student = classroom.data()?.students?.find(s => s.id === token.studentId && s.active !== false);
    if (!classroom.exists || !student) fail('permission-denied', 'Öğrenci kaydı artık etkin değil.');
    return { classId: token.classId, studentId: token.studentId, studentName: student.name };
  }
  function assigned(assignment, identity) {
    return assignment?.active !== false && assignment?.classId === identity.classId &&
      (!(assignment.studentIds || []).length || assignment.studentIds.includes(identity.studentId));
  }
  return {
    async saveLearningAssignment(request) {
      requireTeacher(request);
      const data = request.data || {};
      const classId = idText(data.classId);
      const resourceId = data.kind === 'experiment' ? text(data.resourceId, 120) : idText(data.resourceId);
      if (!classId || !KINDS.has(data.kind) || !resourceId || !text(data.title, 100)) fail('invalid-argument', 'Sınıf, çalışma ve başlık seçin.');
      const classroom = await db.collection('classes').doc(classId).get();
      if (!classroom.exists) fail('not-found', 'Sınıf bulunamadı.');
      const studentIds = [...new Set(Array.isArray(data.studentIds) ? data.studentIds : [])];
      if (studentIds.some(id => !classroom.data().students?.some(s => s.id === id && s.active !== false))) fail('invalid-argument', 'Öğrenci bu sınıfın etkin kadrosunda değil.');
      if (['activity', 'notebook'].includes(data.kind)) {
        const collection = data.kind === 'activity' ? 'activities' : 'notebooks';
        if (!(await db.collection(collection).doc(resourceId).get()).exists) fail('not-found', 'Çalışma kaydı bulunamadı.');
      }
      if (data.kind === 'experiment' && !/^[a-z0-9][a-z0-9-]*\.html$/.test(resourceId)) fail('invalid-argument', 'Deney dosyası geçersiz.');
      if (data.kind === 'chess-week' && !/^week-([1-9]|[12]\d|3[0-6])$/.test(resourceId)) fail('invalid-argument', 'Hafta 1–36 arasında olmalıdır.');
      if (data.kind === 'chess-puzzle' && (!/^puzzle-\d{4}$/.test(resourceId) || Number(resourceId.slice(7)) < 1 || Number(resourceId.slice(7)) > 1934)) fail('invalid-argument', 'Bulmaca kimliği geçersiz.');
      if (data.kind === 'chess-minigame' && !MINI_GAMES.has(resourceId)) fail('invalid-argument', 'Mini oyun bulunamadı.');
      if (data.kind === 'chess-bot' && !['all', 'kolay', 'orta', 'zor'].includes(resourceId)) fail('invalid-argument', 'Oyun seviyesi geçersiz.');
      if (data.dueAt && (!Number.isFinite(Date.parse(data.dueAt)) || !/^\d{4}-\d\d-\d\dT/.test(data.dueAt))) fail('invalid-argument', 'Bitiş tarihi geçersiz.');
      const ref = db.collection('learning_assignments').doc();
      await ref.set({ classId, kind: data.kind, resourceId, title: text(data.title, 100), description: text(data.description, 1000), studentIds,
        dueAt: data.dueAt || null, active: true, createdBy: request.auth.uid, createdAt: FieldValue.serverTimestamp() });
      return { id: ref.id };
    },
    async archiveLearningAssignment(request) {
      requireTeacher(request);
      const id = idText(request.data?.id);
      if (!id) fail('invalid-argument', 'Çalışma kimliği gerekli.');
      await db.collection('learning_assignments').doc(id).update({ active: false, archivedAt: FieldValue.serverTimestamp() });
      return { ok: true };
    },
    async startLearningAssignment(request) {
      const identity = await studentIdentity(request);
      const id = idText(request.data?.assignmentId);
      if (!id) fail('invalid-argument', 'Çalışma kimliği gerekli.');
      const assignmentRef = db.collection('learning_assignments').doc(id);
      const ref = db.collection('learning_results').doc(resultId(id, identity.studentId));
      const profileRef = db.collection('chess_progress').doc(`${encodeURIComponent(identity.classId)}--${encodeURIComponent(`student:${identity.studentId}`)}`);
      await db.runTransaction(async tx => {
        const [assignment, existing, profile] = await Promise.all([tx.get(assignmentRef), tx.get(ref), tx.get(profileRef)]);
        if (!assignment.exists || !assigned(assignment.data(), identity)) fail('permission-denied', 'Bu çalışma size atanmadı veya kapatıldı.');
        if (existing.exists) return;
        const baseline = profile.data()?.progress || {};
        const evidence = ['chess-week', 'chess-puzzle'].includes(assignment.data().kind) ? evidenceFor(assignment.data(), baseline) : null;
        tx.set(ref, { ...identity, assignmentId: id, kind: assignment.data().kind, title: assignment.data().title,
          status: evidence ? 'completed' : 'started', startedAt: FieldValue.serverTimestamp(), completedAt: evidence ? FieldValue.serverTimestamp() : null,
          evidence: evidence || null, completionSource: evidence ? 'existing-progress' : null,
          baseline: { miniGames: baseline.miniGames || {}, gamesArchive: (baseline.gamesArchive || []).map(g => ({ id: g.id })) } });
      });
      return { id: ref.id };
    },
    async completeLearningAssignment(request) {
      const identity = await studentIdentity(request);
      const id = idText(request.data?.assignmentId);
      if (!id) fail('invalid-argument', 'Çalışma kimliği gerekli.');
      const assignmentRef = db.collection('learning_assignments').doc(id);
      const ref = db.collection('learning_results').doc(resultId(id, identity.studentId));
      const submissionId = idText(request.data?.submissionId);
      await db.runTransaction(async tx => {
        const [assignment, existing, submission] = await Promise.all([
          tx.get(assignmentRef), tx.get(ref), submissionId ? tx.get(db.collection('submissions').doc(submissionId)) : Promise.resolve(null)
        ]);
        if (!assignment.exists || !assigned(assignment.data(), identity)) fail('permission-denied', 'Bu çalışma size atanmadı veya kapatıldı.');
        if (!existing.exists) fail('failed-precondition', 'Önce çalışmayı başlatın.');
        if (existing.data().status === 'completed') return;
        if (assignment.data().kind.startsWith('chess-')) fail('failed-precondition', 'Satranç sonucu kayıtlı ilerlemeden otomatik alınır.');
        let evidence = { viewed: true };
        if (assignment.data().kind === 'activity') {
          const activity = await tx.get(db.collection('activities').doc(assignment.data().resourceId));
          if (activity.data()?.is_test) {
            const data = submission?.data();
            if (!data || data.student_id !== identity.studentId || data.class_id !== identity.classId || data.activity_id !== assignment.data().resourceId || data.assignment_id !== id || !data.submitted_at) fail('failed-precondition', 'Testin kaydedilmiş sonucu bulunamadı.');
            evidence = { submissionId, answers: data.answers || {} };
          }
        }
        tx.update(ref, { status: 'completed', evidence, completionSource: submissionId ? 'activity-submission' : 'student-report', completedAt: FieldValue.serverTimestamp() });
      });
      return { ok: true };
    },
    async syncProgressResults(classId, studentId) {
      // Read current profile, not a stale trigger payload. Repeated events are harmless.
      const [profile, assignments] = await Promise.all([
        db.collection('chess_progress').doc(`${encodeURIComponent(classId)}--${encodeURIComponent(`student:${studentId}`)}`).get(),
        db.collection('learning_assignments').where('classId', '==', classId).get()
      ]);
      for (const assignment of assignments.docs) {
        if (!assignment.data().kind.startsWith('chess-') || !assigned(assignment.data(), { classId, studentId })) continue;
        const ref = db.collection('learning_results').doc(resultId(assignment.id, studentId));
        await db.runTransaction(async tx => {
          const snap = await tx.get(ref);
          if (!snap.exists || snap.data().status === 'completed') return;
          const evidence = evidenceFor(assignment.data(), profile.data()?.progress || {}, snap.data().baseline);
          if (evidence) tx.update(ref, { status: 'completed', evidence, completionSource: 'chess-progress', completedAt: FieldValue.serverTimestamp() });
        });
      }
    }
  };
}
function createClassNotebookHandler({ db, HttpsError, FieldValue, requireTeacher }) {
  return async request => {
  const classId = idText(request.data?.classId);
  if (request.auth?.token?.role !== 'class' || request.auth.token.classId !== classId) requireTeacher(request);
  if (!classId) throw new HttpsError('invalid-argument', 'Sınıf kimliği gerekli.');
  const classRef = db.collection('classes').doc(classId);
  const notebookRef = db.collection('notebooks').doc();
  await db.runTransaction(async tx => {
    const classroom = await tx.get(classRef);
    if (!classroom.exists) throw new HttpsError('not-found', 'Sınıf bulunamadı.');
    const now = new Date().toISOString();
    tx.set(notebookRef, { title: `${classroom.data().name} - ${new Date().toLocaleDateString('tr-TR')} Dersi`, kind: 'notebook', parent_id: null, class_id: classId, paper: 'grid', page_count: 1, created_at: now, updated_at: now });
    tx.update(classRef, { assignedNotebooks: [...new Set([...(classroom.data().assignedNotebooks || []), notebookRef.id])], updated_at: FieldValue.serverTimestamp() });
  });
  return { id: notebookRef.id };
  };
}
const classMatchPlayerId = (seat, classId) => seat.classId === classId ? seat.studentId : `external:${seat.classId}:${seat.studentId}`;
module.exports = { createLearningHandlers, createClassNotebookHandler, evidenceFor, resultId, classMatchPlayerId };
