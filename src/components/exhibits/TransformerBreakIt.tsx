"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { NextTokenLogits, PrefixStrip } from "@/components/viz/NextTokenLogits";
import { StatGrid } from "@/components/viz/StatGrid";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { transformerState } from "@/lib/models/transformer";
import { tokens } from "@content/exhibits/the-transformer/experiment";

type Mode = "residual" | "temperature";

export function TransformerBreakIt() {
  const [mode, setMode] = useState<Mode>("residual");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Which transformer failure to trigger"
          className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
        >
          {([
            ["No residual", "residual"],
            ["Hot decode", "temperature"],
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
          {mode === "residual"
            ? "failure ① — skip path off, confidence drops"
            : "failure ② — hot softmax, flat decode"}
        </p>
      </div>
      {mode === "residual" ? <ResidualLoop /> : <TemperatureLoop />}
    </div>
  );
}

function ResidualLoop() {
  const [broken, setBroken] = useState(true);

  useEffect(() => {
    if (broken) reportTaskEvent("the-transformer:no-residual");
  }, [broken]);

  const healthy = transformerState(1, 1, 5, { residualEnabled: true });
  const state = useMemo(
    () => transformerState(1, 1, 5, { residualEnabled: !broken }),
    [broken],
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Guidance
          tone={broken ? "broken" : "ready"}
          kicker={broken ? "Symptom · confidence drop" : "Trigger it"}
          body={
            broken ? (
              <>
                With residuals off, P(mat) falls from{" "}
                <span className="font-mono tabular-nums text-[var(--viz-error-ink)]">
                  {healthy.targetProb.toFixed(3)}
                </span>{" "}
                to{" "}
                <span className="font-mono tabular-nums text-[var(--viz-error-ink)]">
                  {state.targetProb.toFixed(3)}
                </span>
                — the block overwrites instead of refining.
              </>
            ) : (
              "Residual paths restored — mat leads again on the committed logits."
            )
          }
          foot={
            broken ? (
              <>
                <span className="font-medium text-ink">Repair:</span> add skip connections around attention and FFN.
              </>
            ) : undefined
          }
        />
        <button
          type="button"
          onClick={() => setBroken((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {broken ? "Repair · residuals on" : "Break · residuals off"}
        </button>
        <StatGrid
          direction="col"
          stats={[
            {
              label: "P(mat)",
              value: state.targetProb.toFixed(3),
              hue: broken ? "var(--viz-error-ink)" : "var(--viz-prediction-ink)",
              note: broken ? "collapsed" : "healthy",
            },
          ]}
        />
      </div>
      <div className="flex flex-col gap-4">
        <PrefixStrip tokens={tokens} predictIndex={4} width={560} />
        <NextTokenLogits
          distribution={state.distribution}
          targetId={state.target.id}
          width={560}
          ariaLabel={broken ? "No-residual next-token distribution flattened." : "Healthy distribution with mat leading."}
        />
      </div>
    </div>
  );
}

function TemperatureLoop() {
  const [hot, setHot] = useState(true);
  const cold = useMemo(() => transformerState(1, 1, 5), []);
  const state = useMemo(() => transformerState(1, hot ? 2.5 : 1, 5), [hot]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Guidance
          tone={hot ? "broken" : "ready"}
          kicker={hot ? "Symptom · flat decode" : "Cool softmax"}
          body={
            hot ? (
              <>
                Temperature 2.5 shrinks mat&apos;s lead from{" "}
                <span className="font-mono tabular-nums text-[var(--viz-error-ink)]">
                  {cold.targetProb.toFixed(3)}
                </span>{" "}
                to{" "}
                <span className="font-mono tabular-nums text-[var(--viz-error-ink)]">
                  {state.targetProb.toFixed(3)}
                </span>
                — unlikely tokens look plausible at sample time.
              </>
            ) : (
              "Temperature 1 restores the sharp peak the LM head produced."
            )
          }
        />
        <button
          type="button"
          onClick={() => setHot((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {hot ? "Repair · temperature 1" : "Break · temperature 2.5"}
        </button>
        <StatGrid
          direction="col"
          stats={[
            {
              label: "T",
              value: hot ? "2.5" : "1.0",
              hue: hot ? "var(--viz-error-ink)" : "var(--viz-truth-ink)",
              note: "decode",
            },
          ]}
        />
      </div>
      <NextTokenLogits
        distribution={state.distribution}
        targetId={state.target.id}
        width={560}
        ariaLabel="Next-token distribution under hot or cold temperature."
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
