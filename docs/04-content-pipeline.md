# Content Pipeline

How exhibits get made. The pipeline is AI-assisted at every stage but human-directed: AI generates volume and options; a human (initially: the founder) makes taste decisions. The mathland prototype proved the assembly line works; ML Lab raises the quality bar at each station.

## Stages per exhibit

```
1. Spec        →  2. Narrative   →  3. Experiment  →  4. Art        →  5. Audio      →  6. Assembly & QA
   (human)         (Claude+human)    (code, human      (Midjourney      (ElevenLabs)     (human)
                                      +Claude)          +art direction)
```

### 1. Spec (human, ~brief)

A one-page exhibit brief: the single *aha* this exhibit delivers, the core metaphor, what the experiment lets you manipulate, the 2–3 failure modes worth exploring, target graph edges. This is the taste-critical step — everything downstream amplifies it.

### 2. Narrative (Claude + human edit)

- Claude drafts the hook, story, math drawer, field notes against the brief, the house style guide, and the *actual experiment spec* (so prose references real controls: "drag the red point" only if there is one).
- Written for adults; the style guide bans condescension, mandates concrete-before-abstract, sets reading level and length budgets per section.
- Human edit pass is mandatory. The draft is raw material.
- Output: `index.mdx` with placeholder slots for visuals and the experiment.

### 3. Experiment (engineering)

- Model implementation (step-able, unit-tested against scikit-learn fixtures), `ExperimentSpec`, view composition from the shared visualization kit, code-mode template, scenarios.
- The most expensive stage. The visualization kit (see architecture doc) is the lever: early exhibits build the kit, later exhibits compose it. Expect exhibit #1 to take 10× exhibit #20.

### 4. Art (image generation + art direction)

- **Characters**: each domain (or recurring force — e.g., "the optimizer", "noise") may be personified by a guide character. Generated with Midjourney/equivalent under a strict style bible: consistent rendering style, palette, adult-oriented (scientific-illustration register, not cartoon). Character refs stored centrally; every exhibit using a character pulls from the same approved sheet. **[OPEN — character treatment is a key direction question]**
- **Scene/diagram art**: hero images, narrative interstitials, metaphor illustrations. Generated, then curated hard — reject rate will be high; that's the process.
- Hand-built SVG diagrams remain the right tool for anything precise (geometry, architectures); generated art is for atmosphere, metaphor, and character.
- All assets named per manifest convention and recorded in `ExhibitMeta.assets`.

### 5. Audio (ElevenLabs)

- Narration script derived from the story section (edited for the ear — shorter sentences, signposting).
- One consistent narrator voice for the lab; optional character voices for character lines (distinct, also consistent).
- Word-level timing JSON generated alongside (forced alignment) to power the synced transcript player — the mathland mechanic, kept.
- Regeneration policy: audio regenerates whenever its source section's `version` bumps; stale audio is flagged by a build check comparing content hash to the hash recorded at generation time.

### 6. Assembly & QA

- Wire everything into the exhibit package; set `SectionStatus` honestly.
- QA checklist: narrative reads aloud cleanly; every experiment scenario reachable and teaching what it claims; concept-check feedback correct; performance budgets met; screenshots captured for visual regression.
- A "lab review" pass: walk the exhibit as a learner, cold. The 20-minute whiteboard test (vision doc) is the acceptance criterion.

## House style guide (to be written as `docs/style/`)

Three artifacts keep the pipeline consistent as it scales:
- **`voice.md`** — prose voice, tone, banned moves, reading-level targets, how math is introduced.
- **`art-bible.md`** — character sheets, palette, rendering style, prompt scaffolds that reproduce the style, dos/don'ts gallery.
- **`visual-grammar.md`** — the visualization kit's semantic conventions: what color means (e.g., predictions always one hue, ground truth another, error a third — *everywhere in the lab*), animation easing standards, annotation styles. Cross-exhibit consistency in visual grammar is itself a teaching device: learners stop re-decoding and start transferring.

## Tooling

- `lab new-exhibit <id>` scaffolds the package with schema-valid stubs.
- `lab validate` runs graph integrity + schema + asset-manifest + audio-staleness checks (also in CI).
- `lab brief <id>` assembles the full context bundle (brief, style guides, experiment spec) for a Claude drafting session — repeatable prompting, not ad-hoc chats.
- Content lives in-repo; the repo is the CMS. Revisit if/when non-technical contributors join.

## Cost & cadence expectations

- Marginal cost per exhibit is dominated by engineering (stage 3) and human editing/curation (stages 2, 4, 6); generation API costs are minor.
- Realistic Phase 1 cadence after the kit stabilizes: ~1 exhibit/week solo at `interactive` status; `flagship` polish in batches.
- The completeness model exists precisely so cadence pressure degrades *scope* (fewer sections complete) rather than *quality* (bad sections shipped).
