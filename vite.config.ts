import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// `apps/` altındaki statik projeleri (satranç, deneyler…) geliştirme sunucusunda
// da yayınla. Yayın sırasında aynı işi scripts/copy-apps.mjs yapar.
function serveApps(): Plugin {
  const appsDir = path.resolve(__dirname, 'apps')
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

  return {
    name: 'serve-apps',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!fs.existsSync(appsDir)) return next()
        const url = decodeURIComponent((req.url || '/').split('?')[0])
        const rel = url.replace(/^\/+/, '')
        if (!rel) return next()

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

        res.setHeader('Content-Type', MIME[path.extname(file).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), serveApps()],
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
})
