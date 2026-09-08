// scripts/fetch-apps.mjs — Bağımsız projeleri kendi depolarından çeker.
//
// `apps/apps.json` içinde listelenen her depo, `apps/<dir>/` klasörüne
// klonlanır. Böylece satranç ve deneyler kendi GitHub depolarında yaşamaya
// devam eder; atölye yayınlanırken en güncel hâlleri alınır.
//
// `npm run dev` ve `npm run build` öncesinde otomatik çalışır.
//
// Yeni bir depo eklemek için `apps/apps.json` dosyasına bir satır yazmak
// yeterlidir; bu dosyaya dokunmaya gerek yoktur.
//
// Ağ yoksa ya da bir depo çekilemezse yayın durmaz: o bölüm elde ne varsa
// onunla (ya da yer tutucu sayfayla) yayınlanır, uyarı yazılır.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = path.join(root, 'apps');
const configPath = path.join(appsDir, 'apps.json');

if (!existsSync(configPath)) {
    console.log('[fetch-apps] apps/apps.json yok, atlanıyor.');
    process.exit(0);
}

/** @type {{dir: string, repo: string, branch?: string}[]} */
const config = JSON.parse(await readFile(configPath, 'utf8'));

async function git(args, cwd = root) {
    return run('git', args, { cwd, maxBuffer: 32 * 1024 * 1024 });
}

/** Depoyu klonlar; klasör zaten varsa uzak dalın son hâline eşitler. */
async function sync({ dir, repo, branch = 'main' }) {
    const target = path.join(appsDir, dir);
    const isClone = existsSync(path.join(target, '.git'));

    if (isClone) {
        await git(['fetch', '--depth', '1', 'origin', branch], target);
        await git(['reset', '--hard', `origin/${branch}`], target);
        await git(['clean', '-fd'], target);
        return 'güncellendi';
    }

    // Klon değilse (yer tutucu dosyalar) temizleyip baştan klonla.
    if (existsSync(target)) await rm(target, { recursive: true, force: true });
    await git(['clone', '--depth', '1', '--branch', branch, repo, target]);
    return 'klonlandı';
}

const managed = [];

for (const app of config) {
    if (!app?.dir || !app?.repo) {
        console.warn('[fetch-apps] eksik kayıt atlandı:', JSON.stringify(app));
        continue;
    }
    managed.push(app.dir);
    try {
        const what = await sync(app);
        console.log(`[fetch-apps] ${app.dir} ${what} (${app.repo})`);
    } catch (err) {
        const reason = String(err?.stderr || err?.message || err).trim().split('\n').pop();
        console.warn(`[fetch-apps] ⚠ ${app.dir} çekilemedi: ${reason}`);
        console.warn('[fetch-apps]   Bu bölüm elde ne varsa onunla yayınlanacak.');
    }
}

// Çekilen klasörler ana depoya girmesin; listeyi otomatik tutuyoruz.
const ignore = [
    '# Bu dosya scripts/fetch-apps.mjs tarafından üretilir — elle düzenlemeyin.',
    '# apps/apps.json içindeki depolar buraya klonlanır, ana depoya işlenmez.',
    '# Kendi depoları olmayan projeleri apps/ altına elle koyabilirsiniz;',
    '# onlar normal şekilde takip edilmeye devam eder.',
    ...managed.map((dir) => `/${dir}/`),
    '',
].join('\n');

await writeFile(path.join(appsDir, '.gitignore'), ignore);
