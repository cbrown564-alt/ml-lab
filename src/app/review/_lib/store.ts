/**
 * Review store — the filesystem side of the human-in-the-loop review system
 * (docs/08, Parts 2–4). Captures, exemplar frames, and durable verdicts all live
 * on disk; this module is the single reader/writer so the `/review` UI, the
 * route handlers, and the `check:rubric` linter agree on paths and shapes.
 *
 * **Server-only.** It uses `node:fs`; never import it into a client component.
 * It is loaded by server components, route handlers, and the tsx linter — all of
 * which run in Node. Pure schema lives in `content/quality/*`; this is the IO.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { conceptChecks } from "@content/exhibits/checks";
import { isLive, liveExhibits } from "@content/exhibits";
import { detectAssessmentForm } from "@content/quality/checks";
import { ScorecardSchema, type Scorecard } from "@content/quality/rubric";
import { nodes } from "@content/graph/nodes";

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "docs");
export const CAPTURES_DIR = path.join(DOCS, "reviews", "captures");
export const FEEDBACK_DIR = path.join(DOCS, "reviews", "feedback");
export const EXEMPLARS_DIR = path.join(DOCS, "exemplars");

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Exemplar pairing — every captured surface gets a default benchmark frame    */
/* (docs/08 Part 2). Derived from docs/exemplars/SYNTHESIS.md; the reviewer can */
/* override per sub-score in the UI, but the lineup is never unpaired.          */
/* -------------------------------------------------------------------------- */

export const SURFACE_PAIRING: Record<string, string> = {
  hero: "ciechanowski-watch/00-viewport.png",
  see: "r2d3-trees/00-viewport.png",
  run: "tensorflow-playground/00-viewport.png",
  break: "seeing-theory-regression/02-ols-anscombe-3-outlier.png",
  explain: "ncase-trust/00-viewport.png",
  home: "pudding-dialogue/00-viewport.png",
  cluster: "distill-momentum/00-viewport.png",
};

/** Default benchmark frame the review form pre-selects per register dimension
 * (§1e — every score names a frame). Sourced from docs/exemplars/SYNTHESIS.md. */
export const DEFAULT_DIMENSION_EXEMPLAR: Record<string, string> = {
  "annotation-integration": "distill-momentum/02-scroll-40pct.png",
  "hero-as-protagonist": "ciechanowski-watch/00-viewport.png",
  "mechanism-in-the-picture": "seeing-theory-regression/01-ols-anscombe-1.png",
  "colour-discipline": "r2d3-trees/00-viewport.png",
  "atmosphere-finish": "ciechanowski-watch/02-scroll-40pct.png",
  motion: "3b1b-gradient-descent/02-scroll-40pct.png",
};

/** Every committed exemplar frame, as "<slug>/<file>.png" — the options the
 * review form offers when a reviewer re-pins a score to a different benchmark. */
export function listExemplarFrames(): string[] {
  if (!existsSync(EXEMPLARS_DIR)) return [];
  const out: string[] = [];
  for (const slug of readdirSync(EXEMPLARS_DIR)) {
    const dir = path.join(EXEMPLARS_DIR, slug);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (f.endsWith(".png")) out.push(`${slug}/${f}`);
    }
  }
  return out.sort();
}

/* -------------------------------------------------------------------------- */
/* Content hashing — staleness ground truth (docs/08 Part 4, red line #6)      */
/* -------------------------------------------------------------------------- */

/**
 * A stable hash of an exhibit's authored content: every `.ts` under
 * `content/exhibits/<id>/` plus its `page.tsx` wiring (which carries the `hero`
 * prop). If any of these change after a verdict, the scorecard's stored
 * `contentHash` diverges and the scorecard is stale — a flagship blocker.
 */
export function contentHash(exhibitId: string): string {
  const files: string[] = [];
  const contentDir = path.join(ROOT, "content", "exhibits", exhibitId);
  if (existsSync(contentDir)) {
    for (const f of readdirSync(contentDir).sort()) {
      if (f.endsWith(".ts")) files.push(path.join(contentDir, f));
    }
  }
  const page = path.join(ROOT, "src", "app", "exhibits", exhibitId, "page.tsx");
  if (existsSync(page)) files.push(page);

  const h = createHash("sha256");
  for (const f of files) {
    h.update(path.relative(ROOT, f));
    h.update(readFileSync(f));
  }
  return h.digest("hex").slice(0, 16);
}

/* -------------------------------------------------------------------------- */
/* Mechanizable per-exhibit checks (the machine judges what it can)            */
/* -------------------------------------------------------------------------- */

/** Does the exhibit page pass a `hero` specimen? (§1b — no hero ⇒ not flagship.) */
export function detectHeroPresent(exhibitId: string): boolean {
  const page = path.join(ROOT, "src", "app", "exhibits", exhibitId, "page.tsx");
  if (!existsSync(page)) return false;
  return /\bhero=\{/.test(readFileSync(page, "utf8"));
}

/** The mechanizable assessment-form booleans for an exhibit, or null if it has
 * no concept check yet. */
export function detectAssessment(exhibitId: string) {
  const check = conceptChecks[exhibitId];
  return check ? detectAssessmentForm(check) : null;
}

/* -------------------------------------------------------------------------- */
/* Exhibit roster                                                              */
/* -------------------------------------------------------------------------- */

export type ReviewExhibit = {
  id: string;
  title: string;
  status: string;
  heroPresent: boolean;
  latestCapture: string | null;
  hasScorecard: boolean;
  scorecardStale: boolean;
};

export function reviewExhibits(): ReviewExhibit[] {
  return Object.keys(liveExhibits)
    .map((id) => {
      const node = nodes.find((n) => n.id === id);
      const card = readScorecard(id);
      return {
        id,
        title: node?.title ?? id,
        status: node?.status ?? "unknown",
        heroPresent: detectHeroPresent(id),
        latestCapture: latestCaptureDate(id),
        hasScorecard: !!card,
        scorecardStale: card ? card.contentHash !== contentHash(id) : false,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

/* -------------------------------------------------------------------------- */
/* Captures                                                                    */
/* -------------------------------------------------------------------------- */

export type CaptureFrame = {
  /** Path relative to docs/, e.g. "reviews/captures/linear-regression/2026-06-23/see-00.png". */
  file: string;
  surface: string;
  label: string;
  /** Default paired exemplar frame, relative to docs/exemplars/. */
  exemplar: string;
};

export type CaptureManifest = {
  exhibit: string;
  date: string;
  reference: { width: number; height: number };
  frames: CaptureFrame[];
};

export function listCaptureDates(exhibitId: string): string[] {
  const dir = path.join(CAPTURES_DIR, exhibitId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => statSync(path.join(dir, d)).isDirectory())
    .sort()
    .reverse();
}

export function latestCaptureDate(exhibitId: string): string | null {
  return listCaptureDates(exhibitId)[0] ?? null;
}

export function readManifest(exhibitId: string, date: string): CaptureManifest | null {
  const file = path.join(CAPTURES_DIR, exhibitId, date, "manifest.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8")) as CaptureManifest;
}

/**
 * Candidate compositions to weigh side by side (docs/08 Part 3 — the "this, not
 * that" surface). Drop PNGs into `<capture>/<date>/variants/` (e.g. two hero
 * treatments) and they render adjacent in `/review` for the human to choose
 * between; the choice + reason persist to decisions.md. Returns docs-relative
 * paths.
 */
export function listVariantFrames(exhibitId: string, date: string): string[] {
  const dir = path.join(CAPTURES_DIR, exhibitId, date, "variants");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .map((f) => path.relative(DOCS, path.join(dir, f)));
}

/* -------------------------------------------------------------------------- */
/* Durable feedback (docs/08 Part 3)                                           */
/* -------------------------------------------------------------------------- */

function feedbackDir(exhibitId: string): string {
  return path.join(FEEDBACK_DIR, exhibitId);
}

export function readScorecard(exhibitId: string): Scorecard | null {
  const file = path.join(feedbackDir(exhibitId), "scorecard.json");
  if (!existsSync(file)) return null;
  const parsed = ScorecardSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
  return parsed.success ? parsed.data : null;
}

export function writeScorecard(exhibitId: string, card: Scorecard): void {
  const dir = feedbackDir(exhibitId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, "scorecard.json"),
    JSON.stringify(card, null, 2) + "\n",
    "utf8",
  );
}

export function readTextDoc(exhibitId: string, name: "notes.md" | "decisions.md"): string {
  const file = path.join(feedbackDir(exhibitId), name);
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

export function writeTextDoc(
  exhibitId: string,
  name: "notes.md" | "decisions.md",
  body: string,
): void {
  const dir = feedbackDir(exhibitId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, name), body.endsWith("\n") ? body : body + "\n", "utf8");
}

/* -------------------------------------------------------------------------- */
/* Frame serving — path sandbox for the dev-only frame route handler           */
/* -------------------------------------------------------------------------- */

/**
 * Resolve a docs-relative frame path to an absolute file, but only inside the two
 * directories the review surface is allowed to read (captures + exemplars). Any
 * traversal outside returns null so the handler 404s.
 */
export function resolveFrame(docsRelPath: string): string | null {
  const abs = path.resolve(DOCS, docsRelPath);
  const allowed = [CAPTURES_DIR, EXEMPLARS_DIR];
  if (!allowed.some((base) => abs === base || abs.startsWith(base + path.sep))) return null;
  if (!existsSync(abs) || !statSync(abs).isFile()) return null;
  return abs;
}

export { isLive };
