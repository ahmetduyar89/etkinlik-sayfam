/**
 * verify-plan.mjs — 36 haftalık ders programının denetimi.
 *
 * Çalıştırma: node tools/verify-plan.mjs
 *
 * Program 36 hafta × birkaç etkinlik bağlantısı içerir. Her bağlantı bir rotaya
 * ve çoğu zaman bir ders kimliğine ("tas=knight", "ders=catal") işaret eder.
 * Tek bir yazım hatası, öğretmenin ders sırasında boş ekranla karşılaşması
 * demektir. Bu araç TÜM bağlantıları gerçek içerikle karşılaştırır:
 *
 *  - Hafta numaraları 1..36 arası, eksiksiz ve tekrarsız mı?
 *  - Her hafta bir üniteye ait mi? Üniteler tüm haftaları kapsıyor mu?
 *  - Her etkinliğin rotası uygulamada var mı?
 *  - Ders kimlikleri (tas, ders, oyun, bolum, seviye) gerçekten mevcut mu?
 *  - Öğretmen alanları (kazanım, ısınma, anlatım, uygulama, kapanış) dolu mu?
 */

import { readFileSync } from "node:fs";

import { weeklyPlan, units, totalWeeks, unitOf } from "../src/data/weeklyPlan.js";
import { introSections } from "../src/data/introLessons.js";
import { pieceLessons } from "../src/data/pieceLessons.js";
import { ruleLessons } from "../src/data/ruleLessons.js";
import { tacticLessons } from "../src/data/tacticLessons.js";
import { openingLines } from "../src/data/openingLines.js";
import { endgameLessons } from "../src/data/endgameLessons.js";
import { THEME_LIST, puzzles } from "../src/data/puzzles.js";

const problems = [];
const fail = (where, reason) => problems.push(`${where}: ${reason}`);

/* ------------------------------------------------------------------ *
 * Geçerli kimlik kümeleri
 * ------------------------------------------------------------------ */

// app.js'teki rota tablosunu okuyup gerçek rota listesini çıkarırız;
// böylece elle yazılmış bir liste ile ayrışma riski kalmaz.
const appSource = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const routeBlock = appSource.match(/const pages = \{([\s\S]*?)\};/);
const validRoutes = new Set(
  routeBlock ? [...routeBlock[1].matchAll(/^\s*(\w+)\s*:/gm)].map((m) => m[1]) : []
);
if (validRoutes.size === 0) fail("app.js", "rota tablosu okunamadı");

// Mini oyun kimlikleri de kaynaklardan okunur.
const gameIds = new Set();
for (const file of [
  "MoveTarget", "SquareFinder", "PieceQuiz", "MateDash", "GuessMove", "MemoryFlash", "MatchMoves"
]) {
  const source = readFileSync(new URL(`../src/games/${file}.js`, import.meta.url), "utf8");
  const match = source.match(/id:\s*"([^"]+)"/);
  if (match) gameIds.add(match[1]);
}

const validIds = {
  bolum: new Set(introSections.map((s) => s.id)),
  tas: new Set(pieceLessons.map((p) => p.id)),
  oyun: gameIds,
  seviye: new Set(["Kolay", "Orta", "Zor"]),
  // Bulmaca temaları üretecin çıkardığı listeden gelir; elle yazılmaz.
  tema: new Set(["hepsi", ...THEME_LIST])
};

/*
 * Tema × seviye dolu mu?
 *
 * Her tema her seviyede BULUNMAZ — örneğin açmazın "Kolay"ı, boğmacanın ise
 * hem "Kolay"ı yoktur. Böyle bir bağlantı çökmez (sayfa başka seviyeye düşer)
 * ama öğretmen "Kolay" seçili sanırken çocuğa "Orta" bulmaca gelir. Sessiz bir
 * yanlışlık olduğu için burada yakalarız.
 */
const themeLevelCounts = new Map();
for (const puzzle of puzzles) {
  const key = `${puzzle.theme}|${puzzle.level}`;
  themeLevelCounts.set(key, (themeLevelCounts.get(key) || 0) + 1);
}

// "ders" parametresi rotaya göre farklı kümeye bakar.
const lessonIdsByRoute = {
  rules: new Set(ruleLessons.map((r) => r.id)),
  tactics: new Set(tacticLessons.map((t) => t.id)),
  openings: new Set(openingLines.map((o) => o.id)),
  endgames: new Set(endgameLessons.map((e) => e.id)),
  // Tahta dersleri numaralıdır (0-4).
  board: new Set(["0", "1", "2", "3", "4"])
};

/* ------------------------------------------------------------------ *
 * 1. Hafta bütünlüğü
 * ------------------------------------------------------------------ */

if (totalWeeks !== 36) fail("plan", `36 hafta beklenirken ${totalWeeks} hafta var`);

const seenWeeks = new Set();
for (const entry of weeklyPlan) {
  if (seenWeeks.has(entry.week)) fail("plan", `hafta ${entry.week} birden fazla kez tanımlı`);
  seenWeeks.add(entry.week);
}
for (let week = 1; week <= 36; week += 1) {
  if (!seenWeeks.has(week)) fail("plan", `hafta ${week} eksik`);
}

// Üniteler tüm haftaları kapsamalı ve çakışmamalı.
const covered = new Set();
for (const unit of units) {
  const [start, end] = unit.weeks;
  if (start > end) fail(`ünite/${unit.id}`, `hafta aralığı ters: ${start}-${end}`);
  for (let week = start; week <= end; week += 1) {
    if (covered.has(week)) fail(`ünite/${unit.id}`, `hafta ${week} birden fazla ünitede`);
    covered.add(week);
  }
}
for (let week = 1; week <= 36; week += 1) {
  if (!covered.has(week)) fail("üniteler", `hafta ${week} hiçbir üniteye ait değil`);
}

/* ------------------------------------------------------------------ *
 * 2. Her haftanın içeriği
 * ------------------------------------------------------------------ */

for (const entry of weeklyPlan) {
  const where = `hafta ${entry.week}`;

  // Öğretmen alanları dolu mu?
  for (const field of ["title", "emoji", "objective", "warmUp", "practice", "closing"]) {
    if (!entry[field] || String(entry[field]).trim() === "") fail(where, `"${field}" alanı boş`);
  }
  if (!Array.isArray(entry.teach) || entry.teach.length < 3) {
    fail(where, "anlatım (teach) en az 3 madde olmalı");
  }
  if (!Array.isArray(entry.words) || entry.words.length === 0) {
    fail(where, "anahtar kelime yok");
  }
  if (!Array.isArray(entry.activities) || entry.activities.length === 0) {
    fail(where, "etkinlik bağlantısı yok");
    continue;
  }

  // Ünite eşleşmesi
  const unit = unitOf(entry.week);
  if (!unit) fail(where, "üniteye eşleşmiyor");

  // --- Etkinlik bağlantıları ---
  for (const [index, activity] of entry.activities.entries()) {
    const spot = `${where} etkinlik[${index}] "${activity.label}"`;

    if (!activity.label) fail(spot, "etiket yok");
    if (!activity.route) {
      fail(spot, "rota yok");
      continue;
    }
    if (!validRoutes.has(activity.route)) {
      fail(spot, `"${activity.route}" diye bir rota yok. Geçerli: ${[...validRoutes].join(" ")}`);
      continue;
    }

    const params = activity.params || {};
    for (const [key, value] of Object.entries(params)) {
      // "asama" serbest bir sayıdır, aşama listesi sayfada üretilir.
      if (key === "asama") {
        if (!/^\d+$/.test(String(value))) fail(spot, `asama sayı olmalı, "${value}" verilmiş`);
        continue;
      }

      if (key === "ders") {
        const pool = lessonIdsByRoute[activity.route];
        if (!pool) {
          fail(spot, `"${activity.route}" rotası "ders" parametresi almıyor`);
        } else if (!pool.has(String(value))) {
          fail(spot, `"${value}" diye bir ders yok (${activity.route}). Geçerli: ${[...pool].join(" ")}`);
        }
        continue;
      }

      const pool = validIds[key];
      if (!pool) {
        fail(spot, `bilinmeyen parametre "${key}"`);
      } else if (!pool.has(String(value))) {
        fail(spot, `"${key}=${value}" geçersiz. Geçerli: ${[...pool].join(" ")}`);
      }
    }

    // Tema ve seviye birlikte verildiyse o eşleşmede gerçekten bulmaca olmalı.
    if (activity.route === "puzzles" && params.tema && params.tema !== "hepsi" && params.seviye) {
      const count = themeLevelCounts.get(`${params.tema}|${params.seviye}`) || 0;
      if (count === 0) {
        fail(spot, `"${params.tema}" temasının "${params.seviye}" seviyesinde hiç bulmaca yok`);
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * Sonuç
 * ------------------------------------------------------------------ */

const activityCount = weeklyPlan.reduce((sum, entry) => sum + entry.activities.length, 0);

console.log(`Program: ${totalWeeks} hafta, ${units.length} ünite, ${activityCount} etkinlik bağlantısı`);
for (const unit of units) {
  console.log(`  ${unit.emoji} ${unit.title.padEnd(24)} hafta ${unit.weeks[0]}-${unit.weeks[1]}`);
}
console.log("");

if (problems.length === 0) {
  console.log("✅ DERS PROGRAMI DOĞRULANDI — tüm bağlantılar gerçek içeriğe gidiyor.");
} else {
  console.log(`❌ ${problems.length} SORUN:\n`);
  for (const line of problems.slice(0, 40)) console.log("  " + line);
  if (problems.length > 40) console.log(`  ... ve ${problems.length - 40} tane daha`);
  process.exitCode = 1;
}
