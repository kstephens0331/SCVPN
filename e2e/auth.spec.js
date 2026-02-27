// e2e/auth.spec.js — Full authentication flow E2E tests
import { test, expect } from "@playwright/test";
import { testEmail, apiSignup, apiLogin, injectSession, API_BASE } from "./helpers.js";

const TEST_PASSWORD = "TestPass123!";

// ─── Login Page UI (no API needed) ─────────────────────────────
test.describe("Login page", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("text=/sign in/i").first()).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("password visibility toggle works", async ({ page }) => {
    await page.goto("/login");
    const passwordInput = page.locator("#password");
    await passwordInput.fill("secret");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await passwordInput.locator("xpath=../button").click();
    await expect(passwordInput).toHaveAttribute("type", "text");
  });
});

// ─── Signup + Login via API (Node.js fetch, no browser) ─────────
test.describe("Signup and login via API", () => {
  test("can sign up a new user", async () => {
    const email = testEmail("signup");
    const data = await apiSignup(email, TEST_PASSWORD);
    expect(data.access_token).toBeTruthy();
    expect(data.refresh_token).toBeTruthy();
    expect(data.user).toBeTruthy();
    expect(data.user.email).toBe(email);
  });

  test("can log in with credentials", async () => {
    const email = testEmail("login");
    await apiSignup(email, TEST_PASSWORD);
    const data = await apiLogin(email, TEST_PASSWORD);
    expect(data.access_token).toBeTruthy();
    expect(data.user.email).toBe(email);
  });

  test("signup rejects duplicate email", async () => {
    const dupEmail = testEmail("dup");
    await apiSignup(dupEmail, TEST_PASSWORD);
    await expect(apiSignup(dupEmail, TEST_PASSWORD)).rejects.toThrow(/already|exists|duplicate/i);
  });
});

// ─── Login through UI (mock API for browser) ────────────────────
test.describe("Login through UI", () => {
  test("login calls API and stores session on success", async ({ page }) => {
    const fakeSession = {
      access_token: "fake.jwt.token",
      refresh_token: "fake-refresh",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: { id: "test-id", email: "test@test.com", role: "client", account_type: "personal", is_admin: false },
    };

    // Intercept the login API call and return a successful response
    await page.route("**/api/auth/login", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(fakeSession),
      });
    });

    // Also intercept any profile/device calls that fire after login
    await page.route("**/api/user/**", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/login");
    await page.fill("#email", "test@test.com");
    await page.fill("#password", "password");
    await page.getByRole("button", { name: /sign in/i }).click();

    // After successful login, the auth client stores the session
    // and useAuthRedirect should navigate away from /login
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
    const url = page.url();
    expect(url).toMatch(/\/app\/|\/dashboard|\/admin/i);
  });

  test("login shows error on failure", async ({ page }) => {
    await page.route("**/api/auth/login", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid credentials" }),
      });
    });

    await page.goto("/login");
    await page.fill("#email", "bad@test.com");
    await page.fill("#password", "wrong");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.locator("text=/invalid|error|failed/i").first()).toBeVisible({ timeout: 10_000 });
  });
});

// ─── Token Refresh (API) ────────────────────────────────────────
test.describe("Token refresh", () => {
  test("refresh endpoint returns new tokens", async () => {
    const email = testEmail("refresh");
    const signup = await apiSignup(email, TEST_PASSWORD);

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: signup.refresh_token }),
    });
    expect(res.ok).toBe(true);

    const data = await res.json();
    expect(data.access_token).toBeTruthy();
    expect(data.refresh_token).toBeTruthy();
    // New refresh token should differ (token rotation)
    expect(data.refresh_token).not.toBe(signup.refresh_token);
  });
});

// ─── Protected Routes (browser with session injection) ──────────
test.describe("Protected routes", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/app/personal/overview");
    await expect(page).toHaveURL(/\/login/i, { timeout: 10_000 });
  });

  test("authenticated user stays on protected page", async ({ page }) => {
    const email = testEmail("protected");
    const session = await apiSignup(email, TEST_PASSWORD);
    await injectSession(page, session);

    // Mock API calls since browser can't reach api.sacvpn.com from localhost
    await page.route("**/api/**", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.goto("/app/personal/overview");
    await expect(page).toHaveURL(/\/app\/personal\/overview/i, { timeout: 10_000 });
  });

  test("authenticated user can access devices page", async ({ page }) => {
    const email = testEmail("dev-page");
    const session = await apiSignup(email, TEST_PASSWORD);
    await injectSession(page, session);

    await page.route("**/api/user/devices", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ devices: [{ id: "d1", name: "Phone", platform: "android", is_active: true }] }),
      });
    });

    await page.goto("/app/personal/devices");
    await expect(page).toHaveURL(/\/app\/personal\/devices/i, { timeout: 10_000 });
    await expect(page.locator("h2, h3").filter({ hasText: /devices/i }).first()).toBeVisible({ timeout: 10_000 });
  });
});

// ─── Logout (browser) ───────────────────────────────────────────
test.describe("Logout", () => {
  test("without session, protected pages redirect to login", async ({ page }) => {
    // Don't inject any session — just navigate to a protected page
    // Mock API calls to prevent fetch errors
    await page.route("**/api/**", (route) => {
      route.fulfill({ status: 401, contentType: "application/json", body: '{"error":"Not authenticated"}' });
    });

    await page.goto("/app/personal/overview");
    await expect(page).toHaveURL(/\/login/i, { timeout: 15_000 });
  });
});

// ─── API Auth Endpoints (Node.js fetch) ─────────────────────────
test.describe("API auth endpoints", () => {
  test("GET /api/auth/me returns user profile", async () => {
    const email = testEmail("me-ep");
    const session = await apiSignup(email, TEST_PASSWORD);

    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    expect(res.ok).toBe(true);

    const data = await res.json();
    // /api/auth/me returns user data at top level (not nested in .user)
    expect(data.email).toBe(email);
    expect(data.id).toBeTruthy();
  });

  test("GET /api/auth/me rejects invalid token", async () => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: "Bearer invalid.jwt.token" },
    });
    expect(res.status).toBe(401);
  });

  test("POST /api/auth/logout invalidates refresh token", async () => {
    const email = testEmail("logout-api");
    const session = await apiSignup(email, TEST_PASSWORD);

    const logoutRes = await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    expect(logoutRes.ok).toBe(true);

    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    expect(refreshRes.ok).toBe(false);
  });
});
