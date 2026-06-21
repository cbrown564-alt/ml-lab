# Seeing Theory — Regression Analysis

**Concept:** ordinary least squares, residuals, correlation
**Source:** https://seeing-theory.brown.edu/regression-analysis/index.html
**Our nearest exhibit:** `linear-regression` (live, flagship) — our most direct single-concept rival

## Capture limitation (read this first)

Seeing Theory hijacks the scroll and navigates sub-sections via JS, so our
`window.scrollTo` capture did not advance the page: `00`–`04` all show the
**chapter index** (Ordinary Least Squares / Correlation / Analysis of Variance),
not the live OLS draggable widget. The analysis below leans on the index frames
plus the well-known treatment. **TODO:** extend the capture script to click into
the OLS sub-section (or capture `#section` deep links) and re-shoot.

## Why it clears the bar

- **Calm, confident full-viewport two-column layout** (`00-viewport.png`): title and prose left, a column of dark circular vignettes right, enormous whitespace, generous sans type. It reads as one composed surface, not a stack of figures.
- **A single-accent identity:** every vignette uses the same magenta/pink against near-black — data points, the fitted line, the variance bars. One accent, total coherence (our A5 shell-beauty target).
- **The live OLS section** (not captured): draggable points with a residual-squares toggle — the exact mechanic our linreg exhibit replicates. Our `benchmark-comparisons.md` already rates us at parity-or-ahead here (we add staged scenarios, the tyranny failure, and in-canvas assessment).

## Mapped to our criteria

| Criterion | What they do | Where we are (Phase 0) | The gap |
| --- | --- | --- | --- |
| A5 Beauty of the shell | One accent, full-viewport calm | Disciplined but plainer, column-bound | Compositional confidence; let the canvas breathe |
| B1 Experiment teaches | Draggable points + residual toggle | At parity, plus scenarios + tasks | None — we lead here |
| B3 Motion | Smooth refit | At parity | — |

## What to steal for the template / exhibits

- The calm full-viewport two-column composition (graphic given real estate).
- The single-accent vignette identity for instant recognizability.

## What NOT to copy

- **Scroll-hijack navigation** — hostile to accessibility (our A6) and to the scroll-driven prose pattern we want from R2D3. Use native scroll.
- Free-play without stakes — we already beat this with curated failure scenarios; keep that edge.
