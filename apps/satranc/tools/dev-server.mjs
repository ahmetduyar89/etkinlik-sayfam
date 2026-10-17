/**
 * dev-server.mjs — Geliştirme için küçük statik sunucu.
 *
 * ES modülleri file:// üzerinden yüklenemediği için tarayıcıda denerken
 * gerekir. Sınıfta kullanılan sürüm SatrancOkulu.html'dir; bu araç yalnızca
 * geliştirme içindir.
 *
 * Çalıştırma: node tools/dev-server.mjs [port]
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.argv[2]) || 8777;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml"
};

createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = join(ROOT, normalize(path === "/" ? "/index.html" : path));

  // Kök klasörün dışına çıkan istekleri reddederiz.
  if (!file.startsWith(ROOT)) {
    response.writeHead(403).end("403");
    return;
  }

  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404).end("404");
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
