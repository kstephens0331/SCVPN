// src/lib/apiBase.js
// explicit envBase priority
const envBase =
  import.meta.env?.VITE_API_BASE ||
  (typeof process !== 'undefined' ? process.env?.VITE_API_BASE : null) ||
  'https://scvpn-production.up.railway.app';

// ensure no trailing slash
export const API_BASE = envBase.replace(/\/$/, '');
