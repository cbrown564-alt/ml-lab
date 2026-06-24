# Roadmap

Four content phases over a platform that is built once and compounds. Phases are about *content territory*; platform capabilities land when first needed and serve everything after.

## Phase 0 — Platform foundation (pre-content)

The minimum machinery such that exhibit #1 is buildable and exhibit #20 is cheap:

- App shell, design system, exhibit page template (cinematic) + lab surfaces (calm).
- Knowledge graph data model + build-time validation + graph explorer v1.
- Experiment engine: model-layer pattern, ExperimentSpec, visual↔code mode bridge, code runtime decision implemented.
- Visualization kit v1: scatter/canvas plot, decision boundary, training curve, parameter controls, dataset painter (click/drag to place data points — used by half of Phase 1).
- Audio player with synced transcript; mastery model + local persistence; concept-check components.
- Content tooling: scaffolder, validators, drafting-context assembler.

Exit criterion: **two flagship exhibits live** (proposed: *linear regression* and *gradient descent* — adjacent in the graph, shared visual vocabulary, both visually rich) proving every pillar end-to-end.

## Phase 1 — The popular core (~25–30 nodes)

The algorithms and tasks people actually come to learn. Every node here is high-traffic territory.

**Tasks & framing**: what is ML; supervised vs unsupervised; classification; regression; the dataset; train/test & generalization; bias–variance; overfitting & regularization; evaluation metrics (accuracy/precision/recall/ROC); loss functions.

**Algorithms**: linear regression; logistic regression; gradient descent; k-nearest neighbors; decision trees; random forests; gradient boosting; k-means; PCA; naive Bayes; SVM (+ kernel trick); neural network fundamentals (perceptron → MLP → backprop).

**Deep learning on-ramps**: CNNs (vision); embeddings; attention; the transformer; "how LLMs work"; fine-tuning vs prompting vs RAG (conceptual).

> **"How LLMs Work" is a graph journey, not one giant exhibit.** Impressive transformer/LLM visualizers already exist (Poloclub's Transformer Explainer, Google's MLCC LLM module), so a single beautiful animation is not, by itself, distinctive. ML Lab's edge is decomposition into a *connected sequence* — tokens & tokenization → vectors & embeddings → sequence prediction & attention as content-dependent routing → query/key/value & multi-head → residual pathways, normalisation & the transformer block → next-token training & the probability distribution → temperature/top-k/top-p decoding → context windows, retrieval limits, fine-tuning & preference optimisation → LLM failure modes (hallucination, prompt sensitivity, data limits, distribution shift). The desired outcome is not "I watched a transformer animate" but "I can explain how token prediction, attention, and decoding fit together — and identify which part of the pipeline explains a given behaviour." This is the *culmination* of the deep-learning cluster, reached by walking the graph.

**Journeys at launch**: *Foundations* (zero-to-trees), *Into Deep Learning*, *Understanding LLMs* (the likely front door for many visitors).

Sequencing within Phase 1: **build clusters, not isolated exhibits** (regression cluster → trees cluster → unsupervised cluster → deep-learning cluster) so the explorer always shows a connected, navigable territory rather than scattered islands. A cluster lets a shared vocabulary, dataset, and kit compound, and lets *experiment state travel between exhibits* — a learner who creates an outlier in linear regression should later meet that saved case when learning robust loss or model evaluation.

The strong initial regression cluster connects: linear regression; residuals & loss; gradient descent; feature scaling; polynomial features; regularisation; train/validation/test splits; bias–variance; data leakage; model evaluation. (Linear regression and gradient descent are already live and flagship.)

**Content tiers make completeness honest.** Not every node is a flagship exhibit; the data model (docs/03) carries a tier — *flagship* / *full* / *field-note* / *reference* / *frontier* — so the map can show a node that is deliberately small without it reading as unfinished. A graph with *visible completeness* beats a graph padded with apparently-equivalent pages. Each cluster ships at flagship for its hero nodes, with supporting nodes at the honest tier their teaching role needs.

## Phase 2 — Niche & nascent (~25–40 nodes)

Expanding both sideways (established-but-specialist) and forward (the frontier).

**Specialist territory**: time series; recommender systems; anomaly detection; clustering beyond k-means (DBSCAN, hierarchical, GMM); dimensionality reduction beyond PCA (t-SNE, UMAP); Bayesian methods; gaussian processes; survival analysis; causal inference & ML.

**Reinforcement learning**: bandits; Q-learning; policy gradients; RLHF (bridging to LLM territory).

**Generative & frontier**: VAEs; GANs; diffusion models; state-space models; mixture-of-experts; interpretability (features, circuits, probes); scaling laws; alignment concepts; multimodal models. Frontier exhibits carry explicit epistemic-status framing and a `version`-dated "as of" treatment, since this territory moves.

**ML practice**: feature engineering; data leakage; class imbalance; hyperparameter search; model debugging; deployment & drift (conceptual).

## Phase 3 — The mathematics underneath

Math nodes already exist as stubs from day one (Phase 1 math drawers link to them); Phase 3 promotes them to full exhibits. This is where the mathland prototype's territory gets rebuilt at ML Lab quality, with every math exhibit anchored to the ML exhibits that *need* it ("you've seen eigenvectors steer PCA — here's what they really are").

- **Linear algebra**: vectors, matrices as transformations, eigendecomposition, SVD, projections, norms.
- **Calculus**: derivatives as sensitivity, the gradient, chain rule (→ backprop edge), optimization landscapes, constrained optimization.
- **Probability**: distributions, conditioning & Bayes, expectation/variance, sampling, entropy & information.
- **Statistics**: estimation, hypothesis testing, confidence, regression-as-statistics, the bootstrap.

## Phase 4 — Connected disciplines

The practitioner's surrounding world: software engineering for ML (testing, abstraction, versioning), data engineering (pipelines, quality), experiment design & A/B testing, ML ethics & societal impact, hardware & systems (why GPUs; memory vs compute). Scope deliberately loose this far out; revisit after Phase 2.

## Platform capabilities by phase

| Capability | Lands |
| --- | --- |
| Core engine, graph, mastery, audio, both modes | Phase 0 |
| Failure galleries, experiment-task assessments | Phase 1 |
| 3D/GPU visualizations (loss landscapes, embeddings) | Phase 1 (deep-learning cluster) |
| In-browser neural training (TF.js/ONNX) | Phase 1 (deep-learning cluster) |
| Accounts & sync (if validated as needed) | Phase 2 |
| Spaced review / gap-repair surfacing | Phase 2–3 |
| In-product AI tutor (explains your experiment state) | Phase 3+, optional |

## Risks & mitigations

- **Scope gravity** — every exhibit wants to be flagship. Mitigation: completeness model; ship `interactive`, batch-polish to `flagship`.
- **Kit underinvestment** — rushing exhibit #1 by hardcoding makes exhibit #10 expensive. Mitigation: Phase 0 exit criterion is *two* exhibits, forcing the first reuse pass.
- **Art consistency drift** — generated characters/scenes diverging in style. Mitigation: art bible + reference sheets before any character ships broadly.
- **Solo cadence** — pipeline assumes one person directing everything. Mitigation: honest per-section completeness; graph ships connected clusters so partial coverage still feels whole.

## Near-term sequence

1. ~~Align on open direction questions~~ — done 2026-06-11, see [00-decisions.md](00-decisions.md).
2. ~~Phase 0 build~~ — done 2026-06-12 (18 iterations, see [loop/STATUS.md](loop/STATUS.md)).
3. ~~First two exhibits → review against the vision doc's bar → recalibrate cadence estimates~~ — Phase 0 exit passed 2026-06-12; flagship acceptance passed 2026-06-21 after math drawers landed: [reviews/phase0-exit-review.md](reviews/phase0-exit-review.md), [reviews/flagship-acceptance-review.md](reviews/flagship-acceptance-review.md).
4. Phase 1 cluster-by-cluster (regression cluster first).
