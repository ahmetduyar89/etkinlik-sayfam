// scripts/sync-chess-engine.mjs — Satranç motorunu kaynağından tazeler.
//
// Canlı Satranç sayfası, satranç uygulamasının kendi kural motorunu kullanır:
// çocuğun derste öğrendiği kurallarla çevrimiçi maçtaki kurallar birebir aynı
// olsun diye. Motor orada geliştiği için burada bir KOPYASI durur
// (src/lib/chess/engine).
//
// Bu betik o kopyayı güncel hâliyle değiştirir:
//
//   node scripts/sync-chess-engine.mjs
//
// `apps/satranc/` zaten çekilmişse (npm run dev / build bunu yapar) oradan
// okur; yoksa depoyu geçici bir klasöre klonlar. Dosyaların başındaki
// "elle düzenlemeyin" notu yeniden yazılır.
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'src', 'lib', 'chess', 'engine');
const REPO = 'https://github.com/ahmetduyar89/satranc.git';

/** Kaynaktaki yol → buradaki dosya adı. */
const FILES = [
    ['src/engine/Chess.js', 'Chess.js'],
    ['src/engine/Evaluator.js', 'Evaluator.js'],
    ['src/engine/Ai.js', 'Ai.js'],
    ['src/components/PieceGlyph.js', 'PieceGlyph.js'],
];

const HEADER = [
    '// ─────────────────────────────────────────────────────────────────────',
    '// BU DOSYA SATRANÇ UYGULAMASINDAN ALINMIŞTIR — ELLE DÜZENLEMEYİN.',
    '//',
    '// Kaynak: https://github.com/ahmetduyar89/satranc  (src/engine, src/components)',
    '// Kural motoru, değerlendirici, yapay zekâ ve taş çizimleri orada gelişir;',
    '// Canlı Satranç sayfası aynı motoru kullansın diye buraya kopyalanmıştır.',
    '// Böylece çocuğun derste öğrendiği kurallar ile çevrimiçi maçtaki kurallar',
    '// birebir aynı davranır.',
    '//',
    '// Güncellemek için: scripts/sync-chess-engine.mjs çalıştırın.',
    '// ─────────────────────────────────────────────────────────────────────',
    '',
].join('\n');

/** Kaynak klasörü bulur: elde varsa apps/satranc, yoksa geçici klon. */
async function resolveSource() {
    const local = path.join(root, 'apps', 'satranc');
    if (existsSync(path.join(local, 'src', 'engine', 'Chess.js'))) {
        return { dir: local, cleanup: async () => {} };
    }
    const temp = await mkdtemp(path.join(tmpdir(), 'satranc-'));
    console.log('[sync-chess-engine] depo klonlanıyor…');
    await run('git', ['clone', '--depth', '1', REPO, temp], { maxBuffer: 32 * 1024 * 1024 });
    return { dir: temp, cleanup: () => rm(temp, { recursive: true, force: true }) };
}

const source = await resolveSource();

try {
    for (const [from, to] of FILES) {
        const body = await readFile(path.join(source.dir, from), 'utf8');
        await writeFile(path.join(target, to), HEADER + body);
        console.log(`[sync-chess-engine] ${to} güncellendi`);
    }
    console.log(
        '[sync-chess-engine] Bitti. Motorun yüzeyi değiştiyse *.d.ts dosyalarını da gözden geçirin.'
    );
} finally {
    await source.cleanup();
}
