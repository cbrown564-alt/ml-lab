"use client";

import { useEffect, useRef } from "react";
import { useActHandoffFrame } from "@/components/exhibits/ActHandoffContext";
import { Axes, FitLine, Plot, usePlot } from "@/components/viz/Plot";
import { PointRowLink } from "@/components/viz/primitives/PointRowLink";
import {
  PortalView,
  RepresentationPortal,
  useRepresentationPortal,
} from "@/components/viz/primitives/RepresentationPortal";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { olsFit } from "@/lib/models/linear-regression";
import { COLUMNS, houses, theDatasetScenario, toPoints, type House } from "@content/exhibits/the-dataset/experiment";
import type { TheDatasetFrame } from "@content/exhibits/the-dataset/spine";

/**
 * A dataset made tangible: the same twelve houses as a table and as a scatter, linked.
 * Hover a row and its point lights up; hover a point and its row does — the table and the
 * plot are one matrix seen two ways.
 */
const FIT = olsFit(toPoints(houses));
const DEMO_ID = 5;

function HousePoints() {
  const { x, y } = usePlot();
  const { activeEntityId, setActiveEntityId, isHighlighted } = useRepresentationPortal();
  const highlighted = activeEntityId ? houses.find((h) => String(h.id) === activeEntityId) : null;

  return (
    <g>
      {highlighted && (
        <PointRowLink
          point={[x(highlighted.size), y(highlighted.price)]}
          card={[x(highlighted.size) + 44, y(highlighted.price) - 44]}
          kicker={`row #${highlighted.id}`}
          lines={[`${highlighted.size} m² · €${highlighted.price}k`]}
          tone="accent"
        />
      )}
      {houses.map((h) => {
        const on = isHighlighted(String(h.id));
        return (
          <g key={h.id}>
            <circle
              cx={x(h.size)}
              cy={y(h.price)}
              r={on ? 8 : 5}
              fill={on ? "var(--accent)" : "var(--viz-truth)"}
              stroke="var(--surface-bg)"
              strokeWidth={1.5}
              pointerEvents="none"
            />
            <circle
              cx={x(h.size)}
              cy={y(h.price)}
              r={13}
              fill="transparent"
              className="cursor-pointer"
              onPointerEnter={() => {
                whenHydrated(() => useLearner.getState().recordPractice("the-dataset"));
                setActiveEntityId(String(h.id));
              }}
              onPointerLeave={() => setActiveEntityId(null)}
            />
          </g>
        );
      })}
    </g>
  );
}

function HouseTable() {
  const { setActiveEntityId, isHighlighted } = useRepresentationPortal();

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="bg-sunken text-left font-mono text-[11px] tracking-wide text-ink-faint uppercase">
            <th className="px-3 py-2 font-normal">#</th>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-2 font-normal ${c.kind === "target" ? "text-[var(--viz-truth-ink)]" : ""}`}
              >
                {c.label}
                <span className="ml-1 text-ink-faint">· {c.kind}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {houses.map((h: House) => (
            <tr
              key={h.id}
              className={`cursor-pointer border-t border-line transition-colors ${isHighlighted(String(h.id)) ? "bg-accent/10" : "hover:bg-sunken"}`}
              onMouseEnter={() => {
                whenHydrated(() => useLearner.getState().recordPractice("the-dataset"));
                setActiveEntityId(String(h.id));
              }}
              onMouseLeave={() => setActiveEntityId(null)}
            >
              <td className="px-3 py-1.5 font-mono text-ink-faint">{h.id}</td>
              <td className="px-3 py-1.5">{h.size}</td>
              <td className="px-3 py-1.5">{h.bedrooms}</td>
              <td className="px-3 py-1.5 font-medium text-[var(--viz-truth-ink)]">{h.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TheDatasetLabInner() {
  const storyFrame = useActHandoffFrame<TheDatasetFrame>();
  const appliedHandoff = useRef(false);
  const { setActiveEntityId } = useRepresentationPortal();

  useEffect(() => {
    if (appliedHandoff.current || !storyFrame) return;
    appliedHandoff.current = true;
    if (storyFrame.highlight === "row") setActiveEntityId(String(DEMO_ID));
  }, [storyFrame, setActiveEntityId]);

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{theDatasetScenario.prompt}</p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <Row label="rows" value={`${houses.length} examples`} hue="var(--viz-prediction-ink)" note="one house each" />
            <Row label="feature columns" value="size, beds" hue="var(--viz-neutral-ink)" note="the inputs the model may use" />
            <Row label="target column" value="price" hue="var(--viz-truth-ink)" note="the answer it learns to predict" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:mt-0">
          <PortalView label="scatter · size vs price">
            <Plot
              width={520}
              height={300}
              xDomain={[35, 130]}
              yDomain={[60, 320]}
              ariaLabel={`A scatter of house size against price for ${houses.length} houses, with the least-squares trend line. Each point is one row of the table.`}
            >
              <Axes />
              <FitLine params={FIT} />
              <HousePoints />
            </Plot>
          </PortalView>
          <PortalView label="table · the matrix">
            <HouseTable />
          </PortalView>
        </div>
      </div>
    </div>
  );
}

export function TheDatasetLab() {
  return (
    <RepresentationPortal>
      <TheDatasetLabInner />
    </RepresentationPortal>
  );
}

function Row({ label, value, hue, note }: { label: string; value: string; hue: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-sunken px-3 py-2">
      <div>
        <p className="font-mono text-[11px] tracking-wide text-ink-faint uppercase">{label}</p>
        <p className="text-xs text-ink-faint">{note}</p>
      </div>
      <span className="font-mono text-sm" style={{ color: hue }}>
        {value}
      </span>
    </div>
  );
}
