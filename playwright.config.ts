import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      // SVG rendering and font rasterization wobble slightly across runs.
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /responsiveness/,
      use: {
        ...devices["Desktop Chrome"],
        // Big-screen native (docs/01-vision.md): test at the design target.
        // Must come after the device spread — Desktop Chrome carries its own
        // 1280×720 viewport that would otherwise win.
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      // Measurements need a quiet server: the perf project runs serially,
      // after the functional suite has finished hammering the dev server.
      name: "perf",
      testMatch: /responsiveness/,
      dependencies: ["chromium"],
      fullyParallel: false,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
