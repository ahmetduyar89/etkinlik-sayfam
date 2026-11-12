/**
 * MatchMoves.js — "Eşleştirme"
 *
 * Soldaki kavramları sağdaki açıklamalarla eşleştirme oyunu. Havuzda hem taşlar
 * hem de temel kurallar (rok, pat, terfi, geçerken alma...) bulunur; böylece oyun
 * yalnızca hareketleri değil satranç sözlüğünü de öğretir.
 *
 * Her turda dört çift sunulur; hepsi doğru eşleşince tur tamamlanır.
 */

import { el } from "../utils/dom.js";

/** Eşleştirme havuzu: [kavram, açıklama] */
const PAIRS = [
  ["At", "L şeklinde gider ve taşların üzerinden atlar"],
  ["Fil", "Sadece çapraz çizgilerde ilerler"],
  ["Kale", "Satır ve sütun boyunca düz gider"],
  ["Vezir", "Hem düz hem çapraz, en güçlü taş"],
  ["Şah", "Her yöne yalnızca bir kare gider"],
  ["Piyon", "Düz ilerler ama çapraz taş alır"],
  ["Şah Mat", "Şah kurtulamaz, oyun biter"],
  ["Pat", "Yasal hamle yok ama şah tehditte değil: beraberlik"],
  ["Rok", "Şah ve kalenin birlikte yaptığı özel hamle"],
  ["Terfi", "Piyon son sıraya varınca vezire dönüşür"],
  ["Geçerken Alma", "Piyonun iki kare atlayan piyonu alması"],
  ["Çatal", "Tek taşın aynı anda iki hedefe saldırması"],
  ["Açmaz", "Öndeki taş oynarsa arkadaki değerli taş düşer"],
  ["Merkez", "d4, e4, d5 ve e5 kareleri"]
];

const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

export function createMatchMoves() {
  let leftColumn = null;
  let rightColumn = null;
  let selectedLeft = null;
  let matched = 0;
  let roundPairs = [];

  return {
    id: "eslestirme",
    title: "Eşleştirme",
    description: "Soldaki kavramı sağdaki doğru açıklamayla eşleştir.",
    icon: "puzzle",
    rounds: 5,

    setup(api) {
      leftColumn = el("div", { className: "match-column" });
      rightColumn = el("div", { className: "match-column" });
      api.setStage(
        el("div", { className: "match-game" }, [
          el("div", { className: "match-board" }, [leftColumn, rightColumn])
        ])
      );
    },

    nextRound(api) {
      selectedLeft = null;
      matched = 0;
      roundPairs = shuffle(PAIRS).slice(0, 4);

      /** Bir eşleşme tamamlandığında iki kartı da kilitler. */
      const lockPair = (leftNode, rightNode) => {
        leftNode.classList.add("matched");
        rightNode.classList.add("matched");
        leftNode.disabled = true;
        rightNode.disabled = true;
      };

      leftColumn.replaceChildren(
        ...shuffle(roundPairs).map(([term]) =>
          el("button", {
            className: "match-card term",
            type: "button",
            text: term,
            "data-term": term,
            onClick: (event) => {
              if (event.currentTarget.classList.contains("matched")) return;
              // Önceki seçimi temizle, yenisini işaretle.
              for (const node of leftColumn.children) node.classList.remove("selected");
              event.currentTarget.classList.add("selected");
              selectedLeft = event.currentTarget;
              api.sound.play("click");
            }
          })
        )
      );

      rightColumn.replaceChildren(
        ...shuffle(roundPairs).map(([term, description]) =>
          el("button", {
            className: "match-card description",
            type: "button",
            text: description,
            "data-term": term,
            onClick: (event) => {
              if (event.currentTarget.classList.contains("matched")) return;
              if (!selectedLeft) {
                api.say("Önce soldan bir kavram seç.");
                return;
              }

              if (selectedLeft.dataset.term === term) {
                lockPair(selectedLeft, event.currentTarget);
                selectedLeft = null;
                matched += 1;
                api.sound.play("move");

                if (matched === roundPairs.length) {
                  api.correct("🎉 Dört eşleşmenin hepsini buldun!");
                } else {
                  api.say(`Doğru eşleşme! ${roundPairs.length - matched} çift kaldı.`, "partial");
                }
              } else {
                event.currentTarget.classList.add("shake");
                setTimeout(() => event.currentTarget.classList.remove("shake"), 400);
                api.wrong(`"${selectedLeft.dataset.term}" bu açıklamaya uymuyor. Tekrar dene!`);
              }
            }
          })
        )
      );

      api.say("Soldan bir kavram, sağdan açıklamasını seç.");
    }
  };
}
