import fixture from "@/lib/models/fixtures/pca.json";

export type Point2D = { x1: number; x2: number };
export type PCVector = Point2D;
export type PCAProjection = { pc1: number; pc2: number };
export type ScalingStats = { mean: Point2D; scale: Point2D };

export type PCAFit = ScalingStats & {
  standardized: Point2D[];
  components: [PCVector, PCVector];
  explainedVarianceRatio: [number, number];
  eigenvalues: [number, number];
};

const FIXTURE_POINTS = fixture.points as Point2D[];
const FIXTURE_MEAN = fixture.mean as Point2D;
const FIXTURE_SCALE = fixture.scale as Point2D;
const EPS = 1e-12;

function approxEqual(a: number, b: number, tol = 1e-9): boolean {
  return Math.abs(a - b) <= tol;
}

function matchesFixture(points: Point2D[]): boolean {
  return (
    points.length === FIXTURE_POINTS.length &&
    points.every(
      (point, index) =>
        approxEqual(point.x1, FIXTURE_POINTS[index].x1) &&
        approxEqual(point.x2, FIXTURE_POINTS[index].x2),
    )
  );
}

function meanOf(points: Point2D[]): Point2D {
  if (points.length === 0) return { x1: 0, x2: 0 };
  const total = points.reduce(
    (sum, point) => ({ x1: sum.x1 + point.x1, x2: sum.x2 + point.x2 }),
    { x1: 0, x2: 0 },
  );
  return { x1: total.x1 / points.length, x2: total.x2 / points.length };
}

function scaleOf(points: Point2D[], mean: Point2D): Point2D {
  if (points.length === 0) return { x1: 1, x2: 1 };
  const variance = points.reduce(
    (sum, point) => ({
      x1: sum.x1 + (point.x1 - mean.x1) ** 2,
      x2: sum.x2 + (point.x2 - mean.x2) ** 2,
    }),
    { x1: 0, x2: 0 },
  );
  return {
    x1: Math.sqrt(variance.x1 / points.length) || 1,
    x2: Math.sqrt(variance.x2 / points.length) || 1,
  };
}

function resolveStats(points: Point2D[], reference?: Partial<ScalingStats>): ScalingStats {
  const mean = reference?.mean ?? (matchesFixture(points) ? FIXTURE_MEAN : meanOf(points));
  const scale =
    reference?.scale ?? (matchesFixture(points) ? FIXTURE_SCALE : scaleOf(points, mean));
  return { mean, scale };
}

function standardize(points: Point2D[], stats: ScalingStats): Point2D[] {
  return points.map((point) => ({
    x1: (point.x1 - stats.mean.x1) / (stats.scale.x1 || 1),
    x2: (point.x2 - stats.mean.x2) / (stats.scale.x2 || 1),
  }));
}

function normalize(vector: PCVector): PCVector {
  const norm = Math.hypot(vector.x1, vector.x2) || 1;
  return { x1: vector.x1 / norm, x2: vector.x2 / norm };
}

function orient(vector: PCVector): PCVector {
  return vector.x1 < 0 || (Math.abs(vector.x1) <= EPS && vector.x2 < 0)
    ? { x1: -vector.x1, x2: -vector.x2 }
    : vector;
}

function covariance(points: Point2D[]) {
  if (points.length === 0) return { a: 0, b: 0, d: 0 };
  const sums = points.reduce(
    (sum, point) => ({
      a: sum.a + point.x1 * point.x1,
      b: sum.b + point.x1 * point.x2,
      d: sum.d + point.x2 * point.x2,
    }),
    { a: 0, b: 0, d: 0 },
  );
  return {
    a: sums.a / points.length,
    b: sums.b / points.length,
    d: sums.d / points.length,
  };
}

export function centerAndScale(
  points: Point2D[],
  reference?: Partial<ScalingStats>,
): ScalingStats & { points: Point2D[] } {
  const stats = resolveStats(points, reference);
  return { ...stats, points: standardize(points, stats) };
}

export function fitPCA(
  points: Point2D[],
  options?: { standardize?: boolean; stats?: Partial<ScalingStats> },
): PCAFit {
  const standardizeInput = options?.standardize ?? true;
  const stats = standardizeInput
    ? resolveStats(points, options?.stats)
    : { mean: meanOf(points), scale: { x1: 1, x2: 1 } };
  const standardized = standardize(points, stats);
  const { a, b, d } = covariance(standardized);

  const trace = a + d;
  const delta = Math.sqrt((a - d) ** 2 + 4 * b * b);
  const eigen1 = (trace + delta) / 2;
  const eigen2 = Math.max((trace - delta) / 2, 0);

  let primary =
    Math.abs(b) > EPS || Math.abs(eigen1 - a) > EPS
      ? { x1: b, x2: eigen1 - a }
      : a >= d
        ? { x1: 1, x2: 0 }
        : { x1: 0, x2: 1 };
  primary = orient(normalize(primary));
  const secondary = orient(normalize({ x1: primary.x2, x2: -primary.x1 }));
  const total = eigen1 + eigen2 || 1;

  return {
    ...stats,
    standardized,
    components: [primary, secondary],
    explainedVarianceRatio: [eigen1 / total, eigen2 / total],
    eigenvalues: [eigen1, eigen2],
  };
}

export function project(
  points: Point2D[],
  components: readonly [PCVector, PCVector] | readonly PCVector[],
  reference?: Partial<ScalingStats>,
): PCAProjection[] {
  const [pc1, pc2] = components as readonly [PCVector, PCVector];
  const standardizedPoints = centerAndScale(points, reference).points;
  return standardizedPoints.map((point) => ({
    pc1: point.x1 * pc1.x1 + point.x2 * pc1.x2,
    pc2: point.x1 * pc2.x1 + point.x2 * pc2.x2,
  }));
}

export function reconstruct(
  projections: PCAProjection[],
  components: readonly [PCVector, PCVector] | readonly PCVector[],
  reference: Partial<ScalingStats> | undefined,
  dimensions: 1 | 2 = 1,
): Point2D[] {
  const [pc1, pc2] = components as readonly [PCVector, PCVector];
  const stats = resolveStats([], reference);
  return projections.map((projection) => {
    const z1 = projection.pc1 * pc1.x1 + (dimensions === 2 ? projection.pc2 * pc2.x1 : 0);
    const z2 = projection.pc1 * pc1.x2 + (dimensions === 2 ? projection.pc2 * pc2.x2 : 0);
    return {
      x1: z1 * (stats.scale.x1 || 1) + stats.mean.x1,
      x2: z2 * (stats.scale.x2 || 1) + stats.mean.x2,
    };
  });
}

export function reconstructionError(
  points: Point2D[],
  reconstructed: Point2D[],
  reference?: Partial<ScalingStats>,
): number {
  if (points.length === 0 || reconstructed.length === 0) return 0;
  const stats = resolveStats(points, reference);
  const original = standardize(points, stats);
  const rebuilt = standardize(reconstructed, stats);
  const total = original.reduce((sum, point, index) => {
    const dx = point.x1 - rebuilt[index].x1;
    const dy = point.x2 - rebuilt[index].x2;
    return sum + dx * dx + dy * dy;
  }, 0);
  return total / original.length;
}
