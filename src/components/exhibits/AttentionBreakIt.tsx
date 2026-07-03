"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AttentionHeatmap, ValueMixBar } from "@/components/viz/AttentionHeatmap";
import { StatGrid } from "@/components/viz/StatGrid";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import {
  attentionTokens,
  frozenRowLogits,
  headById,
  headState,
  uniformLogits,
} from "@/lib/models/attention";

type Mode = "uniform" | "frozen";

export function AttentionBreakIt() {
  const [mode, setMode] = useState<Mode>("uniform");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Which attention failure to trigger"
          className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
        >
          {([
            ["Uniform", "uniform"],
            ["Frozen row", "frozen"],
          ] as const).map(([label, value]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-3.5 py-1 transition-colors ${
                mode === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] text-ink-faint">
          {mode === "uniform"
            ? "failure ① — flat softmax, no focus"
            : "failure ② — queries ignored"}
        </p>
      </div>
      {mode === "uniform" ? <UniformLoop /> : <FrozenLoop />}
    </div>
  );
}

function UniformLoop() {
  const [broken, setBroken] = useState(true);
  const queryIndex = 2;
  const head = headById.get("syntax")!;

  useEffect(() => {
    if (broken) reportTaskEvent("attention:uniform");
  }, [broken]);

  const logits = broken ? uniformLogits(attentionTokens.length) : head.logits;
  const state = useMemo(
    () => headState("syntax", queryIndex, logits),
    [broken, logits],
  );
  const flatWeight = 1 / attentionTokens.length;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Guidance
          tone={broken ? "broken" : "ready"}
          kicker={broken ? "Symptom · flat weights" : "Trigger it"}
          body={
            broken ? (
              <>
                Uniform logits make every key weight{" "}
                <span className="font-mono tabular-nums text-[var(--viz-error-ink)]">
                  {flatWeight.toFixed(3)}
                </span>{" "}
                — sat cannot prefer cat over mat.
              </>
            ) : (
              "Learned logits restore content-dependent peaks — sat again routes to cat."
            )
          }
          foot={
            broken ? (
              <>
                <span className="font-medium text-ink">Repair:</span> restore distinct Q/K scores per query.
              </>
            ) : undefined
          }
        />
        <button
          type="button"
          onClick={() => setBroken((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {broken ? "Repair · learned logits" : "Break · uniform routing"}
        </button>
        <StatGrid
          direction="col"
          stats={[
            {
              label: "sat→cat",
              value: state.weights[queryIndex]?.[1]?.toFixed(3) ?? "—",
              hue: broken ? "var(--viz-error-ink)" : "var(--viz-prediction-ink)",
              note: broken ? "≈ uniform" : "syntax peak",
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-4">
        <AttentionHeatmap
          tokens={attentionTokens}
          weights={state.weights}
          queryIndex={queryIndex}
          highlightKeyIndex={broken ? undefined : 1}
          width={560}
          height={320}
          ariaLabel={
            broken
              ? "Uniform attention: sat row weights are flat."
              : "Repaired attention: sat peaks on cat."
          }
        />
        <ValueMixBar tokens={attentionTokens} weights={state.weights} queryIndex={queryIndex} width={560} />
      </div>
    </div>
  );
}

function FrozenLoop() {
  const queryIndex = 2;
  const head = headById.get("syntax")!;
  const [broken, setBroken] = useState(true);
  const frozen = frozenRowLogits(head.logits[0]!, attentionTokens.length);
  const logits = broken ? frozen : head.logits;
  const state = useMemo(
    () => headState("syntax", queryIndex, logits),
    [broken, logits],
  );
  const satRow = state.weights[queryIndex] ?? [];
  const catRow = state.weights[1] ?? [];
  const rowsMatch = satRow.every((weight, index) => Math.abs(weight - catRow[index]!) < 1e-6);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Guidance
          tone={broken ? "broken" : "ready"}
          kicker={broken ? "Symptom · queries ignored" : "Verify rows differ"}
          body={
            broken ? (
              <>
                Reusing the first row for every query makes sat and cat{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">identical routers</span> — the
                question no longer changes the mix.
              </>
            ) : (
              "Distinct query rows return — sat and cat receive different weight patterns again."
            )
          }
          foot={
            broken ? (
              <>
                <span className="font-medium text-ink">Repair:</span> compute scores per query token.
              </>
            ) : undefined
          }
        />
        <button
          type="button"
          onClick={() => setBroken((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {broken ? "Repair · per-query rows" : "Break · frozen row"}
        </button>
        <StatGrid
          direction="col"
          stats={[
            {
              label: "rows",
              value: rowsMatch ? "same" : "differ",
              hue: rowsMatch ? "var(--viz-error-ink)" : "var(--viz-prediction-ink)",
              note: "sat vs cat",
            },
          ]}
        />
      </div>
      <AttentionHeatmap
        tokens={attentionTokens}
        weights={state.weights}
        queryIndex={queryIndex}
        highlightKeyIndex={broken ? undefined : 1}
        width={560}
        height={320}
        ariaLabel="Frozen-row attention failure: query rows duplicated."
      />
    </div>
  );
}

function Guidance({
  tone,
  kicker,
  body,
  foot,
}: {
  tone: "ready" | "broken";
  kicker: string;
  body: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        tone === "broken"
          ? "border-[var(--viz-error)] bg-[color-mix(in_srgb,var(--viz-error)_8%,transparent)]"
          : "border-line bg-sunken"
      }`}
    >
      <p className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
      {foot ? <p className="mt-3 text-sm leading-relaxed text-ink-muted">{foot}</p> : null}
    </div>
  );
}
