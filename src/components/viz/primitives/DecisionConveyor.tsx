"use client";

import { useMemo } from "react";
import type { VizHue } from "@/lib/exhibit/spine";
import { hueInk, hueMark, MOTION_MOVE, usePrefersReducedMotion } from "./shared";

export type ConveyorItem = {
  id: string;
  score: number;
  actualPositive: boolean;
};

export type ConveyorMetrics = {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
};

type BinKind = "tp" | "fp" | "fn" | "tn";

/**
 * CONNECT/CARRY — Decision conveyor (visual-standards audit).
 *
 * Observations cross a decision threshold and sort into TP/FP/FN/TN bins;
 * confusion-matrix metrics update in lockstep with the sort.
 */
export function DecisionConveyor({
  items,
  threshold,
  metrics,
  width = 520,
  ariaLabel,
}: {
  items: ConveyorItem[];
  threshold: number;
  metrics: ConveyorMetrics;
  width?: number;
  ariaLabel: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const bins = useMemo(() => classifyItems(items, threshold), [items, threshold]);

  return (
    <div className="flex flex-col gap-4" aria-label={ariaLabel}>
      <div className="relative overflow-hidden rounded-lg border border-line bg-raised" style={{ width }}>
        <div
          className="absolute inset-y-4 left-1/2 w-0.5 -translate-x-1/2"
          style={{ background: "var(--viz-neutral)" }}
          aria-hidden
        />
        <span
          className="absolute top-2 left-1/2 -translate-x-1/2 rounded bg-raised px-2 py-0.5 font-mono text-[9px] tracking-wider text-ink-faint uppercase"
        >
          threshold {threshold.toFixed(2)}
        </span>
        <div className="grid grid-cols-2 gap-3 p-4 pt-8">
          <ConveyorBin kind="tp" items={bins.tp} reduceMotion={reduceMotion} />
          <ConveyorBin kind="fp" items={bins.fp} reduceMotion={reduceMotion} />
          <ConveyorBin kind="fn" items={bins.fn} reduceMotion={reduceMotion} />
          <ConveyorBin kind="tn" items={bins.tn} reduceMotion={reduceMotion} />
        </div>
      </div>
      <dl className="grid grid-cols-4 gap-2 rounded-lg border border-line divide-x divide-line overflow-hidden">
        {(["tp", "fp", "fn", "tn"] as const).map((kind) => (
          <div key={kind} className="px-3 py-2 text-center">
            <dt className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
              {kind}
            </dt>
            <dd
              className="mt-1 font-mono text-lg tabular-nums"
              style={{ color: binInk(kind) }}
            >
              {metrics[kind]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function classifyItems(
  items: ConveyorItem[],
  threshold: number,
): Record<BinKind, ConveyorItem[]> {
  const out: Record<BinKind, ConveyorItem[]> = {
    tp: [],
    fp: [],
    fn: [],
    tn: [],
  };
  for (const item of items) {
    const predicted = item.score >= threshold;
    const kind: BinKind =
      item.actualPositive && predicted
        ? "tp"
        : !item.actualPositive && predicted
          ? "fp"
          : item.actualPositive && !predicted
            ? "fn"
            : "tn";
    out[kind].push(item);
  }
  return out;
}

function binHue(kind: BinKind): VizHue {
  switch (kind) {
    case "tp":
      return "prediction";
    case "tn":
      return "truth";
    case "fp":
    case "fn":
      return "error";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function binInk(kind: BinKind): string {
  return hueInk(binHue(kind));
}

function binLabel(kind: BinKind): string {
  switch (kind) {
    case "tp":
      return "true positive";
    case "fp":
      return "false positive";
    case "fn":
      return "false negative";
    case "tn":
      return "true negative";
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function ConveyorBin({
  kind,
  items,
  reduceMotion,
}: {
  kind: BinKind;
  items: ConveyorItem[];
  reduceMotion: boolean;
}) {
  const mark = hueMark(binHue(kind));
  return (
    <div
      className="min-h-[72px] rounded-md border border-dashed p-2"
      style={{
        borderColor: mark,
        background: `color-mix(in oklab, ${mark} 6%, var(--surface-raised))`,
      }}
      aria-label={binLabel(kind)}
    >
      <p className="mb-2 font-mono text-[9px] tracking-wider uppercase" style={{ color: binInk(kind) }}>
        {kind}
      </p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span
            key={item.id}
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: mark,
              opacity: 0.85,
              transition: reduceMotion ? undefined : `transform ${MOTION_MOVE}`,
              transform: reduceMotion ? undefined : `translateY(${i * 2}px)`,
            }}
            title={`score ${item.score.toFixed(2)}`}
          />
        ))}
      </div>
    </div>
  );
}
