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

## Review panel verdict (iter 1, 2026-06-22) — non-circular, vs named frames

- **F6 — The Experiment tab is the worst regression, not the Story.** The
  designer scored Story 2.5 / Experiment 2: the Experiment view is back inside a
  document-first centred column with *no plot above the fold* (title → lede → tabs
  → scenario chips → prompt → mode toggle → canvas below the fold). Backwards: the
  Experiment is where our hands-on edge should be *most* visible. Highest-leverage
  fix. *Frame: linreg-experiment.*
- **F7 — Plots pad axes far beyond the data.** linreg yDomain [−25, 50] with data
  in ~0–30 → the cloud occupies a diagonal third of the frame; upper-left and the
  sub-zero band read empty. Seeing Theory fills edge-to-edge. Cheapest single
  "composed" win: crop axes near the data extent (still containing the outliers).
- **F8 — The two flagships share one hero composition.** linreg-00 and gd-00 both
  open with an orange scatter + a line; they lack distinct faces. The hero is "the
  page's face" — linreg should lead with its residual-squares signature; GD with
  the contour surface.
- **F9 — Peak/failure beats are demos, not manipulations (teacher, both
  exhibits).** The outlier (linreg) and over-the-edge (GD) beats are pre-baked
  scenarios; the actual predict-then-verify manipulation is exiled to the Check
  tab — spent on assessment, not at the dramatic peak. The medium's highest-
  leverage move (B1). Pull one manipulation into the peak story beat.
- **F10 — Copy slips (teacher).** linreg `the-residuals` says "Turn on the dashed
  drops" but in a scroll spine the spine turns them on, not the learner → make it
  declarative. GD `slope-step-repeat` names "the loss curve" while the sticky
  shows the loss *surface* (temporal-contiguity slip) → name what is on screen.
  `closed-form` drops `w* = Σ(xᵢ−x̄)(yᵢ−ȳ)/Σ(xᵢ−x̄)²` with no gloss → annotate or
  move to Math. GD `double-the-stride` over-universalises 0.02/0.04 → the number
  is surface-specific; the *cliff* is universal.
- **F11 — GD surface is low-contrast (designer).** Pink-on-pink loses the
  conditioning story Distill sells with crisp rings. Deepen the band contrast /
  figure-ground separation; keep loss = error hue (grammar).

## Confirmed non-issues

- Residuals DO render at `the-residuals`; the apparent blank is the 450ms
  scenario-ease window. Tester confirmed 45 dashed lines + 31 squares after settle.
- No axe serious/critical violations; zero console errors; StatGrid never
  overflows horizontally. (tester)

## Dead ends

- **Trusting a parallel Playwright run's piped summary.** `npx playwright test`
  with the `list`/`line` reporter to a non-TTY file emitted a garbled, partial
  "15 passed" with exit 0 while real failures existed. Always run a suspect spec
  in isolation (`npx playwright test e2e/<file>.spec.ts`) to get the true count.

## Inherited breakage (found iter 2, 2026-06-22)

- **The exhibit e2e suite was already red on `main`.** The previous commit
  ("Stream 2 iter 2: exhibit as distinct switchable views", 75273d9) made the
  tabbed `ExhibitShell` default to the **Story** tab, but the linreg + GD e2e
  specs drive **Experiment-lab** controls (Reset, scenario chips, error toggle,
  Step/Play/scrub, the lr knob, Code) without ever clicking the Experiment tab —
  and assert on readout *text* (`MSE = `, `step 0`, `loss = `) that iter-1's
  `StatGrid` split into separate label/value cells. Confirmed: GD spec = 8/8
  failing against HEAD *before* any iter-2 change. The flagship-acceptance review
  (iter 20) predates the tabs commit, so the suite was green then and silently
  rotted. Fix (iter 2): add an `openExperiment()` tab step and assert on the
  stable Plot `aria-label` (which encodes slope/intercept/MSE/step/loss live)
  instead of the visual readout strings; cross-tab task test drives Experiment
  then reads the Check tab.

## Bugs found

- **B-iter1-1 — GD line-view stats strip clips below the fold at 1440×800.** The
  line-view figure is 797px; sticky `top:32px` ⇒ bottom at 829px > 800px viewport,
  so "WHERE THE WALK STANDS" is cut off and (being sticky) can't be scrolled into
  view. Fine at 900px and in surface view. The training-curve strip makes line
  view tallest. Fix: cap the sticky figure height / trim the line-view height.
  *(tester; fixed iter 2)*
