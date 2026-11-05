/**
 * MiniGamesPage.js — Mini oyun seçme ve oynama ekranı.
 *
 * Oyunların tamamı gerçekten oynanabilir. Her oyun `src/games/` altında ayrı
 * bir dosyadır ve ortak `GameShell` iskeletini kullanır; bu sayede puan, süre,
 * seri ve bitiş ekranı davranışı her oyunda aynıdır.
 */

import { el } from "../utils/dom.js";
import { routeParam } from "../utils/router.js";
import { icon } from "../components/Icon.js";
import { GameShell } from "../games/GameShell.js";
import { createSquareFinder } from "../games/SquareFinder.js";
import { createPieceQuiz } from "../games/PieceQuiz.js";
import { createMoveTarget } from "../games/MoveTarget.js";
import { createMateDash } from "../games/MateDash.js";
import { createGuessMove } from "../games/GuessMove.js";
import { createMemoryFlash } from "../games/MemoryFlash.js";
import { createMatchMoves } from "../games/MatchMoves.js";
import { createArmySetup } from "../games/ArmySetup.js";
import { createCheckOrMate } from "../games/CheckOrMate.js";
import { createKnightQuest } from "../games/KnightQuest.js";
import { createFreePiece } from "../games/FreePiece.js";
import { pageShell } from "./pageUtils.js";

/** Oyun üreticileri — her seferinde temiz bir örnek kurulur. */
const FACTORIES = [
  createArmySetup,
  createMoveTarget,
  createCheckOrMate,
  createKnightQuest,
  createFreePiece,
  createSquareFinder,
  createPieceQuiz,
  createMateDash,
  createGuessMove,
  createMemoryFlash,
  createMatchMoves
];

export function MiniGamesPage({ progress, sound }) {
  const host = el("div", { className: "mini-host" });

  /** Oyun seçme ızgarasını çizer. */
  function showMenu() {
    const cards = FACTORIES.map((factory) => {
      // Kart bilgisi için hafif bir örnek oluştururuz (kurulum yapılmaz).
      const game = factory();
      const record = progress.state.miniGames?.[game.id];

      return el("button", {
        className: "mini-card",
        type: "button",
        onClick: () => {
          sound.play("click");
          startGame(factory);
        }
      }, [
        el("span", { className: "mini-card-icon", html: icon(game.icon) }),
        el("span", { className: "mini-card-title", text: game.title }),
        el("span", { className: "mini-card-desc", text: game.description }),
        el("span", { className: "mini-card-meta", text: game.duration ? `⏱ ${game.duration} saniye` : `${game.rounds} tur` }),
        record
          ? el("span", { className: "mini-card-best", text: `🏆 Rekorun: ${record.best} puan` })
          : el("span", { className: "mini-card-best new", text: "Henüz oynamadın" })
      ]);
    });

    host.replaceChildren(el("section", { className: "mini-grid" }, cards));
  }

  /** Seçilen oyunu başlatır. */
  function startGame(factory) {
    host.replaceChildren(
      GameShell({
        game: factory(),
        progress,
        sound,
        onExit: () => {
          sound.play("click");
          showMenu();
        }
      })
    );
  }

  // Derin bağlantı: #/minigames?oyun=kare-bul doğrudan o oyunu başlatır.
  // Ders programındaki hafta etkinlikleri bunu kullanır.
  const requested = routeParam("oyun");
  const match = requested ? FACTORIES.find((factory) => factory().id === requested) : null;
  if (match) startGame(match);
  else showMenu();

  return pageShell(
    "Mini Oyunlar",
    "Farklı oyunlarla satranç refleksini güçlendir. Her oyun puan ve XP kazandırır!",
    [host]
  );
}
