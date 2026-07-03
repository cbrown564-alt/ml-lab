"use client";

import type { AdaptationMetrics, AdaptationStrategy } from "@/lib/models/adaptation";

const METRIC_LABELS: { key: keyof AdaptationMetrics; label: string; note: string }[] = [
  { key: "domainFit", label: "Domain fit", note: "answers the ticket" },
  { key: "freshness", label: "Freshness", note: "tracks doc updates" },
  { key: "cost", label: "Cost", note: "train + serve" },
  { key: "latency", label: "Latency", note: "time to answer" },
];

export function AdaptationPipeline({
  strategy,
  width = 560,
  ariaLabel,
}: {
  strategy: AdaptationStrategy;
  width?: number;
  ariaLabel: string;
}) {
  return (
    <figure role="img" aria-label={ariaLabel} style={{ maxWidth: width }}>
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        {strategy.label} · {strategy.lever}
      </figcaption>
      <div className="flex flex-wrap items-center gap-2">
        {strategy.pipeline.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <div className="rounded-lg border border-line bg-sunken px-3 py-2 text-sm text-ink-muted">{step}</div>
            {index < strategy.pipeline.length - 1 ? (
              <span className="text-ink-faint" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </figure>
  );
}

export function AdaptationMetricsPanel({
  metrics,
  sampleAnswer,
  onTarget,
  width = 560,
  ariaLabel,
}: {
  metrics: AdaptationMetrics;
  sampleAnswer: string;
  onTarget: boolean;
  width?: number;
  ariaLabel: string;
}) {
  return (
    <figure role="img" aria-label={ariaLabel} style={{ maxWidth: width }}>
      <div className="mb-4 rounded-lg border border-line bg-sunken px-4 py-3">
        <p className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">Model answer</p>
        <p className={`mt-2 text-sm leading-relaxed ${onTarget ? "text-ink" : "text-[var(--viz-error-ink)]"}`}>
          {sampleAnswer}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {METRIC_LABELS.map(({ key, label, note }) => (
          <MetricBar key={key} label={label} note={note} value={metrics[key] as number} />
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] text-ink-faint">
        Source citation: {metrics.citesSource ? "yes — retrieved chunk linked" : "no — parametric memory only"}
      </p>
    </figure>
  );
}

export function AdaptationCompare({
  rows,
  width = 560,
  ariaLabel,
}: {
  rows: { strategy: AdaptationStrategy; metrics: AdaptationMetrics }[];
  width?: number;
  ariaLabel: string;
}) {
  return (
    <figure role="img" aria-label={ariaLabel} style={{ maxWidth: width }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-medium text-ink-muted">Strategy</th>
              <th className="py-2 pr-4 font-medium text-ink-muted">Domain</th>
              <th className="py-2 pr-4 font-medium text-ink-muted">Fresh</th>
              <th className="py-2 font-medium text-ink-muted">Cites</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ strategy, metrics }) => (
              <tr key={strategy.id} className="border-b border-line/70">
                <td className="py-2.5 pr-4 font-medium text-ink">{strategy.label}</td>
                <td className="py-2.5 pr-4 font-mono tabular-nums text-[var(--viz-prediction-ink)]">
                  {metrics.domainFit.toFixed(2)}
                </td>
                <td className="py-2.5 pr-4 font-mono tabular-nums text-[var(--viz-truth-ink)]">
                  {metrics.freshness.toFixed(2)}
                </td>
                <td className="py-2.5 font-mono text-ink-muted">{metrics.citesSource ? "yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function MetricBar({ label, note, value }: { label: string; note: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-raised px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="font-mono text-sm tabular-nums text-[var(--viz-param-ink)]">{value.toFixed(2)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunken">
        <div
          className="h-full rounded-full bg-[var(--viz-param)]"
          style={{ width: `${Math.max(4, value * 100)}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-ink-faint">{note}</p>
    </div>
  );
}
