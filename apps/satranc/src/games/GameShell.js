/**
 * GameShell.js — Tüm mini oyunların paylaştığı iskelet.
 *
 * Her mini oyun sadece kendi "tur mantığını" yazar; puan, tur sayacı, süre,
 * geri bildirim, can ve bitiş ekranı gibi ortak işleri bu kabuk üstlenir.
 * Böylece yeni bir oyun eklemek yalnızca birkaç fonksiyon yazmak demektir.
 *
 * Bir oyun tanımı şu şekildedir:
 * {
 *   id, title, description, icon,
 *   rounds: 10,              // kaç tur (süreli oyunlarda yok sayılır)
 *   duration: 60,            // saniye (verilirse süreli oyun olur)
 *   setup(api) {}            // oyun başlarken bir kez çalışır, DOM döndürür
 *   nextRound(api) {}        // her turda çağrılır
 * }
 *
 * `api` şunları sunar:
 *   api.correct(mesaj)   — doğru cevap; puan ekler ve sıradaki tura geçer
 *   api.wrong(mesaj)     — yanlış cevap
 *   api.say(mesaj)       — nötr bilgi mesajı
 *   api.finish()         — oyunu erken bitirir
 *   api.sound, api.progress
 */

import { el } from "../utils/dom.js";
import { burst } from "../animations/effects.js";

export function GameShell({ game, progress, sound, onExit }) {
  let score = 0;
  let round = 0;
  let streak = 0;
  let finished = false;
  let remaining = game.duration || 0;
  let timerId = null;

  const isTimed = Boolean(game.duration);

  /* ---------------------------------------------------------------- *
   * Üst bilgi çubuğu
   * ---------------------------------------------------------------- */

  const scoreValue = el("strong", { text: "0" });
  const roundValue = el("strong", { text: isTimed ? String(remaining) : `0/${game.rounds}` });
  const streakValue = el("strong", { text: "0" });

  const header = el("div", { className: "mini-header" }, [
    el("div", { className: "mini-stat" }, [scoreValue, el("span", { text: "Puan" })]),
    el("div", { className: "mini-stat" }, [roundValue, el("span", { text: isTimed ? "Saniye" : "Tur" })]),
    el("div", { className: "mini-stat" }, [streakValue, el("span", { text: "Seri" })])
  ]);

  const feedback = el("p", { className: "mini-feedback", text: "Hazır mısın? Başlıyoruz!" });
  const stage = el("div", { className: "mini-stage" });
  const endScreen = el("div", { className: "mini-end", hidden: "" });

  /* ---------------------------------------------------------------- *
   * Oyun API'si
   * ---------------------------------------------------------------- */

  /** Üst çubuğu tazeler. */
  function refresh() {
    scoreValue.textContent = String(score);
    streakValue.textContent = String(streak);
    roundValue.textContent = isTimed ? String(remaining) : `${Math.min(round, game.rounds)}/${game.rounds}`;
  }

  /** Geri bildirim satırını yazar. */
  function say(message, tone = "") {
    feedback.className = `mini-feedback ${tone}`;
    feedback.textContent = message;
  }

  const api = {
    progress,
    sound,

    /** Doğru cevap: puan ekler, seriyi büyütür ve sıradaki tura geçer. */
    correct(message = "Doğru!") {
      if (finished) return;
      // Seri büyüdükçe puan artar; bu çocukları dikkatli oynamaya teşvik eder.
      streak += 1;
      score += 10 + Math.min(streak - 1, 5) * 2;
      sound.play("success");
      say(message, "correct");
      refresh();
      advance();
    },

    /** Yanlış cevap: seriyi sıfırlar, tur ilerlemez (öğrenme şansı verilir). */
    wrong(message = "Tekrar dene!", { skip = false } = {}) {
      if (finished) return;
      streak = 0;
      sound.play("error");
      say(message, "wrong");
      refresh();
      if (skip) advance();
    },

    say,
    finish: () => finish(),

    /** Oyunun tur alanını değiştirmesi için. */
    setStage(node) {
      stage.replaceChildren(node);
    }
  };

  /* ---------------------------------------------------------------- *
   * Tur akışı
   * ---------------------------------------------------------------- */

  /** Sıradaki tura geçer; turlar bittiyse oyunu bitirir. */
  function advance() {
    if (finished) return;
    round += 1;
    refresh();

    if (!isTimed && round >= game.rounds) {
      // Son doğru cevabın görülebilmesi için kısa bir bekleme.
      setTimeout(() => finish(), 700);
      return;
    }
    setTimeout(() => {
      if (!finished) game.nextRound(api);
    }, 650);
  }

  /** Oyunu bitirir, ödülü verir ve sonuç ekranını gösterir. */
  function finish() {
    if (finished) return;
    finished = true;
    if (timerId) clearInterval(timerId);

    // Kazanılan XP puanla orantılıdır; her oyun en az bir miktar XP kazandırır.
    const xp = Math.max(5, Math.round(score / 4));
    progress.addXp(xp, `minigame-${game.id}`);
    progress.recordMiniGame(game.id, score);

    sound.play("badge");
    burst(header);

    stage.replaceChildren();
    endScreen.hidden = false;
    endScreen.replaceChildren(
      el("h3", { text: verdict(score) }),
      el("div", { className: "mini-final-score" }, [
        el("strong", { text: String(score) }),
        el("span", { text: "puan" })
      ]),
      el("p", { className: "mini-xp", text: `+${xp} XP kazandın!` }),
      el("p", { className: "mini-best", text: bestText() }),
      el("div", { className: "mini-end-actions" }, [
        el("button", { className: "primary", type: "button", text: "Tekrar Oyna", onClick: () => restart() }),
        el("button", { className: "ghost", type: "button", text: "Oyun Seç", onClick: () => onExit?.() })
      ])
    );
  }

  /** Skora göre çocuk dostu değerlendirme. */
  function verdict(value) {
    if (value >= 120) return "🏆 Muhteşemsin!";
    if (value >= 80) return "🌟 Çok iyi!";
    if (value >= 40) return "👍 Güzel oyun!";
    return "💪 İyi deneme, tekrar dene!";
  }

  /** En yüksek skoru gösterir. */
  function bestText() {
    const best = progress.state.miniGames?.[game.id]?.best ?? 0;
    return score >= best ? "🎉 Yeni rekor!" : `En yüksek skorun: ${best}`;
  }

  /** Oyunu baştan başlatır. */
  function restart() {
    score = 0;
    round = 0;
    streak = 0;
    finished = false;
    remaining = game.duration || 0;
    endScreen.hidden = true;
    endScreen.replaceChildren();
    say("Hazır mısın? Başlıyoruz!");
    refresh();
    start();
  }

  /** Oyunu kurar ve ilk turu başlatır. */
  function start() {
    if (game.setup) game.setup(api);
    game.nextRound(api);

    if (isTimed) {
      timerId = setInterval(() => {
        remaining -= 1;
        refresh();
        if (remaining <= 0) finish();
      }, 1000);
    }
  }

  refresh();
  start();

  const root = el("section", { className: "mini-game" }, [
    el("div", { className: "mini-top" }, [
      el("button", {
        className: "ghost small",
        type: "button",
        text: "← Oyunlar",
        onClick: () => {
          if (timerId) clearInterval(timerId);
          finished = true;
          onExit?.();
        }
      }),
      el("div", { className: "mini-title" }, [
        el("h2", { text: game.title }),
        el("p", { text: game.description })
      ])
    ]),
    header,
    feedback,
    stage,
    endScreen
  ]);

  return root;
}
