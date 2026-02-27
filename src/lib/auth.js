// src/lib/auth.js — Drop-in replacement for Supabase Auth client
// Mimics the supabase.auth.* API so existing code needs minimal changes.

const API_BASE = import.meta.env.VITE_API_URL || "https://api.sacvpn.com";
const STORAGE_KEY = "sacvpn_session";

class AuthClient {
  constructor() {
    this._listeners = new Set();
    this._initialized = false;

    // Restore session from localStorage on first load
    const stored = this._getStoredSession();
    if (stored?.access_token) {
      // Check if token is expired
      if (stored.expires_at && stored.expires_at * 1000 < Date.now()) {
        // Token expired — try refresh silently
        this._refreshSession(stored.refresh_token).then((sess) => {
          this._initialized = true;
          if (sess) this._notify("TOKEN_REFRESHED", sess);
        });
      } else {
        this._initialized = true;
      }
    } else {
      this._initialized = true;
    }
  }

  // ---- supabase.auth.signUp() ----
  async signUp({ email, password, options = {} }) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: options.data?.full_name }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { data: { user: null, session: null }, error: { message: data.error || "Signup failed" } };
      }

      const session = this._buildSession(data);
      this._storeSession(session);
      this._notify("SIGNED_IN", session);

      return { data: { user: session.user, session }, error: null };
    } catch (err) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  // ---- supabase.auth.signInWithPassword() ----
  async signInWithPassword({ email, password }) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { data: { user: null, session: null }, error: { message: data.error || "Login failed" } };
      }

      const session = this._buildSession(data);
      this._storeSession(session);
      this._notify("SIGNED_IN", session);

      return { data: { user: session.user, session }, error: null };
    } catch (err) {
      return { data: { user: null, session: null }, error: { message: err.message } };
    }
  }

  // ---- supabase.auth.signOut() ----
  async signOut() {
    const stored = this._getStoredSession();
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(stored?.access_token ? { Authorization: `Bearer ${stored.access_token}` } : {}),
        },
        body: JSON.stringify({ refresh_token: stored?.refresh_token }),
      });
    } catch { /* ignore logout errors */ }

    localStorage.removeItem(STORAGE_KEY);
    this._notify("SIGNED_OUT", null);
    return { error: null };
  }

  // ---- supabase.auth.getSession() ----
  async getSession() {
    const stored = this._getStoredSession();
    if (!stored?.access_token) {
      return { data: { session: null }, error: null };
    }

    // Check if token is expired
    if (stored.expires_at && stored.expires_at * 1000 < Date.now()) {
      const refreshed = await this._refreshSession(stored.refresh_token);
      if (!refreshed) {
        localStorage.removeItem(STORAGE_KEY);
        return { data: { session: null }, error: null };
      }
      return { data: { session: refreshed }, error: null };
    }

    return { data: { session: stored }, error: null };
  }

  // ---- supabase.auth.getUser() ----
  async getUser() {
    const stored = this._getStoredSession();
    if (!stored?.access_token) {
      return { data: { user: null }, error: { message: "Not authenticated" } };
    }

    // Decode user from stored session (avoiding extra API call)
    return { data: { user: stored.user }, error: null };
  }

  // ---- supabase.auth.onAuthStateChange(callback) ----
  onAuthStateChange(callback) {
    this._listeners.add(callback);

    // Fire initial state
    const stored = this._getStoredSession();
    if (stored?.access_token) {
      // Don't fire synchronously — use microtask to match Supabase behavior
      queueMicrotask(() => callback("INITIAL_SESSION", stored));
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => this._listeners.delete(callback),
        },
      },
    };
  }

  // ---- Internal helpers ----

  _buildSession(apiResponse) {
    return {
      access_token: apiResponse.access_token,
      refresh_token: apiResponse.refresh_token,
      expires_at: apiResponse.expires_at,
      user: {
        id: apiResponse.user.id,
        email: apiResponse.user.email,
        user_metadata: {
          full_name: apiResponse.user.full_name,
        },
        // Convenience fields (not in Supabase but useful)
        full_name: apiResponse.user.full_name,
        role: apiResponse.user.role,
        account_type: apiResponse.user.account_type,
        is_admin: apiResponse.user.is_admin,
      },
    };
  }

  _storeSession(session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  _getStoredSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  async _refreshSession(refreshToken) {
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const session = this._buildSession(data);
      this._storeSession(session);
      return session;
    } catch {
      return null;
    }
  }

  _notify(event, session) {
    for (const cb of this._listeners) {
      try {
        cb(event, session);
      } catch (err) {
        console.error("[auth] listener error:", err);
      }
    }
  }
}

// Singleton
export const auth = new AuthClient();
