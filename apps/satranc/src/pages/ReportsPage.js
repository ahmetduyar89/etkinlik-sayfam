/**
 * ReportsPage.js — seçili sınıfın maç ve turnuva özeti.
 *
 * Bu ilk rapor sürümü yalnızca ClassroomService'in güvenilir, öğrenci bazlı
 * kayıtlarını kullanır. Ders/XP ilerlemesi henüz tarayıcı profiline ortaktır;
 * yanlış bir kişiselleştirme izlenimi vermemek için burada gösterilmez.
 */

import { el } from "../utils/dom.js";
import { navigate } from "../utils/router.js";
import { classroom } from "../services/ClassroomService.js";
import { pageShell } from "./pageUtils.js";
import { PUZZLE_THEME_LABELS } from "../data/puzzleThemes.js";

const number = (value) => new Intl.NumberFormat("tr-TR").format(value);

export function ReportsPage({ sound, progress }) {
  const active = classroom.activeClass;

  if (!active) {
    return pageShell("Sınıf Raporları", "Maç, katılım ve turnuva sonuçlarını tek ekranda gör.", [
      el("section", { className: "class-card class-welcome" }, [
        el("span", { className: "class-welcome-emoji", text: "📊" }),
        el("h2", { text: "Önce bir sınıf seç" }),
        el("p", { text: "Rapor oluşturmak için üst çubuktan bir sınıf seçebilir veya Sınıflarım bölümünde yeni sınıf oluşturabilirsin." }),
        el("button", {
          className: "primary",
          type: "button",
          text: "Sınıfları yönet",
          onClick: () => { sound.play("click"); navigate("siniflar"); }
        })
      ])
    ]);
  }

  const students = classroom.students(active.id);
  const standings = classroom.classStandings(active.id);
  const matches = classroom.state.matches.filter((match) => match.classId === active.id);
  const tournaments = classroom.tournaments(active.id);
  const completedTournaments = tournaments.filter((item) => item.finished).length;
  const activeStudents = standings.filter((row) => row.played > 0).length;
  const totalPoints = standings.reduce((sum, row) => sum + row.points, 0);
  const learningProfiles = students.filter((student) => progress.profile(`student:${student.id}`)).length;
  const themeRows = Object.keys(PUZZLE_THEME_LABELS).map((theme) => {
    const total = students.reduce((sum, student) => {
      const item = progress.profile(`student:${student.id}`)?.puzzleStats?.[theme];
      if (!item) return sum;
      return {
        solved: sum.solved + (item.solved || 0),
        wrong: sum.wrong + (item.wrong || 0),
        hints: sum.hints + (item.hints || 0)
      };
    }, { solved: 0, wrong: 0, hints: 0 });
    const decisions = total.solved + total.wrong;
    return { theme, ...total, decisions, accuracy: decisions ? Math.round((total.solved / decisions) * 100) : null };
  }).filter((row) => row.decisions > 0 || row.hints > 0)
    .sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101));

  const stat = (label, value, hint) => el("article", { className: "report-stat" }, [
    el("strong", { text: number(value) }),
    el("span", { text: label }),
    hint ? el("small", { text: hint }) : null
  ]);

  const maxPlayed = Math.max(1, ...standings.map((row) => row.played));

  return pageShell("Sınıf Raporları", `${active.name} sınıfının maç ve turnuva görünümü.`, [
    el("section", { className: "report-summary", "aria-label": "Sınıf özeti" }, [
      stat("Öğrenci", students.length, `${learningProfiles} öğrenme profili açıldı`),
      stat("Toplam Maç", matches.length, `${number(totalPoints)} oyuncu puanı`),
      stat("Turnuva", tournaments.length, `${completedTournaments} tamamlandı`),
      stat("Katılım", students.length ? Math.round((activeStudents / students.length) * 100) : 0, "yüzde")
    ]),

    el("section", { className: "class-card" }, [
      el("div", { className: "report-heading" }, [
        el("div", {}, [
          el("h2", { className: "class-card-title", text: "Öğrenci performansı" }),
          el("p", { className: "class-hint", text: "Sıralama toplam puan, galibiyet ve ada göre hesaplanır." })
        ]),
        el("button", {
          className: "ghost",
          type: "button",
          text: "Sınıf ayrıntıları",
          onClick: () => { sound.play("click"); navigate("siniflar"); }
        })
      ]),
      standings.length
        ? el("div", { className: "report-list" }, standings.map((row, index) =>
            el("article", { className: "report-row" }, [
              el("span", { className: "report-rank", text: String(index + 1) }),
              el("div", { className: "report-student" }, [
                el("strong", { text: row.student.name }),
                el("div", { className: "report-bar", "aria-label": `${row.played} maç` }, [
                  el("span", { style: `width:${Math.round((row.played / maxPlayed) * 100)}%` })
                ])
              ]),
              el("span", { className: "report-score", text: `${row.points} puan` }),
              (() => {
                const learning = progress.profile(`student:${row.student.id}`);
                return el("small", {
                  text: learning
                    ? `${row.played} maç · ${row.wins}G ${row.draws}B ${row.losses}M · ${learning.xp} XP · ${learning.completedLessons.length} ders`
                    : `${row.played} maç · ${row.wins}G ${row.draws}B ${row.losses}M · öğrenme profili açılmadı`
                });
              })()
            ])
          ))
        : el("p", { className: "class-empty", text: "Bu sınıfta henüz kayıtlı maç yok. İki Kişilik Oyun veya Turnuva bölümünden ilk maçı başlatabilirsin." })
    ]),

    el("section", { className: "class-card" }, [
      el("h2", { className: "class-card-title", text: "Kısa değerlendirme" }),
      el("div", { className: "report-insights" }, [
        el("p", { text: students.length === 0
          ? "Sınıfa öğrenci eklenmemiş."
          : activeStudents === students.length
            ? "Sınıftaki bütün öğrenciler en az bir maç yaptı."
            : `${students.length - activeStudents} öğrenci henüz kayıtlı bir maç oynamadı.` }),
        el("p", { text: tournaments.length
          ? `${tournaments.length} turnuvanın ${completedTournaments} tanesi tamamlandı.`
          : "Henüz sınıf turnuvası oluşturulmadı." })
      ])
    ]),

    el("section", { className: "class-card" }, [
      el("h2", { className: "class-card-title", text: "Bulmaca konuları" }),
      el("p", { className: "class-hint", text: "En çok desteğe ihtiyaç duyulan konular önce gösterilir." }),
      themeRows.length
        ? el("div", { className: "report-themes" }, themeRows.map((row) =>
            el("article", { className: "report-theme" }, [
              el("div", { className: "report-theme-head" }, [
                el("strong", { text: PUZZLE_THEME_LABELS[row.theme] }),
                el("span", { text: `%${row.accuracy ?? 0}` })
              ]),
              el("div", { className: "report-bar" }, [
                el("span", { style: `width:${row.accuracy ?? 0}%` })
              ]),
              el("small", { text: `${row.solved} doğru · ${row.wrong} yanlış · ${row.hints} ipucu` })
            ])
          ))
        : el("p", { className: "class-empty", text: "Öğrenciler henüz bulmaca çözmedi. İlk sonuçlardan sonra konu doğrulukları burada görünecek." })
    ])
  ]);
}
