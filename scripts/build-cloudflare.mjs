import { spawnSync } from "node:child_process";
import { writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "migration-preview";
if (!["production", "migration-preview"].includes(mode)) {
  throw new Error(`Unknown mode: ${mode}`);
}
// npm run build retains the existing graph and strict human-review checks.
const build = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  env: { ...process.env, CF_STATIC_EXPORT: "1" },
});
if (build.status !== 0) process.exit(build.status ?? 1);

writeFileSync("out/_headers", `${mode === "migration-preview" ? "/*\n  X-Robots-Tag: noindex, nofollow\n\n" : ""}/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
let files = 0;
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else {
      if (statSync(file).size > 25 * 1024 * 1024) throw new Error(`Asset exceeds 25 MiB: ${file}`);
      if (file.includes(`${path.sep}review${path.sep}`)) throw new Error(`Private review asset: ${file}`);
      files++;
    }
  }
};
walk("out");
console.log(`Cloudflare assets: ${files} files, each within 25 MiB; review routes excluded`);
const bundle = spawnSync("npm", ["exec", "--", "cf-wrangler", "build", "--mode", mode], { stdio: "inherit" });
process.exit(bundle.status ?? 1);
