import { el } from "../utils/dom.js";
import { icon } from "../components/Icon.js";

/**
 * Sayfa iskeleti: başlık bloğu + içerik.
 *
 * @param {object} options
 * @param {boolean} options.compact Başlık bloğunu küçültür. Oyun ekranı gibi
 *        dikey alanın tahtaya gerektiği sayfalarda kullanılır; büyük başlık
 *        orada 190 piksele yakın yer kaplıyor ve tahtayı küçültüyordu.
 */
export function pageShell(title, subtitle, children = [], options = {}) {
  const compact = Boolean(options.compact);
  return el("main", { className: `page ${compact ? "page-compact" : ""}` }, [
    el("section", { className: "page-hero" }, [
      el("div", { className: "hero-copy" }, [
        compact ? null : el("span", { className: "eyebrow", text: "Satranç Eğitimi" }),
        el("h1", { text: title }),
        compact ? null : el("p", { text: subtitle })
      ])
    ]),
    ...children
  ]);
}

export function stat(label, value) {
  return el("div", { className: "stat" }, [el("strong", { text: value }), el("span", { text: label })]);
}

export function infoGrid(items) {
  return el("section", { className: "card-grid" }, items.map(([title, body, iconName = "sparkles"]) =>
    el("article", { className: "info-card" }, [
      el("div", { className: "card-icon", html: icon(iconName) }),
      el("h3", { text: title }),
      el("p", { text: body })
    ])
  ));
}

export function quizBox({ question, options, answer }, onCorrect) {
  const result = el("p", { className: "quiz-result", text: "Bir cevap seç." });
  return el("div", { className: "quiz-box" }, [
    el("h3", { text: question }),
    el("div", { className: "choice-row" }, options.map((option) =>
      el("button", {
        className: "choice",
        type: "button",
        text: option,
        onClick: (event) => {
          const correct = option === answer;
          event.currentTarget.classList.add(correct ? "correct" : "wrong");
          result.textContent = correct ? "Harika! Doğru cevap." : "Yaklaştın, tekrar düşün.";
          onCorrect?.(correct);
        }
      })
    )),
    result
  ]);
}

/* ------------------------------------------------------------------ *
 * Tam ekran (odak) modu
 *
 * Menü ve üst çubuk gizlenir, tahta ekranın tamamını kullanır. Akıllı
 * tahtaya yansıtılan derste tahtanın büyük görünmesi için gereklidir.
 * Oyun ekranı ve iki kişilik oyun ekranı aynı düğmeyi paylaşır.
 * ------------------------------------------------------------------ */

/** Odak modunu açar/kapatır ve ekrandaki düğmeyi arayüzle tutarlı tutar. */
export function setFocusMode(on) {
  document.body.classList.toggle("focus-mode", on);
  const button = document.querySelector(".focus-button");
  if (!button) return;
  button.innerHTML = icon(on ? "shrink" : "expand");
  button.title = on ? "Tam ekrandan çık" : "Tam ekran";
  button.setAttribute("aria-label", button.title);
}

/**
 * Esc dinleyicisi modül düzeyinde BİR KEZ bağlanır.
 *
 * Sayfa fonksiyonları her ziyarette yeniden çalıştığı için dinleyiciyi sayfa
 * içinde bağlamak, her girişte bir tane daha eklenmesine yol açardı.
 * İşleyici durumsuzdur; düğmeyi DOM'dan bulur.
 */
let escapeBound = false;

function bindEscapeOnce() {
  if (escapeBound) return;
  escapeBound = true;
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!document.body.classList.contains("focus-mode")) return;
    setFocusMode(false);
  });
}

/**
 * Tam ekran aç/kapa düğmesi üretir.
 * @param {object} sound Tıklama sesi için SoundService (isteğe bağlı).
 */
export function focusToggle(sound = null) {
  bindEscapeOnce();
  return el("button", {
    className: "focus-button",
    type: "button",
    title: "Tam ekran",
    "aria-label": "Tam ekran",
    onClick: () => {
      sound?.play("click");
      setFocusMode(!document.body.classList.contains("focus-mode"));
    },
    html: icon("expand")
  });
}
