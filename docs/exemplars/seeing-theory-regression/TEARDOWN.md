# Seeing Theory — Regression Analysis

**Concept:** ordinary least squares, residuals, correlation
**Source:** https://seeing-theory.brown.edu/regression-analysis/index.html
**Our nearest exhibit:** `linear-regression` (live, flagship) — our most direct single-concept rival

## Captures

Seeing Theory scroll-jacks (viz sections are `position:fixed; visibility:hidden`
until a nav card is clicked) and the plot stays empty until a dataset is chosen,
so the capture script drives it like a user (`npm run capture:exemplars -- seeing-theory-regression`):

- `00-index.png` — the chapter landing (OLS / Correlation / ANOVA cards)
- `01-ols-anscombe-1.png` — OLS on Anscombe I: clean linear fit, residual squares
- `02-ols-anscombe-3-outlier.png` — Anscombe III: one outlier bends the line
- `03-ols-anscombe-4-pathology.png` — Anscombe IV: a single leverage point sets the slope
- `04-correlation.png` — Correlation: live r-slider + iris correlation matrix

## Why it clears the bar

- **Calm, full-height two-column composition.** Prose + controls + a live
  regression table sit on the left; the plot occupies the entire right half at
  full viewport height (`01-…png`). The graphic is given real estate — the
  canvas-first instinct our 65ch-column template lacks.
- **Residual *squares* — the same move we make.** Pink squares whose *area* is the
  squared error sit on the fitted line; the outlier's square visibly dwarfs the
  rest (`02`, `03`). This is exactly our linreg "area = the penalty" beat. We are
  at genuine parity on the core mechanic.
- **Anscombe's Quartet as built-in failure pedagogy.** Switching datasets I→III→IV
  walks clean fit → outlier leverage → degenerate-x pathology — the curated-failure
  approach our scenarios use ("tyranny of the outlier"). Their failures are a
  dataset toggle; ours are staged scenarios with narration.
- **A live estimates table bridges numbers and geometry:** n, x̄, ȳ, B̂₀, B̂₁, SSE
  update with the data, and "click a column to learn more" is math-on-demand,
  inline and contextual (vs our collapsed math drawer).
- **One magenta accent** across points, line, and squares — instant coherence (A5).

## Mapped to our criteria

| Criterion | What they do | Where we are (Phase 0) | The gap |
| --- | --- | --- | --- |
| A5 Beauty of the shell | Calm full-height two-column, one accent | Disciplined but column-bound | Give the plot half the screen at full height |
| B1 Experiment teaches | Draggable points, Anscombe failure set | At parity + staged scenarios, tasks, narration | None — we lead |
| B2 Visual excellence | Residual squares; live estimates table | Residual squares ✓; math siloed in a drawer | A live numeric table bridging plot↔estimates |
| B3 Motion | Smooth refit on drag/dataset swap | At parity | — |

## What to steal for the template / exhibits

- The **full-height side-by-side**: controls + a live estimates table on one side,
  the plot at full viewport height on the other.
- A **live estimates table** that ties B̂₀/B̂₁/SSE to the geometry (numbers and
  picture moving together).
- **Anscombe's Quartet** as a ready-made failure set for the regression cluster.

## What NOT to copy

- **Scroll-hijack navigation** and **hidden radio inputs** — hostile to keyboard
  and screen-reader users (our A6). Keep native scroll and operable controls.
- Dataset-toggle failures with no narrative — we already beat this with staged
  scenarios; keep the staging and the spoken story around the failure.
