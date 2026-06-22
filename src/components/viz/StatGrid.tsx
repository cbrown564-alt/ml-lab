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
  /** Short uppercase caption, e.g. "slope ŵ". */
  label: string;
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
}: {
  stats: Stat[];
  /** Optional label for the whole strip, e.g. "Least-squares estimate". */
  caption?: string;
}) {
  return (
    <div>
      {caption && (
        <p className="mb-2 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          {caption}
        </p>
      )}
      <dl className="grid grid-flow-col auto-cols-fr divide-x divide-line overflow-hidden rounded-lg border border-line">
        {stats.map((s) => (
          <div key={s.label} className="px-3 py-2.5">
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
    </div>
  );
}
