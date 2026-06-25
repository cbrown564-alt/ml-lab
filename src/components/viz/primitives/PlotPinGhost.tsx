"use client";

import type { ReactNode } from "react";
import { MOTION_MOVE, usePrefersReducedMotion } from "./shared";

/** Default ghost opacity — matches {@link PinAndCompare} pinned layer. */
export const PINNED_GHOST_OPACITY = 0.45;

/**
 * SVG ghost layer for pin-and-compare inside {@link Plot}. Renders a frozen
 * reference state beneath the live layer at reduced opacity.
 */
export function PlotPinGhost({
  children,
  visible = true,
  opacity = PINNED_GHOST_OPACITY,
}: {
  children: ReactNode;
  visible?: boolean;
  opacity?: number;
}) {
  const reduceMotion = usePrefersReducedMotion();
  if (!visible) return null;
  return (
    <g
      aria-hidden
      style={{
        opacity,
        transition: reduceMotion ? undefined : `opacity ${MOTION_MOVE}`,
        pointerEvents: "none",
      }}
    >
      {children}
    </g>
  );
}
