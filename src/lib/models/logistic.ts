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
