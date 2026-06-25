# ML Lab

**Hands-on interactive exhibits for building machine-learning intuition.**

ML Lab turns core machine-learning ideas into exhibits you can run, break, and apply. Each concept is a self-contained experience — narrative, visuals, audio, and a live experiment — connected in a knowledge graph from foundational algorithms to the cutting edge.

## Core ideas

- **Build intuition by running the model.** See the idea, change the inputs, push the model until it fails, then explain what happened.
- **Every concept stands alone.** Each algorithm, technique, or idea is a self-contained exhibit. No forced linear progression.
- **But everything connects.** Concepts live in a knowledge graph with typed relationships (prerequisites, generalizations, applications). Curated journeys exist as guided walks through the graph for learners who want structure.
- **Four stages per exhibit.** See it · Run it · Break it · Explain it — the product promise made structural on every page.
- **Built for big screens.** Designed primarily for laptops and desktops, using the full canvas to tell rich visual stories and host immersive experiments.
- **Two modes of exploration.** Every interactive experiment offers a **visual mode** (direct manipulation, sliders, drag-and-drop data points) and a **code mode** (edit and run real code in the browser).
- **Multi-modal by design.** Each concept aspires to text, visuals, audio narration, and interactive components — produced through an AI-assisted content pipeline (narrative via Claude, character art via image generation, voices via ElevenLabs).
- **Assessment-aware.** Concept checks feed a progress model that powers recommended next steps across the graph.

## Documentation

| Doc | Contents |
| --- | --- |
| [docs/00-decisions.md](docs/00-decisions.md) | Decision log for direction-setting choices |
| [docs/01-vision.md](docs/01-vision.md) | Vision, pedagogy, design principles, what "exceptional" means here |
| [docs/style/voice.md](docs/style/voice.md) | Canonical voice & copy style guide for learner-facing prose and UI |
| [docs/02-architecture.md](docs/02-architecture.md) | Technical architecture, stack, rendering and in-browser ML strategy |
| [docs/03-data-model.md](docs/03-data-model.md) | Knowledge graph schema, concept format, assessments, mastery model |
| [docs/04-content-pipeline.md](docs/04-content-pipeline.md) | AI-assisted production workflow for narrative, art, audio, interactives |
| [docs/05-roadmap.md](docs/05-roadmap.md) | Phased plan: popular ML → niche/nascent → mathematics → connected disciplines |
| [docs/06-evaluation-criteria.md](docs/06-evaluation-criteria.md) | The quality bar: research-grounded criteria for UX, visual/interactive craft, and architecture |

## Status

Phase 0 complete: Linear Regression and Gradient Descent are live flagship exhibits, with graph validation, narration, mastery, code mode, math drawers, budgets, and browser tests in place. Next: Phase 1 regression cluster — see [docs/05-roadmap.md](docs/05-roadmap.md).
