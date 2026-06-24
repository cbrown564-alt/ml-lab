# Phase 1 Scale-Out Plan — the autonomous cluster loop

The durable reference for scaling Phase 1 across all ~25–30 concepts once the
foundational work (typed edges, failure gallery, transfer items — see
[PHASE1-STATUS.md](PHASE1-STATUS.md) and the docs they land in) is in place. This
is **Phase D** of the approved 2026-06-22 plan; Phases A–C (park this plan, fold
the market-strategy report into the docs, implement the compounding primitives)
precede it.

## Premise

The shared exhibit template is **locked for scaling** (PHASE1-STATUS.md, gate of
2026-06-22): the hard part — lifting `StoryStepper` / `StatGrid` / canvas-first
composition to the Distill/3B1B bar — is proven (linreg visual register 3.0). What
remains is **per-exhibit buildout**, "larger but more mechanical." This plan
operationalizes the workflow PHASE1-STATUS.md already names; it does not invent a
new direction.

## Decisions (set by the user, 2026-06-22)

- **Exit bar = cluster at flagship, batched.** Build every node in a cluster to
  `interactive`, then run one flagship-polish + non-circular review pass over the
  whole cluster before advancing. Each cluster ships at the bar; avoids the
  scope-gravity the roadmap warns against.
- **Autonomy = fully autonomous.** The orchestrator (main thread) runs end-to-end;
  the **non-circular specialist review panel is the only gate** (this is what
  reconciles distrust of self-review — agents judge against *stored exemplar
  frames*, never memory). Escalate to the user only when genuinely blocked.

## The specialist sub-agents (`.claude/agents/`)

Three reusable, persisted agent definitions, spawned **per cluster** (not per
exhibit — cost control). Each is fed the **stored exemplars** in `docs/exemplars/`
and must produce a side-by-side verdict against a **named frame**; a register score
never moves without one (the non-circularity contract from `SYNTHESIS.md` Stream 3).

- **`designer-critic.md`** — visual register (B2/B6/A5). Inputs: `docs/exemplars/*`
  frames, fresh Playwright captures (1440px, all four views + scroll positions),
  `SYNTHESIS.md`, `DESIGN.md`. Output: per-view register score 0–4 each citing a
  named exemplar frame, the single highest-leverage fix, a short punch list. Tools:
  Read (incl. images), Bash, Grep, Glob. Model: opus.
- **`teacher.md`** — pedagogy + narrative (B1/B4/B5). Checks the manipulation→insight
  chain (Victor), ≥1 predict-then-verify beat, the 20-minute choreography, Mayer
  principles, misconception-encoding distractors, the transfer item, concrete-before-
  abstract, no condescension, copy-vs-on-screen consistency. Output: verdict + named
  fixes. Tools: Read, Bash, Grep.
- **`tester.md`** — capture + integrity (A3/A6/C4 + red lines). Runs Playwright
  capture (produces the contact sheet the designer reads), axe-core (0 serious/
  critical), interaction smoke (drag/scrub/step <100ms), the e2e suite, honest
  scores. Tools: Bash, Read, Glob, Grep.

The orchestrator (main thread) **builds**; the panel **judges**.

### Amendment (2026-06-23): the human disposes on taste (docs/08)

The panel inflates against exemplars held in its prompt (`SYNTHESIS.md`), so the
panel's verdict is now a **prediction**, not the gate. The gate is the human
review surface ([docs/08](../08-quality-loop-and-review-system.md)):

- Before re-touching an exhibit, the orchestrator runs `npm run brief -- <id>`,
  which injects `docs/reviews/feedback/<id>/` — the human scorecard (rubric v2),
  the below-floor dimensions, the blocking items, and the `decisions.md`
  this-not-that record — as **ground truth that overrides the panel** for the same
  dimension. A rejected direction is never re-proposed.
- `npm run check:rubric` is the mechanizable half of the gate (hero §1b,
  assessment form §1c, verdict freshness / red line #6). A flagship claim with a
  missing hero or a stale/absent human verdict is mechanically false.
- The "genuine taste fork the non-circular method can't resolve" escalation now
  **resolves on `/review`** and the resolution is captured, instead of stalling.

Net: the panel proposes and predicts; the human disposes on taste; the filesystem
remembers. Resume scale-out only once Foundations is re-judged through `/review`
(`docs/reviews/foundations-rejudge.md`).

## Per-exhibit pipeline (orchestrator)

1. `npm run new:exhibit -- <id>` (scaffolds schema-valid stubs; node must be in graph).
2. `npm run brief -- <id>` (assembles drafting context).
3. **Model layer** (if the concept has one): TS implementation + analytic checks,
   verified against a committed sklearn fixture from `scripts/generate_fixtures.py`.
4. **ExperimentSpec**: params/datasets/scenarios, incl. ≥1 structured failure.
5. **Viz**: compose the kit (`Plot`/`StatGrid`/`LossSurface`/`TrainingCurve`/
   `ScenarioBar`/`ParamSlider`/`Annotation`) — bespoke only when the kit can't.
6. **Narrative + spine** to the 20-minute choreography: hook (surprise/prediction) →
   guided manipulation → mechanism+math → mirrored code → break 2–3 ways → transfer →
   whiteboard close. Grammar-hued terms; equations beside their consequence.
7. **Math view**: equations tinted via `HUE_INK`; a live widget beside any claim with
   a live consequence.
8. **Failure gallery**: compose `FailureGallery` from the reusable failure primitives
   (Trigger/Symptom/Diagnosis/Repair/Boundary) — the "Break it" surface.
9. **Concept check**: choice (misconception distractors) + predict-then-verify +
   experiment-task + **transfer** (the north-star item).
10. **Wire**: `page.tsx` + components → `ExhibitFrame`; add to `content/exhibits/index.ts`;
    advance graph node `status` stub → `interactive`; type the new edges with the
    pedagogical vocabulary (learner-facing *why*).
11. **Audio**: `npm run audio` (placeholder voice per the parked-voice decision).
    Best-effort — never blocks the loop.
12. **e2e + screenshots**: smoke every affordance (open the right tab first); darwin
    baselines.
13. **Green gate**: `npm run validate` + build + unit + touched e2e → **commit**.

## Per-cluster review + flagship batch (the gate)

After every node in a cluster is `interactive`: spawn the **panel** against named
frames → collect verdicts → fix highest-leverage items → re-capture → re-review until
visual register ≥3 on the cluster's hero and the teacher/tester sign off → advance
cluster statuses to `flagship` → log verdicts in PHASE1-STATUS.md → commit.

## Cluster sequence + graph expansion (graph-coherent, per docs/05)

Grow the graph **per cluster** (keeps `validate` honest, journeys coherent):

1. **Regression / foundations** (mostly seeded as stubs): what-is-ml, the-dataset,
   regression-task, **loss-functions** (ideal first build — between the two flagships,
   reuses MSE/penalty/surface machinery), feature-scaling, polynomial-features,
   regularisation (overfitting-regularization), train-test-generalization,
   bias-variance (new), data-leakage (new), evaluation-metrics (new),
   classification-task, logistic-regression.
2. **Trees**: k-nearest-neighbors, decision-trees, random-forests, gradient-boosting,
   naive-bayes, svm (+kernel). New nodes/edges + a journey.
3. **Unsupervised**: k-means, pca (+ clustering framing). New nodes.
4. **Deep-learning on-ramps**: neural-network-fundamentals (stub), cnns, embeddings,
   attention, the-transformer, **how-llms-work (a graph journey, not one giant
   exhibit)**, fine-tuning-vs-prompting-vs-rag. Biggest lift — pulls in the deferred
   platform capabilities (3D/GPU surfaces, in-browser training).

## Loop control (durable + autonomous)

- **Durable state** lives in PHASE1-STATUS.md (iteration log + per-node status table)
  so progress survives context summarization.
- **Termination**: all four clusters flagship-batched.
- **Escalation (the only stops)**: a missing capability/secret (e.g. ElevenLabs key),
  a red-line it cannot clear, or a genuine taste fork the non-circular method can't
  resolve.

## Standing rules (inherited)

- Never self-certify the visual bar — a register score moves only on a critic agent's
  side-by-side verdict against a named exemplar frame.
- Every iteration ends green (`npm run validate`, build, unit + e2e where touched) and
  with a commit.
- Re-derive the two flagship exhibits onto any template change as the proof.
- Log dead ends and profitable paths in FINDINGS.md so the loop never repeats work.
