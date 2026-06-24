# What the benchmark set demands of us

A cross-cutting read of the eight teardowns in this directory, captured 2026-06-21.
This is the bridge from Stream 1 (exemplars) to Stream 2 (base-template rework):
it names the patterns the benchmark set shares and our Phase 0 exhibits lack, and
turns each into a concrete requirement.

## The one-sentence finding

**Our exhibits are document-first; the benchmark set is canvas-first.** Every
flagship treatment above makes the visualization the protagonist — full-width,
persistent, composed — with prose as annotation. Our `ExhibitFrame.tsx` does the
opposite: a 1024px column with everything, including the interactive, pinned to
`max-w-[65ch]` reading width. That single structural choice is why honest eyes
read our work as "a clean blog post with a figure" rather than Distill/R2D3. It
also contradicts our own stated principle — "built for big screens… use the full
canvas to tell rich visual stories" (`README.md`).

## Honest re-baseline (feeds Stream 3)

The flagship-acceptance review scored B2/B6 at 3 ("matches the benchmark set").
Held against the captured pixels rather than memory, the **visual register is a 2**
("competent/good") — the manipulation mechanics are at parity, but composition,
scale, atmosphere, and narrative-graphic integration are not. The scoring inflated
because the comparison had no anchored artifact. That is exactly the circularity
these exemplars exist to remove.

## The recurring patterns → template requirements

| # | Pattern (seen in) | Requirement for the new template | Serves | Where we are |
| --- | --- | --- | --- | --- |
| 1 | **Graphic is the protagonist, full-bleed** (Distill, R2D3, 3B1B, Pudding) | Let the experiment break out of the 65ch column to full content width / full-bleed; prose comes *after* the first manipulation | B2, B6 | Island pinned in a 65ch column |
| 2 | **Sticky graphic + scrolling prose that re-renders it** (R2D3) | A scroll-driven layout where one persistent graphic transforms through narrative beats (object constancy) | B1, B2, B4 | Static prose that *references* a separate island |
| 3 | **Colour is shared vocabulary across canvas, controls, AND prose** (Ciechanowski, R2D3, Distill) | Extend the visual grammar into prose — coloured key terms bound to the figure/control hues | B2 | Grammar lives only inside the canvas |
| 4 | **Controls docked to the graphic they drive** (Distill, TF Playground) | Parameter controls sit adjacent to / on the visualization, not in a separate bar far away | B1, A5 | `ScenarioBar`/sliders separated from the plot |
| 5 | **Math composed beside its consequence** (Distill) | Inline, optionally-progressive math next to the widget it explains — not only a sealed drawer | B2, B4 | `MathDrawer` is a collapsed `<details>` at the bottom |
| 6 | **One composed, poster-worthy peak visual** (3B1B 3D surface, Distill bowl) | Each exhibit composes one deliberate hero visual; treat it as the page's face | B6, B2 | Peak moments exist but are small panels |
| 7 | **Density can stay calm** (TF Playground, Ciechanowski) | A grid + restraint discipline so advanced exhibits can be information-dense without clutter | A5 | Calm but sparse; untested at density |
| 8 | **Warm, one-action onboarding** (Nicky Case) | Low-ceremony entry; warmth at framing moments (persona-effect window) | A1, B6 | Reserved throughout |

## What stays ours (do not regress)

The benchmark set is weaker than us on exactly the things we must protect:

- **Hands-on manipulation** — 3B1B is video, R2D3/Pudding are read-mostly. Our drag/scrub/step interactivity is a genuine edge.
- **Guided discovery with stakes** — TF Playground and Seeing Theory offer bare free-play; our scenarios + failure gallery + in-canvas tasks beat unguided exploration (the B1 research base).
- **Assessment + mastery + a knowledge graph** — none of the benchmark pieces have a learning loop or onward movement. Nicky Case shows how to make assessment *playable*; we already have the loop.
- **Time control** — our transport on the GD loop already exceeds Distill's widget.

So Stream 2 is **not** "copy Distill." It is: keep our interactivity/pedagogy edge, and wrap it in the canvas-first, composed, colour-coherent presentation the benchmark set proves is the bar.

## Next streams (separate from this one)

- **Stream 2 — base-template rework:** implement requirements 1–8 in `ExhibitFrame.tsx` and the viz kit, design tokens, and motion language. Patterns 1–4 are the highest leverage and should land first; re-derive the two Phase 0 exhibits onto the new template as the proof.
- **Stream 3 — non-circular review:** an independent reviewer agent fed these stored exemplars (not memory) and required to produce a side-by-side verdict against a named frame; a Playwright "review contact sheet" at big-screen viewport; honest re-baseline of the scorecard per the section above.

## Stream 2 — implemented (2026-06-22)

Landed in commit "Stream 2: canvas-first scrollytelling template". The page is
now canvas-first: `ExhibitFrame` runs a `StoryScroller` spine (text-left beats,
sticky graphic right; `src/components/exhibits/StoryScroller.tsx`) over a per-
exhibit `spine.ts`, with the colour grammar carried into prose. Both Phase 0
exhibits re-derived as the proof.

| Pattern | Status |
| --- | --- |
| 1 full-bleed graphic | ✅ wide hero; prose returns to a reading column below |
| 2 sticky graphic + scrolling prose | ✅ `StoryScroller` + frame-via-context; object constancy across beats |
| 3 colour vocabulary into prose | ✅ `Term` hues + `--viz-*-ink` tokens (AA), weight+underline so colour isn't alone |
| 4 controls docked to the graphic | ✅ controls live in the sticky lab |
| 5 math beside its consequence | ✅ Math view tints symbols to the canvas grammar and composes a live widget beside the claim (`StabilityScale`, `SquaredPenalty`); the collapsed drawer is gone (2026-06-22) |
| 6 one composed peak visual | ✅ the lab is the page's face; GD line↔surface view swap |
| 7 calm density | ◑ grid discipline in place; untested at a genuinely dense exhibit |
| 8 warm one-action onboarding | ◑ "grab a point", "press play" beats; the Check now closes on an earned-mastery payoff; no persona/art yet |

**Deferred (not Stream 2):** the GD conditioning/eigen small-multiples from the
Distill teardown; persona/character warmth; and the honest re-baseline + verdict,
which belong to **Stream 3** — quality must be judged against these exemplars by
an independent pass, not self-assessed here.

**Follow-up owed:** narration audio was regenerated for the new prose; the
Playwright screenshot baselines were regenerated for darwin only — the committed
**win32/CI baselines are stale** and must be re-run on that platform.

## Math / Experiment / Check brought up to the stepper's bar (2026-06-22)

The story stepper was the only view composed as an instrument; the other three
were document-first (the SYNTHESIS finding, applied recursively to our own page).
This pass closed that gap, proven on gradient-descent then ported to
linear-regression:

- **Math** went from a plain reading column to *math beside its consequence*
  (pattern 5, now ✅): symbols tinted to the canvas grammar via a shared
  `HUE_INK`, and a live widget beside the claim — `StabilityScale` (the η
  divergence cliff) and `SquaredPenalty` (r→r²). The superseded `MathDrawer`
  was deleted.
- **Check** became a graded instrument: a live resolved/total meter, per-item
  catalogue headers (kind · difficulty · status), and a closing payoff tying the
  earned mastery to the next journey stop — presentation worthy of the learning
  loop that the benchmark set lacks (pattern 8 nudged forward).
- **Experiment** kept its strong canvas-first lab; only its framing was lifted to
  "the open bench", with the code-mode claim moved to a per-exhibit lede so GD
  (no code panel) stops over-promising.

Honesty pins extended: `math.test.ts` now fails the build if a tinted term
matches no text in its block. The new widgets clear the math-tab axe bar. The
darwin screenshot baselines were unaffected (the snapshots capture the default
Story view); **win32/CI baselines remain stale** per the note above.

**Still owed (unchanged):** an independent, non-circular review of these reworked
views against the captured exemplars — this section is the author's account, not
the verdict.
