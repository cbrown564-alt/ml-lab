# Flagship acceptance — regression-task

**Date:** 2026-06-23
**Scope:** one exhibit (regression-task), full four-act spine, to the non-circular panel as the gate to flip stub→**flagship**.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`)

Three agents reviewed all four acts. **All three passed**, each with one note acted on before the flip:

- **Teacher — TEACHES TO THE BAR — YES.** Ran the model itself and confirmed the metric-mismatch lesson is *honest on screen*: a good model has low MAE (3.3) and band-dependent accuracy (25%→100% across the slider), and the copy frames this as *arbitrary*, not a hard "0%" — no overclaim. Lane discipline "exemplary" (teaches target-type→metric without re-teaching the model, loss, or classification metrics); the house-price transfer is "parroting-proof." **Blocking defect:** literal markdown asterisks.
- **Designer-critic — EXHIBIT CLEARS REGISTER 3 — YES.** All four views score 3 (several 4s on hue grammar + narrative integration); See-it "the strongest act" (object-constant residual-over-cloud), Break-it "the differentiator earns it" (the failure confronted on the canvas via the tolerance band). **Top note:** the Run-it pre-reveal marker read as "a dot on a scatter."
- **Tester — Integrity gate PASS.** Zero serious/critical axe on all views; suites green (152 unit, 5 e2e); latencies <100ms; the band→accuracy consistency verified (25% = exactly 3/12 in-band) and MAE matches the seed. (Moderate `heading-order` in the *shared* failures panel — pre-existing, not exhibit-specific; tracked separately.)

## Fixes applied

1. **[Teacher, blocking] Literal markdown asterisks — fixed lab-wide.** `NarratedSection` (prose), `ConceptCheckSection` (`{feedback}`), and `StoryStepper` (predict `{feedback}`) all render raw text — so `*emphasis*` showed literal `*` glyphs, in ~9 already-flagship exhibits as well as this one. Swept `*…*` from every exhibit's narrative + concept-check + spine (verified no multiplication or comment markers were touched; build + validate clean). Verified: **0 asterisk glyphs** render in the prose. The hue-term system already carries emphasis where it matters.
2. **[Designer, top note] Run-it pre-reveal affordance.** The prediction marker now wears a dashed grab-ring and a "drag ↕" hint until the reveal, so the empty-canvas pre-guess state reads as an instrument.

## Verdict

**GATE CLEARED — all three reviewers pass.** The node advances stub→**flagship** (now 12 flagship nodes).

Standing green at flip: eslint 0 · validate 0 · 152 unit · build · 5 e2e · budget 671/700 · axe 0 serious/critical across all four acts.

**Tracked separately (pre-existing, lab-wide, moderate):** the failures-panel `heading-order` axe violation — a shared-component a11y cleanup for a focused pass.
