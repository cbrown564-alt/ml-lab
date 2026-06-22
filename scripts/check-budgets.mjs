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
 *
 * Exhibit html raised 100 → 110 KB (2026-06-12): the math drawer completed
 * the exhibit anatomy and its prose ships twice by framework design (SSR
 * markup + RSC payload), costing ~10 KB per exhibit. That is content, not
 * bloat — the gate exists to catch the latter. Next ratchet candidate: the
 * word-sync transcript markup, which is the dominant per-prose multiplier.
 *
 * Exhibit js raised 680 → 700 KB (2026-06-22): the gradient-descent route sat
 * at exactly 680/680 — its load-bearing client viz (the LossSurface canvas, the
 * TrainingCurve, the step-able descent model) is the route's real cost, not a
 * stray dependency, and zero headroom made CI a coin-flip on framework patch
 * bumps. 700 restores ~20 KB of honest slack while still hugging the baseline
 * tight enough to red-build a real dependency (deps remain next/react/zod/
 * zustand; anything new lands as hundreds of KB, not twenty). Home stays at 680
 * (it sits ~631 with ample room).
 */
const BUDGETS = [
  { route: "/", jsKb: 680, htmlKb: 100 },
  { route: "/exhibits/linear-regression", jsKb: 700, htmlKb: 110 },
  { route: "/exhibits/gradient-descent", jsKb: 700, htmlKb: 110 },
  { route: "/exhibits/loss-functions", jsKb: 700, htmlKb: 110 },
  { route: "/exhibits/feature-scaling", jsKb: 700, htmlKb: 110 },
  { route: "/exhibits/bias-variance", jsKb: 700, htmlKb: 110 },
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
