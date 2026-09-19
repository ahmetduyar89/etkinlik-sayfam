// scripts/copy-apps.mjs — `apps/` altındaki statik projeleri yayına kopyalar.
//
// `npm run build` sırasında çalışır. `apps/<isim>/` klasörlerinin her biri
// olduğu gibi `dist/<isim>/` içine kopyalanır; böylece satranç ve deneyler
// gibi HTML tabanlı çalışmalar atölye ile aynı adreste yayınlanır:
//   apps/satranc/index.html  →  https://atölye.tedrisedu.com/satranc/
//
// Kopyalama sırasında her uygulamanın giriş sayfasına küçük bir "Atölye'ye
// dön" bağlantısı eklenir: bu projeler kendi başına açılabilen bağımsız
// sayfalardır ve portalı tanımazlar, o yüzden dönüş yolunu yayın anında biz
// iliştiriyoruz.
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

// ─────────────────────────────────────────────────────────────────────
// "Atölye'ye dön" bağlantısı
// ─────────────────────────────────────────────────────────────────────
// Statik projelerin her biri kendi başına bir sayfadır ve atölyenin varlığından
// habersizdir; açıldıklarında çıkış yolu yalnızca tarayıcının geri tuşudur.
// Bu yüzden giriş sayfalarına köşede duran küçük bir bağlantı iliştiriyoruz.
//
// Uygulamaların kendi stilleriyle çakışmasın diye seçici `a[data-atolye-geri]`
// üzerinden yazılır ve konumu belirleyen özellikler !important taşır. Satranç
// dar ekranda alt gezinme çubuğu kullandığı için buton orada yukarı çekilir.
const GERI_MARKER = 'data-atolye-geri';

const GERI_BAGLANTISI = `
<!-- Atölye'ye dön — yayın sırasında scripts/copy-apps.mjs tarafından eklendi. -->
<a href="/" ${GERI_MARKER} title="Atölye'ye dön" aria-label="Atölye ana sayfasına dön">
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
  <span>Atölye</span>
</a>
<style>
a[${GERI_MARKER}] {
  position: fixed !important;
  right: 14px !important;
  bottom: 14px !important;
  z-index: 2147483000 !important;
  display: inline-flex !important;
  align-items: center;
  gap: 7px;
  padding: 9px 14px 9px 11px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff !important;
  color: #334155 !important;
  font: 600 13px/1 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  text-decoration: none !important;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08), 0 12px 28px -14px rgba(15, 23, 42, 0.45);
  transition: transform 160ms ease, color 160ms ease;
}
a[${GERI_MARKER}]:hover { color: #4f46e5 !important; transform: translateY(-1px); }
a[${GERI_MARKER}]:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }
/* Dar ekranda satrancın alt gezinme çubuğunun üstünde kalsın. */
@media (max-width: 940px) { a[${GERI_MARKER}] { bottom: 84px !important; } }
@media print { a[${GERI_MARKER}] { display: none !important; } }
</style>
`;

/** Giriş sayfasına "Atölye'ye dön" bağlantısını iliştirir. */
async function geriBaglantisiEkle(indexFile, appName) {
    const html = await readFile(indexFile, 'utf8');
    if (html.includes(GERI_MARKER)) {
        console.log(`[copy-apps] ${appName}: geri bağlantısı zaten var, atlandı`);
        return;
    }
    // </body> yoksa (tarayıcı etiketi kendi tamamlar) sona ekleriz.
    const kapanis = html.lastIndexOf('</body>');
    const next =
        kapanis === -1
            ? html + GERI_BAGLANTISI
            : html.slice(0, kapanis) + GERI_BAGLANTISI + html.slice(kapanis);
    await writeFile(indexFile, next);
    console.log(`[copy-apps] ${appName}: "Atölye'ye dön" bağlantısı eklendi`);
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

    // Portala dönüş yolu yalnızca yayındaki kopyaya yazılır; apps/ altındaki
    // kaynak klasör el değmemiş kalır.
    if (hasIndex) await geriBaglantisiEkle(path.join(to, 'index.html'), folder.name);
}

// GitHub Pages tek sayfalık uygulamalar için yönlendirme yapmaz: /etkinlikler
// gibi bir adres doğrudan açıldığında 404 döner. 404 sayfasını uygulama
// kabuğunun kopyası yaparak bu adresler de çalışır hâle gelir. Netlify'da
// yönlendirmeyi netlify.toml hallettiği için bu dosya orada kullanılmaz.
const indexPath = path.join(distDir, 'index.html');
if (existsSync(indexPath)) {
    await cp(indexPath, path.join(distDir, '404.html'));
    console.log('[copy-apps] 404.html oluşturuldu (GitHub Pages yönlendirmesi)');
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
