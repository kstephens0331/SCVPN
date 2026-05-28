// Post-build prerender: spins up vite preview, navigates Puppeteer to each
// public route, waits for React + Helmet to render, captures the post-hydration
// HTML, replaces the current Vite bundle paths with placeholder markers, and
// writes back to dist/<route>/index.html. Crawlers (Ahrefs, Googlebot in non-JS
// mode) see per-route titles + H1 + meta + content. Client UX unchanged - the
// hydration takes over from the same DOM Puppeteer captured.
//
// The placeholder dance exists because Vite's content hash is NOT deterministic
// across build environments (a Windows local build and a Vercel Linux build
// produced different JS hashes for identical source). If we committed the
// captured hashes, Vercel's deploy would 404 the JS bundle and React would
// never hydrate (verified live on 2026-05-27, hence the revert). The
// rewrite-prerendered-assets Vite plugin (in vite.config.js) substitutes the
// placeholders with the current build's hashes at closeBundle time on every
// build, local OR Vercel.
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
const PLACE_JS = '__VITE_BUNDLE_JS__';
const PLACE_CSS = '__VITE_BUNDLE_CSS__';

console.log(`[prerender] Starting vite preview on port ${PORT}...`);
const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  shell: true,
  stdio: ['ignore', 'pipe', 'inherit'],
});

let previewReady = false;
preview.stdout.on('data', (data) => {
  const s = data.toString();
  process.stdout.write(`[preview] ${s}`);
  const clean = s.replace(/\[[0-9;]*m/g, '');
  if (clean.includes(String(PORT)) || clean.includes('ready in') || clean.toLowerCase().includes('local:')) {
    previewReady = true;
  }
});

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
await new Promise((r) => setTimeout(r, 1000));

console.log('[prerender] Launching headless browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

// React-helmet-async usually REPLACES static tags, so dedup needs to be
// careful: only remove a static version if a Helmet version (data-rh="true")
// of the same tag exists. Single-tag-only cases must be left alone.
function stripStaticHelmetTwins(html) {
  const count = (re) => (html.match(re) || []).length;
  const descRh = /<meta[^>]*name="description"[^>]*data-rh="true"[^>]*>/i;
  const descPlain = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;
  if (descRh.test(html) && descPlain.test(html)) html = html.replace(descPlain, '');
  const kwRh = /<meta[^>]*name="keywords"[^>]*data-rh="true"[^>]*>/i;
  const kwPlain = /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i;
  if (kwRh.test(html) && kwPlain.test(html)) html = html.replace(kwPlain, '');
  if (count(/<title[^>]*>[^<]*<\/title>/gi) >= 2) {
    html = html.replace(/<title>[^<]*<\/title>/, '');
  }
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, (match) => {
    return match.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, '<p$1>$2</p>');
  });
  return html;
}

// Replace the JUST-CAPTURED bundle paths with placeholders so the committed
// snapshot is build-environment-independent. The vite plugin reinserts the
// CURRENT bundle paths at every build.
function placeholderizeBundlePaths(html) {
  return html
    .replace(/\/assets\/[A-Za-z0-9_-]+\.js/g, PLACE_JS)
    .replace(/\/assets\/[A-Za-z0-9_-]+\.css/g, PLACE_CSS);
}

let okCount = 0;
let failCount = 0;
const errors = [];

try {
  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 30_000 });
      await new Promise((r) => setTimeout(r, 800));
      let rendered = await page.content();
      await page.close();

      rendered = stripStaticHelmetTwins(rendered);
      rendered = placeholderizeBundlePaths(rendered);

      // Root goes to a separate file so the Vite plugin can swap it in at
      // closeBundle; sync-public.sh promotes it to public/_prerendered_root.html
      const outPath = route === '/'
        ? join(distDir, '_prerendered_root.html')
        : join(distDir, route.slice(1), 'index.html');
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
  process.exit(failCount === ROUTES.length ? 1 : 0);
}
