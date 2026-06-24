# Flagship acceptance — the-gradient

**Date:** 2026-06-23
**Scope:** one exhibit (the-gradient), full four-act spine, to the non-circular panel as the gate to flip stub→**flagship**.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`)

Three agents reviewed all four acts. **All three cleared on the first pass** — the first exhibit this run to do so:

- **Teacher — TEACHES TO THE BAR — YES.** Re-derived the gradient from scratch (not trusting the unit tests): steepest-ascent, perpendicular-to-contour, and magnitude=slope all hold to finite-difference precision on screen; the local-max trap is genuine (lower-left basin settles at height 1.111 with ∇f ≈ 4e-4, the tall basin at 1.504 — a clean watershed where "initialisation decides the basin" is literally true); the transfer is "north-star quality"; lane discipline "excellent."
- **Tester — Integrity gate PASS.** Zero serious/critical axe on all five views; all suites green; every measured latency under 100ms (drag 57ms, toggle 91ms); the arrow verified mathematically correct by reading the SVG geometry. StatGrid uses the correct `-ink` token (the sibling's contrast miss not repeated).
- **Designer-critic — EXHIBIT CLEARS REGISTER 3 — YES.** All four views score 3, none an inflated 2; "the manipulation is genuinely ahead of the benchmark set." The Break-it is "the high point" — the local-vs-global trap is "made spatially self-evident."

## Push-to-exemplar work applied (each reviewer's single highest-leverage note)

The gate was cleared, so these were enhancements, not unblocks — but both opus reviewers named one decisive improvement, and the bar here is exemplar-grade:

- **Designer #1 — stroke the contours.** The field was a "stepped wash"; now `GradientField` strokes a 1px contour line at every band boundary, so it reads as a *drawn topographic map*. This makes the perpendicular-to-the-contour claim literally visible and removes the Mach-band shimmer. Plus the dull second peak and dead floor (designer #2/#3): keyed `MAX_F` to the true summit so the global peak reaches full amber, and a cleaner slate→taupe→amber ramp. Arrow now rides a soft halo so the descent (−∇f) arrow reads as hard as ascent (designer #6); See-it field widened (designer #4).
- **Teacher #1 — make the second failure triggerable.** The gallery listed two failures (local-optimum trap + vanishing gradient) but only the trap was triggerable. Now the Break-it classifies a released run: a long crawl (>50 steps, far flat region) surfaces as **"Stalled — crawling on the flat"** with its own `the-gradient:vanishing-gradient` event and a second check task — so the learner triggers *and distinguishes* both, and the boundary the card names (small gradient *at* an optimum = good; *far* from one = stuck) is hands-on. Verified: default release → "Trapped on the lower hill"; far-corner release → "Stalled".
- **Teacher #3 — carry the why to the edge.** The `the-gradient → gradient-descent` `mathematical_basis` edge now carries a note ("descent is this hunt automated… the trap and the stall are the failures descent inherits").

## Verdict

**GATE CLEARED on the first pass; reviewers' push-to-exemplar notes then applied.** The node advances stub→**flagship** (now 11 flagship nodes).

Standing green at flip: eslint 0 · validate 0 · 148 unit · build · 6 e2e (incl. the new stall trigger) · budget 662/700 · axe 0 serious/critical across all four acts.
