"use client";

import { useMemo, useState } from "react";
import { StatGrid } from "@/components/viz/StatGrid";
import { ConvField } from "@/components/viz/ConvField";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import {
  convParams,
  cnnsScenario,
  convState,
  fcParams,
  filterAt,
  filterChoices,
  filterParam,
  imageAt,
  imageChoices,
  imageParam,
  slideParam,
} from "@content/exhibits/cnns/experiment";

export function CnnsLab() {
  const [imageIndex, setImageIndex] = useState(imageParam.default);
  const [filterIndex, setFilterIndex] = useState(filterParam.default);
  const [slide, setSlide] = useState(slideParam.default);
  const state = useMemo(
    () => convState(imageIndex, filterIndex, slide),
    [filterIndex, imageIndex, slide],
  );

  const note =
    state.filterId === "vertical" && state.imageId === "horizontal-stripes"
      ? "Strong response — vertical edges in horizontal stripes."
      : state.filterId === "blur"
        ? "Smoothing — activations shrink toward local averages."
        : "Scrub the slide to see each output cell as one dot product.";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{cnnsScenario.prompt}</p>

          <div className="flex flex-col gap-4 rounded-lg border border-line bg-sunken p-4">
            <ChoiceSlider
              id="cnns-image"
              label={imageParam.label}
              value={imageIndex}
              display={imageChoices[imageIndex]!.label}
              min={imageParam.min}
              max={imageParam.max}
              step={imageParam.step}
              hint={imageParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("cnns"));
                setImageIndex(value);
              }}
            />
            <ChoiceSlider
              id="cnns-filter"
              label={filterParam.label}
              value={filterIndex}
              display={filterChoices[filterIndex]!.label}
              min={filterParam.min}
              max={filterParam.max}
              step={filterParam.step}
              hint={filterParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("cnns"));
                setFilterIndex(value);
              }}
            />
            <Slider
              id="cnns-slide"
              label={slideParam.label}
              value={slide}
              display={`(${state.row}, ${state.col})`}
              min={slideParam.min}
              max={slideParam.max}
              step={slideParam.step}
              hint={slideParam.hint ?? ""}
              onChange={(value) => {
                whenHydrated(() => useLearner.getState().recordPractice("cnns"));
                setSlide(value);
              }}
            />
          </div>

          <StatGrid
            direction="col"
            caption={note}
            stats={[
              {
                label: "output",
                value: state.outputValue.toFixed(2),
                hue: "var(--viz-prediction-ink)",
                note: `at (${state.row}, ${state.col})`,
              },
              {
                label: "mass",
                value: state.mass.toFixed(2),
                hue: "var(--viz-truth-ink)",
                note: "feature map energy",
              },
              {
                label: "FC vs conv",
                value: `${fcParams} / ${convParams}`,
                hue: "var(--viz-param-ink)",
                note: "weight count",
              },
            ]}
          />

          <figure>
            <figcaption className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
              Fixture readout
            </figcaption>
            <p className="text-sm leading-relaxed text-ink-muted">
              Image <span className="font-medium text-ink">{imageAt(imageIndex)}</span> · filter{" "}
              <span className="font-medium text-ink">{filterAt(filterIndex)}</span> · pinned mass on
              horizontal stripes + vertical edge:{" "}
              <span className="font-mono tabular-nums text-[var(--viz-prediction-ink)]">25.20</span>
            </p>
          </figure>
        </div>

        <div className="mt-6 lg:mt-0">
          <ConvField
            image={state.image}
            filter={state.filter}
            featureMap={state.featureMap}
            highlightRow={state.row}
            highlightCol={state.col}
            width={560}
            height={280}
            ariaLabel={`CNN lab: ${imageAt(imageIndex)} with ${filterAt(filterIndex)} filter at row ${state.row} column ${state.col}.`}
          />
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

function ChoiceSlider({
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
  return <Slider id={id} label={label} value={value} display={display} min={min} max={max} step={step} hint={hint} onChange={onChange} />;
}
