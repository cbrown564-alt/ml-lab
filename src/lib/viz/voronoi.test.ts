import { describe, expect, it } from "vitest";
import { boundedVoronoiCell, boundedVoronoiCells } from "./voronoi";

describe("boundedVoronoiCell", () => {
  it("partitions a rectangle into three cells for three sites", () => {
    const sites = [
      { x: -2, y: 0 },
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ];
    const bounds = { x0: -4, x1: 4, y0: -2, y1: 2 };
    const cells = boundedVoronoiCells(sites, bounds);
    expect(cells).toHaveLength(3);
    for (const cell of cells) {
      expect(cell.length).toBeGreaterThanOrEqual(3);
    }
  });
});
