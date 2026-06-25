// Homepage-exemplar capture tool (front-door companion to capture-exemplars.mjs).
//
// docs/exemplars/ holds article-level teardowns — the bar for a single exhibit.
// But ML Lab also has a *homepage* problem: the front door to a whole collection
// of interactive explainers, organized as a knowledge graph. The article set says
// nothing about that, and designing the front door from memory is the exact
// circularity the exemplar discipline exists to kill. This script captures real
// pixels of how comparable front doors work — especially ones that use a
// graph/map/spatial navigation, since "the atlas" is the chosen direction.
//
//   npm run capture:homepages                  # all
//   npm run capture:homepages -- roadmap-sh    # a subset by slug
//
// Output mirrors the article set, under docs/exemplars/homepages/<slug>/:
//   00-viewport.png      above-the-fold at the 1440 big-screen reference
//   01..NN-scroll-*.png  evenly spaced scroll positions
//   full.png             full-page (best effort; skipped if unbounded)
//   meta.json            url, what it teaches us, capture timestamp
//
// External sites are flaky and some block headless or gate behind consent; every
// capture is isolated in try/catch so one failure never sinks the run.

import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 1440, height: 900 };
const OUT_ROOT = "docs/exemplars/homepages";
const SCROLL_STEPS = 4;

// Common cookie/consent dismissers — best effort, never throws. Run before the
// viewport shot so banners don't pollute the above-the-fold frame.
async function dismissConsent(page) {
  const labels = [
    "Accept all", "Accept All", "Accept", "I agree", "Agree",
    "Got it", "Allow all", "Allow All", "OK", "Close",
  ];
  for (const name of labels) {
    try {
      const btn = page.getByRole("button", { name, exact: false }).first();
      if (await btn.count()) {
        await btn.click({ timeout: 1200 });
        await page.waitForTimeout(400);
        return;
      }
    } catch {
      /* ignore */
    }
  }
}

// `concept` ties each to our front-door problem; `teaches` flags what to steal
// for the homepage rework. Keep curated, not exhaustive.
const HOMEPAGES = [
  {
    slug: "roadmap-sh-index",
    title: "roadmap.sh — index of developer roadmaps",
    url: "https://roadmap.sh/",
    concept: "front door to a collection of structured learning graphs",
    teaches: ["catalog hierarchy", "node-graph as the product", "card identity"],
  },
  {
    slug: "roadmap-sh-graph",
    title: "roadmap.sh — AI / Data Scientist roadmap (the graph itself)",
    url: "https://roadmap.sh/ai-data-scientist",
    concept: "a node-graph IS the navigation surface — the atlas pattern, directly",
    teaches: ["graph-as-navigation", "node states (done/learning)", "spatial reading order"],
  },
  {
    slug: "explorables",
    title: "Explorabl.es — explorable explanations directory",
    url: "https://explorabl.es/",
    concept: "curated directory of interactive explainers — our closest kind-of-thing",
    teaches: ["warm curation", "collection framing", "playful editorial voice"],
  },
  {
    slug: "neal-fun",
    title: "neal.fun — index of interactive toys",
    url: "https://neal.fun/",
    concept: "collection-as-front-door done with delight",
    teaches: ["per-item delight", "playful index", "low-ceremony entry"],
  },
  {
    slug: "pudding-home",
    title: "The Pudding — home (visual-essay gallery)",
    url: "https://pudding.cool/",
    concept: "editorial gallery; each story a visually distinct tile",
    teaches: ["thumbnail/card identity", "editorial composition", "browse-first layout"],
  },
  {
    slug: "distill-home",
    title: "Distill — journal index",
    url: "https://distill.pub/",
    concept: "restrained journal index; the credibility register",
    teaches: ["restraint", "typographic index", "let the work be the star"],
  },
  {
    slug: "3b1b-home",
    title: "3Blue1Brown — lessons index",
    url: "https://www.3blue1brown.com/",
    concept: "deep catalog organized by series; thumbnail per lesson",
    teaches: ["catalog-by-series", "thumbnail grid", "wayfinding at scale"],
  },
  {
    slug: "seeing-theory-home",
    title: "Seeing Theory — animated landing",
    url: "https://seeing-theory.brown.edu/",
    concept: "atmospheric, animated front door to a chapter collection",
    teaches: ["atmosphere", "one composed peak", "motion as invitation"],
  },
  {
    slug: "brilliant-home",
    title: "Brilliant — marketing home",
    url: "https://brilliant.org/",
    concept: "live interactive hero + course grid (conversion register)",
    teaches: ["interactive-in-hero", "social proof", "category grid"],
  },
];

const log = [];
const note = (s) => {
  log.push(s);
  console.log(s);
};

const requested = process.argv.slice(2);
const targets = requested.length
  ? HOMEPAGES.filter((e) => requested.includes(e.slug))
  : HOMEPAGES;

if (requested.length && targets.length !== requested.length) {
  const known = HOMEPAGES.map((e) => e.slug).join(", ");
  const missing = requested.filter((r) => !HOMEPAGES.some((e) => e.slug === r));
  console.error(`Unknown homepage slug(s): ${missing.join(", ")}\nKnown: ${known}`);
  process.exit(1);
}

fs.mkdirSync(OUT_ROOT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
});

for (const ex of targets) {
  const dir = path.join(OUT_ROOT, ex.slug);
  fs.mkdirSync(dir, { recursive: true });
  const page = await context.newPage();
  note(`\n[${ex.slug}] ${ex.url}`);

  try {
    await page.goto(ex.url, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(3000).catch(() => {});
    await dismissConsent(page);
    await page.waitForTimeout(600).catch(() => {});

    const shot = async (name) => {
      await page.screenshot({ path: path.join(dir, name) });
      note(`  ✓ ${name}`);
    };

    await shot("00-viewport.png");
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const span = Math.max(0, pageHeight - VIEWPORT.height);
    if (span > 200) {
      for (let i = 1; i <= SCROLL_STEPS; i++) {
        const y = Math.round((span * i) / (SCROLL_STEPS + 1));
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(1000);
        await shot(`0${i}-scroll-${Math.round((100 * i) / (SCROLL_STEPS + 1))}pct.png`);
      }
    } else {
      note(`  · single-screen page (height ${pageHeight}px); no scroll steps`);
    }

    if (pageHeight > 0 && pageHeight < 24000) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(dir, "full.png"), fullPage: true });
      note(`  ✓ full.png (${pageHeight}px)`);
    } else {
      note(`  · full.png skipped (page height ${pageHeight}px out of range)`);
    }

    fs.writeFileSync(
      path.join(dir, "meta.json"),
      JSON.stringify(
        { ...ex, capturedAt: new Date().toISOString(), pageHeight, viewport: VIEWPORT },
        null,
        2,
      ),
    );
  } catch (err) {
    note(`  ✗ FAILED: ${err.message?.split("\n")[0] ?? err}`);
  } finally {
    await page.close();
  }
}

await browser.close();
fs.writeFileSync(path.join(OUT_ROOT, "capture-log.txt"), log.join("\n") + "\n");
note(`\nDONE — log at ${OUT_ROOT}/capture-log.txt`);
