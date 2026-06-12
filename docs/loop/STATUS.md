# Iteration Loop Status

Working document for the build-evaluate-improve loop. Goal: **all 19 criteria in [docs/06-evaluation-criteria.md](../06-evaluation-criteria.md) at ≥3** (benchmark standard). Scores are honest self-assessments against the rubric (0–4); independent review still applies before any exhibit status advances.

## Scorecard — after iteration 6 (2026-06-12)

| # | Criterion | Score | Note |
| --- | --- | --- | --- |
| A1 | Orientation | 2 | Real front door: hero, open-exhibit cards, graph explorer v1 (layered map, live doors vs stub territory), journey path. Exhibits show their graph neighborhood. Missing: mastery surfaces, search, explorer interactivity beyond links |
| A2 | Autonomy with guidance | 1 | Foundations journey rendered as an ordered path with live links and framings; free roam via the map. No progression tracking or recommendations yet |
| A3 | Responsiveness | 2 | First interactive: drag→refit is synchronous SVG at trivial data sizes (instant in practice). Unmeasured — needs the manual jank audit + CWV in CI |
| A4 | Streamlined flow | 2 | Coherent loop: home → exhibit → graph neighbors → home; anchor nav; every door tested in e2e. No dead ends. Missing: journey continuation from within an exhibit |
| A5 | Beauty of the shell | 2 | Designed editorial home (calm shell) + consistent exhibit chrome via ExhibitFrame; explorer is server-rendered with zero client JS. Not yet honestly comparable to Distill/3B1B surfaces |
| A6 | Access & comfort | 1 | reduced-motion handled globally; no axe-core CI, no keyboard surfaces yet |
| B1 | Experiment teaches | 2 | Two manipulation→insight chains live: drag→refit→residuals (linreg) and time-controlled descent with converge/crawl/explode scenarios (GD). Scenario claims are themselves unit-tested. Missing: guided multi-beat structure within a scenario |
| B2 | Visual excellence | 2 | Visual grammar enforced via tokens (truth/prediction/error); clean annotated SVG. Not yet poster-worthy; no benchmark side-by-side written |
| B3 | Motion that explains | 2 | Steppable training is live: play/pause/step/scrub over the descent trace, learning-rate knob works mid-run, divergence auto-pauses with explanation. Motion is honest (each frame is a real descent step). Missing: eased transitions, loss-surface view |
| B4 | Multi-modal orchestration | 0 | No narrative/audio content |
| B5 | Assessment | 0 | Not built |
| B6 | Delight | 1 | "Tyranny of the outlier" has a spark; nothing peak-engineered yet |
| C1 | Marginal cost of content | 2 | Exhibit #2 composed from the kit (Plot/TrainingCurve/ParamSlider/ScenarioBar + store factory) with zero kit rework; first reuse pass extracted ScenarioBar. Still no scaffolder |
| C2 | Separation of concerns | 2 | content/ vs lib/ vs app/ split holds; no dependency-cruiser enforcement |
| C3 | Schema-first integrity | 3 | zod schemas + structural validation (DAG, dangling edges, journey coherence, connectivity) gate the build via prebuild |
| C4 | Test confidence | 3 | Model layer fixture-tested vs scikit-learn; graph validator covered; Playwright e2e now screenshots key states and smoke-tests every interactive affordance (drag→refit, scenario swap, reset, residual toggle). Missing: CI to make it binding |
| C5 | Performance budgets | 1 | Static-first architecture; no CI enforcement |
| C6 | Dependency discipline | 3 | Deps: next/react/zod/tsx only; conventions documented in docs/ |
| C7 | Operational simplicity | 3 | Fully static output, zero runtime infra, atomic deploys |

**Passing (≥3): 4/19**

## Iteration log

- **Iter 5 (2026-06-12)**: Gradient-descent exhibit — the second Phase 0 flagship territory. Viz kit grows two pieces: `TrainingCurve` (log-10 loss axis so convergence and divergence both stay readable) and `ParamSlider` (log-aware; the track moves through exponents). `ScenarioBar` extracted as the first kit reuse. `/exhibits/gradient-descent`: three scenarios on one loss surface (converge / crawl / explode) with full time control — play/pause/step/×10/scrub, mid-run learning-rate changes, divergence auto-pause at 1e12 with explanation, 500-step budget. Scenario prompts' claims are pinned by unit tests at the exhibit's step budget. 28 unit + 13 e2e + build green.
- **Iter 6 (2026-06-12)**: Shell design pass. Real home (hero, open-exhibit cards, map, Foundations journey timeline, footer) replacing the placeholder. Graph explorer v1: deterministic layered layout (`lib/graph/layout.ts`, longest-path over ordering edge types, cycle-guarded, unit-tested) rendered as SVG edges under HTML chips — server component, zero client JS; live exhibits are doors, stubs are territory. `ExhibitFrame` template extracts all exhibit chrome (graph-driven kicker, lede slot, Builds on / Leads to neighborhood) — exhibit pages are now ~20 lines of content. Exhibit registry (`content/exhibits/index.ts`) separates "route exists" from review-gated node status. 35 unit + 17 e2e + build green.
- **Iter 4 (2026-06-12)**: Playwright browser verification. 6 e2e tests: home + exhibit screenshots, drag→refit smoke test, outlier scenario, reset, residual toggle — iter 3's interactivity is now browser-verified. Two real fixes shaken out: (1) `DataPoints` drag moved from per-element pointer capture to window-level listeners so fast drags can't outrun the point; (2) Playwright viewport was silently 1280×720 because the `devices["Desktop Chrome"]` spread overrode the configured 1440×900 — pointer events below the fold landed on `<html>` and the drag tests could never pass. Vitest now excludes `e2e/`; `npm run test:e2e` added. 23 unit + 6 e2e + build green.
- **Iter 3 (2026-06-11)**: Experiment engine v1 + first interactive exhibit. `ExperimentSpec` types (params/datasets/scenarios with failure flag), zustand store factory, viz kit v1 (`Plot`/`Axes`/`FitLine`/`ResidualLines`/draggable `DataPoints`, hand-rolled scales — no d3 dep), `/exhibits/linear-regression` live on the dark lab surface with two scenarios ("Meet the line of best fit", "The tyranny of the outlier"). Exhibit datasets are the committed sklearn fixtures — learners manipulate the exact data the tests verify. Home links to live exhibits. 23 tests + build green. **Not yet browser-verified interactively** — Playwright next.
- **Iter 2 (2026-06-11)**: Test foundation + first model layer. `scripts/generate_fixtures.py` (pinned sklearn 1.8.0 / numpy 2.3.4, seed 42) emits committed JSON fixtures, including outlier and near-degenerate cases for the failure gallery. `src/lib/models/linear-regression.ts`: closed-form OLS, MSE, analytic gradient, and a step-able `createGradientDescent` (step/run/reset/scrubable trace/mid-run learning-rate change — divergence intact as a teaching feature). 23 tests green (OLS matches sklearn to 1e-6; gradient matches numerical; GD converges to OLS; absurd LR diverges). Graph validator now unit-tested.
- **Iter 1 (2026-06-11)**: Scaffolded Next.js 16 + Tailwind v4 + TS. Dual-mode design tokens (shell/lab surfaces via `data-surface`, visual-grammar hues, reduced-motion). Knowledge-graph zod schemas + structural validator wired as `prebuild` — a broken graph cannot build. Seeded 12 nodes / 16 edges / Foundations journey (regression cluster). Placeholder home proving data→validation→render. Build green.

## Queue (next iterations, in order)

1. **CI (C5/C2)**: GitHub Actions — validate, lint, test, build, axe-core, bundle budgets; dependency-cruiser rules.
2. **Narrative + audio pipeline for exhibit #1** (B4); assessments (B5); polish toward flagship (B6).

## Standing rules for the loop

- Re-score only criteria touched by the iteration; never inflate — a 3 requires being honestly comparable to the benchmark set on that criterion.
- Every iteration ends with: build green, validation green, commit.
- When all 19 ≥ 3: stop the loop and report for independent review.
