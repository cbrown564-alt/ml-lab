# Iteration Loop Status

Working document for the build-evaluate-improve loop. Goal: **all 19 criteria in [docs/06-evaluation-criteria.md](../06-evaluation-criteria.md) at ≥3** (benchmark standard). Scores are honest self-assessments against the rubric (0–4); independent review still applies before any exhibit status advances.

## Scorecard — after iteration 1 (2026-06-11)

| # | Criterion | Score | Note |
| --- | --- | --- | --- |
| A1 | Orientation | 0 | Placeholder home only; no graph explorer, no exhibit pages |
| A2 | Autonomy with guidance | 0 | No journeys UI, recommendations, or mastery surfaces |
| A3 | Responsiveness | 1 | Static page is trivially fast; nothing interactive exists to measure |
| A4 | Streamlined flow | 1 | No friction because no flows; not meaningfully earned |
| A5 | Beauty of the shell | 1 | Token system in place and disciplined; no designed surfaces yet |
| A6 | Access & comfort | 1 | reduced-motion handled globally; no axe-core CI, no keyboard surfaces yet |
| B1 | Experiment teaches | 0 | No experiments |
| B2 | Visual excellence | 0 | Visual grammar tokens defined; no visualizations |
| B3 | Motion that explains | 0 | No motion |
| B4 | Multi-modal orchestration | 0 | No narrative/audio content |
| B5 | Assessment | 0 | Not built |
| B6 | Delight | 0 | Nothing to delight in yet |
| C1 | Marginal cost of content | 0 | No scaffolder; no exhibits to measure |
| C2 | Separation of concerns | 2 | content/ vs lib/ vs app/ split holds; no dependency-cruiser enforcement |
| C3 | Schema-first integrity | 3 | zod schemas + structural validation (DAG, dangling edges, journey coherence, connectivity) gate the build via prebuild |
| C4 | Test confidence | 0 | No test runner, no fixtures |
| C5 | Performance budgets | 1 | Static-first architecture; no CI enforcement |
| C6 | Dependency discipline | 3 | Deps: next/react/zod/tsx only; conventions documented in docs/ |
| C7 | Operational simplicity | 3 | Fully static output, zero runtime infra, atomic deploys |

**Passing (≥3): 3/19**

## Iteration log

- **Iter 1 (2026-06-11)**: Scaffolded Next.js 16 + Tailwind v4 + TS. Dual-mode design tokens (shell/lab surfaces via `data-surface`, visual-grammar hues, reduced-motion). Knowledge-graph zod schemas + structural validator wired as `prebuild` — a broken graph cannot build. Seeded 12 nodes / 16 edges / Foundations journey (regression cluster). Placeholder home proving data→validation→render. Build green.

## Queue (next iterations, in order)

1. **Test foundation (C4)**: vitest + first fixture tests; set up the scikit-learn fixture convention (generate fixtures via a pinned Python script, commit JSON).
2. **Linear-regression model layer**: step-able OLS + gradient-descent implementation, fixture-tested — the first real model under the experiment engine.
3. **Experiment engine v1**: ExperimentSpec type, param controls, shared state store (zustand), first visualization kit pieces (ScatterCanvas, fitted line, residuals, loss readout).
4. **Linear-regression exhibit v1 (interactive)**: draggable points, live fit, the manipulation→insight chain (B1) — first scoreable A3/B1/B2/B3 work.
5. **Exhibit page template + shell design pass** (A1/A4/A5): real lab home, exhibit chrome, graph explorer v1.
6. **CI (C5/C2)**: GitHub Actions — validate, lint, test, build, axe-core, bundle budgets; dependency-cruiser rules.
7. **Narrative + audio pipeline for exhibit #1** (B4); assessments (B5); polish toward flagship (B6).

## Standing rules for the loop

- Re-score only criteria touched by the iteration; never inflate — a 3 requires being honestly comparable to the benchmark set on that criterion.
- Every iteration ends with: build green, validation green, commit.
- When all 19 ≥ 3: stop the loop and report for independent review.
