/**
 * Regression-task data: a relatable continuous target (study hours → exam score) the
 * learner predicts by hand. A handful of shown examples to reason from, plus query
 * points whose score is hidden until "reveal" — so the learner *is* the model, predicting
 * a continuous quantity and seeing the error as distance. The same target, split at the
 * median, also poses the classification version (above/below) — the contrast that defines
 * what a regression task is.
 */

export type Example = { x: number; y: number };

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The underlying trend a good model would learn — score ≈ 36 + 6·hours. */
export const regressionTrend = (x: number) => 36 + 6 * x;
const TRUE = regressionTrend;
const clamp = (v: number) => Math.max(0, Math.min(100, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

const build = () => {
  const rng = mulberry32(7);
  const xs = [0.6, 1.4, 2.2, 3.1, 4.0, 4.8, 5.7, 6.6, 7.4, 8.3, 9.1, 9.8];
  const all = xs.map((x) => ({ x, y: clamp(round1(TRUE(x) + (rng() - 0.5) * 14)) }));
  // Every third point (from the 2nd) is a held-out query the learner predicts.
  const queries: Example[] = [];
  const shown: Example[] = [];
  all.forEach((p, i) => (i % 3 === 1 ? queries : shown).push(p));
  return { shown, queries };
};

const { shown, queries } = build();

export const shownExamples: Example[] = shown;
export const queryPoints: Example[] = queries;
export const allExamples: Example[] = [...shown, ...queries].sort((a, b) => a.x - b.x);

/** The median score across all examples — the split that turns this into a yes/no
 * classification task ("did they pass?"). */
export const PASS_LINE = (() => {
  const ys = [...shown, ...queries].map((p) => p.y).sort((a, b) => a - b);
  return Math.round(ys[Math.floor(ys.length / 2)]);
})();

export const X_LABEL = "study hours";
export const Y_LABEL = "exam score";

export const regressionTaskScenario = {
  id: "be-the-model",
  title: "Be the model",
  prompt:
    "Here are students' study hours and exam scores. For a new student you're told only their hours — predict the score. Drag your prediction, then reveal the truth and read the error as a distance. Do it for each query; the total distance is your loss, the very thing a regression model exists to make small.",
};
