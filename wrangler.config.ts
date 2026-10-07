import { defineWranglerConfig } from "wrangler/experimental-config";

// cf's build delegate packages the prebuilt static export.
export default defineWranglerConfig({ assetsDirectory: "./out" });
