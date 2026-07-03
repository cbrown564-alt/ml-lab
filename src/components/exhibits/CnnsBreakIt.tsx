"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { ConvField } from "@/components/viz/ConvField";
import { StatGrid } from "@/components/viz/StatGrid";
import { activationMass, conv2dValid } from "@/lib/models/cnn";
import { convParams, fcParams, shiftDemo } from "@content/exhibits/cnns/experiment";

type Mode = "translation" | "kernel-size";

export function CnnsBreakIt() {
  const [mode, setMode] = useState<Mode>("translation");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Which CNN failure to trigger"
          className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
        >
          {([
            ["Translation", "translation"],
            ["Kernel too small", "kernel-size"],
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
          {mode === "translation"
            ? "failure ① — flattening scrambles; conv shifts"
            : "failure ② — local kernel, global pattern"}
        </p>
      </div>
      {mode === "translation" ? <TranslationLoop /> : <KernelLoop />}
    </div>
  );
}

function TranslationLoop() {
  const [shifted, setShifted] = useState(false);
  const image = shifted ? shiftDemo.shifted : shiftDemo.original;
  const featureMap = useMemo(
    () => conv2dValid(image, shiftDemo.filter),
    [image],
  );
  const broken = shifted;

  useEffect(() => {
    if (broken) reportTaskEvent("cnns:translation-shift");
  }, [broken]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        {broken ? (
          <Guidance
            tone="broken"
            kicker="Symptom · pattern moved"
            body={
              <>
                Shift the stripes one pixel and the{" "}
                <span className="font-medium text-[var(--viz-prediction-ink)]">conv feature map</span>{" "}
                slides with them — activation mass stays in the same ballpark (
                <span className="font-mono tabular-nums">{activationMass(featureMap).toFixed(2)}</span>
                ). A dense layer would need to relearn every shifted wiring.
              </>
            }
            foot={
              <>
                <span className="font-medium text-ink">Diagnose:</span> flattening destroys translation
                structure. <span className="font-medium text-ink">Repair:</span> keep the grid and share
                filters.
              </>
            }
          />
        ) : (
          <Guidance
            tone="ready"
            kicker="Trigger it"
            body="Horizontal stripes with a vertical-edge filter. Shift the image one pixel right and watch what happens to the feature map versus what a flattened dense layer would imply."
            foot="Use the toggle below — then repair by returning to the original grid."
          />
        )}

        <button
          type="button"
          onClick={() => setShifted((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {shifted ? "Repair · original image" : "Shift image one pixel →"}
        </button>

        <StatGrid
          direction="col"
          stats={[
            {
              label: "FC weights",
              value: fcParams.toLocaleString(),
              hue: "var(--viz-error-ink)",
              note: "if flattened",
            },
            {
              label: "Conv weights",
              value: `${convParams}`,
              hue: "var(--viz-truth-ink)",
              note: "shared filter",
            },
            {
              label: "mass",
              value: activationMass(featureMap).toFixed(2),
              hue: "var(--viz-prediction-ink)",
              note: shifted ? "shifted map" : "baseline",
            },
          ]}
        />
      </div>

      <ConvField
        image={image}
        filter={shiftDemo.filter}
        featureMap={featureMap}
        highlightRow={2}
        highlightCol={2}
        width={560}
        height={280}
        ariaLabel={
          shifted
            ? "Shifted horizontal stripes; vertical-edge feature map shifted coherently."
            : "Baseline horizontal stripes before the one-pixel shift."
        }
      />
    </div>
  );
}

function KernelLoop() {
  const image = shiftDemo.original;
  const filter = shiftDemo.filter;
  const featureMap = conv2dValid(image, filter);
  const maxCell = featureMap.flat().reduce((best, v, i, arr) => (Math.abs(v) > Math.abs(arr[best] ?? 0) ? i : best), 0);
  const row = Math.floor(maxCell / featureMap[0]!.length);
  const col = maxCell % featureMap[0]!.length;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <Guidance
        tone="ready"
        kicker="Symptom · locally blind"
        body="A 3×3 filter only sees a 3×3 patch. It can detect a local edge but never 'see' the whole stripe pattern in one shot — stacking layers widens the receptive field."
        foot="Repair: stack conv layers or grow the kernel — not one giant dense flatten."
      />
      <ConvField
        image={image}
        filter={filter}
        featureMap={featureMap}
        highlightRow={row}
        highlightCol={col}
        width={560}
        height={280}
        ariaLabel="A 3 by 3 filter sees only a local patch; strongest activation at one position."
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
        tone === "broken" ? "border-[var(--viz-error)] bg-[color-mix(in_srgb,var(--viz-error)_8%,transparent)]" : "border-line bg-sunken"
      }`}
    >
      <p className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
      {foot ? <p className="mt-3 text-sm leading-relaxed text-ink-muted">{foot}</p> : null}
    </div>
  );
}
