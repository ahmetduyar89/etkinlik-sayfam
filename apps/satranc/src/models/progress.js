export const defaultProgress = {
  xp: 0,
  stars: 0,
  completedLessons: [],
  solvedPuzzles: [],
  badges: [],
  games: { won: 0, lost: 0, drawn: 0 },
  // Mini oyun kayıtları: { [oyunId]: { best, plays, total } }
  miniGames: {},
  // sound: ses efektleri, voice: sesli anlatım, motion: animasyonlar, contrast: yüksek kontrast
  settings: { sound: true, voice: true, motion: true, contrast: false, navCollapsed: false }
};
