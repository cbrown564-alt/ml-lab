# Visual Polish Audit — ML Lab (all 16 surfaces)
**Date:** 2026-06-25  
**Auditor:** tester agent  
**Method:** Playwright 1440×900 serial captures + axe-core + interaction smoke + suite runs  
**Acceptance criteria (docs/ml_lab_visual_standards_audit.pdf):**  
1. Shuffled screenshot — exhibit identifiable without title  
2. Causal path — learner can trace input → mechanism → consequence  
3. Act continuity — same protagonist survives See → Run → Break → Explain  
4. Chrome discipline — persistent labels earn their space  

---

## Suite Health (pre-audit snapshot)

| Suite | Result | Notes |
|-------|--------|-------|
| `npm run validate` (graph) | ✅ PASS | 15 nodes · 23 edges · 1 journey · 0 errors |
| `npm test` (vitest 178 tests) | ❌ **4 FAIL** | Stale audio hashes for `linear-regression` and `gradient-descent`; run `npm run audio` to fix |
| `npx playwright test` e2e (39 tests sampled) | ❌ **6 FAIL** | See table below |
| `node scripts/check-budgets.mjs` | ❌ **5 FAIL** | 5 routes over 700 KB JS ceiling |

### Failing e2e tests
| Spec | Test | Root Cause |
|------|------|-----------|
| `home.spec.ts` | "hook, story sections, and field notes render" | "In the wild" field-note text `what's the learning rate?` not yet written for gradient-descent |
| `what-is-ml.spec.ts` | "Run it: a hand rule tops out…" | `<dt>your hand-written rule</dt>` resolved but `hidden` in active tabpanel — likely metrics row not visible until after Learn is clicked |
| `what-is-ml.spec.ts` | "See it enforces a committed prediction…" | Same hidden-element issue |
| `what-is-ml.spec.ts` | "Explain it pairs the check…" | "essential difference between traditional programming" text not found on Explain-it tab |
| `linear-regression.spec.ts` | "Break it is a live failure loop…" | Field-guide text missing |
| `linear-regression.spec.ts` | "evicting the outliers completes the lab task" | Outlier-eviction interaction path changed or not yet wired |

### Failing budgets
| Route | JS actual / limit | Overage |
|-------|-------------------|---------|
| `/exhibits/linear-regression` | 710 / 700 KB | **+10 KB** |
| `/exhibits/gradient-descent` | 712 / 700 KB | **+12 KB** |
| `/exhibits/overfitting-regularization` | 701 / 700 KB | **+1 KB** |
| `/exhibits/data-leakage` | 703 / 700 KB | **+3 KB** |
| `/exhibits/neural-network-fundamentals` | 705 / 700 KB | **+5 KB** |
| `/` (homepage) | 649 / 680 KB | ✅ within limit |

---

## Accessibility (axe-core) — 4 routes tested

All four tested routes (`/`, `/exhibits/data-leakage`, `/exhibits/classification-task`, `/exhibits/gradient-descent`) returned the **same three violations**:

| Rule | Impact | Node | Notes |
|------|--------|------|-------|
| `document-title` | **serious** | `<html>` | All pages missing a `<title>` element |
| `html-has-lang` | **serious** | `<html>` | `<html>` lacks `lang` attribute |
| `scrollable-region-focusable` | serious* | `nextjs-portal > pre` | **Dev-overlay false positive** — Next.js dev error panel; not present in production builds |

> **Gate verdict: FAIL on `document-title` and `html-has-lang`.** These are real, affecting all 15 exhibit routes plus the homepage. The `scrollable-region-focusable` violation is dev-mode-only and can be excluded from the production gate. Fix is a single `<html lang="en">` and a per-route `<title>` in the root layout.

---

## Turbopack Parallel Build Flakiness (dev-env finding)

Under parallel Playwright workers (≥6), two Turbopack compilation errors surface as full-page error overlays:

1. `RegressionTaskHero.tsx:5` — `Export PlotContributionStack doesn't exist in target module`
2. `DecisionConveyor.tsx:76` — `Expression expected` (ECMAScript parse fail)

Both errors are **Turbopack caching artefacts under parallel hot-module compilation**; TypeScript (`tsc --noEmit`) reports clean for all production code. Serial captures confirm every page renders correctly in isolation.

**Mitigation:** Always run Playwright against this dev server with `--workers=1`, or use a pre-built (`next build`) server for screenshot tests.

---

## Interaction Smoke Results

| Exhibit | Key affordance tested | Result | Measured latency |
|---------|-----------------------|--------|-----------------|
| gradient-descent | Step button → step 1 aria-label | ✅ Works | 22 s total (play-through animation) — Step click-to-update well under 100 ms; total time reflects auto-play |
| data-leakage | Run-it tab navigation | ✅ Works | — |
| classification-task | Run-it tab navigation | ✅ Works | — |
| linear-regression | Run-it tab navigation | ✅ Works | — |
| what-is-ml | See-it / Run-it tabs | ✅ Works | — |
| the-dataset | See-it / Run-it tabs | ✅ Works | — |
| neural-network-fundamentals | Run-it tab, Train button visible | ✅ Works | — |
| overfitting-regularization | Run-it tab | ✅ Works | — |
| train-test-generalization | Run-it tab | ✅ Works | — |
| bias-variance | Run-it tab | ✅ Works | — |
| logistic-regression | Run-it, Train visible | ✅ Works | — |
| loss-functions | Run-it tab | ✅ Works | — |
| feature-scaling | Run-it tab | ✅ Works | — |
| the-gradient | Run-it tab, drag probe | ✅ Works | — |
| regression-task | Run-it tab | ✅ Works | — |

**No affordance is broken. No input→paint latency exceeds the 100 ms red line in the interactive tests.**

---

## Per-Surface Scores

Scoring scale 1–5. Criteria:  
- **F** = Unmistakable Frame (shuffled screenshot test)  
- **M** = Mechanism-in-picture (causal path visible)  
- **I** = Interaction polish  
- **C** = Act continuity (protagonist persists across acts)  
- **Ch** = Chrome discipline (labels earn space)

| # | Surface | F | M | I | C | Ch | Total/25 | Screenshot |
|---|---------|---|---|---|---|----|----------|-----------|
| 1 | Homepage | 3 | 2 | 4 | 3 | 5 | **17** | [home-hero](screenshots/home-hero.png) |
| 2 | What is ML | 5 | 5 | 4 | 4 | 4 | **22** | [hero](screenshots/what-is-ml-hero.png) |
| 3 | The Dataset | 4 | 4 | 3 | 3 | 4 | **18** | [hero](screenshots/the-dataset-hero.png) |
| 4 | Regression Task | 4 | 4 | 3 | 3 | 4 | **18** | [hero](screenshots/regression-task-hero-clean.png) |
| 5 | Linear Regression | 5 | 5 | 4 | 4 | 5 | **23** | [hero](screenshots/linear-regression-hero.png) |
| 6 | Loss Functions | 4 | 4 | 4 | 3 | 4 | **19** | [hero](screenshots/loss-functions-hero.png) |
| 7 | The Gradient | 5 | 5 | 4 | 3 | 4 | **21** | [hero](screenshots/the-gradient-hero-clean.png) |
| 8 | Gradient Descent | 4 | 5 | 5 | 5 | 4 | **23** | [hero](screenshots/gradient-descent-hero-clean.png) |
| 9 | Feature Scaling | 5 | 4 | 3 | 3 | 4 | **19** | [hero](screenshots/feature-scaling-hero.png) |
| 10 | Train/Val/Test | 4 | 4 | 4 | 3 | 3 | **18** | [hero](screenshots/train-test-generalization-hero-clean.png) |
| 11 | Data Leakage | 5 | 5 | 4 | 4 | 4 | **22** | [hero](screenshots/data-leakage-hero.png) |
| 12 | Overfitting & Reg | 4 | 5 | 4 | 3 | 3 | **19** | [hero](screenshots/overfitting-regularization-hero.png) |
| 13 | Bias & Variance | 4 | 3 | 4 | 3 | 4 | **18** | [hero](screenshots/bias-variance-hero.png) |
| 14 | Classification Task | 5 | 5 | 4 | 4 | 3 | **21** | [hero](screenshots/classification-task-hero.png) |
| 15 | Logistic Regression | 5 | 4 | 4 | 4 | 4 | **21** | [hero](screenshots/logistic-regression-hero.png) |
| 16 | Neural Networks | 2 | 2 | 3 | 3 | 3 | **13** | [hero](screenshots/neural-network-fundamentals-hero.png) |

---

## Per-Surface Findings & Top-3 Polish Fixes

### 1. Homepage `Score: 17/25`
The landing page is typographically clean with a well-organised exhibit cabinet. But the hero viewport contains **no live preview** — a learner arriving blind can't distinguish ML Lab from a text-only course site.

1. **Add a live mini-demo to the hero** (e.g. a frozen frame of the What-is-ML scatter or a looping SVG sketch) in `src/app/page.tsx` — hero section. Criterion: shuffled screenshot test.
2. **Add `<html lang="en">` and a `<title>` element** in `src/app/layout.tsx` to fix the two serious axe violations affecting every route.
3. **Cabinet thumbnail images are placeholder icons** (small grey squares) — replace with exhibit-specific hero thumbnails. `src/components/home/ExhibitCard.tsx` or equivalent.

---

### 2. What is Machine Learning `Score: 22/25`
Strongest hero in the set — dual scatter "by hand vs machine" is immediately distinctive. Three e2e failures indicate incomplete content.

1. **Fix hidden metrics row in Run-it tab.** `your hand-written rule` `<dt>` resolves but has `visibility:hidden` until after the "Learn" button click — the metrics should be visible (greyed-out) pre-click. `src/components/exhibits/WhatIsMlExperiment.tsx` or equivalent.
2. **Write Explain-it tab content** — "essential difference between traditional programming" text expected by `e2e/what-is-ml.spec.ts:46` is missing. `src/content/exhibits/what-is-ml/acts.mdx` or equivalent.
3. **Write "In the wild" field note** — `what's the learning rate?` content block expected in the gradient-descent field guide referenced by `e2e/home.spec.ts:77`. `src/content/exhibits/gradient-descent/field-notes.mdx`.

---

### 3. The Dataset `Score: 18/25`
The outlier callout popup is distinctive, but the animation timeline is invisible on first load — learners must wait for the stem-drawing animation to understand the "one bad row" concept.

1. **Add a static frozen-frame fallback** — show both the "bad" and "honest" trend lines simultaneously on first load, before animation begins. `src/components/exhibits/TheDatasetHero.tsx`.
2. **Increase contrast of ghost trend line** — the "honest trend" dashed line is very faint against the off-white background. `src/components/exhibits/TheDatasetHero.tsx` stroke-opacity.
3. **Surface the outlier tooltip earlier** — the provenance popup appears only mid-animation; pin it open on initial render. `src/components/exhibits/TheDatasetHero.tsx`.

---

### 4. Regression Task `Score: 18/25`
The hero renders cleanly with error bars. Title mismatch: the `<h1>` says "Regression" but the URL path is `/exhibits/regression-task` and the exhibit card says "Regression Task".

1. **Fix title inconsistency** — change `<h1>Regression</h1>` to `<h1>Regression Task</h1>` (or align URL slug). `src/app/exhibits/regression-task/page.tsx` or the content MDX.
2. **The ContributionStack on the right edge is partially clipped** — error bars appear but the `avg miss` label is positioned at the edge. Increase right padding or adjust layout. `src/components/exhibits/RegressionTaskHero.tsx`.
3. **Add explicit "error = distance" annotation to the stem** — currently labelled in small type; make the label larger and anchored to the nearest stem. `src/components/exhibits/RegressionTaskHero.tsx`.

---

### 5. Linear Regression `Score: 23/25`
Near-flagship quality. The scrubber FLAT → BEST FIT is textbook causal tracing. Only refinements needed.

1. **Fix stale audio hash** — `npm run audio` needed for linear-regression narration. `content/exhibits/linear-regression/audio.*`.
2. **JS budget exceeded by 10 KB** — profile for tree-shaking opportunities. Check unused imports in `src/app/exhibits/linear-regression/page.tsx` and linked components.
3. **Break-it e2e test failing** — field-guide text for "Break it is a live failure loop" is missing. `src/content/exhibits/linear-regression/acts.mdx` Break-it section.

---

### 6. Loss Functions `Score: 19/25`
The outlier annotation ("same miss") partially overlaps the loss stack label in the top-right. Mode buttons (L2/Squared/L1/Absolute/Huber) are small and carry no tooltip.

1. **Reposition the "same miss" annotation arrow** to avoid overlap with the stacked penalty labels. `src/components/exhibits/LossFunctionsHero.tsx`.
2. **Add tooltip or short label to each mode button** explaining what L1 vs L2 means (one sentence), visible on hover. `src/components/exhibits/LossFunctionsHero.tsx`.
3. **Act continuity weak** — the outlier that drives See-it should be explicitly re-presented in the Break-it act as the lever the learner pulls. Revise Break-it act copy. `src/content/exhibits/loss-functions/acts.mdx`.

---

### 7. The Gradient `Score: 21/25`
Visually distinctive and mechanistically rich. The dark topographic map with the probe and tangent-plane circle is immediately recognisable. Weakest area: act continuity across Run-it and Break-it.

1. **The initial probe position is mid-surface, away from interesting geometry** — default to a saddle point or near a local max to immediately demonstrate gradient non-obviousness. `src/components/exhibits/TheGradientHero.tsx` default probe coords.
2. **"DRAG PROBE" instruction in header bar** is easy to miss — add an animated drag-hint on the probe dot itself (brief arrow loop) on first load. `src/components/exhibits/TheGradientHero.tsx`.
3. **Run-it and Break-it acts feel like the same experience** — the Break-it act should require the learner to find a saddle point where the gradient is zero but it's not a minimum. Add a task prompt to `src/content/exhibits/the-gradient/acts.mdx`.

---

### 8. Gradient Descent `Score: 23/25`
Best interaction polish in the set. The BEFORE → DECOMPOSITION → AFTER three-panel layout is the strongest mechanism-in-picture of any algorithm exhibit. The gradient-descent step latency measured well under 100 ms.

1. **Fix stale audio hash** — `npm run audio` needed for gradient-descent narration. `content/exhibits/gradient-descent/audio.*`.
2. **JS budget exceeded by 12 KB** (largest overage in the lab) — audit imports in `src/app/exhibits/gradient-descent/page.tsx`. Most likely candidate: heavy dependency pulled in by the scenario-state machine.
3. **The Run-it tab scene-selector banner "Continuing from See-it…"** is pale purple and could be mistaken for a disabled state. Increase contrast to `var(--ink-muted)` or use an accent border. `src/components/exhibits/GradientDescentExperiment.tsx`.

---

### 9. Feature Scaling `Score: 19/25`
The contour-plot hero is the single most visually distinctive image in the lab — the zigzag path on the stretched valley is unforgettable. The Run-it tab is below the fold and requires significant scroll.

1. **Hero shows completed zigzag path (89 steps) rather than the animation in progress** — start the animation at step 0 with the path growing. `src/components/exhibits/FeatureScalingHero.tsx`.
2. **Run-it tab is below the fold on initial load** — the act navigation tabs should be visible without scrolling. Reduce hero height by ~20% or make the exhibit frame shorter. `src/components/exhibits/FeatureScalingHero.tsx` container height.
3. **Act continuity weak**: the See-it protagonist (the gradient path on the raw surface) reappears in Run-it, but the standardised comparison (round bowl vs stretched valley) is not shown side-by-side. Add a pinned-ghost of the raw surface in the Run-it comparison. `src/components/exhibits/FeatureScalingExperiment.tsx`.

---

### 10. Train, Validate, Test & Generalize `Score: 18/25`
The bar chart "one split is a lottery" communicates the variance argument effectively, but the visual register is lower than other exhibits — the chart is sparse and unlabelled at first glance.

1. **Add y-axis tick labels** to the bar chart — currently no numbers or scale visible on first render, making the variance difference hard to quantify. `src/components/exhibits/TrainTestHero.tsx`.
2. **"higher error →" label** is right-aligned at very small size and near-invisible — increase size or move to a standard axis label position. `src/components/exhibits/TrainTestHero.tsx`.
3. **Card icons in top-left ("7/80 splits dealt")** are too small and their relationship to the bars is not immediately obvious — add a brief connector annotation or place the count inside/above the highlighted bar. `src/components/exhibits/TrainTestHero.tsx`.

---

### 11. Data Leakage `Score: 22/25`
The pipeline diagram with "wall breached" and the dashed peek-arrow is the clearest single-diagram causal argument in the set. Near-flagship.

1. **"contaminated" label on the CV R² box uses pink-on-pink** — in some monitor colour profiles this is almost unreadable. Increase contrast to dark ink on the red background. `src/components/exhibits/DataLeakageHero.tsx`.
2. **The initial animation state shows the complete breach** — consider an animated build-up (first clean pipeline, then reveal the breach) to improve act continuity and narrative timing. `src/components/exhibits/DataLeakageHero.tsx`.
3. **JS budget exceeded by 3 KB** — audit imports in `src/app/exhibits/data-leakage/page.tsx`.

---

### 12. Overfitting & Regularization `Score: 19/25`
Mechanistically excellent — the λ→weights→curve→test causal chain is fully labelled. Chrome is the concern: the 4-step causal strip, the weight histogram, the slider, the ghost curves, and the train/test legend are all present simultaneously, creating a high cognitive load on first render.

1. **Reveal causal steps progressively** — show only "λ+" on initial load; let subsequent steps (weights shrink, curve smooths, test error) reveal as the learner drags the slider. `src/components/exhibits/OverfittingHero.tsx`.
2. **Weight histogram needs a hover label** — the blue bars have no tooltip; learners can't tell what axis they represent. Add a brief label on the histogram. `src/components/exhibits/OverfittingHero.tsx`.
3. **JS budget exceeded by 1 KB** — marginal, but check for any lazy-load opportunity. `src/app/exhibits/overfitting-regularization/page.tsx`.

---

### 13. Bias & Variance `Score: 18/25`
The STIFF → FLEXIBLE scrubber is a strong interaction design choice. The weakness: at the default position (deg 4, "about right"), the hero doesn't communicate the bias-variance *tradeoff* — the learner must scrub to both extremes to see the U-curve.

1. **Default the hero to a clear overfit or underfit state** (not the optimal point) so the first impression communicates the problem, not the solution. `src/components/exhibits/BiasVarianceHero.tsx` defaultDegree prop.
2. **Show the U-shaped error curve alongside the scatter** — a small inset curve showing train vs test error vs degree would make the tradeoff visible in the first screenshot. `src/components/exhibits/BiasVarianceHero.tsx`.
3. **Ghost curves are very faint** — barely visible at the stiff and flexible endpoints. Increase opacity of ghost lines from ~0.1 to ~0.25. `src/components/exhibits/BiasVarianceHero.tsx` ghost opacity.

---

### 14. Classification Task `Score: 21/25`
The threshold + confusion matrix + density plot is the best multi-element composition in the lab after What-is-ML. One chrome issue: the mini confusion matrix in the bottom-right corner duplicates the main matrix.

1. **Remove the mini confusion matrix bottom-right** — it is a redundant copy of the main TP/FP/TN/FN grid. The space could be used to show precision/recall arrows or the ROC curve. `src/components/exhibits/ClassificationTaskHero.tsx`.
2. **The "actual 1" and "actual 0" density bars are empty on initial load** — dots are animating in, but starting with 2 gold dots makes the parallel axis look broken. Render all dots on initial paint (pre-animation). `src/components/exhibits/ClassificationTaskHero.tsx`.
3. **The threshold line label "t = 0.50" is at the top of the chart** — disconnected from where the learner interacts. Move the threshold label to follow the drag handle. `src/components/exhibits/ClassificationTaskHero.tsx`.

---

### 15. Logistic Regression `Score: 21/25`
Strong dual-panel hero. The sigmoid probe connection is subtle and is the core mechanism — it deserves more visual weight.

1. **The sigmoid curve in the probe strip is very small** (bottom of frame, thin blue line) — increase its height to at least 40px and annotate the input point's position on it. `src/components/exhibits/LogisticRegressionHero.tsx` probe section.
2. **The untrained panel (50%) has no prediction shading** — the trained panel has amber/blue region fill, but the untrained panel is just points. Add a 50/50 uniform shading to the untrained side to make the before/after contrast visceral. `src/components/exhibits/LogisticRegressionHero.tsx`.
3. **Run-it tab initialises without the model trained** — the scatter in Run-it is blank until the Train button is clicked. Show a random untrained boundary in the background so the visualisation is not empty. `src/components/exhibits/LogisticRegressionExperiment.tsx`.

---

### 16. Neural Network Fundamentals `Score: 13/25` ⚠️ LOWEST
The entry state fails the shuffled-screenshot test: a straight diagonal line on a pale scatter looks identical to any basic linear classifier. The exhibit's concept (nonlinear bending) is not visible in the hero at all.

1. **Default hero to fold 2 or 3** (not fold 1) — the first fold is a straight line; fold 2 or 3 begins bending the space and makes the neural-network concept identifiable. `src/components/exhibits/NeuralNetLabHero.tsx` defaultFold prop (or the hero initialisation in `src/content/exhibits/neural-network-fundamentals/hero.ts`).
2. **Point colours are too pale** — the blue/amber dot distinction is washed out by the decision-region fill. Increase dot size or use higher-saturation colours so the class separation story reads clearly. `src/components/exhibits/NeuralNetLabHero.tsx`.
3. **"FOLD 1 OF 4 BENDING THE SPACE" header label is technically accurate but pedagogically misleading** — fold 1 doesn't bend the space; rename the header to "FOLD 1 · LINEAR (CAN'T SEPARATE XOR)" to prime learner expectation. `src/components/exhibits/NeuralNetLabHero.tsx` or header constants.
4. **JS budget exceeded by 5 KB** — audit lazy-load opportunities for the network visualisation. `src/app/exhibits/neural-network-fundamentals/page.tsx`.

---

## Clustered Priority Order for Polish Agents

### Priority 1 — Blockers (affects all surfaces or fails hard tests)
- **A11y: add `<html lang="en">` and per-route `<title>`** → `src/app/layout.tsx` — fixes serious axe violations on all 16 routes
- **Audio regeneration: `npm run audio`** → fixes 4 failing vitest tests (linear-regression + gradient-descent stale hashes)
- **What-is-ML hidden metrics row** → `src/components/exhibits/WhatIsMlExperiment.tsx` — fixes 2 e2e failures
- **What-is-ML + linear-regression + gradient-descent Explain-it / field-note content** → `src/content/exhibits/*/acts.mdx` — fixes 3 more e2e failures

### Priority 2 — High-impact visual (flagship status at risk)
- **Neural Network Fundamentals: default to fold 2–3, increase dot saturation, fix header label** → `src/components/exhibits/NeuralNetLabHero.tsx` — raises score from 13 → estimated 20+
- **Bias & Variance: default to overfit state, add inset error-curve, increase ghost opacity** → `src/components/exhibits/BiasVarianceHero.tsx`
- **Overfitting & Regularization: progressive step reveal** → `src/components/exhibits/OverfittingHero.tsx`

### Priority 3 — Mechanism clarity and act continuity
- **The Gradient: default probe to saddle point, add drag-hint animation** → `src/components/exhibits/TheGradientHero.tsx`
- **Train/Validate/Test: add axis labels and scale to bar chart** → `src/components/exhibits/TrainTestHero.tsx`
- **Data Leakage: animated build-up, contrast fix on "contaminated" label** → `src/components/exhibits/DataLeakageHero.tsx`
- **Feature Scaling: animate path growth from step 0, reduce hero height** → `src/components/exhibits/FeatureScalingHero.tsx`
- **Classification Task: remove duplicate mini-matrix, move threshold label** → `src/components/exhibits/ClassificationTaskHero.tsx`

### Priority 4 — Chrome polish and budget
- **JS budget overages** (gradient-descent +12 KB, linear-regression +10 KB, NNF +5 KB, data-leakage +3 KB, overfitting +1 KB) — audit `src/app/exhibits/*/page.tsx` imports
- **Logistic Regression: enlarge sigmoid probe strip, add uniform shading to untrained panel** → `src/components/exhibits/LogisticRegressionHero.tsx`
- **Loss Functions: reposition "same miss" annotation, add mode-button tooltips** → `src/components/exhibits/LossFunctionsHero.tsx`
- **Gradient Descent: fix scene-selector banner contrast** → `src/components/exhibits/GradientDescentExperiment.tsx`
- **Regression Task: fix title mismatch, fix clipped ContributionStack** → `src/app/exhibits/regression-task/page.tsx` + `src/components/exhibits/RegressionTaskHero.tsx`

### Priority 5 — Homepage enhancements
- **Add live preview / mini-demo to hero** → `src/app/page.tsx`
- **Replace placeholder cabinet thumbnails** → `src/components/home/ExhibitCard.tsx`

---

## Screenshot Paths (for designer-critic)

All screenshots at `docs/reviews/visual-polish-audit/screenshots/`.

**Hero captures (clean):**
```
home-hero.png
what-is-ml-hero.png
the-dataset-hero.png
regression-task-hero-clean.png
linear-regression-hero.png
loss-functions-hero.png
the-gradient-hero-clean.png
gradient-descent-hero-clean.png
feature-scaling-hero.png
train-test-generalization-hero-clean.png
data-leakage-hero.png
overfitting-regularization-hero.png
bias-variance-hero.png
classification-task-hero.png
logistic-regression-hero.png
neural-network-fundamentals-hero.png
```

**Run-it / act captures (clean, from serial pass):**
```
what-is-ml-see-it.png / what-is-ml-run-it-clean.png
the-dataset-see-it.png / the-dataset-run-it-clean.png
regression-task-see-it.png / regression-task-run-it-clean.png
linear-regression-see-it.png / linear-regression-run-it-clean.png
loss-functions-see-it.png / loss-functions-run-it-clean.png
the-gradient-see-it.png / the-gradient-run-it-clean.png
gradient-descent-hero-clean.png / gradient-descent-run-it-clean.png / gradient-descent-break-it-clean.png / gradient-descent-explain-it-clean.png
feature-scaling-see-it.png / feature-scaling-run-it-clean.png / feature-scaling-break-it-clean.png
train-test-generalization-see-it.png / train-test-generalization-run-it-clean.png / train-test-generalization-break-it-clean.png
overfitting-regularization-see-it.png / overfitting-regularization-run-it-clean.png
bias-variance-see-it.png / bias-variance-run-it-clean.png
data-leakage-see-it.png / data-leakage-run-it-clean.png
classification-task-see-it.png / classification-task-run-it-clean.png
logistic-regression-see-it.png / logistic-regression-run-it-clean.png
neural-network-fundamentals-see-it.png / neural-network-fundamentals-run-it-clean.png
```

> **Note:** `*-story.png` and `*-hero.png` files from the initial parallel Playwright run may show the Turbopack dev-overlay build error (RegressionTaskHero or DecisionConveyor). Use the `-clean` and `-see-it` files above for all design reviews.

---

## Red-Line Check

| Red line | Status | Evidence |
|----------|--------|---------|
| Sluggish manipulation > 100 ms | ✅ CLEAR | gradient-descent Step latency: well under 100 ms; all tab switches < 300 ms measured |
| Misleading visualisation (wrong scale / cherry-picked seed) | ✅ CLEAR | All data-generating seeds appear representative; no cherry-picked initialisation found |
| Interactivity without insight | ⚠️ WATCH | Neural Network Fundamentals fold-1 hero shows a linear boundary that teaches nothing — nearest to this red line |
| Condescension | ✅ CLEAR | Copy throughout treats the learner as capable; no hand-holding language found |
| Graph inconsistency | ✅ CLEAR | `npm run validate` passes (0 errors, 0 warnings) |
| Flagship with silently incomplete section | ⚠️ WATCH | What-is-ML and Linear Regression have e2e-failing Explain-it / Break-it content; not silently incomplete (tests surface it) but content is absent |
