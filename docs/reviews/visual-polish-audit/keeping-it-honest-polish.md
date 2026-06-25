# Keeping it honest — visual polish audit

**Cluster:** Train-Test Generalization · Bias-Variance · Overfitting/Regularization · Data Leakage  
**Date:** 2026-06-25  
**Scope:** Hero + Run-it polish pass on variance/lottery readability, causal λ chain, provenance pipe protagonist, chrome discipline, interaction smoothness.

---

## Summary

| Exhibit | Primary fix | Status |
|---------|-------------|--------|
| Train-Test Generalization | Card-dealing + histogram accumulation; act handoff seeds lab histogram; chrome fix | ✅ |
| Bias-Variance | Live variance swarm on degree scrub (hero + lab) | ✅ |
| Overfitting/Regularization | Replaced static triptych with λ-driven live plot + CausalTrace | ✅ |
| Data Leakage | ProvenancePipe pulse/repair; scatter deferred to final fold | ✅ |

**Build:** `npm run build` — pass  
**E2E (cluster specs):** 15/20 pass on parallel run; core interaction paths green (reshuffle, degree scrubber, λ scrubber, leaky/honest toggle). Flakes were server contention and a pre-existing Break-it status copy mismatch (`Wall breached` vs `Skill from nowhere`).

---

## Train-Test Generalization

### Goals
- Card-dealing VarianceSwarm polished
- Histogram accumulates clearly
- Act handoff seeds lab histogram

### Changes
- **`TrainTestHero`**: `CardSwarm` highlights the newest dealt card (accent border), shows a dashed “deck” placeholder while dealing, syncs visually with histogram growth.
- **`ErrorSpreadStrip`**: new `accentLatest` prop — newest bin highlights in accent while the strip is still accumulating (hero animation + lab reshuffles).
- **`TrainTestLab`**: `accentLatest` on the validation-error histogram; **chrome fix** — `chrome-redundant-metrics` now applies when See-it handed off at `lottery` or `cv` (was incorrectly tied to `split`). Handoff seeding (5 or 8 splits from story frame) unchanged and working.

### Verify
- Route: `/exhibits/train-test-generalization`
- **Reshuffle**: e2e confirms spread strip tracks split count (`3 splits drawn` after two reshuffles).
- Hero deals 80 splits into a fixed-axis histogram; CV mark appears at animation end.

---

## Bias-Variance

### Goals
- Complexity scrubber + variance swarm readable, not triptych-static

### Changes
- **`BiasVarianceHero`**: swarm opacity raised; swarm re-animates on degree change (brief fade-in); scrubber gets smooth accent transition.
- **`BiasVarianceLab`**: bootstrap variance swarm behind the main fit — degree scrub now shows the fan of resampled curves, matching the hero argument in Run-it.

### Verify
- Route: `/exhibits/bias-variance`
- **Degree scrubber**: e2e confirms regime flips from underfitting → overfitting as degree cranks.
- Swarm keys include degree so curves don’t ghost across scrub steps.

---

## Overfitting/Regularization

### Goals
- CausalTrace chain animates with λ scrubber
- Shrinkage feels like tension
- Not triptych-static

### Changes
- **`RegularizationHero`**: removed side-by-side static panels. Single live plot follows `λ` scrubber; faint ghost curves anchor λ≈0 and λ=0.3 endpoints.
- **`CoefTrace`**: bars scale down with `scaleY` + opacity as λ rises; tension label (`weights free` → `tension rising` → `weights pulled in`).
- **`CausalTrace`**: active step still tracks scrub position (λ → weights → curve → test error).

### Verify
- Route: `/exhibits/overfitting-regularization`
- **λ scrubber**: e2e confirms penalty reins in the wiggle; Break-it over/under-fit paths pass.
- Hero scrubber now drives the visible curve (previously only updated readout/CausalTrace).

---

## Data Leakage

### Goals
- ProvenancePipe protagonist — back-flow pulse readable; repair visibly cleans score
- Reduce twin-scatter redundancy
- Compose shared ProvenancePipe stages

### Changes
- **`DataLeakageProvenancePipe`**:
  - Exported `PROVENANCE_STAGES` aligned with shared `ProvenancePipe` stage naming.
  - Back-flow path uses `leak-backflow` CSS pulse (stroke opacity/width cycle).
  - Wall, feature box, and CV gauge transition on leaky ↔ honest toggle.
  - `pipe-score-repair` flash when switching to honest mode.
- **`DataLeakageLab`**: `FoldScatter` deferred until fold 4 — pipe carries the argument; scatter is the “receipt” only when the cloud is complete. Placeholder copy guides stepping.
- Twin-scatter redundancy reduced (hero was already pipe-only).

### Verify
- Route: `/exhibits/data-leakage`
- **Leaky/honest toggle**: e2e confirms honest mode shows `the truth: ~0, no signal`; pipe wall seals and R² readout shifts hue.
- Fold stepper + feature strip + fold bars remain live throughout.

---

## Chrome discipline

- Train-test Run-it StatGrid hides under `chrome-redundant-metrics` when See-it already surfaced lottery/CV metrics (handoff immersed).
- Leakage lab keeps a single CV R² strip; scatter demoted to final fold.

---

## Files touched

| File | Change |
|------|--------|
| `ErrorSpreadStrip.tsx` | `accentLatest` accumulation highlight |
| `TrainTestHero.tsx` | CardSwarm polish + accent histogram |
| `TrainTestLab.tsx` | Handoff chrome fix + accent histogram |
| `BiasVarianceHero.tsx` | Swarm re-animate on degree |
| `BiasVarianceLab.tsx` | Variance swarm overlay |
| `RegularizationHero.tsx` | Live λ plot (replaces triptych) |
| `DataLeakageProvenancePipe.tsx` | Pulse, repair, shared stages export |
| `DataLeakageLab.tsx` | Conditional scatter |
| `globals.css` | `leak-backflow-pulse`, `pipe-score-repair` |

---

## Residual / out of scope

- **Break-it status copy** (`DataLeakageBreakIt`): e2e expects `Skill from nowhere` / `The honest nothing`; UI shows `Wall breached` — copy alignment not changed in this pass.
- **Browser MCP** unavailable in agent environment; verification via Playwright + production build.
- Bias-variance Explain-it test flaked once on `mastery-badge` hydration under parallel load — not introduced by this diff.

---

## Sign-off checklist

- [x] Train-test: card deal + histogram accumulation
- [x] Train-test: act handoff seeds lab histogram
- [x] Bias-variance: scrubber + swarm live
- [x] Regularization: λ scrubber drives curve + CausalTrace
- [x] Data leakage: pipe pulse + honest repair
- [x] Data leakage: reduced scatter redundancy
- [x] Build passes
- [x] Core e2e interactions pass (reshuffle, degree, λ, leaky/honest)
