/**
 * Scoring a regression task — and why its metric must measure *distance*, not
 * right/wrong. A continuous prediction almost never exactly equals the truth, so
 * accuracy (exact match) is ~0 even for an excellent model; the honest score is how far
 * off, on average. The same target split at a threshold becomes a classification task,
 * where accuracy is the right metric — the contrast that defines a regression task.
 */

export const absError = (pred: number, truth: number): number => Math.abs(pred - truth);

/** Mean absolute error — the average distance between prediction and truth. */
export function mae(preds: number[], truths: number[]): number {
  if (preds.length === 0) return 0;
  return preds.reduce((s, p, i) => s + absError(p, truths[i]), 0) / preds.length;
}

/** Exact-match "accuracy": the fraction of predictions within `tol` of the truth. For a
 * continuous target this is ~0 — which is exactly why accuracy is the wrong metric. */
export function exactMatchAccuracy(preds: number[], truths: number[], tol = 0.5): number {
  if (preds.length === 0) return 0;
  return preds.filter((p, i) => absError(p, truths[i]) <= tol).length / preds.length;
}

/** Split a continuous value at a threshold to pose the classification version. */
export const toClass = (y: number, line: number): "pass" | "fail" => (y >= line ? "pass" : "fail");

/** Accuracy of the binarised (classification) version of the task. */
export function classificationAccuracy(preds: number[], truths: number[], line: number): number {
  if (preds.length === 0) return 0;
  return preds.filter((p, i) => toClass(p, line) === toClass(truths[i], line)).length / preds.length;
}
