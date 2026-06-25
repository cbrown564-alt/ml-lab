# Evaluation Criteria

The three master criteria, expanded into an evaluable framework grounded in learning science, HCI research, and engineering practice:

1. **A beautiful, streamlined user experience** (Pillar A)
2. **Visuals and interactive experiences that are delightful, not merely good** — benchmarked against the heavy-hitters (Pillar B)
3. **Architecture that is scalable and easily maintained** (Pillar C)

## How to use this document

- **Exhibit acceptance review**: every exhibit is scored against Pillars A and B before its status advances (`readable` → `interactive` → `flagship`). Flagship requires no criterion below 3 and the red lines clear.
- **Platform review** (each phase boundary, or quarterly): Pillar C in full, plus A/B sampled across exhibits.
- **Scoring**: each criterion 0–4. 0 = absent/broken · 1 = present but weak · 2 = competent ("good") · 3 = matches the benchmark set · 4 = would be cited as an exemplar by the benchmark community. *The requirement is delight, so 2 is not a passing grade for Pillar B on flagship exhibits.*
- **Benchmark set** (Pillar B comparisons are against these, not against "other ed-tech"): [Distill.pub](https://distill.pub) (e.g., momentum, t-SNE articles), 3Blue1Brown, [R2D3](http://www.r2d3.us/), TensorFlow Playground, The Pudding, Bartosz Ciechanowski's essays, Seeing Theory, Brilliant's interactive problems, Nicky Case's explorables.

---

## The exhibit acceptance rubric — the mechanizable flagship gate

"Interactive" is not synonymous with "educational": a page can carry many controls and leave the learner with no stronger mental model. An exhibit needs *intentional choreography*. The rubric below should **live in the content schema and release process, not merely in an editorial guideline** — an exhibit does not earn `flagship` unless every answer is "yes." It is the operational distillation of Pillars A and B.

| Test | Acceptance question |
| --- | --- |
| Hook | Does the opening create a concrete question/prediction rather than merely introduce a term? |
| Manipulation | Can the learner cause the central mechanism to become visible? |
| Causality | Is it clear which change produced which outcome? |
| Representation | Are the visual, mathematical, and computational forms connected? |
| Code parity | Does code mode reproduce the *exact* current experiment (same state, both directions)? |
| Prediction | Must the learner commit to an expectation before a key reveal? |
| Failure | Can the learner trigger at least two important failure modes? |
| Diagnosis | Does the exhibit teach how to *distinguish* those failures (not just show them)? |
| Transfer | Is there a novel case that cannot be passed by copying wording? |
| Whiteboard | Can the learner reconstruct the idea concisely afterwards? |
| Graph | Are prerequisites and next concepts *explained* (why), not merely linked? |
| Trust | Are simplifications, sources, and epistemic status visible? Does copy qualify claims and separate demo-specific behavior from general theory? |
| Performance | Does the exhibit become interactive quickly on ordinary hardware? |
| Accessibility | Can essential meaning be reached without relying solely on colour, pointer precision, or animation? |

### Good vs. great — the dimension table

The rubric's "yes" bar means clearing the **great** column, not the **good** one:

| Dimension | A good exhibit | A great exhibit |
| --- | --- | --- |
| Narrative opening | Explains why the concept matters | Creates a concrete puzzle and asks for a prediction |
| Interaction | Sliders and visible outputs | Cause/effect legible; constrains attention; encourages hypothesis testing |
| Representation | A clear diagram | Coordinates data, geometry, math, model state, and output |
| Code | A runnable example | Mirrors the exact visual experiment in both directions |
| Math | Shows the relevant equation | Connects every term to something observable in the experiment |
| Failure modes | Mentions limitations | Lets the learner deliberately trigger, identify, and repair canonical failures |
| Assessment | Checks recall | Tests prediction, diagnosis, explanation, and transfer to an unfamiliar case |
| Navigation | Links to related pages | Explains why the next concept is related and what prerequisite gap it resolves |
| Trust | Provides correct content | Distinguishes established results, simplifications, heuristics, and open questions |
| Finish | Ends with a summary | Invites the learner to explain the idea in their own words on an unseen case |

---

## Pillar A — Beautiful, streamlined user experience

The lab must feel effortless to move through. Research base: Nielsen's usability heuristics; response-time thresholds established by Card/Miller and popularized by Nielsen (0.1s perceived-instant / 1s flow-preserving / 10s attention limit) and Google's RAIL model; Core Web Vitals thresholds; Knowles' andragogy (adult learners demand self-direction and respect); self-determination theory (autonomy as intrinsic-motivation fuel — the research warrant for "no forced linear journey"); WCAG 2.2.

### A1. Orientation — "I always know where I am and what this place is"
- A first-time visitor understands what ML Lab is, and reaches a first interactive payoff, within 60 seconds of landing — no signup wall, no tutorial gauntlet.
- From any exhibit: current location in the graph, what this concept connects to, and at least one obvious good next step are visible without scrolling hunting.
- The graph explorer passes the "you are here" test: filterable, legible at 30+ nodes, never the only way to navigate.
- *Measure*: cold-user walkthrough (think-aloud, n≥3 per release); time-to-first-interaction; task success rate for "find a concept you've heard of and start it."

### A2. Autonomy with guidance — the structural promise of the product
- Free exploration, journeys, and recommendations coexist without nagging; the linear path is one click away but never imposed (self-determination theory: autonomy support predicts engagement and persistence).
- Recommendations are explainable in one sentence ("because you finished X") — Nielsen's *visibility of system status* applied to the mastery model. No black-box "next."
- Learner can see and understand their own mastery state at a glance; the legible levels (`seen`/`practiced`/`mastered`) surface in graph and profile.
- *Measure*: heuristic evaluation against Nielsen's 10; learner can correctly explain why something was recommended.

### A3. Responsiveness — speed as a felt quality
- Direct manipulation responds <100ms (perceived-instant threshold); sustained animation at 60fps; navigation between surfaces <1s (flow threshold).
- Core Web Vitals on mid-range laptop, cold cache: LCP <2.5s, INP <200ms, CLS <0.1 on every surface.
- Heavy runtimes (Pyodide, TF.js) load with honest, specific progress treatment — never a frozen UI; the visual mode is never blocked by code-mode infrastructure.
- *Measure*: Lighthouse/CWV in CI per exhibit; manual jank audit of every slider and draggable under load.

### A4. Streamlined flow — friction inventory
- Zero ceremony between intent and action: no account, no cookie-wall theatrics, no interstitials. Settings persist (mode preference, audio autoplay).
- Every exhibit honors the established page grammar (hook → story → experiment …) so learners never re-learn the interface — consistency *is* streamlining (Nielsen: consistency & standards).
- Dead ends don't exist: every page bottom offers graph-aware onward movement.
- *Measure*: count of clicks/decisions from landing → manipulating an experiment (budget: ≤3); friction log kept during walkthroughs.

### A5. Beauty of the shell — restraint and coherence
- The unified light system is disciplined: reading, assessment, code, and experiments share one calm surface; visualization colors remain semantic, high-contrast, and never carry meaning alone.
- One type system, one spacing scale, one motion language across the entire lab; any screenshot is recognizably ML Lab.
- *Measure*: design review against the design-token spec; "screenshot lineup" test — shuffle screenshots with benchmark-set screenshots, the lab's should not be identifiable as the weakest.

### A6. Access and comfort
- WCAG 2.2 AA on all shell surfaces; experiments provide text alternatives conveying the *teaching point* of each visualization (not just "chart of data").
- Full keyboard operability of shell and assessments; `prefers-reduced-motion` respected everywhere, including cinematic sequences (which degrade to stepped stills, not nothing).
- Color semantics in the visual grammar remain distinguishable under common color-vision deficiencies; never color-only encoding.
- *Measure*: axe-core in CI; manual keyboard + screen-reader pass per exhibit template change; CVD simulation check on the visual-grammar palette.

---

## Pillar B — Delightful, high-quality visuals & interactive experiences

The bar is the benchmark set, and the requirement is *delight*: the moment of surprise-then-understanding that makes someone send the link to a friend. Research base: [Mayer's evidence-based multimedia learning principles](https://educationaltechnology.net/mayers-principles-of-multimedia-learning/); Sweller's cognitive load theory; Hohman et al., [*Communicating with Interactive Articles*](https://distill.pub/2020/communicating-with-interactive-articles/) (Distill 2020 — the closest thing to a design-research canon for exactly this medium); Bret Victor's *Explorable Explanations*; Tufte's graphical-integrity and data-ink principles; Tversky et al. (2002) on when animation fails (the apprehension principle); Heer & Robertson (2007) on animated transitions; guided-discovery meta-analyses (Alfieri et al. 2011; Kirschner, Sweller & Clark 2006 — unguided exploration reliably underperforms); the testing effect (Roediger & Karpicke 2006); predict-observe-explain (White & Gunstone); feedback research (Hattie & Timperley 2007); emotional design in multimedia (Um, Plass et al. 2012 — visual appeal is not decoration, it measurably aids learning when aligned); the persona effect for pedagogical agents (Lester et al. 1997).

### B1. The experiment teaches — interactivity with a spine
- Every interactive answers Victor's question: *what does manipulating this let me understand that reading could not?* If the honest answer is "nothing," it's decoration — cut it.
- Exploration is **guided, not abandoned**: scenarios, prompts, and the failure gallery scaffold discovery (the meta-analytic finding: guided discovery beats both lecture *and* free play). Free manipulation remains available after the guided moments.
- At least one **predict-then-verify** beat per experiment ("what will increasing k do? … now run it") — the highest-leverage move the medium offers.
- Parameters exposed are the *pedagogically load-bearing* ones; everything else is curated away (coherence principle / extraneous-load reduction).
- *Measure*: per-exhibit articulation of the manipulation→insight chain in the brief, verified in lab review; observed "aha" in ≥2 of 3 cold walkthroughs.

### B2. Visual excellence — graphical integrity plus atmosphere
- Data visualizations meet Tufte's bar: no chartjunk, no misleading scales/truncations, maximal data-ink; annotations carry the explanation *into* the graphic (signaling + spatial-contiguity principles).
- The lab-wide **visual grammar** holds: same hue always means prediction, same for ground truth, error, parameters — across every exhibit. Learners decode once, transfer forever.
- Generated art (characters, scene/metaphor imagery) is art-directed to one coherent style; emotional design research justifies its presence, but only when aligned with the teaching moment (Um/Plass: appeal helps; decoration that distracts hurts — coherence principle cuts both ways).
- Hero visualizations are *composed* — deliberate focal hierarchy, not default-library output. The screenshot of any flagship experiment should be poster-worthy.
- *Measure*: visual-grammar conformance check; Tufte-style integrity audit; side-by-side comparison with the closest benchmark-set treatment of the same concept (e.g., our regression vs. Distill's; our trees vs. R2D3's) — written verdict required.

### B3. Motion that explains
- Animation is used where it carries meaning — showing *how* a state becomes another state (Heer & Robertson: animated transitions aid object constancy and comprehension) — and avoided where research says it fails: complex simultaneous changes the eye can't apprehend (Tversky's apprehension principle). Prefer learner-paced stepping for complex processes (segmenting principle).
- Every training loop is steppable: play, pause, single-step, scrub. The learner controls time.
- Microinteractions (hover states, drag affordances, snap feedback) are crisp and consistent — they signal that manipulation is possible (Hohman et al.: perceived interactivity drives engagement).
- *Measure*: motion audit per exhibit — each animation classified as *explanatory / transitional / decorative*, with decorative requiring justification; steppability checklist.

### B4. Multi-modal orchestration — Mayer compliance
- Narration accompanies visuals as *spoken* words (modality principle) with synced transcript; on-screen text does not duplicate narration (redundancy principle); corresponding narration and visual events are simultaneous (temporal contiguity).
- Story sections are segmented into learner-paced units; key terms are pre-taught before the dense passage that needs them (segmenting + pre-training principles).
- Conversational, second-person style — the personalization principle is one of Mayer's strongest effects and matches the adult-learner tone.
- Character (force-personification) appearances follow the persona-effect evidence: present at motivational/framing moments, absent during high-load reasoning moments.
- *Measure*: Mayer checklist (12 principles) scored per exhibit at flagship review; audio-sync QA.

### B5. Assessment that deepens rather than interrupts
- Concept checks exploit the testing effect: retrieval practice, not recognition theater; distractors encode real misconceptions, and every response gets explanatory feedback (Hattie & Timperley: feedback on *process* beats verdicts).
- `experiment-task` items ("make this model overfit") keep assessment inside the simulation — assessment as continued play, not exam cosplay.
- Difficulty is calibrated to *desirable* (Bjork): a learner who engaged with the experiment should find items challenging but tractable.
- *Measure*: item review against misconception literature per concept; feedback completeness check; walkthrough learners report checks felt "like part of it," not a quiz.

### B6. Delight — the criterion behind the criteria
- Each flagship has at least one engineered **peak moment** — the reveal, the punchline visualization, the moment the loss surface snaps into view — and ends on a strong note (peak-end rule: experiences are remembered by their peaks and endings).
- The "send it to a friend" test: would a practitioner share this exhibit *because of how it's made*? The benchmark set earns links this way; so must we.
- Wit and warmth in copy and character moments — measured, adult, never wacky.
- *Measure*: honestly subjective, deliberately so — in lab review, name the peak moment; if the reviewer can't, the exhibit isn't flagship. Track organic sharing once live.

---

## Pillar C — Scalable, easily maintained architecture

The architecture's job: exhibit #30 costs a fraction of exhibit #3, and a year of growth doesn't rot the codebase. Research base: modularity/coupling as the core maintainability predictor (Parnas' information hiding through modern empirical work); DORA findings (deploy frequency, change failure rate, and recovery correlate with sustainable delivery); "performance budgets enforced in CI" as the only durable performance strategy; schema-first content systems.

### C1. Marginal cost of content — the headline metric
- **Track hours-to-`interactive` per exhibit over time.** The curve must trend down through Phase 1; if exhibit #12 costs what #4 did, the kit is failing and that's a platform bug, not a content problem.
- New exhibit scaffold → renderable stub in <10 minutes (`lab new-exhibit`); ≥70% of a typical new exhibit's visualization needs met by the existing kit (composition, not bespoke code), measured per exhibit.
- *Measure*: per-exhibit build journal (hours by stage); kit-reuse ratio (kit components vs. bespoke components per exhibit).

### C2. Separation of concerns — content, model, view, wiring
- The four-layer contract holds everywhere: MDX content / TS model implementations / visualization kit / declarative `ExperimentSpec` wiring. A writer can edit narrative without touching code; an engineer can swap a view without touching the model; the spec is data.
- No exhibit reaches into another exhibit's internals; cross-cutting changes (design tokens, visual grammar, player) happen in exactly one place.
- *Measure*: dependency-cruiser rules in CI (content may not import components' internals; exhibits may not import each other); periodic "change one thing" drills — e.g., change the prediction hue lab-wide: must be a one-token diff.

### C3. Schema-first integrity — the build is the reviewer
- Every content artifact is zod-validated; the knowledge graph is verified at build time (DAG prerequisites, no dangling edges, journey-prerequisite coherence, asset manifests complete, audio-staleness hashes). **A broken graph cannot ship.**
- Schema changes are versioned with migrations for learner state (`schemaVersion` discipline) — local-first makes silent breakage invisible, so the discipline must be mechanical, not heroic.
- *Measure*: validation coverage (every schema in CI); zero classes of content error discoverable only at runtime.

### C4. Test confidence where it counts
- Model layer: unit tests against scikit-learn-generated fixtures (the TS implementations and Python code-mode templates verified against the *same* fixtures — the honesty contract between modes).
- Visual: Playwright screenshot tests for each exhibit's key states; interaction smoke tests for every draggable/slider.
- The test for the tests: a contributor can refactor the kit and know within one CI run whether any exhibit broke.
- *Measure*: model-layer coverage (target: 100% of algorithms fixture-tested); screenshot coverage per exhibit ≥ key states enumerated in its spec; CI wall time <10min (slow CI is unenforced CI).

### C5. Performance as an enforced budget, not an aspiration
- CI-enforced budgets per route: JS shipped to first paint, LCP/INP/CLS thresholds (A3's numbers), per-exhibit bundle ceilings. Lazy boundaries (Pyodide, TF.js, R3F) verified by bundle analysis — a regression that eagerly loads Pyodide fails the build.
- Simulations pause off-viewport; idle CPU near zero (verified, because "the fan spins on the tab" is how labs get closed).
- *Measure*: Lighthouse CI + bundle-size assertions on every PR; quarterly profile on reference mid-range hardware.

### C6. Dependency and complexity discipline
- Heavy dependencies require a written justification in the decision log; the default answer to "add a library" is the kit. Pinned versions, scheduled update cadence, no dead dependencies.
- Conventions are written (`docs/`, style guides, ADRs) and the codebase agrees with them — documentation drift is treated as a bug. A competent new contributor ships a `readable` exhibit in their first week using docs alone.
- *Measure*: dependency count trend; knip/depcheck in CI; "first-week test" whenever a collaborator joins; decision-log completeness (every notable choice has an entry).

### C7. Operational simplicity
- Phase 1 has no servers to babysit: static output, zero runtime infrastructure, deploys are atomic and instantly revertible (DORA: recovery time is the resilience metric that matters).
- Content release cadence ≈ deploy cadence: shipping one new exhibit is one PR, one green CI, one deploy — no coordination ceremony.
- *Measure*: deploy frequency; time-to-revert (target: minutes); zero standing infra cost in Phase 1.

---

## Red lines (automatic failure, any pillar)

1. A manipulation that responds sluggishly (>100ms) in a shipped experiment.
2. A visualization that is *misleading* — wrong scales, cherry-picked seeds presented as typical, animations implying false dynamics. Pedagogical trust is the asset; integrity outranks beauty.
3. Interactivity without insight — a widget that manipulates nothing the learner needs to understand.
4. Content that condescends to the adult learner.
5. A graph inconsistency (cycle, dangling edge) reaching production.
6. Shipped `flagship` status with any section silently incomplete — the completeness model only works if it never lies.

## Success metrics — measure transfer, not consumption

The north-star metric is **not** completion rate or time-on-page; those reward shallow consumption and can rise while understanding falls. The primary learning metric is **whiteboard transfer**: after an exhibit, present a short *unseen* case and score whether the learner can

1. state the problem the method solves,
2. sketch or describe the mechanism,
3. predict behaviour after a parameter or data change,
4. diagnose one failure, and
5. explain a connection to another concept.

That yields a compact **transfer score** per exhibit (operationalised by the `transfer` assessment item). Supporting learner metrics: improvement from the initial prediction to the transfer challenge; failure-diagnosis accuracy; share reaching the first meaningful interaction; visual↔code transitions; completion of a coherent *cluster* (not a page); useful onward graph navigation and delayed returns.

**Platform-economics metrics** (the C1 curve, tracked over the scale-out): authoring hours per exhibit and % built from shared primitives; count of unique bespoke components; visual-code parity defects and accessibility defects; performance-budget compliance and editorial review time; % of graph nodes meeting each completeness tier. Together these test whether the product is creating durable understanding *and* whether the platform is genuinely compounding.

## Cadence summary

| Review | When | Scope |
| --- | --- | --- |
| Exhibit acceptance | Each status advance | Pillars A (sampled), B (full), red lines |
| Benchmark comparison | Each flagship | B2/B6 written verdict vs. nearest benchmark-set treatment |
| Cold walkthroughs | Each release | A1, A4, B1, B5 with ≥3 fresh users |
| Platform review | Phase boundary / quarterly | Pillar C full; A/B sampled; metric trends (C1 curve, CWV, bundle sizes) |

### Key sources

- Mayer, *Multimedia Learning* (3rd ed., 2021) and the [evidence-based principles](https://educationaltechnology.net/mayers-principles-of-multimedia-learning/); Sweller et al., cognitive load theory.
- Hohman, Conlen, Heer & Chau, [*Communicating with Interactive Articles*](https://distill.pub/2020/communicating-with-interactive-articles/), Distill (2020).
- Victor, *Explorable Explanations* (2011); the [explorable explanations](https://en.wikipedia.org/wiki/Explorable_explanation) movement.
- Alfieri et al. (2011), meta-analysis of discovery learning; Kirschner, Sweller & Clark (2006) on minimal guidance.
- Roediger & Karpicke (2006), the testing effect; Bjork, desirable difficulties; Hattie & Timperley (2007), *The Power of Feedback*; White & Gunstone, predict-observe-explain.
- Tufte, *The Visual Display of Quantitative Information*; Tversky, Morrison & Bétrancourt (2002), *Animation: Can It Facilitate?*; Heer & Robertson (2007), animated transitions.
- Um, Plass et al. (2012), emotional design in multimedia learning; Lester et al. (1997), the persona effect.
- Nielsen, usability heuristics and response-time limits; Google RAIL model and Core Web Vitals; Knowles, andragogy; Deci & Ryan, self-determination theory.
- Parnas (1972), information hiding; DORA *State of DevOps* research program.
