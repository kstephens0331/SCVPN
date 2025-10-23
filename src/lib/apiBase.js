// src/lib/apiBase.js
// explicit envBase priority
// Support both VITE_API_URL (Vercel) and VITE_API_BASE (local)
const envBase =
  import.meta.env?.VITE_API_URL ||
  import.meta.env?.VITE_API_BASE ||
  (typeof process !== 'undefined' ? process.env?.VITE_API_URL : null) ||
  (typeof process !== 'undefined' ? process.env?.VITE_API_BASE : null) ||
  'https://scvpn-production.up.railway.app';

// ensure no trailing slash
export const API_BASE = envBase.replace(/\/$/, '');
