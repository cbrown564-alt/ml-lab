# Flagship acceptance — the classification cluster (2 exhibits)

**Date:** 2026-06-23
**Scope:** logistic-regression · classification-task — both carried to the full four-act spine (See it · Run it · Break it · Explain it), then put before the non-circular review panel as the gate to flip stub→**flagship**.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`)

Three agents (`.claude/agents/{tester,designer-critic,teacher}.md`) reviewed the cluster's Break-it + Explain-it acts against the benchmark set, with fresh 1440px captures. **First pass: NOT YET** — one blocking defect from each reviewer.

### Tester — integrity gate
- Suites green (validate 0 · 137 unit · 10 e2e · budgets), all latencies <100ms, both fixtures honest.
- **Blocking (A6):** a serious axe color-contrast violation — StatGrid value text used `var(--viz-neutral)` (a canvas-mark hue) on `bg-raised`.

### Teacher — pedagogy
- Both Break-it loops are genuine T/S/D/R/B diagnosis; both transfer items parroting-proof; honesty claims verified numerically (raw XOR 50.0% / expanded 100.0%; imbalance 95.0% acc / 0 recall at t=0.5).
- **Blocking (integrity/temporal-contiguity):** the classification Break-it copy said "accuracy dips below 95% — the dip is the point," but the fixture made catching the positives nearly free (accuracy stayed ≥95% when recall climbed) — the on-screen number contradicted the sentence.
- **Medium:** the logistic break-task fired on mount (watch, not trigger).

### Designer-critic — visual register
- **Blocking (register 1):** the logistic Break-it's raw probability field rendered **blank** — on XOR the best straight line is ≈0.5 everywhere (uniform pale), so half the act showed no field, collapsing the straight-fails-vs-curved-works contrast. classification-task cleared register 3 (a non-blocking dead-quadrant kept it off a 4).

## The fixes (one commit)
1. **logistic dataset XOR → parabola:** the raw linear fit is now *confidently wrong* on the curve's arms (~78%, a vivid field with a straight boundary miscutting the parabola, misclassifications red-ringed), and adding x₁² bends the boundary to fit (>90%). Same "linear classifier, features bend" lesson; the transfer reworked to a U-shaped-risk case.
2. **classification fixture re-tune:** a band of 9 borderline negatives at [0.41, 0.49] so catching the 3 positives sweeps up false positives — at the repaired trigger (recall 0.67, t≈0.43) accuracy is now **87%, below the 95% baseline**. The copy is true on screen (verified by threshold sweep).
3. **contrast:** all 6 neutral StatGrid values → `var(--viz-neutral-ink)`; re-verified **0 serious/critical** axe color-contrast on both Break-it acts.
4. **task-gating:** the logistic break-task fires only on a real toggle interaction.

## Re-score & verdict

Designer-critic re-score (the last open gate; tester's axe and teacher's integrity already re-verified):
- logistic-regression Break-it **1 → 3** — the parabola field renders vivid (vs `tensorflow-playground/01`), and "exceeds it pedagogically" with the red-ringed misclassified arm-points.
- classification-task Break-it **held at 3** — the contrast fix visible and correct, no regression.

**CLUSTER CLEARS REGISTER 3 — YES. GATE CLEARED.** Both classification nodes advance stub→**flagship** (now 9 flagship nodes total).

Standing green at flip: eslint 0 · validate 0 · 137 unit · build · 10 cluster e2e · budgets · axe color-contrast clean.
