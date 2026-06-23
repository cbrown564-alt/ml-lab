# Foundations re-judge — the honest re-baseline (rubric v2)

**Status:** machine pass complete, human pass owed (2026-06-23). This is the
re-baseline `SYNTHESIS.md` has owed since Stream 3 (docs/08 Part 5, step 4) — now
with rubric v2 as the instrument and the `/review` surface for the human in the
seat. It records what the **machine** already decided and enumerates the queue the
**human** must now judge. Expect several nodes to drop below flagship; that is the
system working, not a regression.

## Method (non-circular)

1. **The machine judged everything mechanizable** — `npm run check:rubric` over
   all 15 live nodes (hero presence §1b, assessment form §1c, verdict freshness).
2. **The capture pipeline pinned the pixels** — `npm run capture:review` produced
   a per-act contact sheet for every node at the 1440px reference
   (`docs/reviews/captures/<exhibit>/2026-06-23/`), each frame paired with its
   benchmark exemplar frame. Comparisons below cite captured frames, never memory.
3. **The human judges taste on `/review`** — the register sub-scores, the hero
   poster-worthiness, the assessment embedding. Those verdicts are not in this
   doc because they are not the machine's to render.

## What the machine found (mechanizable, decided)

`npm run check:rubric` — 15 live exhibits, all marked `flagship`:

- **13 / 15 carry no hero specimen (§1b).** Only `gradient-descent` and
  `linear-regression` pass a `hero`. Per rubric v2 §1b an exhibit without a hero
  cannot be flagship, so **13 flagship claims are mechanically false** today. This
  is systematic, not the `what-is-ml` doorway alone — the plan's diagnosis
  understated it.
- **15 / 15 lack an in-date human scorecard** (red line #6). No node has been
  judged through `/review` yet; until it is, "flagship" is an unbacked claim.
- Assessment form §1c: every node clears the *structural* floor (a wired
  `experiment-task`, process feedback on every option, not a pure MCQ stack). The
  "exam cosplay" critique is therefore about **rendering**, not item kinds — a
  taste call left to the human (`transferIsInteractiveOrOpen`).

## What the captures show (pixels, falsifiable — for the human to score)

Grounded in the 2026-06-23 contact sheet, framed as observations the human
verdict should confirm or overturn:

- **Opening grammar is inconsistent across the cluster (§1d).** The journey's
  *first* node, `what-is-ml/hero.png`, opens on title + lede + placard with **no
  specimen** — the weakest opening in the set — while `linear-regression/hero.png`
  and `gradient-descent` lead with a full-width graphic. First-node-weakest is the
  exact failure §1d's lineup gate exists to surface.
- **Heroes carry no in-graphic annotation (annotation-integration §1a).** Even the
  strong case, `linear-regression/hero.png` ("THE LINE OF BEST FIT · 30
  OBSERVATIONS"), shows the line through the data but labels nothing *on* the
  graphic — no residual, no marked point. Held against
  `distill-momentum/00-viewport.png` (labels on the curve) this reads ≤2 on
  annotation-integration, and the mechanism (residuals) is not in the picture.
- The homepage (`_home/home-viewport.png`) is competent editorial, not a lab
  front door with an above-the-fold interactive payoff (docs/08 diagnosis).

## The human-judgment queue (do this on `/review`)

For each node, open `/review/<exhibit>` and render a verdict:

1. **The 13 hero-less nodes** — the machine already blocks them; the human decides
   whether the fix is a new specimen hero or a re-derivation, and scores the rest.
2. **`linear-regression`, `gradient-descent`** — have a hero; score whether it is
   poster-worthy, annotated, and mechanism-bearing (the §1a register), or just a
   clean plot.
3. **Cluster consistency (§1d)** — judge the shuffled hero lineup; `what-is-ml`'s
   opening is the prime suspect for "reads as the weakest."

Each saved verdict lands in `docs/reviews/feedback/<exhibit>/` and is read back by
the loop as ground truth (`npm run brief -- <id>`), so the next build pass fixes
what the human flagged and never re-proposes a rejected direction.

## Agent pre-pass complete (2026-06-23) — the defensible baseline

Before the human pass, the **adversarial agent panel** (the non-circular
`designer-critic`, comparing each captured frame to the *pinned* exemplar pixels,
never memory) judged all 15 live nodes. Each verdict is a validated
`scorecard.agent.json` beside the human card (`docs/reviews/feedback/<id>/`), so
agent↔human divergence stays a tracked signal (docs/08 Part 4). These are the seed
the `/review` form now opens on — the human **adjusts taste from a logical
baseline**, never authors from a contradiction. The instrument now *enforces* that
logic: the rubric schema rejects any hero-judged dim scored above 0 when no hero is
present, so "mechanism 3 while hero absent" is a parse error.

The agent landscape (register scores; all 15 verdicts = **hold**):

| node | hero | mech | annot | atmos | motion | colour |
| --- | --- | --- | --- | --- | --- | --- |
| gradient-descent ✓hero | 3 | 2 | 2 | 2 | 3 | 3 |
| linear-regression ✓hero | 2 | 2 | 3 | 2 | 3 | 3 |
| loss-functions | 0 | 0 | 3 | 2 | 2 | 3 |
| what-is-ml | 0 | 0 | 3 | 2 | 2 | 3 |
| the-gradient | 0 | 0 | 2 | 2 | 3 | 3 |
| feature-scaling | 0 | 0 | 2 | 2 | 2 | **2** |
| train-test-generalization | 0 | 0 | 2 | 2 | 2 | **2** |
| (8 others) | 0 | 0 | 2 | 2 | 2 | 3 |

Three systematic findings the panel converged on, falsifiable against the captures:

- **Atmosphere is a wall of 2s.** Every node reads "calm but sparse" — dead vertical
  air around the spine, flat 2D strokes, no Distill depth. Atmosphere-finish never
  reaches floor anywhere.
- **The two all-red loss-surface fields drain "error"** (feature-scaling,
  gradient-descent): the crimson field becomes wallpaper, so colour-discipline drops
  to 2 / docks gradient-descent. Same root cause flagged on both independently.
- **Every "Explain it" transfer item is an MCQ** (`transferIsInteractiveOrOpen`
  false on 12/15), confirming the §1c "exam cosplay is about rendering" read.

**Capture-pipeline bug (flag, not yet fixed):** for the two nodes *with* a hero
(`linear-regression`, `gradient-descent`) the stored `see/run/break/explain`
frames are duplicates of the hero — the capture script didn't navigate the acts.
Both agents re-captured the real acts with Playwright and judged on those, so the
scores stand, but `scripts/capture-review.mjs` needs a fix before the next run.

## Cross-cutting fixes applied + re-gated (2026-06-23)

The first remediation pass took the systematic, shared findings (the user's call:
cross-cutting fixes before per-node hero work), each re-judged by the panel:

- **Capture bug — FIXED.** `frameAct()` now scrolls the act `[role=tablist]` to
  just under the top so the viewport frames the act panel, not the hero. Verified:
  `linear-regression` + `gradient-descent` yield 4 distinct act viewports.
- **The two all-red loss surfaces — FIXED (shared `LossSurface`).** Re-graded to a
  topographic contour map: a calm cream→dusty-rose ground with maroon reserved for
  high-loss peaks (loss stays red-family per grammar, no longer a flood), contour
  lines at each band, painted per output pixel at device resolution with
  anti-aliased (fwidth) lines so band boundaries are smooth curves, not a
  staircase. **Panel re-judge: `feature-scaling` colour 2→3, atmosphere 2→3;
  `gradient-descent` atmosphere 2→3** (colour held 3). Both nodes now have every
  *judgeable* register dim at 3.
- **Atmosphere "wall of 2s" — partly structural, mostly hero-coupled.** The one
  genuinely cross-cutting atmosphere cause (the loss-surface render) is fixed
  above. The rest of the uniform-2 atmosphere is **not** an independent shared
  pass: it is the document-first *opening dead air* (same root as the §1b missing
  hero) plus per-graphic finish — both resolve during the per-node hero builds, not
  a template sweep.

Remaining blockers after this pass are now per-node: `gradient-descent` holds on
`mechanism-in-the-picture 2` (the hero descent wanders off the bright minimum);
the 13 hero-less nodes hold on the missing hero. That is the hero phase.

## Hero phase (2026-06-23, in progress)

The per-node arc off `hold`, panel-gated. **Transfer-item policy (decided): the
transfer item must itself be open or interactive — an MCQ never satisfies §1c.**
Implemented as a reusable `open` form on `TransferItem` (write your own answer →
reveal the model answer; `OpenTransferView`), made *mechanizable*
(`transferIsInteractiveOrOpen` now detects the `open` form) and wired into
`check:rubric` as a content blocker — so the gate flags every node still on an MCQ
transfer (11 remaining).

- **gradient-descent — DONE (clears the mechanical gate).** Hero: the descent now
  starts low, traverses the full frame, and **lands on the labelled minimum**
  (mechanism 2→3; all hero-spec booleans pass; `start`/`the minimum`/loss-legend in
  bare mode). See-it chart marks labelled in-graphic (annotation 2→3). Transfer
  converted to the open form. Panel verdict: **advance**. The human's prior verdict
  is now *stale* (content changed) — re-judge on `/review` to refresh it.

Remaining: 13 hero-less nodes need a composed hero, and 11 nodes need their transfer
converted to the open form (the gate now lists both).

## Turning the gate on

`npm run check:rubric -- --strict` already fails on the 13 hero blockers. It is
**not** wired into `prebuild` yet: doing so today would red-build the repo before
the heroes are built. The sequence (docs/08 Part 5): build the missing heroes →
re-judge through `/review` → then make `--strict` (content + verdict freshness)
the flagship gate, so "flagship" can no longer lie.
