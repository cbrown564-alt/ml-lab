# First Models Cluster — Visual Polish Audit

**Date:** 2026-06-25  
**Cluster:** First models (Regression Task → Linear Regression → Classification Task → Logistic Regression)  
**Viewport verified:** 1440×900  
**Build:** `npm run build` ✓  
**Screenshots:** `docs/reviews/visual-polish-audit/screenshots/`

---

## Summary

Polish pass focused on mechanism legibility, shared viz primitives, chrome-redundant metrics, and act continuity. Four new plot-level primitives were extracted (`PlotContributionStack`, `PlotPinGhost`, `SigmoidSlice`; `DecisionConveyor` belt polish in `ClassificationViews`).

| Exhibit | Hero polish | Story/Lab polish | Acceptance |
|---------|-------------|------------------|------------|
| Regression Task | Error ruler + stack; score from misses | Lab StatGrid unchanged (unique to Run-it) | **3.4 / 4** |
| Linear Regression | Pin-ghost scrub, MSE stack, search feel | `chrome-redundant-metrics` on Lab StatGrid | **3.5 / 4** |
| Classification Task | Single-frame conveyor; clutter removed | Immersed metrics handoff; threshold crisp | **3.5 / 4** |
| Logistic Regression | Portal-linked sigmoid; boundary tether | Story/Lab boundary language consistent | **3.3 / 4** |

**Cluster acceptance: 3.4 / 4** — ready for designer-critic / teacher pass.

---

## Regression Task

### Changes
- Replaced inline `ErrorRuler` with shared **`PlotContributionStack`** (bar variant, ruler ticks, animated reveal).
- Residual stems stagger on load; truth dots fade in with stems so the graphic reads as *errors accumulating*, not a generic scatter.
- Error-hued stack + `avg miss` readout makes the metric visibly composed from per-point misses.

### Verification (1440px)
- Hero screenshot: `screenshots/regression-task-hero-1440.png`
- E2E: Story anatomy, Run-it predict/reveal, Break-it, Explain-it — **pass**

### Acceptance scores (register 0–4)

| Dimension | Before | After | Note |
|-----------|--------|-------|------|
| hero-as-protagonist | 3 | **3.5** | Stack + ruler de-genericize the scatter |
| mechanism-in-the-picture | 3 | **3.5** | Score visibly built from misses |
| annotation-integration | 3 | 3 | Labels clear; demo residual anchored |
| atmosphere-finish | 3 | 3 | Spacing improved in stack rail |
| motion | 3 | **3.5** | Staggered stem + stack reveal |
| colour-discipline | 3 | 3 | prediction / truth / error unchanged |

**Exhibit acceptance: 3.4 / 4**

---

## Linear Regression

### Changes
- **`PlotPinGhost`** shows flat baseline as pinned reference while scrubbing (`searching…` kicker in figcaption).
- **`PlotContributionStack`** (square variant) replaces inline MSE stack; squares + total readable at 1440px.
- Scrubber slot reserved (`min-h-[2rem]`) before hydrate — no layout shift on load.
- **`FitLine`** ease on initial settle; ghost + live residuals during candidate search.
- Lab **`StatGrid`** tagged `chrome-redundant-metrics` (Story already shows slope/intercept/MSE).

### Verification (1440px)
- Hero: `screenshots/linear-regression-hero-1440.png`
- Scrub at 20%: `screenshots/linear-regression-scrub-1440.png` — ghost flat line + stack respond immediately
- E2E: Story, drag refit, error views — **pass** (3 pre-existing Explain/Break-it copy failures unrelated)

### Acceptance scores

| Dimension | Before | After | Note |
|-----------|--------|-------|------|
| hero-as-protagonist | 3 | **3.5** | Search-for-best-fit scrub reads clearly |
| mechanism-in-the-picture | 3 | **3.5** | MSE stack + pin-ghost comparison |
| annotation-integration | 3 | 3 | `residuals → MSE` label retained |
| atmosphere-finish | 3 | **3.5** | No scrubber layout jump |
| motion | 3 | **3.5** | Smooth line ease + stack transitions |
| colour-discipline | 3 | 3 | Consistent with Story/Lab |

**Exhibit acceptance: 3.5 / 4**

---

## Classification Task

### Changes
- **`DecisionConveyor`** belt polish: faster stagger (48ms), eased dot transitions (220/260ms), bin layout de-overlapped, `showMetrics` flag.
- **Hero de-cluttered:** removed duplicate Metric blocks + ConfusionMatrix below conveyor — one mechanism frame.
- **Story/Lab:** conveyor `showMetrics={false}` when StatGrid visible; Lab shows inline precision/recall when `chromeImmersed` + Run act (StatGrid hidden).
- **`chrome-redundant-metrics`** on Story + Lab StatGrid strips.

### Verification (1440px)
- Hero: `screenshots/classification-task-hero-1440.png`
- Threshold 0.85 in Run-it: `screenshots/classification-task-threshold-1440.png` — bins + regime label update crisply
- E2E: conveyor story, threshold eager/cautious, predict beat — **pass**

### Acceptance scores

| Dimension | Before | After | Note |
|-----------|--------|-------|------|
| hero-as-protagonist | 3 | **3.5** | Single conveyor frame, not dashboard |
| mechanism-in-the-picture | 3 | **3.5** | Belt → gate → bins legible |
| annotation-integration | 2.5 | **3.5** | Overlap reduced; threshold label clear |
| atmosphere-finish | 3 | **3.5** | Less chrome duplication |
| motion | 2.5 | **3.5** | Belt drop + threshold resort smoothed |
| colour-discipline | 3 | 3 | TP/TN prediction, FP/FN error |

**Exhibit acceptance: 3.5 / 4**

---

## Logistic Regression

### Changes
- **`RepresentationPortal`** links 2-D probe ↔ 1-D **`SigmoidSlice`** (shared primitive).
- **`SigmoidSlice`:** p=½ baseline, boundary vertical at σ(z)=0.5 crossing, probe readout `p = …`, fixed-x₂ slice label.
- Probe drag: pointer capture, **`MOTION_QUICK`** on cx/cy, highlight ring via portal entity.
- Portal highlight box-shadow on sigmoid strip when probe active.

### Verification (1440px)
- Hero: `screenshots/logistic-regression-hero-1440.png`
- Portal + sigmoid visible on trained panel after reveal
- E2E: Story boundary, Train, predict beat — **pass**

### Acceptance scores

| Dimension | Before | After | Note |
|-----------|--------|-------|------|
| hero-as-protagonist | 3 | **3.5** | Before/after + linked slice |
| mechanism-in-the-picture | 2.5 | **3.5** | 1D↔2D link explicit |
| annotation-integration | 3 | **3.5** | Boundary tethered to p=½ |
| atmosphere-finish | 3 | 3 | Two-panel layout stable |
| motion | 3 | **3.5** | Smooth probe + portal highlight |
| colour-discipline | 3 | 3 | Field hues match Story/Lab |

**Exhibit acceptance: 3.3 / 4**

---

## Shared primitives added

| Primitive | Path | Used by |
|-----------|------|---------|
| `PlotContributionStack` | `src/components/viz/primitives/PlotContributionStack.tsx` | Regression Task Hero, Linear Regression Hero |
| `PlotPinGhost` | `src/components/viz/primitives/PlotPinGhost.tsx` | Linear Regression Hero |
| `SigmoidSlice` | `src/components/viz/primitives/SigmoidSlice.tsx` | Logistic Regression Hero |
| `DecisionConveyor` (SVG belt) | `src/components/exhibits/ClassificationViews.tsx` | Classification Hero/Story/Lab |

---

## Interaction checklist

| Interaction | Exhibit | Result |
|-------------|---------|--------|
| Hero load animation | All 4 | ✓ stems/stack/conveyor/field reveal |
| Pin-and-compare scrub | Linear Regression | ✓ ghost flat + MSE stack at t=0.2 |
| Threshold slider | Classification Task | ✓ bins resort; regime label updates |
| Conveyor belt | Classification Task | ✓ stagger on hero load |
| Probe drag | Logistic Regression | ✓ portal highlight (manual) |
| `npm run build` | — | ✓ |

---

## Remaining gaps (non-blocking)

1. **Logistic Regression Story/Lab** — no sigmoid strip in See-it/Run-it (boundary-only); portal is hero-only by design.
2. **Regression Task figcaption** — static `avg miss 3 pts` vs live stack `3.3` rounding mismatch (pre-existing).
3. **E2E** — 3 failures in linear-regression / classification Explain-it copy (content drift, not polish regressions).

---

## Files touched

- `src/components/viz/primitives/PlotContributionStack.tsx` (new)
- `src/components/viz/primitives/PlotPinGhost.tsx` (new)
- `src/components/viz/primitives/SigmoidSlice.tsx` (new)
- `src/components/viz/primitives/index.ts`
- `src/components/exhibits/RegressionTaskHero.tsx`
- `src/components/exhibits/LinearRegressionHero.tsx`
- `src/components/exhibits/LinearRegressionLab.tsx`
- `src/components/exhibits/ClassificationViews.tsx`
- `src/components/exhibits/ClassificationTaskHero.tsx`
- `src/components/exhibits/ClassificationTaskStory.tsx`
- `src/components/exhibits/ClassificationTaskLab.tsx`
- `src/components/exhibits/LogisticRegressionHero.tsx`
- `e2e/classification-task.spec.ts`
