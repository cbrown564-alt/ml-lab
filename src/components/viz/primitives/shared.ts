"use client";

import { useEffect, useState } from "react";
import type { VizHue } from "@/lib/exhibit/spine";
import { HUE_INK, HUE_MARK } from "@/lib/narrative/hues";

/** Read prefers-reduced-motion once mounted; heroes use the same pattern. */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
}

export function hueMark(hue: VizHue = "neutral"): string {
  return HUE_MARK[hue];
}

export function hueInk(hue: VizHue = "neutral"): string {
  return HUE_INK[hue];
}

export const MOTION_MOVE = "var(--motion-move)";
export const MOTION_QUICK = "var(--motion-quick)";
