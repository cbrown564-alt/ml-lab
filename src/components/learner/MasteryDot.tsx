"use client";

import { useLearner, type MasteryLevel } from "@/lib/learner/store";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * The learner's footprint on the map (docs/06, A1/A2): a small dot on a
 * graph-explorer chip showing this node's mastery state. Level is also
 * spelled out for screen readers — never color alone.
 */
export function MasteryDot({ nodeId }: { nodeId: string }) {
  const level = useLearner((s) => s.mastery[nodeId]?.level);
  const hydrated = useHydrated();

  if (!hydrated || !level || level === "untouched") return null;

  const styles: Record<Exclude<MasteryLevel, "untouched">, string> = {
    seen: "border-ink-faint bg-surface",
    practiced: "border-ink-faint bg-ink-faint",
    assessed: "border-accent bg-surface",
    mastered: "border-accent bg-accent",
  };

  return (
    <span
      className={`absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 ${styles[level]}`}
    >
      <span className="sr-only">({level})</span>
    </span>
  );
}
