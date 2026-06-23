import { describe, expect, it } from "vitest";
import { ascend, gradient, magnitude, surface, unit } from "@/lib/models/gradient";

/**
 * The gradient's defining properties, checked numerically: the analytic gradient
 * matches finite differences, it points uphill (steepest ascent), and it is
 * perpendicular to the contour (moving across the gradient leaves the height unchanged).
 */
const POINTS = [
  { x: 0.3, y: 0.5 },
  { x: -1.0, y: -0.6 },
  { x: 1.5, y: -0.4 },
  { x: -0.2, y: 1.1 },
];

describe("the gradient", () => {
  it("the analytic gradient matches finite differences", () => {
    const h = 1e-5;
    for (const p of POINTS) {
      const gx = (surface(p.x + h, p.y) - surface(p.x - h, p.y)) / (2 * h);
      const gy = (surface(p.x, p.y + h) - surface(p.x, p.y - h)) / (2 * h);
      const grad = gradient(p.x, p.y);
      expect(grad.x).toBeCloseTo(gx, 5);
      expect(grad.y).toBeCloseTo(gy, 5);
    }
  });

  it("points uphill — a small step along it raises the surface", () => {
    const e = 1e-3;
    for (const p of POINTS) {
      const d = unit(gradient(p.x, p.y));
      expect(surface(p.x + e * d.x, p.y + e * d.y)).toBeGreaterThan(surface(p.x, p.y));
      // …and the opposite way (descent) lowers it
      expect(surface(p.x - e * d.x, p.y - e * d.y)).toBeLessThan(surface(p.x, p.y));
    }
  });

  it("is perpendicular to the contour — stepping across it leaves the height ~unchanged", () => {
    const e = 1e-3;
    for (const p of POINTS) {
      const d = unit(gradient(p.x, p.y));
      const perp = { x: -d.y, y: d.x }; // rotate 90°
      const along = surface(p.x + e * perp.x, p.y + e * perp.y);
      // first-order change along the contour is zero, so the height barely moves
      expect(Math.abs(along - surface(p.x, p.y))).toBeLessThan(1e-5);
    }
  });

  it("greedy ascent climbs the nearest hill, not the tallest — the local-max trap", () => {
    const small = ascend({ x: -1.7, y: -1.4 });
    const big = ascend({ x: 1.2, y: 0.9 });
    // they settle in genuinely different places
    expect(Math.hypot(small.settled.x - big.settled.x, small.settled.y - big.settled.y)).toBeGreaterThan(1.5);
    // the small-hill start is trapped at a strictly lower summit
    expect(surface(small.settled.x, small.settled.y)).toBeLessThan(surface(big.settled.x, big.settled.y));
    // …which is itself a stationary point — the gradient there has vanished
    expect(magnitude(gradient(small.settled.x, small.settled.y))).toBeLessThan(1e-2);
  });

  it("magnitude is the slope in the steepest direction", () => {
    const e = 1e-4;
    for (const p of POINTS) {
      const grad = gradient(p.x, p.y);
      const d = unit(grad);
      const slope = (surface(p.x + e * d.x, p.y + e * d.y) - surface(p.x, p.y)) / e;
      expect(slope).toBeCloseTo(magnitude(grad), 3);
    }
  });
});
