# Iteration Loop Status

Working document for the build-evaluate-improve loop. Goal: **all 19 criteria in [docs/06-evaluation-criteria.md](../06-evaluation-criteria.md) at ≥3** (benchmark standard). Scores are honest self-assessments against the rubric (0–4); independent review still applies before any exhibit status advances.

## Scorecard — after iteration 3 (2026-06-11)

| # | Criterion | Score | Note |
| --- | --- | --- | --- |
| A1 | Orientation | 0 | Placeholder home only; no graph explorer, no exhibit pages |
| A2 | Autonomy with guidance | 0 | No journeys UI, recommendations, or mastery surfaces |
| A3 | Responsiveness | 2 | First interactive: drag→refit is synchronous SVG at trivial data sizes (instant in practice). Unmeasured — needs the manual jank audit + CWV in CI |
| A4 | Streamlined flow | 1 | No friction because no flows; not meaningfully earned |
| A5 | Beauty of the shell | 1 | Token system in place and disciplined; no designed surfaces yet |
| A6 | Access & comfort | 1 | reduced-motion handled globally; no axe-core CI, no keyboard surfaces yet |
| B1 | Experiment teaches | 2 | Manipulation→insight chain live: drag data → line refits → residuals expose the loss; outlier scenario is a real predict-then-verify failure beat. Missing: guided multi-beat structure, gradient-descent steppability |
| B2 | Visual excellence | 2 | Visual grammar enforced via tokens (truth/prediction/error); clean annotated SVG. Not yet poster-worthy; no benchmark side-by-side written |
| B3 | Motion that explains | 1 | Live refit is direct manipulation (good), but no explanatory motion or steppable training yet |
| B4 | Multi-modal orchestration | 0 | No narrative/audio content |
| B5 | Assessment | 0 | Not built |
| B6 | Delight | 1 | "Tyranny of the outlier" has a spark; nothing peak-engineered yet |
| C1 | Marginal cost of content | 1 | Engine pattern (spec + store + kit) exists and exhibit #1 composes it; no scaffolder, n=1 |
| C2 | Separation of concerns | 2 | content/ vs lib/ vs app/ split holds; no dependency-cruiser enforcement |
| C3 | Schema-first integrity | 3 | zod schemas + structural validation (DAG, dangling edges, journey coherence, connectivity) gate the build via prebuild |
| C4 | Test confidence | 2 | vitest running; linear-regression model 100% fixture-tested vs scikit-learn (incl. divergence + numerical-gradient checks); graph validator covered. Missing: screenshot/interaction tests (none exist to test yet) |
| C5 | Performance budgets | 1 | Static-first architecture; no CI enforcement |
| C6 | Dependency discipline | 3 | Deps: next/react/zod/tsx only; conventions documented in docs/ |
| C7 | Operational simplicity | 3 | Fully static output, zero runtime infra, atomic deploys |

**Passing (≥3): 3/19**

## Iteration log

- **Iter 3 (2026-06-11)**: Experiment engine v1 + first interactive exhibit. `ExperimentSpec` types (params/datasets/scenarios with failure flag), zustand store factory, viz kit v1 (`Plot`/`Axes`/`FitLine`/`ResidualLines`/draggable `DataPoints`, hand-rolled scales — no d3 dep), `/exhibits/linear-regression` live on the dark lab surface with two scenarios ("Meet the line of best fit", "The tyranny of the outlier"). Exhibit datasets are the committed sklearn fixtures — learners manipulate the exact data the tests verify. Home links to live exhibits. 23 tests + build green. **Not yet browser-verified interactively** — Playwright next.
- **Iter 2 (2026-06-11)**: Test foundation + first model layer. `scripts/generate_fixtures.py` (pinned sklearn 1.8.0 / numpy 2.3.4, seed 42) emits committed JSON fixtures, including outlier and near-degenerate cases for the failure gallery. `src/lib/models/linear-regression.ts`: closed-form OLS, MSE, analytic gradient, and a step-able `createGradientDescent` (step/run/reset/scrubable trace/mid-run learning-rate change — divergence intact as a teaching feature). 23 tests green (OLS matches sklearn to 1e-6; gradient matches numerical; GD converges to OLS; absurd LR diverges). Graph validator now unit-tested.
- **Iter 1 (2026-06-11)**: Scaffolded Next.js 16 + Tailwind v4 + TS. Dual-mode design tokens (shell/lab surfaces via `data-surface`, visual-grammar hues, reduced-motion). Knowledge-graph zod schemas + structural validator wired as `prebuild` — a broken graph cannot build. Seeded 12 nodes / 16 edges / Foundations journey (regression cluster). Placeholder home proving data→validation→render. Build green.

## Queue (next iterations, in order)

1. **Experiment engine v1**: ExperimentSpec type, param controls, shared state store (zustand), first visualization kit pieces (ScatterCanvas, fitted line, residuals, loss readout).
4. **Linear-regression exhibit v1 (interactive)**: draggable points, live fit, the manipulation→insight chain (B1) — first scoreable A3/B1/B2/B3 work.
5. **Exhibit page template + shell design pass** (A1/A4/A5): real lab home, exhibit chrome, graph explorer v1.
6. **CI (C5/C2)**: GitHub Actions — validate, lint, test, build, axe-core, bundle budgets; dependency-cruiser rules.
7. **Narrative + audio pipeline for exhibit #1** (B4); assessments (B5); polish toward flagship (B6).

## Standing rules for the loop

- Re-score only criteria touched by the iteration; never inflate — a 3 requires being honestly comparable to the benchmark set on that criterion.
- Every iteration ends with: build green, validation green, commit.
- When all 19 ≥ 3: stop the loop and report for independent review.
