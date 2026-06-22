import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3100";
const OUT = process.env.OUT ?? "/tmp/mllab-current";
const WIDTH = 1440;
const HEIGHT = 900;

const targets = [
  { slug: "linear-regression", name: "linreg" },
  { slug: "gradient-descent", name: "gd" },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

for (const t of targets) {
  const url = `${BASE}/exhibits/${t.slug}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  // Story view (default): viewport + scroll positions
  await page.screenshot({ path: `${OUT}/${t.name}-00-viewport.png` });

  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const steps = [0.12, 0.24, 0.36, 0.48, 0.6];
  let i = 1;
  for (const s of steps) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(scrollHeight * s));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${t.name}-0${i}-scroll-${Math.round(s * 100)}.png` });
    i++;
  }

  // Full story page
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${t.name}-full-story.png`, fullPage: true });

  // Experiment view
  await page.evaluate(() => window.scrollTo(0, 0));
  const expTab = page.getByRole("tab", { name: "Experiment" });
  if (await expTab.count()) {
    await expTab.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/${t.name}-experiment.png` });
  }

  // Math view
  const mathTab = page.getByRole("tab", { name: "Math" });
  if (await mathTab.count()) {
    await mathTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${t.name}-math.png` });
  }
}

// Home
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/home-viewport.png` });

await browser.close();
console.log(`captured to ${OUT}`);
