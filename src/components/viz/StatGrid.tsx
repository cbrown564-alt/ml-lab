import type { ReactNode } from "react";

/**
 * A live estimates strip — the Seeing Theory move (docs/exemplars/seeing-theory
 * teardown): a compact table of the numbers that the geometry above is showing,
 * updating in lockstep with the graphic so picture and parameters move together.
 * Values in a grammar hue tie a number to its mark on the canvas.
 *
 * Generic on purpose: any exhibit can dock one under its plot. Renders as a
 * single bordered row of cells (calm density, docs/exemplars pattern 7).
 */

export type Stat = {
  /** Short uppercase caption, e.g. "slope ŵ". The cell applies CSS `uppercase`, which
   * mangles lowercase Greek (η → Η, identical to "H"); wrap such symbols in a
   * `<span className="normal-case">…</span>` to keep them legible — hence ReactNode. */
  label: ReactNode;
  /** Formatted value, set in the mono voice the readouts speak. */
  value: string;
  /** A visual-grammar token (e.g. "var(--viz-prediction)") to tie it to a mark. */
  hue?: string;
  /** Optional one-line gloss shown small beneath the value. */
  note?: string;
};

export function StatGrid({
  stats,
  caption,
  direction = "row",
  className,
}: {
  stats: Stat[];
  /** Optional label for the whole strip, e.g. "Least-squares estimate". */
  caption?: string;
  /** "row" = a horizontal strip (under a plot); "col" = a stacked table (a side rail). */
  direction?: "row" | "col";
  /** Optional wrapper class — e.g. `chrome-redundant-metrics` when See-it already showed these numbers. */
  className?: string;
}) {
  return (
    <div className={className}>
      {caption && (
        <p className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {caption}
        </p>
      )}
      {direction === "row" ? (
        <dl className="grid grid-flow-col auto-cols-fr divide-x divide-line overflow-hidden rounded-lg border border-line">
          {stats.map((s, i) => (
            <div key={i} className="px-3 py-2.5">
              <dt className="font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                {s.label}
              </dt>
              <dd
                className="mt-1 font-mono text-[15px] tabular-nums"
                style={{ color: s.hue ?? "var(--ink)" }}
              >
                {s.value}
              </dd>
              {s.note && (
                <dd className="mt-0.5 text-[10px] leading-tight text-ink-faint">
                  {s.note}
                </dd>
              )}
            </div>
          ))}
        </dl>
      ) : (
        <dl className="divide-y divide-line overflow-hidden rounded-lg border border-line">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-baseline justify-between gap-4 px-3 py-2"
            >
              <dt className="font-mono text-[11px] tracking-wider text-ink-faint uppercase">
                {s.label}
              </dt>
              <dd
                className="font-mono text-[15px] tabular-nums"
                style={{ color: s.hue ?? "var(--ink)" }}
              >
                {s.value}
                {s.note && (
                  <span className="ml-2 font-sans text-[10px] text-ink-faint">
                    {s.note}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
