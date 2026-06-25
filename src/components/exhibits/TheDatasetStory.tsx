"use client";

import { Axes, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { TheDatasetFrame } from "@content/exhibits/the-dataset/spine";
import { olsFit } from "@/lib/models/linear-regression";
import { COLUMNS, houses, toPoints } from "@content/exhibits/the-dataset/experiment";

/**
 * The See-it graphic: the data matrix as a table beside its scatter, highlighted one way
 * per beat — a single example (a row and its point), the feature-vs-target columns, then
 * the whole matrix linked to the plot.
 */
const FIT = olsFit(toPoints(houses));
const DEMO_ID = 5; // the example highlighted on the "row" beat

function StoryPoints({ rowMode, highlight }: { rowMode: boolean; highlight: TheDatasetFrame["highlight"] }) {
  const { x, y } = usePlot();
  const demo = houses.find((h) => h.id === DEMO_ID);
  return (
    <g>
      {highlight === "row" && demo && (
        <g aria-hidden>
          <line
            x1={x(demo.size)}
            y1={y(demo.price)}
            x2={x(demo.size) + 36}
            y2={y(demo.price) - 24}
            stroke="var(--accent)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <rect x={x(demo.size) + 38} y={y(demo.price) - 38} width={100} height={32} rx={4} fill="var(--surface-bg)" stroke="var(--accent)" strokeWidth={1} />
          <text x={x(demo.size) + 44} y={y(demo.price) - 24} fontSize={9} fontFamily="var(--font-mono)" fill="var(--accent)">row #{demo.id}</text>
          <text x={x(demo.size) + 44} y={y(demo.price) - 14} fontSize={9} fontFamily="var(--font-mono)" fill="var(--ink-muted)">{demo.size} m² · €{demo.price}k</text>
        </g>
      )}
      {houses.map((h) => {
        const on = rowMode && h.id === DEMO_ID;
        return <circle key={h.id} cx={x(h.size)} cy={y(h.price)} r={on ? 8 : 5} fill={on ? "var(--accent)" : "var(--viz-truth)"} stroke="var(--surface-bg)" strokeWidth={1.5} />;
      })}
    </g>
  );
}

export function TheDatasetStory() {
  const frame = useActiveFrame<TheDatasetFrame>();
  const highlight = frame?.highlight ?? "row";
  const caption =
    highlight === "columns" ? "Columns — features vs the target" : highlight === "matrix" ? "The matrix — all the model sees" : "One row — one example";

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{caption}</figcaption>
      <Plot width={520} height={260} xDomain={[35, 130]} yDomain={[60, 320]} ariaLabel={`Size vs price for ${houses.length} houses with the trend line; ${caption}.`}>
        <Axes />
        <FitLine params={FIT} />
        <StoryPoints rowMode={highlight === "row"} highlight={highlight} />
      </Plot>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="bg-sunken text-left font-mono text-[11px] tracking-wide text-ink-faint uppercase">
              <th className="px-3 py-2 font-normal">#</th>
              {COLUMNS.map((c) => {
                const lit = highlight === "columns" && (c.kind === "target" || c.kind === "feature");
                return (
                  <th key={c.key} className={`px-3 py-2 font-normal ${lit && c.kind === "target" ? "bg-[var(--viz-truth)]/15 text-[var(--viz-truth-ink)]" : lit ? "bg-[var(--viz-neutral)]/10" : ""}`}>
                    {c.label}
                    {highlight === "columns" && <span className="ml-1 text-ink-faint">· {c.kind}</span>}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {houses.slice(0, 6).map((h) => (
              <tr key={h.id} className={`border-t border-line ${highlight === "row" && h.id === DEMO_ID ? "bg-accent/10" : ""}`}>
                <td className="px-3 py-1.5 font-mono text-ink-faint">{h.id}</td>
                <td className="px-3 py-1.5">{h.size}</td>
                <td className="px-3 py-1.5">{h.bedrooms}</td>
                <td className="px-3 py-1.5 font-medium text-[var(--viz-truth-ink)]">{h.price}</td>
              </tr>
            ))}
            <tr className="border-t border-line text-ink-faint">
              <td className="px-3 py-1.5 font-mono" colSpan={4}>
                … {houses.length - 6} more rows
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </figure>
  );
}
