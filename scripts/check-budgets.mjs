/**
 * Performance budget gate (docs/06, C5). Serves the production build and
 * measures what a visitor actually downloads per route: initial HTML plus
 * every <script src> it references, in raw bytes. Bundler-agnostic on
 * purpose — Turbopack's on-disk layout is not a contract, the wire is.
 *
 * Run after `next build`: node scripts/check-budgets.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 3210;
const BASE = `http://localhost:${PORT}`;

/**
 * Raw (uncompressed) bytes; gzip roughly thirds this on the wire.
 * Baseline measured 2026-06-12: 618–639 KB js per route, almost all of it
 * the React/Next runtime. The budget hugs that baseline so any accidental
 * dependency lands as a red build, and ratchets down only deliberately.
 */
const BUDGETS = [
  { route: "/", jsKb: 680, htmlKb: 100 },
  { route: "/exhibits/linear-regression", jsKb: 680, htmlKb: 100 },
  { route: "/exhibits/gradient-descent", jsKb: 680, htmlKb: 100 },
];

const server =
  process.platform === "win32"
    ? spawn(`npx next start --port ${PORT}`, { stdio: "pipe", shell: true })
    : spawn("npx", ["next", "start", "--port", String(PORT)], { stdio: "pipe" });
const stop = () => {
  if (process.platform === "win32") {
    spawn(`taskkill /pid ${server.pid} /T /F`, { shell: true });
  } else {
    server.kill();
  }
};

try {
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    await sleep(500);
    up = await fetch(BASE)
      .then((r) => r.ok)
      .catch(() => false);
  }
  if (!up) throw new Error("next start did not come up on " + BASE);

  let failed = false;
  for (const { route, jsKb, htmlKb } of BUDGETS) {
    const html = await (await fetch(BASE + route)).text();
    const htmlBytes = Buffer.byteLength(html);

    const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    let jsBytes = 0;
    for (const src of new Set(srcs)) {
      const url = src.startsWith("http") ? src : BASE + src;
      jsBytes += (await (await fetch(url)).arrayBuffer()).byteLength;
    }

    const jsK = Math.round(jsBytes / 1024);
    const htmlK = Math.round(htmlBytes / 1024);
    const jsOk = jsK <= jsKb;
    const htmlOk = htmlK <= htmlKb;
    if (!jsOk || !htmlOk) failed = true;
    console.log(
      `${jsOk && htmlOk ? "ok " : "FAIL"} ${route}  js ${jsK}/${jsKb} KB (${srcs.length} scripts)  html ${htmlK}/${htmlKb} KB`,
    );
  }

  if (failed) {
    console.error("\nBudget exceeded. Either get lighter or argue for a new budget in scripts/check-budgets.mjs — in that order.");
    process.exitCode = 1;
  }
} finally {
  stop();
}
