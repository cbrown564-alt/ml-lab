/**
 * Logistic regression — the workhorse of binary classification. A linear score
 * z = b + w₁x₁ + w₂x₂ is squashed by the sigmoid into a probability, and the model
 * is fit by gradient descent on the log-loss (cross-entropy). The decision boundary
 * is the line where the probability crosses ½. Verified against scipy's MLE.
 */

export type LabeledPoint = { x1: number; x2: number; y: 0 | 1 };
export type LogisticParams = { b: number; w1: number; w2: number };

export const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));

export const score = (p: LogisticParams, x1: number, x2: number): number =>
  p.b + p.w1 * x1 + p.w2 * x2;

export const proba = (p: LogisticParams, x1: number, x2: number): number =>
  sigmoid(score(p, x1, x2));

/** Mean cross-entropy (optionally L2-penalised on the weights, not the bias). */
export function logLoss(points: LabeledPoint[], p: LogisticParams, l2 = 0): number {
  if (points.length === 0) return 0;
  let s = 0;
  for (const pt of points) {
    const q = Math.min(1 - 1e-12, Math.max(1e-12, proba(p, pt.x1, pt.x2)));
    s += -(pt.y * Math.log(q) + (1 - pt.y) * Math.log(1 - q));
  }
  return s / points.length + 0.5 * l2 * (p.w1 ** 2 + p.w2 ** 2);
}

export const accuracy = (points: LabeledPoint[], p: LogisticParams): number =>
  points.length === 0
    ? 0
    : points.reduce((n, pt) => n + ((proba(p, pt.x1, pt.x2) >= 0.5 ? 1 : 0) === pt.y ? 1 : 0), 0) /
      points.length;

/** The decision boundary as a function of x₁: the x₂ where the score is 0 (p = ½). */
export const boundaryX2 = (p: LogisticParams, x1: number): number =>
  p.w2 === 0 ? NaN : -(p.b + p.w1 * x1) / p.w2;

export type LogisticStep = { step: number; params: LogisticParams; loss: number };

export type LogisticDescent = {
  step: () => void;
  run: (n: number) => void;
  readonly current: LogisticStep;
  readonly trace: ReadonlyArray<LogisticStep>;
};

/** A step-able gradient descent on the log-loss, so the exhibit can animate the
 * boundary swinging into place. Gradient of mean NLL: (1/n) Σ (σ(z)-y)·x. */
export function createLogisticDescent(
  points: LabeledPoint[],
  opts: { lr?: number; l2?: number; init?: LogisticParams } = {},
): LogisticDescent {
  const lr = opts.lr ?? 0.3;
  const l2 = opts.l2 ?? 1e-3;
  let params = opts.init ?? { b: 0, w1: 0, w2: 0 };
  const trace: LogisticStep[] = [{ step: 0, params, loss: logLoss(points, params, l2) }];

  const step = () => {
    const n = points.length || 1;
    let gb = 0;
    let g1 = 0;
    let g2 = 0;
    for (const pt of points) {
      const e = proba(params, pt.x1, pt.x2) - pt.y;
      gb += e;
      g1 += e * pt.x1;
      g2 += e * pt.x2;
    }
    params = {
      b: params.b - lr * (gb / n),
      w1: params.w1 - lr * (g1 / n + l2 * params.w1),
      w2: params.w2 - lr * (g2 / n + l2 * params.w2),
    };
    trace.push({ step: trace.length, params, loss: logLoss(points, params, l2) });
  };

  return {
    step,
    run: (k: number) => {
      for (let i = 0; i < k; i++) step();
    },
    get current() {
      return trace[trace.length - 1];
    },
    get trace() {
      return trace;
    },
  };
}

/** Fit to (near) convergence and return the final parameters. */
export function fitLogistic(
  points: LabeledPoint[],
  opts: { steps?: number; lr?: number; l2?: number } = {},
): LogisticParams {
  const run = createLogisticDescent(points, opts);
  run.run(opts.steps ?? 4000);
  return run.current.params;
}

/**
 * The general version: logistic regression over an arbitrary feature vector (each row
 * already includes a leading 1 for the bias). This is what lets a linear classifier
 * draw a curved boundary — feed it engineered features like x₁² or x₁x₂ and the
 * straight line in the expanded space becomes a curve in the original.
 */
export const dot = (w: number[], x: number[]): number => {
  let s = 0;
  for (let i = 0; i < w.length; i++) s += w[i] * x[i];
  return s;
};
export const probaVec = (w: number[], x: number[]): number => sigmoid(dot(w, x));

export function logLossVec(rows: number[][], y: number[], w: number[]): number {
  if (rows.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < rows.length; i++) {
    const q = Math.min(1 - 1e-12, Math.max(1e-12, probaVec(w, rows[i])));
    s += -(y[i] * Math.log(q) + (1 - y[i]) * Math.log(1 - q));
  }
  return s / rows.length;
}

export const accuracyVec = (rows: number[][], y: number[], w: number[]): number =>
  rows.length === 0
    ? 0
    : rows.reduce((n, r, i) => n + ((probaVec(w, r) >= 0.5 ? 1 : 0) === y[i] ? 1 : 0), 0) / rows.length;

/** Fit logistic regression over feature-vector rows (with a leading-1 bias column).
 * L2 penalises every weight but the bias. Returns the final weight vector. */
export function fitLogisticVec(
  rows: number[][],
  y: number[],
  opts: { steps?: number; lr?: number; l2?: number } = {},
): number[] {
  const lr = opts.lr ?? 0.3;
  const l2 = opts.l2 ?? 1e-3;
  const d = rows[0]?.length ?? 0;
  let w = new Array<number>(d).fill(0);
  const n = rows.length || 1;
  const steps = opts.steps ?? 4000;
  for (let t = 0; t < steps; t++) {
    const g = new Array<number>(d).fill(0);
    for (let i = 0; i < rows.length; i++) {
      const e = probaVec(w, rows[i]) - y[i];
      for (let j = 0; j < d; j++) g[j] += e * rows[i][j];
    }
    w = w.map((wj, j) => wj - lr * (g[j] / n + (j === 0 ? 0 : l2 * wj)));
  }
  return w;
}
