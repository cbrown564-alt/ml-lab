/**
 * Classification metrics — turning a classifier's probabilities into decisions and
 * scoring them. A threshold splits the probabilities into predicted classes; the
 * confusion matrix counts the four outcomes; precision/recall/F1 read it from
 * different angles. Model-agnostic: everything takes scored points {prob, y}, so it
 * works for logistic regression or any probabilistic classifier.
 */

export type Scored = { prob: number; y: 0 | 1 };
export type Confusion = { tp: number; fp: number; fn: number; tn: number };

/** Count true/false positives/negatives at a decision threshold (predict 1 iff
 * prob ≥ threshold). */
export function confusion(scored: Scored[], threshold: number): Confusion {
  const c: Confusion = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const s of scored) {
    const pred = s.prob >= threshold ? 1 : 0;
    if (pred === 1 && s.y === 1) c.tp++;
    else if (pred === 1 && s.y === 0) c.fp++;
    else if (pred === 0 && s.y === 1) c.fn++;
    else c.tn++;
  }
  return c;
}

/** Of those we called positive, how many were? (Undefined with no positives → 1.) */
export const precision = (c: Confusion): number => (c.tp + c.fp === 0 ? 1 : c.tp / (c.tp + c.fp));
/** Of the actual positives, how many did we catch? */
export const recall = (c: Confusion): number => (c.tp + c.fn === 0 ? 0 : c.tp / (c.tp + c.fn));
export const f1 = (c: Confusion): number => {
  const p = precision(c);
  const r = recall(c);
  return p + r === 0 ? 0 : (2 * p * r) / (p + r);
};
export const accuracyOf = (c: Confusion): number => {
  const n = c.tp + c.fp + c.fn + c.tn;
  return n === 0 ? 0 : (c.tp + c.tn) / n;
};

/** The ROC curve: sweep the threshold from high to low and trace (false-positive
 * rate, true-positive rate). Useful for the threshold-free view of a classifier. */
export function rocCurve(scored: Scored[]): { fpr: number; tpr: number }[] {
  const pos = scored.filter((s) => s.y === 1).length;
  const neg = scored.length - pos;
  if (pos === 0 || neg === 0) return [];
  const thresholds = [1.01, ...scored.map((s) => s.prob).sort((a, b) => b - a)];
  return thresholds.map((t) => {
    const c = confusion(scored, t);
    return { fpr: c.fp / neg, tpr: c.tp / pos };
  });
}

/** Area under the ROC curve via the trapezoid rule — a threshold-free summary. */
export function auc(scored: Scored[]): number {
  const roc = rocCurve(scored);
  let area = 0;
  for (let i = 1; i < roc.length; i++) {
    area += ((roc[i].fpr - roc[i - 1].fpr) * (roc[i].tpr + roc[i - 1].tpr)) / 2;
  }
  return area;
}
