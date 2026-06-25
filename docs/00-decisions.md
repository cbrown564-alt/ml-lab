# Decision Log

Lightweight ADR-style log. One entry per direction-setting decision; newest first.

---

## 006 — Editorial voice: copy audit style system (2026-06-25)

**Decision**: Adopt a single product voice documented in `docs/style/voice.md`. Learner-facing copy uses **ML Lab / exhibit / stage / journey** vocabulary; avoids museum/atlas/cabinet metaphors in UI. Four stages use action-oriented purpose lines (build the picture, try the model, find its limits, apply the idea). Claims must be vivid about interaction and conservative about theory — qualify absolutes, separate demonstration-specific behavior from general rules, and use validation vs test correctly.

**Why**: A June 2026 copy audit found strong interaction copy undermined by theatrical framing, repeated templates, and accuracy problems from overclaiming. The product identity was fragmented across competing metaphors.

**Trade-off accepted**: Internal component names (`JewelGallery`, `SpecimenPlacard`) may retain collection-era naming until refactored; learner-facing strings follow the new guide.

---

## 005 - Visual direction: unified light design system (2026-06-12)

**Decision**: Narrative, assessment, code, and experiments all use the same calm light surface. Visualization tokens remain semantic, but are tuned for contrast on light backgrounds instead of switching to a dark lab canvas.

**Why**: Exhibit pages interleave explanation and manipulation. A dark experiment island inside a light narrative page made the reading flow feel broken rather than cinematic.

**Trade-off accepted**: Data visualizations lose some dark-canvas glow, but gain continuity, readability, and simpler theme maintenance.

**Supersedes**: 004.

---

## 004 — Visual direction: dual-mode design system (2026-06-11)

**Decision**: Calm, light, editorial shell for navigation, prose, and assessment; dark immersive canvas inside experiments and cinematic sequences. Design tokens are mode-aware from day one.

**Why**: Gets the readability of an editorial surface for long-form narrative *and* the visual pop of data on dark for experiments. The light↔dark transition becomes a deliberate design moment ("stepping into the lab").

**Trade-off accepted**: Two surfaces to perfect; more design-system work in Phase 0.

## 003 — Persistence: local-first, no accounts in Phase 1 (2026-06-11)

**Decision**: Learner state (mastery, history, journey progress) in IndexedDB. No auth, no backend. Schema-versioned for future sync; export/import-progress affordance as a loss hedge. Accounts revisited in Phase 2.

**Why**: Zero auth/backend complexity and running cost; fastest path to shipping Phase 1.

**Trade-off accepted**: Progress is per-browser and can be lost; no cross-device continuity yet.

## 002 — Characters: light-touch personification of forces (2026-06-11)

**Decision**: Personify recurring *forces* of ML — the Optimizer, Noise, the Regularizer, the Curse of Dimensionality — rather than one guide per domain. Scientific-illustration register for adults. Sparing appearances at key narrative moments. One main narrator voice; optional distinct voices for character lines.

**Why**: Memorable narrative identity without saturating every page or feeling childish; a small cast keeps AI-generated art consistency tractable; the same force recurring across exhibits (Noise in regression, Noise in diffusion) is itself a teaching device.

**Trade-off accepted**: Weaker per-domain branding than a full cast; fewer character assets to lean on per exhibit.

## 001 — Code mode runtime: Python via Pyodide (2026-06-11)

**Decision**: Code mode runs Python (Pyodide, numpy) in a Web Worker, lazy-loaded on first use. The model layer powering visual mode remains TypeScript; `ExperimentSpec` defines the shared contract between the learner's Python and the visualizations.

**Why**: Pedagogical authenticity — learners practice the ML lingua franca and transfer skills directly.

**Trade-off accepted**: ~10–15MB lazy WASM download and a Python↔JS bridge layer; TS model and Python templates must be kept honest with shared numeric fixtures in QA.
