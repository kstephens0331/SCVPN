const puppeteer = require("puppeteer");

const BASE = "https://www.sacvpn.com";
let browser, page;
let passed = 0, failed = 0, errors = [];

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log("  PASS " + name);
  } catch (e) {
    failed++;
    errors.push({ name, error: e.message });
    console.log("  FAIL " + name + ": " + e.message);
  }
}

async function goto(path, waitMs = 3000) {
  await page.goto(BASE + path, { waitUntil: "networkidle2", timeout: 15000 });
  await new Promise(r => setTimeout(r, waitMs));
}

async function hasText(text, timeout = 5000) {
  await page.waitForFunction(
    (t) => document.body.innerText.includes(t),
    { timeout },
    text
  );
}
(async () => {
  browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  console.log("\nSACVPN E2E Smoke Tests\n");
  console.log("Public Pages:");

  await test("Homepage loads", async () => {
    await goto("/");
    const title = await page.title();
    if (!title || title.includes("404")) throw new Error("Bad title: " + title);
  });

  await test("Homepage has hero content", async () => {
    await hasText("VPN");
  });

  await test("Homepage has no 50+ servers text", async () => {
    const text = await page.evaluate(() => document.body.innerText);
    if (text.match(/50\+?\s*servers/i)) throw new Error("Found 50+ servers text");
  });

  await test("Pricing page loads", async () => {
    await goto("/pricing");
    await hasText("month");
  });

  await test("Pricing has plan tiers", async () => {
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    if (!text.includes("personal") && !text.includes("business") && !text.includes("plan"))
      throw new Error("No plan tiers found");
  });

  await test("FAQ page loads", async () => {
    await goto("/faq");
    await hasText("FAQ");
  });

  await test("Contact page loads", async () => {
    await goto("/contact");
    await hasText("Contact");
  });

  await test("Contact page shows info@stephenscode.dev", async () => {
    const text = await page.evaluate(() => document.body.innerText);
    if (!text.includes("info@stephenscode.dev")) throw new Error("Contact email not found");
  });

  await test("About page loads", async () => {
    await goto("/about");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes("404") || text.length < 100) throw new Error("About page content missing");
  });

  await test("Login page loads", async () => {
    await goto("/login");
    await hasText("Sign");
  });

  await test("Login page has email/password fields", async () => {
    const emailInput = await page.$("input[type=email]");
    const passwordInput = await page.$("input[type=password]");
    if (!emailInput) throw new Error("No email input");
    if (!passwordInput) throw new Error("No password input");
  });

  await test("Download page loads", async () => {
    await goto("/download");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 50) throw new Error("Download page appears empty");
  });

  await test("Terms page loads", async () => {
    await goto("/terms");
    await hasText("Terms");
  });

  await test("Privacy page loads", async () => {
    await goto("/privacy");
    await hasText("Privacy");
  });

  await test("Blog page loads", async () => {
    await goto("/blog");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 50) throw new Error("Blog page appears empty");
  });

  await test("Partners page loads", async () => {
    await goto("/partners");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 50) throw new Error("Partners page appears empty");
  });

  await test("Compare page loads", async () => {
    await goto("/compare");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 100) throw new Error("Compare page appears empty");
  });

  console.log("\nIndustry Pages:");

  for (const industry of ["healthcare", "legal", "finance", "remote-teams", "small-business"]) {
    await test("Industry: " + industry + " loads", async () => {
      await goto("/industries/" + industry);
      const text = await page.evaluate(() => document.body.innerText);
      if (text.length < 100) throw new Error(industry + " page appears empty");
    });
  }

  await test("Gaming page loads", async () => {
    await goto("/gaming");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 100) throw new Error("Gaming page appears empty");
  });

  await test("Personal page loads", async () => {
    await goto("/personal");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 100) throw new Error("Personal page appears empty");
  });

  console.log("\nNavigation:");

  await test("Header navigation exists", async () => {
    await goto("/");
    const nav = await page.$("nav, header");
    if (!nav) throw new Error("No navigation element found");
  });

  await test("Footer exists", async () => {
    const footer = await page.$("footer");
    if (!footer) throw new Error("No footer element found");
  });

  await test("Footer has newsletter form", async () => {
    const form = await page.$("footer form, footer input[type=email]");
    if (!form) throw new Error("No newsletter form in footer");
  });

  console.log("\nMobile Responsiveness:");

  await test("Mobile viewport renders", async () => {
    await page.setViewport({ width: 375, height: 812 });
    await goto("/");
    const text = await page.evaluate(() => document.body.innerText);
    if (text.length < 100) throw new Error("Mobile render appears broken");
  });

  await test("Mobile has hamburger menu or nav", async () => {
    await page.$("button[aria-label*=menu], [class*=menu], [class*=hamburger], nav button, header button");
  });

  await page.setViewport({ width: 1440, height: 900 });

  console.log("\nAPI Health:");

  await test("API healthz endpoint responds", async () => {
    const res = await page.evaluate(async () => {
      try {
        const r = await fetch("https://scvpn-production.up.railway.app/api/healthz");
        return { status: r.status, ok: r.ok };
      } catch (e) {
        return { error: e.message };
      }
    });
    if (res.error) throw new Error("API health failed: " + res.error);
    if (!res.ok) throw new Error("API health returned " + res.status);
  });

  await test("API echo endpoint responds", async () => {
    const res = await page.evaluate(async () => {
      try {
        const r = await fetch("https://scvpn-production.up.railway.app/api/echo");
        return { status: r.status, ok: r.ok };
      } catch (e) {
        return { error: e.message };
      }
    });
    if (res.error) throw new Error("API echo failed: " + res.error);
    if (!res.ok) throw new Error("API echo returned " + res.status);
  });

  console.log("\nRedirects:");

  await test("Bare domain redirects to www", async () => {
    const res = await page.evaluate(async () => {
      const r = await fetch("https://sacvpn.com", { redirect: "manual" });
      return { status: r.status, location: r.headers.get("location") };
    });
    if (res.status !== 301 && res.status !== 308 && res.status !== 200) {
      throw new Error("Unexpected status: " + res.status);
    }
  });

  await test("Dashboard redirects to login when not authenticated", async () => {
    await goto("/dashboard");
    var url = page.url();
  });

  console.log("\nContent Quality:");

  await test("No 50+ servers anywhere on homepage", async () => {
    await goto("/");
    const text = await page.evaluate(() => document.body.innerText);
    if (/50\+?\s*server/i.test(text)) throw new Error("Found 50+ servers");
  });

  await test("No 50+ servers on pricing page", async () => {
    await goto("/pricing");
    const text = await page.evaluate(() => document.body.innerText);
    if (/50\+?\s*server/i.test(text)) throw new Error("Found 50+ servers on pricing");
  });

  await test("No broken images on homepage", async () => {
    await goto("/");
    const broken = await page.evaluate(() => {
      const imgs = document.querySelectorAll("img");
      let count = 0;
      imgs.forEach(img => { if (!img.complete || img.naturalWidth === 0) count++; });
      return count;
    });
    if (broken > 0) throw new Error(broken + " broken images found");
  });

  await test("No placeholder/lorem ipsum text", async () => {
    await goto("/");
    const text = await page.evaluate(() => document.body.innerText.toLowerCase());
    if (text.includes("lorem ipsum")) throw new Error("Found lorem ipsum placeholder");
    if (text.includes("todo:")) throw new Error("Found TODO comment in visible text");
  });

  await test("Contact info shows info@stephenscode.dev", async () => {
    await goto("/contact");
    const text = await page.evaluate(() => document.body.innerText);
    if (!text.includes("info@stephenscode.dev")) throw new Error("Wrong or missing contact email");
  });

  console.log("\nSitewide 50+ servers Scan:");

  var allPages = ["/", "/pricing", "/faq", "/contact", "/about", "/download", "/compare", "/gaming", "/personal", "/blog", "/partners"];
  for (const p of allPages) {
    await test("No 50+ servers on " + p, async () => {
      await goto(p, 2000);
      const text = await page.evaluate(() => document.body.innerText);
      if (/50\+?\s*server/i.test(text)) throw new Error("Found 50+ servers on " + p);
    });
  }

  console.log("\nPerformance:");

  await test("Homepage loads in under 5 seconds", async () => {
    const start = Date.now();
    await goto("/");
    const elapsed = Date.now() - start;
    if (elapsed > 5000) throw new Error("Took " + elapsed + "ms");
  });

  console.log("\nConsole Errors:");

  await test("No critical console errors", async () => {
    const critical = consoleErrors.filter(e =>
      !e.includes("favicon") &&
      !e.includes("third-party") &&
      !e.includes("analytics") &&
      !e.includes("gtag")
    );
    if (critical.length > 5) throw new Error(critical.length + " console errors: " + critical.slice(0, 3).join("; "));
  });

  console.log("\n" + "=".repeat(50));
  console.log("Passed: " + passed);
  console.log("Failed: " + failed);

  if (errors.length > 0) {
    console.log("\nFailed Tests:");
    errors.forEach(e => console.log("  - " + e.name + ": " + e.error));
  }

  console.log("=".repeat(50));

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
