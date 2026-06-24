# R2D3 — A Visual Introduction to Machine Learning, Part 1

**Concept:** decision trees, train/test split, overfitting
**Source:** http://www.r2d3.us/visual-intro-to-machine-learning-part-1/
**Captured from:** Internet Archive (origin returned Cloudflare 522 on 2026-06-21)
**Our nearest exhibit:** future *trees cluster* (Phase 1) — and the model for our whole scrollytelling ambition

## Why it clears the bar

- **The graphic is the page.** The hero (`00-viewport.png`) is full-bleed: title left, a living scatter-grid of the SF-vs-NY home dataset bleeding off the right edge, and a single "Keep scrolling" invitation. The visualization isn't a figure inside the article — it *is* the article surface.
- **The graphic is sticky; the prose scrolls past and re-renders it.** At `02-scroll-40pct.png` the same data has restructured into an elevation histogram, then a NY/SF split with a live **"56 % correct"** readout and a counts pie (111 NY / 139 SF false splits). The graphic persists and continuously re-renders to the current narrative beat — object constancy across the entire essay. This is the single biggest move our document-column template (`ExhibitFrame.tsx`) does **not** make.
- **An essay-wide two-colour grammar:** green = San Francisco, blue = New York, held from the first scatter to the final tree. The learner decodes the palette once and reads every subsequent graphic for free — our B2 "visual grammar" principle, executed at full-essay scale.

## Mapped to our criteria

| Criterion | What they do | Where we are (Phase 0) | The gap |
| --- | --- | --- | --- |
| B2 Visual excellence | Full-bleed sticky graphic, essay-wide colour grammar | 65ch column, grammar holds within the island | Break the graphic out of the column; persist it across the story |
| B1 Experiment teaches | The tree is *built for you* as you read | Manipulation lives in one island, prose references it after | Interleave story and graphic state |
| B4 Multi-modal orchestration | Each prose beat is synced to a graphic state | Narration synced to prose, not to the graphic | Temporal contiguity with the visualization |

## What to steal for the template / exhibits

- **The sticky-graphic + scrolling-prose pattern** — the headline requirement for the Stream-2 template rework.
- Persistent object identity: the same points/marks transform between beats rather than being replaced.
- A 2-colour semantic grammar held for an entire exhibit.

## What NOT to copy

R2D3 is read-mostly — the reader steers little. Our edge is hands-on manipulation, so keep the draggable/scenario interactivity; add the scroll-driven staging *around* it rather than replacing it.
