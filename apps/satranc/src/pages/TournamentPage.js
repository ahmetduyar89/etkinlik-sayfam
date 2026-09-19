/**
 * TournamentPage.js — Aktif sınıfın İsviçre sistemi turnuvaları.
 *
 * Akış:
 *   1. Öğretmen turnuvaya ad verir, katılacak öğrencileri işaretler ve tur
 *      sayısını seçer (önerilen sayı otomatik gelir).
 *   2. "Turu Eşleştir" ile masalar oluşur. Her masanın sonucu ya elle
 *      (1-0, ½-½, 0-1) girilir ya da "Tahtada Oyna" ile İki Kişilik Oyun
 *      ekranında oynanır; oyun bitince sonuç masaya kendiliğinden işlenir.
 *   3. Turun bütün sonuçları girilince sonraki tur eşleştirilir.
 *   4. Puan tablosu puan → Buchholz → galibiyet sırasıyla dizilir.
 *
 * Bütün maçlar öğrencinin kişisel geçmişine de yazılır (bkz. Sınıflarım).
 */

import { el } from "../utils/dom.js";
import { navigate, routeParam } from "../utils/router.js";
import { icon } from "../components/Icon.js";
import { classroom } from "../services/ClassroomService.js";
import { suggestedRounds } from "../services/SwissPairing.js";
import { pageShell } from "./pageUtils.js";
import { pointsText, dateText } from "./ClassesPage.js";

const RESULTS = [
  ["1-0", "1-0", "Beyaz kazandı"],
  ["½-½", "½-½", "Berabere"],
  ["0-1", "0-1", "Siyah kazandı"]
];

export function TournamentPage({ sound }) {
  let openId = routeParam("id", null);
  // Gösterilen sekme: tur sırası (0'dan) ya da "table".
  let tab = null;

  const host = el("div", { className: "tour-host" });

  function draw() {
    const item = classroom.activeClass;
    if (!item) {
      host.replaceChildren(noClass());
      return;
    }
    const t = openId ? classroom.getTournament(openId) : null;
    // Koşullu bölümler null olabilir; replaceChildren null'u "null" yazısı yapar.
    if (t && t.classId === item.id) host.replaceChildren(...detail(t).filter(Boolean));
    else {
      openId = null;
      host.replaceChildren(...overview(item).filter(Boolean));
    }
  }

  function noClass() {
    return el("section", { className: "class-card class-welcome" }, [
      el("span", { className: "class-welcome-emoji", text: "🏆" }),
      el("h2", { text: "Önce bir sınıf seç" }),
      el("p", { text: "Turnuva, seçili sınıfın öğrencileriyle yapılır. Üst çubuktan sınıf seçebilirsin. Bu bilgisayarda henüz sınıf yoksa Sınıflarım ekranından okul listesini yükle." }),
      el("button", { className: "primary", type: "button", text: "Sınıflarım", onClick: () => navigate("siniflar") })
    ]);
  }

  /* ---------------------------------------------------------------- *
   * Genel görünüm: yeni turnuva + turnuva listesi
   * ---------------------------------------------------------------- */

  function overview(item) {
    const students = classroom.students(item.id);
    const chosen = new Set(students.map((student) => student.id));

    const nameInput = el("input", {
      className: "class-input",
      type: "text",
      maxlength: "40",
      value: `${item.name} Turnuvası`,
      "aria-label": "Turnuva adı"
    });
    const roundsInput = el("input", {
      className: "class-input tour-rounds-input",
      type: "number",
      min: "1",
      max: "20",
      value: String(suggestedRounds(chosen.size)),
      "aria-label": "Tur sayısı"
    });
    const countNote = el("span", { className: "class-hint" });
    const updateCount = () => {
      countNote.textContent = `${chosen.size} oyuncu · önerilen ${suggestedRounds(chosen.size)} tur` +
        (chosen.size % 2 === 1 ? " · her turda bir kişi bay geçer" : "");
    };

    const checks = students.map((student) =>
      el("label", { className: "tour-check" }, [
        el("input", {
          type: "checkbox",
          checked: "",
          onChange: (event) => {
            if (event.target.checked) chosen.add(student.id);
            else chosen.delete(student.id);
            roundsInput.value = String(suggestedRounds(chosen.size));
            updateCount();
          }
        }),
        el("span", { text: student.name })
      ])
    );
    const setAll = (on) => {
      for (const label of checks) label.querySelector("input").checked = on;
      chosen.clear();
      if (on) for (const student of students) chosen.add(student.id);
      roundsInput.value = String(suggestedRounds(chosen.size));
      updateCount();
    };
    updateCount();

    const list = classroom.tournaments(item.id);

    return [
      el("section", { className: "class-card" }, [
        el("h2", { className: "class-card-title", text: `Yeni Turnuva — ${item.name}` }),
        students.length < 2
          ? el("div", {}, [
              el("p", { className: "class-empty", text: "Turnuva için sınıfta en az 2 öğrenci olmalı." }),
              el("button", { className: "ghost small", type: "button", text: "Öğrenci Ekle", onClick: () => navigate("siniflar") })
            ])
          : el("div", { className: "tour-form" }, [
              el("label", { className: "tour-field" }, [el("span", { text: "Turnuva adı" }), nameInput]),
              el("label", { className: "tour-field short" }, [el("span", { text: "Tur sayısı" }), roundsInput]),
              el("div", { className: "tour-field wide" }, [
                el("div", { className: "tour-check-head" }, [
                  el("span", { text: "Katılanlar" }),
                  countNote,
                  el("button", { className: "link-button", type: "button", text: "Hepsi", onClick: () => setAll(true) }),
                  el("button", { className: "link-button", type: "button", text: "Hiçbiri", onClick: () => setAll(false) })
                ]),
                el("div", { className: "tour-checks" }, checks)
              ]),
              el("button", {
                className: "primary",
                type: "button",
                html: `${icon("crown")} Turnuvayı Oluştur ve 1. Turu Eşleştir`,
                onClick: () => {
                  if (chosen.size < 2) {
                    sound.play("error");
                    countNote.textContent = "En az 2 oyuncu seç.";
                    return;
                  }
                  const t = classroom.createTournament({
                    classId: item.id,
                    name: nameInput.value,
                    rounds: roundsInput.value,
                    playerIds: students.filter((student) => chosen.has(student.id)).map((student) => student.id)
                  });
                  classroom.pairNextRound(t.id);
                  sound.play("success");
                  openId = t.id;
                  tab = 0;
                  draw();
                }
              })
            ])
      ]),
      list.length
        ? el("section", { className: "class-card" }, [
            el("h2", { className: "class-card-title", text: "Turnuvalar" }),
            el("div", { className: "tour-list" }, list.map((t) => {
              const leader = classroom.tournamentStandings(t)[0];
              return el("button", {
                className: "tour-list-item",
                type: "button",
                onClick: () => {
                  sound.play("click");
                  openId = t.id;
                  tab = null;
                  draw();
                }
              }, [
                el("span", { className: "tour-list-emoji", text: t.finished ? "🏆" : "♟️" }),
                el("div", { className: "tour-list-body" }, [
                  el("strong", { text: t.name }),
                  el("small", {
                    text: [
                      dateText(t.createdAt),
                      `${t.playerIds.length} oyuncu`,
                      `Tur ${t.rounds.length}/${t.plannedRounds}`,
                      t.finished && leader ? `Birinci: ${classroom.studentName(leader.id)}` : t.finished ? "Bitti" : "Devam ediyor"
                    ].join(" · ")
                  })
                ])
              ]);
            }))
          ])
        : null
    ];
  }

  /* ---------------------------------------------------------------- *
   * Turnuva ayrıntısı
   * ---------------------------------------------------------------- */

  function detail(t) {
    const roundCount = t.rounds.length;
    const lastComplete = roundCount === 0 || classroom.roundComplete(t);
    if (tab === null) tab = lastComplete && (t.finished || roundCount >= t.plannedRounds) ? "table" : Math.max(0, roundCount - 1);
    if (typeof tab === "number" && tab >= roundCount) tab = roundCount ? roundCount - 1 : "table";

    const canPair = !t.finished && lastComplete;
    const allDone = lastComplete && roundCount >= t.plannedRounds;

    const status = t.finished
      ? "Turnuva bitti."
      : roundCount === 0
        ? "Henüz tur eşleştirilmedi."
        : !lastComplete
          ? `${roundCount}. tur oynanıyor — sonuçları gir.`
          : allDone
            ? "Planlanan bütün turlar bitti. Turnuvayı bitirebilir ya da bir tur daha ekleyebilirsin."
            : `${roundCount}. tur tamamlandı. Sonraki turu eşleştirebilirsin.`;

    return [
      el("section", { className: "class-card tour-head" }, [
        el("button", {
          className: "ghost small",
          type: "button",
          text: "← Turnuvalar",
          onClick: () => {
            openId = null;
            tab = null;
            draw();
          }
        }),
        el("div", { className: "tour-head-title" }, [
          el("h2", { text: t.name }),
          el("small", { text: `${dateText(t.createdAt)} · ${t.playerIds.length} oyuncu · Tur ${roundCount}/${t.plannedRounds} · İsviçre sistemi` })
        ]),
        el("div", { className: "class-row-buttons" }, [
          canPair
            ? el("button", {
                className: "primary small",
                type: "button",
                text: allDone ? "Bir Tur Daha Ekle" : `${roundCount + 1}. Turu Eşleştir`,
                onClick: () => {
                  if (allDone) {
                    if (!window.confirm("Planlanan tur sayısı doldu. Bir tur daha eklensin mi?")) return;
                    t.plannedRounds += 1;
                  }
                  if (!classroom.pairNextRound(t.id)) {
                    sound.play("error");
                    return;
                  }
                  sound.play("success");
                  tab = t.rounds.length - 1;
                  draw();
                }
              })
            : null,
          allDone && !t.finished
            ? el("button", {
                className: "primary small",
                type: "button",
                text: "Turnuvayı Bitir",
                onClick: () => {
                  classroom.setTournamentFinished(t.id, true);
                  sound.play("badge");
                  tab = "table";
                  draw();
                }
              })
            : null,
          t.finished
            ? el("button", {
                className: "ghost small",
                type: "button",
                text: "Yeniden Aç",
                onClick: () => {
                  classroom.setTournamentFinished(t.id, false);
                  draw();
                }
              })
            : null,
          roundCount && !t.finished
            ? el("button", {
                className: "ghost small",
                type: "button",
                text: "Son Turu Geri Al",
                onClick: () => {
                  const hasResults = t.rounds[roundCount - 1].some((board) => board.matchId);
                  const message = hasResults
                    ? `${roundCount}. turun eşleşmeleri ve girilen sonuçları silinecek. Emin misin?`
                    : `${roundCount}. turun eşleşmeleri silinsin mi?`;
                  if (!window.confirm(message)) return;
                  classroom.undoLastRound(t.id);
                  tab = null;
                  draw();
                }
              })
            : null,
          el("button", {
            className: "ghost small danger-text",
            type: "button",
            text: "Sil",
            onClick: () => {
              if (!window.confirm(`"${t.name}" ve bu turnuvada oynanan bütün maç kayıtları silinecek. Emin misin?`)) return;
              classroom.deleteTournament(t.id);
              openId = null;
              tab = null;
              draw();
            }
          })
        ])
      ]),
      el("p", { className: `lesson-status ${t.finished ? "correct" : "info"}`, text: status }),
      el("div", { className: "stage-row tour-tabs" }, [
        ...t.rounds.map((_, index) =>
          el("button", {
            className: `stage-chip ${tab === index ? "active" : ""}`,
            type: "button",
            text: `${index + 1}. Tur${classroom.roundComplete(t, index) ? " ✓" : ""}`,
            onClick: () => {
              tab = index;
              draw();
            }
          })
        ),
        el("button", {
          className: `stage-chip ${tab === "table" ? "active" : ""}`,
          type: "button",
          text: "Puan Tablosu",
          onClick: () => {
            tab = "table";
            draw();
          }
        })
      ]),
      tab === "table" ? standings(t) : roundView(t, tab)
    ];
  }

  /** Bir turun masaları ve sonuç girişi. */
  function roundView(t, index) {
    const round = t.rounds[index];
    if (!round) return el("p", { className: "class-empty", text: "Bu turda masa yok." });

    // Masadaki oyuncunun o turdan ÖNCEKİ puanı — eşleşmenin adil olduğu görülsün.
    const before = new Map();
    const earlier = { ...t, rounds: t.rounds.slice(0, index) };
    for (const row of classroom.tournamentStandings(earlier)) before.set(row.id, row.points);
    const who = (id) =>
      el("span", { className: "tour-player" }, [
        el("strong", { text: classroom.studentName(id) }),
        el("small", { text: `${pointsText(before.get(id) || 0)} puan` })
      ]);

    return el("section", { className: "class-card" }, [
      el("div", { className: "tour-boards" }, round.map((board) => {
        if (board.blackId === null) {
          return el("div", { className: "tour-board bye" }, [
            el("span", { className: "tour-table-no", text: "BAY" }),
            who(board.whiteId),
            el("span", { className: "tour-bye-note", text: "Bu tur rakibi yok — 1 puan alır." })
          ]);
        }

        const result = classroom.boardResult(board);
        return el("div", { className: `tour-board ${result ? "done" : ""}` }, [
          el("span", { className: "tour-table-no", text: `Masa ${board.table}` }),
          el("div", { className: "tour-side white" }, [el("span", { className: "tour-color", text: "♔" }), who(board.whiteId)]),
          el("div", { className: "tour-results", role: "group", "aria-label": "Sonuç" }, RESULTS.map(([code, label, title]) =>
            el("button", {
              className: `tour-result ${result === code ? "active" : ""}`,
              type: "button",
              text: label,
              title,
              "aria-pressed": result === code ? "true" : "false",
              disabled: t.finished ? "" : null,
              onClick: () => {
                sound.play("click");
                classroom.setBoardResult(t.id, board.id, result === code ? null : code);
                draw();
              }
            })
          )),
          el("div", { className: "tour-side black" }, [who(board.blackId), el("span", { className: "tour-color", text: "♚" })]),
          t.finished
            ? null
            : el("button", {
                className: "ghost small tour-play",
                type: "button",
                html: `${icon("duo")} Tahtada Oyna`,
                title: "İki Kişilik Oyun ekranında oyna; sonuç buraya kendiliğinden yazılır.",
                onClick: () => navigate("duello", { turnuva: t.id, masa: board.id })
              })
        ]);
      }))
    ]);
  }

  /** Puan tablosu + oyuncu çekme/ekleme. */
  function standings(t) {
    const rows = classroom.tournamentStandings(t);
    const podium = t.finished ? rows.slice(0, 3) : [];
    const outsiders = classroom.students(t.classId).filter((student) => !t.playerIds.includes(student.id));

    return el("section", { className: "class-card" }, [
      podium.length
        ? el("div", { className: "tour-podium" }, podium.map((row, index) =>
            el("div", { className: `tour-podium-step place-${index + 1}` }, [
              el("span", { className: "tour-medal", text: ["🥇", "🥈", "🥉"][index] }),
              el("strong", { text: classroom.studentName(row.id) }),
              el("small", { text: `${pointsText(row.points)} puan` })
            ])
          ))
        : null,
      el("div", { className: "class-table-wrap" }, [
        el("table", { className: "class-table" }, [
          el("thead", {}, [
            el("tr", {}, [
              el("th", { text: "#" }),
              el("th", { text: "Ad Soyad" }),
              el("th", { text: "Puan", title: "Galibiyet 1, beraberlik ½, bay 1" }),
              el("th", { text: "Bh.", title: "Buchholz: rakiplerin puan toplamı (eşitlikte belirleyici)" }),
              el("th", { text: "G" }),
              el("th", { text: "B" }),
              el("th", { text: "M" }),
              el("th", { text: "" })
            ])
          ]),
          el("tbody", {}, rows.map((row, index) => {
            const out = t.withdrawn.includes(row.id);
            return el("tr", { className: out ? "withdrawn" : "" }, [
              el("td", { className: "num", text: String(index + 1) }),
              el("td", { className: "name", text: classroom.studentName(row.id) + (row.byes ? ` (bay ×${row.byes})` : "") }),
              el("td", { className: "num strong", text: pointsText(row.points) }),
              el("td", { className: "num", text: pointsText(row.buchholz) }),
              el("td", { className: "num", text: String(row.wins) }),
              el("td", { className: "num", text: String(row.draws) }),
              el("td", { className: "num", text: String(row.losses) }),
              el("td", { className: "actions" }, [
                t.finished
                  ? null
                  : el("button", {
                      className: "link-button",
                      type: "button",
                      text: out ? "Geri al" : "Çekildi",
                      title: out ? "Sonraki turlarda yeniden eşleştirilsin" : "Sonraki turlarda eşleştirilmesin",
                      onClick: () => {
                        classroom.toggleWithdrawn(t.id, row.id);
                        draw();
                      }
                    })
              ])
            ]);
          }))
        ])
      ]),
      !t.finished && outsiders.length
        ? el("div", { className: "tour-late" }, [
            el("span", { className: "class-hint", text: "Geç katılan öğrenci (kaçırdığı turlar 0 puan sayılır):" }),
            el("select", {
              className: "class-select",
              "aria-label": "Turnuvaya öğrenci ekle",
              onChange: (event) => {
                if (!event.target.value) return;
                classroom.addTournamentPlayer(t.id, event.target.value);
                sound.play("success");
                draw();
              }
            }, [
              el("option", { value: "", text: "Öğrenci ekle…" }),
              ...outsiders.map((student) => el("option", { value: student.id, text: student.name }))
            ])
          ])
        : null
    ]);
  }

  draw();

  return pageShell(
    "Turnuva",
    "Seçili sınıfın öğrencileriyle İsviçre sistemi turnuva.",
    [host],
    { compact: true }
  );
}
