// Post-build prerender: spins up vite preview, navigates Puppeteer to each
// public route, waits for React + Helmet to render, captures the post-hydration
// HTML, writes it back to dist/<route>/index.html. Crawlers (Ahrefs, Googlebot
// in non-JS mode) see per-route titles + H1 + meta + content. Client UX
// unchanged - the hydration takes over from the same DOM Puppeteer captured.
//
// Built 2026-05-27 to lift SACVPN's Ahrefs Site Audit score from 21% (the
// SPA was returning identical 9120-byte HTML for every route, flagging
// every page as orphan + empty).

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer';

const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('dist/ not found. Run `vite build` first.');
  process.exit(1);
}

// Public marketing routes. Auth-gated routes (/dashboard, /app/*, /admin/*,
// /post-checkout) are excluded because they require login and have no
// public content for crawlers.
const ROUTES = [
  '/',
  '/pricing',
  '/faq',
  '/contact',
  '/login',
  '/about',
  '/blog',
  '/terms',
  '/privacy',
  '/download',
  '/tools',
  '/industries/healthcare',
  '/industries/legal',
  '/industries/finance',
  '/industries/remote-teams',
  '/industries/small-business',
  '/gaming',
  '/personal',
  '/compare',
  '/partners',
];

const PORT = 5174;
const BASE = `http://localhost:${PORT}`;

console.log(`[prerender] Starting vite preview on port ${PORT}...`);
const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  shell: true,
  stdio: ['ignore', 'pipe', 'inherit'],
});

let previewReady = false;
preview.stdout.on('data', (data) => {
  const s = data.toString();
  process.stdout.write(`[preview] ${s}`);
  // Strip ANSI color codes (Vite wraps the port number with them) before matching.
  const clean = s.replace(/\[[0-9;]*m/g, '');
  if (clean.includes(String(PORT)) || clean.includes('ready in') || clean.toLowerCase().includes('local:')) {
    previewReady = true;
  }
});

// Wait for preview to be ready
const waitForPreview = async () => {
  for (let i = 0; i < 30; i++) {
    if (previewReady) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const ok = await waitForPreview();
if (!ok) {
  console.error('[prerender] vite preview never became ready');
  preview.kill();
  process.exit(1);
}
// Brief settle period
await new Promise((r) => setTimeout(r, 1000));

console.log('[prerender] Launching headless browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');

// Strip duplicate static template tags ONLY when Helmet also injected one.
// React-helmet-async usually REPLACES existing tags, so dedup needs to be
// careful: only remove a static version if a Helmet version (data-rh="true")
// of the same tag exists. Single-tag-only cases must be left alone.
function stripStaticHelmetTwins(html) {
  // Helper: count occurrences of a regex
  const count = (re) => (html.match(re) || []).length;

  // 1) <meta name="description"> - strip non-data-rh ONLY if data-rh version exists
  const descRh = /<meta[^>]*name="description"[^>]*data-rh="true"[^>]*>/i;
  const descPlain = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
  if (descRh.test(html) && descPlain.test(html)) {
    html = html.replace(descPlain, '');
  }

  // 2) <meta name="keywords"> same pattern
  const kwRh = /<meta[^>]*name="keywords"[^>]*data-rh="true"[^>]*>/i;
  const kwPlain = /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i;
  if (kwRh.test(html) && kwPlain.test(html)) {
    html = html.replace(kwPlain, '');
  }

  // 3) <title> - only strip when there are 2+ of them
  if (count(/<title[^>]*>[^<]*<\/title>/gi) >= 2) {
    // Remove only the first one (the static template title)
    html = html.replace(/<title>[^<]*<\/title>/, '');
  }

  // 4) <h1> inside <noscript> - safely convert to <p>
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, (match) => {
    return match.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, '<p$1>$2</p>');
  });

  return html;
}

let okCount = 0;
let failCount = 0;
const errors = [];

try {
  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      // Match SACVPN's real desktop viewport
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30_000 });
      // Wait an extra beat for any post-hydration Helmet flush
      await new Promise((r) => setTimeout(r, 800));
      let rendered = await page.content();
      await page.close();

      // Dedupe: keep ONLY the react-helmet versions (marked with data-rh="true")
      // of these meta tags. Strip the static-template versions before saving.
      // Without this, every prerendered page has 2 meta descriptions, 2 titles,
      // etc - which is exactly the Ahrefs flag we are fixing.
      rendered = stripStaticHelmetTwins(rendered);

      // Write each route to dist/<route>/index.html. Vercel serves these
      // automatically without rewrites because the file path matches the URL.
      const outPath = route === '/' ? join(distDir, 'index.html') : join(distDir, route.slice(1), 'index.html');
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, rendered, 'utf-8');
      console.log(`[prerender] OK  ${route} -> ${outPath} (${rendered.length} bytes)`);
      okCount++;
    } catch (err) {
      console.error(`[prerender] FAIL ${route}: ${err.message}`);
      errors.push({ route, error: err.message });
      failCount++;
    }
  }
} finally {
  await browser.close();
  preview.kill();
}

console.log(`\n[prerender] Done. ${okCount} ok, ${failCount} failed.`);
if (errors.length > 0) {
  console.error('[prerender] Errors:');
  for (const e of errors) console.error(`  ${e.route}: ${e.error}`);
  process.exit(failCount === ROUTES.length ? 1 : 0); // only fail if ALL failed
}
