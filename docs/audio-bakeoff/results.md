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

- **Winner:** _TBD_ — provider · voice · settings
- **Runner-up:** _TBD_
- **Rationale:** _TBD (esp. "much better than baseline" — the §1 goal)_
- **Go / no-go to generate the full 15-exhibit catalog:** _TBD (Milestone #6)_

## Next once a winner is picked

1. Fold the winner's provider/voice/settings into the pipeline (§7): add
   `provider` to the manifest; for ElevenLabs, fix `resolveVoiceId` to match
   "George" by substring; for Gemini, wire the Whisper-recovery timing path.
2. Re-record the 2 stale pilot sections on the winner; re-enable the two skipped
   `audio.test.ts` sub-tests (plan §11).
3. Cost-at-scale tabulation + go/no-go (Milestone #6), then full-catalog gen.
