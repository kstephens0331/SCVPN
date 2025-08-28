// src/lib/apiBase.js
function pickEnv(...vals) {
  for (const v of vals) {
    if (v && v !== 'undefined' && v !== 'null') return v;
  }
  return null;
}

// explicit envBase priority
const envBase =
  import.meta.env?.VITE_API_BASE ||
  process.env?.VITE_API_BASE ||
  'https://scvpn-production.up.railway.app';

const fromVite = import.meta.env?.VITE_API_BASE;
const fromNext = process.env?.NEXT_PUBLIC_API_BASE || process.env?.API_BASE;
const fromWindow = typeof window !== 'undefined' && window.location.origin;

const base = pickEnv(envBase, fromVite, fromNext, fromWindow, 'https://sacvpn.com');

// ensure no trailing slash
export const API_BASE = envBase.replace(/\/$/, '');
