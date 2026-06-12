"use client";

import { useSyncExternalStore } from "react";
import { useLearner, type MasteryLevel } from "@/lib/learner/store";

const emptySubscribe = () => () => {};
/** False during SSR and the hydration render, true afterwards. */
const useHydrated = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

/**
 * The learner's own state, legible at a glance (docs/06, A2): "seen",
 * "practiced", "assessed", "mastered". Renders nothing before hydration and
 * nothing for untouched nodes — absence of a badge is the untouched state.
 */
export function MasteryBadge({ nodeId }: { nodeId: string }) {
  const level = useLearner((s) => s.mastery[nodeId]?.level);
  const hydrated = useHydrated();

  if (!hydrated || !level || level === "untouched") return null;

  const styles: Record<Exclude<MasteryLevel, "untouched">, string> = {
    seen: "border-line text-ink-faint",
    practiced: "border-line text-ink-muted",
    assessed: "border-accent/50 text-accent",
    mastered: "border-accent bg-accent text-accent-ink",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 font-mono text-xs tracking-wide ${styles[level]}`}
    >
      {level}
    </span>
  );
}
