# Benchmark comparisons — written verdicts

Required by docs/06 (B2 measure: "side-by-side comparison with the closest
benchmark-set treatment of the same concept — written verdict required") and
B3 (motion audit). Honest, against the named benchmark set, dated 2026-06-12.

## Linear regression — vs. Seeing Theory ("Regression Analysis") and Distill's interactive style

**Closest treatments**: Seeing Theory's least-squares page (draggable points,
residual squares toggle); R2D3's visual ML intro (annotated, narrative-paced
graphics).

**Where we match the bar**

- The core manipulation (drag a point, the OLS line refits live, residuals
  visible) is at parity with Seeing Theory, and our residual-*squares* view
  makes the identical pedagogical move theirs does: the penalty is an area,
  so "squared" stops being algebra and becomes geometry.
- We go past Seeing Theory in three places: scenarios with stakes (the
  tyranny dataset is a curated failure, not just free play), the staged
  punchline (selecting the failure scenario switches the error view to
  squares itself), and assessment threaded into the same canvas (the
  evict-the-outliers task is performed in the plot, not asked about it).
- Annotation inside the graphic ("ŷ — the model's line", "area = the penalty
  it pays here") follows the R2D3/Distill practice of captions living where
  the eyes are, not in a sidebar.
- The painter ("paint your own data") has no equivalent in the benchmark
  treatments; the line chasing your wrist is our most shareable beat.

**Where we are honestly short**

- R2D3's scroll-driven narrative pacing — graphics that rebuild themselves
  as the story advances — remains richer than our static-prose-plus-island
  layout. Our story sections reference the experiment; theirs *are* the
  experiment.
- No character/scene art yet (force personification is designed but
  unshipped), so the emotional-design register is plainer than The Pudding's
  work.

**Verdict**: at parity with the closest single-concept treatment (Seeing
Theory) and ahead of it on guidance, staging, and assessment; below the
full-essay benchmark (R2D3) on narrative-graphic integration. Scores 3, not 4.

## Gradient descent — vs. Distill ("Why Momentum Really Works") and TensorFlow Playground

**Closest treatments**: the banana-surface descent widget in Distill's
momentum article (path-on-contour-map with a step-size slider); TensorFlow
Playground's live training loss; 3Blue1Brown's gradient-descent chapter
(cinematic, not interactive).

**Where we match the bar**

- Full learner-paced time control (play / pause / step / ×10 / scrub /
  mid-run knob turns) exceeds the Distill widget, which animates but does
  not scrub, and Playground, which cannot step.
- The loss-surface view is the same fundamental graphic as Distill's
  contour-and-path: candidate parameters as territory, training as a walk.
  Ours is synced to the scrubber both ways and shared with the data-space
  view and training curve — three simultaneous representations of one step
  index, which none of the benchmark treatments offer.
- Divergence is a first-class beat (auto-pause, explanation, the path
  rocketing off the map), where Distill's widget merely oscillates and
  Playground silently NaNs. Teaching the failure mode is our differentiator.
- The stability-cliff predict item (0.02 converges, 0.04 explodes — pinned
  by a unit test) encodes the momentum article's central quantity (the
  critical step size) as a hands-on surprise rather than an equation.

**Where we are honestly short**

- Distill's article renders the *eigenvalue story* (why the narrow valley
  axis is the binding constraint) visible through the condition number; our
  surface shows the ellipses but never names the anisotropy.
- 3Blue1Brown's cinematic camera work on 3D surfaces has no equivalent here;
  our surface is top-down 2D only (the 3D/GPU pass is scheduled with the
  deep-learning cluster, docs/05).
- One scenario family (one dataset) — the benchmark widgets let you vary the
  surface's conditioning.

**Verdict**: ahead of every benchmark treatment on time control and failure
pedagogy; behind Distill on mathematical depth of the surface story. Scores
3, not 4.

## Motion audit (B3 measure)

Every animation in the lab, classified:

| Motion | Class | Justification |
| --- | --- | --- |
| Fit line refit during drag | explanatory | the model's response IS the lesson; intentionally transition-free (perceived-instant) |
| Descent playback (line + curve + surface dot per step) | explanatory | each frame is a real descent step; learner-paced via transport |
| Scenario-swap point morph + line sweep (400ms) | transitional | object constancy across dataset changes (Heer & Robertson); error layers sit out the morph |
| Loss-surface reveal (lift-fog, 600ms) | transitional | stages the peak moment; reduced-motion gets the cut |
| Point hover radius growth (120ms) | decorative | signals grabbability (perceived affordance — Hohman et al.); justified |
| Chip/button hover color transitions | decorative | standard affordance feedback; justified |

No animation runs unprompted or in a loop; everything is input-driven, so
idle CPU stays at zero (C5) and the apprehension principle is never at risk.
`prefers-reduced-motion` collapses all of the above to instant cuts globally.
