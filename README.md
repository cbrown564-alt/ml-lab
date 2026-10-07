# ML Lab

**Hands-on interactive exhibits for building machine-learning intuition.**

ML Lab turns core machine-learning ideas into exhibits you can run, break, and apply. Each concept is a self-contained experience — narrative, visuals, audio, and a live experiment — connected in a knowledge graph from foundational algorithms to the cutting edge.

## Core ideas

- **Build intuition by running the model.** See the idea, change the inputs, push the model until it fails, then explain what happened.
- **Every concept stands alone.** Each algorithm, technique, or idea is a self-contained exhibit. No forced linear progression.
- **But everything connects.** Concepts live in a knowledge graph with typed relationships (prerequisites, generalizations, applications). Curated journeys exist as guided walks through the graph for learners who want structure.
- **Four stages per exhibit.** See it · Run it · Break it · Explain it — the product promise made structural on every page.
- **Built for big screens.** Designed primarily for laptops and desktops, using the full canvas to tell rich visual stories and host immersive experiments.
- **Two modes of exploration.** Every interactive experiment offers a **visual mode** (direct manipulation, sliders, drag-and-drop data points) and a **code mode** (edit and run real code in the browser).
- **Multi-modal by design.** Each concept aspires to text, visuals, audio narration, and interactive components — produced through an AI-assisted content pipeline (narrative via Claude, character art via image generation, voices via ElevenLabs).
- **Assessment-aware.** Concept checks feed a progress model that powers recommended next steps across the graph.

## Documentation

| Doc | Contents |
| --- | --- |
| [docs/00-decisions.md](docs/00-decisions.md) | Decision log for direction-setting choices |
| [docs/01-vision.md](docs/01-vision.md) | Vision, pedagogy, design principles, what "exceptional" means here |
| [docs/style/voice.md](docs/style/voice.md) | Canonical voice & copy style guide for learner-facing prose and UI |
| [docs/02-architecture.md](docs/02-architecture.md) | Technical architecture, stack, rendering and in-browser ML strategy |
| [docs/03-data-model.md](docs/03-data-model.md) | Knowledge graph schema, concept format, assessments, mastery model |
| [docs/04-content-pipeline.md](docs/04-content-pipeline.md) | AI-assisted production workflow for narrative, art, audio, interactives |
| [docs/05-roadmap.md](docs/05-roadmap.md) | Phased plan: popular ML → niche/nascent → mathematics → connected disciplines |
| [docs/06-evaluation-criteria.md](docs/06-evaluation-criteria.md) | The quality bar: research-grounded criteria for UX, visual/interactive craft, and architecture |

## Status

Phase 0 complete. Phase 1 in progress: **25 live exhibits**, **25 graph nodes**, **4 journeys** — Foundations (15 flagship), `the-gradient`, trees cluster (3 flagship), unsupervised (k-means, pca, flagship), **deep-learning on-ramps** (cnns · embeddings · attention · the-transformer **flagship**; fine-tuning/RAG **interactive**, tier full). Human review gate complete for Foundations (2026-07-01); unsupervised panel (2026-07-02); DL cluster panel (2026-07-12); `check:rubric --strict` gates `prebuild`. Findings: [docs/reviews/flagship-deep-learning-review/FINDINGS.md](docs/reviews/flagship-deep-learning-review/FINDINGS.md).

## Cloudflare migration

Production remains on Vercel while migration verification is in progress. The
Cloudflare target is Workers Static Assets: the experiments, IndexedDB progress,
lazy Python runtime and media run in the browser. No learner-facing server is
required. Existing local development and the Vercel fallback stay available.

Use Node 24.19 (`.nvmrc`) and the npm lockfile. `npm run build:cloudflare` defaults
to `migration-preview`; production uses `npm run build:cloudflare -- production`.
Cloudflare Workers Builds watches `main`, runs the production build command above,
and deploys the prebuilt production package.

Deploy the resulting package with `npx cf deploy --prebuilt --mode` followed by
the same mode. The build retains graph validation and reports the rubric check,
checks asset sizes and adds preview noindex / immutable asset headers. cf uses
the Wrangler delegate to package `out/`; it does not run these build scripts
automatically.

The review tool's entry points use `.dev.ts` / `.dev.tsx`. Next development and
ordinary Next builds recognize them; `CF_STATIC_EXPORT=1` excludes them from
the export. Filesystem-backed review data and APIs must never be published.
`ML_LAB_BASE_URL` lets the existing performance and Playwright checks exercise a
packaged deployment instead of starting Next locally.

At the migration baseline `7e7d880`, the strict build check fails because human
scorecards are stale for attention, gradient descent and overfitting /
regularization. Lint also fails on an existing unescaped apostrophe in
`CnnsBreakIt.tsx` (12 additional warnings). Do not refresh human verdicts without
the corresponding review.

On 7 October 2026 the owner authorized a hosting-only exception for these
inherited failures. `scripts/hosting-baseline.json` pins the entire source,
content and dependency state. While that state matches, Cloudflare builds report
the stale rubric records and CI records lint/budget failures without blocking
this hosting move. Any source, content or dependency change ends the exception:
Cloudflare builds restore strict prebuild and CI makes lint/budgets mandatory.
Ordinary Next builds always keep strict prebuild. This does not refresh a human
verdict, raise a performance budget or waive future product review.

The initial preview's 194 passing browser cases cover exhibit interactions and
Python execution. Its broad recommendation locator also fails against ordinary
Next because the homepage has four journeys; the test now scopes Foundations
and passes. One gradient-descent contrast check failed in the concurrent suite
and passed alone on both hosts; retain this intermittent failure in the evidence.
All five separately run responsiveness checks pass. Eleven routes exceed the
existing raw HTML/JavaScript budgets on both ordinary Next and the static export;
the migration does not raise those budgets or claim the full check passes.

Learner progress and display preferences belong to each browser origin. Keep the
old origin available for recovery; changing hosting does not transfer IndexedDB.
The planned progress export/import affordance is not currently implemented.
