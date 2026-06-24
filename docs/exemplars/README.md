# Exemplars — the visual ground truth

`docs/06-evaluation-criteria.md` names a benchmark set (Distill, R2D3, Seeing
Theory, 3Blue1Brown, TensorFlow Playground, Ciechanowski, The Pudding, Nicky
Case) and asks every Pillar-B review to measure against it. For Phase 0 that
comparison was made **from memory** — which is unfalsifiable, and is how a
clean-but-plain pair of exhibits scored "matches the benchmark" when they don't
(see `docs/reviews/flagship-acceptance-review.md`, and the honest re-read that
followed).

This directory fixes that. It holds **captured pixels** of the benchmark
treatments plus a written **teardown** of each, so that:

1. A reviewer compares our exhibit screenshots against *stored artifacts*, not a
   mental image. The comparison becomes falsifiable.
2. "A 4 would be cited as an exemplar" stops being a sentence and becomes "looks
   like _this_, moves like _this_."
3. The base-template and per-exhibit work has concrete targets to design toward.

This is **Stream 1** of the quality-foundation work. Stream 2 (canvas-first base
template) and Stream 3 (non-circular, semi-automated review) both depend on it.

## Layout

```
docs/exemplars/
  README.md              ← you are here (purpose + teardown contract)
  capture-log.txt        ← what the last capture run got, and what it missed
  <slug>/
    00-viewport.png      ← above-the-fold at our 1440-wide big-screen reference
    0N-scroll-*.png      ← scroll positions: how the graphic rebuilds with the story
    full.png             ← full-page (best effort)
    meta.json            ← url, concept, target criteria, capture timestamp
    TEARDOWN.md          ← the written analysis (the actual deliverable)
```

## Refreshing the captures

```
npm run capture:exemplars                         # all of them
npm run capture:exemplars -- distill-momentum     # a subset by slug
```

Captures are committed (small PNGs) so the ground truth travels with the repo and
reviews work offline. The benchmark sites evolve; the captures are dated in
`meta.json`, and the teardown is the durable artifact — re-capture when a source
is redesigned, but the analysis is what we actually compare against.

## The teardown contract

Each `<slug>/TEARDOWN.md` answers, concretely and with reference to the captured
frames, what makes the treatment exemplary and what we should steal. Keep it
specific — "the residual square animates on a 400ms ease as you drag" beats "nice
animations". Structure:

```markdown
# <Title>

**Concept:** <what it teaches>  ·  **Source:** <url>
**Our nearest exhibit / future node:** <e.g. gradient-descent>

## Why it clears the bar
3–6 bullets. Name the specific moves: layout, focal hierarchy, canvas use,
motion, type, color, the peak moment. Cite frames (00-viewport.png, 02-scroll-…).

## Mapped to our criteria
| Criterion | What they do | Where we are (Phase 0) | The gap |
| --- | --- | --- | --- |
| B2 Visual excellence | … | … | … |
| B3 Motion that explains | … | … | … |
| B6 Delight | … | … | … |

## What to steal for the template / exhibits
Concrete, implementable moves — feeds Stream 2.

## What NOT to copy
Where the source is wrong for our product (e.g. unguided free-play, decoration,
register mismatch). Anti-examples sharpen the target too.
```

## The set, and why each is here

| Slug | Source | Closest to us | Teaches us about |
| --- | --- | --- | --- |
| `distill-momentum` | Distill — Why Momentum Really Works | gradient descent, loss-surface conditioning | composed graphics, interactive-in-prose, the eigen/condition story we skip |
| `r2d3-trees` | R2D3 — Visual Intro to ML, Part 1 | trees, train/test, overfitting | full-bleed scroll-driven graphics that rebuild as you read |
| `seeing-theory-regression` | Seeing Theory — Regression Analysis | least squares (our direct rival) | the manipulation bar for our flagship #1 |
| `3b1b-gradient-descent` | 3Blue1Brown — Gradient descent | gradient descent (cinematic) | delight, composition, narrative clarity |
| `tensorflow-playground` | TensorFlow Playground | live NN training | dense control surface that stays calm; live motion |
| `ciechanowski-watch` | Ciechanowski — Mechanical Watch | the poster-worthy ceiling | full-bleed canvas atmosphere, the absolute top of the bar |
| `pudding-dialogue` | The Pudding — Film Dialogue | editorial data essay | type, layout, editorial composition |
| `ncase-trust` | Nicky Case — The Evolution of Trust | explorable game | assessment-as-play, guided discovery, delight |
