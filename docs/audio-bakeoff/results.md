# Voice bake-off — results & decision (Milestone #4)

**Status:** ⏳ Awaiting blind listening · Supports [audio-narration-bakeoff-plan.md](../audio-narration-bakeoff-plan.md) §6.4

How to use: open `contact-sheet.html`, listen **blind** (codes only), score each
code 1–5 on the rubric, then reveal the key ([candidates.md](candidates.md)) and
fill the labels. Anchor every voice against **c1 (baseline)** so scores mean
"much better than today," not just "good."

## Scorecard (1–5 each; fill while blind)

| Code | Intelligibility | Register | Expressiveness | Pacing/breath | Pronunciation (hard fails) | Consistency | **Total** | Notes |
|---|---|---|---|---|---|---|---|---|
| c1 (baseline) | | | | | | | | |
| c2 | | | | | | | | |
| c3 | | | | | | | | |
| c4 | | | | | | | | |
| c5 | | | | | | | | |
| c6 | | | | | | | | |

### Timing fidelity (objective — from `bakeoff-manifest.json`, not a listening score)

| Code | Path | Word-for-word / recovery coverage |
|---|---|---|
| c1–c4 (ElevenLabs) | native `with-timestamps` | word-for-word ✓ on A/B/probe |
| c5–c6 (Gemini) | Whisper recovery | coverage 95–100%, no style leak |

## Pronunciation check (probe — count hard failures per code)

R² · MSE · λ · η · w·x + b · OLS · sigmoid · ŷ · k-fold · train/test split

| Code | Hard failures | Which terms |
|---|---|---|
| c1 | | |
| … | | |

## Decision

- **Winner (c6):** **Gemini · Sulafat (Warm)** · `gemini-3.1-flash-tts-preview` · documentary style-steer — the product owner's clear-cut pick (2026-06-27).
- **Rationale:** warm, expressive, and clearly the documentary register the lab wants — decisively better than the c1 baseline (Roger @ default), which was the whole bar to clear (§1). The expressiveness hypothesis held: Gemini over ElevenLabs, even tuned.
- **Runner-up:** not separately scored — the winner was unambiguous.
- **Watch into productionization:** Sulafat's steered delivery ran **long (~48–54 s vs 36–46 s)** on the corpus. Confirm pacing reads as "unhurried," not "slow," on a full exhibit; if too slow, dial the style directive back before the catalog run.
- **Go / no-go to generate the full 15-exhibit catalog:** **GO (2026-06-27)** — the
  product owner listened to the pilots and signed off the delivery. See "M6" below.

## M6 — cost-at-scale + full-catalog generation (done 2026-06-27)

The whole 15-exhibit catalog was generated on Gemini · Sulafat via the M5 pipeline.

- **Volume:** 76 sections / ~35.4k chars / ~48 min of narration. This run: 65 new
  sections (the 2 pilots skipped, idempotent); **zero retries, zero low-coverage
  warnings, zero errors** — every section aligned cleanly.
- **Cost (per run):** Whisper recovery ≈ $0.006/audio-min × ~48 min ≈ **~$0.30**;
  Gemini `gemini-3.1-flash-tts-preview` TTS the larger-but-still-modest component
  (the bake-off + this run are the empirical sample — confirm the exact char rate
  on the billing dashboard). Budget a small multiple for prose-churn regen, which
  is per-section, not per-catalog (idempotent on `textHash` + provider/voice/model).
- **Pacing:** the catalog runs a consistent **121–138 wpm** (documentary register,
  matching the approved pilots) — no per-exhibit outliers.
- **Verification:** the `audio.test.ts` staleness + word-for-word guards now cover
  all 15 exhibits (60 cases) and are green; build · 236 unit · validate green.

## Implication: provider is **Gemini** → the timing path is Whisper-recovery

The winner has no native timestamps, so the production pipeline must adopt the
spike's recovery path (Whisper word-ts → map to prose) as a first-class provider,
not just ElevenLabs `with-timestamps`. This is the §7 work (M5), now on the
critical path rather than optional.

## Next once a winner is picked

1. ~~Fold the winner's provider/voice/settings into the pipeline (§7): add
   `provider` to the manifest; for ElevenLabs, fix `resolveVoiceId` to match
   "George" by substring; for Gemini, wire the Whisper-recovery timing path.~~
   **DONE 2026-06-27 (M5 abstraction).** `scripts/generate-audio.ts` is now a
   two-provider abstraction (`AUDIO_PROVIDER=gemini|elevenlabs`, default **gemini ·
   Sulafat · gemini-3.1-flash-tts-preview**). The Gemini path is TTS → ffmpeg mp3
   → Whisper word-ts → `src/lib/narrative/align.ts` (extracted from the spike,
   **unit-tested** — the word-for-word + monotonic contract is guaranteed by
   construction, so it's verified without any audio/API spend). `provider` is on
   the manifest + the idempotence key, so switching narrator invalidates the old
   ElevenLabs sections cleanly. ElevenLabs retained with the substring voice fix.
   Build (type-checks `scripts/`) · lint · 180 unit green.
2. **PENDING — the billable run (gated, not auto-run):** generate the 2 pilot
   sections on Gemini · Sulafat, listen to confirm pacing reads "unhurried" not
   "slow" (see watch note above), then re-enable the two skipped `audio.test.ts`
   sub-tests (plan §11). Held for an explicit go-ahead — it spends Gemini TTS +
   Whisper credits and rewrites player-facing audio.
3. Cost-at-scale tabulation + go/no-go (Milestone #6), then full-catalog gen.
