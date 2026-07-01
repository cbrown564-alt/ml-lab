# Quality Loop & Human-in-the-Loop Review System

**Status:** implemented (2026-06-23); human pass complete (2026-07-01). See
[foundations-rejudge.md](reviews/foundations-rejudge.md). Scale-out resumes at the
unsupervised cluster.
[Implemented](#implemented-2026-06-23) at the foot of this doc. The bridge between
"Foundations is built to a good standard" and "Foundations clears the Distill/3B1B
bar" — and the precondition for scaling the loop
([PHASE1-SCALE-PLAN.md](loop/PHASE1-SCALE-PLAN.md)) to the rest of the graph
without compounding a 2-not-3 register across 30 nodes.

## Why this exists — the diagnosis

The autonomous loop reaches a **competent, internally-consistent "good"** and
cannot, as built, reach **"delight."** Two structural reasons, confirmed by an
adversarial read of the homepage + `what-is-ml` / `linear-regression` /
`gradient-descent` against the stored exemplar frames:

1. **The only true non-circular judge — the human taste-holder — is not in the
   loop.** Every verdict today is an agent writing `FINDINGS.md`. `SYNTHESIS.md`
   already proved the agent panel inflates ("register 3" vs honest 2) because it
   scores against exemplars held *in its prompt*. Without the human's "this, not
   that" as ground truth, "non-circular" is aspirational. The current loop names
   exactly one escalation for this — *"a genuine taste fork the non-circular method
   can't resolve"* — but provides no surface to resolve it on.
2. **The rubric is excellent prose and a poor instrument.** `docs/06` scores a whole
   exhibit's visual register as one gestalt number a reviewer can rationalize. It
   never decomposes B2/B5/B6 into individually-failable checks, sets no concrete
   floor for the hero or for assessment *form*, and operationalizes neither the A5
   "screenshot lineup" nor the B2 "named-frame verdict." So bare-scatter heroes and
   MCQ-stack "Explain it" acts shipped flagship on all 15 nodes.

Concrete failures this system must have caught (full read in the 2026-06-23
critique; summarized so this doc stands alone):

- **Heroes carry zero in-graphic annotation** — meaning lives in prose, not in the
  picture (Distill labels "Start / Optimum / Solution" *on the curve*). Systematic.
- **Opening grammar is inconsistent** — the journey's *first* node (`what-is-ml`)
  has the *weakest* opening (no specimen hero) while later nodes have one. Per-exhibit
  review is structurally blind to this.
- **"Explain it" is an MCQ stack on every node** — "exam cosplay," which B5 forbids.
- **The homepage is competent editorial, not a lab front door** — static thumbnail
  hero, no above-the-fold interactive payoff.

## Design principles

- **The human judges taste; the machine judges everything mechanizable.** The UI
  exists to spend the human's attention only where it's irreplaceable (composition,
  delight, "is this the right metaphor") — never on what axe/budgets/fixtures already
  decide.
- **Every verdict is durable and machine-readable.** A "3/5, the bowl is too harsh"
  is a file the next loop iteration reads, not a chat message that evaporates.
- **Compare against pinned pixels, never memory** — extends the `docs/exemplars`
  contract to the human's own review surface.
- **Schema-first** (Pillar C3): the rubric is typed and zod-validated like every
  other content artifact; the build can assert a flagship node has a complete,
  in-date scorecard.

---

## Part 1 — Rubric v2: a decomposed, testable instrument

Replace the single per-view register score with a **scorecard**: a fixed set of
sub-dimensions, each scored 0–4 against a *named* exemplar frame, each individually
failable. Lives as a zod schema (`content/quality/rubric.ts`) so the review UI
renders the form from it, the agent panel writes against it, and the build validates
completeness.

### 1a. Visual register, decomposed (was B2/B6 "register N")

| Dimension | The failable question | Floor for flagship |
| --- | --- | --- |
| Annotation-integration | Does the graphic carry its own labels/explanation (signaling), or does meaning live only in adjacent prose? | ≥3: key marks labeled *in* the graphic |
| Hero as protagonist | Is the opening visual full-width, composed, poster-worthy *in isolation* (legible as a thumbnail)? | ≥3 |
| Mechanism-in-the-picture | Does the hero show the *mechanism* (residuals, the bowl, the boundary), not just the data? | ≥3 |
| Colour discipline | Semantic grammar held; no dilution (e.g. an all-red field draining "error"); AA in prose | ≥3 |
| Atmosphere & finish | Smoothness, focal hierarchy, restraint — Distill-soft, not aliased/harsh | ≥3 |
| Motion | Each animation explanatory/transitional (not decorative); steppable where complex | ≥3 |

### 1b. The hero spec (new — closes the "poster-worthy is an adjective" gap)

A flagship hero **must**: (a) be full content width; (b) carry ≥1 labeled annotation
in-graphic; (c) depict the mechanism, not only the data; (d) remain legible at
thumbnail scale; (e) perform at most one *explanatory* load motion. **An exhibit
without a hero cannot be flagship** — which directly fixes the `what-is-ml` doorway.

### 1c. The assessment-form spec (new — kills exam cosplay)

"Explain it" **must** contain: ≥1 `experiment-task` that is *actually embedded and
playable* (not text instructions), the `transfer` item rendered as an interaction or
open prompt rather than MCQ where the concept allows, and feedback on *process* for
every option. A pure MCQ stack is an automatic B5 fail regardless of item quality.

### 1d. Cross-exhibit consistency gate (new — operationalizes the A5 lineup)

A **cluster-level** check, not per-exhibit: shuffle the cluster's hero frames with
the exemplar frames; the human marks any that read as the weakest, and any
inconsistency in opening grammar (hero present/absent, masthead structure) across the
cluster is a blocking finding. This is the only way "first node has the weakest
opening" becomes visible.

### 1e. Pinned-benchmark verdict (operationalizes B2)

Every register sub-score names **a specific exemplar PNG and dimension**
(`gd hero vs distill-momentum/00 · annotation-integration: 2`). A score with no
named frame is invalid and the schema rejects it.

---

## Part 2 — The capture pipeline (Playwright MCP)

The review UI is only as good as what it can show. Replace the ad-hoc
`capture-current.mjs` (2 hardcoded slugs, stale tab names) with a **standard review
artifact** generated per exhibit:

- **Per-act contact sheet** at the 1440px reference: viewport + scroll positions for
  See it, full frames for Run it / Break it / Explain it, plus the homepage and the
  cluster hero lineup.
- **Each frame paired with its pinned exemplar frame** for side-by-side.
- **Driven by the Playwright MCP** (added 2026-06-23), not a one-shot script: the
  reviewer (human or agent) can *drive the live page* — switch acts, trigger a
  failure, scrub the training loop — and capture the resulting state on demand,
  instead of being limited to pre-baked scroll positions. This is the substrate for
  capturing *peak moments* (B6) as frames, which the rubric now requires.
- Output to a predictable path (`docs/reviews/captures/<exhibit>/<date>/`) so both
  the UI and the agent panel read the same pixels.

---

## Part 3 — The human-in-the-loop review UI

A web surface — a `/review` route in the existing Next app (reuses the design
system, ships nothing new to learners; gated out of the static export) — that turns
review from "read an agent's prose" into "look at the work and render a verdict."

### What it surfaces, per exhibit/act

1. **The rendered work** — the live page (or its capture contact sheet) at reference
   width, switchable by act.
2. **Side-by-side with the pinned exemplar frame** named by the rubric dimension
   under review — the comparison is on-screen, never from memory.
3. **Alternatives** — where a choice has variants worth weighing (e.g. two hero
   compositions, two colour treatments of the loss field), the variants rendered
   adjacent. This is the "this, not that" surface.
4. **Rationale & references** — the recorded *why* of the current choice and its
   sources of inspiration (which exemplar, which principle), so a decision can be
   re-litigated rather than rediscovered.

### What the human does on it

- **Score** each rubric sub-dimension 0–4 (form rendered from the v2 schema).
- **"This, not that"** — pick a variant; the rejected one and the reason are recorded
  (durable, so the loop never re-proposes it).
- **Freeform "here is what's wrong"** — pinned to a specific frame/dimension.
- **Verdict** — advance / hold, with the blocking items enumerated.

### Where verdicts persist (durable feedback)

Filesystem, machine-readable, beside the captures:

```
docs/reviews/feedback/<exhibit>/
  scorecard.json     ← rubric v2 sub-scores + named exemplar frames + verdict + date
  notes.md           ← freeform "what's wrong", pinned to frame/dimension
  decisions.md       ← this-not-that record: chosen variant, rejected variants, why, refs
```

`scorecard.json` validates against the rubric zod schema. A stale or absent scorecard
(exhibit changed after its last human verdict) is a flagship blocker — the build can
assert this, so "flagship" stops being able to lie (red line #6).

---

## Part 4 — Closing the loop

The point of durable feedback is that the **autonomous loop reads it back**:

- The orchestrator, before re-touching an exhibit, loads `feedback/<exhibit>/` and
  treats the human scorecard as **ground truth that overrides the agent panel's
  score** for the same dimension. The agent panel's job narrows to *predicting* the
  human verdict and flagging only what's mechanizable; divergence between agent and
  human scores is itself a tracked signal (is the panel calibrated?).
- `decisions.md` is injected into the drafting context (alongside `brief`) so a
  rejected direction is never re-proposed — the loop compounds taste, not just code.
- The human's escalation seam in PHASE1-SCALE-PLAN.md (the "genuine taste fork")
  resolves *on this UI* and the resolution is captured, instead of stalling the loop.

This is the amendment to the autonomous loop: **the panel proposes and predicts; the
human disposes on taste; the filesystem remembers.**

---

## Part 5 — Sequencing

1. **Rubric v2 schema** (`content/quality/rubric.ts`) + port `docs/06` prose into it.
   Cheap, unblocks everything, makes the bar testable today.
2. **Capture pipeline on the Playwright MCP** — standard per-act contact sheet +
   exemplar pairing to `docs/reviews/captures/`.
3. **`/review` UI v1** — render captures + side-by-side exemplar + the v2 scoring
   form; write `scorecard.json` + `notes.md`. (Alternatives/decisions can be v2.)
4. **Re-judge Foundations** through the new UI — the honest re-baseline `SYNTHESIS.md`
   has owed since Stream 3, now with the human in the seat. Expect several nodes to
   drop below flagship; that is the system working.
5. **Loop read-back** — orchestrator consumes `feedback/` as ground truth + injects
   `decisions.md`. Only then resume scale-out.
6. **Alternatives + rationale surface** (`/review` v2) — variant rendering and the
   decisions record, once the basic loop is proven on Foundations.

## Part 6 — Decisions needed from the user

- **`/review` route vs standalone tool** — in-app route (reuses design system, one
  codebase) is the recommendation; a standalone viewer is more work but fully
  decoupled from the learner build.
- **Live page vs static contact sheet in the UI** — live (via MCP/dev server) gives
  real interaction to judge; captures are faster and reviewable offline. Recommend
  live for the act under review, captures for the lineup.
- **Where the rubric floor sits** — this plan sets flagship floors at ≥3 per
  sub-dimension (matching `docs/06`'s "no criterion below 3"). Confirm, or set the
  delight-bearing dimensions (hero, atmosphere, assessment-form) higher.

### Decisions taken (2026-06-23, the recommendations)

All three were built per the plan's own recommendation, each kept cheap to revisit:

- **`/review` route, not a standalone tool** — an in-app route group under
  `src/app/review/` that reuses the design system but is **dev-only** (the layout
  `notFound()`s in production; the build marks every `/review` route `ƒ` dynamic
  while the 16 learner pages stay `○` static — gated out of the learner build).
- **Captures + live link** — the UI renders the pinned contact sheet for offline,
  artifact-to-artifact judging, with an "open live page ↗" link to the running
  exhibit for the act under review (the recommended split).
- **Floor ≥3 across the board**, with the delight dimensions (`hero-as-protagonist`,
  `atmosphere-finish`) tagged `delight: true`. Floors live as **data** in
  `REGISTER_DIMENSIONS` — raising a delight dimension to 4 is a one-line change.

---

## Implemented (2026-06-23)

| Part | Shipped |
| --- | --- |
| 1 — Rubric v2 | `content/quality/rubric.ts` — zod scorecard: register §1a (6 failable dims, each naming an exemplar frame §1e), hero spec §1b, assessment form §1c, cluster consistency §1d; floors-as-data + `flagshipBlockers`/`scorecardComplete`/`meetsFlagship`. Pinned by `rubric.test.ts`. Mechanizable detectors in `content/quality/checks.ts`. |
| 2 — Capture pipeline | `scripts/capture-review.mjs` (`npm run capture:review`) — per-act contact sheet at 1440px (hero · See/Run/Break/Explain · home), each frame paired with its exemplar in a `manifest.json`, to `docs/reviews/captures/<exhibit>/<date>/` (gitignored — regenerable). |
| 3 — `/review` UI v1 | `src/app/review/` — roster + per-exhibit surface: captured↔exemplar side-by-side, the v2 scoring form rendered straight off the schema (live flagship-blocker preview), writing `scorecard.json` + `notes.md`. Route handlers stream frames (path-sandboxed) and persist verdicts. Dev-only. |
| 4 — Re-judge | `npm run check:rubric` + the capture run produced the honest re-baseline in `docs/reviews/foundations-rejudge.md`. Human pass complete 2026-07-01; all live exhibits carry in-date scorecards. |
| 5 — Loop read-back | `npm run brief` injects `feedback/<id>/` (scorecard verdict + below-floor dims + blocking + notes + this-not-that decisions) as **ground truth that overrides the agent panel**. Amendment recorded in PHASE1-SCALE-PLAN.md. |
| 6 — Alternatives + rationale | `decisions.md` this-not-that surface in `/review` (variant frames rendered adjacent from `<capture>/variants/`; chosen/rejected/why/refs persisted), read back by the brief. |

**Human review:** complete (2026-07-01). All live exhibits carry in-date human
scorecards; `check:rubric --strict` gates `prebuild`. Resume scale-out at the
unsupervised cluster.
