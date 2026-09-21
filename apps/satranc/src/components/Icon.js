const paths = {
  home: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z",
  sparkles: "M12 2l1.6 5.1L19 9l-5.4 1.9L12 16l-1.6-5.1L5 9l5.4-1.9zM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8z",
  board: "M4 4h16v16H4zM8 4v16M12 4v16M16 4v16M4 8h16M4 12h16M4 16h16",
  pawn: "M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-4 16h8l-1-5h-6z",
  knight: "M7 20h11l-2-6 1-5-4-5-6 4 3 2-3 4z",
  book: "M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 0-3 3zM5 4v19",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  route: "M5 19c4-8 10 0 14-8M5 19a2 2 0 1 1-2-2 2 2 0 0 1 2 2zm16-8a2 2 0 1 1-2-2 2 2 0 0 1 2 2z",
  crown: "M4 18h16l1-10-5 4-4-7-4 7-5-4z",
  puzzle: "M9 3h6v4h2a2 2 0 1 1 0 4h-2v3h-4v2a2 2 0 1 1-4 0v-2H3V9h6z",
  game: "M7 8h10a5 5 0 0 1 4 8l-1 2a2 2 0 0 1-3-.5L15 15H9l-2 2.5a2 2 0 0 1-3 .5l-1-2a5 5 0 0 1 4-8zM7 12h4M9 10v4M16 12h.01M18 14h.01",
  bot: "M8 7h8a4 4 0 0 1 4 4v6H4v-6a4 4 0 0 1 4-4zm2-4h4v4h-4zM9 13h.01M15 13h.01M9 17h6",
  teacher: "M4 6l8-4 8 4-8 4zM6 9v5c0 3 12 3 12 0V9M8 18h8M20 8v6",
  badge: "M12 3l7 4v6c0 5-3.5 7.5-7 8-3.5-.5-7-3-7-8V7z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0",
  // İki oyuncu (karşılıklı oyun) ve kurulum kalemi
  duo: "M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11zm7.5-.5a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4zM2.5 20a6.5 6.5 0 0 1 13 0M17 13.6a5.2 5.2 0 0 1 4.5 5",
  edit: "M4 20h4L19.4 8.6l-4-4L4 16zM14.4 5.6l4 4",
  settings: "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8 4 2-1-2-4-2 1a8 8 0 0 0-2-1L15 5H9L8 7a8 8 0 0 0-2 1L4 7l-2 4 2 1a8 8 0 0 0 0 2l-2 1 2 4 2-1a8 8 0 0 0 2 1l1 2h6l1-2a8 8 0 0 0 2-1l2 1 2-4-2-1a8 8 0 0 0 0-2z",
  sound: "M4 10v4h4l5 4V6l-5 4zM17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12",
  // Menü aç/kapa: içe ve dışa bakan oklu liste simgeleri
  menuClose: "M3 6h18M3 12h9M3 18h18M20 9l-3 3 3 3",
  menuOpen: "M3 6h18M3 12h9M3 18h18M17 9l3 3-3 3",
  expand: "M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6",
  shrink: "M9 4v5H4M15 20v-5h5M10 10L4 4M14 14l6 6",
  // Satranç saati: kadran, duraklat ve devam et
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2",
  pause: "M9 5v14M15 5v14",
  play: "M8 5l11 7-11 7z",
  // Sınıf (okul binası) ve turnuva kupası
  school: "M3 21h18M5 21V10l7-5 7 5v11M10 21v-5h4v5M12 9.5h.01",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9.5 17h5",
  chart: "M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7M3 20h18"
};

export function icon(name, className = "icon") {
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.sparkles}"/></svg>`;
}
