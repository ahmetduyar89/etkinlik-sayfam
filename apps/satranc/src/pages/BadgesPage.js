/**
 * BadgesPage.js — "Rozetler" ekranı.
 *
 * Rozetler gruplara ayrılır ve kilitli olanlar da İLERLEME ÇUBUĞUYLA gösterilir.
 * "Kilitli" yazan boş bir kart çocuğa hiçbir şey anlatmaz; "7/10 bulmaca" ise
 * hem hedefi hem de ne kadar yaklaştığını gösterir.
 */

import { el } from "../utils/dom.js";
import { badgeGroups, badgeStatus, badges } from "../data/badges.js";
import { icon } from "../components/Icon.js";
import { pageShell } from "./pageUtils.js";

export function BadgesPage({ progress }) {
  const state = progress.state;
  const unlockedCount = badges.filter((badge) => badgeStatus(badge, state).unlocked).length;

  return pageShell(
    "Rozetler",
    `${unlockedCount} / ${badges.length} rozet kazandın. Kilitli rozetlerin altındaki çubuk ne kadar yaklaştığını gösterir.`,
    [
      el("section", { className: "badge-summary" }, [
        el("div", { className: "badge-summary-bar" }, [
          el("div", {
            className: "badge-summary-fill",
            style: `width:${Math.round((unlockedCount / badges.length) * 100)}%`
          })
        ]),
        el("span", { text: `%${Math.round((unlockedCount / badges.length) * 100)} tamamlandı` })
      ]),

      ...badgeGroups().flatMap(({ group, items }) => [
        el("h2", { className: "section-heading", text: group }),
        el("section", { className: "badge-grid" }, items.map((badge) => {
          const status = badgeStatus(badge, state);
          return el("article", { className: `badge-card ${status.unlocked ? "unlocked" : "locked"}` }, [
            el("div", { className: "badge-medal", html: icon(badge.icon) }),
            el("h3", { text: badge.title }),
            el("p", { text: badge.description }),
            status.unlocked
              ? el("span", { className: "pill done", text: "✓ Kazanıldı" })
              : el("div", { className: "badge-progress" }, [
                  el("div", { className: "badge-progress-bar" }, [
                    el("div", { className: "badge-progress-fill", style: `width:${status.percent}%` })
                  ]),
                  el("small", { text: `${status.current} / ${status.target}` })
                ])
          ]);
        }))
      ])
    ]
  );
}
