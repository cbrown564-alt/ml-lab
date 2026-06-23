"use client";
/* eslint-disable @next/next/no-img-element -- dev-only review tool streaming local
   variant PNGs of arbitrary size; next/image optimization is wrong here. */

import { useState } from "react";
import { exemplarUrl, frameUrl } from "../_lib/frame-url";

/**
 * The "this, not that" surface (docs/08 Part 3 / Part 6 — /review v2). Variant
 * compositions render adjacent for the human to choose between; the choice and
 * the reason persist to `decisions.md`, which the autonomous loop injects into
 * the drafting context (`npm run brief`) so a rejected direction is never
 * re-proposed — the loop compounds taste, not just code.
 */
export function DecisionsPanel({
  exhibit,
  variants,
  initialDecisions,
}: {
  exhibit: string;
  /** docs-relative paths of candidate frames under <capture>/variants/. */
  variants: string[];
  initialDecisions: string;
}) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [chosen, setChosen] = useState("");
  const [rejected, setRejected] = useState("");
  const [why, setWhy] = useState("");
  const [refs, setRefs] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function addEntry() {
    const date = new Date().toISOString().slice(0, 10);
    const block =
      `## ${date} — this, not that\n` +
      `- **Chosen:** ${chosen || "—"}\n` +
      `- **Rejected:** ${rejected || "—"}\n` +
      `- **Why:** ${why || "—"}\n` +
      `- **Refs:** ${refs || "—"}\n`;
    setDecisions((d) => (d.trim() ? `${block}\n${d}` : block));
    setChosen("");
    setRejected("");
    setWhy("");
    setRefs("");
  }

  async function save() {
    setState("saving");
    const res = await fetch("/review/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ exhibit, decisions }),
    });
    setState(res.ok ? "saved" : "error");
  }

  return (
    <section className="mt-14 border-t border-line pt-10">
      <h2 className="text-xl font-semibold tracking-tight">Decisions — this, not that</h2>
      <p className="mt-2 max-w-[68ch] text-sm text-ink-muted">
        Record the chosen direction and the rejected ones so a decision can be re-litigated
        rather than rediscovered — and so the loop never re-proposes what taste already ruled out.
      </p>

      {variants.length > 0 ? (
        <div className="mt-5">
          <h3 className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
            Candidate compositions
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {variants.map((v) => (
              <figure key={v} className="overflow-hidden rounded-lg border border-line bg-sunken">
                {/* variants live under captures/, served by the same sandboxed handler */}
                <img src={frameUrl(v)} alt={v} className="w-full" />
                <figcaption className="border-t border-line px-3 py-2 font-mono text-xs text-ink-faint">
                  {v.split("/").pop()}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-ink-faint">
          No candidate frames yet. Drop PNGs into{" "}
          <code className="font-mono">
            docs/reviews/captures/{exhibit}/&lt;date&gt;/variants/
          </code>{" "}
          to weigh compositions side by side. (Exemplar reference:{" "}
          <a className="underline" href={exemplarUrl("ncase-trust/00-viewport.png")} target="_blank" rel="noreferrer">
            ncase-trust
          </a>
          .)
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <input value={chosen} onChange={(e) => setChosen(e.target.value)} placeholder="Chosen direction" className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint" />
        <input value={rejected} onChange={(e) => setRejected(e.target.value)} placeholder="Rejected direction(s)" className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint" />
        <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why (the taste rationale)" className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint" />
        <input value={refs} onChange={(e) => setRefs(e.target.value)} placeholder="Refs (exemplar frame / principle)" className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-faint" />
      </div>
      <button
        type="button"
        onClick={addEntry}
        className="mt-3 rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
      >
        + Add entry
      </button>

      <h3 className="mt-6 font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
        decisions.md
      </h3>
      <textarea
        value={decisions}
        onChange={(e) => setDecisions(e.target.value)}
        rows={8}
        className="mt-2 w-full rounded-lg border border-line bg-raised px-3 py-2 font-mono text-xs text-ink"
      />

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={state === "saving"}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {state === "saving" ? "Saving…" : "Save decisions"}
        </button>
        {state === "saved" && <span className="text-sm text-truth">Saved · the loop will read this back</span>}
        {state === "error" && <span className="text-sm text-error-viz">Save failed</span>}
      </div>
    </section>
  );
}
