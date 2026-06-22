import { solveLinear } from "@/lib/models/polynomial";

/**
 * Data leakage, via the classic feature-selection trap (Hastie, ESL §7.10.2). Given
 * many noise features and a noise target — no real signal — the *order* of two steps
 * decides whether cross-validation tells the truth. Select the most target-correlated
 * features using ALL the data and then cross-validate, and the selection has already
 * seen every test fold: CV reports confident skill that doesn't exist. Select inside
 * each fold instead and the score collapses to ~0. Same data, same model; only the
 * leak differs.
 */

export type Matrix = number[][]; // rows = samples, cols = features

export function pearson(a: number[], b: number[]): number {
  const n = a.length;
  let ma = 0;
  let mb = 0;
  for (let i = 0; i < n; i++) {
    ma += a[i];
    mb += b[i];
  }
  ma /= n;
  mb /= n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const den = Math.sqrt(da * db) || 1e-12;
  return num / den;
}

/** Indices of the k features most correlated (absolute) with y over the given rows. */
export function topKFeatures(X: Matrix, y: number[], rows: number[], k: number): number[] {
  const p = X[0].length;
  const cors: { j: number; c: number }[] = [];
  const ysub = rows.map((i) => y[i]);
  for (let j = 0; j < p; j++) {
    cors.push({ j, c: Math.abs(pearson(rows.map((i) => X[i][j]), ysub)) });
  }
  cors.sort((u, v) => v.c - u.c);
  return cors.slice(0, k).map((u) => u.j);
}

export type HeldOut = { actual: number; predicted: number };

/** Fit OLS on the train rows/cols, then score the held-out test rows: out-of-sample
 * R² (baseline = train mean) plus the (actual, predicted) pairs, with a whisker of
 * ridge for stability. */
export function fitFold(
  X: Matrix,
  y: number[],
  trainRows: number[],
  testRows: number[],
  cols: number[],
): { r2: number; points: HeldOut[] } {
  const d = cols.length + 1; // + intercept
  const A = Array.from({ length: d }, () => new Array<number>(d).fill(0));
  const Ay = new Array<number>(d).fill(0);
  for (const i of trainRows) {
    const row = [1, ...cols.map((j) => X[i][j])];
    for (let a = 0; a < d; a++) {
      Ay[a] += row[a] * y[i];
      for (let b = 0; b < d; b++) A[a][b] += row[a] * row[b];
    }
  }
  for (let a = 0; a < d; a++) A[a][a] += 1e-6;
  const w = solveLinear(A, Ay);

  let ytrMean = 0;
  for (const i of trainRows) ytrMean += y[i];
  ytrMean /= trainRows.length;

  let ssRes = 0;
  let ssTot = 0;
  const points: HeldOut[] = [];
  for (const i of testRows) {
    let pred = w[0];
    for (let c = 0; c < cols.length; c++) pred += w[c + 1] * X[i][cols[c]];
    ssRes += (y[i] - pred) ** 2;
    ssTot += (y[i] - ytrMean) ** 2;
    points.push({ actual: y[i], predicted: pred });
  }
  return { r2: 1 - ssRes / (ssTot || 1e-9), points };
}

/** Contiguous-block folds (matching the fixture generator), so TS and numpy agree. */
export function foldBounds(n: number, folds: number): number[] {
  return Array.from({ length: folds + 1 }, (_, i) => Math.round((i * n) / folds));
}

export type CvResult = { foldR2: number[]; meanR2: number; points: HeldOut[] };

/** k-fold CV R². `leaky` = select features once on all data; otherwise select inside
 * each fold's training rows (the honest way). Also returns every held-out point's
 * (actual, predicted) so the lie is visible as a scatter. */
export function crossValR2(
  X: Matrix,
  y: number[],
  k: number,
  folds: number,
  leaky: boolean,
): CvResult {
  const n = y.length;
  const all = Array.from({ length: n }, (_, i) => i);
  const bounds = foldBounds(n, folds);
  const globalCols = leaky ? topKFeatures(X, y, all, k) : null;
  const foldR2: number[] = [];
  const points: HeldOut[] = [];
  for (let f = 0; f < folds; f++) {
    const testRows: number[] = [];
    for (let i = bounds[f]; i < bounds[f + 1]; i++) testRows.push(i);
    const testSet = new Set(testRows);
    const trainRows = all.filter((i) => !testSet.has(i));
    const cols = globalCols ?? topKFeatures(X, y, trainRows, k);
    const fold = fitFold(X, y, trainRows, testRows, cols);
    foldR2.push(fold.r2);
    points.push(...fold.points);
  }
  return { foldR2, meanR2: foldR2.reduce((s, v) => s + v, 0) / folds, points };
}
