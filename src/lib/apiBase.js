// src/lib/apiBase.js
export const API_BASE = (() => {
  const trim = (s) => s?.trim().replace(/\/+$/, '');
  // Prefer Railway API if you moved your server there
  const rail = trim(import.meta.env.VITE_RAILWAY_API_URL);
  if (rail) return rail;

  // Explicit site URL (works on Vercel preview/prod if you set it)
  const site = trim(import.meta.env.VITE_SITE_URL);
  if (site) return site;

  // Vercel provides VERCEL_URL without protocol
  const vercel = trim(import.meta.env.VERCEL_URL);
  if (vercel) return `https://${vercel}`;

  // Fallback to browser origin (local dev)
  return window.location.origin;
})();
