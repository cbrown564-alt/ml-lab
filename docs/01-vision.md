# Vision & Design Principles

## What this is

ML Lab is a machine-learning lab you visit, not a course you take. Each concept — linear regression, gradient descent, attention, diffusion — is an *exhibit*: a self-contained, beautifully crafted experience combining narrative, visuals, audio, and a live experiment you can manipulate. The lab as a whole is organized as a knowledge graph, so concepts connect, build on each other, and can be traversed freely or via curated journeys.

The north star: a learner should leave each exhibit able to **explain the idea in their own words** — what it does, when it helps, one way it can fail — not just recite a definition.

## Positioning & promise

The market (see [the 2026-06 market-strategy report](ML_Lab_Market_Landscape_and_Product_Strategy.pdf)) is crowded at the *component* level — interactive explainers, playgrounds, courses, graphs all exist — but open at the *system* level: nothing makes those elements reinforce one another across all of ML. That is the gap ML Lab occupies.

- **Category**: *the intuition layer for machine learning* — hands-on exhibits where every important concept can be **seen, run, broken, and explained**. (Not "interactive ML education," which is already a crowded comparison set.)
- **Primary promise**: **Build intuition by running the model.** See the idea, change the inputs, push the model until it fails, then explain what happened.
- **Proof mechanism** — four stages every flagship exhibit delivers:
  - **See it** — build a visual intuition (the guided story).
  - **Run it** — change the inputs and inspect the model (experiment + maths over the *same* state).
  - **Break it** — trigger a failure and diagnose the cause (deliberately break, diagnose, repair).
  - **Explain it** — apply the idea to a new case (transfer on an unseen scenario).
- **Job to be done**: *when I hit an ML concept I only half-understand, repair the gap fast enough that I can explain it, implement it, and recognise when it fails.*
- **The moat is the cumulative system, not any single visualization.** Good standalone visualizations are copyable; the defensible asset is the *integration* — one exhibit grammar, one shared visual↔code state, a typed concept graph, a cross-cutting failure taxonomy, and editorial trust. Distill is both our quality benchmark and our warning: *a collection of individually handcrafted masterpieces does not automatically become a scalable product.* So **every exhibit must visibly participate in the larger system** — shared grammar, typed graph edges, reusable failure primitives — never a beautiful island.

### The north-star *metric*: transfer, not completion

Success is **not** completion rate or time-on-page — those reward shallow consumption. After an exhibit, give the learner a short *unseen* case and score whether they can: state the problem the method solves; sketch the mechanism; predict behaviour after a parameter/data change; diagnose one failure; explain a connection to a neighbouring concept. Concept checks operationalise this; they are evidence of practice, not proof of mastery. See [docs/style/voice.md](style/voice.md) for how completion copy should invite explanation without overclaiming.

## Audience

Adult learners: career-changers entering data science/ML, software engineers leveling up, analysts, curious professionals, students supplementing formal coursework. They are intelligent, time-poor, and allergic to being talked down to. Tone is sophisticated and warm — *The Economist* meets *3Blue1Brown*, never childish. Full voice rules: [docs/style/voice.md](style/voice.md).

## Pedagogical principles

1. **Intuition before formalism.** Lead with the visual/physical metaphor; the math arrives once the learner already "feels" the idea. (Later phases make the math itself a first-class destination.)
2. **Manipulate to understand.** Passive media (text, audio, video) sets up the idea; the interactive experiment is where understanding actually forms. Every exhibit must have at least one moment of "I changed something and now I see why."
3. **Productive failure.** Experiments should let learners break things — overfit a model, pick a terrible learning rate, poison a dataset — and see the consequences. Failure modes are where intuition lives.
4. **One idea per exhibit.** A concept that needs two big ideas is two exhibits with a graph edge between them.
5. **Multiple representations.** The same idea shown as geometry, as code, as data flowing, as a story. Different learners latch onto different representations; converging representations cement understanding.
6. **Honest about the frontier.** Cutting-edge topics (e.g., interpretability, RLHF, state-space models) are presented with appropriate epistemic humility — "here's what we know, here's what's contested."

## Experience principles

1. **Big-screen native.** Designed for ≥1280px viewports; truly excellent at 1440–1920px. Use the width: side-by-side code/visual panes, wide cinematic visualizations, generous margins. Mobile gets a graceful "best experienced on a larger screen" treatment, not a cramped port.
2. **Exhibits stay calm and continuous, expressed as a unified light design system.** Navigation, the graph explorer, prose reading, assessment surfaces, code mode, and experiments all share the same warm editorial surface. Visualization colors remain semantic and high-contrast, but the page no longer switches themes mid-exhibit. (Updated 2026-06-12.)
3. **Visual + code modes everywhere.** Each experiment exposes the same underlying model two ways: direct manipulation (drag points, pull sliders, watch loss surfaces deform) and editable, runnable code. Changes in one mode reflect in the other where feasible — that mirroring *is* a teaching device.
4. **Light-touch personification.** Rather than a mascot per domain, ML Lab personifies the recurring *forces* of machine learning — the Optimizer, Noise, the Regularizer, the Curse of Dimensionality — as art-directed, AI-generated figures in a scientific-illustration register. They appear sparingly, at key narrative moments, across many exhibits: Noise is the same antagonist whether you meet it in regression or in diffusion models, and that recurrence is itself a teaching device. One consistent narrator voice (ElevenLabs) carries the lab; character lines may get distinct voices. (Decided 2026-06-11.)
5. **Audio as a parallel channel.** Narration with synchronized transcripts lets a learner watch the visualization while being talked through it — the 3Blue1Brown effect, but interactive.
6. **Performance is pedagogy.** Experiments must respond at interactive framerates. A laggy gradient-descent slider teaches nothing. Budget: <100ms response to any direct manipulation; training loops visibly animate at 60fps or honestly indicate compute.

## What "exceptional" means for one exhibit

A fully realized exhibit (the bar for Phase 1 flagship concepts) has:

- **Hook** — a narrative cold-open: a real problem this concept exists to solve.
- **Story** — crafted prose (Claude-assisted, human-edited) with inline visuals, building the intuition step by step.
- **Audio** — narrated version with word-synced transcript (ElevenLabs).
- **The Experiment** — the centerpiece interactive, with visual mode and code mode.
- **The Math (drawer)** — formal treatment available on demand, linked to math-foundation nodes in the graph.
- **Failure gallery** — guided "break it" scenarios.
- **Concept check** — assessment items feeding the mastery model.
- **Field notes** — where this is used in the real world; links to neighboring graph nodes.

Not every concept reaches this bar immediately; the data model tracks per-exhibit completeness so the lab can ship incrementally without feeling broken (see [03-data-model.md](03-data-model.md)).

## Anti-goals

- Not a MOOC: no videos-of-slides, no week-based pacing, no certificates (initially).
- Not a reference: depth over coverage; Wikipedia already exists.
- Not a notebook platform: code mode serves the concept; it is not a general IDE.
- Not gamified-for-its-own-sake: progress and mastery are visible, but no streaks/points/leaderboards unless they demonstrably serve learning.

## Prior art & inspiration

- **mathland-critter-learn** (our own prototype): character-driven modules, 8-section lesson format, audio with word-level sync. Validated the multi-modal ambition; implementation was primitive. ML Lab inherits the aspirations, not the architecture.
- **3Blue1Brown** — visual-first math intuition; **Distill.pub** — interactive ML articles as first-class science communication; **R2D3** — scrollytelling ML intro; **TensorFlow Playground** — manipulable neural net; **Seeing Theory** — visual probability; **The Pudding** — visual essays; **Brilliant** — interactive problem-led learning; **explorabl.es** — the broader explorable-explanations movement.

ML Lab's bet: combine Distill's rigor, 3B1B's visual storytelling, Playground's manipulability, and a knowledge graph spine — in one coherent, beautiful place.
