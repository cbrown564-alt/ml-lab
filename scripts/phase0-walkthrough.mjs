// Review walkthrough driver (first used for the Phase 0 exit review).
// Drives a running production build (npm start -- -p 4173) like a
// first-time visitor, captures screenshots + aria snapshots into
// docs/reviews/phase0-walkthrough/, and logs a friction inventory.
// Re-run at future release reviews alongside the human walkthroughs.
import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = "http://localhost:4173";
const OUT = "docs/reviews/phase0-walkthrough";
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const note = (s) => {
  log.push(s);
  console.log(s);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// ---- 1. Cold landing -------------------------------------------------------
const t0 = Date.now();
await page.goto(BASE, { waitUntil: "networkidle" });
note(`[home] loaded in ${Date.now() - t0}ms (networkidle, cold)`);
await page.screenshot({ path: `${OUT}/01-home-above-fold.png` });
await page.screenshot({ path: `${OUT}/02-home-full.png`, fullPage: true });

const heroText = await page.locator("h1").first().textContent();
note(`[home] h1: "${heroText?.trim()}"`);
const heroPara = await page.locator("main p").first().textContent();
note(`[home] first paragraph: "${heroPara?.trim().slice(0, 220)}"`);

// What can a cold user click above the fold?
const links = await page.locator("a[href^='/exhibits']").all();
note(`[home] exhibit links on page: ${links.length}`);

// ---- 2. Landing -> manipulating (click budget <= 3) ------------------------
const t1 = Date.now();
await page
  .locator("a[href='/exhibits/linear-regression']")
  .first()
  .click(); // click 1
await page.waitForLoadState("networkidle");
note(`[flow] click 1: home -> linear-regression exhibit`);
await page.screenshot({ path: `${OUT}/03-linreg-above-fold.png` });

// hydration sentinel: the lab is interactive when a data point is focusable
await page.locator("[data-testid='mastery-badge']").waitFor();
const point = page.locator("circle[tabindex='0']").first();
await point.waitFor();
const box = await point.boundingBox();
// drag = the first manipulation (counts as "manipulating", not a click)
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + 60, box.y - 80, { steps: 12 });
await page.mouse.up();
note(
  `[flow] manipulating (dragged a data point) ${Date.now() - t1}ms after leaving home; total clicks: 1`
);
await page.screenshot({ path: `${OUT}/04-linreg-after-drag.png` });

// ---- 3. Orientation on the exhibit page ------------------------------------
const kicker = await page.locator("main").getByText(/Foundations/i).count();
note(`[orientation] journey references on linreg page: ${kicker}`);
const buildsOn = await page.getByText(/Builds on/i).count();
const leadsTo = await page.getByText(/Leads to/i).count();
note(`[orientation] graph neighborhood blocks: builds-on=${buildsOn} leads-to=${leadsTo}`);

// ---- 4. The tyranny scenario (peak moment) ---------------------------------
await page.getByRole("button", { name: /tyranny/i }).click();
await page.waitForTimeout(700); // let the morph settle
await page.screenshot({ path: `${OUT}/05-linreg-tyranny-squares.png` });
note(`[linreg] tyranny scenario selected; residual squares staged`);

// full page for the lineup
await page.screenshot({ path: `${OUT}/06-linreg-full.png`, fullPage: true });

// ---- 5. Aria snapshot of the experiment (screen-reader audit) --------------
const linregAria = await page.locator("main").ariaSnapshot();
fs.writeFileSync(`${OUT}/linreg-aria.yaml`, linregAria);
note(`[a11y] linreg aria snapshot written (${linregAria.length} chars)`);

// ---- 6. Gradient descent ----------------------------------------------------
await page.goto(`${BASE}/exhibits/gradient-descent`, { waitUntil: "networkidle" });
await page.locator("[data-testid='mastery-badge']").waitFor();
await page.screenshot({ path: `${OUT}/07-gd-above-fold.png` });

// play some descent
await page.getByRole("button", { name: /^play$/i }).click();
await page.waitForTimeout(1200);
await page.getByRole("button", { name: /pause/i }).click();
note(`[gd] played and paused the descent`);

// lift the fog
const fog = page.getByRole("button", { name: /lift the fog/i });
if ((await fog.count()) > 0) {
  await fog.click();
  await page.waitForTimeout(900);
  note(`[gd] loss surface revealed`);
}
await page.screenshot({ path: `${OUT}/08-gd-loss-surface.png` });
await page.screenshot({ path: `${OUT}/09-gd-full.png`, fullPage: true });

const gdAria = await page.locator("main").ariaSnapshot();
fs.writeFileSync(`${OUT}/gd-aria.yaml`, gdAria);
note(`[a11y] gd aria snapshot written (${gdAria.length} chars)`);

// ---- 7. Dead-end check: page bottom offers onward movement ------------------
await page.keyboard.press("End");
await page.waitForTimeout(300);
const onward = await page.locator("a[href^='/exhibits'], a[href='/']").count();
note(`[flow] onward links present at gd page bottom region: ${onward}`);

// ---- 8. Keyboard-only manipulation spot check -------------------------------
await page.goto(`${BASE}/exhibits/linear-regression`, { waitUntil: "networkidle" });
await page.locator("[data-testid='mastery-badge']").waitFor();
const kbPoint = page.locator("circle[tabindex='0']").first();
await kbPoint.focus();
const before = await kbPoint.getAttribute("cy");
await page.keyboard.press("ArrowUp");
await page.keyboard.press("ArrowUp");
const after = await kbPoint.getAttribute("cy");
note(
  `[a11y] keyboard moved a focused point: cy ${before} -> ${after} (${before !== after ? "WORKS" : "FAILED"})`
);

fs.writeFileSync(`${OUT}/walkthrough-log.txt`, log.join("\n"));
await browser.close();
console.log("DONE");
