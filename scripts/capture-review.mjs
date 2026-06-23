// Review capture pipeline (docs/08 Part 2) — the standard per-act contact sheet.
//
// Replaces the ad-hoc capture-current.mjs (2 hardcoded slugs, stale tab names)
// with a per-exhibit review artifact the `/review` UI and the agent panel both
// read. For each exhibit, at the 1440px big-screen reference, it captures:
//   hero.png            the opening frame (masthead/hero — opening grammar)
//   see-*.png           See it: viewport + the spine, full page
//   run|break|explain   each act's viewport + full page (acts switched live)
// and writes a manifest.json pairing every frame with its benchmark exemplar
// frame (docs/exemplars), so the side-by-side comparison is on pinned pixels.
// The homepage is captured once into the `_home` pseudo-exhibit.
//
//   npm run dev -- --port 3100                 # in one terminal
//   npm run capture:review                     # all live exhibits + home
//   npm run capture:review -- linear-regression gradient-descent
//
// Output: docs/reviews/captures/<exhibit>/<YYYY-MM-DD>/

import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3100";
const VIEWPORT = { width: 1440, height: 900 };
const DATE = new Date().toISOString().slice(0, 10);
const CAPTURES_ROOT = path.join("docs", "reviews", "captures");

// The four-act spine, by the accessible name of its tab (substring match).
const ACTS = [
  { id: "see", tab: null }, // default act, no click
  { id: "run", tab: "Run it" },
  { id: "break", tab: "Break it" },
  { id: "explain", tab: "Explain it" },
];

// Default benchmark frame per surface (docs/exemplars/SYNTHESIS.md). The reviewer
// can override per sub-score in the UI; the lineup is never unpaired.
const SURFACE_PAIRING = {
  hero: "ciechanowski-watch/00-viewport.png",
  see: "r2d3-trees/00-viewport.png",
  run: "tensorflow-playground/00-viewport.png",
  break: "seeing-theory-regression/02-ols-anscombe-3-outlier.png",
  explain: "ncase-trust/00-viewport.png",
  home: "pudding-dialogue/00-viewport.png",
};

// Foundations journey order (content/journeys/foundations.ts) — the default set,
// in journey order so the cluster lineup reads first-node-first.
const FOUNDATIONS = [
  "what-is-ml",
  "the-dataset",
  "regression-task",
  "linear-regression",
  "loss-functions",
  "gradient-descent",
  "feature-scaling",
  "train-test-generalization",
  "bias-variance",
  "data-leakage",
  "overfitting-regularization",
  "classification-task",
  "logistic-regression",
  "neural-network-fundamentals",
  "the-gradient",
];

const slugs = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = slugs.length ? slugs : FOUNDATIONS;

function outDir(exhibit) {
  const dir = path.join(CAPTURES_ROOT, exhibit, DATE);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** docs-relative path used in the manifest and by the frame route handler. */
function docsRel(absOrDocsPath) {
  return path.relative("docs", absOrDocsPath);
}

async function reachable() {
  try {
    const res = await fetch(BASE, { method: "HEAD" });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Put the act's tab bar just under the top of the viewport so the viewport
 * screenshot frames the ACT PANEL — not the hero/masthead above it (which is
 * captured separately as hero.png). Playwright scrolls the tab into view to
 * click it; a naive scrollTo(0,0) undoes that and re-shoots the hero, which is
 * exactly why hero nodes' act frames used to duplicate the hero. Falls back to
 * the page top for any exhibit with no tablist.
 */
async function frameAct(page) {
  const anchored = await page.evaluate(() => {
    const tl = document.querySelector('[role="tablist"]');
    if (!tl) return false;
    const top = tl.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, Math.round(top - 16)));
    return true;
  });
  if (!anchored) await page.evaluate(() => window.scrollTo(0, 0));
}

async function captureExhibit(page, exhibit, log) {
  const dir = outDir(exhibit);
  const frames = [];
  const push = (file, surface, label) =>
    frames.push({ file: docsRel(file), surface, label, exemplar: SURFACE_PAIRING[surface] });

  await page.goto(`${BASE}/exhibits/${exhibit}`, { waitUntil: "networkidle" });
  // Long enough for a hero's one explanatory load motion to settle (e.g. the
  // gradient-descent path eases in over ~1.3s), so the still is the at-rest poster
  // the rubric judges, not a mid-animation frame.
  await page.waitForTimeout(1600);

  // The opening frame — the masthead/hero, the "opening grammar" the lineup judges.
  const hero = path.join(dir, "hero.png");
  await page.screenshot({ path: hero, clip: { x: 0, y: 0, width: VIEWPORT.width, height: 560 } });
  push(hero, "hero", "Opening frame (masthead / hero)");

  for (const act of ACTS) {
    if (act.tab) {
      const tab = page.getByRole("tab", { name: act.tab });
      if (!(await tab.count())) {
        log.push(`  · ${exhibit}: no "${act.tab}" tab — skipped`);
        continue;
      }
      await tab.first().click();
      await page.waitForTimeout(650);
    }
    // Bring the act's panel into frame, then capture viewport + full page.
    await frameAct(page);
    await page.waitForTimeout(150);
    const vp = path.join(dir, `${act.id}-viewport.png`);
    await page.screenshot({ path: vp });
    push(vp, act.id, `${act.id} — viewport`);

    if (act.id === "see") {
      // The spine is the See-it main event; scroll it under the masthead.
      await page.evaluate(() => window.scrollTo(0, Math.round(document.body.scrollHeight * 0.45)));
      await page.waitForTimeout(400);
      const spine = path.join(dir, "see-spine.png");
      await page.screenshot({ path: spine });
      push(spine, "see", "See it — the spine");
    }

    const full = path.join(dir, `${act.id}-full.png`);
    await page.screenshot({ path: full, fullPage: true });
    push(full, act.id, `${act.id} — full page`);
  }

  const manifest = { exhibit, date: DATE, reference: VIEWPORT, frames };
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  log.push(`  ✓ ${exhibit}: ${frames.length} frames`);
}

async function captureHome(page, log) {
  const dir = outDir("_home");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const vp = path.join(dir, "home-viewport.png");
  await page.screenshot({ path: vp });
  const full = path.join(dir, "home-full.png");
  await page.screenshot({ path: full, fullPage: true });
  const frames = [
    { file: docsRel(vp), surface: "home", label: "Homepage — above the fold", exemplar: SURFACE_PAIRING.home },
    { file: docsRel(full), surface: "home", label: "Homepage — full", exemplar: SURFACE_PAIRING.home },
  ];
  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    JSON.stringify({ exhibit: "_home", date: DATE, reference: VIEWPORT, frames }, null, 2) + "\n",
  );
  log.push(`  ✓ _home: ${frames.length} frames`);
}

if (!(await reachable())) {
  console.error(
    `✖ dev server not reachable at ${BASE}.\n  Start it first:  npm run dev -- --port 3100\n  (or set BASE=… to point elsewhere)`,
  );
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });
const log = [];

for (const exhibit of targets) {
  try {
    await captureExhibit(page, exhibit, log);
  } catch (err) {
    log.push(`  ✖ ${exhibit}: ${err.message}`);
  }
}
if (!slugs.length) {
  try {
    await captureHome(page, log);
  } catch (err) {
    log.push(`  ✖ _home: ${err.message}`);
  }
}

await browser.close();
console.log(`Review captures → ${CAPTURES_ROOT}/<exhibit>/${DATE}/\n${log.join("\n")}`);
