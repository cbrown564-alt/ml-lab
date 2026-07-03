"use client";

import { useMemo, useState } from "react";
import { NextTokenLogits, PrefixStrip } from "@/components/viz/NextTokenLogits";
import { StatGrid } from "@/components/viz/StatGrid";
import { TransformerBlockFlow } from "@/components/viz/TransformerBlockFlow";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  blockAt,
  blockParam,
  stageAt,
  stageParam,
  stages,
  temperatureAt,
  temperatureParam,
  tokens,
  transformerLabState,
  transformerScenario,
} from "@content/exhibits/the-transformer/experiment";

export function TransformerLab() {
  const [blockIndex, setBlockIndex] = useState(blockParam.default);
  const [temperatureTimesTen, setTemperatureTimesTen] = useState(Math.round(temperatureParam.default * 10));
  const [stageIndex, setStageIndex] = useState(stageParam.default);
  const state = useMemo(
    () => transformerLabState(blockIndex, temperatureTimesTen, stageIndex),
    [blockIndex, stageIndex, temperatureTimesTen],
  );

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{transformerScenario.prompt}</p>
          <PrefixStrip tokens={tokens} predictIndex={4} />

          <div className="flex flex-col gap-4 rounded-lg border border-line bg-sunken p-4">
            <Slider
              id="transformer-blocks"
              label={blockParam.label}
              value={blockIndex}
              display={blockAt(blockIndex)}
              min={blockParam.min}
              max={blockParam.max}
              step={blockParam.step}
              hint={blockParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("the-transformer"));
                setBlockIndex(value);
              }}
            />
            <Slider
              id="transformer-temperature"
              label={temperatureParam.label}
              value={temperatureTimesTen}
              display={temperatureAt(temperatureTimesTen / 10)}
              min={Math.round(temperatureParam.min * 10)}
              max={Math.round(temperatureParam.max * 10)}
              step={1}
              hint={temperatureParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("the-transformer"));
                setTemperatureTimesTen(value);
              }}
            />
            <Slider
              id="transformer-stage"
              label={stageParam.label}
              value={stageIndex}
              display={stageAt(stageIndex)}
              min={stageParam.min}
              max={stageParam.max}
              step={stageParam.step}
              hint={stageParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("the-transformer"));
                setStageIndex(value);
              }}
            />
          </div>

          <StatGrid
            direction="col"
            caption={`Peak: ${state.top.candidate.label} · margin ${(
              state.top.prob -
              [...state.distribution].sort((a, b) => b.prob - a.prob)[1]!.prob
            ).toFixed(3)}`}
            stats={[
              {
                label: "P(mat)",
                value: state.targetProb.toFixed(3),
                hue: "var(--viz-prediction-ink)",
                note: "target",
              },
              {
                label: "stage",
                value: state.stage.label,
                hue: "var(--viz-param-ink)",
                note: state.stage.id,
              },
            ]}
          />
        </div>

        <div className="mt-6 flex h-full flex-col gap-5 lg:mt-0">
          <TransformerBlockFlow
            stages={stages}
            activeStageId={state.stage.id}
            blockCount={state.blockCount}
            width={1280}
            ariaLabel={`Transformer lab at stage ${state.stage.label}.`}
          />
          <div className="rounded-lg border border-line bg-sunken p-4">
            <p className="mb-3 font-mono text-[10px] tracking-widest text-ink-faint uppercase">
              Next token · after the LM head
            </p>
            <NextTokenLogits
              distribution={state.distribution}
              targetId={state.target.id}
              width={1280}
              size="lg"
              ariaLabel="Next-token distribution from the language-model head."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
      <p className="text-xs leading-relaxed text-ink-faint">{hint}</p>
    </div>
  );
}
