import type { VizHue } from "@/lib/exhibit/spine";

/**
 * The visual-grammar hues carried into text. Each maps to the darkened `-ink`
 * sibling token so a tinted term stays legible against the warm light surface
 * (Stream 2, pattern 3 — colour as shared vocabulary across canvas and prose).
 * Always pair the colour with weight + underline so it is never the only cue.
 *
 * Shared by the narration player and the math view so a term reads the same
 * blue/gold/red whether it is spoken in a beat or set in an equation.
 */
export const HUE_INK: Record<VizHue, string> = {
  prediction: "var(--viz-prediction-ink)",
  truth: "var(--viz-truth-ink)",
  error: "var(--viz-error-ink)",
  param: "var(--viz-param-ink)",
  neutral: "var(--viz-neutral-ink)",
};

/** The saturated canvas token for a hue — the mark itself, not its text echo. */
export const HUE_MARK: Record<VizHue, string> = {
  prediction: "var(--viz-prediction)",
  truth: "var(--viz-truth)",
  error: "var(--viz-error)",
  param: "var(--viz-param)",
  neutral: "var(--viz-neutral)",
};
