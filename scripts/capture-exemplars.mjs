// Exemplar capture tool (docs/06 quality foundation, Stream 1).
//
// The benchmark set named in docs/06 (Distill, R2D3, Seeing Theory, 3Blue1Brown,
// TensorFlow Playground, Ciechanowski, The Pudding, Nicky Case) is the bar every
// Pillar-B review claims to measure against. Until now that comparison was made
// from memory — unanchored and unfalsifiable, which is how a clean-but-plain
// exhibit scored "matches the benchmark". This script captures real pixels of
// those treatments into docs/exemplars/ so reviews compare artifact-to-artifact.
//
//   npm run capture:exemplars            # all exemplars
//   npm run capture:exemplars -- distill-momentum r2d3-trees   # a subset
//
// Captures, per exemplar, at our 1440-wide big-screen reference viewport:
//   00-viewport.png      the above-the-fold frame
//   01..NN-scroll-*.png  evenly spaced scroll positions (how graphics rebuild)
//   full.png             full-page (best effort; skipped if the page is unbounded)
//
// External sites are flaky and some block headless browsers; every capture is
// isolated in try/catch so one failure never sinks the run. A capture log lands
// at docs/exemplars/capture-log.txt with what succeeded, what didn't, and why.

import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const VIEWPORT = { width: 1440, height: 900 };
const OUT_ROOT = "docs/exemplars";
const SCROLL_STEPS = 4; // intermediate scroll positions for scroll-driven pieces

// The exemplar set. `concept` ties each to our territory; `criteria` flags the
// Pillar-B dimensions it is meant to teach us about (see the teardown template
// in docs/exemplars/README.md). Keep this list curated, not exhaustive.
const EXEMPLARS = [
  {
    slug: "distill-momentum",
    title: "Distill — Why Momentum Really Works",
    url: "https://distill.pub/2017/momentum/",
    concept: "gradient descent / loss-surface conditioning",
    criteria: ["B2 composed graphics", "B3 motion", "interactive-in-prose"],
  },
  {
    slug: "r2d3-trees",
    title: "R2D3 — A Visual Introduction to Machine Learning, Part 1",
    url: "http://www.r2d3.us/visual-intro-to-machine-learning-part-1/",
    // Origin sits behind Cloudflare and was returning 522 at capture time;
    // the Internet Archive keeps a faithful snapshot. The `if_` suffix serves
    // the raw page without the archive toolbar chrome.
    fallbackUrl:
      "https://web.archive.org/web/2023if_/http://www.r2d3.us/visual-intro-to-machine-learning-part-1/",
    concept: "decision trees, train/test, overfitting",
    criteria: ["B1 guided discovery", "B2 full-bleed scrollytelling", "B4 orchestration"],
  },
  {
    slug: "seeing-theory-regression",
    title: "Seeing Theory — Regression Analysis",
    url: "https://seeing-theory.brown.edu/regression-analysis/index.html",
    concept: "least squares, residuals (our closest single-concept rival)",
    criteria: ["B1 manipulation", "B3 motion"],
    // Seeing Theory scroll-jacks: its viz sections are position:fixed and
    // visibility:hidden until a nav card is clicked, and the plot stays empty
    // until a dataset is chosen. Drive it like a user instead of scrolling.
    capture: async (page, shot) => {
      await shot("00-index.png"); // the chapter landing (visual-register ref)
      await page.locator("#one").click(); // → Ordinary Least Squares section
      await page.waitForTimeout(1500);
      // Anscombe's Quartet: I is a clean linear fit; III is one outlier bending
      // the line; IV is the vertical-x pathology — the same failure pedagogy as
      // our linear-regression "tyranny of the outlier" scenario.
      for (const [value, name] of [
        ["0", "01-ols-anscombe-1.png"],
        ["2", "02-ols-anscombe-3-outlier.png"],
        ["3", "03-ols-anscombe-4-pathology.png"],
      ]) {
        await page.locator(`input[name="ols"][value="${value}"]`).check({ force: true });
        await page.waitForTimeout(1200);
        await shot(name);
      }
      await page.locator("#two").click(); // → Correlation section
      await page.waitForTimeout(1500);
      for (const sp of ["setosa", "versicolor", "virginica"]) {
        await page
          .locator(`input[name="correlation"][value="${sp}"]`)
          .check({ force: true })
          .catch(() => {});
      }
      await page.waitForTimeout(1200);
      await shot("04-correlation.png");
    },
  },
  {
    slug: "3b1b-gradient-descent",
    title: "3Blue1Brown — Gradient descent, how neural networks learn",
    url: "https://www.3blue1brown.com/lessons/gradient-descent",
    concept: "gradient descent, cinematic explanation",
    criteria: ["B6 delight", "B2 composition", "narrative clarity"],
  },
  {
    slug: "tensorflow-playground",
    title: "TensorFlow Playground",
    url: "https://playground.tensorflow.org/",
    concept: "live neural-network training, dense control surface",
    criteria: ["B1 manipulation", "B3 live motion", "A5 dense-but-calm shell"],
  },
  {
    slug: "ciechanowski-watch",
    title: "Bartosz Ciechanowski — Mechanical Watch",
    url: "https://ciechanow.ski/mechanical-watch/",
    concept: "full-bleed canvas atmosphere, the poster-worthy bar",
    criteria: ["B2 poster-worthy", "B3 motion", "A5 shell beauty"],
  },
  {
    slug: "pudding-dialogue",
    title: "The Pudding — Film Dialogue",
    url: "https://pudding.cool/2017/03/film-dialogue/",
    concept: "editorial data scrollytelling, type & layout",
    criteria: ["B2 editorial composition", "B4 orchestration", "A5 shell beauty"],
  },
  {
    slug: "ncase-trust",
    title: "Nicky Case — The Evolution of Trust",
    url: "https://ncase.me/trust/",
    concept: "explorable game, assessment-as-play",
    criteria: ["B1 guided discovery", "B5 assessment-as-play", "B6 delight"],
  },
];

const log = [];
const note = (s) => {
  log.push(s);
  console.log(s);
};

const requested = process.argv.slice(2);
const targets = requested.length
  ? EXEMPLARS.filter((e) => requested.includes(e.slug))
  : EXEMPLARS;

if (requested.length && targets.length !== requested.length) {
  const known = EXEMPLARS.map((e) => e.slug).join(", ");
  const missing = requested.filter((r) => !EXEMPLARS.some((e) => e.slug === r));
  console.error(`Unknown exemplar slug(s): ${missing.join(", ")}\nKnown: ${known}`);
  process.exit(1);
}

fs.mkdirSync(OUT_ROOT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
  // A real desktop UA — some benchmark hosts serve a degraded page to headless.
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
    // Settle: scroll-driven and canvas sites keep painting after `load`.
    await page.waitForTimeout(3500).catch(() => {});

    // Origin down? Some hosts (Cloudflare 5xx, etc.) serve a tiny error page.
    // Fall back to an archived snapshot when the entry provides one.
    const looksBroken = await page.evaluate(() => {
      const t = (document.body?.innerText ?? "").slice(0, 600);
      return /error code 5\d\d|connection timed out|502 bad gateway|temporarily unavailable/i.test(t);
    });
    if (looksBroken && ex.fallbackUrl) {
      note(`  · origin looks down — falling back to archive`);
      await page.goto(ex.fallbackUrl, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(4000).catch(() => {});
    }

    const shot = async (name) => {
      await page.screenshot({ path: path.join(dir, name) });
      note(`  ✓ ${name}`);
    };

    let pageHeight = null;
    if (typeof ex.capture === "function") {
      // Bespoke driver for sites that scroll-jack or hide content behind
      // interaction (the default scroll loop can't reveal those).
      await ex.capture(page, shot);
    } else {
      // Default: above-the-fold frame + evenly spaced scroll positions —
      // captures how a scroll-driven graphic rebuilds as the narrative advances
      // (the move our document-column template doesn't make).
      await shot("00-viewport.png");
      pageHeight = await page.evaluate(() => document.body.scrollHeight);
      const span = Math.max(0, pageHeight - VIEWPORT.height);
      if (span > 200) {
        for (let i = 1; i <= SCROLL_STEPS; i++) {
          const y = Math.round((span * i) / (SCROLL_STEPS + 1));
          await page.evaluate((yy) => window.scrollTo(0, yy), y);
          await page.waitForTimeout(1200);
          await shot(`0${i}-scroll-${Math.round((100 * i) / (SCROLL_STEPS + 1))}pct.png`);
        }
      } else {
        note(`  · single-screen page (height ${pageHeight}px); no scroll steps`);
      }

      // Full page, best effort — skip absurdly tall canvas pages that would
      // produce a multi-hundred-MB image or time out.
      if (pageHeight > 0 && pageHeight < 24000) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(dir, "full.png"), fullPage: true });
        note(`  ✓ full.png (${pageHeight}px)`);
      } else {
        note(`  · full.png skipped (page height ${pageHeight}px out of range)`);
      }
    }

    // Record what was captured for the teardown author.
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
