// e2e/profile.spec.js — User profile and account E2E tests
import { test, expect } from "@playwright/test";
import { testEmail, apiSignup, injectSession, API_BASE } from "./helpers.js";

const TEST_PASSWORD = "TestPass123!";

// ─── API Tests ──────────────────────────────────────────────────
test.describe("User profile API", () => {
  test("GET /api/user/profile returns user data", async () => {
    const email = testEmail("prof-get");
    const session = await apiSignup(email, TEST_PASSWORD);

    const res = await fetch(`${API_BASE}/api/user/profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.email).toBe(email);
    expect(data.id).toBeTruthy();
  });

  test("PUT /api/user/profile updates full_name", async () => {
    const email = testEmail("prof-put");
    const session = await apiSignup(email, TEST_PASSWORD);

    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ full_name: "Updated Name" }),
    });
    expect(res.ok).toBe(true);

    const getRes = await fetch(`${API_BASE}/api/user/profile`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await getRes.json();
    expect(data.full_name).toBe("Updated Name");
  });

  test("GET /api/user/subscription returns valid response", async () => {
    const email = testEmail("prof-sub");
    const session = await apiSignup(email, TEST_PASSWORD);

    const res = await fetch(`${API_BASE}/api/user/subscription`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    expect([200, 404]).toContain(res.status);
  });
});

// ─── UI Tests ───────────────────────────────────────────────────
test.describe("User profile UI", () => {
  test("account page loads and shows form", async ({ page }) => {
    const email = testEmail("prof-ui");
    const session = await apiSignup(email, TEST_PASSWORD);
    await injectSession(page, session);

    // Mock API calls since browser can't reach api.sacvpn.com from localhost
    await page.route("**/api/user/profile", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "u1", email, full_name: "Test User", avatar_url: "" }),
      });
    });

    await page.goto("/app/personal/account");
    await expect(page).toHaveURL(/\/app\/personal\/account/i, { timeout: 10_000 });

    // Account heading visible
    await expect(page.locator("h2").filter({ hasText: /account/i }).first()).toBeVisible({ timeout: 10_000 });
    // Profile form inputs visible
    await expect(page.locator("input").first()).toBeVisible();
  });
});
