"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdaptationMetricsPanel } from "@/components/viz/AdaptationPanel";
import { StatGrid } from "@/components/viz/StatGrid";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { adaptationState } from "@/lib/models/adaptation";

type Mode = "stale-finetune" | "bad-retrieval";

export function AdaptationBreakIt() {
  const [mode, setMode] = useState<Mode>("stale-finetune");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Which adaptation failure to trigger"
          className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
        >
          {([
            ["Stale fine-tune", "stale-finetune"],
            ["Bad retrieval", "bad-retrieval"],
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
          {mode === "stale-finetune"
            ? "failure ① — weights frozen at deploy"
            : "failure ② — retrieval cites wrong chunk"}
        </p>
      </div>
      {mode === "stale-finetune" ? <StaleFineTuneLoop /> : <BadRetrievalLoop />}
    </div>
  );
}

function StaleFineTuneLoop() {
  const [broken, setBroken] = useState(true);
  const scenarioId = "pricing-update";

  useEffect(() => {
    if (broken) reportTaskEvent("adaptation:stale-finetune");
  }, [broken]);

  const healthy = useMemo(
    () => adaptationState(scenarioId, "fine-tuning", "healthy"),
    [],
  );
  const state = useMemo(
    () => adaptationState(scenarioId, "fine-tuning", broken ? "stale-finetune" : "healthy"),
    [broken],
  );
  const rag = useMemo(() => adaptationState(scenarioId, "rag", "healthy"), []);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Guidance
          tone={broken ? "broken" : "ready"}
          kicker={broken ? "Symptom · stale weights" : "Trigger it"}
          body={
            broken ? (
              <>
                After the July pricing edit, fine-tuned domain fit falls from{" "}
                <span className="font-mono tabular-nums text-[var(--viz-error-ink)]">
                  {healthy.metrics.domainFit.toFixed(2)}
                </span>{" "}
                to{" "}
                <span className="font-mono tabular-nums text-[var(--viz-error-ink)]">
                  {state.metrics.domainFit.toFixed(2)}
                </span>{" "}
                — RAG on the same ticket stays at{" "}
                <span className="font-mono tabular-nums text-[var(--viz-prediction-ink)]">
                  {rag.metrics.domainFit.toFixed(2)}
                </span>
                .
              </>
            ) : (
              "Retrain or pair fine-tuning with retrieval for fast-moving facts."
            )
          }
        />
        <button
          type="button"
          onClick={() => setBroken((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {broken ? "Repair · retrain weights" : "Break · doc update without retrain"}
        </button>
        <StatGrid
          direction="col"
          stats={[
            {
              label: "fresh",
              value: state.metrics.freshness.toFixed(2),
              hue: broken ? "var(--viz-error-ink)" : "var(--viz-truth-ink)",
              note: "fine-tune",
            },
          ]}
        />
      </div>
      <AdaptationMetricsPanel
        metrics={state.metrics}
        sampleAnswer={state.sampleAnswer}
        onTarget={state.onTarget}
        width={560}
        ariaLabel="Stale fine-tune failure on pricing ticket."
      />
    </div>
  );
}

function BadRetrievalLoop() {
  const [broken, setBroken] = useState(true);
  const scenarioId = "reset-procedure";
  const state = useMemo(
    () => adaptationState(scenarioId, "rag", broken ? "bad-retrieval" : "healthy"),
    [broken],
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Guidance
          tone={broken ? "broken" : "ready"}
          kicker={broken ? "Symptom · wrong citation" : "Healthy retrieval"}
          body={
            broken ? (
              <>
                Bad neighbours produce a confident answer with{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">domain fit 0.36</span> — a
                citation does not mean the page was right.
              </>
            ) : (
              "Recall@k on ticket-shaped queries catches poisoned prompts before users see them."
            )
          }
        />
        <button
          type="button"
          onClick={() => setBroken((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {broken ? "Repair · re-index + rerank" : "Break · bad retrieval"}
        </button>
      </div>
      <AdaptationMetricsPanel
        metrics={state.metrics}
        sampleAnswer={state.sampleAnswer}
        onTarget={state.onTarget}
        width={560}
        ariaLabel="Bad retrieval failure with citation enabled."
      />
    </div>
  );
}

function Guidance({
  tone,
  kicker,
  body,
}: {
  tone: "ready" | "broken";
  kicker: string;
  body: ReactNode;
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
    </div>
  );
}
