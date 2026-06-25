/**
 * Shared decision-conveyor logic — threshold sorting into TP/FP/FN/TN bins.
 * Exhibit-specific belt SVGs (ClassificationViews) and the grid primitive
 * (viz/primitives/DecisionConveyor) both consume these helpers.
 */

import {
  confusion,
  precision,
  recall,
  type Confusion,
  type Scored,
} from "@/lib/models/classification-metrics";

export type ConveyorOutcome = keyof Confusion;

/** Classify one scored point at a decision threshold. */
export function conveyorOutcome(scored: Scored, threshold: number): ConveyorOutcome {
  const pred = scored.prob >= threshold ? 1 : 0;
  if (pred === 1 && scored.y === 1) return "tp";
  if (pred === 1 && scored.y === 0) return "fp";
  if (pred === 0 && scored.y === 1) return "fn";
  return "tn";
}

/** Confusion counts plus precision/recall for a batch at one threshold. */
export function conveyorMetrics(scored: Scored[], threshold: number) {
  const counts = confusion(scored, threshold);
  return {
    ...counts,
    precision: precision(counts),
    recall: recall(counts),
  };
}

/** Classify one primitive conveyor item at a decision threshold. */
export function classifyConveyorItem(
  item: { score: number; actualPositive: boolean },
  threshold: number,
): ConveyorOutcome {
  const predicted = item.score >= threshold;
  if (item.actualPositive && predicted) return "tp";
  if (!item.actualPositive && predicted) return "fp";
  if (item.actualPositive && !predicted) return "fn";
  return "tn";
}

/** Bucket primitive conveyor items into TP/FP/FN/TN arrays. */
export function classifyConveyorItems<T extends { score: number; actualPositive: boolean }>(
  items: T[],
  threshold: number,
): Record<ConveyorOutcome, T[]> {
  const out: Record<ConveyorOutcome, T[]> = { tp: [], fp: [], fn: [], tn: [] };
  for (const item of items) out[classifyConveyorItem(item, threshold)].push(item);
  return out;
}

/** Map exhibit Scored rows to primitive ConveyorItem shape. */
export function toConveyorItems(scored: Scored[]) {
  return scored.map((s, i) => ({
    id: `obs-${i}`,
    score: s.prob,
    actualPositive: s.y === 1,
  }));
}
