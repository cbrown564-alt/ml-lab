import { describe, expect, it } from "vitest";
import fixtures from "@/lib/models/fixtures/k-means.json";
import {
  assignLabels,
  inertia,
  kMeansStep,
  runKMeans,
  updateCentroids,
  type Centroid,
  type ClusterPoint,
} from "@/lib/models/k-means";

type FixturePoint = ClusterPoint & { label: number };

const points = fixtures.points as FixturePoint[];
const plainPoints: ClusterPoint[] = points.map(({ x1, x2 }) => ({ x1, x2 }));
const byK3 = fixtures.byK.find((row) => row.k === 3)!;
const byK2 = fixtures.byK.find((row) => row.k === 2)!;

const samePartition = (a: number[], b: number[]): boolean => {
  const map = new Map<number, number>();
  const reverse = new Map<number, number>();
  for (let i = 0; i < a.length; i++) {
    const seen = map.get(a[i]);
    if (seen == null) map.set(a[i], b[i]);
    else if (seen !== b[i]) return false;
    const back = reverse.get(b[i]);
    if (back == null) reverse.set(b[i], a[i]);
    else if (back !== a[i]) return false;
  }
  return true;
};

describe("k-means vs scikit-learn fixture", () => {
  it("matches sklearn's k=3 labels and inertia", () => {
    const centroids = updateCentroids(plainPoints, byK3.labels, 3);
    const labels = assignLabels(plainPoints, centroids);

    expect(labels).toEqual(byK3.labels);
    expect(inertia(plainPoints, labels, centroids)).toBeCloseTo(byK3.inertia, 6);

    const rounded = centroids.map((c) => ({
      x1: Number(c.x1.toFixed(3)),
      x2: Number(c.x2.toFixed(3)),
    }));
    expect(rounded).toEqual(byK3.centroids);
  });

  it("one Lloyd step from the committed k=3 start lands on the committed centroids", () => {
    const init = [points[0], points[40], points[80]].map(({ x1, x2 }) => ({ x1, x2 }));
    const step = kMeansStep(plainPoints, init);
    const expected = fixtures.iterations[0];

    expect(step.labels).toEqual(expected.labels);
    expect(step.inertia).toBeCloseTo(expected.inertia, 6);
    expect(
      step.centroids.map((c) => ({ x1: Number(c.x1.toFixed(3)), x2: Number(c.x2.toFixed(3)) })),
    ).toEqual(expected.centroids);
  });

  it("runKMeans reproduces the committed bad-init repair for k=2", () => {
    const result = runKMeans(plainPoints, fixtures.badInitK2.init, { maxSteps: 12 });

    expect(result.converged).toBe(true);
    expect(result.labels).toEqual(fixtures.badInitK2.labels);
    expect(result.inertia).toBeCloseTo(fixtures.badInitK2.inertia, 6);
    expect(
      result.centroids.map((c) => ({
        x1: Number(c.x1.toFixed(3)),
        x2: Number(c.x2.toFixed(3)),
      })),
    ).toEqual(fixtures.badInitK2.centroids);

    // The bad start repairs to the same final partition as the honest k=2 optimum,
    // modulo the arbitrary cluster-id ordering.
    const relabelled = assignLabels(plainPoints, result.centroids);
    expect(samePartition(relabelled, byK2.labels)).toBe(true);
  });
});

describe("cluster updates", () => {
  it("keeps an empty centroid at its fallback position", () => {
    const sample: ClusterPoint[] = [
      { x1: 0, x2: 0 },
      { x1: 2, x2: 2 },
    ];
    const labels = [0, 0];
    const fallback: Centroid[] = [
      { x1: 0, x2: 0 },
      { x1: 10, x2: 10 },
    ];

    expect(updateCentroids(sample, labels, 2, fallback)).toEqual([
      { x1: 1, x2: 1 },
      { x1: 10, x2: 10 },
    ]);
  });
});
