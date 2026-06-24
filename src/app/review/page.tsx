import Link from "next/link";
import { reviewExhibits } from "./_lib/store";

export const dynamic = "force-dynamic";

/**
 * The review roster — every live exhibit with the machine-decidable facts at a
 * glance (hero present? captured? a verdict on file, and is it stale?), so the
 * human can see where their attention is owed before opening anything.
 */
export default function ReviewIndex() {
  const rows = reviewExhibits();
  const verdictLabel = (r: (typeof rows)[number]) =>
    !r.hasScorecard ? "none" : r.scorecardStale ? "stale" : "in-date";
  const reviewed = rows.filter((r) => r.hasScorecard && !r.scorecardStale).length;

  return (
    <main>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Foundations review</h1>
        <span className="font-mono text-sm text-ink-faint tabular-nums">
          {reviewed} / {rows.length} in-date verdicts
        </span>
      </div>
      <p className="mt-3 max-w-[68ch] text-lg leading-relaxed text-ink-muted">
        The human judges taste; the machine judges everything mechanizable. Pick an exhibit to
        score its captured frames against the pinned exemplars (rubric v2,{" "}
        <code className="font-mono text-[0.85em]">docs/08</code>). A verdict here is a durable
        file the autonomous loop reads back as ground truth.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sunken text-left font-mono text-xs tracking-wider text-ink-faint uppercase">
              <th className="px-4 py-3 font-medium">Exhibit</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-center font-medium">Hero §1b</th>
              <th className="px-4 py-3 font-medium">Latest capture</th>
              <th className="px-4 py-3 font-medium">Verdict</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{r.title}</td>
                <td className="px-4 py-3 text-ink-muted">{r.status}</td>
                <td className="px-4 py-3 text-center">
                  <span className={r.heroPresent ? "text-truth" : "text-error-viz"}>
                    {r.heroPresent ? "✓" : "✗"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted tabular-nums">
                  {r.latestCapture ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      verdictLabel(r) === "in-date"
                        ? "text-truth"
                        : verdictLabel(r) === "stale"
                          ? "text-error-viz"
                          : "text-ink-faint"
                    }
                  >
                    {verdictLabel(r)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/review/${r.id}`}
                    className="font-medium text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-ink-faint">
        No capture yet? Run{" "}
        <code className="font-mono text-ink-muted">npm run capture:review</code> with the dev
        server up, then refresh.
      </p>
    </main>
  );
}
