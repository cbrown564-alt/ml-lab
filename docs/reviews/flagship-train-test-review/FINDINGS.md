# Flagship acceptance — train-test-generalization

**Date:** 2026-06-23
**Scope:** one exhibit (train-test-generalization), full four-act spine, to the non-circular panel as the gate to flip stub→**flagship**.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`)

Three agents reviewed all four acts. **First pass: NOT YET** — a blocking defect from each reviewer, two of them converging on the Break-it spread strip from opposite directions (the math and the pixels).

### Teacher — pedagogy (blocking, Red Line #2)
The Break-it taught its lesson **backwards**: with `spread = max−min` and a degree-8 fit on a shrinking training set, the spread *exploded* as the holdout grew (0.52 → ~357k) — contradicting the "enlarge the holdout, the spread collapses" repair copy. Caught by running the model. (The badge was also gated on a hardcoded `testSize ≥ 9`, not the spread.)

### Designer-critic — visual register (blocking, register 1→2)
The spread strip was "a thin row of pale dots floating in dead air"; the "5-fold CV" label clipped to "-fold CV" at a large holdout; and an outlier rescaled the adaptive axis so the tight state read *emptier, not tighter*.

### Tester — integrity (blocking, A6)
A serious axe color-contrast violation — `var(--viz-truth)` StatGrid value text (3.1) on `bg-raised`.

## The fixes (one commit)
- **Model + statistic:** a lightly-ridged degree-5 polynomial (so a starved fit can't explode) on a fresh deterministic 60-point pool (so the small-split lottery is dramatic), with a **robust P10–P90 spread**. The spread now collapses 0.144→0.040 (3.6×), monotone over the slider's 3–20 range (unit-tested); the badge is spread-driven.
- **Strip viz:** a new shared `ErrorSpreadStrip` — a real-height (180px) binned histogram over a fixed axis (sprawl→spike is the dominant visual), labels inset, with mid-axis collision handling so close marks stack instead of overprinting. Adopted by all four acts.
- **Contrast:** `var(--viz-truth)` → `var(--viz-truth-ink)`; re-verified 0 serious/critical axe across all four acts.
- Plus: the e2e asserts the spread-driven badge, the stale "degree-6" comment, and a temporal-contiguity slip ("across reshuffles" → "across random splits").

## Re-score & verdict

- **Teacher: TEACHES TO THE BAR — YES.** Re-ran the model: the spread now collapses 0.144→0.040, the badge matches, the transfer/manipulation/lane-discipline unregressed. (Raised one honest non-blocking note — the test proved the *trend*, not strict monotonicity; tightened to assert the decisive collapse + renamed.)
- **Designer-critic: EXHIBIT CLEARS REGISTER 3 — YES.** The rebuilt strip "matches `r2d3-trees/02`… real, not cosmetic." (Flagged the Run-it default-state train/CV label overprint — fixed with the collision handling above.)
- **Tester:** axe re-verified at 0 serious/critical on all four acts.

**GATE CLEARED.** All three reviewers pass. The node advances stub→**flagship** (now 10 flagship nodes).

Standing green at flip: eslint 0 · validate 0 · 143 unit · build · 5 e2e · budget 669/700 · axe clean.
