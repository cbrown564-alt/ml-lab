# Audio bake-off — frozen corpus & scoring sheet

**Status:** Frozen · **Created:** 2026-06-27 · Supports [audio-narration-bakeoff-plan.md](../audio-narration-bakeoff-plan.md) §6 (Milestone #2)

Every finalist reads **exactly** this text — same words, same punctuation, same
order — so the listening test compares voices, not scripts. The text is lifted
verbatim from the current exhibit prose (the source of narration truth, C3). Each
section is pinned by `sha256(sectionText)` under the lab's word-splitting contract
(`splitWords`: whitespace-delimited, punctuation stays attached). If the prose
changes, the hash changes and this corpus must be re-frozen.

> Note: these hashes reflect the **current** prose. The two committed pilot
> manifests are stale (copy-audit drift, plan §11) — e.g. the gradient-descent
> hook manifest pins `3fd0a088…`, but the live hook below is `78b2751d…`. The
> bake-off generates from the live prose, not the stale manifests.

---

## Section A — Evocative hook (narrative warmth, pacing, restraint)

- **Source:** `content/exhibits/gradient-descent/narrative.ts` → `hook`
- **Pins:** `sha256 = 78b2751d8de52fb971cbe94976b6a6b2771f87b8d1deda6ba1e57e38a0226ad8` · 109 words · 586 chars
- **Stresses:** em-dashes as breath, long sentences without sing-song, the turn from image to claim. The §6.1 hook.

> Imagine a hillside in fog so thick you can see nothing — no valley, no horizon, only the ground beneath your boots. You want the lowest point in the whole landscape, and the one thing you can always sense is the tilt of the ground where you stand. So you step in the steepest downhill direction, feel again, and repeat.
>
> That is basic batch gradient descent. No map, no overview, no cleverness — only slope, step, repeat, thousands of times over. On the right, a flat line that knows nothing is about to learn exactly this way. Press play and watch its loss fall by whole powers of ten.

---

## Section B — Dense mechanism (sustained clarity, technical pronunciation)

- **Source:** `content/exhibits/linear-regression/narrative.ts` → `story[squared-error]`
- **Pins:** `sha256 = f958ce764c52918c0636f0b30c6d05d5c209286853bed793a9466140b6fd2914` · 106 words · 594 chars
- **Stresses:** "mean squared error", "squared", and the symbol gauntlet **`10² = 100 × 1²`** — superscript, `=`, `×`, numerals read aloud. This is also the timing-spike's hardest token cluster (does an aligner give `10²`, `×`, `1².` their own times?). Curly apostrophe in `error's`.

> Switch the errors from lines to squares. Each residual becomes a literal square whose area is the penalty the line pays there, and the fit is the line that makes the total area smallest — the mean squared error in the readout.
>
> Squaring does two jobs. It ignores direction: overshooting by three is exactly as bad as undershooting by three. And it punishes large misses out of all proportion — one residual of ten contributes the same squared penalty as one hundred residuals of one: 10² = 100 × 1². That second habit is squared error’s whole personality, and the next beat shows its dark side.

---

## Section C — Transition / payoff (shorter, conversational)

- **Source:** `content/exhibits/linear-regression/narrative.ts` → `story[closed-form]`, paragraph 2 (excerpt — deliberately short per §6.3)
- **Pins:** `sha256 = 22e6f1229dc47be5896a990640a258b71b70072b7cf1de78f4983b66a0410939` · 46 words · 240 chars
- **Stresses:** conversational warmth, the hand-off to the next exhibit, restraint on a short beat.

> Most models you meet after this one come with no such formula. Their best parameters must be hunted for, downhill, one step at a time. That hunt is its own exhibit — and this line, the one you can solve outright, is exactly where it begins.

---

## Pronunciation probe (not warmth-scored — pass/fail per token)

§6's stress list spans the whole catalog; A–C only exercise a subset (MSE/"mean
squared error", squared, residual, `10² = 100 × 1²`, gradient descent, learning
rate, divergence). To exercise the rest before they appear in narrated prose,
each finalist also reads this single probe line. Score only: does each term come
out right, and (for the timing spike) does each token get a usable time?

> The model reports R² and MSE; we tune λ and the learning rate η, fit w·x + b by OLS, pass it through a sigmoid to get ŷ, and validate with k-fold cross-validation on a clean train/test split.

Covers: **R²**, **MSE**, **λ**, **η**, **w·x + b**, **OLS**, **sigmoid**, **ŷ**, **k-fold**, **train/test split**.

---

## Scoring sheet (rubric frozen from plan §6, 1–5 each)

Record one row per candidate, blind where possible. `Timing` is objective (from
the §5 spike); the rest are listening scores. Capture freeform notes per row.

| Candidate (provider · voice · settings) | Intelligibility | Register | Expressiveness | Pacing/breath | Pronunciation (hard fails) | Consistency | Timing fidelity | Cost/ops | Notes |
|---|---|---|---|---|---|---|---|---|---|
| _baseline_ — ElevenLabs · Roger (voices[0]) · default | | | | | | | | | the floor to beat |
| | | | | | | | | | |

**Anchor:** every candidate gets a short A/B against the baseline row so scores
mean "much better than today," not just "good in isolation."
