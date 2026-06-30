# Trees cluster — non-circular panel review (core trilogy)

**Date:** 2026-06-30  
**Scope:** decision-trees · random-forests · gradient-boosting — the functionally complete core of the Phase 1 trees cluster (3 of 6 originally planned nodes: k-nearest-neighbors, naive-bayes, svm deferred).  
**Captures:** `docs/reviews/captures/{decision-trees,random-forests,gradient-boosting}/2026-06-30/` (12 frames each, 1440×900)

## Panel verdict summary

| Reviewer | Verdict | Notes |
| --- | --- | --- |
| **Tester** | **PASS** (after fixes) | 18/18 cluster e2e · 256/256 unit · validate 0 · build green. axe: GB hero contrast fixed; budgets justified for load-bearing multi-panel heroes. |
| **Designer-critic** | **CLUSTER CLEARS REGISTER 3 — YES** | Each hero matches `r2d3-trees/00–04`; atmosphere 2 cluster-wide (boxed cards + dead air below sticky graphics). None reach 4. |
| **Teacher** | **PEDAGOGY FLAGSHIP-READY** | Manipulation→insight chains load-bearing; gated predict beats; two distinguishable Break-it failures each; transfer items strong (RF transfer weakest). **Code-parity beat absent** — see gate below. |

## Tester — integrity

- **axe-core:** 0 serious/critical across all acts after fixing gradient-boosting hero kicker contrast (`--viz-accent-ink` token + regression guard in `e2e/a11y.spec.ts`).
- **Interaction smoke:** all sliders 28–59 ms; resample/scenario toggles functional; BeatPredict gates verified by e2e.
- **Suites:** validate 18 nodes / 31 edges · vitest 256/256 · e2e 18/18 · build clean.
- **Budgets:** per-route overrides added in `scripts/check-budgets.mjs` — decision-trees js +3 KB (tree renderer kit); random-forests html 199 KB (two-panel hero + three member-tree small-multiples are load-bearing SSR SVG, not prose bloat).
- **Red lines:** all clear.

## Designer-critic — visual register

**Cluster hero views clear register 3** against `r2d3-trees/00–04`. Shared ceiling at 3 (not 4):

1. Heroes are **boxed in cards** rather than R2D3 full-bleed (`00-viewport`).
2. See-it beats leave **dead air below the sticky graphic** (DT `see-beat-2` ~150 px; RF verdict strip).
3. **Atmosphere 2** cluster-wide except RF's probability-blend field (→3).

**Highest-leverage polish (flagship batch, not blockers):**

- DT: scatter→tree metamorphosis instead of juxtaposition (`r2d3-trees/03` move).
- RF: de-noise blended-field banding; fill dead air under "the crowd's verdict."
- GB: lift log-loss U above the fold in Run it (payoff of the lede).

## Teacher — pedagogy

All three exhibits teach to the bar on manipulation, failure diagnosis, and (for DT/GB) non-parrotable transfer.

**Gating item before `flagship` status flip:**

- **Code parity (20-min choreography beat 10–13 min):** no `CodePanel` wired on any trees exhibit. Copy is honest (does not promise code), but the rubric's code-parity question is unanswered. **Decision required:** build a tree/forest/boosting code mirror beside Run it, or formally rule code-parity N/A for tree models in the release record.

**Polish (non-blocking):**

- Harden random-forests transfer so it can't be passed by parroting `why-randomness` feedback.
- Rename DT Break-it failure ② on-screen so "high variance" doesn't collapse the two failures into one label.
- Exhibit-specific whiteboard closes instead of the generic lab template line.

## Audio

Trees exhibits are registered in `scripts/generate-audio.ts` but **no `audio-manifest.json` exists yet** for any of the three nodes. Narration is best-effort per the scale-out plan (`npm run audio` when `GEMINI_API_KEY` is present) — **does not block `interactive`**, but is part of the flagship polish batch alongside human `/review` scorecards (red line #6).

## Status promotion (applied)

| Node | Before | After | Rationale |
| --- | --- | --- | --- |
| decision-trees | interactive | **interactive** (unchanged) | Already cleared early panel; awaiting human re-judge |
| random-forests | stub | **interactive** | Live route + panel pass |
| gradient-boosting | stub | **interactive** | Live route + panel pass |

**Not promoted to `flagship`:** human scorecards absent (red line #6); code-parity gate open; atmosphere polish backlog; audio not generated.

## Decision — close the trees cluster or push another phase?

**Push for one more development phase — do not close at flagship yet.**

The core trilogy is **functionally built and pedagogically ready**. The panel clears register 3 on heroes and integrity green. What remains is a **focused flagship-polish batch**, not another build-from-scratch cycle:

1. Human `/review` pass on all three exhibits (ground-truth scorecards).
2. Code-parity decision + implementation or formal N/A.
3. Audio generation (`npm run audio` for the three nodes).
4. Designer atmosphere punch list (dead air, GB Run curve above fold, RF field banding).
5. Teacher polish (RF transfer hardening, DT failure labels, whiteboard closes).

**Deferred to a later cluster expansion (not this gate):** k-nearest-neighbors, naive-bayes, svm (+ kernel) — the original six-node trees scope in `PHASE1-SCALE-PLAN.md`. Ship the trilogy at flagship first; expand the graph when unsupervised/deep-learning sequencing allows.

**Next cluster in Phase 1 queue after trees flagship batch:** unsupervised (k-means, PCA).
