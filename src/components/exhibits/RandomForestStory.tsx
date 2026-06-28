"use client";

import { useMemo } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { StatGrid } from "@/components/viz/StatGrid";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { RandomForestFrame } from "@content/exhibits/random-forests/spine";
import { predictProbaTree } from "@/lib/models/decision-tree";
import { boundaryRoughness, forestAccuracy, forestProba } from "@/lib/models/random-forest";
import {
  FULL_FOREST,
  forestDomain,
  forestPoints,
  forestTestPoints,
} from "@content/exhibits/random-forests/experiment";

/**
 * The See-it graphic: the forest's averaged vote at the crowd size the active beat
 * asserts — one jagged tree at nTrees 1, blurring into a smooth boundary as the crowd
 * grows. Beneath it, three member trees show the disagreement averaging feeds on: each
 * is its own private jagged staircase, yet their mean is clean. Object constancy — the
 * same moons throughout, the same three members, only the crowd around them grows.
 */
const MEMBERS = [FULL_FOREST[0], FULL_FOREST[1], FULL_FOREST[2]];

export function RandomForestStory() {
  const frame = useActiveFrame<RandomForestFrame>();
  const k = Math.max(1, Math.min(frame?.nTrees ?? 30, FULL_FOREST.length));

  const crowd = useMemo(() => FULL_FOREST.slice(0, k), [k]);
  const predict = useMemo(() => (x1: number, x2: number) => forestProba(crowd, x1, x2), [crowd]);
  const acc = useMemo(() => forestAccuracy(forestTestPoints, crowd), [crowd]);
  const rough = useMemo(() => boundaryRoughness(predict, forestDomain), [predict]);

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {k === 1 ? "One tree — a jagged staircase" : `${k} trees, averaged — the vote smooths`}
      </figcaption>

      <DecisionField
        points={forestPoints}
        predictProba={predict}
        domain={forestDomain}
        width={560}
        height={340}
        label={`The averaged vote of ${k} decision tree${k === 1 ? "" : "s"} on the two moons; ${Math.round(
          acc * 100,
        )}% accurate on held-out data. ${k === 1 ? "A single jagged staircase." : "Their disagreement blurs into a smooth boundary."}`}
      />

      <div>
        <p className="mb-1.5 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Three of the members — each disagrees
        </p>
        <div className="grid grid-cols-3 gap-2">
          {MEMBERS.map((tree, i) => (
            <DecisionField
              key={i}
              points={forestPoints}
              predictProba={(x1, x2) => predictProbaTree(tree, x1, x2)}
              domain={forestDomain}
              width={180}
              height={150}
              label={`Member tree ${i + 1}: its own jagged boundary, different from the others.`}
            />
          ))}
        </div>
      </div>

      <StatGrid
        caption="The crowd's verdict"
        stats={[
          {
            label: "held-out",
            value: `${Math.round(acc * 100)}%`,
            hue: "var(--accent)",
            note: k === 1 ? "one tree alone" : "steadier than any member",
          },
          {
            label: "boundary roughness",
            value: rough.toFixed(2),
            hue: "var(--viz-param)",
            note: "falls as the crowd grows",
          },
          { label: "trees", value: `${k}`, hue: "var(--ink-muted)", note: "averaged into one vote" },
        ]}
      />
    </figure>
  );
}
