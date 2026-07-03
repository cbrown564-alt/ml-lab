# Deep learning workstream — cluster build plan

**Status:** Active · **Created:** 2026-07-03 · **Owner:** orchestrator

## 1. Why now

Phase 1 clusters 1–3 are **flagship** (Foundations, trees, unsupervised). The roadmap's
next territory is the **deep-learning on-ramps** — the bridge from classical ML to modern
vision and language models. `neural-network-fundamentals` already ships as the Foundations
capstone (XOR trainer, capacity/overfitting, register 3). The remaining nodes are **graph
stubs** with typed edges and two curated journeys; exhibits are not yet live.

This is the largest Phase 1 lift: it pulls in deferred platform capabilities (3D/GPU
surfaces, in-browser neural training per `docs/02-architecture.md` and `docs/05-roadmap.md`).

## 2. Cluster scope

| Node | Tier target | Role in cluster |
| --- | --- | --- |
| `neural-network-fundamentals` | **flagship** (done) | Capstone — stacked units, nonlinearity, backprop |
| `cnns` | flagship | Opens cluster — locality, hierarchy, vision |
| `embeddings` | flagship | Learned geometry; bridge to language |
| `attention` | flagship | Content-dependent routing; Q/K/V |
| `the-transformer` | flagship | The repeating block; next-token prediction |
| `fine-tuning-vs-prompting-vs-rag` | full | Conceptual capstone — three adaptation strategies |

**"How LLMs work" is a journey, not one exhibit.** The `understanding-llms` journey
sequences the nodes above. Roadmap sub-beats (tokenization, decoding temperature/top-k,
failure modes) land as **story sections and Break-it scenarios** inside the transformer and
capstone exhibits — not as separate graph nodes at launch.

## 3. Journeys

- **Into Deep Learning** (`into-deep-learning`): neural nets → CNNs → embeddings →
  attention → transformer. The spatial-to-sequential on-ramp.
- **Understanding LLMs** (`understanding-llms`): embeddings → attention → transformer →
  fine-tuning vs prompting vs RAG. Optional neural-nets prerequisite. Likely front door
  for many visitors (docs/05).

## 4. Platform capabilities to land (cluster-wide)

These are **shared kit investments** — build once, compose across exhibits:

1. **In-browser neural training** — TensorFlow.js or ONNX Runtime Web behind the existing
   step-able `ExperimentSpec` interface (`docs/02-architecture.md`). Needed for CNN
   feature maps and a small trainable transformer block.
2. **3D / dense embedding views** — Three.js / react-three-fiber for embedding scatter
   (optional PCA overlay) and loss landscapes where 2D canvas is insufficient.
3. **Sequence / attention viz kit** — heatmaps for attention weights, token-aligned
   strips, multi-head small multiples (Distill / Transformer Explainer register).
4. **Fixture generators** — `scripts/generate_deep_learning_fixtures.py` (committed JSON,
   sklearn/TF reference where applicable) mirroring the unsupervised/trees pattern.

## 5. Build sequence (per exhibit)

Follow the standard pipeline (`docs/loop/PHASE1-SCALE-PLAN.md`):

1. `npm run new:exhibit -- <id>` → scaffold four-act spine stubs.
2. `npm run brief -- <id>` → drafting context (human feedback dir if re-touching).
3. Model layer + fixtures → ExperimentSpec → viz kit composition → narrative/spine →
   math view → failure gallery → concept check (incl. transfer) → wire + registry →
   audio (best-effort) → e2e + screenshots → green gate → commit.
4. Advance node `stub` → `interactive` when the route is live.

**Suggested exhibit order** (dependencies + kit compounding):

1. **cnns** — first TF.js integration; filter/receptive-field kit pieces.
2. **embeddings** — 2D/3D scatter kit; word2vec-style or synthetic token geometry.
3. **attention** — heatmap kit; single-head then multi-head.
4. **the-transformer** — stack attention + FFN blocks; next-token training loop.
5. **fine-tuning-vs-prompting-vs-rag** — lighter conceptual exhibit; fewer GPU demands.

## 6. Cluster review gate

After every node is `interactive`:

1. Spawn the **non-circular panel** (designer-critic / teacher / tester) against named
   exemplar frames — `docs/exemplars/tensorflow-playground/` for training surfaces,
   Distill/Transformer Explainer captures for attention.
2. Fix highest-leverage items → re-capture → re-review until register ≥3 on hero nodes.
3. Advance cluster to **flagship** → log in `docs/loop/PHASE1-STATUS.md` → human review
   on `/review` per `docs/08-quality-loop-and-review-system.md`.

## 7. Exemplar targets

| Exhibit | Primary exemplar frame | What we steal |
| --- | --- | --- |
| cnns | `tensorflow-playground/00-viewport.png` | Dense control surface, thickness-encoded edges |
| embeddings | `distill-momentum/00` + PCA exhibit | Geometry as protagonist; composed small multiples |
| attention | Transformer Explainer (external) | Token-aligned heatmap, head toggle |
| the-transformer | Distill + 3B1B block animation | Residual pathways visible; math beside consequence |
| fine-tuning-vs-prompting-vs-rag | — | Conceptual clarity over animation; three-way comparison table |

## 8. Non-goals (this workstream)

- Full tokenization / BPE exhibit as a standalone node (fold into transformer story).
- Production-scale LLM inference or API calls in the browser.
- Character/art-bible force personification (deferred level-4 work).
- Audio catalog regen (separate audio bake-off workstream).

## 9. Success criteria

- All five new nodes live at `interactive`, cluster batch-reviewed to **flagship**.
- Both journeys show a connected trail on the homepage (every stop a live door).
- Graph explorer shows a navigable deep-learning territory — no scattered stubs without edges.
- `npm run validate` + `check:rubric --strict` + full test suite green throughout.

## 10. Current state (kickoff commit)

- **Graph:** 25 nodes, 5 new stubs (`cnns`, `embeddings`, `attention`, `the-transformer`,
  `fine-tuning-vs-prompting-vs-rag`) with typed edges from `neural-network-fundamentals`,
  `pca`, and `classification-task`.
- **Journeys:** `into-deep-learning` (5 stops) and `understanding-llms` (5 stops, one
  optional) registered in `content/journeys/foundations.ts`.
- **Exhibits:** `cnns`, `embeddings`, and `attention` live at **interactive** (four-act spines,
  hand-rolled models, `ConvField` + `EmbeddingMap` + `AttentionHeatmap` viz kit). Remaining two
  nodes still stub. Into Deep Learning journey now shows four live stops.
- **Next action:** scaffold + build **the-transformer** (stacked block + next-token loop).
