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

type EdgeType =
  | 'prerequisite'   // from is needed before to        (drives recommendations)
  | 'generalizes'    // to is a general case of from    (logistic → softmax)
  | 'specializes'    // inverse, where authored that way
  | 'contrasts'      // illuminating comparison         (k-means vs GMM)
  | 'applies'        // math/practice node used by ML node
  | 'composes'       // building block                  (attention → transformer)
  | 'sequel';        // natural next step that isn't a prerequisite relationship
```

Rules enforced at build time:
- `prerequisite` edges must form a DAG (no cycles).
- Every non-phase-1 node must be reachable from some phase-1 node.
- Edge endpoints must exist; `note` required on `contrasts` edges (the comparison *is* the content).

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

## 3. Assessment

```ts
type ConceptCheck = {
  nodeId: string;
  items: AssessmentItem[];
};

type AssessmentItem = {
  id: string;
  kind: 'choice' | 'multi' | 'ordering' | 'parameter-prediction' | 'experiment-task';
  prompt: string;                // markdown
  // kind-specific payloads:
  options?: Option[];            // choice/multi, each with learner-facing feedback
  expected?: unknown;            // ordering / parameter-prediction answers
  task?: ExperimentTaskDef;      // experiment-task: a goal state in the live experiment
  difficulty: 1 | 2 | 3;
  targets: string[];            // sub-skills, e.g. "lr:interpret-coefficients"
};
```

Two assessment kinds are distinctive and worth the build cost:
- **`parameter-prediction`**: "before you press run — what will increasing k do to the boundary?" Answer, then run the experiment and confront reality. Predict-then-verify is among the best-evidenced learning moves available.
- **`experiment-task`**: "configure the experiment to achieve X" (e.g., "make this model overfit"). Graded against the live model state — assessment *inside* the simulation.

Every item carries feedback per response, not just correct/incorrect.

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
