import { describe, expect, it } from "vitest";
import fixture from "@/lib/models/fixtures/pca.json";
import {
  centerAndScale,
  fitPCA,
  project,
  reconstruct,
  reconstructionError,
  type PCAProjection,
  type Point2D,
} from "@/lib/models/pca";

const points = fixture.points as Point2D[];
const referenceProjections = fixture.projections as PCAProjection[];

describe("PCA vs scikit-learn fixture", () => {
  it("uses the fixture's centering and scaling stats", () => {
    const scaled = centerAndScale(points);
    expect(scaled.mean.x1).toBeCloseTo(fixture.mean.x1, 10);
    expect(scaled.mean.x2).toBeCloseTo(fixture.mean.x2, 10);
    expect(scaled.scale.x1).toBeCloseTo(fixture.scale.x1, 10);
    expect(scaled.scale.x2).toBeCloseTo(fixture.scale.x2, 10);
  });

  it("matches scikit-learn's principal directions and explained variance", () => {
    const fit = fitPCA(points);
    fixture.components.forEach((component, index) => {
      expect(fit.components[index].x1).toBeCloseTo(component.vector.x1, 4);
      expect(fit.components[index].x2).toBeCloseTo(component.vector.x2, 4);
      expect(fit.explainedVarianceRatio[index]).toBeCloseTo(
        component.explainedVarianceRatio,
        4,
      );
    });
  });

  it("reproduces the fixture's projections and 1D reconstruction loss", () => {
    const fit = fitPCA(points);
    const projections = project(points, fit.components, fit);
    projections.forEach((projection, index) => {
      expect(Math.abs(projection.pc1 - referenceProjections[index].pc1)).toBeLessThan(1e-3);
      expect(Math.abs(projection.pc2 - referenceProjections[index].pc2)).toBeLessThan(1e-3);
    });

    const oneDimensional = reconstruct(projections, fit.components, fit, 1);
    const twoDimensional = reconstruct(projections, fit.components, fit, 2);
    expect(reconstructionError(points, oneDimensional, fit)).toBeCloseTo(
      fixture.reconstructionError1D,
      4,
    );
    expect(reconstructionError(points, twoDimensional, fit)).toBeCloseTo(0, 10);
  });
});
