import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // e2e/ is Playwright's territory (npm run test:e2e).
    exclude: ["e2e/**", "node_modules/**"],
  },
});
