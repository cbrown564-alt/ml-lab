# Flagship acceptance — the unsupervised cluster (k-means + PCA)

**Date:** 2026-07-02  
**Scope:** k-means · pca — both carried to the full four-act spine (See it · Run it · Break it · Explain it), then put before the non-circular review panel as the gate to flip `interactive`→**flagship**.

## The panel (non-circular: judged vs the stored exemplars in `docs/exemplars/`, not from memory)

Three agents (tester, designer-critic, teacher) reviewed the cluster against the benchmark set, with fresh 1440px captures in `docs/reviews/captures/{k-means,pca}/2026-07-02/`.

### Tester — integrity gate: **PASS** (after fixes)

First pass failed on k-means axe contrast, html budget (351/110 KB from 864 SSR rects per `KMeansField`), and Lloyd-step pointer latency (184 ms). Fixes applied:

- **Voronoi tessellation** replaces the 36×24 rect grid — html drops to budget, latency clears, Run register rises.
- **StatGrid `-ink` hues** on k-means See it — axe serious contrast violation cleared.
- **PCA `experiment-task`** wired to `pca:standardised` on Break-it repair.

Post-fix: `validate` 0 errors · vitest green · 11/11 cluster e2e · budgets green · axe 8/8 views pass.

### Teacher — pedagogy: **PASS**

- k-means: full assessment quartet; Break-it loops for wrong-k and bad-start; open transfer (retail scale + outlier); fixture-honest inertia numbers.
- PCA: scaling Break-it loop strong; open transfer (genomics variance ≠ task importance); experiment-task closes assessment-as-play gap.
- Polish deferred: k-means outlier failure remains gallery-only; PCA variance-misread failure not interactively triggerable (second mode optional).

### Designer-critic — visual register: **PASS** (after Voronoi fix)

First pass held k-means **Run at 2** (stepped rect grid vs `tensorflow-playground/00-viewport.png`). Voronoi polygons lift Run to **3**. PCA cleared **3** on all surfaces on first pass.

| Exhibit | Hero | See | Run | Break | Explain |
| --- | ---: | ---: | ---: | ---: | ---: |
| k-means | 3 | 3 | 3 | 3 | 3 |
| pca | 3 | 3 | 3 | 3 | 3 |

## Verdict

**GATE CLEARED.** All three reviewers pass after the Voronoi + PCA experiment-task fixes. Both unsupervised nodes advance `interactive`→**flagship**.

Standing green at flip: eslint 0 · validate 0 · vitest · build · 11 cluster e2e · budgets · `check:rubric --strict`.
