// src/lib/api.js — Authenticated fetch helper for SACVPN API
const API_BASE = import.meta.env.VITE_API_URL || "https://api.sacvpn.com";
const STORAGE_KEY = "sacvpn_session";

/**
 * Authenticated fetch wrapper that auto-injects Bearer token
 * and handles token refresh on 401.
 */
export async function apiFetch(path, options = {}) {
  const session = getStoredSession();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && session?.refresh_token) {
    const refreshed = await refreshTokens(session.refresh_token);
    if (refreshed) {
      headers.Authorization = `Bearer ${refreshed.access_token}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  return res;
}

/**
 * Convenience: apiFetch that parses JSON
 */
export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data);
  return data;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

async function refreshTokens(refresh_token) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Update stored session
    const session = getStoredSession() || {};
    const updated = {
      ...session,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      user: data.user,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
}

export { API_BASE, STORAGE_KEY };
