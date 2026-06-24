import { HUBER_DELTA, penaltyOf, type LossKind } from "@/lib/models/loss-functions";

/**
 * The three penalty shapes — the conceptual heart of the exhibit. Each judge
 * turns a miss r into a penalty: squared error r² shoots up quadratically (the
 * tails dominate, so far points rule), while absolute |r| and Huber grow only
 * linearly out there (a far point is just one more vote). Seeing the curves
 * diverge in the tail explains the whole behaviour before any line moves.
 */

const HUES: Record<LossKind, string> = {
  squared: "var(--viz-error)",
  absolute: "var(--viz-param)",
  huber: "var(--viz-prediction)",
};
const LABELS: Record<LossKind, string> = {
  squared: "squared",
  absolute: "absolute",
  huber: "Huber",
};
const ORDER: LossKind[] = ["squared", "absolute", "huber"];

export function LossShapes({
  selected,
  width = 320,
  height = 170,
}: {
  selected?: LossKind;
  width?: number;
  height?: number;
}) {
  const R = 5; // residual range shown: −5..5
  const PMAX = 10; // penalty axis cap (squared blows past it — that's the point)
  const m = { l: 8, r: 8, t: 14, b: 22 };
  const px = (r: number) => m.l + ((r + R) / (2 * R)) * (width - m.l - m.r);
  const py = (p: number) => height - m.b - (Math.min(p, PMAX) / PMAX) * (height - m.t - m.b);

  const path = (kind: LossKind) => {
    const pts: string[] = [];
    for (let r = -R; r <= R + 1e-9; r += 0.1) {
      pts.push(`${r === -R ? "M" : "L"} ${px(r).toFixed(1)} ${py(penaltyOf(kind, r)).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        How each judge scores a miss
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="The penalty each loss assigns a residual: squared error grows as the square (steep tails), absolute error and Huber grow linearly out in the tails." className="h-auto w-full">
        {/* baseline + zero tick */}
        <line x1={m.l} x2={width - m.r} y1={height - m.b} y2={height - m.b} stroke="var(--line)" />
        <line x1={px(0)} x2={px(0)} y1={m.t} y2={height - m.b} stroke="var(--line)" strokeOpacity={0.5} />
        <text x={px(0)} y={height - 7} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          miss r →
        </text>
        {/* δ markers where Huber switches from squared to linear */}
        {[-HUBER_DELTA, HUBER_DELTA].map((d) => (
          <line key={d} x1={px(d)} x2={px(d)} y1={m.t} y2={height - m.b} stroke="var(--viz-prediction)" strokeOpacity={0.25} strokeDasharray="2 3" />
        ))}
        {ORDER.map((kind) => {
          const on = !selected || selected === kind;
          return (
            <path
              key={kind}
              d={path(kind)}
              fill="none"
              stroke={HUES[kind]}
              strokeWidth={selected === kind ? 2.6 : 1.6}
              strokeOpacity={on ? 1 : 0.28}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {ORDER.map((kind) => {
          const dim = selected && selected !== kind;
          // De-emphasise a non-selected judge by fading its colour swatch and
          // dropping the label weight — never by dimming the label text, which
          // would push it under the 4.5:1 contrast floor.
          return (
            <span key={kind} className="inline-flex items-center gap-1.5 text-xs">
              <span className="inline-block h-[3px] w-4 rounded-full" style={{ background: HUES[kind], opacity: dim ? 0.45 : 1 }} />
              <span className={dim ? "text-ink" : "font-medium text-ink"}>{LABELS[kind]}</span>
            </span>
          );
        })}
      </div>
    </figure>
  );
}
