# Visual-defect audit — ML Lab exhibits

**Date:** 2026-06-29 · **Branch:** `homepage-atlas-research` · **Blockers commit:** `c3083f0` · **Majors commit:** `4c350b5`…`8c6df3a` (6 commits on `cursor/fix-major-visual-defects-8cfc`)

## What this is

A ruthless visual-craft sweep of every hero, interactive, and illustration across all 18
exhibits, triggered by the "erm — is it supposed to look like that?" reaction. The bar is
Distill / 3Blue1Brown / Seeing-Theory pixel craft. The seed defect (which kicked this off)
was the classification decision-conveyor's bottom-row count labels (`FN`/`TN`) colliding
with the box above them.

**Method.** Captured all 18 exhibits via `npm run capture:review` (hero + all four acts +
story beats + full pages, 1440px), then 6 parallel Sonnet agents (3 exhibits each) read
every frame and cross-referenced source. Findings below are de-duplicated and grouped by
root pattern.

**Headline finding:** the sloppiness is **~6 systemic patterns**, not 25 unrelated nits.
Each pattern recurs across several exhibits, so fixing the *pattern* clears multiple
instances. The seed defect (an element placed looking only at itself, never at its
neighbour or container) is the same disease as half the register.

## Status legend

- ✅ **FIXED** — done in `c3083f0`, verified against fresh re-capture
- 🔶 **QUEUED** — agreed for the next ("majors") pass
- 🔁 **PARTIAL** — incidentally improved by a blocker fix; may still want dedicated work
- ✔︎ in *Verified* column = I personally re-confirmed the geometry in source/pixels;
  others are agent-reported with a file:line citation (re-verify before fixing).

---

## The 6 patterns + full register

### ① Positioned SVG text collides with / is clipped by something it never checked
*(the seed defect's family — an element placed relative only to itself)*

| Exhibit | Frame | Sev | Defect | Source | Status | Verified |
|---|---|---|---|---|---|---|
| classification | hero, see, run | BLOCKER | conveyor `FN`/`TN` count labels overlap the bottom edge of the `TP`/`FP` boxes (60px row pitch vs 52px box + ~14px label) | `ClassificationViews.tsx` `BIN_LAYOUT` 24-27 | ✅ cy 235→252, H 270→290 | ✔︎ |
| the-gradient | hero | BLOCKER | "TANGENT PLANE" clipped by the round ProbeLens → "NGENT PLANE" | `ProbeLens.tsx` 89-101 | ✅ content constrained to inscribed square (lensSize×0.66) | ✔︎ |
| train-test | run-full, see | BLOCKER | the cross-validation mark label is pushed to `y≈2` and clipped at the SVG top → the taught concept is an anonymous teal line | `ErrorSpreadStrip.tsx:123` | ✅ m.t 34→46 + clamp ly | ✔︎ |
| data-leakage | see-beat-3, break | MAJOR | "10 feats · train only" (21 mono chars) overflows its 88px rect; "ly" floats outside the border | `DataLeakageProvenancePipe.tsx:143` (rect) vs `:153` (string) | ✅ rect widened 88→106 | ✔︎ |

### ② Shared-scale bars collapse to a meaningless stub
*(one linear scale `= K/max(…)` across magnitudes that differ wildly, + a `Math.max(2,w)` floor)*

| Exhibit | Frame | Sev | Defect | Source | Status | Verified |
|---|---|---|---|---|---|---|
| gradient-descent | hero | MAJOR | DecompositionBars: 4 of 6 rows render the identical 2px stub — reads as uninitialised | `GradientDescentMicroscope.tsx:72-89` | ✅ per-pair scales | ✔︎ |
| the-gradient | hero | MAJOR | ∂f/∂y is a ~5px purple nub beside a 52px ∂f/∂x bar at the default probe | `TheGradientHero.tsx:17-18, 38` | ✅ sqrt compression | ✔︎ (scale formula) |

### ③ Same concept drawn in different colours across acts/panels
*(no object constancy — per-act components pick colour independently)*

| Exhibit | Frame | Sev | Defect | Source | Status | Verified |
|---|---|---|---|---|---|---|
| the-dataset | break vs explain | MAJOR | the biased regression line is **blue** in Break it, **pink** in Explain it | `TheDatasetBreakIt.tsx:42` vs `TheDatasetCheckLab.tsx:45` | ✅ unified `--viz-prediction` | ✔︎ |
| regression-task | break vs explain | MAJOR | in-band / out-of-band dot encoding fully **inverts** between acts (plain amber means "correct" in one, "wrong" in the other) | `RegressionTaskBreakIt.tsx:68-70` vs `RegressionTaskCheckLab.tsx:70-72` | ✅ aligned encoding | ✔︎ |
| regression-task | break vs explain | MAJOR | the accuracy band changes colour (blue→teal) and loses its dashed border between acts | `RegressionTaskBreakIt.tsx:43-46` vs `RegressionTaskCheckLab.tsx:41-42` | ✅ aligned band styling | ✔︎ |
| classification | hero, see, run | MAJOR | precision is blue (`--viz-prediction-ink`) but recall is **purple** (`--viz-param-ink`, the model-parameter palette — semantically wrong for a metric) | `ClassificationViews.tsx:190, 195`; `…Story.tsx:37-38` | ✅ recall → `--viz-truth-ink` | ✔︎ |

### ④ DecisionField renders legitimate model states as broken tiles
*(low-confidence / impure probabilities map to near-white; a step function is sampled on a coarse grid)*

| Exhibit | Frame | Sev | Defect | Source | Status | Verified |
|---|---|---|---|---|---|---|
| gradient-boosting | hero + all acts | BLOCKER | a wide pale rectangular patch (the p≈½ zone) reads as a **missing tile** — worst at the "sweet spot" the exhibit celebrates | `DecisionField.tsx` `fieldColor` 26-31 | ✅ PALE deepened [248,246,241]→[239,236,228]; reads as a faint panel | ✔︎ (non-regression on logistic/trees/forest) |
| decision-trees | hero | MAJOR | depth-3 impure leaves → a smeared cream band instead of a crisp staircase | `DecisionTreeHero.tsx:22`; `DecisionField.tsx:26-31` | ✅ `fieldMode="crisp"` | ✔︎ |
| random-forests | hero (left) | MAJOR | hairline blue slivers (thin leaves) look like pixel-bleed, not class zones | `DecisionField.tsx:65, 75` (no `imageRendering: pixelated`) | ✅ crisp mode + pixelated | ✔︎ |
| random-forests | hero (right) + acts | MAJOR | the forest heatmap shows venetian-blind banding — contradicts its own "SMOOTH, STEADY" caption | `DecisionField.tsx:82-89` (grid resolves vote-flip steps) | ✅ grid 120×100→280×234 | ✔︎ |

### ⑤ Overlapping / two-population marks in one plot

| Exhibit | Frame | Sev | Defect | Source | Status | Verified |
|---|---|---|---|---|---|---|
| classification | hero, see, run | MAJOR | the 2-dot `FP`/`FN` bins overlap into a single bicolour blob (9px spacing < 11px diameter, thick red strokes amplify) | `ClassificationViews.tsx:165-168, 175, 178` | ✅ 14px pitch for ≤2-dot bins | ✔︎ |
| classification | break | MAJOR | ProbabilityStrip misclassified dots are ~30% larger (r 6.5 vs 5.5) → read as a different data layer, no legend | `ClassificationViews.tsx:234, 237-238` | ✅ aligned r/stroke with conveyor | ✔︎ |

### ⑥ Divergent duplicates
*(the same widget reimplemented per act has drifted; a fix in one act is missing in another)*

| Exhibit | Frame | Sev | Defect | Source | Status | Verified |
|---|---|---|---|---|---|---|
| loss-functions | see (all beats) | BLOCKER | Story's GhostLine lacks the label stagger + halo the Lab variant has → "Huber" stacks on "absolute" illegibly | `LossFunctionsStory.tsx:27-43` vs `LossFunctionsLab.tsx:36-70` | ✅ ported stagger + halo | ✔︎ |
| neural-network | explain | MAJOR | CheckLab's GAP is hardcoded `--viz-error-ink` (red) even when test < train (healthy generalisation); BreakIt correctly gates on sign | `NeuralNetCheckLab.tsx:46` vs `NeuralNetBreakIt.tsx:127` | ✅ sign-gated colour | ✔︎ |

### High-value singletons

| Exhibit | Frame | Sev | Defect | Source | Status | Verified |
|---|---|---|---|---|---|---|
| feature-scaling | see, run | MAJOR→fixed | CSS `uppercase` turned lowercase η into capital Η (≡ "H") → **"STABLE STEP H"**; present in *both* Story and Lab | `FeatureScalingStory.tsx:97`, `FeatureScalingLab.tsx:169`; `StatGrid.tsx:47` | ✅ StatGrid label → ReactNode; η in `normal-case` span (both views) | ✔︎ |
| bias-variance | hero | MAJOR | `testErr` printed twice ~30px apart in different type styles → reads as a copy-paste bug | `BiasVarianceHero.tsx:104` & `:113` | ✅ deduped figcaption | ✔︎ |
| linear-regression | run-full | MAJOR | SquaredPenalty's default square is 44px and fails its own `> 46` label guard by 2px → anonymous unlabelled square on ~80% empty canvas | `SquaredPenalty.tsx:28-29, 71`; `…/math.ts:30` | ✅ guard + default residual | ✔︎ |
| loss-functions | see | MAJOR | LossShapes draws non-selected curves at 0.28 opacity → effectively invisible; the 3-shape comparison reads as one curve | `LossShapes.tsx:70-71` | ✅ opacity 0.28→0.58 | ✔︎ |
| logistic-regression | hero, see | MAJOR | the decision boundary overshoots the plot border ~19px into x-tick labels (`clampPx` is ±2000, not `[0, height]`) | `DecisionField.tsx:33` | ✅ SVG clipPath on plot | ✔︎ |
| overfitting-regularization | see-beat-3, break | BLOCKER* | the fitted curve still spikes past the chart edge even at λ=0.30 ("REINED IN"), and the spike *reverses direction* — looks like the chart misbehaving | Runge artifact in `PolyCurve` on `xDomain=[-0.02,1.02]`; `RegularizationHero.tsx:164-165` | ✅ clipPath + xDomain [0,1] | ✔︎ |
| overfitting-regularization | see, break | MAJOR | the "best λ" line sits noticeably right of where the test-error curve visually bottoms (y-axis hard-clamps at 0.5, flattening the left descent) | `RegularizationCurves.tsx:46, 51, 66` | ✅ data-driven yMax | ✔︎ |
| overfitting-regularization | hero | MINOR | hero labels the chart "Coefficients" but plots `|w|` magnitudes (break-it correctly says `|Wᵢ|`) | `RegularizationHero.tsx:75` vs `:89` | ✅ label → `\|wⱼ\|` | ✔︎ |
| regression-task | see-beat-2 | MINOR | the "distance" residual label lacks the `paintOrder="stroke"` halo every other annotation in the exhibit uses | `RegressionTaskStory.tsx:79` | ✅ halo ported from Hero | ✔︎ |
| what-is-ml | see-beat-3 | MINOR | "labelled examples →" is amber (class-0 ink) but refers to the whole labelled set incl. blue class-1 dots | `WhatIsMlStory.tsx:87` | ✅ → `--viz-neutral-ink` | ✔︎ |
| linear-regression | see | MINOR | StatGrid's MSE note makes that cell taller; the 5 value-only cells get a dangling bottom gap, breaking the strip's rhythm | `LinearRegressionStory.tsx:191`; `StatGrid.tsx:56-59` | ✅ note-row placeholder in StatGrid | ✔︎ |
| gradient-descent | break, explain | MINOR | the step-0 log-loss chart is ~95% empty with no "press play" empty-state | not pinned (`TrainingCurve` initial render) | ✅ emptyHint overlay | ✔︎ |
| random-forests | run-full | MINOR | "held-out vs forest size" y-axis ticks (85, 90) omit the ~92-93% plateau the chart exists to show | `RandomForestLab.tsx:147` | ✅ domain 87–94%, ticks 88/90/92/93 | ✔︎ |

*what-is-ml is otherwise clean.*

---

## Majors pass — completed 2026-06-30

Six commits on `cursor/fix-major-visual-defects-8cfc`, bundled by pattern:

1. **③ act colour-drift** — `a9460e1`
2. **② shared-scale stubs** — `0f1b2bd`
3. **⑤ conveyor marks** — `f1a63f1`
4. **⑥ neural-net GAP + ① data-leakage rect** — `7648565`
5. **④ DecisionField** — `8c6df3a`
6. **Singletons** — `4c350b5`

Verified: typecheck + 256 unit tests green. Remaining queue: MINOR items + overfitting BLOCKER* (framing/crop call).

## Remaining pass — completed 2026-06-30

Six parallel agents on `cursor/fix-remaining-visual-defects-3f48`:

1. **overfitting BLOCKER*** — `PolyCurve` clipPath + xDomain `[0,1]` across all Regularization views
2. **overfitting MINOR** — hero label `|wⱼ|`
3. **regression-task** — distance label halo
4. **what-is-ml** — neutral ink for dataset-wide label
5. **linear-regression** — StatGrid note-row rhythm
6. **gradient-descent** — TrainingCurve empty-state hint
7. **random-forests** — y-axis domain/ticks for plateau

Verified: typecheck + 256 unit tests green. **Audit queue empty.**

⚠️ The majors include more agent-only findings than the blockers did. **Re-verify each geometry against pixels before touching it** — agents cite file:line but can miscompute.

---

## Reproduce / verification gotchas

```bash
npm run dev -- --port 3001                              # one dev server (Turbopack allows only one)
BASE=http://localhost:3001 node scripts/capture-review.mjs <slug> [<slug> …]
# frames → docs/reviews/captures/<slug>/<UTC-date>/   (gitignored)
```

Two traps that cost ~30 min this session:

- **Turbopack HMR staleness.** A long-lived dev server (hours, dozens of edits) serves SSR
  with *new* coordinates but a *stale client chunk*; after hydration the stale client render
  wins, so capture PNGs show the OLD layout while `curl` of the SSR HTML shows the new one.
  **Restart the dev server fresh before trusting any visual capture.** Ground truth = a
  Playwright `page.evaluate` reading the rendered DOM attributes.
- **Read-tool image path-cache.** Re-Reading the same PNG path returns the first image even
  after the file is overwritten. Copy fresh frames to a unique filename before viewing.

## Blockers fixed in `c3083f0`

8 files, all green (typecheck · eslint 0 errors · 256 unit · per-exhibit re-capture):
`ClassificationViews.tsx`, `ErrorSpreadStrip.tsx`, `DecisionField.tsx`, `ProbeLens.tsx`,
`LossFunctionsStory.tsx`, `StatGrid.tsx`, `FeatureScalingStory.tsx`, `FeatureScalingLab.tsx`.

The `DecisionField` `PALE` change is shared across logistic / trees / forests — verified
non-regressive, and it incidentally improves the untrained-logistic panel and the
decision-trees impure-leaf band. It's the one fix worth eyeballing personally since logistic
was previously signed off.
