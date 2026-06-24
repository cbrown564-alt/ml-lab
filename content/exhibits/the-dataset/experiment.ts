import type { Point } from "@/lib/models/linear-regression";

/**
 * A dataset as a matrix: each row is one example (a house), each column a feature, and
 * one column the target (price). The model only ever sees this table — so the table's
 * shape and quality are everything. We keep a clean set and a couple of corrupted rows
 * (a data-entry error and a sensor glitch) for the Break-it, where one bad row drags the
 * whole fitted trend.
 */
export type House = { id: number; size: number; bedrooms: number; price: number };

export type Column = { key: keyof Omit<House, "id">; label: string; kind: "feature" | "target" };
export const COLUMNS: Column[] = [
  { key: "size", label: "size (m²)", kind: "feature" },
  { key: "bedrooms", label: "beds", kind: "feature" },
  { key: "price", label: "price (£k)", kind: "target" },
];

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r = (v: number) => Math.round(v);

export const houses: House[] = (() => {
  const rng = mulberry32(8);
  return Array.from({ length: 12 }, (_, i) => {
    const size = r(45 + rng() * 75);
    const bedrooms = 1 + Math.floor(rng() * 4);
    const price = r(2.1 * size + 16 * bedrooms + (rng() - 0.5) * 40);
    return { id: i + 1, size, bedrooms, price };
  });
})();

/** One corrupted row for the Break-it: a data-entry slip — a 112 m² flat recorded as 12 m²
 * (a dropped digit), so the model sees a tiny home at a high price. High leverage at the
 * left edge, it alone flattens the whole trend. Visible on a [0,400] price axis. */
export const corruptedRows: House[] = [{ id: 13, size: 12, bedrooms: 2, price: 360 }];

/** The scatter view: size (feature) → price (target). */
export const toPoints = (rows: House[]): Point[] => rows.map((h) => ({ x: h.size, y: h.price }));

export const theDatasetScenario = {
  id: "the-matrix",
  title: "A dataset is a table",
  prompt:
    "This is the whole dataset — twelve houses, three columns. Two columns are features the model can use (size, beds); one is the target it learns to predict (price). Hover a row to find it in the scatter, or a point to find its row: the table and the plot are the same data, two ways. Each row is one example; the model never sees anything but this matrix.",
};
