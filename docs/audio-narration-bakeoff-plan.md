# Audio narration workstream — voice bake-off plan

**Status:** Draft · **Created:** 2026-06-27 · **Owner:** TBD

## 1. Why now

Narration is currently a **2-exhibit pilot** (linear-regression, gradient-descent) on an
**untuned ElevenLabs baseline** — model `eleven_multilingual_v2`, default voice settings.
We have never deliberately chosen the narrator: the script asks for "George"
(`AUDIO_VOICE ?? "George"`), which **isn't on the account**, so `resolveVoiceId` silently
falls back to `voices[0]` (currently "Roger"). So today's baseline is an *unintended*
stock voice at default settings — the floor, not a real attempt ([[audio-voice-deferred]]).

Before we invest in generating ~75–90 sections across all 15 exhibits — and before we
re-record the 2 pilot sections that have since drifted from their prose — we want to
**choose the narrator deliberately**. Informal tests suggest **Gemini's voice model is
more expressive and interesting** than our baseline, but the comparison isn't fair: we
tuned ElevenLabs not at all. This doc plans a structured **bake-off** to align on a
narrator that is *much* better than today's baseline, on a provider we can run at scale.

This is the audio workstream, not a re-record. Output is a **decision** (provider + voice +
style + settings + pipeline), then full-catalog generation as a follow-on.

## 2. What we have today (the baseline to beat)

- **Pipeline:** `scripts/generate-audio.ts` (`npm run audio`). Idempotent — regenerates only
  sections whose prose `textHash` drifted, or everything if `voiceId`/`modelId` changed.
- **Provider:** ElevenLabs `POST /v1/text-to-speech/{voiceId}/with-timestamps`
  (`mp3_44100_128`, `eleven_multilingual_v2`).
- **Timing:** the endpoint returns **character-level** alignment; `toWordTimings()` folds it
  to per-word `{w, s, e}` and asserts it matches `splitWords(prose)` word-for-word.
- **Artifacts (committed, static-hosted):** `public/audio/{nodeId}/{sectionId}.mp3` +
  `content/exhibits/{nodeId}/audio-manifest.json` (stores `voiceId`, `modelId`,
  `durationSeconds`, `textHash`, `words[]` per section).
- **Player:** `NarratedSection` renders a **word-synced transcript** (highlight follows the
  audio) — the transcript is also the a11y fallback.
- **Guard:** `content/exhibits/audio.test.ts` fails when prose and manifest drift. *(It is
  currently red on both pilot hooks — see §11.)*
- **Coverage:** 2 / 15 exhibits. The other 13 have prose narratives but no audio.

## 3. Goals & non-goals

**Goals**
- Pick **one** narrator (provider + voice + style + settings) that clears a clear quality bar
  vs. the current baseline, on the lab's actual prose.
- Confirm the pipeline can produce **word-level timing** for the chosen provider (or a
  defined fallback) — this gates everything else.
- Produce a small, reusable **provider abstraction** so a second provider is a config change,
  not a rewrite.
- Land a written **recommendation** with cost-at-scale and a go/no-go to generate all 15.

**Non-goals (for this workstream)**
- Generating the full 15-exhibit catalog (separate follow-on, gated on the decision).
- Multi-voice / per-act voices, SSML-heavy direction, or interactive/streamed narration.
- Music, sound design, or localization.

## 4. Hard constraints — the bar any candidate must clear

These are pass/fail. A beautiful voice that fails the first two is disqualified.

1. **Word-level timing.** The synced transcript needs per-word start/end times that match
   `splitWords(prose)` exactly. ElevenLabs gives character alignment natively. **Gemini's
   native TTS does not currently expose word/character timestamps** → we'd need a
   **forced-alignment** step (audio + known text → word times; e.g. WhisperX / aeneas /
   Montreal Forced Aligner). This is the single biggest unknown and is spiked first (§5).
2. **Build-time, committed artifacts.** Generation runs offline in `npm run audio`, outputs
   are committed mp3 + manifest. No runtime TTS, no per-request cost in prod.
3. **Deterministic enough for the staleness guard.** Re-running for the same prose+voice must
   be a no-op (idempotence keyed on `textHash` + provider/voice/model id).
4. **Editorial register.** Calm, authoritative, intelligible — the Distill / 3B1B / R2D3
   register ([[quality-bar-and-circular-review]]), not a hype/ad voice. Expressive but
   trustworthy.
5. **Technical pronunciation.** Must read the lab's vocabulary correctly without per-word
   hacks where avoidable (see the stress list in §6).
6. **Cost & rate limits** acceptable for ~75–90 sections **× several regen cycles** during
   iteration (prose changes, voice re-picks).

## 5. Spike first: word-timing feasibility (de-risk before the listening test)

Run this **before** any subjective voice judging — it can eliminate a provider on its own.

- **ElevenLabs:** confirmed (`with-timestamps`). Re-confirm on any newer model we test
  (`eleven_turbo_v2_5`, `eleven_v3` if available) — newer models sometimes change the
  alignment payload.
- **Gemini:** synthesize one representative section, then run a forced aligner against the
  known text. Measure: (a) does every `splitWords` token get a time? (b) alignment error on
  technical tokens and numerals; (c) added pipeline cost/latency; (d) determinism.
- **Exit criterion:** for each provider, "word timings that pass `audio.test.ts`'s
  word-for-word + monotonic checks" is **achievable and reproducible**, or the provider is
  out (regardless of voice quality).

Deliverable: a one-page spike note (`docs/audio-timing-spike.md`) with the verdict per
provider and the chosen alignment approach for any timestamp-less provider.

## 6. Bake-off design

### Candidate matrix
Provider × voice/style, all reading the **same** corpus:

- **ElevenLabs (tuned, not stock):** 2–3 voices (incl. at least one non-"George"); the best
  current model; sweep `stability` / `similarity_boost` / `style` settings. Give it the fair
  tuning it never got.
- **Gemini TTS:** 2–3 prompt-steered styles (Gemini's voices are directable via a style
  prompt, e.g. "calm documentary explainer, unhurried, warm"). Note: gated on the §5 spike.
- Keep it to **~4–6 finalist candidates** total, not a combinatorial explosion.

### Test corpus (same script for everyone)
Pick sections that stress the real failure modes — fixed, version it in
`docs/audio-bakeoff/corpus.md`:
1. **An evocative hook** — gradient-descent's "Imagine a hillside in fog…" (narrative warmth,
   pacing, restraint).
2. **A dense mechanism section** — e.g. linear-regression's MSE/loss explanation (sustained
   clarity, no sing-song, breath/comma handling).
3. **A transition / payoff** — shorter, conversational.

**Technical-pronunciation stress list** (must be correct or trivially fixable):
MSE ("M-S-E"), R² ("R-squared"), λ ("lambda"), η ("eta"), w·x + b, OLS, residual, sigmoid,
gradient descent, overfitting / regularization, "x-hat" / ŷ, k-fold, train/test split.

### Scoring rubric (1–5 each; record per candidate, blind where possible)
- **Intelligibility / clarity** — every word lands, esp. technical terms & numerals.
- **Editorial register** — calm, authoritative, trustworthy (the §4.4 bar).
- **Expressiveness** — alive and interesting *without* theatrics; appropriate to the beat.
- **Pacing & breath** — comma/clause handling, not rushed, not droning.
- **Pronunciation** — the stress list above; count hard failures.
- **Consistency** — section-to-section sameness of timbre/level (matters at 75+ sections).
- **Timing fidelity** — word alignment quality from §5 (objective).
- **Cost/operability** — $/1k chars, rate limits, regen friction.

### Process
1. Generate the corpus on every finalist (same text, exported mp3 + manifest).
2. **Blind listening pass:** 2–3 reviewers (incl. the product owner) score the rubric with
   labels hidden; capture freeform notes. A short A/B (baseline vs. each) anchors "much
   better than baseline."
3. Tally; shortlist top 2; do a tie-break on a 4th, longer section.
4. **Pick a winner + runner-up + settings.** Write `docs/audio-bakeoff/results.md` with the
   contact sheet of clips, scores, and the rationale.

## 7. Pipeline changes (small, scoped to support the decision)

- Introduce a **provider interface**: `synthesize(text) → { audioMp3, wordTimings }`, with
  `elevenlabs` and `gemini` implementations (Gemini = TTS call + forced-alignment from §5).
- Manifest already carries `voiceId` + `modelId`; **add `provider`** so a provider/voice
  switch invalidates and regenerates cleanly (and the idempotence key stays honest).
- Keep `toWordTimings`'s word-for-word invariant as the shared contract both providers must
  satisfy — it's what keeps `audio.test.ts` meaningful.
- No player changes expected (it consumes the manifest, provider-agnostic).

## 8. Cost (rough, refine in the spike)

- **Bake-off itself is cheap:** ~6 candidates × ~3 corpus sections × a few hundred words.
- **Full catalog (the follow-on):** ~15 exhibits × ~5 sections × ~120 words ≈ **~75 sections,
  ~9k words**, plus 2–3× for regen during iteration. Tabulate ElevenLabs ($/char by model)
  vs. Gemini ($/char) at that volume in the recommendation. Forced alignment (if Gemini) is
  compute, not API spend.

## 9. Sequencing & milestones (target dates; today = 2026-06-27)

| # | Milestone | Exit | Target |
|---|---|---|---|
| 1 | **Timing spike** (§5) | per-provider word-timing verdict | ~2026-07-04 |
| 2 | **Corpus + rubric frozen** (§6) | `docs/audio-bakeoff/corpus.md`, rubric agreed | with #1 |
| 3 | **Generate finalists** (§6) | clips + manifests for ~4–6 candidates | ~2026-07-11 |
| 4 | **Blind listening + pick** (§6) | winner + runner-up + settings, `results.md` | ~2026-07-18 |
| 5 | **Provider abstraction** (§7) | `npm run audio` runs the chosen provider end-to-end | ~2026-07-25 |
| 6 | **Decision doc + go/no-go** | recommendation + cost; greenlight full catalog | ~2026-07-25 |
| — | *Full-catalog generation (15 exhibits)* | *separate follow-on, gated on #6* | TBD |

## 10. Risks & open questions

- **Gemini timestamps** (§5) is the top risk — forced alignment adds a moving part and could
  be the deciding factor even if Gemini sounds best. Spike it first; don't fall in love with
  a voice before this clears.
- **Consistency at scale:** a voice that's great on 3 clips can drift in timbre/level across
  75; budget a small "consistency" check on the winner before full generation.
- **Prose churn:** narration regenerates on every prose edit. Decide a **content freeze**
  policy for narrated copy, or accept the regen cost. (The drift in §11 is exactly this.)
- **Reduced-motion / a11y:** the transcript is the fallback — confirm whichever timing path
  keeps the highlight legible and the transcript correct.
- **One voice vs. brand voices:** out of scope now, but record whether the winner could
  extend to per-section emphasis later without re-picking.
- **Open:** target loudness/format (keep `mp3_44100_128`?), and whether we want a human VO
  pass as a separate, higher-tier option to benchmark the synthetic winner against.

## 11. Adjacent, immediate decision — the CI-blocking guard

Independent of this workstream: `content/exhibits/audio.test.ts` is **red** because the two
pilot hooks' prose drifted from their manifests (copy-audit edits), and it runs in CI's unit
step — so it **blocks the visual/repo-health PR** (#2), not just a soft follow-up.

Since we are deliberately **not** regenerating audio until this workstream lands, the
consistent move is to **defer the staleness guard** (skip the two `textHash` + word-timing
sub-tests with a comment pointing at this doc, keep the structural "manifest/mp3 exist"
checks) so the PR can merge. Re-enable the guard when milestone #6 ships and the catalog is
regenerated on the chosen narrator. *(This is a small, separate commit — flagged for a
decision, not done here.)*
