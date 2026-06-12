# ML Lab

**An immersive, visual machine learning laboratory for the web.**

ML Lab is a pedagogical web application that makes machine learning concepts feel intuitive through rich visual storytelling, hands-on interactive experiments, and carefully crafted narratives for adult learners. It spans the field from foundational algorithms to the cutting edge — and in later phases, down into the underlying mathematics and out into connected disciplines.

## Core ideas

- **Every concept stands alone.** Each algorithm, technique, or idea is a self-contained experience that works exceptionally well on its own — narratively, visually, interactively. No forced linear progression.
- **But everything connects.** Concepts live in a knowledge graph with typed relationships (prerequisites, generalizations, applications). Curated linear journeys exist as guided walks through the graph for learners who want structure.
- **Built for big screens.** Designed primarily for laptops and desktops, using the full canvas to tell rich visual stories and host immersive experiments.
- **Two modes of exploration.** Every interactive experiment offers a **visual mode** (direct manipulation, sliders, drag-and-drop data points) and a **code mode** (edit and run real code in the browser).
- **Multi-modal by design.** Each concept aspires to text, visuals, audio narration, and interactive components — produced through an AI-assisted content pipeline (narrative via Claude, character art via image generation, voices via ElevenLabs).
- **Assessment-aware.** Concept checks feed a mastery model that powers recommended next steps across the graph.

## Documentation

| Doc | Contents |
| --- | --- |
| [docs/00-decisions.md](docs/00-decisions.md) | Decision log for direction-setting choices |
| [docs/01-vision.md](docs/01-vision.md) | Vision, pedagogy, design principles, what "exceptional" means here |
| [docs/02-architecture.md](docs/02-architecture.md) | Technical architecture, stack, rendering and in-browser ML strategy |
| [docs/03-data-model.md](docs/03-data-model.md) | Knowledge graph schema, concept format, assessments, mastery model |
| [docs/04-content-pipeline.md](docs/04-content-pipeline.md) | AI-assisted production workflow for narrative, art, audio, interactives |
| [docs/05-roadmap.md](docs/05-roadmap.md) | Phased plan: popular ML → niche/nascent → mathematics → connected disciplines |
| [docs/06-evaluation-criteria.md](docs/06-evaluation-criteria.md) | The quality bar: research-grounded criteria for UX, visual/interactive craft, and architecture |

## Status

Direction aligned (updated 2026-06-12): Python-via-Pyodide code mode, light-touch force personification, local-first persistence, unified light design system. Next: Phase 0 platform build — see [docs/05-roadmap.md](docs/05-roadmap.md).
