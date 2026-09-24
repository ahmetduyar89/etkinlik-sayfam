import { el, clear } from "./utils/dom.js";
import { currentRoute, navigate, onRouteChange } from "./utils/router.js";
import { navGroups } from "./data/lessons.js";
import { ProgressService } from "./services/ProgressService.js";
import { SoundService } from "./audio/SoundService.js";
import { icon } from "./components/Icon.js";
import { reveal } from "./animations/effects.js";
import { HomePage } from "./pages/HomePage.js";
import { PlanPage } from "./pages/PlanPage.js";
import { LearnPage } from "./pages/LearnPage.js";
import { BoardPage } from "./pages/BoardPage.js";
import { PiecesPage } from "./pages/PiecesPage.js";
import { RulesPage } from "./pages/RulesPage.js";
import { TacticsPage } from "./pages/TacticsPage.js";
import { OpeningsPage } from "./pages/OpeningsPage.js";
import { EndgamesPage } from "./pages/EndgamesPage.js";
import { PuzzlesPage } from "./pages/PuzzlesPage.js";
import { MiniGamesPage } from "./pages/MiniGamesPage.js";
import { PlayPage } from "./pages/PlayPage.js";
import { DuelPage } from "./pages/DuelPage.js";
import { TeacherPage } from "./pages/TeacherPage.js";
import { BadgesPage } from "./pages/BadgesPage.js";
import { ProfilePage } from "./pages/ProfilePage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { ClassesPage } from "./pages/ClassesPage.js";
import { TournamentPage } from "./pages/TournamentPage.js";
import { ReportsPage } from "./pages/ReportsPage.js";
import { DailyPracticePage } from "./pages/DailyPracticePage.js";
import { GameArchivePage } from "./pages/GameArchivePage.js";
import { classroom } from "./services/ClassroomService.js";
import { startCloudSync } from "./services/CloudSyncService.js";

const progress = new ProgressService();
const sound = new SoundService(progress);
const root = document.querySelector("#app");
const ROLE_KEY = "satranc-okulu-role";
const STUDENT_KEY = "satranc-okulu-active-student";
const TEACHER_ROUTES = ["siniflar", "turnuva", "reports"];

function readRole() {
  try {
    return localStorage.getItem(ROLE_KEY) === "student" ? "student" : "teacher";
  } catch {
    return "teacher";
  }
}

let role = readRole();

function readStudentId() {
  try { return localStorage.getItem(STUDENT_KEY) || ""; } catch { return ""; }
}

function selectedStudent() {
  const id = readStudentId();
  return classroom.students(classroom.state.activeClassId).find((student) => student.id === id) || null;
}

function useRoleProfile() {
  if (role === "teacher") {
    const active = classroom.activeClass;
    progress.switchProfile(active ? `class:${active.id}` : "teacher", active ? `${active.name} Sınıfı` : "Öğretmen");
    return;
  }
  const student = selectedStudent();
  progress.switchProfile(student ? `student:${student.id}` : "guest", student?.name || "Misafir Öğrenci");
}

function setRole(next) {
  role = next === "student" ? "student" : "teacher";
  try { localStorage.setItem(ROLE_KEY, role); } catch { /* Kısıtlı tarayıcıda oturumluk çalışır. */ }
  useRoleProfile();
  if (role === "student" && TEACHER_ROUTES.includes(currentRoute())) {
    navigate("home");
    return;
  }
  render();
}

// URL üzerinden sınıf parametresi geldiyse (?classId=...) o sınıfı otomatik aktif yap
try {
  const urlParams = new URLSearchParams(window.location.search);
  const targetClassId = urlParams.get("classId");
  if (targetClassId && classroom.getClass(targetClassId)) {
    classroom.setActiveClass(targetClassId);
  }
} catch {
  // yoksay
}

// Eski tek profilli kayıt öğretmen profiline taşınır; uygulama öğrenci
// modunda kapatıldıysa son seçilen öğrencinin profili yeniden açılır.
useRoleProfile();

const pages = {
  home: HomePage,
  plan: PlanPage,
  siniflar: ClassesPage,
  turnuva: TournamentPage,
  reports: ReportsPage,
  daily: DailyPracticePage,
  games: GameArchivePage,
  learn: LearnPage,
  board: BoardPage,
  pieces: PiecesPage,
  rules: RulesPage,
  tactics: TacticsPage,
  openings: OpeningsPage,
  endgames: EndgamesPage,
  puzzles: PuzzlesPage,
  minigames: MiniGamesPage,
  play: PlayPage,
  duello: DuelPage,
  teacher: TeacherPage,
  badges: BadgesPage,
  profile: ProfilePage,
  settings: SettingsPage
};

function renderNav(route) {
  return el("nav", { className: "side-nav", "aria-label": "Ana menü" }, [
    el("button", { className: "brand", type: "button", onClick: () => navigate("home"), html: `${icon("crown")}<span>Satranç Eğitimi</span>` }),
    ...navGroups
      .filter((group) => group.roles.includes(role))
      .flatMap((group) => [
        group.title ? el("p", { className: "nav-section-title", text: group.title }) : null,
        ...group.items.map(([id, label, iconName]) =>
          el("button", {
            className: `nav-link ${route === id ? "active" : ""}`,
            type: "button",
            onClick: () => {
              sound.play("click");
              navigate(id);
            },
            html: `${icon(iconName)}<span>${label}</span>`
          })
        )
      ]),
    // Menünün en altındaki imza — her ekranda görünür ama içeriği gölgelemez.
    el("footer", { className: "nav-credit" }, [
      el("span", { className: "credit-line", text: "Hazırlayan" }),
      el("strong", { className: "credit-name", text: "Ahmet DUYAR" })
    ])
  ]);
}

/*
 * Üst çubuktaki sayaçlar.
 *
 * Ders bitince XP ve yıldız YERİNDE güncellenir (bkz. syncTopbar). Bu yüzden
 * düğümlere referans tutarız; her sayfa geçişinde yenileri üretilir.
 */
let xpStat = null;
let starStat = null;
let classPicker = null;
let studentPicker = null;

function renderTopbar() {
  const collapsed = Boolean(progress.state.settings.navCollapsed);
  xpStat = el("div", { className: "top-stat", text: `XP ${progress.state.xp}` });
  starStat = el("div", { className: "top-stat", text: `★ ${progress.state.stars}` });
  return el("header", { className: "topbar" }, [
    // Menüyü aç/kapa — tercih kaydedilir, sayfalar arası korunur.
    el("button", {
      className: "icon-button nav-toggle",
      type: "button",
      title: collapsed ? "Menüyü aç" : "Menüyü kapat",
      "aria-label": collapsed ? "Menüyü aç" : "Menüyü kapat",
      "aria-expanded": String(!collapsed),
      onClick: () => {
        progress.toggleSetting("navCollapsed");
        sound.play("click");
        render();
      },
      html: icon(collapsed ? "menuOpen" : "menuClose")
    }),
    el("div", { className: "role-switch", "aria-label": "Kullanım modu" }, [
      el("button", {
        className: role === "student" ? "active" : "",
        type: "button",
        text: "Öğrenci",
        "aria-pressed": String(role === "student"),
        onClick: () => setRole("student")
      }),
      el("button", {
        className: role === "teacher" ? "active" : "",
        type: "button",
        text: "Öğretmen",
        "aria-pressed": String(role === "teacher"),
        onClick: () => setRole("teacher")
      })
    ]),
    role === "teacher" ? renderClassPicker() : renderStudentPicker(),
    xpStat,
    starStat,
    el("button", { className: "icon-button", type: "button", title: "Ayarlar", onClick: () => navigate("settings"), html: icon("settings") })
  ]);
}

/** Öğrenci modunda seçili sınıftan kimin ilerlemesinin açılacağını belirler. */
function renderStudentPicker() {
  studentPicker = el("select", {
    className: "class-picker-select student-picker-select",
    "aria-label": "Öğrenci profili",
    onChange: (event) => {
      if (event.target.value === "__manage") {
        setRole("teacher");
        navigate("siniflar");
        return;
      }
      try { localStorage.setItem(STUDENT_KEY, event.target.value); } catch { /* Oturumluk seçim. */ }
      const student = classroom.findStudent(event.target.value);
      progress.switchProfile(student ? `student:${student.id}` : "guest", student?.name || "Misafir Öğrenci");
      sound.play("click");
      render();
    }
  });
  syncStudentPicker();
  return el("label", { className: "class-picker student-picker", title: "Öğrenci profili" }, [
    el("span", { className: "class-picker-emoji", text: "🙂" }),
    studentPicker
  ]);
}

function syncStudentPicker() {
  if (!studentPicker) return;
  const students = classroom.students(classroom.state.activeClassId);
  const selected = selectedStudent();
  studentPicker.replaceChildren(
    el("option", { value: "", text: students.length ? "Öğrenci seç" : "Misafir Öğrenci" }),
    ...students.map((student) => el("option", { value: student.id, text: student.name })),
    el("option", { value: "__manage", text: "＋ Öğrencileri yönet…" })
  );
  studentPicker.value = selected?.id || "";
}

/**
 * Üst çubuktaki aktif sınıf seçicisi.
 *
 * Seçim uygulama genelindedir: İki Kişilik Oyun ve Turnuva öğrencileri bu
 * sınıftan alır. Sınıf listesi değişince seçenekler yerinde yenilenir (bkz.
 * syncClassPicker); değiştirilince ise o sınıfla çalışan ekran tazelenmelidir,
 * bu yüzden sayfa yeniden çizilir.
 */
function renderClassPicker() {
  classPicker = el("select", {
    className: "class-picker-select",
    "aria-label": "Aktif sınıf",
    onChange: (event) => {
      if (event.target.value === "__new") {
        navigate("siniflar");
        syncClassPicker();
        return;
      }
      sound.play("click");
      classroom.setActiveClass(event.target.value);
      render();
    }
  });
  syncClassPicker();
  return el("label", { className: "class-picker", title: "Aktif sınıf" }, [
    el("span", { className: "class-picker-emoji", text: "🏫" }),
    classPicker
  ]);
}

function syncClassPicker() {
  if (!classPicker) return;
  const active = classroom.state.activeClassId || "";
  classPicker.replaceChildren(
    el("option", { value: "", text: classroom.classes.length ? "Sınıf seç" : "Sınıf yok" }),
    ...classroom.classes.map((item) => el("option", { value: item.id, text: item.name })),
    el("option", { value: "__new", text: "＋ Sınıfları yönet…" })
  );
  classPicker.value = active;
}

function render() {
  const route = pages[currentRoute()] ? currentRoute() : "home";
  if (role === "student" && TEACHER_ROUTES.includes(route)) {
    navigate("home");
    return;
  }
  document.body.classList.toggle("high-contrast", progress.state.settings.contrast);
  document.body.classList.toggle("reduced-motion", !progress.state.settings.motion);
  // Menü kapalıyken kabuk dar sütuna geçer; sayfa içeriği genişler.
  root.classList.toggle("nav-collapsed", Boolean(progress.state.settings.navCollapsed));
  // Odak modu yalnızca oyun ekranlarında anlamlıdır; başka sayfaya geçildiğinde kalkar.
  if (route !== "play" && route !== "duello") document.body.classList.remove("focus-mode");
  clear(root);
  const content = el("div", { className: "content-shell" }, [
    renderTopbar(),
    pages[route]({ progress, sound, rerender: render, role })
  ]);
  root.append(renderNav(route), content);
  reveal(content);
}

/**
 * Sayaçları yerinde günceller ve ARTTIKLARINDA kısa bir vurgu verir.
 *
 * Sayfayı yeniden çizmeyiz: çocuk dersin ortasındayken ekran sıfırlanır,
 * az önce cevapladığı soru kaybolurdu. Yalnızca iki yazı değişir.
 *
 * Vurgu bilinçlidir: ilkokul çağındaki bir çocuk için ödülün GÖRÜLMESİ,
 * kaydedilmesi kadar önemlidir. (Animasyonlar kapalıyken `.reduced-motion`
 * kuralı bu vurguyu da durdurur.)
 */
function syncTopbar() {
  bump(xpStat, `XP ${progress.state.xp}`);
  bump(starStat, `★ ${progress.state.stars}`);
}

function bump(node, text) {
  if (!node || node.textContent === text) return;
  node.textContent = text;

  /*
   * Animasyonu baştan başlatmak için sınıfı çıkarıp geri takarız; arada
   * tarayıcıyı yeniden yerleşime ZORLARIZ (offsetWidth okuması). Aksi halde
   * iki sınıf değişikliği aynı karede birleşir ve animasyon hiç tetiklenmez —
   * arka arkaya kazanılan XP'de vurgu kaybolurdu.
   *
   * Burada `requestAnimationFrame` KULLANILMAZ: sekme arka plandayken ya da
   * pencere gizliyken tarayıcı onu duraklatır, sınıf hiç eklenmez ve vurgu
   * sessizce kaybolur. Reflow her durumda çalışır.
   */
  node.classList.remove("stat-bump");
  void node.offsetWidth;
  node.classList.add("stat-bump");
}

// Abonelik BİR KEZ kurulur; render() her sayfa geçişinde yeni düğümler üretse de
// syncTopbar güncel referansları kullanır.
progress.onChange(syncTopbar);
classroom.onChange(() => {
  if (role === "teacher") useRoleProfile();
  syncClassPicker();
  syncStudentPicker();
});

onRouteChange(render);
render();

// Hosted sürümde doğrulanmış öğretmen oturumu varsa yerel kayıtları bulutla
// eşitle. Başarısızlık uygulamayı durdurmaz; sınıf içindeki çevrimdışı akış
// her zaman kullanılabilir kalır.
void startCloudSync({ classroom, progress });

// Çevrimdışı önbellek yalnızca http/https üzerinden anlamlıdır.
// Tek dosya sürümü file:// ile açıldığında service worker zaten kaydedilemez;
// denemek konsola gereksiz hata yazdırırdı.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}
