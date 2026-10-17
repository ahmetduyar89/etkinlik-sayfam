/**
 * GameArchivePage.js — Profilde kayıtlı bilgisayar oyunlarını listeler ve
 * hamle hamle, çevrimdışı çalışan bir tahta üzerinde yeniden oynatır.
 */

import { el } from "../utils/dom.js";
import { Chess, sanTr } from "../engine/Chess.js";
import { ChessBoard } from "../components/ChessBoard.js";
import { navigate } from "../utils/router.js";
import { pageShell } from "./pageUtils.js";

const RESULT = {
  won: { label: "Kazandın", emoji: "🏆", className: "won" },
  drawn: { label: "Berabere", emoji: "🤝", className: "drawn" },
  lost: { label: "Kaybettin", emoji: "📘", className: "lost" }
};

function dateText(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function pgnFor(game) {
  const result = game.result === "won"
    ? game.playerColor === "w" ? "1-0" : "0-1"
    : game.result === "lost"
      ? game.playerColor === "w" ? "0-1" : "1-0"
      : "1/2-1/2";
  const date = new Date(game.playedAt);
  const pgnDate = Number.isNaN(date.getTime())
    ? "????.??.??"
    : `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  const body = game.moves.map((move, index) => `${index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ""}${move.san}`).join(" ");
  return [
    `[Event "Satranç Eğitimi"]`, `[Date "${pgnDate}"]`,
    `[White "${game.playerColor === "w" ? "Öğrenci" : "Bilgisayar"}"]`,
    `[Black "${game.playerColor === "b" ? "Öğrenci" : "Bilgisayar"}"]`,
    `[Result "${result}"]`, "", `${body} ${result}`
  ].join("\n");
}

function downloadPgn(game) {
  const blob = new Blob([pgnFor(game)], { type: "application/x-chess-pgn;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `satranc-oyunu-${String(game.playedAt || "oyun").slice(0, 10)}.pgn`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function GameArchivePage({ progress, sound }) {
  const games = [...(progress.state.gamesArchive || [])];
  const host = el("div", { className: "archive-content" });

  const renderArchive = () => {
    if (games.length === 0) {
      host.replaceChildren(el("section", { className: "archive-empty" }, [
      el("span", { className: "archive-empty-icon", text: "♟️" }),
      el("h2", { text: "Henüz kayıtlı oyunun yok" }),
      el("p", { text: "Bilgisayara karşı bir oyunu tamamladığında sonuç ve bütün hamleler burada görünecek." }),
      el("button", {
        className: "primary", type: "button", text: "İlk oyunumu başlat",
        onClick: () => { sound.play("click"); navigate("play"); }
      })
      ]));
      return;
    }

    const average = Math.round(games.reduce((sum, game) => sum + (Number(game.accuracy) || 0), 0) / games.length);
    const wins = games.filter((game) => game.result === "won").length;
    host.replaceChildren(
      el("section", { className: "archive-summary" }, [
        summary("Kayıtlı oyun", games.length),
        summary("Kazanılan", wins),
        summary("Ortalama doğruluk", `%${average}`)
      ]),
      el("section", { className: "archive-list" }, games.map((game) => gameCard(game, host, sound, renderArchive)))
    );
  };

  renderArchive();

  return pageShell("Oyun Arşivim", `${progress.activeProfileName} için tamamlanan oyunlar ve hamle analizleri.`, [host]);
}

function summary(label, value) {
  return el("div", { className: "archive-summary-card" }, [
    el("strong", { text: String(value) }), el("span", { text: label })
  ]);
}

function gameCard(game, host, sound, onBack) {
  const result = RESULT[game.result] || RESULT.drawn;
  return el("article", { className: `archive-card ${result.className}` }, [
    el("div", { className: "archive-result" }, [
      el("span", { text: result.emoji }),
      el("div", {}, [el("strong", { text: result.label }), el("small", { text: dateText(game.playedAt) })])
    ]),
    el("div", { className: "archive-meta" }, [
      el("span", { text: game.level?.label || "Seviye yok" }),
      el("span", { text: game.playerColor === "b" ? "Siyah" : "Beyaz" }),
      el("span", { text: game.timeControl?.label || "Süresiz" }),
      el("strong", { text: `%${game.accuracy ?? 0} doğruluk` })
    ]),
    el("div", { className: "archive-actions" }, [
      el("button", {
        className: "primary", type: "button", text: "Hamleleri incele",
        onClick: () => { sound.play("click"); showReview(game, host, sound, onBack); }
      }),
      el("button", {
        className: "ghost", type: "button", text: "PGN indir",
        onClick: () => { sound.play("click"); downloadPgn(game); }
      })
    ])
  ]);
}

function showReview(game, host, sound, onBack) {
  const chess = new Chess();
  const board = ChessBoard({ chess, orientation: game.playerColor || "w", interactive: false });
  let ply = 0;
  const title = el("strong", { text: "Başlangıç konumu" });
  const note = el("p", { className: "archive-review-note", text: "Bir hamle seçerek oyunu incelemeye başla." });
  const counter = el("span", { className: "archive-ply", text: `0 / ${game.moves.length}` });
  const moveButtons = [];

  const paint = (next) => {
    ply = Math.max(0, Math.min(game.moves.length, next));
    const position = new Chess();
    let last = null;
    for (let index = 0; index < ply; index += 1) last = position.move(game.moves[index]);
    board.attach(position);
    board.setOrientation(game.playerColor || "w");
    board.setLastMove(last ? { from: last.from, to: last.to } : null);
    counter.textContent = `${ply} / ${game.moves.length}`;
    moveButtons.forEach((button, index) => button.classList.toggle("active", index === ply - 1));

    if (!last) {
      title.textContent = "Başlangıç konumu";
      note.textContent = "İleri düğmesine bas veya listeden bir hamle seç.";
      return;
    }
    title.textContent = `${Math.ceil(ply / 2)}${ply % 2 ? "." : "..."} ${sanTr(last.san)}`;
    const review = (game.reviews || []).find((entry) => entry.ply === ply);
    if (review?.classification) {
      note.textContent = `${review.classification.emoji} ${review.classification.label} — ${review.advice || game.reportText || ""}`;
    } else {
      note.textContent = last.color === game.playerColor ? "Senin hamlen." : "Bilgisayarın hamlesi.";
    }
  };

  const moves = el("div", { className: "archive-moves" });
  game.moves.forEach((move, index) => {
    const review = (game.reviews || []).find((entry) => entry.ply === index + 1);
    const button = el("button", {
      className: "archive-move", type: "button",
      title: review?.classification?.label || "Hamleyi göster",
      text: `${index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ""}${sanTr(move.san)}${review?.classification?.emoji ? ` ${review.classification.emoji}` : ""}`,
      onClick: () => { sound.play("click"); paint(index + 1); }
    });
    moveButtons.push(button);
    moves.append(button);
  });

  host.replaceChildren(el("section", { className: "archive-review" }, [
    el("div", { className: "archive-review-head" }, [
      el("button", {
        className: "ghost", type: "button", text: "← Arşive dön",
        onClick: () => { sound.play("click"); onBack(); }
      }),
      el("div", {}, [title, counter])
    ]),
    el("div", { className: "archive-review-grid" }, [
      el("div", { className: "archive-board" }, [board.element]),
      el("aside", { className: "archive-review-panel" }, [
        note,
        el("div", { className: "archive-review-controls" }, [
          el("button", { className: "ghost", type: "button", text: "⏮ Baştan", onClick: () => paint(0) }),
          el("button", { className: "ghost", type: "button", text: "← Geri", onClick: () => paint(ply - 1) }),
          el("button", { className: "primary", type: "button", text: "İleri →", onClick: () => paint(ply + 1) })
        ]),
        moves,
        el("button", { className: "ghost", type: "button", text: "PGN olarak indir", onClick: () => downloadPgn(game) })
      ])
    ])
  ]));
  paint(0);
}
