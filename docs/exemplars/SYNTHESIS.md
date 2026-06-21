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
