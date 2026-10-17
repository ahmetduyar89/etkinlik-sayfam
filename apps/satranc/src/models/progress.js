export const defaultProgress = {
  xp: 0,
  stars: 0,
  completedLessons: [],
  solvedPuzzles: [],
  // Tema bazında doğru/yanlış/ipucu sayıları; günlük çalışma önerilerini besler.
  puzzleStats: {},
  // { "YYYY-MM-DD": çözülen günlük çalışma bulmacası }
  dailyPractice: {},
  badges: [],
  games: { won: 0, lost: 0, drawn: 0 },
  // Bilgisayara karşı tamamlanan son oyunlar; hamle hamle inceleme için saklanır.
  gamesArchive: [],
  // Mini oyun kayıtları: { [oyunId]: { best, plays, total } }
  miniGames: {},
  // sound: ses efektleri, voice: sesli anlatım, motion: animasyonlar, contrast: yüksek kontrast
  settings: { sound: true, voice: true, motion: true, contrast: false, navCollapsed: false }
};
