/**
 * Frame interpolation helpers for counterfactual replay and synchronized
 * cross-world scrubbing. Pure functions — tested directly.
 */

export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/** Blend two keyed numeric states for reversible counterfactual scrubbing. */
export function lerpRecord(
  baseline: Record<string, number>,
  intervened: Record<string, number>,
  t: number,
): Record<string, number> {
  const u = clamp01(t);
  const keys = new Set([...Object.keys(baseline), ...Object.keys(intervened)]);
  const out: Record<string, number> = {};
  for (const key of keys) {
    out[key] = lerp(baseline[key] ?? 0, intervened[key] ?? 0, u);
  }
  return out;
}

/** Map scrub direction to a 0–1 progress value (reverse replays from end). */
export function reversibleProgress(
  progress: number,
  direction: "forward" | "reverse",
): number {
  const t = clamp01(progress);
  return direction === "reverse" ? 1 - t : t;
}

/** Lab-wide ease-out curve — matches globals.css --ease-out feel. */
export function easeOutCubic(t: number): number {
  const u = clamp01(t);
  return 1 - Math.pow(1 - u, 3);
}

/** Map elapsed ms to eased 0–1 progress for hero / specimen morphs. */
export function easeProgress(elapsedMs: number, durationMs: number): number {
  return easeOutCubic(elapsedMs / Math.max(1, durationMs));
}
