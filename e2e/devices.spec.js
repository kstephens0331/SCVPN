// e2e/devices.spec.js — Device management E2E tests
// API tests use Node.js fetch (direct to API). UI tests use route mocking.
import { test, expect } from "@playwright/test";
import { testEmail, apiSignup, injectSession, API_BASE } from "./helpers.js";

const TEST_PASSWORD = "TestPass123!";

/** Create user + add a device, return { session, device } */
async function setupUserWithDevice(prefix = "dev") {
  const email = testEmail(prefix);
  const session = await apiSignup(email, TEST_PASSWORD);
  const res = await fetch(`${API_BASE}/api/user/devices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ name: "Test Device", platform: "android" }),
  });
  const device = await res.json();
  return { session, device };
}

// ─── API Tests (Node.js fetch, no browser) ──────────────────────
test.describe("Device API", () => {
  test("can add a device", async () => {
    const email = testEmail("add-dev");
    const session = await apiSignup(email, TEST_PASSWORD);

    const res = await fetch(`${API_BASE}/api/user/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ name: "E2E Phone", platform: "android" }),
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.id).toBeTruthy();
    expect(data.name).toBe("E2E Phone");
  });

  test("can list devices", async () => {
    const { session } = await setupUserWithDevice("list-dev");
    const res = await fetch(`${API_BASE}/api/user/devices`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    expect(res.ok).toBe(true);
    const data = await res.json();
    expect(data.devices).toBeInstanceOf(Array);
    expect(data.devices.length).toBeGreaterThanOrEqual(1);
  });

  test("can toggle device active status", async () => {
    const { session, device } = await setupUserWithDevice("toggle-dev");

    const toggleRes = await fetch(`${API_BASE}/api/user/devices/${device.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ is_active: false }),
    });
    expect(toggleRes.ok).toBe(true);

    const listRes = await fetch(`${API_BASE}/api/user/devices`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await listRes.json();
    const updated = data.devices.find((d) => d.id === device.id);
    expect(updated.is_active).toBe(false);
  });

  test("can rename a device", async () => {
    const { session, device } = await setupUserWithDevice("rename-dev");

    const res = await fetch(`${API_BASE}/api/user/devices/${device.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ name: "New Name" }),
    });
    expect(res.ok).toBe(true);

    const listRes = await fetch(`${API_BASE}/api/user/devices`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await listRes.json();
    expect(data.devices.find((d) => d.id === device.id).name).toBe("New Name");
  });

  test("can delete a device", async () => {
    const { session, device } = await setupUserWithDevice("del-dev");

    const delRes = await fetch(`${API_BASE}/api/user/devices/${device.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    expect(delRes.ok).toBe(true);

    const listRes = await fetch(`${API_BASE}/api/user/devices`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await listRes.json();
    expect(data.devices.find((d) => d.id === device.id)).toBeUndefined();
  });
});

// ─── UI Tests (browser with mocked API routes) ─────────────────
test.describe("Device UI", () => {
  test("devices page renders and shows device list", async ({ page }) => {
    const email = testEmail("ui-show");
    const session = await apiSignup(email, TEST_PASSWORD);
    await injectSession(page, session);

    // Mock the devices API so the browser can render data
    await page.route("**/api/user/devices", (route) => {
      if (route.request().method() === "GET") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            devices: [
              { id: "d1", name: "My Phone", platform: "android", is_active: true, connected: false },
              { id: "d2", name: "Work Laptop", platform: "windows", is_active: true, connected: true },
            ],
          }),
        });
      } else {
        route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });

    page.on("dialog", (dialog) => dialog.accept());

    await page.goto("/app/personal/devices");
    await expect(page).toHaveURL(/\/app\/personal\/devices/i, { timeout: 10_000 });

    // Should show devices heading
    await expect(page.locator("h2").filter({ hasText: /devices/i }).first()).toBeVisible({ timeout: 10_000 });

    // Device names are inside editable <input> elements (rename-on-blur pattern)
    await expect(page.locator('input[value="My Phone"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('input[value="Work Laptop"]')).toBeVisible({ timeout: 10_000 });
  });

  test("devices page shows add device form", async ({ page }) => {
    const email = testEmail("ui-form");
    const session = await apiSignup(email, TEST_PASSWORD);
    await injectSession(page, session);

    await page.route("**/api/user/devices", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ devices: [] }),
      });
    });

    await page.goto("/app/personal/devices");

    // Should show add device form
    await expect(page.locator("text=/add new device/i").first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('input[placeholder*="iPhone"]').first()).toBeVisible();
    await expect(page.getByRole("button", { name: /add device/i })).toBeVisible();
  });
});
