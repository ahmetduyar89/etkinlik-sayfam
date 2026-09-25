/**
 * verify-board.mjs — Tahta çizimi ile kural motorunun UYUMUNU denetler.
 *
 * Çalıştırma: node tools/verify-board.mjs
 *
 * Neden gerekli: ChessBoard bileşeni bir zamanlar kare rengini kendi formülüyle
 * hesaplıyordu ve bu formül TERSTİ (a1 açık, h1 koyu çiziliyordu). Sonuç, sessiz
 * ama ciddi bir eğitim hatasıydı: "Kare Renkleri" oyunu ile "sağ alt köşe açık
 * olmalı" kuralı motora göre doğru, ekrana göre yanlış görünüyordu.
 *
 * Bu araç iki şeyi bağımsız olarak sınar:
 *  1. Motorun kare rengi hesabı satranç kurallarına uyuyor mu? (a1 koyu, h1 açık)
 *  2. ChessBoard.js kendi renk formülünü YENİDEN tanımlıyor mu? (tanımlamamalı)
 */

import { readFileSync } from "node:fs";
import { toSquare, isLightSquare, SQUARE_LIST, toAlgebraic } from "../src/engine/Chess.js";

const problems = [];
const fail = (reason) => problems.push(reason);

/* ------------------------------------------------------------------ *
 * 1. Motorun kare rengi doğru mu?
 * ------------------------------------------------------------------ */

// Satrancın değişmez gerçekleri: sağ alt köşe (h1) DAİMA açık renktir.
const KNOWN = {
  a1: false, h1: true, a8: true, h8: false,
  e1: false, d1: true, e4: true, d4: false,
  c3: false, f6: false, b2: false, g7: false
};

for (const [square, shouldBeLight] of Object.entries(KNOWN)) {
  const actual = isLightSquare(toSquare(square));
  if (actual !== shouldBeLight) {
    fail(`motor: ${square} ${shouldBeLight ? "AÇIK" : "KOYU"} olmalı ama ${actual ? "AÇIK" : "KOYU"} diyor`);
  }
}

// Yan yana kareler daima farklı renkte olmalı, ve toplam 32/32 olmalı.
let light = 0;
for (const index of SQUARE_LIST) {
  if (isLightSquare(index)) light += 1;
}
if (light !== 32) fail(`açık kare sayısı 32 olmalı, ${light} bulundu`);

// Aynı satırda komşu kareler zıt renkte mi?
for (const index of SQUARE_LIST) {
  const name = toAlgebraic(index);
  const file = name[0];
  const rank = name[1];
  if (file === "h") continue;
  const neighbour = String.fromCharCode(file.charCodeAt(0) + 1) + rank;
  if (isLightSquare(index) === isLightSquare(toSquare(neighbour))) {
    fail(`${name} ile ${neighbour} aynı renkte — komşu kareler zıt olmalı`);
  }
}

/* ------------------------------------------------------------------ *
 * 2. ChessBoard kendi formülünü tanımlıyor mu?
 * ------------------------------------------------------------------ */

const source = readFileSync(new URL("../src/components/ChessBoard.js", import.meta.url), "utf8");

// Bileşen rengi motordan almalı.
if (!source.includes("isLightSquare")) {
  fail("ChessBoard.js kare rengini motordan (isLightSquare) almıyor");
}

// Eski hatanın imzası: elle yazılmış "(fileIndex + rank) % 2" formülü.
if (/\(\s*fileIndex\s*\+\s*rank\s*\)\s*%\s*2/.test(source)) {
  fail("ChessBoard.js kare rengi formülünü yeniden tanımlıyor — motorla ayrışabilir");
}

/* ------------------------------------------------------------------ *
 * Sonuç
 * ------------------------------------------------------------------ */

if (problems.length === 0) {
  console.log("✅ TAHTA RENK DENETİMİ GEÇTİ — a1 koyu, h1 açık, 32/32 kare, tek kaynak.");
} else {
  console.log(`❌ ${problems.length} SORUN:\n`);
  for (const line of problems) console.log("  " + line);
  process.exitCode = 1;
}
