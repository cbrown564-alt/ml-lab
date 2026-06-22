# Phase 1 Quality Loop — Findings

Durable findings from the loop: dead ends to not repeat, profitable paths to
reuse, and the falsifiable observations behind each. Newest at the bottom of each
section. Companion to [PHASE1-STATUS.md](PHASE1-STATUS.md).

## Diagnosis (iter 0, 2026-06-22) — current template vs the bar

- **F1 — The graphic floats; it does not command.** The sticky lab renders a
  640×420 Plot that scales to ~620px wide / ~410px tall in the 1.18fr column,
  inside a `min-h-[68vh]` (~612px) beat with content vertically centred → ~200px
  dead space below the panel on every beat. Against `seeing-theory-regression/01`
  (plot fills the entire right half at full viewport height) and
  `distill-momentum/00` (contour bowl is the full-width headline) this is the
  single biggest "blog post with a figure" tell. *Captures: linreg-02/04, gd-00.*
- **F2 — The Experiment view wastes ~45% of the width.** The lab container holds
  the scenario bar + prompt + mode toggle full-width but the plot is fixed-aspect
  and the right ~45% of the row is empty; the plot itself sits below the fold.
  Seeing Theory's lesson: controls + a live estimates table on the left, the plot
  large on the right. *Capture: linreg-experiment.*
- **F3 — GD crams two plots side by side.** The story graphic shows the scatter
  and the loss-fog curve as two small panels in one sticky → both illegible at
  this scale. The loss-surface beat (gd-03) is the strongest single frame we have
  (pink contour bowl + valley floor) but it too is small. Needs one commanding
  composition per beat, not a 2-up. *Captures: gd-00, gd-03.*
- **F4 — Plot reads as a default chart.** Thin axes, 6px dots, a 2.5px line, a
  mono readout strip underneath. Competent, but no composition: no in-frame title,
  no figure caption, readout is an afterthought strip. The exemplars compose the
  figure as a deliberate object (labels inside, one accent, generous frame).
- **F5 — Hook viewport is chrome-heavy.** Back-link, kicker, title+badge, 3-line
  lede, tab row, then the graphic starts ~470px down and only its top third is
  above the fold. The first manipulation should be reachable in the first screen.

## Profitable paths

- **P1 — Full-height sticky graphic.** Make the sticky lab fill ~82–86vh so the
  graphic commands the column. (validating in iter 1)
- **P2 — Live estimates table (Seeing Theory).** A compact n / x̄ / ȳ / ŵ / b̂ /
  MSE table docked under the linreg plot bridges numbers↔geometry *and* fills the
  column height honestly. (validating in iter 1)
- **P3 — Two-column Experiment.** controls + readouts left, large plot right.
  (validating in iter 1)

## Dead ends

- (none yet)
