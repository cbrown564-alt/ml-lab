"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { clamp01 } from "./interpolation";
import { MOTION_MOVE, MOTION_QUICK, usePrefersReducedMotion } from "./shared";

/**
 * COMPARE/INTERVENE — Counterfactual replay (visual-standards audit).
 *
 * Two synchronized worlds share one timeline: scrub or play forward/backward to
 * see how a single intervention diverges from the baseline. The frame at any
 * progress value must read as a static still when motion is reduced.
 */
export function CounterfactualReplay({
  baseline,
  intervened,
  progress: controlledProgress,
  defaultProgress = 0,
  onProgressChange,
  playing = false,
  playDirection = "forward",
  durationMs = 2400,
  interventionLabel = "intervention",
  baselineLabel = "baseline",
  ariaLabel,
}: {
  /** The world without the intervention. */
  baseline: ReactNode;
  /** The world after the intervention — same layout, one causal difference. */
  intervened: ReactNode;
  /** Scrub position 0 = baseline, 1 = fully intervened. */
  progress?: number;
  defaultProgress?: number;
  onProgressChange?: (progress: number) => void;
  playing?: boolean;
  playDirection?: "forward" | "reverse";
  durationMs?: number;
  interventionLabel?: string;
  baselineLabel?: string;
  ariaLabel: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const [internal, setInternal] = useState(defaultProgress);
  const progress = controlledProgress ?? internal;
  const setProgress = useCallback(
    (next: number) => {
      const clamped = clamp01(next);
      if (controlledProgress === undefined) setInternal(clamped);
      onProgressChange?.(clamped);
    },
    [controlledProgress, onProgressChange],
  );

  const rafRef = useRef(0);
  const startRef = useRef(0);
  const fromRef = useRef(progress);

  useEffect(() => {
    if (!playing || reduceMotion) return;
    fromRef.current = progress;
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const delta =
        playDirection === "forward"
          ? elapsed / durationMs
          : -elapsed / durationMs;
      const next = clamp01(fromRef.current + delta);
      setProgress(next);
      if (
        (playDirection === "forward" && next < 1) ||
        (playDirection === "reverse" && next > 0)
      ) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // progress is read once when play starts via fromRef
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional play-from-current
  }, [playing, playDirection, durationMs, reduceMotion, setProgress]);

  const scrubId = useId();
  const showIntervened = progress >= 0.5;

  return (
    <div className="flex flex-col gap-3" aria-label={ariaLabel}>
      <div className="relative grid grid-cols-2 gap-3">
        <div
          className="relative min-h-0 overflow-hidden rounded-lg border border-line"
          style={{
            opacity: 1 - progress * 0.35,
            transition: reduceMotion ? undefined : `opacity ${MOTION_MOVE}`,
          }}
        >
          <span className="pointer-events-none absolute top-2 left-2 z-10 rounded bg-raised/90 px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-faint uppercase">
            {baselineLabel}
          </span>
          {baseline}
        </div>
        <div
          className="relative min-h-0 overflow-hidden rounded-lg border border-line"
          style={{
            opacity: 0.35 + progress * 0.65,
            transition: reduceMotion ? undefined : `opacity ${MOTION_MOVE}`,
          }}
        >
          <span
            className="pointer-events-none absolute top-2 left-2 z-10 rounded px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase"
            style={{
              color: "var(--viz-param-ink)",
              background: "color-mix(in oklab, var(--viz-param) 12%, var(--surface-raised))",
            }}
          >
            {interventionLabel}
          </span>
          {intervened}
        </div>
        {!reduceMotion && playing && (
          <div
            className="pointer-events-none absolute inset-y-0 z-20 w-0.5"
            style={{
              left: `${progress * 100}%`,
              background: "var(--viz-param)",
              transition: `left ${MOTION_QUICK}`,
            }}
            aria-hidden
          />
        )}
      </div>
      <label htmlFor={scrubId} className="sr-only">
        Scrub between baseline and intervention
      </label>
      <input
        id={scrubId}
        type="range"
        min={0}
        max={100}
        value={Math.round(progress * 100)}
        onChange={(e) => setProgress(Number(e.target.value) / 100)}
        className="w-full accent-[var(--viz-param)]"
        aria-valuetext={
          showIntervened ? `Showing ${interventionLabel}` : `Showing ${baselineLabel}`
        }
      />
    </div>
  );
}