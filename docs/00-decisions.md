# Decision Log

Lightweight ADR-style log. One entry per direction-setting decision; newest first.

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
