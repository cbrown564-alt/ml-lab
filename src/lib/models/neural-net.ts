/**
 * A tiny neural network — two inputs, one hidden layer of tanh units, a sigmoid output —
 * trained by backpropagation. Small enough to read every weight, expressive enough to
 * learn shapes a single neuron (a straight line) never can. The whole point of the
 * exhibit: stacking simple units with a nonlinearity between them bends the decision
 * boundary into arbitrary curves. The maths here is exact (analytic backprop, checked
 * against finite differences), so what the learner watches train is the real thing.
 */

export type Net = {
  /** hidden weights: W1[j] = [w_x1, w_x2] for hidden unit j */
  W1: number[][];
  b1: number[];
  /** output weights: one per hidden unit */
  W2: number[];
  b2: number;
};

export type Sample = { x1: number; x2: number; y: 0 | 1 };

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh network with `hidden` tanh units, small random weights (seeded). */
export function initNet(hidden: number, seed = 1): Net {
  const rng = mulberry32(seed);
  const rand = () => (rng() - 0.5) * 2; // [-1, 1]
  return {
    W1: Array.from({ length: hidden }, () => [rand(), rand()]),
    b1: Array.from({ length: hidden }, () => rand() * 0.5),
    W2: Array.from({ length: hidden }, () => rand()),
    b2: rand() * 0.5,
  };
}

/** Forward pass; returns the hidden activations and the output probability. */
export function forward(net: Net, x1: number, x2: number): { h: number[]; y: number } {
  const h = net.W1.map((w, j) => Math.tanh(w[0] * x1 + w[1] * x2 + net.b1[j]));
  const z2 = h.reduce((s, hj, j) => s + net.W2[j] * hj, net.b2);
  return { h, y: sigmoid(z2) };
}

/** P(class 1 | x) — the override DecisionField needs to draw a curved boundary. */
export const predictProba = (net: Net, x1: number, x2: number): number => forward(net, x1, x2).y;

const EPS = 1e-9;
const clamp01 = (p: number) => Math.min(1 - EPS, Math.max(EPS, p));

/** Mean cross-entropy loss over the data. */
export function logLoss(net: Net, data: Sample[]): number {
  if (data.length === 0) return 0;
  let s = 0;
  for (const d of data) {
    const p = clamp01(forward(net, d.x1, d.x2).y);
    s += -(d.y * Math.log(p) + (1 - d.y) * Math.log(1 - p));
  }
  return s / data.length;
}

export function accuracy(net: Net, data: Sample[]): number {
  if (data.length === 0) return 0;
  return data.filter((d) => (forward(net, d.x1, d.x2).y >= 0.5 ? 1 : 0) === d.y).length / data.length;
}

/** Analytic gradient of the mean log-loss w.r.t. every weight, by backpropagation. */
export function gradient(net: Net, data: Sample[]): Net {
  const H = net.W2.length;
  const gW1 = net.W1.map(() => [0, 0]);
  const gb1 = net.b1.map(() => 0);
  const gW2 = net.W2.map(() => 0);
  let gb2 = 0;

  for (const d of data) {
    const { h, y } = forward(net, d.x1, d.x2);
    const dz2 = y - d.y; // dLoss/dz2 for sigmoid + cross-entropy
    for (let j = 0; j < H; j++) {
      gW2[j] += dz2 * h[j];
      const dh = dz2 * net.W2[j];
      const dz1 = dh * (1 - h[j] * h[j]); // tanh'
      gW1[j][0] += dz1 * d.x1;
      gW1[j][1] += dz1 * d.x2;
      gb1[j] += dz1;
    }
    gb2 += dz2;
  }
  const n = data.length || 1;
  return {
    W1: gW1.map((g) => [g[0] / n, g[1] / n]),
    b1: gb1.map((g) => g / n),
    W2: gW2.map((g) => g / n),
    b2: gb2 / n,
  };
}

/** One gradient-descent step (returns a new net). */
export function step(net: Net, data: Sample[], lr: number): Net {
  const g = gradient(net, data);
  return {
    W1: net.W1.map((w, j) => [w[0] - lr * g.W1[j][0], w[1] - lr * g.W1[j][1]]),
    b1: net.b1.map((b, j) => b - lr * g.b1[j]),
    W2: net.W2.map((w, j) => w - lr * g.W2[j]),
    b2: net.b2 - lr * g.b2,
  };
}

/** Train for `epochs` full-batch steps, returning the final net and its loss history. */
export function train(net: Net, data: Sample[], lr: number, epochs: number): { net: Net; losses: number[] } {
  let cur = net;
  const losses = [logLoss(cur, data)];
  for (let e = 0; e < epochs; e++) {
    cur = step(cur, data, lr);
    losses.push(logLoss(cur, data));
  }
  return { net: cur, losses };
}
