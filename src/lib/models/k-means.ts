/**
 * k-means clustering — the canonical unsupervised "group by nearness" algorithm.
 * With k centroids placed in the plane, each point joins its nearest centroid,
 * each centroid moves to the mean of the points assigned to it, and the two
 * steps repeat until nothing moves. The objective (inertia) is the within-cluster
 * sum of squared distances, exactly the quantity scikit-learn reports.
 */

export type ClusterPoint = { x1: number; x2: number };
export type Centroid = { x1: number; x2: number };

export type KMeansState = {
  labels: number[];
  centroids: Centroid[];
  inertia: number;
};

export type KMeansRun = KMeansState & {
  iterations: KMeansState[];
  converged: boolean;
};

const sqDist = (a: ClusterPoint, b: Centroid): number => {
  const dx = a.x1 - b.x1;
  const dy = a.x2 - b.x2;
  return dx * dx + dy * dy;
};

const centroidsEqual = (a: readonly Centroid[], b: readonly Centroid[], tolerance: number): boolean =>
  a.length === b.length &&
  a.every(
    (c, i) =>
      Math.abs(c.x1 - b[i].x1) <= tolerance && Math.abs(c.x2 - b[i].x2) <= tolerance,
  );

/** The E-step: give each point the label of its nearest centroid. Ties break to the
 * first centroid, matching numpy/scikit-learn's argmin convention. */
export function assignLabels(points: ClusterPoint[], centroids: Centroid[]): number[] {
  return points.map((point) => {
    let best = 0;
    let bestDist = sqDist(point, centroids[0]);
    for (let i = 1; i < centroids.length; i++) {
      const here = sqDist(point, centroids[i]);
      if (here < bestDist) {
        best = i;
        bestDist = here;
      }
    }
    return best;
  });
}

/** The M-step: move each centroid to the arithmetic mean of the points assigned to it.
 * If a cluster is empty, the optional fallback keeps its previous centroid in place. */
export function updateCentroids(
  points: ClusterPoint[],
  labels: number[],
  k: number,
  fallback: Centroid[] = [],
): Centroid[] {
  const sums = Array.from({ length: k }, () => ({ x1: 0, x2: 0, n: 0 }));
  for (let i = 0; i < points.length; i++) {
    const bucket = sums[labels[i]];
    bucket.x1 += points[i].x1;
    bucket.x2 += points[i].x2;
    bucket.n += 1;
  }
  return sums.map((bucket, j) =>
    bucket.n > 0
      ? { x1: bucket.x1 / bucket.n, x2: bucket.x2 / bucket.n }
      : (fallback[j] ?? { x1: 0, x2: 0 }),
  );
}

/** k-means objective (aka inertia): the within-cluster sum of squared distances. */
export function inertia(
  points: ClusterPoint[],
  labels: number[],
  centroids: Centroid[],
): number {
  let total = 0;
  for (let i = 0; i < points.length; i++) total += sqDist(points[i], centroids[labels[i]]);
  return total;
}

/** One Lloyd update: assign from the current centroids, then average into the next ones. */
export function kMeansStep(points: ClusterPoint[], centroids: Centroid[]): KMeansState {
  const labels = assignLabels(points, centroids);
  const nextCentroids = updateCentroids(points, labels, centroids.length, centroids);
  return {
    labels,
    centroids: nextCentroids,
    inertia: inertia(points, labels, nextCentroids),
  };
}

/** Run Lloyd's algorithm from a supplied initialisation until the centroids stop moving. */
export function runKMeans(
  points: ClusterPoint[],
  initialCentroids: Centroid[],
  opts: { maxSteps?: number; tolerance?: number } = {},
): KMeansRun {
  const maxSteps = opts.maxSteps ?? 100;
  const tolerance = opts.tolerance ?? 1e-12;
  let centroids = initialCentroids.map((c) => ({ ...c }));
  const iterations: KMeansState[] = [];

  for (let step = 0; step < maxSteps; step++) {
    const state = kMeansStep(points, centroids);
    iterations.push(state);
    if (centroidsEqual(centroids, state.centroids, tolerance)) {
      return { ...state, iterations, converged: true };
    }
    centroids = state.centroids;
  }

  const final = iterations[iterations.length - 1] ?? {
    labels: assignLabels(points, centroids),
    centroids,
    inertia: inertia(points, assignLabels(points, centroids), centroids),
  };
  return { ...final, iterations, converged: false };
}
