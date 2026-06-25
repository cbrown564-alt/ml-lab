# PRODUCT.md

## Product

ML Lab is an interactive machine-learning lab for adult learners. It is not a course, reference, notebook platform, or gamified learning app. Each concept is an **exhibit**: a self-contained experience with a narrative hook, manipulable experiment, code mode, concept checks, field notes, and graph-aware next steps.

## Positioning

**Category**: *the intuition layer for machine learning* — hands-on exhibits where you **see the idea, change the inputs, push the model until it fails, then explain what happened**.

**Positioning statement**: *For engineers and career-switchers who need durable ML intuition without another forty-hour course, ML Lab turns core machine-learning ideas into interactive exhibits you can run, break, and apply. Unlike video courses, notebooks, and one-off visualizers, each exhibit shares one visual↔code state, teaches failure diagnosis, tests transfer on unseen cases, and connects into a navigable graph from linear regression to LLMs.*

**Messaging hierarchy**:

| Layer | Message |
| --- | --- |
| Primary promise | **Build intuition by running the model.** |
| Product description | Interactive exhibits that unite visual intuition, runnable code, failure modes, and concept checks. |
| Proof mechanism | **See it. Run it. Break it. Explain it.** — four stages every exhibit works through. |

**Avoid generic category language** that drops ML Lab into a crowded comparison set: "the best way to learn ML," "a free machine-learning course," "interactive ML visualizations," "a collection of explainers," "learn AI from scratch." Also avoid competing product metaphors in learner-facing copy (museum, atlas, cabinet, jewel) — the visual design may evoke a collection; the interface should not ask learners to decode that metaphor first. The moat is the *cumulative system* (exhibit grammar + experiment kit + typed concept graph + failure taxonomy + editorial trust), not any single visualization — so every exhibit must visibly participate in that system.

## Register

product

Design serves the learning task. The interface should feel calm, precise, and trustworthy enough for repeated study sessions, while the exhibit interactions carry the delight.

## Product Purpose

Help learners build practitioner-grade intuition for machine learning concepts. A successful exhibit leaves someone able to explain the idea in their own words — what it does, when it helps, one way it can fail, and how it connects to neighboring ideas.

## Audience

- Career changers entering data science or machine learning.
- Software engineers leveling up into ML.
- Analysts, students, and curious professionals supplementing formal study.
- Intelligent, time-poor adults who want respect, clarity, and agency.

Assume the learner is capable. Do not condescend. Avoid classroom theater, forced pacing, and empty motivational language.

## Product Promise

Every concept can be approached as a living object:

- Read the story.
- Manipulate the experiment.
- Run the code.
- Break the model on purpose.
- Check understanding.
- Move through the knowledge graph with context.

## Core Principles

### Intuition before formalism

Lead with physical, visual, or data-driven intuition. Bring in the math after the learner already feels why it matters. The math drawer can become deeper over time, but the first experience must be graspable through interaction.

### Manipulate to understand

Every flagship exhibit needs at least one moment where changing something teaches what prose alone could not. Dragging a point should refit the line. Turning a learning-rate knob should change the walk. A control that does not reveal a load-bearing idea should not ship.

### Productive failure

Failure scenarios are not edge cases. They are where intuition lives: outliers bending squared error, learning rates exploding loss, models overfitting, leakage flattering a metric. Learners should be invited to break things safely and understand the consequence.

### One idea per exhibit

If an exhibit needs two large ideas, split it into two exhibits and connect them with graph edges. The knowledge graph is the structure; individual pages should stay focused.

### Multiple representations

The same idea should appear as narrative, geometry, data, code, and assessment feedback where useful. Representations should converge, not compete.

### Autonomy with guidance

Learners can wander freely through the graph or follow curated journeys. Guidance is available, never imposed. Recommendations must be explainable in plain language.

## Product Surfaces

- Home: orientation, live exhibits, collection by wing, guided journey entry, and the four-stage method made visible at the front door.
- Exhibit page: a graph-aware concept page organised around the **four-stage spine** — **See it** (build a visual intuition — the guided story), **Run it** (change the inputs and inspect the model — experiment + maths), **Break it** (trigger a failure and diagnose the cause — live failure loop + field guide), **Explain it** (apply the idea to a new case — concept checks and transfer) — framed by the masthead (orientation) and the journey coda (forward motion). The spine *is* the navigation: the promise made structural.
- Experiment visual mode: direct manipulation, scenarios, state readouts, steppable time where relevant.
- Experiment code mode: Python via Pyodide, mirroring the same model and dataset where feasible.
- Graph explorer: a map of open doors and future territory.
- Assessment: inline concept checks that deepen learning rather than interrupt it.
- Mastery: local-first progress, with legible levels such as seen, practiced, assessed, and mastered.

## Content Strategy

ML Lab ships in graph-coherent clusters. Phase 0 proves the platform with linear regression and gradient descent. Phase 1 covers the popular ML core: datasets, supervised learning, regression, classification, trees, unsupervised learning, neural network fundamentals, and the LLM on-ramp. Later phases expand into specialist territory, frontier topics, mathematics, and connected disciplines.

Every exhibit should make its status honest. Partial pages can ship if the live experiment is real and the page says what is still under construction.

## Voice And Tone

See **[docs/style/voice.md](docs/style/voice.md)** for the canonical style guide (vocabulary, stage copy, assessment labels, accuracy discipline, and editorial checklist).

In brief: sophisticated, warm, and concrete — *The Economist* meets *3Blue1Brown*. **Be vivid about the interaction and conservative about the claim.** Use second person when it helps the learner act. Prefer short, vivid sentences over academic scaffolding. Field notes should sound like a practitioner pointing out why the concept matters in the wild.

US English in all learner-facing copy. Qualify generalizations; label demonstration-specific numbers. Use **validation** for model-selection data and **test** only for the final untouched estimate.

## Anti-Goals

- No videos of slides.
- No week-based course pacing.
- No certificates in the initial product.
- No signup wall in Phase 1.
- No general-purpose notebook or IDE.
- No streaks, points, leaderboards, or gamification unless they clearly serve learning.
- No decorative interactives that do not teach.
- No condescending copy.

## Quality Bar

The benchmark set is Distill, 3Blue1Brown, R2D3, TensorFlow Playground, Seeing Theory, Brilliant, The Pudding, Bartosz Ciechanowski, and Nicky Case style explorable explanations.

A flagship exhibit should have:

- A narrative hook grounded in a real problem.
- A live experiment with a clear manipulation-to-insight chain.
- Visual and code modes that agree.
- A failure gallery or guided break-it scenario.
- Concept checks with misconception-aware feedback.
- Field notes and graph-aware onward movement.
- Accessible text alternatives that describe the teaching point, not just the graphic.
- Responsive manipulation under 100 ms.

## Product Red Lines

- A shipped manipulation that feels sluggish.
- A visualization with misleading scales or false dynamics.
- Interactivity without insight.
- Adult learners being talked down to.
- A broken graph reaching production.
- A page pretending to be complete when core sections are missing.

## Strategic Constraints

Phase 1 is local-first and static-first. No auth, no backend, no server-side training. This keeps the product fast, cheap to operate, and easy to deploy. Heavy runtimes such as Pyodide load only when needed. Model code remains small, step-able, and auditable.

The product compounds through the kit: graph schemas, exhibit frame, experiment specs, visualization primitives, learner store, and test fixtures. Exhibit 30 should be cheaper to build than exhibit 3.
