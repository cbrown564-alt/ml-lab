# Flagship acceptance — the regression cluster (5 exhibits)

**Date:** 2026-06-23
**Scope:** loss-functions · feature-scaling · bias-variance · overfitting-regularization · data-leakage — all five carried to the full four-act spine (See it · Run it · Break it · Explain it), then put before the non-circular review panel as the gate to flip stub→**flagship**.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`, not from memory)

Three agents (`.claude/agents/{tester,designer-critic,teacher}.md`) reviewed the cluster's Break-it + Explain-it acts (the new flagship work) against the benchmark set, with fresh 1440px captures.

### Tester — integrity gate: **PASS**
- axe-core: **0 serious/critical** across all 10 new views.
- Interaction smoke: all six failure loops reach broken *and* repaired; every input→paint **< 100ms** (feature-scaling's 266/363ms are descent-simulation completion, not UI latency — distinct).
- Suites: `validate` 0 errors · `vitest` 126/126 · 25/25 cluster e2e · budgets all under (data-leakage tightest at 694/700).
- Red lines: all clear. One advisory — data-leakage's `SEED=8` is chosen for a vivid leak; not a hit (the exhibit frames it as a constructed demonstration, shows the honest score alongside), but a UI disclosure was recommended.

### Teacher — pedagogy: **4/5 to the bar outright + 2 gating fixes** (now applied)
- All five Break-it loops are genuine Trigger→Symptom→Diagnose→Repair→Boundary diagnosis machines, not watch-it animations. Every transfer item is novel and parroting-proof. No control is decoration. Honesty claims re-verified against the fixtures (bias-variance test ≈850× train; data-leakage leaky R² 0.4118; the √(2 ln p/n) ≈ 0.37 math; Chebyshev λ traversing a real U).
- **Gating fix 1 (data-leakage):** the predict distractor said honest CV lands "not far below" zero — contradicting the visibly-negative fold bars. Reworded to match the screen.
- **Gating fix 2 (bias-variance):** the too-stiff card was tagged `overfitting` but is underfitting/bias. Added an honest `underfitting` primitive (schema + taxonomy + catalogue) and retagged.
- Polish: loss-functions' mislabelled `mae-flat-gradient` card reframed into an honest "Robustness isn't free" outliers card.

### Designer-critic — visual register: **2→3 on all held views** (re-scored after fixes)
First pass held 4 of 10 new views at register 2. Fixes + **re-score verdict: CLUSTER CLEARS REGISTER 3 — YES.**
- bias-variance Break-it 2→**3**: error-U promoted from a ~180px control-strip inset to a **760px co-hero** beside the fit (vs `distill-momentum/02`).
- regularisation Break-it 2→**3**: error-vs-λ U promoted *and* differentiated by a new coefficient-magnitude bar chart (the ridge shrinkage; vs `r2d3-trees/02`) — a shuffled-screenshot test now separates it from bias-variance.
- data-leakage Break-it 2→**3**: scatter recoloured param-purple→prediction-blue (grammar — those points are predictions; 0 purple pixels confirmed) + an on-canvas verdict focal (vs `r2d3-trees/02`).
- loss-functions + feature-scaling Break-it: re-confirmed **3** (feature-scaling's LossSurface remains the cluster's exemplar-grade hero), no shared-component regression.

## Verdict

**GATE CLEARED.** All three reviewers pass. The five regression-cluster nodes advance stub→**flagship**.

Standing green at flip: eslint 0 · validate 0 · 126 unit · build · 25 cluster e2e · budgets.
