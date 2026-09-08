// scripts/copy-apps.mjs — `apps/` altındaki statik projeleri yayına kopyalar.
//
// `npm run build` sırasında çalışır. `apps/<isim>/` klasörlerinin her biri
// olduğu gibi `dist/<isim>/` içine kopyalanır; böylece satranç ve deneyler
// gibi HTML tabanlı çalışmalar atölye ile aynı adreste yayınlanır:
//   apps/satranc/index.html  →  https://atölye.tedrisedu.com/satranc/
//
// Yeni bir statik proje eklemek için klasörü `apps/` altına koymak yeterli;
// bu dosyayı değiştirmeye gerek yoktur.
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = path.join(root, 'apps');
const distDir = path.join(root, 'dist');

if (!existsSync(appsDir)) {
    console.log('[copy-apps] apps/ klasörü yok, atlanıyor.');
    process.exit(0);
}

await mkdir(distDir, { recursive: true });

const entries = await readdir(appsDir, { withFileTypes: true });
const folders = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.'));

if (folders.length === 0) {
    console.log('[copy-apps] apps/ boş, kopyalanacak bir şey yok.');
}

for (const folder of folders) {
    const from = path.join(appsDir, folder.name);
    const to = path.join(distDir, folder.name);

    // Yayına yalnızca sitenin ihtiyaç duyduğu dosyalar gider: sürüm geçmişi,
    // editör ayarları ve işletim sistemi artıkları dışarıda kalır.
    const SKIP = new Set(['.git', '.github', '.claude', '.vscode', '.idea', 'node_modules', '.DS_Store']);
    await cp(from, to, {
        recursive: true,
        filter: (src) => !SKIP.has(path.basename(src)),
    });

    const hasIndex = existsSync(path.join(from, 'index.html'));
    const warn = hasIndex ? '' : '  ⚠ index.html yok — /' + folder.name + '/ açılmayacak';
    console.log(`[copy-apps] apps/${folder.name} → dist/${folder.name}${warn}`);
}

// Service worker'a hangi yolların bağımsız proje olduğunu bildir; böylece bu
// sayfalar önbelleğe alınmaz ve atölye kabuğuyla karışmaz.
const swPath = path.join(distDir, 'sw.js');
if (existsSync(swPath)) {
    const list = folders.map((f) => JSON.stringify(f.name)).join(', ');
    const sw = await readFile(swPath, 'utf8');
    await writeFile(swPath, sw.replace('/*__APP_PATHS__*/', list));
    console.log(`[copy-apps] sw.js güncellendi (bağımsız yollar: ${list || 'yok'})`);
}
