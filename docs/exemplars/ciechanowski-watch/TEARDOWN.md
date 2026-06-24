# Bartosz Ciechanowski — Mechanical Watch

**Concept:** how a mechanical watch works (a non-ML exemplar, deliberately — the *ceiling* for explorable craft)
**Source:** https://ciechanow.ski/mechanical-watch/
**Why it's here:** the poster-worthy bar; the gold standard for canvas atmosphere + restraint

## Why it clears the bar

- **The interactive is an inline first-class object.** The hero (`00-viewport.png`) opens with a bold blue masthead, a calm light reading surface, two short paragraphs, and then the 3D watch renders right there in the flow — "drag the device around to change your viewing angle, and use the slider to peek inside." No modal, no separate "lab"; the manipulable thing lives in the prose.
- **Colour is a shared vocabulary across prose, controls, and figure.** At `02-scroll-40pct.png` the text literally names parts in colour — "**yellow components**", "**teal components**" — matching the two colored sliders below and the colored parts in the diagram. You read a coloured word and your eye lands on it in the figure. This is our B2 visual-grammar principle pushed *into the prose itself*.
- **Ruthless restraint = atmosphere.** Vast whitespace, a 2–3 colour palette, every mark load-bearing. It is beautiful precisely because nothing is decorative — the Tufte bar, met without austerity.

## Mapped to our criteria

| Criterion | What they do | Where we are (Phase 0) | The gap |
| --- | --- | --- | --- |
| B2 Visual excellence | Poster-worthy, colour grammar into prose | Grammar in canvas only; prose is plain | Bind prose terms to the figure palette |
| A5 Beauty of the shell | Confident masthead + huge whitespace | Calm but timid, column-bound | Compositional confidence |
| B3 Motion that explains | Drag + slider reveal the internals | We have drag/scrub | Adopt "slider peeks inside" reveals |

## What to steal for the template / exhibits

- **Colour-coded prose terms** bound to the same hues as the figure/controls (a cheap, high-impact upgrade to `NarratedSection`/narrative prose).
- Interactive-as-inline-object rather than a walled-off island.
- The restraint: cut anything not load-bearing.

## What NOT to copy

Ciechanowski hand-builds bespoke WebGL per article — gorgeous, but ruinous for our C1 marginal-cost-of-content metric (exhibit #30 must be cheap). Borrow the *discipline and the colour-into-prose move*; reach the look through the reusable viz kit, not bespoke renders per exhibit.
