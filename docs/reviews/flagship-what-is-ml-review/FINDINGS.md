# Flagship acceptance — what-is-ml (the doorway exhibit)

**Date:** 2026-06-23
**Scope:** one exhibit (what-is-ml), full four-act spine, to the non-circular panel as the gate to flip stub→**flagship**. The lab's front door — machine learning as the inversion of programming.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`)

Three agents reviewed all four acts. **First pass: NOT YET / HOLD** (designer cleared 3).

- **Teacher — NOT YET (doorway promise undercut).** Ran the model: the hand rule topped out at **81%** — "pretty good," which quietly contradicted the hook's "you cannot write this rule by hand." Everything else verified flagship-grade: the inversion stated correctly, the bias Break-it "genuinely excellent," the hiring-bias transfer "parroting-proof," no asterisks, no anthropomorphism.
- **Designer-critic — EXHIBIT CLEARS REGISTER 3 — YES.** All four views at 3; the drag→Learn→tilt manipulation "the lab's edge over the entire benchmark set." Push-to-4 notes: tighten the plot domains (points under-fill) and the error-ring contrast.
- **Tester — HOLD.** Zero serious/critical axe; suites green; latencies clear; no asterisks. Two JSX whitespace bugs ("25points", "84%on") — and it surfaced a real **budget breach**: data-leakage at 704/700.

## Fixes applied

1. **[Teacher, blocking] Tilt the boundary so the hand rule genuinely fails.** The true rule is now `0.75·x1 + 2.1·x2 > 0.25` (leaning 2.8× on x2), so a vertical single-feature cut tops out at **70%** while the learned rule reaches **97%** — a **27pt gap** the learner sees on their *best* cut. Tightened the unit test (`best < 0.75`); the Run-it now initialises at the best hand threshold so See-it and Run-it agree and the ceiling is felt at once.
2. **[Tester, blocking] Copyedits + a budget breach that was mine.** The two `{" "}` whitespace bugs fixed. The budget breach: the `NonlinearityToggle` widget added to the *shared* `MathView` (to satisfy the NN designer last cycle) statically pulled the `DecisionField` + neural-net model into **every** route. Fixed with a `LazyNonlinearity` client boundary (`dynamic`, `ssr: false`) so the widget's heavy deps are a deferred client chunk on its one route — **data-leakage 704→697, gradient-descent 700→694, all routes green**.
3. **[Designer, push-to-3.5] Composition.** Tightened plot domains to [-2.9, 2.9] so points fill the box (the doorway under-fill); thickened the misclassified red rings (2→2.5).

## Re-score & verdict

- **Teacher: TEACHES TO THE BAR — YES.** Re-ran the model: hand 70.3% (the absolute ceiling across the full threshold sweep) vs learned 96.9% — a 26.6pt gap. "The doorway promise is now earned." Bias Break-it (96.9%→53.1%) and transfer unregressed.
- **Designer-critic:** EXHIBIT CLEARS REGISTER 3 — YES (first pass).
- **Tester:** HOLD resolved — copyedits verified rendering correctly, budgets all green.

**GATE CLEARED.** All three reviewers pass. The node advances stub→**flagship** (now 14 flagship nodes; the front door). Only `the-dataset` remains a stub.

Standing green at flip: eslint 0 · validate 0 · 159 unit · build · e2e · budgets all green · axe 0 serious/critical across all four acts.
