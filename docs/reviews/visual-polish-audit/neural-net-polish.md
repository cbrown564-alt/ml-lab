# Visual polish audit — Neural Network Fundamentals + primitive consolidation

**Date:** 2026-06-25  
**Scope:** `neural-network-fundamentals` exhibit polish; shared primitive consolidation where SVG quality is preserved.

## Neural net polish

### RepresentationPortal (Run it)

`NeuralNetLab` now wraps `FeatureFoldField` and `NetworkDiagram` in `RepresentationPortal` with `PortalView` labels:

- **Feature space · XOR folds** — decision field + half-space fold lines
- **Network · click a hidden fold** — wiring diagram with numbered hidden units

Controlled `activeEntityId` (`fold-{n}`) keeps selection in sync. Copy reframes hidden units as **folds** — the protagonist of the XOR story.

### FeatureFoldField

| Change | Rationale |
|--------|-----------|
| Fold lines: higher contrast (`--viz-neutral-ink`), thicker stroke, clearer dash rhythm | Folds readable at lab + hero sizes |
| Selected fold: glow underlay + solid param stroke + midpoint `fold N` badge | Inspect state obvious without clutter |
| Muted folds: lighter opacity, tighter dash | Mute reads as “removed from stack” |
| `N/M folds active` caption (non-bare mode) | Learner sees capacity at a glance |
| `MOTION_QUICK` transitions on stroke/opacity | Mute/inspect feels smooth |

### NetworkDiagram

| Change | Rationale |
|--------|-----------|
| Unit indices on hidden nodes (always when ≤8 units; always when selected) | Hidden units as named protagonists |
| Selected unit: halo ring + thicker incident edges | Links diagram click to field highlight |
| Keyboard + `aria-pressed` on interactive units | Inspect path works without pointer |
| Column label **hidden folds** | Vocabulary matches field side |

### NeuralNetHero

Figcaption progresses: `fold k of N bending the space` → `ACC% on XOR — N folds carve the X`. Progressive `visibleUnits` reveal unchanged; copy makes the XOR payoff explicit.

### NeuralNetBreakIt

Checkbox replaced with compact **pill switch** (`role="switch"`): `Show fold lines` / `Fold lines on`. Diagnosis aid stays optional; field stays uncluttered when folds are off.

## Primitive consolidation

### DecisionConveyor — shared metrics, exhibit-specific belt SVG

**Decision:** Keep `ClassificationViews.DecisionConveyor` belt SVG exhibit-specific. The animated conveyor is part of the classification-task distinctive frame.

**Consolidated:** `@/lib/viz/decision-conveyor.ts`

- `conveyorOutcome` / `conveyorMetrics` — used by belt SVG
- `classifyConveyorItem` / `classifyConveyorItems` — used by `viz/primitives/DecisionConveyor` grid

Both surfaces now share one classification contract; only the visual metaphor differs.

### DataLeakageProvenancePipe — ProvenancePipe pattern

**Decision:** Keep horizontal pipe SVG exhibit-specific (data-leakage distinctive frame).

**Documented:** JSDoc composition map in `DataLeakageProvenancePipe.tsx` mapping pipe stages → `ProvenancePipe` primitive concepts (`BoundaryWall`, `violatesBoundary`, stage labels, contaminated readout).

### Heroes with inline CounterfactualReplay / ContributionStack / VarianceSwarm

| Hero | Inline widget | Migration |
|------|---------------|-----------|
| `BiasVarianceHero` | `PolyCurve` variance fan inside `Plot` | **Stay exhibit-specific** — plot-integrated geometry; primitive `VarianceSwarm` is normalized-coordinate SVG. Comment added. |
| `TrainTestHero` | `CardSwarm` dealing splits | **Stay exhibit-specific** — card-deck metaphor ≠ primitive swarm |
| `LossFunctionsHero` | `LossStack` penalty bars in plot coords | **Stay exhibit-specific** — needs `usePlot()` layout |
| `LinearRegressionHero` / `RegressionTaskHero` | residual stacks in plot | **Stay exhibit-specific** — same reason |
| `WhatIsMlHero` | morph scrubber | **Stay exhibit-specific** — custom boundary morph, not generic replay shell |

No pilot exhibit frames were replaced with generic primitives.

## Verification

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** — validate 0 errors, TypeScript clean, 19 static routes |
| `npm run test:e2e -- e2e/neural-network-fundamentals.spec.ts` | **PASS** — 5/5 |
| `e2e/visual-audit.spec.ts` (neural-network interaction smoke) | **PASS** — tabs + viz visible |
| Run it — click hidden unit, mute fold | Covered by new `aria` wiring; unit button + mute/unmute labels in lab panel |
| Break it — fold toggle | Pill `role="switch"`; e2e overfit/generalise path unchanged |
| Pilot frames (classification, data-leakage, train-test, regression-task) | Unchanged SVG shells |

## Files touched

- `src/components/viz/FeatureFoldField.tsx`
- `src/components/viz/NetworkDiagram.tsx`
- `src/components/exhibits/NeuralNetLab.tsx`
- `src/components/exhibits/NeuralNetHero.tsx`
- `src/components/exhibits/NeuralNetBreakIt.tsx`
- `src/components/exhibits/ClassificationViews.tsx`
- `src/components/exhibits/DataLeakageProvenancePipe.tsx`
- `src/components/exhibits/BiasVarianceHero.tsx` (comment only)
- `src/lib/viz/decision-conveyor.ts` (new)
- `src/components/viz/primitives/DecisionConveyor.tsx`
