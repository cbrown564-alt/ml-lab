# Data Model

The data model has four pillars: the **knowledge graph** (what exists and how it connects), **exhibits** (the content of a node), **assessment** (how understanding is measured), and the **learner model** (mastery, history, recommendations). All schemas are zod-validated TypeScript; the graph is static data compiled at build time, the learner model is runtime state persisted locally (initially).

## 1. Knowledge graph

### Node

Every learnable unit is a `ConceptNode`. Exhibits are the rendered experience of a node.

```ts
type ConceptNode = {
  id: string;                    // kebab-case, stable forever: "gradient-descent"
  title: string;
  oneLiner: string;              // graph-explorer hover text
  domain: Domain;                // primary home
  tags: string[];                // cross-cutting: "optimization", "geometry", ...
  kind: 'algorithm' | 'concept' | 'task' | 'technique' | 'math' | 'practice';
  phase: 1 | 2 | 3 | 4;          // roadmap phase that introduces it
  depth: 'core' | 'advanced';    // within its domain
  status: ExhibitStatus;         // see completeness below
};

type Domain =
  | 'supervised' | 'unsupervised' | 'deep-learning' | 'nlp-and-llms'
  | 'vision' | 'reinforcement' | 'generative' | 'ml-practice'      // phases 1–2
  | 'linear-algebra' | 'calculus' | 'probability' | 'statistics'   // phase 3
  | 'software-engineering' | 'data-engineering';                   // phase 4
```

`kind` distinguishes *algorithms* (random forest), *concepts* (bias–variance), *tasks* (classification), *techniques* (regularization), *math* (eigendecomposition), and *practices* (train/test splits). This matters for layout, iconography, and recommendation logic.

### Edge

```ts
type ConceptEdge = {
  from: string;                  // node id
  to: string;
  type: EdgeType;
  strength: 'hard' | 'soft';     // hard prerequisite vs. helpful background
  note?: string;                 // learner-facing: why this connection matters
};
```

**Edge types are pedagogical, not structural.** An attractive constellation of nodes is easy to build and easy to ignore; the graph earns its keep only when each edge answers a practical learner question — what comes before this, what should come next, *why* the connection matters, which idea this gets confused with, which assumption caused a failure, which math clarifies the mechanism. So the type carries a learner-facing meaning, and the interface can say *"Learn regularisation next because the model you just built is unstable when features outnumber observations"* rather than the inert *"Related: Regularisation."*

| `EdgeType` | Learner-facing meaning |
| --- | --- |
| `requires` | A prerequisite mechanism or representation (drives recommendations + the DAG). |
| `generalises` | A broader formulation of the current concept. |
| `special_case_of` | A constrained instance of another concept. |
| `optimised_by` | The method used to fit or search it (e.g. linear-regression → gradient-descent). |
| `evaluated_by` | The metric or diagnostic used to judge it. |
| `fails_when` | A condition that violates an assumption (links to the failure taxonomy). |
| `often_confused_with` | A nearby idea that produces a common misconception. |
| `implemented_using` | A computational primitive or system component. |
| `mathematical_basis` | The mathematical idea that makes the mechanism legible. |
| `used_inside` | A larger architecture or workflow that contains the concept. |
| `alternative_to` | A competing method under a comparable task. |

Rules enforced at build time:
- `requires` edges must form a DAG (no cycles) — they drive recommendations and journey coherence.
- Every non-phase-1 node must be reachable from some phase-1 node.
- Edge endpoints must exist; `note` required on `often_confused_with` edges (naming the misconception *is* the content) and recommended on `fails_when`/`alternative_to`.

> *Migration note (2026-06-22):* the original structural vocabulary (`prerequisite`, `generalizes`, `specializes`, `contrasts`, `applies`, `composes`, `sequel`) was replaced by this pedagogical set. Mapping used: `prerequisite`→`requires`, `generalizes`→`generalises`, `specializes`→`special_case_of`, `contrasts`→`often_confused_with`, `composes`→`used_inside`, `applies`→`mathematical_basis`, `sequel`→`requires` (soft). The richer types (`optimised_by`, `evaluated_by`, `fails_when`, `implemented_using`, `alternative_to`) are authored as the scale-out adds nodes.

### Journeys (curated linear paths)

A journey is an ordered walk over the graph — the opt-in linear experience.

```ts
type Journey = {
  id: string;
  title: string;
  audience: string;              // "engineers new to ML", "stats-curious analysts"
  description: string;
  stops: JourneyStop[];
};

type JourneyStop = {
  nodeId: string;
  framing?: string;              // journey-specific intro: why this stop, here
  optional?: boolean;
};
```

Journeys never own content — they sequence and frame existing exhibits. A node can appear in many journeys. Build-time check: a journey may not visit a node before its hard prerequisites *unless* those prerequisites are earlier stops.

## 2. Exhibit

The content package behind a node.

```ts
type ExhibitMeta = {
  nodeId: string;
  character?: CharacterRef;      // guide for this exhibit (see content pipeline)
  sections: SectionStatus;       // per-section completeness
  experiment?: ExperimentRef;    // points at ExperimentSpec
  assets: AssetManifest;         // images, audio + word-timing files
  sources: Source[];             // citations / further reading
  version: number;               // bump on substantive content change
};

type SectionStatus = {
  hook: Completeness;            // 'missing' | 'draft' | 'complete'
  story: Completeness;
  audio: Completeness;
  experiment: Completeness;
  mathDrawer: Completeness;
  failureGallery: Completeness;
  conceptCheck: Completeness;
  fieldNotes: Completeness;
};
```

`ExhibitStatus` on the node is derived: `stub` (meta only) → `readable` (story complete) → `interactive` (+ experiment) → `flagship` (all sections complete). The UI renders honestly at every level — a `readable` exhibit is a polished essay, not a broken page. This is what lets the lab ship incrementally.

### Content tiers — visible completeness beats padding

`status` is the *completeness/quality* axis. Orthogonal to it is the **content tier**: the *kind* of node a learner should expect, so the map can be honest about a node that is deliberately small rather than unfinished. *A graph with visible completeness is better than a graph padded with apparently-equivalent pages.*

| Tier | Promise |
| --- | --- |
| **flagship** | Every pillar, full review, high production value (the bar of the first two exhibits). |
| **full** | A complete conceptual experience with fewer bespoke visuals. |
| **field-note** | A focused explanation or practitioner observation — small on purpose. |
| **reference** | A concise definition, graph placement, and onward links (a real node, not an exhibit). |
| **frontier** | Evolving material carrying explicit epistemic status and a dated "as of" review. |

The tier is the node's *intent*; `status` reports how far it has actually been built. The explorer shows both, so partial coverage reads as a navigable territory with honest edges, not a wall of stubs pretending to be exhibits.

### ExperimentSpec

```ts
type ExperimentSpec = {
  id: string;
  datasets: DatasetDef[];        // generated or bundled; seedable for reproducibility
  params: ParamDef[];            // name, type, range, default, visual control binding
  model: string;                 // module path to the step-able model implementation
  views: ViewBinding[];          // which visualization components, fed by what
  codeTemplate: string;          // code-mode starting script
  scenarios: Scenario[];         // presets, including failure-gallery setups
};
```

The spec is declarative wiring; the model implementation itself is code (see architecture doc). `scenarios` power both "try this" prompts in the narrative and the failure gallery.

### Visual↔code parity — one canonical experiment state

The strongest single feature wedge is making the visual and code modes two *lenses on one state*, not two content streams. The **parity contract**:

> Every meaningful state visible in the experiment must have an inspectable computational representation, and every meaningful code change must produce the corresponding visual state.

The two modes therefore share one canonical `ExperimentState`: dataset + transformations, model parameters, random seed, training step, prediction outputs, metrics, selected observations, and the active failure configuration. The visualization renders it; the code template transliterates it; **golden tests verify the two outputs stay numerically aligned** (linreg already pins "printed Python fit == plotted readout" in e2e — this generalises that into the contract). A generic scikit-learn snippet beside a bespoke chart would be weak; the compelling version is one experiment-state model seen two ways.

### Failure cards — the reusable "break it" primitive

Failure diagnosis is a recognisable, reusable product primitive (one of the clearest ways ML Lab is more useful to a working engineer than a conventional visual explainer). A failure gallery is **not** a list of caveats; each entry is a structured card bound to a shared taxonomy id (see [07-failure-taxonomy.md](07-failure-taxonomy.md)):

```ts
type FailureCard = {
  id: string;                    // exhibit-local id
  primitive: FailurePrimitive;   // taxonomy id: 'outliers', 'leakage', 'exploding-gradients', ...
  title: string;
  trigger: string;               // what the learner changes (sample size, scale, noise, seed, ...)
  symptom: string;               // the visible failure (unstable boundary, diverging loss, ...)
  diagnosis: string;             // prompt: what changed, and which assumption failed?
  repair: string;                // regularisation, rescaling, a better split, a different metric/model
  boundary: string;              // when the repair itself is the wrong move
  scenarioId?: string;           // optional: the ExperimentSpec scenario that stages it live
};
```

The `FailurePrimitive` ids are drawn from a Phase-1-wide taxonomy (outliers, feature scaling, collinearity, overfitting, data leakage, class imbalance, threshold choice, distribution shift, spurious features, bad initialisation, vanishing/exploding gradients, seed sensitivity, miscalibration, metric gaming, small samples) so the same failure is recognisable wherever it recurs — the recurrence is itself a teaching device.

## 3. Assessment

```ts
type ConceptCheck = {
  nodeId: string;
  items: AssessmentItem[];
};

type AssessmentItem =
  | ChoiceItem          // retrieval practice; distractors encode real misconceptions
  | PredictItem         // predict-then-verify: commit, then go check in the experiment
  | ExperimentTaskItem  // assessment inside the simulation, reported by a task event
  | TransferItem;       // a novel unseen case that can't be passed by copying wording

// every item carries: id, kind, difficulty (1–3), targets[] (sub-skills), and
// per-response feedback (not just correct/incorrect). See src/lib/assessment/schema.ts.
```

Four assessment kinds, each earning its build cost:
- **`choice`**: retrieval practice (the testing effect); every distractor encodes a real misconception and every option carries feedback that addresses it.
- **`predict`**: "before you press run — what will increasing k do to the boundary?" Commit, then go confront reality in the experiment. Predict-observe-explain is among the best-evidenced learning moves available.
- **`experiment-task`**: "configure the experiment to achieve X" (e.g. "make this model overfit"). Graded against live model state via the task-event bus — assessment *inside* the simulation.
- **`transfer`** *(the north-star item)*: a short **unseen** case — a new dataset shape, a new application, a what-would-break question — deliberately constructed so it *cannot* be answered by parroting the exhibit's wording. This is what operationalises the whiteboard-transfer metric per exhibit: prediction + diagnosis + explanation applied somewhere new.

## 4. Learner model

Runtime state, local-first (IndexedDB), schema-versioned for future account sync.

```ts
type LearnerState = {
  schemaVersion: number;
  mastery: Record<string, NodeMastery>;   // by node id
  history: VisitEvent[];                  // exhibit visits, experiment runs
  journeys: Record<string, JourneyProgress>;
  settings: { audioAutoplay: boolean; preferredMode: 'visual' | 'code'; ... };
};

type NodeMastery = {
  level: 'untouched' | 'seen' | 'practiced' | 'assessed' | 'mastered';
  score?: number;            // 0–1, from concept-check performance
  lastTouched: string;       // ISO date
  evidence: MasteryEvidence[]; // which items/tasks contributed
};
```

`level` is deliberately coarse and legible to the learner ("you've *seen* attention; you've *mastered* gradient descent"); `score` is internal fuel for recommendations. No spaced-repetition scheduling in Phase 1, but `lastTouched` + `evidence` keep the door open.

### Recommendations

Pure function over (graph, mastery): rank candidate nodes by
1. **frontier fit** — hard prerequisites mastered/practiced, node itself untouched;
2. **momentum** — graph proximity to recently visited nodes;
3. **journey pull** — next stop in an active journey;
4. **gap repair** — assessed-but-weak nodes resurface.

Deterministic, explainable ("recommended because you just finished X and it unlocks Y"), no ML required — the recommender should be the simplest thing in the building.

## Open questions

- Granularity calibration: is "linear regression" one node or three (model / loss / fitting)? Working rule: one *aha* per node; split when an exhibit needs two experiments.
- Whether `experiment-task` grading needs per-exhibit code or can be declarative goal-state predicates (aim: declarative).
- Account sync timing and backend (deferred; schema-versioning is the hedge).
