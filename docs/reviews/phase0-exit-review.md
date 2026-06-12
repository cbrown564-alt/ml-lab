# Phase 0 exit review

Date: 2026-06-12 · Reviewed at commit `669bd41` (iteration 18) plus one fix made during review (hero annotation clip).

## Scope and reviewer honesty

This is the independent review called for by the loop's exit condition (all 19 criteria ≥ 3 in [docs/loop/STATUS.md](../loop/STATUS.md)). It was conducted with fresh context against the running production build: a cold-user walkthrough of the full surface, a screenshot review, an accessibility-tree audit of both exhibits, the Mayer 12-principle checklist per exhibit, a red-lines check, and a critical read of the whole repo against the vision bar.

What this review **cannot** substitute for, and explicitly leaves on the release checklist:

- **Human cold walkthroughs (n≥3, think-aloud)** — the rubric's measure for A1/A4/B1/B5. This review ran one expert walkthrough; the rubric ties these to *releases*, not phase boundaries, so they gate public launch, not Phase 0 exit.
- **A real screen-reader pass (NVDA/VoiceOver)** — the aria-tree audit below is strong evidence, but synthesized speech order, verbosity, and live-region behavior need a human ear.

Evidence artifacts: [phase0-walkthrough/](phase0-walkthrough/) (screenshots, aria snapshots, friction log).

## Verification

Full gauntlet re-run from a clean checkout state before review: 79 unit tests, 41 e2e (functional + perf project), performance budgets, dependency-cruiser architecture rules, graph validation, production build — all green.

## Cold-user walkthrough (A1, A4, B1)

Conducted against `next start`, fresh storage, 1440×900.

- **Orientation**: the hero answers "what is this place" in one sentence ("A laboratory, not a course…") with the lab's signature vignette beside it. Two open exhibits, the map, and the journey are all on the front door. **Time from landing to manipulating a live model: one click plus a scroll** (~0.9s measured) — far inside the ≤3-click budget and the 60-second payoff bar.
- **Exhibit anatomy**: kicker, mastery badge, lede, narrated hook, scenario bar, experiment, story, concept check, field notes, graph neighborhood, journey position with an honest "next stop isn't open yet" — present and in the same order on both exhibits. Consistency holds; nothing had to be re-learned on exhibit #2.
- **No dead ends**: both page bottoms offer the map and live neighbors.
- **The teaching arc lands**: the tyranny scenario's prompt asks for a prediction before the manipulation; dragging the rogue point makes the line chase it; the penalty square dwarfing the crowd is legible at a glance; the story sections then name what was just felt. On gradient descent, the three-views-one-step-index design (data space, training curve, loss surface) is the strongest single surface in the lab.
- **Friction log**: (1) the experiment sits below the fold on exhibit pages at 900px height — defensible (the hook is the designed opener) but worth watching in human walkthroughs; (2) client-side navigation has no transition treatment, so a slow hop can flash the old page; (3) **fixed during review**: the hero vignette's "the one that got away" annotation clipped at the SVG edge.

## Screenshot lineup (A5/B2)

Reviewed: home (full + above fold), both exhibits (above fold, key scenario states, full page), the revealed loss surface.

Verdict: the lab is recognizably one place — one type system, one spacing rhythm, the grammar hues (truth amber, prediction blue, error rose, parameter purple) consistent from the hero vignette to the loss surface. Annotations live inside the graphics ("the valley floor (OLS)", the biggest-penalty callout). In a shuffle with Distill/Seeing Theory/R2D3 screenshots it would not read as the weakest; it would also not be mistaken for the richest — no scene art, no scrollytelling figures, the register is restrained-editorial throughout. **A5 = 3 confirmed; the gap to 4 is atmosphere, not discipline.**

## Accessibility-tree audit (A6)

From the aria snapshots of both exhibits:

- The plot group's accessible name carries the *teaching point and live state* ("…least-squares line fitted live. Slope 1.49, intercept 2.11, MSE 34.58. Dragging points refits the line…"), not "chart of data". This is the rubric's exact ask.
- Every data point is a named button with its coordinates and instructions; arrow-key movement verified working in the walkthrough (cy changed under keyboard control).
- Sliders, mode toggles, and error-view controls are properly labeled groups; the lab task uses a `status` live region; readouts are plain text.
- The non-interactive GD plots are `img` with state-bearing descriptions that update per step.
- Nits for the punch list: the Listen button's accessible name concatenates ("Listen0:45"); the per-word transcript spans deserve a check under a real screen reader (risk: word-by-word announcement).

**A6 = 3 confirmed**, with the NVDA pass remaining a release-gate item.

## Mayer 12-principle checklist (B4 measure)

Scored per exhibit; the two exhibits share the narration architecture, and every judgment below was checked on both.

| Principle | linreg | grad-descent | Note |
| --- | --- | --- | --- |
| Multimedia (words + pictures) | ✓ | ✓ | every claim has a visual counterpart |
| Coherence (no extraneous material) | ✓ | ✓ | parameters curated; zero decoration |
| Signaling | ✓ | ✓ | annotations inside the graphics |
| Spatial contiguity | ✓ | ✓ | ŷ label, valley floor, penalty callout |
| Temporal contiguity | ◐ | ◐ | narration syncs to *prose*, not to experiment visual events — the known level-4 gap |
| Segmenting | ✓ | ✓ | per-section, learner-paced narration |
| Pre-training | ✓ | ✓ | residuals named before "Why squared error"; gradient before the update rule |
| Modality | ◐ | ◐ | spoken words exist, but accompany text rather than the graphic |
| Redundancy | ◐ | ◐ | narration duplicates on-screen text by design (read-along); falls under the captioning/accessibility exemption, resolved properly by choreographed narration |
| Personalization | ✓ | ✓ | conversational second person throughout |
| Voice | ✓ | ✓ | natural ElevenLabs narrator |
| Image (no gratuitous talking head) | ✓ | ✓ | trivially satisfied |

**9 of 12 fully met, 3 partial — all three partials are the same root cause (narration is anchored to prose, not to the experiment), which is exactly the named level-4 deferred work. B4 = 3 confirmed; the checklist agrees with the self-assessment.**

## Red lines

1. **Sluggish manipulation** — clear; <100ms enforced in CI on a real drag and a real scrub.
2. **Misleading visualization** — clear; log axes labeled, the loss surface caption says "log bands", divergence shown honestly, datasets are the committed sklearn fixtures.
3. **Interactivity without insight** — clear; every affordance maps to a tested claim.
4. **Condescension** — clear; the prose respects the reader (and is the repo's quiet strength).
5. **Graph inconsistency in production** — clear; structurally impossible (prebuild gate).
6. **Flagship status with silent incompleteness** — clear; both exhibits ship as `interactive` and say "Still to come: the math drawer" on the page.

## Status decision

- **Both exhibits: confirmed at `interactive`.** Every criterion ≥ 3 and red lines clear, which is the docs/06 *score* bar for flagship — but the vision's flagship anatomy includes the math drawer, which neither exhibit has. Advance to `flagship` when the math drawer lands (plus, ideally, the first choreographed-narration pass). The completeness model is doing its job: the gap is visible, not silent.
- **Phase 0: EXIT PASSED.** The roadmap's exit criterion is two exhibits *proving every pillar end-to-end*, and that is unambiguous: graph → validation → render; model layer → experiment → both modes; narration pipeline → staleness enforcement; mastery → recommendation; assessment → task-event bus; scaffolder → brief; CI enforcing architecture, budgets, axe, vitals, and interaction latency. No platform capability remains unproven.

## Cadence recalibration (C1)

Phase 0 took 18 iterations across two calendar days. Reading the iteration log: exhibit #1 cost roughly six iterations of platform-entangled work; exhibit #2's *lab* cost one iteration (iter 5) plus shared passes, with two new kit pieces (TrainingCurve, ParamSlider) that are now inventory. The scaffolder produces a building stub in minutes, and `brief` assembles drafting context mechanically.

Estimate for Phase 1 planning: **1–3 focused iterations per `interactive` exhibit** on the existing kit, with kit-piece additions front-loaded in each new cluster (trees will need a tree renderer; unsupervised will need cluster/voronoi views). Confidence is honest-low at n=2; re-measure after the regression cluster completes and treat any exhibit that costs what exhibit #1 did as a platform bug per docs/06 C1.

## Critical read of the whole repo

**Is it useful?** For the two concepts it covers, genuinely: a motivated learner leaves able to explain "best" line, why squared error obsesses over outliers, what a loss landscape is, and why learning rate is the knob that matters — the whiteboard test plausibly passes. But the lab today is ~40 minutes of material behind a front door that promises a territory; 2 of 12 map nodes open, 2 of 11 journey stops. Useful as a destination: not yet. Useful as a proven method for making the next 28 exhibits: yes, and that was Phase 0's actual job.

**Is it distinctive?** The architecture is more distinctive than the pixels. No benchmark-set property combines: a knowledge-graph spine with honest closed doors, learner-controlled time on every training loop, failure as first-class curriculum (divergence auto-pauses and explains), assessment performed inside the simulation, word-synced narration whose staleness is a build failure, and pedagogical claims pinned by unit tests. That last category — *machine-enforced honesty* — is the repo's signature and nobody else's. Visually, it is disciplined but plainer than Distill's or The Pudding's flagship work: distinctiveness currently lives in interaction and integrity, not in art. The characters and choreographed narration (both designed, both deferred) are the planned answer.

**Is it comprehensive?** No, by design — and the design says so honestly everywhere it can. The platform is comprehensive (every pillar end-to-end, enforced in CI); the content is 2 exhibits of a ~30-node Phase 1. Real gaps beyond content volume: no math drawers (the one missing piece of the exhibit anatomy), no mobile treatment at all (the vision promises a graceful "best on a larger screen" notice; nothing is implemented), no character/art system, explorer will need filter/search before ~30 nodes.

**Does it look good?** Yes — confidently, calmly good. One coherent editorial system, composed visualizations, color that always means the same thing, motion that always has a reason. The gradient-descent surface with its three synchronized views is poster-adjacent. It does not yet look *extraordinary*: the register tops out at handsome restraint, and the emotional, atmospheric layer that makes the benchmark set's best work shareable is the acknowledged level-4 territory.

## Punch list (carried into Phase 1)

1. Math drawer on both exhibits — the flagship gate.
2. Mobile/small-viewport graceful treatment (vision commitment, currently absent).
3. Listen button accessible name ("Listen, 45 seconds"); screen-reader check of word-span transcripts.
4. Page-transition treatment for client-side navigation.
5. Human cold walkthroughs (n≥3) + NVDA pass — release gate.
6. Known level-4 work as already queued: choreographed narration, characters + art bible, explorer filter/search, 3D surfaces with the deep-learning cluster.
