import type { Point } from "@/lib/models/linear-regression";

/**
 * Polynomial regression with ridge (L2) regularisation — the model behind both
 * bias–variance and regularisation. We fit y ≈ w₀ + w₁x + w₂x² + … + w_d xᵈ by
 * minimising the squared error plus λ·Σ_{j≥1} wⱼ² (the intercept is never
 * penalised). Closed form: (XᵀX + λD) w = Xᵀy, solved by Gaussian elimination —
 * no matrix library, the kit stays dependency-free. Verified against numpy.
 */

export type Poly = number[]; // [w0, w1, ..., wd]

/** Design-matrix row for a single x: [1, x, x², …, xᵈ]. */
export function vandermondeRow(x: number, degree: number): number[] {
  const row = new Array<number>(degree + 1);
  let p = 1;
  for (let j = 0; j <= degree; j++) {
    row[j] = p;
    p *= x;
  }
  return row;
}

/** Solve A·x = b for a small symmetric system (Gaussian elimination, partial
 * pivot). A is n×n row-major; returns x of length n. */
export function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  // Augmented copy.
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // Partial pivot.
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    const diag = M[col][col] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col] / diag;
      for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1e-12));
}

/** Fit a degree-`degree` polynomial with ridge penalty λ (intercept unpenalised). */
export function ridgeFit(points: Point[], degree: number, lambda: number): Poly {
  const d = degree + 1;
  // Normal equations XᵀX + λD, Xᵀy.
  const XtX = Array.from({ length: d }, () => new Array<number>(d).fill(0));
  const Xty = new Array<number>(d).fill(0);
  for (const p of points) {
    const row = vandermondeRow(p.x, degree);
    for (let i = 0; i < d; i++) {
      Xty[i] += row[i] * p.y;
      for (let j = 0; j < d; j++) XtX[i][j] += row[i] * row[j];
    }
  }
  for (let j = 1; j < d; j++) XtX[j][j] += lambda; // penalise all but the intercept
  return solveLinear(XtX, Xty);
}

export const predictPoly = (w: Poly, x: number): number =>
  vandermondeRow(x, w.length - 1).reduce((s, v, j) => s + v * w[j], 0);

/** Mean squared error of a polynomial fit over a set of points. */
export const polyMSE = (points: Point[], w: Poly): number =>
  points.length === 0
    ? 0
    : points.reduce((s, p) => s + (p.y - predictPoly(w, p.x)) ** 2, 0) / points.length;

/**
 * Ridge on a **Chebyshev** basis — the numerically honest way to do polynomial
 * ridge. The raw powers xʲ are nearly collinear, so their Gram matrix is
 * desperately ill-conditioned and the overfit hides in a sliver of λ near zero.
 * Chebyshev polynomials Tₖ on x∈[−1,1] are nearly orthogonal over a spread of
 * points, so the Gram matrix is well-conditioned and λ has an honest O(1) scale:
 * a tiny λ overfits, a moderate λ reins it in, a large λ underfits. Used by the
 * regularisation exhibit so its penalty knob means something.
 */
export function chebyshevRow(x: number, degree: number): number[] {
  const t = 2 * x - 1; // map [0,1] → [−1,1]
  const row: number[] = [1];
  if (degree >= 1) row.push(t);
  for (let k = 2; k <= degree; k++) row.push(2 * t * row[k - 1] - row[k - 2]);
  return row;
}

export type ChebModel = { weights: number[]; degree: number };

export function ridgeFitCheb(points: Point[], degree: number, lambda: number): ChebModel {
  const d = degree + 1;
  const G = Array.from({ length: d }, () => new Array<number>(d).fill(0));
  const Gy = new Array<number>(d).fill(0);
  for (const p of points) {
    const row = chebyshevRow(p.x, degree);
    for (let i = 0; i < d; i++) {
      Gy[i] += row[i] * p.y;
      for (let k = 0; k < d; k++) G[i][k] += row[i] * row[k];
    }
  }
  for (let j = 1; j < d; j++) G[j][j] += lambda; // T₀ (the constant) is unpenalised
  return { weights: solveLinear(G, Gy), degree };
}

export const predictCheb = (m: ChebModel, x: number): number =>
  chebyshevRow(x, m.degree).reduce((s, v, j) => s + v * m.weights[j], 0);

export const chebMSE = (points: Point[], m: ChebModel): number =>
  points.length === 0
    ? 0
    : points.reduce((s, p) => s + (p.y - predictCheb(m, p.x)) ** 2, 0) / points.length;
