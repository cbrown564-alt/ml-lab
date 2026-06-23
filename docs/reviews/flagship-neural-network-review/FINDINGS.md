# Flagship acceptance — neural-network-fundamentals (the capstone)

**Date:** 2026-06-23
**Scope:** one exhibit (neural-network-fundamentals), full four-act spine, to the non-circular panel as the gate to flip stub→**flagship**. The run's capstone — a real backprop trainer learning XOR on screen.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`)

Three agents reviewed all four acts. **First pass: two blocking findings** (tester PASSed).

- **Teacher — NOT YET (red-line: viz contradicts copy).** Ran the model at the exact component config and found Run it inited at a seed where **hidden=2 converged to a local minimum (~69% on XOR)** while the StatGrid caption hard-coded "a hidden layer reaches ~100%" — the instrument refuting the lesson at the central beat. Plus the "two or more units can carve the X" copy was empirically unreliable (local minima). Everything else verified flagship-grade: backprop exact (finite-difference test), the trainer genuinely descends, hidden=1 stalls at *exactly* 75% every seed, the W₂W₁x→line collapse numerically exact, the overfit Break-it real, the transfer parroting-proof, lane discipline clean.
- **Designer-critic — CLEARS REGISTER 3 — NO.** Three of four acts cleared 3 (See-it "poster-worthy", Break-it "the exhibit's peak"). The Run-it "Read it as maths" sub-act was the failure: a `W₂W₁x = Wx` prose claim with **no live consequence beside it**, regressing below the lab's own `StabilityScale`/`SquaredPenalty` Math bar.
- **Tester — Integrity gate PASS.** Zero serious/critical axe on all views; suites green; latencies <100ms; no interval/timer leak; the live visualisation verified genuinely backprop-driven (boundary bends to the X, 32-unit boundary contorts around real noise with a real held-out drop).

## Fixes applied

1. **[Teacher] Robust capacity + honest caption.** A 30-seed sweep showed h1 always stalls at 75% and h4/h8/h16 solve XOR on *every* seed, while h2/h3 hit local minima — so `HIDDEN_CHOICES = [1, 4, 8, 16]` (the flaky ones dropped). The accuracy caption is now **data-driven** (one unit → "tops out ~75%"; ≥0.9 → "reaches the X"; else "training — bending"), so it can never contradict the field. Softened the "two or more units" overclaim to "a few units carve it reliably" (spine + concept-check).
2. **[Designer] The math gains a live consequence.** New **NonlinearityToggle** widget (a `nonlinearity` math-block kind): tanh on → the MLP carves the XOR X (~100%); tanh off → the stack collapses to logistic regression, a single line stuck at 51%. The collapse algebra, made manipulable, beside the claim — Pattern 5 (math beside its consequence) now satisfied. Plus the NetworkDiagram hidden-node radius shrinks so 16 units never overlap.
3. Swept literal `*markdown*` from this exhibit's content (authored after the lab-wide sweep) — 0 glyphs render.

## Re-score & verdict

- **Teacher: TEACHES TO THE BAR — YES.** 30-seed sweep confirmed every selectable count behaves as the lesson claims; the caption tracks live accuracy; overclaims gone; Break-it + transfer unregressed. "Empirically honest at every control the learner can touch."
- **Designer-critic: EXHIBIT CLEARS REGISTER 3 — YES.** The NonlinearityToggle is "a genuine instrument, not decoration"; the 100%↔51% swing "a genuinely satisfying reveal," at parity with `StabilityScale`. (Clarified: the ~72ch column with empty right half is the lab's *standing* Math convention, not a regression — the defect was a claim with nothing live beside it, now gone.)
- **Tester:** PASS (first pass).

**GATE CLEARED.** All three reviewers pass. The node advances stub→**flagship** (now 13 flagship nodes; the capstone).

Standing green at flip: eslint 0 · validate 0 · 156 unit · build · 5 e2e · budget 669/700 · axe 0 serious/critical across all four acts.
