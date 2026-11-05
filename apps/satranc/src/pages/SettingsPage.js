/**
 * SettingsPage.js — "Ayarlar" ekranı.
 *
 * Çocuğun ve öğretmenin cihaza göre ayarlayabileceği erişilebilirlik ve
 * konfor seçenekleri. Her ayar anında kaydedilir (localStorage) ve tüm
 * uygulamayı etkiler.
 */

import { el } from "../utils/dom.js";
import { pageShell } from "./pageUtils.js";
import { icon } from "../components/Icon.js";

/** Ayar açıklamaları — her seçeneğin ne işe yaradığını çocuk diliyle anlatır. */
const SETTINGS = [
  ["sound", "Ses efektleri", "Taş hareketi, doğru cevap ve rozet sesleri.", "sound"],
  ["voice", "Sesli anlatım", "Öğretmen ve dersler metinleri yüksek sesle okur.", "teacher"],
  ["motion", "Akıcı animasyonlar", "Kapatırsan hareketler durur; bazı cihazlarda daha rahat olur.", "sparkles"],
  ["contrast", "Yüksek kontrast", "Renkleri belirginleştirir; akıllı tahtada okumayı kolaylaştırır.", "board"]
];

export function SettingsPage({ progress, sound, rerender }) {
  /** Tek bir açık/kapalı ayar satırı. */
  function toggle([key, label, description, iconName]) {
    const checked = Boolean(progress.state.settings[key]);
    return el("label", { className: `setting-row ${checked ? "on" : ""}` }, [
      el("span", { className: "setting-icon", html: icon(iconName) }),
      el("span", { className: "setting-text" }, [
        el("strong", { text: label }),
        el("small", { text: description })
      ]),
      el("span", { className: "setting-switch" }, [
        el("input", {
          type: "checkbox",
          checked: checked ? "checked" : null,
          "aria-label": label,
          onChange: () => {
            progress.toggleSetting(key);
            // Ses kapatılırken tık sesi çıkarmak tuhaf olur; sadece açılırken çal.
            if (progress.state.settings.sound) sound.play("click");
            rerender();
          }
        }),
        el("span", { className: "switch-track" })
      ])
    ]);
  }

  return pageShell(
    "Ayarlar",
    "Ses, anlatım, animasyon ve kontrast seçeneklerini cihazına ve kendine göre düzenle.",
    [
      el("section", { className: "settings-panel" }, [
        ...SETTINGS.map(toggle),
        el("div", { className: "settings-danger" }, [
          el("div", {}, [
            el("strong", { text: `${progress.activeProfileName} ilerlemesini sıfırla` }),
            el("small", { text: "Yalnızca açık profilin XP, rozet, ders ve bulmaca ilerlemesi silinir; diğer öğrenci profilleri korunur. Onay için SİL yazman istenir." })
          ]),
          el("button", {
            className: "danger",
            type: "button",
            text: "Sıfırla",
            onClick: () => {
              // Sınıf bilgisayarında bu ekrana her çocuk ulaşabilir ve tek bir
              // onay penceresi çocuğu durdurmaz — okumadan "Tamam"a basar.
              // Bu yüzden yazarak onay isteriz: harf harf SİL yazmak, kazayla
              // tüm sınıfın yıllık ilerlemesinin silinmesini gerçekten önler.
              const cevap = window.prompt(
                `${progress.activeProfileName} profiline ait ilerleme (XP, rozet, ders, bulmaca) silinecek ve geri alınamaz.\n` +
                "Bu genellikle öğretmenin yapacağı bir işlemdir.\n\n" +
                "Devam etmek için büyük harflerle SİL yazıp Tamam'a bas:"
              );
              if ((cevap || "").trim().toLocaleUpperCase("tr") !== "SİL") return;
              progress.reset();
              sound.play("error");
              rerender();
            }
          })
        ])
      ])
    ]
  );
}
