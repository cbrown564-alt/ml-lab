"use client";

import { StatGrid } from "@/components/viz/StatGrid";
import { ConvField } from "@/components/viz/ConvField";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { CnnsFrame } from "@content/exhibits/cnns/spine";
import {
  convParams,
  convState,
  fcParams,
  slideParam,
} from "@content/exhibits/cnns/experiment";

export function CnnsStory() {
  const frame = useActiveFrame<CnnsFrame>();
  const imageIndex = frame?.imageIndex ?? 0;
  const filterIndex = frame?.filterIndex ?? 1;
  const slide = frame?.slide ?? slideParam.default;
  const state = convState(imageIndex, filterIndex, slide);

  const caption =
    frame?.showParamCompare
      ? "Dense versus shared parameters"
      : filterIndex === 1 && imageIndex === 0
        ? "Vertical-edge filter on horizontal stripes"
        : imageIndex === 1
          ? "Same filter, new image — weight sharing"
          : "Stack filters to build hierarchy";

  const note = frame?.showParamCompare
    ? `Fully connected: ${fcParams.toLocaleString()} weights. One conv filter: ${convParams}.`
    : `Output ${state.outputValue.toFixed(2)} at (${state.row}, ${state.col}) · mass ${state.mass.toFixed(2)}`;

  return (
    <figure className="flex flex-col gap-4 rounded-xl border border-line bg-raised p-5">
      <figcaption className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {caption}
      </figcaption>
      <ConvField
        image={state.image}
        filter={state.filter}
        featureMap={state.featureMap}
        highlightRow={state.row}
        highlightCol={state.col}
        width={520}
        height={240}
        ariaLabel={`Convolution with filter position row ${state.row}, column ${state.col}; output ${state.outputValue.toFixed(2)}.`}
      />
      <StatGrid
        caption={note}
        stats={
          frame?.showParamCompare
            ? [
                {
                  label: "FC weights",
                  value: fcParams.toLocaleString(),
                  hue: "var(--viz-error-ink)",
                  note: "every input–output pairing",
                },
                {
                  label: "Conv weights",
                  value: `${convParams}`,
                  hue: "var(--viz-truth-ink)",
                  note: "one shared 3×3 + bias",
                },
                {
                  label: "ratio",
                  value: `${Math.round(fcParams / convParams)}×`,
                  hue: "var(--viz-prediction-ink)",
                  note: "parameter savings",
                },
              ]
            : [
                {
                  label: "output",
                  value: state.outputValue.toFixed(2),
                  hue: "var(--viz-prediction-ink)",
                  note: "dot product at this slide",
                },
                {
                  label: "mass",
                  value: state.mass.toFixed(2),
                  hue: "var(--viz-truth-ink)",
                  note: "Σ|activations|",
                },
                {
                  label: "params",
                  value: `${convParams}`,
                  hue: "var(--viz-param-ink)",
                  note: "shared filter",
                },
              ]
        }
      />
    </figure>
  );
}
