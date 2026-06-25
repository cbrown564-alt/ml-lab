# How models learn — visual polish audit

**Cluster:** Loss Functions · The Gradient · Gradient Descent · Feature Scaling  
**Date:** 2026-06-25  
**Scope:** Hero specimens, story/lab handoffs, shared viz primitives

---

## Summary

Polish pass across the four “How models learn” exhibits. Each hero now uses the visual-standards primitive it was scoped for (CounterfactualReplay semantics, ProbeLens, StepMicroscope, single-canvas morph). Run-it labs surface act handoffs from See-it. Build and the full Playwright suite for these routes pass.

| Exhibit | Primary change | Status |
|---------|----------------|--------|
| Loss Functions | Judge toggle morphs one fixed miss; penalty stack labelled | ✅ |
| The Gradient | ProbeLens + on-field ∂f/∂x/∂f/∂y legs | ✅ |
| Gradient Descent | StepMicroscope layout; handoff banner in Run-it | ✅ |
| Feature Scaling | Single-canvas morph; story→lab scaling handoff | ✅ |

---

## Loss Functions

**Goal:** L1/L2/Huber toggle feels like one miss deforming; penalty stack legible.

**Changes (`LossFunctionsHero.tsx`):**
- Judge buttons now drive a **520 ms morph** between fits (lerp slope/intercept) instead of an instant swap — same outlier, deforming line.
- Outlier residual drawn as a dashed vertical segment with ring; penalty bar labelled “outlier penalty”.
- **ContributionStack** relabelled (“penalty stack” / “mean loss”); outlier bar highlighted; widths morph with the judge.
- `usePrefersReducedMotion` — reduced motion jumps to the target judge with no scrub.

**Verify:** `/exhibits/loss-functions` → hero buttons L2 / L1 / Huber; watch line and right stack morph together.

---

## The Gradient

**Goal:** ProbeLens draggable; tangent readouts crisp; not a flat poster.

**Changes:**
- `TheGradientHero.tsx` wraps the landscape in **ProbeLens** (controlled open, 148 px lens) with a `TangentReadout` bar chart (∂f/∂x, ∂f/∂y, |∇f|).
- `GradientField.tsx` — new `showComponents` draws orthogonal **component legs** on the field (truth hue = ∂f/∂x, prediction hue = ∂f/∂y) before the main gradient arrow.
- `ProbeLens.tsx` — controlled mode no longer auto-closes on mouse leave (dragging the probe doesn’t dismiss the lens).

**Verify:** `/exhibits/the-gradient` → drag probe; component legs and lens readouts track live.

---

## Gradient Descent

**Goal:** StepMicroscope decomposition readable; compose shared primitive; act handoff visible.

**Changes:**
- `GradientDescentMicroscope.tsx` refactored to compose **`StepMicroscope`**: θₜ sketch → decomposition bars (∇L → α∇L → Δθ + loss strip) → θₜ₊₁ sketch.
- Horizontal scroll wrapper for narrow viewports.
- Entrance fade respects `reveal` + reduced motion.
- `GradientDescentLab.tsx` — **handoff banner** when See-it frame seeds Run-it (scenario, view, microscope).

**Verify:**
1. Hero `/exhibits/gradient-descent` — “One update” microscope layout reads left-to-right.
2. See-it → advance to “slope-step-repeat” beat (microscope) → Run it → banner shows scenario + microscope view; “One step” face pre-selected.

---

## Feature Scaling

**Goal:** Axis morph smooth on single canvas; no diptych; path straightens with morph.

**Changes:**
- Hero and story already used `LossSurface` `morph` prop (single canvas). **Morph RAF** deps fixed so animation doesn’t restart every frame (`FeatureScalingLab`, `FeatureScalingStory`).
- `FeatureScalingLab.tsx` — **act handoff** from `FeatureScalingFrame.scaling`; banner on first Run-it visit after See-it.

**Verify:** `/exhibits/feature-scaling` → hero auto-morph; Run it toggle Raw ↔ Standardised — one surface deforms, zig-zag path straightens (play disabled during morph).

---

## Cross-cutting

| Concern | Treatment |
|---------|-----------|
| Timing | 480–520 ms morphs; cubic ease; stack entrance ~900 ms on loss hero |
| Label density | Figcaptions collapsed to kicker + one live readout; detail in graphic/lens |
| Reduced motion | `usePrefersReducedMotion` on loss hero, microscope, ProbeLens transitions |
| Chrome collapse | Existing `ActHandoffProvider` data attributes unchanged; handoff banners are act-local |

---

## Verification log

| Check | Result |
|-------|--------|
| `npm run build` | ✅ pass |
| Playwright `loss-functions`, `the-gradient`, `gradient-descent`, `feature-scaling` (25 tests) | ✅ pass |
| Browser MCP (4 routes) | ⚠️ unavailable in agent session; covered by Playwright + HTTP 200 on all routes |

### Manual smoke (recommended)

1. **Loss toggle** — L2 → L1 → Huber; outlier ring stays fixed; mean loss stack animates.
2. **Probe drag** — gradient hero; lens shows bars; ∂f/∂x/∂f/∂y legs on field.
3. **Microscope** — gradient-descent hero + story microscope beat + Run-it “One step”.
4. **Scaling morph** — feature-scaling hero entrance + lab toggle; path visibly straightens.

---

## Files touched

- `src/components/exhibits/LossFunctionsHero.tsx`
- `src/components/exhibits/TheGradientHero.tsx`
- `src/components/viz/GradientField.tsx`
- `src/components/viz/primitives/ProbeLens.tsx`
- `src/components/exhibits/GradientDescentMicroscope.tsx`
- `src/components/exhibits/GradientDescentLab.tsx`
- `src/components/exhibits/FeatureScalingLab.tsx`
- `src/components/exhibits/FeatureScalingStory.tsx`
