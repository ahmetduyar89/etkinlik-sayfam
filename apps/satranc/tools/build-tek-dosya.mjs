/**
 * build-tek-dosya.mjs — Tüm uygulamayı TEK bir HTML dosyasına paketler.
 *
 * Çalıştırma: node tools/build-tek-dosya.mjs
 * Çıktı:      SatrancOkulu.html  (proje kök klasöründe)
 *
 * NEDEN GEREKLİ?
 * Uygulama 53 ayrı ES modülünden oluşur. Tarayıcılar (Chrome, Firefox, Edge)
 * güvenlik gereği `file://` üzerinden ES modül yüklemeyi ENGELLER. Bu yüzden
 * `index.html` dosyasına çift tıklamak boş ekran verir; sunucu gerekir.
 *
 * Bu araç tüm modülleri, CSS'leri ve simgeleri tek bir klasik <script> içine
 * gömer. Sonuçta oluşan dosya sunucusuz, internetsiz, kurulumsuz çalışır:
 * USB'ye kopyalanıp herhangi bir bilgisayarda çift tıklanabilir.
 *
 * NASIL ÇALIŞIR?
 * Her modül bir fabrika fonksiyonuna sarılır ve yol adına göre kaydedilir.
 * Küçük bir yükleyici (`__yukle`) modülleri ilk istendiğinde çalıştırır ve
 * sonucu önbelleğe alır — tarayıcının ES modül davranışının aynısı.
 * `export` bağları getter olarak tanımlanır; böylece canlı bağlar korunur.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY = "src/app.js";
const OUTPUT = join(ROOT, "SatrancOkulu.html");

/* ------------------------------------------------------------------ *
 * Modül grafiğini topla
 * ------------------------------------------------------------------ */

/** Proje köküne göre normalize edilmiş yol ("src/engine/Chess.js"). */
const norm = (absolute) => relative(ROOT, absolute).split("\\").join("/");

const modules = new Map(); // yol -> { source, imports: [{ names, from }] }
const order = []; // topolojik sıra

/** `import { a, b } from "./x.js";` satırlarını bulur. */
const IMPORT_RE = /^import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["'];?\s*$/gm;

/** Bir modülü ve bağımlılıklarını okur. */
function collect(absolutePath, stack = []) {
  const key = norm(absolutePath);
  if (modules.has(key)) return key;

  if (stack.includes(key)) {
    throw new Error(`Döngüsel bağımlılık: ${[...stack, key].join(" → ")}`);
  }

  let source;
  try {
    source = readFileSync(absolutePath, "utf8");
  } catch {
    throw new Error(`Modül bulunamadı: ${key}`);
  }

  const imports = [];
  for (const match of source.matchAll(IMPORT_RE)) {
    const names = match[1].split(",").map((n) => n.trim()).filter(Boolean);
    const target = resolve(dirname(absolutePath), match[2]);
    imports.push({ names, from: norm(target) });
    collect(target, [...stack, key]);
  }

  modules.set(key, { source, imports });
  order.push(key); // bağımlılıklar önce eklendiği için sıra doğrudur
  return key;
}

collect(join(ROOT, ENTRY));

/* ------------------------------------------------------------------ *
 * Modül gövdesini dönüştür
 * ------------------------------------------------------------------ */

/**
 * ES modül sözdizimini, yükleyicinin anlayacağı biçime çevirir.
 * Yalnızca projede GERÇEKTEN kullanılan biçimler desteklenir; beklenmedik bir
 * biçim görülürse hata verir (sessizce bozuk çıktı üretmemek için).
 */
function transform(key, entry) {
  let body = entry.source;
  const exported = new Set();

  // 1. import satırlarını yükleyici çağrısına çevir
  body = body.replace(IMPORT_RE, (whole, nameList, spec) => {
    const target = norm(resolve(dirname(join(ROOT, key)), spec));
    const names = nameList.split(",").map((n) => n.trim()).filter(Boolean).join(", ");
    return `const { ${names} } = __yukle(${JSON.stringify(target)});`;
  });

  // 2. `export { A, B };` — sadece kayıt, bildirim değil
  body = body.replace(/^export\s*\{([^}]*)\};?\s*$/gm, (whole, list) => {
    for (const name of list.split(",").map((n) => n.trim()).filter(Boolean)) exported.add(name);
    return "";
  });

  // 3. `export function/const/class/async function` — anahtar kelimeyi kaldır, adı kaydet
  body = body.replace(
    /^export\s+(async\s+function|function|const|let|var|class)\s+([A-Za-z0-9_$]+)/gm,
    (whole, kind, name) => {
      exported.add(name);
      return `${kind} ${name}`;
    }
  );

  // 4. Kalan bir "export" varsa desteklenmeyen bir biçim demektir — sessiz kalma.
  const leftover = body.match(/^export\s+.*/m);
  if (leftover) {
    throw new Error(`${key}: desteklenmeyen export biçimi → ${leftover[0].slice(0, 60)}`);
  }

  // 5. Dışa aktarılanları canlı bağ (getter) olarak tanımla
  const bindings = [...exported]
    .map((name) => `  Object.defineProperty(__d, ${JSON.stringify(name)}, { get: () => ${name}, enumerable: true });`)
    .join("\n");

  return `${JSON.stringify(key)}: function (__d) {\n${body}\n${bindings}\n}`;
}

const factories = order.map((key) => transform(key, modules.get(key))).join(",\n\n");

/* ------------------------------------------------------------------ *
 * CSS ve HTML'i topla
 * ------------------------------------------------------------------ */

const indexHtml = readFileSync(join(ROOT, "index.html"), "utf8");

// index.html'deki <link rel="stylesheet"> sırasını koruyarak CSS'leri gömeriz.
const cssFiles = [...indexHtml.matchAll(/<link rel="stylesheet" href="\.\/([^"]+)"/g)].map((m) => m[1]);
const css = cssFiles
  .map((file) => `/* ===== ${file} ===== */\n${readFileSync(join(ROOT, file), "utf8")}`)
  .join("\n\n");

// Uygulama simgesi de gömülür ki sekme ikonu çevrimdışı görünsün.
const iconSvg = readFileSync(join(ROOT, "src/assets/icons/app-icon.svg"), "utf8");
const iconData = `data:image/svg+xml;base64,${Buffer.from(iconSvg, "utf8").toString("base64")}`;

const title = (indexHtml.match(/<title>([^<]*)<\/title>/) || [, "Satranç Eğitimi"])[1];

/* ------------------------------------------------------------------ *
 * Tek dosyayı yaz
 * ------------------------------------------------------------------ */

const output = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#2f8f83">
<title>${title}</title>
<link rel="icon" href="${iconData}" type="image/svg+xml">
<!--
  SATRANÇ EĞİTİMİ — TEK DOSYA SÜRÜMÜ
  Hazırlayan: Ahmet DUYAR

  Bu dosya kendi kendine yeter: internet, sunucu ve kurulum gerektirmez.
  USB belleğe kopyalayıp herhangi bir bilgisayarda ÇİFT TIKLAYARAK açabilirsin.

  Otomatik üretilmiştir (tools/build-tek-dosya.mjs). Elle düzenlemeyin;
  değişiklikleri src/ altında yapıp aracı yeniden çalıştırın.
  Üretim tarihi: ${new Date().toISOString().slice(0, 10)}
-->
<style>
${css}
</style>
</head>
<body>
<div id="app" class="app-shell" aria-live="polite"></div>
<script>
(function () {
  "use strict";

  // Her modül, ilk istendiğinde çalıştırılıp önbelleğe alınır.
  var __fabrikalar = {
${factories}
  };

  var __onbellek = {};

  function __yukle(yol) {
    if (__onbellek[yol]) return __onbellek[yol];
    var fabrika = __fabrikalar[yol];
    if (!fabrika) throw new Error("Modül bulunamadı: " + yol);
    var disa = {};
    __onbellek[yol] = disa;   // döngüsel bağımlılıklarda sonsuz döngüyü önler
    fabrika(disa);
    return disa;
  }

  // Giriş noktasını çalıştır.
  __yukle(${JSON.stringify(ENTRY)});
})();
</script>
</body>
</html>
`;

writeFileSync(OUTPUT, output, "utf8");

const sizeKb = Math.round(Buffer.byteLength(output, "utf8") / 1024);
console.log(`✅ Tek dosya oluşturuldu: SatrancOkulu.html`);
console.log(`   ${order.length} JS modülü + ${cssFiles.length} CSS dosyası gömüldü`);
console.log(`   Boyut: ${sizeKb} KB`);
console.log(`   Sunucu, internet ve kurulum GEREKTİRMEZ — çift tıklayarak açılır.`);
