"use client";

import { useState } from "react";
import { AdaptationCompare } from "@/components/viz/AdaptationPanel";
import { adaptationLabState } from "@content/exhibits/fine-tuning-vs-prompting-vs-rag/experiment";

const TICKETS = [
  { id: "reset", label: "Reset", scenarioIndex: 0 },
  { id: "pricing", label: "Pricing", scenarioIndex: 1 },
] as const;

export function AdaptationCheckLab() {
  const [ticketId, setTicketId] = useState<(typeof TICKETS)[number]["id"]>("reset");
  const ticket = TICKETS.find((entry) => entry.id === ticketId)!;
  const state = adaptationLabState(ticket.scenarioIndex, 2);

  return (
    <figure className="rounded-xl border border-line bg-raised p-4">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        compare strategies on the same ticket
      </figcaption>
      <div
        role="group"
        aria-label="Support ticket"
        className="mb-3 inline-flex rounded-full border border-line p-0.5 text-xs"
      >
        {TICKETS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={ticketId === entry.id}
            onClick={() => setTicketId(entry.id)}
            className={`rounded-full px-3 py-1 transition-colors ${
              ticketId === entry.id ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      <AdaptationCompare
        rows={state.compare}
        width={480}
        ariaLabel={`Check companion: three-way comparison on ${ticket.label} ticket.`}
      />
    </figure>
  );
}
