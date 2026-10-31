// VESTIGE prototype acceptance checks — the "definition of done" from the production blueprint.
// Runs against a production build: `npm run build && npm run e2e`.
// Starts `next start` on a free port, drives Chromium through each check, then stops it.
// Set SCREENSHOTS=<dir> to save a screenshot of each scene.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const { chromium } = createRequire(import.meta.url)("playwright");
const PORT = Number(process.env.PORT ?? 3217);
const BASE = `http://127.0.0.1:${PORT}`;
const SHOTS = process.env.SCREENSHOTS;

const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1" };
for (const k of Object.keys(env)) if (k.startsWith("GIT_")) delete env[k];
const server = spawn("npx", ["next", "start", "-p", String(PORT)], { env, stdio: ["ignore", "pipe", "pipe"] });
let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push([true, name]);
  } catch (e) {
    results.push([false, name, e.message.split("\n")[0]]);
  }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); };

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start:\n" + serverLog);
}

const filmProgress = (page) => page.$eval(".scroll-film", (el) => Number(el.dataset.progress));
const imageTransform = (page) => page.$eval(".scroll-film .framed-image", (el) => el.style.transform);
const settle = (page) => page.waitForTimeout(900);

let browser;
try {
  if (SHOTS) await mkdir(SHOTS, { recursive: true });
  await waitForServer();
  browser = await chromium.launch();

  for (const device of [
    { name: "desktop", viewport: { width: 1440, height: 900 } },
    { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  ]) {
    const ctx = await browser.newContext(device);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await check(`[${device.name}] 1. the cinematic intro can be skipped immediately`, async () => {
      await page.goto(BASE);
      const skip = page.getByRole("button", { name: "Skip intro" });
      await skip.waitFor({ timeout: 3000 });
      await page.waitForTimeout(1500);
      await shot(page, `${device.name}-01-intro-line`);
      await skip.click();
      await page.getByRole("heading", { name: "What Remains" }).waitFor({ timeout: 3000 });
    });

    await check(`[${device.name}] 2. the entrance works`, async () => {
      await page.evaluate(() => sessionStorage.clear());
      await page.goto(BASE);
      await page.waitForTimeout(8200);
      await shot(page, `${device.name}-02-intro-wordmark`);
      await page.getByRole("button", { name: "Enter the museum" }).click();
      await page.getByRole("link", { name: "Begin the exhibition" }).waitFor({ timeout: 4000 });
      await page.waitForTimeout(2600);
      await shot(page, `${device.name}-03-hall`);
    });

    await check(`[${device.name}] 3–4. the gallery can be entered and explored without the guided journey`, async () => {
      await page.getByRole("link", { name: "Explore the museum" }).click();
      await page.getByRole("heading", { name: /Gallery I/ }).waitFor();
      await page.waitForTimeout(2300);
      await shot(page, `${device.name}-04-gallery`);
      const destinations = await page.getByRole("navigation", { name: "Destinations in this gallery" }).textContent();
      assert(destinations.includes("The Feeling") && destinations.includes("Entrance hall"), "destinations missing");
    });

    await check(`[${device.name}] 5. the artwork opens through an approach, not a cut`, async () => {
      await page.getByRole("navigation", { name: "Destinations in this gallery" }).getByRole("link", { name: "The Last Witness" }).click();
      await page.waitForTimeout(700);
      assert(await page.$eval(".gallery", (el) => el.dataset.approaching === "true"), "no approach animation");
      await shot(page, `${device.name}-05-approach`);
      await page.waitForURL(/\/artwork\/the-last-witness/, { timeout: 5000 });
      await page.waitForSelector(".scroll-film");
      await settle(page);
      await shot(page, `${device.name}-06-film-start`);
    });

    await check(`[${device.name}] 6–8. scroll advances, stopping holds, scrolling back retraces`, async () => {
      const travel = await page.evaluate(() => document.querySelector(".scroll-film").offsetHeight - innerHeight);
      const at = async (p) => { await page.evaluate((y) => window.scrollTo(0, y), Math.round(travel * p)); await settle(page); };
      await at(0.3);
      const p30 = await filmProgress(page);
      const t30 = await imageTransform(page);
      await shot(page, `${device.name}-07-film-30`);
      assert(Math.abs(p30 - 0.3) < 0.01, `progress ${p30} at 30% scroll`);
      await page.waitForTimeout(800);
      assert((await imageTransform(page)) === t30, "frame drifted while scroll was held");
      await at(0.5);
      await shot(page, `${device.name}-08-film-50`);
      await at(0.08);
      await shot(page, `${device.name}-09-film-08`);
      await at(0.3);
      assert((await imageTransform(page)) === t30, "returning to 30% did not retrace to the same frame");
      await at(1);
      assert((await filmProgress(page)) > 0.99, "film did not reach the end");
      await page.getByRole("button", { name: "Return to the gallery" }).waitFor({ state: "visible" });
      await shot(page, `${device.name}-10-film-end`);
    });

    await check(`[${device.name}] 9. the artwork is not altered — only the camera moves`, async () => {
      const filters = await page.$$eval(".scroll-film .framed-image img", (imgs) => imgs.map((i) => getComputedStyle(i).filter));
      assert(filters.every((f) => f === "none"), "an effect is applied to the artwork image");
      const src = await page.$eval(".scroll-film .framed-image img", (i) => new URL(i.src).pathname);
      assert(/\/artworks\/the-last-witness\/(master|mobile)\.jpg$/.test(src), `unexpected source ${src}`);
    });

    await check(`[${device.name}] 11. context and credits are accessible, and Escape closes them`, async () => {
      await page.getByRole("button", { name: "About this work" }).first().click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      const text = await dialog.textContent();
      assert(text.includes("Creative premise") && text.includes("Interpretation") && text.includes("Sources and credits"), "record incomplete");
      assert(text.includes("placeholder"), "placeholder master is not disclosed");
      await page.waitForTimeout(500);
      await shot(page, `${device.name}-11-interpretation`);
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert(page.url().includes("/artwork/"), "Escape left the artwork instead of closing the panel");
    });

    await check(`[${device.name}] 10. the visitor can exit and return to the gallery they came from`, async () => {
      await page.keyboard.press("Escape");
      await page.waitForURL(/\/explore$/, { timeout: 5000 });
      await page.getByRole("heading", { name: /Gallery I/ }).waitFor();
    });

    await check(`[${device.name}] 12. reduced motion shows the journey as stills, with no pinned film`, async () => {
      const rm = await browser.newContext({ ...device, reducedMotion: "reduce" });
      const p = await rm.newPage();
      await p.goto(`${BASE}/artwork/the-last-witness`);
      await p.waitForSelector(".still-sequence");
      assert((await p.$(".scroll-film")) === null, "pinned film rendered under reduced motion");
      assert((await p.$$(".still-sequence li")).length === 5, "expected five stills");
      await p.goto(BASE);
      await p.getByRole("button", { name: "Enter the museum" }).waitFor({ timeout: 2000 });
      await p.waitForTimeout(400);
      await shot(p, `${device.name}-12-reduced`);
      await rm.close();
    });

    await check(`[${device.name}] the guided journey and the collection work`, async () => {
      await page.goto(`${BASE}/journey/what-remains`);
      await page.getByRole("heading", { name: "What Remains", level: 1 }).waitFor();
      await shot(page, `${device.name}-13-journey`);
      assert((await page.$$(".chapter")).length === 4, "expected four chapters");
      await page.goto(`${BASE}/collection`);
      await page.getByRole("searchbox").fill("memory");
      await page.getByRole("heading", { name: "The Last Witness" }).waitFor();
      await shot(page, `${device.name}-14-collection`);
      await page.getByRole("searchbox").fill("zzzz");
      await page.getByText("0 works").waitFor();
    });

    await check(`[${device.name}] no uncaught page errors`, async () => {
      assert(errors.length === 0, errors.join(" | "));
    });
    await ctx.close();
  }

  await check("a crafted ?from= cannot send the visitor off-site", async () => {
    const page = await browser.newPage();
    await page.goto(`${BASE}/artwork/the-last-witness?from=//example.com`);
    await page.waitForSelector(".scroll-film");
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForURL(/127\.0\.0\.1.*\/explore$/, { timeout: 5000 });
  });
} finally {
  await browser?.close();
  server.kill();
}

let failed = 0;
for (const [ok, name, why] of results) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${why ? `\n      ${why}` : ""}`);
  if (!ok) failed++;
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
