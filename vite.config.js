import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

// Substitute bundle-path placeholders left by scripts/prerender.mjs with the
// CURRENT hashed asset paths Vite just generated. Prerendered HTML lives in
// public/<route>/index.html and gets copied to dist/<route>/index.html by
// Vite's static asset step; this plugin walks dist/ and rewrites the markers.
//
// Vite's content hash is not deterministic across build environments (Windows
// local vs Vercel Linux container produced different JS hashes for identical
// source), so capturing a hash at prerender time and committing it ships a
// 404 to production. The placeholder + rewrite pattern keeps prerendered
// snapshots deployment-agnostic.
function rewritePrerenderedAssets() {
  const PLACE_JS = '__VITE_BUNDLE_JS__'
  const PLACE_CSS = '__VITE_BUNDLE_CSS__'
  return {
    name: 'rewrite-prerendered-assets',
    apply: 'build',
    closeBundle() {
      const distDir = 'dist'
      const entryPath = join(distDir, 'index.html')
      if (!existsSync(entryPath)) return
      const entryHtml = readFileSync(entryPath, 'utf-8')
      const jsMatch = entryHtml.match(/\/assets\/[A-Za-z0-9_-]+\.js/)
      const cssMatch = entryHtml.match(/\/assets\/[A-Za-z0-9_-]+\.css/)
      if (!jsMatch || !cssMatch) {
        console.warn('[rewrite-prerendered-assets] No current bundle paths in dist/index.html, skipping')
        return
      }
      const currentJs = jsMatch[0]
      const currentCss = cssMatch[0]

      let rewroteRoutes = 0
      function walk(dir) {
        for (const entry of readdirSync(dir)) {
          const p = join(dir, entry)
          const s = statSync(p)
          if (s.isDirectory()) walk(p)
          else if (entry === 'index.html' && p !== entryPath) {
            const before = readFileSync(p, 'utf-8')
            if (!before.includes(PLACE_JS) && !before.includes(PLACE_CSS)) continue
            const after = before
              .replaceAll(PLACE_JS, currentJs)
              .replaceAll(PLACE_CSS, currentCss)
            writeFileSync(p, after, 'utf-8')
            rewroteRoutes++
          }
        }
      }
      walk(distDir)

      const rootSnapshot = join(distDir, '_prerendered_root.html')
      if (existsSync(rootSnapshot)) {
        const html = readFileSync(rootSnapshot, 'utf-8')
          .replaceAll(PLACE_JS, currentJs)
          .replaceAll(PLACE_CSS, currentCss)
        writeFileSync(entryPath, html, 'utf-8')
        unlinkSync(rootSnapshot)
        console.log(`[rewrite-prerendered-assets] root replaced with prerendered snapshot (${html.length} bytes)`)
      }
      console.log(`[rewrite-prerendered-assets] rewrote ${rewroteRoutes} prerendered route files, js=${currentJs} css=${currentCss}`)
    }
  }
}

export default defineConfig({
  plugins: [react(), rewritePrerenderedAssets()],
  build: { sourcemap: true }
})
