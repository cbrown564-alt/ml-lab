import { describe, expect, it } from "vitest";
import { accuracy, forward, gradient, initNet, logLoss, train, type Net, type Sample } from "@/lib/models/neural-net";
import { breakTest, breakTrain, NN_LR } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * The network's maths must be exact (so what trains on screen is real) and it must
 * actually learn a shape a straight line can't — XOR. We check backprop against finite
 * differences and confirm an MLP drives XOR loss down to high accuracy.
 */

// A small noisy XOR: class 1 in quadrants where x1·x2 > 0, class 0 otherwise.
function xor(n: number, seed: number): Sample[] {
  let s = seed | 0;
  const rng = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: n }, () => {
    const x1 = (rng() - 0.5) * 4;
    const x2 = (rng() - 0.5) * 4;
    return { x1, x2, y: (x1 * x2 > 0 ? 1 : 0) as 0 | 1 };
  });
}

const clone = (net: Net): Net => ({ W1: net.W1.map((w) => [...w]), b1: [...net.b1], W2: [...net.W2], b2: net.b2 });

describe("neural network", () => {
  it("backprop matches finite differences", () => {
    const data = xor(24, 5);
    const net = initNet(4, 2);
    const g = gradient(net, data);
    const h = 1e-5;
    const fd = (mutate: (n: Net, d: number) => void) => {
      const up = clone(net);
      mutate(up, h);
      const down = clone(net);
      mutate(down, -h);
      return (logLoss(up, data) - logLoss(down, data)) / (2 * h);
    };
    // a representative spread of weights across both layers
    expect(fd((n, d) => (n.W1[0][0] += d))).toBeCloseTo(g.W1[0][0], 5);
    expect(fd((n, d) => (n.W1[2][1] += d))).toBeCloseTo(g.W1[2][1], 5);
    expect(fd((n, d) => (n.b1[1] += d))).toBeCloseTo(g.b1[1], 5);
    expect(fd((n, d) => (n.W2[3] += d))).toBeCloseTo(g.W2[3], 5);
    expect(fd((n, d) => (n.b2 += d))).toBeCloseTo(g.b2, 5);
  });

  it("learns XOR — a shape no straight line can separate", () => {
    const data = xor(120, 7);
    const net = initNet(6, 3);
    const before = accuracy(net, data);
    const { net: trained, losses } = train(net, data, 0.5, 600);
    expect(losses[losses.length - 1]).toBeLessThan(losses[0]); // loss fell
    expect(accuracy(trained, data)).toBeGreaterThan(0.9); // and it solved XOR
    expect(accuracy(trained, data)).toBeGreaterThan(before);
  });

  it("too much capacity overfits — a big net fits train better but generalises worse", () => {
    const small = train(initNet(4, 3), breakTrain, NN_LR, 1500).net;
    const big = train(initNet(32, 3), breakTrain, NN_LR, 1500).net;
    const gap = (n: Net) => accuracy(n, breakTrain) - accuracy(n, breakTest);
    // the big net memorises noisy train points (higher train accuracy)…
    expect(accuracy(big, breakTrain)).toBeGreaterThan(accuracy(small, breakTrain));
    // …but pays for it on held-out data — a much wider train-test gap
    expect(gap(big)).toBeGreaterThan(gap(small) + 0.1);
    expect(accuracy(big, breakTest)).toBeLessThan(accuracy(small, breakTest));
  });

  it("forward output is a probability in (0,1)", () => {
    const net = initNet(3, 1);
    for (const [x1, x2] of [[0, 0], [2, -1], [-1.5, 1.5]]) {
      const { y } = forward(net, x1, x2);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(1);
    }
  });
});
