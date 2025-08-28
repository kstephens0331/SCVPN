// src/lib/apiBase.js
function pickEnv(...vals) {
  for (const v of vals) {
    if (v && v !== 'undefined' && v !== 'null') return v;
  }
  return null;
}

const fromVite = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE);
const fromNext = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE));
const fromWindow = (typeof window !== 'undefined' && window.location.origin);

const base = pickEnv(fromVite, fromNext, fromWindow, 'https://sacvpn.com');

// ensure no trailing slash
export const API_BASE = base.replace(/\/$/, '');
