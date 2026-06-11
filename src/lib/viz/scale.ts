/**
 * Minimal linear scales for the visualization kit. Hand-rolled rather than
 * pulling d3-scale: the kit needs exactly this much, and the experiment
 * engine budget (docs/06, C6) treats every dependency as guilty until proven
 * necessary.
 */

export type LinearScale = {
  (value: number): number;
  invert(pixel: number): number;
  domain: [number, number];
  range: [number, number];
  ticks(count?: number): number[];
};

export function linearScale(domain: [number, number], range: [number, number]): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0 || 1;

  const scale = ((value: number) => r0 + ((value - d0) / dSpan) * (r1 - r0)) as LinearScale;
  scale.invert = (pixel: number) => d0 + ((pixel - r0) / (r1 - r0 || 1)) * dSpan;
  scale.domain = domain;
  scale.range = range;
  scale.ticks = (count = 5) => niceTicks(d0, d1, count);
  return scale;
}

/** Tick values at friendly intervals (1/2/5 × 10^n) covering [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) return [min];
  const span = max - min;
  const rawStep = span / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.abs(v) < step * 1e-9 ? 0 : Number(v.toFixed(12)));
  }
  return ticks;
}
