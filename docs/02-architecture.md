# Technical Architecture

> Status: direction aligned 2026-06-11 — see [00-decisions.md](00-decisions.md) for the decision log.

## Stack overview

| Layer | Choice | Rationale |
| --- | --- | --- |
| Framework | **Next.js (App Router) + TypeScript** | Static-first rendering for content, React ecosystem for interactives, first-class Vercel deployment |
| Styling | **Tailwind CSS + design tokens, unified light design system** | Calm light surface across navigation, reading, assessment, code, and experiments; semantic visualization tokens are tuned for light backgrounds |
| Content | **MDX + typed TS/JSON data files** | Prose with embedded interactive components; graph/metadata as typed data |
| 2D visualization | **SVG (D3 scales/shapes) + Canvas** | SVG for annotated, axis-heavy diagrams; Canvas for many-particle/dense renders |
| 3D / GPU visualization | **Three.js / react-three-fiber** (where warranted) | Loss landscapes, embedding spaces, high-dimensional projections |
| In-browser ML | **Hand-rolled micro-implementations first; TensorFlow.js / ONNX Runtime Web for neural exhibits** | See "Experiment engine" below |
| Code mode runtime | **Pyodide (Python in WASM)** | Decided — see code runtime section |
| State | **Zustand** (per-exhibit experiment state) + React context (app shell) | Light, ergonomic, fine-grained updates for 60fps interactions |
| Persistence | **Local-first (IndexedDB)**; accounts/DB deferred to Phase 2 | Decided — ship Phase 1 without auth complexity |
| Audio | Pre-generated ElevenLabs assets + word-timing JSON, custom player | Proven in mathland prototype |
| Hosting | **Vercel** | Static + Fluid Compute when server needs emerge |

## System shape

ML Lab is, at its core, a **static content site with embedded simulations**. There is no server-side model training, no API in Phase 1. This is a deliberate constraint: it keeps the lab fast, free to operate, and infinitely cacheable.

```
┌────────────────────────────────────────────────────────────┐
│  App shell (calm): nav, graph explorer, journeys, search    │
├────────────────────────────────────────────────────────────┤
│  Exhibit pages (cinematic)                                  │
│  ┌──────────────┐ ┌──────────────────────────────────────┐ │
│  │ Narrative     │ │  Experiment engine                    │ │
│  │ (MDX + audio  │ │  ┌────────────┐  ┌────────────────┐  │ │
│  │  + visuals)   │ │  │ Visual mode │↔│ Code mode       │  │ │
│  │               │ │  │ (direct     │  │ (editor + WASM │  │ │
│  │               │ │  │ manipulation)│ │  runtime)       │  │ │
│  │               │ │  └─────┬──────┘  └───────┬────────┘  │ │
│  │               │ │        └── shared model ──┘           │ │
│  └──────────────┘ └──────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│  Knowledge graph (typed data) · Mastery model · Recommender │
├────────────────────────────────────────────────────────────┤
│  Local persistence (IndexedDB) · [later: accounts + sync]   │
└────────────────────────────────────────────────────────────┘
```

## The experiment engine

The heart of every exhibit. Three layers:

1. **Model layer** — a pure-TypeScript implementation of the algorithm (e.g., `fitOLS(points)`, `kmeans.step()`, `tree.split()`). Hand-rolled micro-implementations, not library calls, because:
   - they expose internals (every gradient step, every split decision) for visualization;
   - they are tiny, auditable, and step-able;
   - the *same* code can be shown in code mode — the visualization literally runs the code the learner reads.
   Neural-network exhibits that need real GPU compute (CNN feature maps, small transformer) use TensorFlow.js or ONNX Runtime Web behind the same step-able interface.
2. **View layer** — visualization components subscribed to model state. SVG for annotated geometry, Canvas for density, R3F for 3D. Each exhibit composes from a shared kit: `<ScatterCanvas>`, `<LossSurface>`, `<DecisionBoundary>`, `<NetworkDiagram>`, `<TrainingCurve>`, etc. The kit is the compounding asset: exhibit #30 should be mostly composition.
3. **Control layer** — the visual-mode controls (sliders, draggable points, play/pause/step of training) and the code-mode bridge.

### Visual mode ↔ code mode

Both modes drive the **same model instance**:

- **Visual mode**: direct manipulation mutates model parameters/data; the model re-runs; views update.
- **Code mode**: an editor (CodeMirror 6) holding a runnable script. Running it executes against the same dataset and renders into the same views. Parameter changes made visually are reflected as values in a designated config block of the code, and vice versa, where feasible.
- The contract per exhibit: a typed `ExperimentSpec` defining dataset(s), parameters, model API, and which views it renders to. This keeps each exhibit's wiring declarative.

### Code runtime — decided: Python via Pyodide

Code mode runs **Python in the browser via Pyodide** (numpy available), chosen for pedagogical authenticity: learners practice the ML lingua franca and skills transfer directly to real work.

Implementation consequences:
- Pyodide (~10–15MB WASM) lazy-loads on first entry into code mode, cached aggressively (service worker), with an honest loading treatment. Visual mode never pays this cost.
- The model layer remains TypeScript — the visual simulation runs native at 60fps. Code mode executes the learner's Python against the same datasets and parameters via a typed bridge (`ExperimentSpec` defines the shared contract), and renders results into the same views.
- Code templates are idiomatic teaching Python mirroring the TS model's logic; keeping the two implementations honest with shared numeric fixtures is part of exhibit QA.
- Pyodide runs in a Web Worker so long-running learner code never blocks the UI.

## Content architecture

- **Exhibits** are MDX documents plus an `exhibit.meta.ts` (graph node data, completeness flags, assets manifest) and an `experiment.ts` (the ExperimentSpec). Convention:

  ```
  content/
    exhibits/
      linear-regression/
        index.mdx          # narrative with embedded components
        meta.ts            # node id, domain, edges, completeness, assets
        experiment.ts      # ExperimentSpec
        assets/            # images, audio, timing JSON
    graph/
      nodes.ts             # generated index of all meta.ts
      edges.ts             # cross-cutting edges not owned by one exhibit
    journeys/
      foundations.ts       # curated ordered walks
  ```

- The knowledge graph is **statically validated at build time**: dangling edges, prerequisite cycles, and orphan nodes fail the build.
- All learner-facing copy lives in content files, not components — the content pipeline (Claude drafting, human editing) operates on MDX/markdown.

## App surfaces

| Surface | Description |
| --- | --- |
| **Lab home** | Entry point; featured exhibits, journeys, "continue where you left off" |
| **Graph explorer** | The knowledge graph as a navigable map — pan/zoom, filter by domain/phase, mastery overlay. A primary navigation surface, not a gimmick: this is how "no forced linear journey" becomes tangible |
| **Exhibit page** | The concept experience (see vision doc) |
| **Journey view** | A curated path rendered as a route through the graph, with progress |
| **Assessment surface** | Concept checks inline in exhibits; mastery summary on profile |
| **Profile/progress** | Local mastery state, visited exhibits, recommendations |

## Performance strategy

- Static generation for all narrative content; experiments hydrate as client islands.
- Per-exhibit code-splitting; heavy runtimes (Pyodide, TF.js, R3F) lazy-load on first interaction with an honest loading treatment.
- Animation loops via rAF with model stepping decoupled from render rate; heavy sims in Web Workers (Comlink) so direct manipulation never jank.
- Budgets: exhibit page interactive <3s on mid-range laptop; manipulation response <100ms; idle CPU near-zero (pause sims off-viewport).

## Testing & quality

- Model layer: unit-tested against reference implementations (scikit-learn-generated fixtures).
- Graph integrity: build-time validation as above.
- Visual: Playwright screenshot tests for exhibit key states.
- Content: schema validation (zod) on all meta/spec files.

## Deferred until needed

- Accounts, sync, server persistence (Phase 1 is local-first; learner schema is versioned so sync can arrive in Phase 2 without migration pain. An export/import-progress affordance hedges against browser-storage loss in the meantime).
- Server-side compute (could later power bigger-model demos via API).
- LLM-powered features in-product (e.g., a tutor that explains your experiment state) — exciting, deliberately out of scope for Phase 1 to keep the experience deterministic and free.
