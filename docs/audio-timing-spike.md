# Audio timing-feasibility spike

**Status:** ✅ Complete — both providers clear the bar · **Created:** 2026-06-27 · Milestone #1 of [audio-narration-bakeoff-plan.md](audio-narration-bakeoff-plan.md) §5

> **Verdict in one line:** ElevenLabs passes natively (re-confirmed); Gemini has
> no native timestamps but the **Whisper-word-timestamps → map-to-prose** recovery
> passes the production contract on all three corpus sections (incl. the
> `10² = 100 × 1²` gauntlet and the R²/λ/η/ŷ/OLS/k-fold probe) at **97–98% direct
> word coverage**, fully deterministic. **Neither provider is eliminated on
> timing** — the bake-off proceeds to the voice round.

**Question this spike answers (pass/fail, before any voice judging):** for each
candidate provider, can we produce **word-level timings that pass
`content/exhibits/audio.test.ts`** — i.e. one `{w, s, e}` per `splitWords(prose)`
token, in monotonic order, matching the prose word-for-word? A provider that
can't is out, no matter how it sounds.

The hard case is the symbol/numeral cluster in corpus Section B —
**`10² = 100 × 1²`** — plus em-dashes and the curly apostrophe in `error's`.
ElevenLabs aligns the *characters of the exact input string*, so every input
token (including `10²`) gets a time natively. A timestamp-less provider needs a
recovery step (forced alignment or ASR-word-timestamps mapped back to the prose
tokens), and that step is where symbol tokens break.

## Method

- **Corpus:** the frozen Section A / B / probe from [audio-bakeoff/corpus.md](audio-bakeoff/corpus.md). B is the timing stress case.
- **Contract:** `toWordTimings(text, …)` must reproduce `splitWords(text)` exactly (the same assertion the production generator and the skipped `audio.test.ts` checks use).
- **Per provider, measure:** (a) every `splitWords` token gets a time? (b) alignment error on technical/symbol tokens & numerals; (c) added pipeline cost/latency; (d) determinism across re-runs.

## Verdict

| Provider | Native word timing? | Recovery path | Passes contract? | Verdict |
|---|---|---|---|---|
| ElevenLabs (`eleven_multilingual_v2`, `with-timestamps`) | yes (char-level → words) | n/a | **yes** — re-confirmed, word-for-word + monotonic on A & B | ✅ **PASS** |
| Gemini TTS (`gemini-2.5-flash-preview-tts`, raw PCM) | no (24 kHz s16 PCM, no times) | Whisper word-ts → map to prose | **yes** — see below | ✅ **PASS** |

> The account's default ElevenLabs voice is **Roger** (`voices[0]`), not "George"
> — confirming the plan's note that today's baseline is an *unintended* stock
> voice. The newer `gemini-3.1-flash-tts-preview` also exists on the account
> (flagged for the voice round; timing is provider-recovery-agnostic so it
> doesn't change this verdict).

## Findings

Harness: `scripts/spike-timing.ts` (temporary). Per section: ElevenLabs
`with-timestamps` (native), and Gemini TTS → WAV → OpenAI Whisper (`whisper-1`,
`verbose_json`, word granularity) → sequence-align Whisper words onto
`splitWords(prose)` tokens. Run on the three frozen corpus sections.

| Section | ElevenLabs (native) | Gemini→Whisper: word-for-word | monotonic | direct match | interpolated tokens | Whisper determinism (same audio) |
|---|---|---|---|---|---|---|
| A — hook (109 w) | ✅ word-for-word, 38.8 s | ✅ | ✅ | **107/109 (98%)** | `—` `—` (silent em-dashes) | identical, Δ 0.000 s |
| B — squared-error (106 w) | ✅ word-for-word, 40.5 s | ✅ | ✅ | **103/106 (97%)** | `—` `—` `hundred` | identical, Δ 0.000 s |
| probe — R²/λ/η/OLS/ŷ/k-fold (38 w) | ✅ word-for-word, 14.5 s | ✅ | ✅ | **37/38 (97%)** | `+` (silent) | identical, Δ 0.000 s |

What this means:

- **The hard cluster works.** `10²`→"10 squared", `=`→"equals", `100`, `×`→"times",
  `1².`→"1 squared" each got a direct, monotonic window (29.3 → 32.2 s in B).
- **The probe works.** `R²`→"R-square", `λ`→"lambda", `η`→"eta", `w·x`→"W dot X",
  `ŷ`→"Y-hat", `OLS`, `sigmoid`, `k-fold`, `train/test`, `cross-validation` all
  direct-matched. (Bonus, not a timing finding: Gemini *pronounced* every one
  correctly — a good omen for §6.)
- **The only misses are genuinely silent.** Em-dashes (`—`) and the math `+` carry
  no audio; they get a zero/short interpolated window between neighbours —
  exactly what ElevenLabs also assigns them. The lone real artifact (`hundred`,
  when Whisper emitted "100" as one token) interpolates harmlessly. **None break
  the word-for-word + monotonic contract** the player and `audio.test.ts` require.
- **Deterministic enough (§4.3).** Whisper on fixed audio is bit-identical across
  runs (Δ 0.000 s). Gemini TTS itself need not be deterministic — the pipeline
  caches audio and keys idempotence on provider/voice/model + `textHash`, so
  re-runs are no-ops.
- **Cost/latency:** Gemini path adds **one Whisper call per section** (`whisper-1`
  ≈ $0.006/audio-min; a ~0.6-min section ≈ $0.004). Negligible at catalog scale;
  no GPU, no local model.

### Chosen alignment approach for the timestamp-less provider (Gemini)

**OpenAI Whisper word-timestamps → sequence-map to prose.** Per section:
1. Gemini TTS → 24 kHz s16 PCM → WAV.
2. `whisper-1` transcription, `verbose_json`, `timestamp_granularities: ["word"]`.
3. Normalize symbols/numerals to spoken form on both sides (`10²`→"10 squared",
   `×`→"times", `λ`→"lambda", `ŷ`→"y hat", dashes→silent, small number map).
4. Needleman–Wunsch align Whisper words to `splitWords` sub-words; collapse to one
   `{w,s,e}` window per prose token; interpolate silent/symbol tokens; enforce
   monotonic starts.

This satisfies the same `toWordTimings` word-for-word invariant ElevenLabs uses,
so `audio.test.ts` stays meaningful for either provider.

## Caveats to carry into productionization (not blockers)

- The symbol/number normalizer in the spike is **corpus-tuned**. For the full
  catalog it needs either a general number-to-words pass + a maintained symbol
  map, or — cleaner — author guidance to prefer spoken forms in narrated prose
  where a raw glyph (`10²`, `w·x`) is ambiguous. Track under §7 (provider
  abstraction).
- Interpolated silent tokens (`—`, `+`) get a momentary highlight in the synced
  transcript — same behaviour as ElevenLabs' tiny native windows. Acceptable.
- Re-confirm the Whisper word payload if we change ASR model; re-confirm
  ElevenLabs' alignment payload if we test a newer EL model (`turbo_v2_5`/`v3`).

## Environment notes

- Python **3.14.4** (too new for `aeneas`), **espeak not installed**, `ffmpeg`/`uv`
  present. The cloud Whisper route sidesteps a heavy local aligner (WhisperX/torch)
  entirely — chosen over a local forced aligner for this reason.
