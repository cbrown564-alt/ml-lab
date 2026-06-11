/**
 * Linear regression model layer — hand-rolled and step-able by design
 * (docs/02-architecture.md): every internal (gradients, loss, each descent
 * step) is exposed for visualization, and this is the same logic the
 * code-mode Python template mirrors. Verified against scikit-learn fixtures.
 */

export type Point = { x: number; y: number };
export type LinearParams = { slope: number; intercept: number };

export function predict(params: LinearParams, x: number): number {
  return params.slope * x + params.intercept;
}

export function residuals(points: Point[], params: LinearParams): number[] {
  return points.map((p) => p.y - predict(params, p.x));
}

/** Mean squared error — the loss surface every regression exhibit stands on. */
export function mse(points: Point[], params: LinearParams): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const r = p.y - predict(params, p.x);
    sum += r * r;
  }
  return sum / points.length;
}

/**
 * Closed-form ordinary least squares fit.
 * Degenerate x (zero variance) yields a horizontal line through the mean —
 * the least-wrong answer, and a teachable moment rather than a NaN.
 */
export function olsFit(points: Point[]): LinearParams {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let meanX = 0;
  let meanY = 0;
  for (const p of points) {
    meanX += p.x;
    meanY += p.y;
  }
  meanX /= n;
  meanY /= n;
  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    sxx += (p.x - meanX) * (p.x - meanX);
    sxy += (p.x - meanX) * (p.y - meanY);
  }
  if (sxx === 0) return { slope: 0, intercept: meanY };
  const slope = sxy / sxx;
  return { slope, intercept: meanY - slope * meanX };
}

/** Gradient of MSE with respect to slope and intercept. */
export function gradient(
  points: Point[],
  params: LinearParams,
): { dSlope: number; dIntercept: number } {
  const n = points.length;
  if (n === 0) return { dSlope: 0, dIntercept: 0 };
  let dSlope = 0;
  let dIntercept = 0;
  for (const p of points) {
    const r = predict(params, p.x) - p.y;
    dSlope += 2 * r * p.x;
    dIntercept += 2 * r;
  }
  return { dSlope: dSlope / n, dIntercept: dIntercept / n };
}

export type DescentStep = {
  step: number;
  params: LinearParams;
  loss: number;
  gradient: { dSlope: number; dIntercept: number };
};

export type GradientDescentOptions = {
  learningRate: number;
  initial?: LinearParams;
};

export type GradientDescentRun = {
  readonly current: DescentStep;
  readonly trace: ReadonlyArray<DescentStep>;
  step(): DescentStep;
  run(steps: number): DescentStep;
  reset(): DescentStep;
  setLearningRate(lr: number): void;
};

/**
 * A step-able gradient-descent run. The learner (and the visualization)
 * controls time: step, run, scrub the trace, change the learning rate
 * mid-descent and watch the consequences — including divergence, which is
 * a feature, not a bug (failure gallery material).
 */
export function createGradientDescent(
  points: Point[],
  options: GradientDescentOptions,
): GradientDescentRun {
  const initial: LinearParams = options.initial ?? { slope: 0, intercept: 0 };
  let learningRate = options.learningRate;

  const snapshot = (step: number, params: LinearParams): DescentStep => ({
    step,
    params,
    loss: mse(points, params),
    gradient: gradient(points, params),
  });

  let current = snapshot(0, initial);
  let trace: DescentStep[] = [current];

  return {
    get current() {
      return current;
    },
    get trace() {
      return trace;
    },
    step() {
      const g = current.gradient;
      const params: LinearParams = {
        slope: current.params.slope - learningRate * g.dSlope,
        intercept: current.params.intercept - learningRate * g.dIntercept,
      };
      current = snapshot(current.step + 1, params);
      trace.push(current);
      return current;
    },
    run(steps: number) {
      for (let i = 0; i < steps; i++) this.step();
      return current;
    },
    reset() {
      current = snapshot(0, initial);
      trace = [current];
      return current;
    },
    setLearningRate(lr: number) {
      learningRate = lr;
    },
  };
}
