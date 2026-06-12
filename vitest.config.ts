import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirror tsconfig paths — vitest doesn't read them on its own.
    alias: {
      "@content": path.resolve(__dirname, "content"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    // e2e/ is Playwright's territory (npm run test:e2e).
    exclude: ["e2e/**", "node_modules/**"],
  },
});
