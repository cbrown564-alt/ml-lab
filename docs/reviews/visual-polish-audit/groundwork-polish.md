# Groundwork — visual polish audit

**Cluster:** Homepage · What Is Machine Learning · The Dataset  
**Date:** 2026-06-25  
**Scope:** Register-4 polish on homepage micro-specimens, counterfactual morph, row↔point provenance, act handoff, motion tokens, and reduced-motion static frames.

---

## Summary

| Surface | Primary fix | Status |
|---------|-------------|--------|
| Homepage | Warm diagrammatic plates; intent morph on all Groundwork jewels; motion tokens | ✅ |
| What Is ML | Reversible hero morph; label collision fix; mistake ghosts; See→Run handoff | ✅ |
| The Dataset | `PointRowLink` provenance; `RepresentationPortal` lab; Break-it row trace | ✅ |

**Build:** `npm run build` — pass  
**Browser (Playwright, `:3100`):** all acceptance checks green — screenshots in `screenshots/`

---

## Homepage

### Audit targets
- Live micro-specimens warm/diagrammatic
- Jewel→hero morph on hover intent
- No abstract empty gems

### Changes
- **`MicroSpecimen`**: warm inset plate behind every specimen; `TheDataset` now animates outlier + provenance card on intent; mistake ghosts on `what-is-ml` intent; fallback glyph for unknown ids (not empty circle).
- **`JewelGallery`**: scale transition uses `--motion-move` / `--ease-out`.
- **`globals.css`**: jewel plate/enter transitions aligned to `--motion-quick` / `--motion-move`.

### Verify
- Route: `/`
- Hover **What Is Machine Learning** jewel → line tilts, mistake rings appear (`homepage-jewel-intent.png`).
- **The Dataset** jewel → outlier drops, slope flattens, provenance card tethers (`homepage-jewels.png`).

| Test | Result |
|------|--------|
| Hero / cabinet renders | pass |
| Jewel intent morph | pass |

---

## What Is Machine Learning

### Audit targets
- Reversible counterfactual morph (hand cut → learned boundary)
- Label collisions / empty frames fixed
- Persistent mistake ghosts readable
- See-it final frame carries to Run-it

### Changes
- **`WhatIsMlHero`**: shared `easeProgress` (480ms); labels anchored away from data (`your cut` bottom, `machine boundary` along tilt); thicker mistake ghosts; scrubber explicitly reversible.
- **`WhatIsMlStory`**: shared label helper; `learning` beat shows “labelled examples →” + faint ghosts; learned label along boundary not in point cluster.
- **`WhatIsMlLab`**: `useActHandoffFrame` — when story ends on `learned`/`learning`, learned boundary pre-applied; mistake ghosts persist; `chrome-redundant-metrics` on StatGrid when immersed.

### Verify
- Route: `/exhibits/what-is-ml`
- Hero auto-morph then scrub backward/forward (`what-is-ml-scrub-mid.png`).
- Advance See-it to learned beat → open **Run it** → tilted boundary + stats already populated (`what-is-ml-run-handoff.png`).

| Test | Result |
|------|--------|
| Hero morph + scrubber | pass |
| Reversible scrub | pass |
| Act handoff → Run-it | pass |
| Mistake ghosts readable | pass |
| Label/data separation | pass |

---

## The Dataset

### Audit targets
- Row-to-point tether legible
- Provenance lens on bad datum
- Bad row traceable (not just highlighted)

### Changes
- **`PointRowLink`** (new primitive): dashed tether + card for scatter↔row provenance.
- **`TheDatasetHero`**: inline lens replaced with `PointRowLink`; motion via `easeProgress`.
- **`TheDatasetStory`**: row beat uses `PointRowLink`; matrix beat dims non-demo points.
- **`TheDatasetLab`**: `RepresentationPortal` + `PortalView` labels; shared highlight state; handoff seeds row #5 from See-it `row` beat.
- **`TheDatasetBreakIt`**: provenance tether on outlier; bad-row table snippet in left rail when included.

### Verify
- Route: `/exhibits/the-dataset`
- Hero: outlier tethered to “row · provenance” card (`the-dataset-hero.png`).
- Run-it: table↔scatter linked views (`the-dataset-run-it.png`).
- Break-it: typo row in table + scatter tether (`the-dataset-break-it.png`).

| Test | Result |
|------|--------|
| Hero provenance lens | pass |
| Row↔point tether (Run-it) | pass |
| Bad datum traceable (Break-it) | pass |

---

## Shared primitives / motion

| Addition | Purpose |
|----------|---------|
| `PointRowLink` | Scatter point ↔ table row provenance card |
| `easeOutCubic` / `easeProgress` | Lab-wide hero/specimen easing |
| `usePrefersReducedMotion` in heroes/specimens | Static frames tell full story when reduced |

---

## Files changed

- `src/app/globals.css`
- `src/app/page.tsx` (unchanged — already wired)
- `src/components/graph/JewelGallery.tsx`
- `src/components/graph/MicroSpecimen.tsx`
- `src/components/exhibits/WhatIsMlHero.tsx`
- `src/components/exhibits/WhatIsMlStory.tsx`
- `src/components/exhibits/WhatIsMlLab.tsx`
- `src/components/exhibits/TheDatasetHero.tsx`
- `src/components/exhibits/TheDatasetStory.tsx`
- `src/components/exhibits/TheDatasetLab.tsx`
- `src/components/exhibits/TheDatasetBreakIt.tsx`
- `src/components/viz/primitives/PointRowLink.tsx` (new)
- `src/components/viz/primitives/interpolation.ts`
- `src/components/viz/primitives/interpolation.test.ts`
- `src/components/viz/primitives/index.ts`

---

## Remaining gaps (register 4 → 5)

1. **What Is ML hero** — still bespoke side-by-side morph rather than `CounterfactualReplay` primitive; layout is intentional but could unify scrub UX later.
2. **Homepage** — only Groundwork jewels (`what-is-ml`, `the-dataset`) got full provenance-grade intent morph; other wings use simpler specimens (acceptable for this pass).
3. **The Dataset Run-it** — row hover on mobile/tablet untested; tether card may need collision avoidance on narrow viewports.
4. **Axe re-run** — not re-gated this pass; prior cluster was 0 serious/critical.
