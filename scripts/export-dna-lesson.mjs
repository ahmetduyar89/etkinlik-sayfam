// Creates the portable lesson from its canonical HTML/CSS/JS sources.
import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const dir = new URL('../apps/dna-genetik/', import.meta.url);
await build({entryPoints:[fileURLToPath(new URL('molecular-3d.js',dir))],outfile:fileURLToPath(new URL('molecular-3d.bundle.js',dir)),bundle:true,minify:true,format:'iife',target:'es2020',legalComments:'inline'});
const molecular=await readFile(new URL('molecular-3d.bundle.js',dir),'utf8');
const [html, css, lessons, lab] = await Promise.all(['index.html', 'style.css', 'lessons.js', 'lab.js'].map(name => readFile(new URL(name, dir), 'utf8')));
let portable = html.replace('<link rel="stylesheet" href="style.css">', () => `<style>${css}</style>`)
  .replace('<script src="molecular-3d.bundle.js"></script>', () => `<script>${molecular.replace(/<\/script/gi, '<\\/script')}</script>`)
  .replace('<script src="lessons.js"></script>', () => `<script>${lessons.replace(/<\/script/gi, '<\\/script')}</script>`)
  .replace('<script src="lab.js"></script>', () => `<script>${lab.replace(/<\/script/gi, '<\\/script')}</script>`);
// A downloaded portable copy can download itself again without network access.
const source = encodeURIComponent(portable);
portable = portable.replace('</body>', () => `<script id="portable-source" type="text/plain">${source}</script></body>`);
await writeFile(new URL('dna-genetik-tek-dosya.html', dir), portable);
console.log('DNA dersi: bağımsız HTML oluşturuldu.');
