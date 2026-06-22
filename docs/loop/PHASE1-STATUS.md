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

## Queue

1. ~~Iter 1 — canvas-first scale & composition.~~ Done.
2. Review panel pass (designer/critic, teacher, tester) vs exemplars — **next**.
3. Iterate template to register 3 on both flagships.
4. Lock the template; scale Phase 1 regression cluster, then trees, unsupervised,
   deep-learning clusters.

## Standing rules

- Never self-certify the visual bar. A register score only moves on a critic
  agent's side-by-side verdict against a named exemplar frame.
- Every iteration ends green: `npm run validate`, build, unit + e2e where touched,
  and a commit.
- Re-derive the two flagship exhibits onto any template change as the proof.
- Log dead ends and profitable paths in FINDINGS.md so the loop never repeats work.
