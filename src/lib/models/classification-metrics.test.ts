import { describe, expect, it } from "vitest";
import {
  accuracyOf,
  auc,
  confusion,
  f1,
  precision,
  recall,
  type Scored,
} from "@/lib/models/classification-metrics";

/**
 * Classification metrics, checked against hand-computed values: the confusion matrix
 * at a threshold, precision/recall/F1/accuracy, and the precision↑/recall↓ tradeoff
 * as the threshold rises, plus ROC-AUC at the separable extremes.
 */
const scored: Scored[] = [
  { prob: 0.9, y: 1 },
  { prob: 0.8, y: 1 },
  { prob: 0.6, y: 0 },
  { prob: 0.4, y: 1 },
  { prob: 0.3, y: 0 },
  { prob: 0.1, y: 0 },
];

describe("classification metrics", () => {
  it("the confusion matrix counts the four outcomes at a threshold", () => {
    const c = confusion(scored, 0.5); // predict 1 for the top three
    expect(c).toEqual({ tp: 2, fp: 1, fn: 1, tn: 2 });
  });

  it("precision, recall, F1, accuracy read the matrix", () => {
    const c = confusion(scored, 0.5);
    expect(precision(c)).toBeCloseTo(2 / 3, 10);
    expect(recall(c)).toBeCloseTo(2 / 3, 10);
    expect(f1(c)).toBeCloseTo(2 / 3, 10);
    expect(accuracyOf(c)).toBeCloseTo(4 / 6, 10);
  });

  it("raising the threshold trades recall for precision", () => {
    const lo = confusion(scored, 0.5);
    const hi = confusion(scored, 0.85); // only the 0.9 point stays positive
    expect(precision(hi)).toBeGreaterThanOrEqual(precision(lo));
    expect(recall(hi)).toBeLessThan(recall(lo));
    expect(hi).toEqual({ tp: 1, fp: 0, fn: 2, tn: 3 });
  });

  it("AUC is 1 for a perfectly separable scorer and 0 when reversed", () => {
    const perfect: Scored[] = [
      { prob: 0.9, y: 1 },
      { prob: 0.7, y: 1 },
      { prob: 0.3, y: 0 },
      { prob: 0.1, y: 0 },
    ];
    expect(auc(perfect)).toBeCloseTo(1, 10);
    const reversed: Scored[] = perfect.map((s) => ({ prob: 1 - s.prob, y: s.y }));
    expect(auc(reversed)).toBeCloseTo(0, 10);
    // the mixed example sits strictly between
    expect(auc(scored)).toBeGreaterThan(0);
    expect(auc(scored)).toBeLessThan(1);
  });
});
