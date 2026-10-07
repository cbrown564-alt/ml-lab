import type { NextConfig } from "next";

const staticExport = process.env.CF_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Review entry points use .dev.ts(x): keep the filesystem-backed workbench
  // in local/Next development, and exclude its routes from the static export.
  pageExtensions: staticExport
    ? ["tsx", "ts", "jsx", "js"]
    : ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"],
  ...(staticExport ? { output: "export", images: { unoptimized: true } } : {}),
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
