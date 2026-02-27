// e2e/helpers.js — Shared helpers for SACVPN E2E tests

const API_BASE = process.env.TEST_API_URL || "https://api.sacvpn.com";
const STORAGE_KEY = "sacvpn_session";

/**
 * Generate a unique test email so tests don't collide.
 */
export function testEmail(prefix = "e2e") {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}+${ts}${rand}@test.sacvpn.com`;
}

/**
 * Sign up a test user directly via the API (bypasses UI for speed).
 * Returns { access_token, refresh_token, user, expires_at }.
 */
export async function apiSignup(email, password = "TestPass123!") {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name: "E2E Test User" }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Signup failed (${res.status}): ${body.error || "unknown"}`);
  }
  return res.json();
}

/**
 * Log in via the API. Returns session data.
 */
export async function apiLogin(email, password = "TestPass123!") {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Login failed (${res.status}): ${body.error || "unknown"}`);
  }
  return res.json();
}

/**
 * Inject a session into the browser's localStorage so the app thinks the user is logged in.
 * Call this BEFORE navigating to the app.
 */
export async function injectSession(page, sessionData) {
  const session = {
    access_token: sessionData.access_token,
    refresh_token: sessionData.refresh_token,
    expires_at: sessionData.expires_at,
    user: sessionData.user,
  };
  await page.addInitScript((data) => {
    localStorage.setItem("sacvpn_session", JSON.stringify(data));
  }, session);
}

/**
 * Clear session from localStorage.
 */
export async function clearSession(page) {
  await page.addInitScript(() => {
    localStorage.removeItem("sacvpn_session");
  });
}

/**
 * Delete a test user via the API (cleanup). Requires admin token or direct DB.
 * Silently fails if user doesn't exist.
 */
export async function apiDeleteUser(token, userId) {
  try {
    await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Ignore cleanup errors
  }
}

export { API_BASE, STORAGE_KEY };
