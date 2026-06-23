import { describe, expect, it } from "vitest";
import { olsFit } from "@/lib/models/linear-regression";
import { corruptedRows, houses, toPoints } from "@content/exhibits/the-dataset/experiment";

/**
 * The dataset's quality is the result's quality: one corrupted row (a £2,480k price typo)
 * drags the least-squares trend well away from the clean fit. The model can't tell a typo
 * from a fact — it fits whatever rows it's given.
 */
describe("the-dataset: data quality", () => {
  it("one corrupted row materially drags the fitted slope", () => {
    const clean = olsFit(toPoints(houses));
    const dirty = olsFit(toPoints([...houses, corruptedRows[0]]));
    // a single 10× price outlier shifts the slope by a large fraction of itself
    expect(Math.abs(dirty.slope - clean.slope)).toBeGreaterThan(Math.abs(clean.slope) * 0.5);
  });

  it("a clean fit recovers a sensible price-per-m² slope", () => {
    const clean = olsFit(toPoints(houses));
    expect(clean.slope).toBeGreaterThan(1); // price rises with size
    expect(clean.slope).toBeLessThan(4);
  });
});
