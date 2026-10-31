// Rasterises the placeholder master (tools/the-last-witness.svg) into the delivery files:
//   master.jpg  4096×2304 — the desktop film source
//   mobile.jpg  2048×1152 — the mobile film source
//   detail.jpg  3× density tile over the bust, for the close-up shots
// Usage: npm run render:master   (uses the pre-installed Playwright Chromium)
import { createRequire } from "node:module";
import { readFile, mkdir } from "node:fs/promises";
// Playwright is pre-installed globally rather than a project dependency; resolve it via require.
const { chromium } = createRequire(import.meta.url)("playwright");
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "public/artworks/the-last-witness");
const svg = await readFile(path.join(root, "tools/the-last-witness.svg"), "utf8");

// Must match media.detail.region in data/artworks.ts.
const DETAIL = { x: 1750, y: 480, size: 1100, density: 3 };

const withView = (viewBox, w, h) =>
  svg.replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}">`);

const jobs = [
  { file: "master.jpg", w: 4096, h: 2304, markup: withView("0 0 4096 2304", 4096, 2304), quality: 86 },
  { file: "mobile.jpg", w: 2048, h: 1152, markup: withView("0 0 4096 2304", 2048, 1152), quality: 82 },
  {
    file: "detail.jpg",
    w: DETAIL.size * DETAIL.density,
    h: DETAIL.size * DETAIL.density,
    markup: withView(`${DETAIL.x} ${DETAIL.y} ${DETAIL.size} ${DETAIL.size}`, DETAIL.size * DETAIL.density, DETAIL.size * DETAIL.density),
    quality: 84,
  },
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: job.w, height: job.h } });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">${job.markup}</body></html>`);
  const shot = () =>
    page.screenshot({ path: path.join(out, job.file), type: "jpeg", quality: job.quality, clip: { x: 0, y: 0, width: job.w, height: job.h } });
  // Large filtered captures occasionally fail in headless Chromium; one retry clears it.
  await shot().catch(async () => {
    await page.waitForTimeout(500);
    await shot();
  });
  await page.close();
  console.log(`rendered ${job.file} ${job.w}×${job.h}`);
}
await browser.close();
