# Flagship acceptance review

Date: 2026-06-21

Scope: exhibit acceptance review for `linear-regression` and `gradient-descent`, advancing from `interactive` to `flagship` under [docs/06-evaluation-criteria.md](../06-evaluation-criteria.md). The specific gate from the Phase 0 exit review was the missing math drawer; Iteration 19 shipped the drawers, mobile notice, accessible listen labels, and navigation evidence.

Evidence captured against production server `http://localhost:3200`:

- [flagship-acceptance/home.png](flagship-acceptance/home.png)
- [flagship-acceptance/linear-regression-peak-math.png](flagship-acceptance/linear-regression-peak-math.png)
- [flagship-acceptance/gradient-descent-diverged-surface-math.png](flagship-acceptance/gradient-descent-diverged-surface-math.png)

## Findings

No acceptance-blocking findings.

Remaining release-gate caveats are unchanged and not treated as status blockers: human cold walkthroughs (n>=3, think-aloud) and a manual NVDA/VoiceOver pass, including the word-synced transcript spans. Known level-4 work remains deferred: narration choreographed to experiment visuals, character/art direction, explorer search/filter as the graph grows, and 3D/GPU surfaces with the later deep-learning cluster.

## Decision

Both exhibits pass flagship acceptance.

- **Linear Regression** advances to `flagship`. The outlier/squared-error state still has a clear peak moment: the rogue point's penalty square visibly dwarfs the trend and makes "squared" literal. The math drawer completes the anatomy by tying the live MSE readout to `L(w, b)`, deriving the zero-gradient closed form, naming the degenerate-x edge case, and bridging naturally into Gradient Descent.
- **Gradient Descent** advances to `flagship`. The divergence state and loss-surface reveal carry the strongest moment: the learner breaks the walk, lifts the fog, and sees the path rocket off the map. The math drawer closes the prior depth gap by spelling out the update rule, the exact stability ceiling (`eta ~= 0.029`), and the roughly `135x` condition-number story behind the curved-then-crawling path.

## Scores

Pillar A remains at 3 across sampled criteria: orientation, flow, responsiveness, shell coherence, and access evidence all still hold in production. The visible status change does not alter navigation structure or mastery behavior.

Pillar B remains at 3 across B1-B6 for both exhibits. The math drawers move the exhibits from "interactive with a visible missing anatomy piece" to complete flagship exhibits. They do not push the work to level 4 because the known gaps remain exactly the benchmark-exemplar gaps: narration is still synchronized to prose rather than experiment events, and the visual register is disciplined rather than richly art-directed.

## Red lines

All red lines clear:

1. Manipulation latency remains covered by the existing perf e2e gates.
2. Visualizations remain honest: log bands and axes are labeled, divergence is explicit, and the datasets are pinned by tests.
3. Interactivity teaches: each manipulation maps to a tested claim and an assessment item.
4. The prose remains adult and non-condescending.
5. Graph validation passed against 12 nodes, 17 edges, and 1 journey.
6. No shipped `flagship` exhibit has a silent missing section; the math drawer is now present on both.

## Follow-up

Start Phase 1's regression cluster. Re-measure cadence after the next connected group ships, because the flagship pair now proves the full platform method but still gives only n=2 evidence for marginal content cost.
