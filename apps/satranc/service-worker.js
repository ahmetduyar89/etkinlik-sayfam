/**
 * service-worker.js — Çevrimdışı çalışma (PWA) katmanı.
 *
 * Strateji: "önce ağ, sonra önbellek" (network-first, cache fallback).
 * Geliştirme sırasında daima en yeni dosyayı getirir; internet yokken
 * önbellekten servis eder. Böylece sınıfta internet olmasa da platform açılır.
 */

const CACHE_NAME = "satranc-okulu-v32";

/** Uygulamanın açılması için gereken çekirdek dosyalar. */
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  "./src/app.js",
  "./src/utils/dom.js",
  "./src/utils/router.js",

  "./src/engine/Chess.js",
  "./src/engine/Evaluator.js",
  "./src/engine/Ai.js",
  "./src/engine/Coach.js",

  "./src/data/lessons.js",
  "./src/data/introLessons.js",
  "./src/data/weeklyPlan.js",
  "./src/data/curriculum.js",
  "./src/data/pieceLessons.js",
  "./src/data/ruleLessons.js",
  "./src/data/openingLines.js",
  "./src/data/tacticLessons.js",
  "./src/data/endgameLessons.js",
  "./src/data/puzzles.js",
  "./src/data/badges.js",
  "./src/data/teacher.js",

  "./src/models/progress.js",
  "./src/services/ProgressService.js",
  "./src/services/GameService.js",
  "./src/services/ClassroomService.js",
  "./src/services/SwissPairing.js",
  "./src/services/RosterCrypto.js",
  "./src/services/CloudSyncService.js",
  "./src/data/classRoster.js",
  "./src/audio/SoundService.js",
  "./src/animations/effects.js",

  "./src/components/Icon.js",
  "./src/components/ProgressRing.js",
  "./src/components/ChessBoard.js",
  "./src/components/PieceGlyph.js",
  "./src/components/LessonBoard.js",

  "./src/games/GameShell.js",
  "./src/games/SquareFinder.js",
  "./src/games/PieceQuiz.js",
  "./src/games/MoveTarget.js",
  "./src/games/MateDash.js",
  "./src/games/GuessMove.js",
  "./src/games/MemoryFlash.js",
  "./src/games/MatchMoves.js",
  "./src/games/ArmySetup.js",
  "./src/games/CheckOrMate.js",
  "./src/games/KnightQuest.js",
  "./src/games/FreePiece.js",

  "./src/pages/pageUtils.js",
  "./src/pages/HomePage.js",
  "./src/pages/PlanPage.js",
  "./src/pages/LearnPage.js",
  "./src/pages/BoardPage.js",
  "./src/pages/PiecesPage.js",
  "./src/pages/RulesPage.js",
  "./src/pages/TacticsPage.js",
  "./src/pages/OpeningsPage.js",
  "./src/pages/EndgamesPage.js",
  "./src/pages/PuzzlesPage.js",
  "./src/pages/MiniGamesPage.js",
  "./src/pages/PlayPage.js",
  "./src/pages/DuelPage.js",
  "./src/pages/TeacherPage.js",
  "./src/pages/BadgesPage.js",
  "./src/pages/ProfilePage.js",
  "./src/pages/SettingsPage.js",
  "./src/pages/ClassesPage.js",
  "./src/pages/TournamentPage.js",

  "./src/styles/base.css",
  "./src/styles/layout.css",
  "./src/styles/components.css",
  "./src/styles/board.css",
  "./src/styles/chessboard.css",
  "./src/styles/play.css",
  "./src/styles/duel.css",
  "./src/styles/games.css",
  "./src/styles/lessons.css",
  "./src/styles/plan.css",
  "./src/styles/classes.css",
  "./src/styles/theme.css",

  "./src/assets/icons/app-icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache.addAll tek bir dosya bile eksikse TÜM kurulumu iptal eder.
      // Tek tek ekleyerek eksik bir dosyanın uygulamayı kırmasını önleriz.
      Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => {
            console.warn("[sw] önbelleğe alınamadı:", url);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  // Yalnızca kendi kaynaklarımızı önbelleğe alırız.
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Sadece başarılı yanıtları saklarız; hata sayfasını önbelleğe almak
        // çevrimdışı deneyimi bozardı.
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
  );
});
