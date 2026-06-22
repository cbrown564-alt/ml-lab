# Phase 1 Quality Loop — Status

The build→assess→improve loop for **Phase 1** (`docs/05-roadmap.md`). Goal in two
acts:

1. **Lift the shared exhibit template to a genuinely high bar** — judged by direct,
   falsifiable comparison to the captured exemplars in `docs/exemplars/` and by
   Playwright contact sheets, not from memory. Proven on the two flagship
   territories (linear regression, gradient descent).
2. **Scale that template across all of Phase 1**, cluster by cluster, in
   graph-coherent order.

Workflow: an orchestrator (main thread) drives implementation against the live
dev server; a standing **review panel** of specialist sub-agents assesses each
substantive iteration — the **designer/critic** (visual register vs exemplars),
the **teacher** (pedagogy + narrative vs 3B1B/R2D3 clarity), the **tester**
(Playwright capture, contact sheet, honest scores). Reviews are non-circular:
agents are fed the stored exemplars and must produce a side-by-side verdict.

Key findings are logged separately in [FINDINGS.md](FINDINGS.md).

## The bar (what "high standard" means here)

From `docs/exemplars/SYNTHESIS.md` and the teardowns. The template must:

1. Let the graphic be the protagonist — full content width / full column height,
   composed, not a floating panel. (Distill, Seeing Theory, R2D3)
2. Sticky graphic + scrolling prose that re-renders it; object constancy. (R2D3)
3. Colour as shared vocabulary across canvas, controls, and prose. (Ciechanowski)
4. Controls docked to the graphic they drive. (Distill, TF Playground)
5. Math composed beside its consequence. (Distill)
6. One composed, poster-worthy peak visual per exhibit. (3B1B, Distill)
7. Density that stays calm. (TF Playground)
8. Warm, one-action onboarding. (Nicky Case)

Keep our edge: hands-on manipulation, guided discovery with stakes, assessment +
mastery + graph, learner-controlled time.

## Scorecard — template register (honest, vs stored exemplars)

| Pass | Visual register (B2/B6) | Narrative integration (B1/B4) | Verdict source |
| --- | --- | --- | --- |
| Stream 2 baseline (pre-loop) | **2** — competent; graphic floats, dead space, reads as "blog + figure" | 2–3 | SYNTHESIS re-baseline + fresh captures (this loop, iter 0) |
| After iter 1 (Story rework) | linreg Story **2.5**, GD Story **2.5**, Experiment **2** | linreg ~2.5, GD ~3 | Review panel (designer/teacher/tester) vs named exemplar frames |

Target: visual register **3** ("matches the benchmark set") on both flagship
exhibits, confirmed by the critic agent against named frames, before scaling.

## Iteration log

- **Iter 0 (2026-06-22) — diagnosis.** Read the codebase, exemplars, SYNTHESIS,
  DESIGN. Captured both exhibits fresh at 1440px (Story/Experiment/Math views,
  five scroll positions). Confirmed the re-baseline: structurally canvas-first,
  but the graphic does not command. Findings F1–F5 logged. Direction set:
  give the sticky graphic full column height; compose each lab to fill it
  (Seeing-Theory estimates table for linreg; one commanding composition for GD);
  restructure the Experiment view to a real two-column. Begin iter 1.

- **Iter 1 (2026-06-22) — canvas-first Story rework.** The Story tab is the
  exhibit's face, so it went first. The sticky graphic now *commands* the column:
  both labs are tall composed `<figure>`s (~720px) with an in-frame caption
  eyebrow at top, the plot enlarged (linreg 640×560; GD scatter 640×384 + curve
  strip; GD surface 760×620), and a docked readout. New reusable
  `StatGrid` viz piece: the Seeing-Theory live estimates strip (n / x̄ / ȳ / slope
  ŵ / intcpt b̂ / MSE for linreg, grammar-hued) — it fills the column height *and*
  bridges numbers↔geometry. GD's cramped 2-up is gone; each beat is one figure.
  Dead space below the panel (F1) eliminated. validate + 89 unit green. Awaiting
  the review panel before claiming any register movement.

- **Iter 2 (2026-06-22) — act on the panel verdict.** Highest-leverage fixes from
  the review:
  - **Experiment view → canvas-first two-column** (F6, the worst regression): both
    labs now put the plot in the dominant right column, above the fold, with a
    left rail of controls + a vertical `StatGrid` live readout. The "Experiment
    freely" preamble trimmed so the canvas leads.
  - **Cropped linreg axes to the data extent** (F7): yDomain [−25,50] → [−12,40];
    the cloud now fills the frame instead of a diagonal third.
  - **GD loss-surface contrast** (F11): 11 bands + a deeper alpha ramp read as a
    topographic bowl; the descent path gets a surface-coloured halo so the purple
    trail lifts off the red surface at any depth.
  - **Fixed the GD line-view clip at 1440×800** (bug B-iter1-1): trimmed the
    line-view figure so the tallest composition fits a short laptop.
  - **Copy (teacher F9/F10):** linreg `the-residuals` made declarative; a
    predict-then-verify *drag the rogue point* invite pulled into the outlier peak
    beat; `closed-form` formula glossed in plain words; GD `slope-step-repeat`
    now names the surface path's self-throttling, not an off-screen curve.
  - Narration audio regenerated for the 4 edited sections (same Roger voice;
    staleness gate green). build + 89 unit + validate green.
  - **Repaired an inherited-red e2e suite.** The exhibit specs were already
    failing on `main` (the prior tabs commit made Story the default but the specs
    drove Experiment-lab controls without clicking the Experiment tab; a garbled
    parallel `list`-reporter run hid it). Rewrote linreg + GD + code-mode + mastery
    + math-drawer specs against the tabbed structure: an `openExperiment`/tab-click
    step, assertions on the stable Plot `aria-label` rather than the restyled
    readout strings, locators scoped to the *visible* tabpanel, the cross-tab
    assessment flow (drive Experiment → read Check), and the Math view as a tab.
    Regenerated the three darwin screenshot baselines. **40/40 chromium e2e green.**

## Queue

1. ~~Iter 1 — canvas-first scale & composition.~~ Done.
2. ~~Review panel pass (designer/critic, teacher, tester) vs exemplars.~~ Done.
3. ~~Iter 2 — act on the verdict (F6/F7/F11 + bug + copy) + repair e2e.~~ Done.
4. Re-review (designer/critic) vs exemplars; confirm register movement.
5. Iterate template to register 3 on both flagships, then lock the template and
   scale Phase 1 (regression cluster, then trees, unsupervised, deep-learning).

## Standing rules

- Never self-certify the visual bar. A register score only moves on a critic
  agent's side-by-side verdict against a named exemplar frame.
- Every iteration ends green: `npm run validate`, build, unit + e2e where touched,
  and a commit.
- Re-derive the two flagship exhibits onto any template change as the proof.
- Log dead ends and profitable paths in FINDINGS.md so the loop never repeats work.
