import type { ParamDef } from "@/lib/experiment/spec";
import { assignLabels, inertia, type Centroid, type ClusterPoint } from "@/lib/models/k-means";
import fixtures from "@/lib/models/fixtures/k-means.json";

export type BlobPoint = ClusterPoint & { label: number };
export type PrecomputedClusters = {
  k: number;
  inertia: number;
  centroids: Centroid[];
  labels: number[];
};

export type LloydIteration = {
  centroids: Centroid[];
  labels: number[];
  inertia: number;
};

/**
 * k-means experiment data. Three clean blobs with no labels shown to the learner: k=3 is
 * the honest grouping, k=2 visibly merges two natural groups, and k=5 starts inventing
 * extra centroids inside real blobs. All committed numbers come from the shared sklearn
 * fixture the model layer verifies against.
 */
export const kMeansPoints = fixtures.points as BlobPoint[];
export const kMeansDomain = fixtures.domain as [number, number];
export const kMeansYDomain = fixtures.yDomain as [number, number];

export const kChoices = [2, 3, 5] as const;
export const kParam: ParamDef = {
  id: "k",
  label: "Clusters (k)",
  hint: "How many centroids the algorithm is allowed to place. Here the honest answer is k = 3.",
  min: 0,
  max: kChoices.length - 1,
  step: 1,
  default: 1,
};

export const byK = fixtures.byK as PrecomputedClusters[];
export const byKMap = new Map(byK.map((row) => [row.k, row]));

export const goodK = byKMap.get(3)!;
export const wrongK = byKMap.get(2)!;
export const tooManyK = byKMap.get(5)!;

export const badInitK2 = fixtures.badInitK2 as {
  init: Centroid[];
  labels: number[];
  centroids: Centroid[];
  inertia: number;
};

export const initialK3Centroids: Centroid[] = [kMeansPoints[0], kMeansPoints[40], kMeansPoints[80]].map(
  ({ x1, x2 }) => ({ x1, x2 }),
);

const plainPoints: ClusterPoint[] = kMeansPoints.map(({ x1, x2 }) => ({ x1, x2 }));
const initialLabels = assignLabels(plainPoints, initialK3Centroids);

/** The stepped Lloyd loop shown in Story and Run it. This dataset settles in one update,
 * so step 0 is the deliberate start and step 1 is the converged solution. */
export const iterations: LloydIteration[] = [
  {
    centroids: initialK3Centroids,
    labels: initialLabels,
    inertia: inertia(plainPoints, initialLabels, initialK3Centroids),
  },
  ...(fixtures.iterations as LloydIteration[]),
];

export const stepParam: ParamDef = {
  id: "step",
  label: "Lloyd step",
  hint: "Assign to the nearest centroid, average each cluster, repeat. On these clean blobs, one update is enough.",
  min: 0,
  max: iterations.length - 1,
  step: 1,
  default: iterations.length - 1,
};

export const kAtIndex = (index: number): (typeof kChoices)[number] =>
  kChoices[Math.max(0, Math.min(kChoices.length - 1, index))];

export const stateForK = (k: (typeof kChoices)[number], step = iterations.length - 1): LloydIteration =>
  k === 3 ? iterations[Math.max(0, Math.min(iterations.length - 1, step))] : byKMap.get(k)!;

export const kMeansScenario = {
  id: "three-blobs",
  title: "Three blobs, one honest k",
  prompt:
    "No labels — just points. Drag k and watch the plane partition into nearest-centroid regions. At k = 3 each blob gets its own centre; at k = 2 two natural groups are forced to share one; at k = 5 the algorithm starts inventing extra centres inside real blobs.",
};
