import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// `apps/` altındaki statik projeleri (satranç, deneyler…) geliştirme sunucusunda
// da yayınla. Yayın sırasında aynı işi scripts/copy-apps.mjs yapar.
function serveApps(env: Record<string, string>): Plugin {
  const appsDir = path.resolve(__dirname, 'apps')
  const firebasePublicConfig = () => ({
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  })
  const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  }

  const GERI_MARKER = 'data-atolye-geri'
  const GERI_BAGLANTISI = `
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
@media (max-width: 940px) { a[${GERI_MARKER}] { bottom: 84px !important; } }
@media print { a[${GERI_MARKER}] { display: none !important; } }
</style>
`

  return {
    name: 'serve-apps',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!fs.existsSync(appsDir)) return next()
        const url = decodeURIComponent((req.url || '/').split('?')[0])
        const rel = url.replace(/^\/+/, '')
        if (!rel) return next()

        if (rel === 'satranc/firebase-config.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify(firebasePublicConfig()))
          return
        }

        const name = rel.split('/')[0]
        // Yol gerçekten bir proje klasörüyle başlamıyorsa Vite'a bırak.
        if (!fs.existsSync(path.join(appsDir, name))) return next()

        let file = path.resolve(appsDir, rel)
        // Klasör dışına çıkmaya çalışan yolları reddet.
        if (!file.startsWith(appsDir + path.sep)) return next()
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
          file = path.join(file, 'index.html')
        }
        if (!fs.existsSync(file)) return next()

        if (file.endsWith('.html')) {
          let html = fs.readFileSync(file, 'utf-8')
          if (!html.includes('data-atolye-geri')) {
            const kapanis = html.lastIndexOf('</body>')
            html = kapanis === -1 ? html + GERI_BAGLANTISI : html.slice(0, kapanis) + GERI_BAGLANTISI + html.slice(kapanis)
          }
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(html)
          return
        }

        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  return {
  base: '/',
  plugins: [react(), serveApps(env)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
  }
})
