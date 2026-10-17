function createBotGameHandler({ db, HttpsError, FieldValue, loadChess }) {
  return async request => {
    const claims = request.auth?.token;
    if (claims?.role !== 'student') throw new HttpsError('permission-denied', 'Sonuç kaydı için öğrenci hesabınızla giriş yapın.');
    const input = request.data || {};
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(input.id || '') || !['kolay', 'orta', 'zor'].includes(input.level) || !['w', 'b'].includes(input.playerColor) || !Array.isArray(input.moves) || !input.moves.length || input.moves.length > 600) {
      throw new HttpsError('invalid-argument', 'Oyun kaydı geçersiz.');
    }
    const Chess = await loadChess();
    const game = new Chess();
    for (const move of input.moves) {
      if (typeof move !== 'string' || move.length > 20 || game.isGameOver() || !game.move(move)) throw new HttpsError('invalid-argument', 'Hamle kaydı doğrulanamadı.');
    }
    const status = game.status();
    if (!status.over) throw new HttpsError('failed-precondition', 'Oyun henüz tamamlanmadı.');
    const result = status.winner === null ? 'drawn' : status.winner === input.playerColor ? 'won' : 'lost';
    const ref = db.collection('chess_bot_games').doc(`${request.auth.uid}--${input.id}`);
    const classRef = db.collection('classes').doc(claims.classId);
    const profileRef = db.collection('chess_progress').doc(`${encodeURIComponent(claims.classId)}--${encodeURIComponent(`student:${claims.studentId}`)}`);
    await db.runTransaction(async tx => {
      const [existing, classroom, profile] = await Promise.all([tx.get(ref), tx.get(classRef), tx.get(profileRef)]);
      const student = classroom.data()?.students?.find(s => s.id === claims.studentId && s.active !== false);
      if (!student) throw new HttpsError('permission-denied', 'Öğrenci kaydı artık etkin değil.');
      if (existing.exists) return;
      const archive = { id: input.id, playedAt: new Date().toISOString(), result, reason: status.reason, playerColor: input.playerColor, level: { id: input.level }, moves: game.getHistory({ verbose: true }) };
      const progress = profile.data()?.progress || {};
      tx.set(ref, { classId: claims.classId, studentId: claims.studentId, studentName: student.name, ...archive, completedAt: FieldValue.serverTimestamp(), source: 'arena-bot' });
      tx.set(profileRef, { ...(profile.data() || {}), classId: claims.classId, profileId: `student:${claims.studentId}`, profileName: student.name,
        progress: { ...progress, xp: (progress.xp || 0) + (result === 'won' ? 30 : 12), games: { won: 0, lost: 0, drawn: 0, ...progress.games, [result]: (progress.games?.[result] || 0) + 1 }, gamesArchive: [archive, ...(progress.gamesArchive || [])].slice(0, 100) },
        ownerUid: request.auth.uid, syncedAt: FieldValue.serverTimestamp() });
    });
    return { result };
  };
}
module.exports = { createBotGameHandler };
