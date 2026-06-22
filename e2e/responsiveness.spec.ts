import { expect, test, type Page } from "@playwright/test";

/**
 * Responsiveness as a measured quality, not an aspiration (docs/06, A3):
 * Core Web Vitals per route plus a real-interaction latency audit, in CI.
 *
 * - LCP/CLS come from buffered PerformanceObserver entries after a warm
 *   reload (the dev server's first-compile is not what ships; production
 *   output is static).
 * - Interaction latency uses the Event Timing API during an actual drag and
 *   an actual scrub: any input whose input-to-next-paint exceeds the 100ms
 *   perceived-instant threshold is a red-line failure (docs/06, red line 1).
 */

const ROUTES = ["/", "/exhibits/linear-regression", "/exhibits/gradient-descent"];

declare global {
  interface Window {
    __slowEvents: { name: string; duration: number }[];
  }
}

async function gotoWarm(page: Page, route: string) {
  await page.goto(route);
  await page.reload();
}

test.describe("core web vitals", () => {
  for (const route of ROUTES) {
    test(`vitals: ${route} meets LCP < 2.5s and CLS < 0.1`, async ({ page }) => {
      await gotoWarm(page, route);

      const lcp = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let latest = -1;
            new PerformanceObserver((list) => {
              for (const e of list.getEntries()) latest = e.startTime;
            }).observe({ type: "largest-contentful-paint", buffered: true });
            // LCP settles once input or time ends the observation window.
            setTimeout(() => resolve(latest), 1500);
          }),
      );
      expect(lcp, "an LCP entry must exist").toBeGreaterThan(0);
      expect(lcp).toBeLessThan(2500);

      const cls = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let total = 0;
            new PerformanceObserver((list) => {
              for (const e of list.getEntries()) {
                const shift = e as PerformanceEntry & {
                  value: number;
                  hadRecentInput: boolean;
                };
                if (!shift.hadRecentInput) total += shift.value;
              }
            }).observe({ type: "layout-shift", buffered: true });
            setTimeout(() => resolve(total), 1500);
          }),
      );
      expect(cls).toBeLessThan(0.1);
    });
  }
});

test.describe("interaction latency", () => {
  const observeSlowEvents = async (page: Page) => {
    await page.addInitScript(() => {
      window.__slowEvents = [];
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__slowEvents.push({ name: e.name, duration: e.duration });
        }
        // 24ms floor: the API's minimum reporting threshold region — we
        // only care about entries approaching the 100ms red line.
      }).observe({ type: "event", durationThreshold: 24 });
    });
  };

  test("dragging a data point never blows the 100ms budget", async ({ page }) => {
    await observeSlowEvents(page);
    await page.goto("/exhibits/linear-regression");

    const point = page.locator("svg circle").first();
    await point.scrollIntoViewIfNeeded();
    const box = (await point.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // A long, busy drag: 40 move events across the plot and back.
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(box.x + 150 + i * 8, box.y - 60 - i * 4);
    }
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(box.x + 300 - i * 10, box.y - 140 + i * 6);
    }
    await page.mouse.up();

    const slow = await page.evaluate(() =>
      window.__slowEvents.filter(
        (e) => e.name.startsWith("pointer") || e.name.startsWith("mouse"),
      ),
    );
    const worst = Math.max(0, ...slow.map((e) => e.duration));
    expect(worst, JSON.stringify(slow)).toBeLessThan(100);
  });

  test("scrubbing the descent never blows the 100ms budget", async ({ page }) => {
    await observeSlowEvents(page);
    await page.goto("/exhibits/gradient-descent");

    // The rich transport (Step ×10, the surface toggle) lives in the Experiment
    // sandbox, not the guided Story. Build a real trace there, reveal the surface
    // (the heaviest synced view), then scrub through the whole run.
    await page.getByRole("tab", { name: "Experiment" }).click();
    // The guided Story keeps its own scrub mounted (hidden), so scope to the
    // visible Experiment panel.
    const panel = page.getByRole("tabpanel", { includeHidden: false });
    for (let i = 0; i < 5; i++) {
      await panel.getByRole("button", { name: "Step ×10" }).click();
    }
    await panel.getByRole("button", { name: "The surface", exact: true }).click();
    const scrub = panel.getByLabel("Scrub through descent steps");
    await scrub.scrollIntoViewIfNeeded();
    for (const v of ["0", "13", "25", "37", "50", "25", "0", "50"]) {
      await scrub.fill(v);
    }

    const slow = await page.evaluate(() =>
      window.__slowEvents.filter((e) => e.name === "input" || e.name === "change"),
    );
    const worst = Math.max(0, ...slow.map((e) => e.duration));
    expect(worst, JSON.stringify(slow)).toBeLessThan(100);
  });
});
