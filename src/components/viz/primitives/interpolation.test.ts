import { describe, expect, it } from "vitest";
import {
  clamp01,
  lerp,
  lerpRecord,
  reversibleProgress,
} from "./interpolation";

describe("interpolation helpers", () => {
  it("clamp01 pins to [0, 1]", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(2)).toBe(1);
  });

  it("lerp blends endpoints", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it("lerpRecord merges keyed numeric states", () => {
    const mid = lerpRecord({ a: 0, b: 10 }, { a: 10, b: 0 }, 0.5);
    expect(mid).toEqual({ a: 5, b: 5 });
  });

  it("reversibleProgress mirrors scrub direction", () => {
    expect(reversibleProgress(0.25, "forward")).toBe(0.25);
    expect(reversibleProgress(0.25, "reverse")).toBe(0.75);
  });
});
