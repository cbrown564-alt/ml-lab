# Distill — Why Momentum Really Works

**Concept:** gradient descent, momentum, loss-surface conditioning
**Source:** https://distill.pub/2017/momentum/
**Our nearest exhibit:** `gradient-descent` (live, flagship)

## Why it clears the bar

- **The interactive is the headline.** The first thing under the title (`00-viewport.png`) is the loss-surface contour bowl with the orange descent path zig-zagging from "Starting Point" to "Solution", labels set *inside* the graphic. Two live sliders — step-size α, momentum β — sit directly beneath it and re-run the path. No prose precedes it. Compare our GD exhibit: a small island below a kicker, title, and lede.
- **The conditioning story is made visual.** At `02-scroll-40pct.png`, five small-multiples — *Ripples / Monotonic Decrease / 1-Step Convergence / Monotonic Oscillations / Divergence* — each show one eigen-mode's behaviour with a one-paragraph caption, tied to the inequality `0 < αλᵢ < 2 + 2β`. This is exactly the eigenvalue/anisotropy depth our own benchmark verdict admitted we skip ("our surface shows the ellipses but never names the anisotropy", `docs/reviews/benchmark-comparisons.md`).
- **Math sits beside its consequence.** Typeset notation is inline and first-class, adjacent to the widget whose behaviour it predicts — not sealed in a drawer the way our `MathDrawer` seals it.
- **Disciplined two-hue palette:** orange = the iterate/path, blue = the surface, everywhere. Decode once.

## Mapped to our criteria

| Criterion | What they do | Where we are (Phase 0) | The gap |
| --- | --- | --- | --- |
| B2 Visual excellence | Composed contour hero, labels in-graphic, eigen small-multiples | Small top-down surface, labels present, no regime taxonomy | Hero scale + the conditioning small-multiples |
| B3 Motion that explains | Sliders re-trace the path live | We have scrub/step (good, arguably ahead) | At parity-or-ahead on control |
| B6 Delight | The bowl + path as the page's face | Loss surface is a reveal, but small | Make the surface the protagonist, not a panel |

## What to steal for the template / exhibits

- Hero-as-interactive at full content width, prose *after* the first manipulation.
- Parameter controls docked to the graphic they drive.
- A small-multiples "regime taxonomy" pattern for any exhibit with a stability/parameter sweep.
- Name the conditioning story on our GD surface (the deferred eigen/anisotropy beat now has a concrete target).

## What NOT to copy

Distill's register is math-forward from the first screen. Our product leads with intuition before formalism (`PRODUCT.md`), for an earlier-stage learner. Adopt the *composition* and the small-multiples; keep gating the math depth behind the intuition beat.
