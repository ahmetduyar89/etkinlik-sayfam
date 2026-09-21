/**
 * ClassesPage.js — "Sınıflarım": sınıf ve öğrenci yönetimi.
 *
 * Öğretmen sınıf ekler, öğrenci listesini girer (e-Okul listesinden toplu
 * yapıştırma dahil) ve seçtiği sınıfın sıralamasını, her öğrencinin maç
 * geçmişini görür. Burada seçilen sınıf uygulama genelinde "aktif sınıf"
 * olur: İki Kişilik Oyun ve Turnuva ekranları öğrencileri oradan alır.
 *
 * Veriler bu bilgisayarda kalır; başka bilgisayara taşımak için Yedekle /
 * Geri Yükle kullanılır.
 */

import { el } from "../utils/dom.js";
import { navigate } from "../utils/router.js";
import { icon } from "../components/Icon.js";
import { classroom } from "../services/ClassroomService.js";
import { decryptRoster } from "../services/RosterCrypto.js";
import { CLASS_ROSTER } from "../data/classRoster.js";
import { pageShell } from "./pageUtils.js";

/** ½ puanı okunur yazar: 2.5 → "2½". */
export function pointsText(value) {
  const whole = Math.floor(value);
  if (value - whole < 0.5) return String(whole);
  return whole === 0 ? "½" : `${whole}½`;
}

/** ISO tarihini "17.09.2026" biçiminde yazar. */
export function dateText(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("tr-TR");
}

export function ClassesPage({ sound, progress }) {
  let selectedStudentId = null;
  let bulkOpen = false;
  let notice = { text: "", tone: "" };

  const sidebar = el("aside", { className: "class-sidebar" });
  const main = el("div", { className: "class-main" });

  function say(text, tone = "info") {
    notice = { text, tone };
  }

  function draw() {
    drawSidebar();
    drawMain();
  }

  /* ---------------------------------------------------------------- *
   * Sol sütun: sınıf listesi, sınıf ekleme, yedek
   * ---------------------------------------------------------------- */

  function drawSidebar() {
    const active = classroom.state.activeClassId;
    const nameInput = el("input", {
      className: "class-input",
      type: "text",
      maxlength: "30",
      placeholder: "Örn. 3-A",
      "aria-label": "Yeni sınıf adı"
    });

    const addClass = () => {
      const created = classroom.addClass(nameInput.value);
      if (!created) {
        nameInput.focus();
        return;
      }
      sound.play("success");
      selectedStudentId = null;
      bulkOpen = true;
      say(`${created.name} eklendi. Şimdi öğrencileri ekle.`, "correct");
      draw();
    };
    nameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") addClass();
    });

    const fileInput = el("input", {
      type: "file",
      accept: "application/json,.json",
      hidden: "",
      onChange: async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        const text = await file.text();
        if (!window.confirm("Yedek yüklenirse bu bilgisayardaki TÜM sınıf, öğrenci, turnuva ve öğrenme profilleri yedektekilerle değiştirilir. Devam edilsin mi?")) return;
        if (classroom.importJSON(text)) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.progress && progress.importData(parsed.progress)) {
              progress.switchProfile("teacher", "Öğretmen");
            }
          } catch {
            // Sınıf yedeği geçerli olduğuna göre bu yalnızca eski biçim olabilir.
          }
          sound.play("success");
          selectedStudentId = null;
          say("Yedek yüklendi.", "correct");
        } else {
          sound.play("error");
          say("Bu dosya geçerli bir sınıf yedeği değil.", "wrong");
        }
        draw();
      }
    });

    sidebar.replaceChildren(
      ...(classroom.rosterPending(CLASS_ROSTER) ? [rosterCard()] : []),
      el("section", { className: "class-card" }, [
        el("h2", { className: "class-card-title", text: "Sınıflar" }),
        classroom.classes.length === 0
          ? el("p", { className: "class-empty", text: "Henüz sınıf yok. Aşağıdan ilk sınıfını ekle." })
          : el("div", { className: "class-list" }, classroom.classes.map((item) =>
              el("button", {
                className: `class-item ${item.id === active ? "active" : ""}`,
                type: "button",
                onClick: () => {
                  sound.play("click");
                  classroom.setActiveClass(item.id);
                  selectedStudentId = null;
                  notice = { text: "", tone: "" };
                  draw();
                }
              }, [
                el("strong", { text: item.name }),
                el("small", { text: `${classroom.students(item.id).length} öğrenci` })
              ])
            )),
        el("div", { className: "class-add" }, [
          nameInput,
          el("button", { className: "primary small", type: "button", text: "Sınıf Ekle", onClick: addClass })
        ])
      ]),
      el("section", { className: "class-card" }, [
        el("h2", { className: "class-card-title", text: "Yedek" }),
        el("p", {
          className: "class-hint",
          text: "Sınıflar, maçlar ve öğrenci ilerlemeleri yalnızca bu bilgisayarda durur. Başka bilgisayara taşımak ya da güvenceye almak için yedek dosyası al."
        }),
        el("div", { className: "class-row-buttons" }, [
          el("button", {
            className: "ghost small",
            type: "button",
            text: "Yedekle",
            onClick: () => {
              sound.play("click");
              const backup = JSON.parse(classroom.exportJSON());
              backup.progress = progress.exportData();
              const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
              const link = el("a", {
                href: URL.createObjectURL(blob),
                download: `satranc-siniflar-${new Date().toISOString().slice(0, 10)}.json`
              });
              document.body.append(link);
              link.click();
              link.remove();
              setTimeout(() => URL.revokeObjectURL(link.href), 1000);
            }
          }),
          el("button", {
            className: "ghost small",
            type: "button",
            text: "Geri Yükle",
            onClick: () => fileInput.click()
          }),
          fileInput
        ])
      ])
    );
  }

  /**
   * Gömülü okul listesi bu bilgisayara henüz yüklenmediyse (ya da liste
   * güncellendiyse) öğretmen şifresini ister. Liste şifreli olduğu için
   * siteyi açan başkası adları göremez.
   */
  function rosterCard() {
    const firstTime = !classroom.state.rosterVersion;
    const input = el("input", {
      className: "class-input",
      type: "password",
      autocomplete: "current-password",
      placeholder: "Öğretmen şifresi",
      "aria-label": "Öğretmen şifresi"
    });
    const message = el("p", { className: "class-hint", text: "" });
    const button = el("button", { className: "primary small", type: "button", text: firstTime ? "Listeyi Yükle" : "Güncelle" });

    const unlock = async () => {
      if (!input.value) {
        input.focus();
        return;
      }
      button.disabled = true;
      message.textContent = "Liste açılıyor…";
      message.className = "class-hint";
      let roster = null;
      try {
        roster = await decryptRoster(CLASS_ROSTER, input.value);
      } catch (error) {
        message.textContent = error.message || "Liste açılamadı.";
        message.className = "class-hint danger-text";
        button.disabled = false;
        return;
      }
      if (!roster) {
        sound.play("error");
        message.textContent = "Şifre yanlış.";
        message.className = "class-hint danger-text";
        button.disabled = false;
        input.select();
        return;
      }

      const added = classroom.applyRoster(roster, CLASS_ROSTER.version);
      sound.play("success");
      selectedStudentId = null;
      say(
        added.classes || added.students
          ? `Okul listesi yüklendi: ${added.classes} sınıf, ${added.students} öğrenci eklendi. Bu bilgisayarın sınıfını soldan ya da üst çubuktan seç.`
          : "Okul listesi zaten güncel.",
        "correct"
      );
      draw();
    };
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") unlock();
    });
    button.addEventListener("click", unlock);

    return el("section", { className: "class-card class-roster" }, [
      el("h2", { className: "class-card-title", text: firstTime ? "🏫 Okul listesi hazır" : "🏫 Güncel okul listesi var" }),
      el("p", {
        className: "class-hint",
        text: firstTime
          ? "Okulun sınıf ve öğrenci listesi uygulamada hazır. Bu bilgisayara yüklemek için öğretmen şifresini gir (bir kez yeterli)."
          : "Sınıf listesi güncellendi. Yeni öğrencileri eklemek için şifreyi gir; buradaki maç ve turnuva kayıtları silinmez."
      }),
      el("div", { className: "class-add" }, [input, button]),
      message
    ]);
  }

  /* ---------------------------------------------------------------- *
   * Sağ sütun: seçili sınıf
   * ---------------------------------------------------------------- */

  function drawMain() {
    const item = classroom.activeClass;
    if (!item) {
      main.replaceChildren(
        ...(notice.text ? [el("p", { className: `lesson-status ${notice.tone}`, text: notice.text })] : []),
        el("section", { className: "class-card class-welcome" }, [
          el("span", { className: "class-welcome-emoji", text: "🏫" }),
          el("h2", {
            text: classroom.classes.length
              ? "Bir sınıf seç"
              : classroom.rosterPending(CLASS_ROSTER) ? "Okul listesini yükle" : "İlk sınıfını ekle"
          }),
          el("p", {
            text: !classroom.classes.length && classroom.rosterPending(CLASS_ROSTER)
              ? "Sınıflar ve öğrenciler uygulamada hazır. Soldaki karta öğretmen şifresini girmen yeterli."
              : "Sınıf seçtiğinde öğrencilerin, maç sonuçları ve sıralama burada görünür. İki Kişilik Oyun ve Turnuva ekranları da bu sınıfın listesini kullanır."
          })
        ])
      );
      return;
    }

    const students = classroom.students(item.id);

    // Koşullu bölümler null olabilir; replaceChildren null'u "null" yazısı yapar.
    const sections = [
      el("section", { className: "class-card class-head" }, [
        el("div", { className: "class-head-title" }, [
          el("h2", { text: item.name }),
          el("span", { className: "class-count", text: `${students.length} öğrenci` })
        ]),
        el("div", { className: "class-row-buttons" }, [
          el("button", {
            className: "primary small",
            type: "button",
            html: `${icon("crown")} Turnuva`,
            onClick: () => navigate("turnuva")
          }),
          el("button", {
            className: "ghost small",
            type: "button",
            html: `${icon("duo")} İki Kişilik Oyun`,
            onClick: () => navigate("duello")
          }),
          el("button", {
            className: "ghost small",
            type: "button",
            html: `${icon("edit")} Adını Değiştir`,
            onClick: () => {
              const name = window.prompt("Sınıfın yeni adı:", item.name);
              if (name === null) return;
              classroom.renameClass(item.id, name);
              draw();
            }
          }),
          el("button", {
            className: "ghost small danger-text",
            type: "button",
            text: "Sınıfı Sil",
            onClick: () => {
              if (!window.confirm(`${item.name} sınıfı; öğrencileri, maç sonuçları ve turnuvalarıyla birlikte silinecek. Emin misin?`)) return;
              classroom.deleteClass(item.id);
              sound.play("click");
              selectedStudentId = null;
              say(`${item.name} silindi.`, "info");
              draw();
            }
          })
        ])
      ]),
      notice.text ? el("p", { className: `lesson-status ${notice.tone}`, text: notice.text }) : null,
      studentAdder(item),
      students.length ? standingsCard(item) : null,
      selectedStudentId ? studentDetail(selectedStudentId) : null,
      students.length >= 2 ? manualMatchCard(item) : null
    ];
    main.replaceChildren(...sections.filter(Boolean));
  }

  /** Öğrenci ekleme: tek tek ya da liste yapıştırarak. */
  function studentAdder(item) {
    const single = el("input", {
      className: "class-input",
      type: "text",
      maxlength: "40",
      placeholder: "Ad Soyad",
      "aria-label": "Öğrencinin adı soyadı"
    });
    const bulk = el("textarea", {
      className: "class-textarea",
      rows: "8",
      placeholder: "Her satıra bir öğrenci:\nAyşe Yılmaz\nMehmet Demir\n...",
      "aria-label": "Öğrenci listesi"
    });

    const add = (text) => {
      const { added, skipped } = classroom.addStudents(item.id, text);
      if (!added && !skipped) return;
      sound.play(added ? "success" : "error");
      say(
        `${added} öğrenci eklendi.` + (skipped ? ` ${skipped} ad zaten listede olduğu için atlandı.` : ""),
        added ? "correct" : "wrong"
      );
      if (added) bulkOpen = false;
      draw();
    };
    single.addEventListener("keydown", (event) => {
      if (event.key === "Enter") add(single.value);
    });

    return el("section", { className: "class-card" }, [
      el("h3", { className: "class-card-title", text: "Öğrenci Ekle" }),
      el("div", { className: "class-add" }, [
        single,
        el("button", { className: "primary small", type: "button", text: "Ekle", onClick: () => add(single.value) }),
        el("button", {
          className: "ghost small",
          type: "button",
          text: bulkOpen ? "Listeyi Kapat" : "Liste Yapıştır",
          onClick: () => {
            bulkOpen = !bulkOpen;
            drawMain();
          }
        })
      ]),
      bulkOpen
        ? el("div", { className: "class-bulk" }, [
            el("p", {
              className: "class-hint",
              text: "e-Okul ya da Excel listesinden ad soyad sütununu kopyalayıp yapıştırabilirsin. Satır başındaki numaralar atılır, BÜYÜK HARF adlar düzeltilir."
            }),
            bulk,
            el("button", { className: "primary small", type: "button", text: "Hepsini Ekle", onClick: () => add(bulk.value) })
          ])
        : null
    ]);
  }

  /** Sınıf sıralaması: tüm maçlardan (iki kişilik + turnuva) hesaplanır. */
  function standingsCard(item) {
    const rows = classroom.classStandings(item.id);
    return el("section", { className: "class-card" }, [
      el("h3", { className: "class-card-title", text: "Öğrenciler ve Sıralama" }),
      el("p", { className: "class-hint", text: "Galibiyet 1, beraberlik ½ puan. Öğrenciye dokununca maç geçmişi açılır." }),
      el("div", { className: "class-table-wrap" }, [
        el("table", { className: "class-table" }, [
          el("thead", {}, [
            el("tr", {}, ["#", "Ad Soyad", "Maç", "G", "B", "M", "Puan", ""].map((label) => el("th", { text: label })))
          ]),
          el("tbody", {}, rows.map((row, index) =>
            el("tr", {
              className: row.student.id === selectedStudentId ? "selected" : "",
              onClick: () => {
                sound.play("click");
                selectedStudentId = selectedStudentId === row.student.id ? null : row.student.id;
                drawMain();
              }
            }, [
              el("td", { className: "num", text: row.played ? String(index + 1) : "–" }),
              el("td", { className: "name", text: row.student.name }),
              el("td", { className: "num", text: String(row.played) }),
              el("td", { className: "num", text: String(row.wins) }),
              el("td", { className: "num", text: String(row.draws) }),
              el("td", { className: "num", text: String(row.losses) }),
              el("td", { className: "num strong", text: pointsText(row.points) }),
              el("td", { className: "actions" }, [
                el("button", {
                  className: "class-icon-btn",
                  type: "button",
                  title: "Adını düzelt",
                  "aria-label": `${row.student.name} adını düzelt`,
                  html: icon("edit"),
                  onClick: (event) => {
                    event.stopPropagation();
                    const name = window.prompt("Öğrencinin adı soyadı:", row.student.name);
                    if (name === null) return;
                    classroom.renameStudent(row.student.id, name);
                    draw();
                  }
                }),
                el("button", {
                  className: "class-icon-btn danger-text",
                  type: "button",
                  title: "Sınıftan çıkar",
                  "aria-label": `${row.student.name} sınıftan çıkar`,
                  text: "✕",
                  onClick: (event) => {
                    event.stopPropagation();
                    if (!window.confirm(`${row.student.name} sınıf listesinden çıkarılsın mı? Geçmiş maçları ve turnuva sonuçları korunur.`)) return;
                    classroom.removeStudent(row.student.id);
                    if (selectedStudentId === row.student.id) selectedStudentId = null;
                    say(`${row.student.name} listeden çıkarıldı.`, "info");
                    draw();
                  }
                })
              ])
            ])
          ))
        ])
      ])
    ]);
  }

  /** Öğrencinin kartı: özet ve maç geçmişi. */
  function studentDetail(studentId) {
    const student = classroom.findStudent(studentId);
    if (!student || student.removed) return null;
    const stats = classroom.statsOf(studentId);
    const matches = classroom.matchesOf(studentId);

    const statBox = (label, value) =>
      el("div", { className: "class-stat" }, [el("strong", { text: value }), el("span", { text: label })]);

    return el("section", { className: "class-card class-student" }, [
      el("div", { className: "class-student-head" }, [
        el("h3", { className: "class-card-title", text: student.name }),
        el("button", {
          className: "class-icon-btn",
          type: "button",
          text: "✕",
          title: "Kapat",
          "aria-label": "Öğrenci kartını kapat",
          onClick: () => {
            selectedStudentId = null;
            drawMain();
          }
        })
      ]),
      el("div", { className: "class-stats" }, [
        statBox("Maç", String(stats.played)),
        statBox("Galibiyet", String(stats.wins)),
        statBox("Beraberlik", String(stats.draws)),
        statBox("Mağlubiyet", String(stats.losses)),
        statBox("Puan", pointsText(stats.points))
      ]),
      matches.length === 0
        ? el("p", { className: "class-empty", text: "Henüz kayıtlı maçı yok." })
        : el("ul", { className: "class-matches" }, matches.map((match) => {
            const isWhite = match.whiteId === studentId;
            const rivalId = isWhite ? match.blackId : match.whiteId;
            const white = { "1-0": 1, "0-1": 0, "½-½": 0.5 }[match.result];
            const mine = isWhite ? white : 1 - white;
            const outcome = mine === 1 ? ["Kazandı", "win"] : mine === 0 ? ["Kaybetti", "loss"] : ["Berabere", "draw"];
            const tournament = match.tournamentId ? classroom.getTournament(match.tournamentId) : null;
            const source = tournament
              ? `${tournament.name} · ${match.round}. tur`
              : match.source === "manual" ? "Elle girildi" : "İki Kişilik Oyun";

            return el("li", { className: "class-match" }, [
              el("span", { className: `class-outcome ${outcome[1]}`, text: outcome[0] }),
              el("div", { className: "class-match-body" }, [
                el("strong", { text: `${isWhite ? "♔ Beyaz" : "♚ Siyah"} · Rakip: ${classroom.studentName(rivalId)}` }),
                el("small", { text: [dateText(match.date), source, match.reason].filter(Boolean).join(" · ") })
              ]),
              el("button", {
                className: "class-icon-btn danger-text",
                type: "button",
                text: "✕",
                title: "Bu maç kaydını sil",
                "aria-label": "Bu maç kaydını sil",
                onClick: () => {
                  const note = tournament ? " Turnuvadaki masa da sonuçsuz kalacak." : "";
                  if (!window.confirm(`Bu maç kaydı silinsin mi?${note}`)) return;
                  classroom.deleteMatch(match.id);
                  draw();
                }
              })
            ]);
          }))
    ]);
  }

  /** Fiziksel tahtada oynanmış bir maçın sonucunu elle girme. */
  function manualMatchCard(item) {
    const students = classroom.students(item.id);
    const picker = (label) =>
      el("select", { className: "class-select", "aria-label": label }, [
        el("option", { value: "", text: label }),
        ...students.map((student) => el("option", { value: student.id, text: student.name }))
      ]);
    const white = picker("Beyaz oyuncu");
    const black = picker("Siyah oyuncu");

    const submit = (result) => {
      if (!white.value || !black.value || white.value === black.value) {
        sound.play("error");
        say("İki farklı öğrenci seç.", "wrong");
        drawMain();
        return;
      }
      classroom.recordMatch({
        classId: item.id,
        whiteId: white.value,
        blackId: black.value,
        result,
        source: "manual"
      });
      sound.play("success");
      say(`Kaydedildi: ${classroom.studentName(white.value)} ${result} ${classroom.studentName(black.value)}`, "correct");
      draw();
    };

    return el("section", { className: "class-card" }, [
      el("h3", { className: "class-card-title", text: "Maç Sonucu Gir" }),
      el("p", { className: "class-hint", text: "Gerçek tahtada oynanan bir maçı buradan kaydedebilirsin." }),
      el("div", { className: "class-manual" }, [
        white,
        el("span", { className: "class-vs", text: "–" }),
        black
      ]),
      el("div", { className: "class-row-buttons" }, [
        el("button", { className: "ghost small", type: "button", text: "1-0 Beyaz kazandı", onClick: () => submit("1-0") }),
        el("button", { className: "ghost small", type: "button", text: "½-½ Berabere", onClick: () => submit("½-½") }),
        el("button", { className: "ghost small", type: "button", text: "0-1 Siyah kazandı", onClick: () => submit("0-1") })
      ])
    ]);
  }

  draw();

  return pageShell(
    "Sınıflarım",
    "Sınıflarını ve öğrencilerini yönet; maç sonuçları ve sıralama burada toplanır.",
    [el("section", { className: "class-layout" }, [sidebar, main])],
    { compact: true }
  );
}
