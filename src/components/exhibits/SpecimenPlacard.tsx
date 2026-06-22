import type { ComponentProps, ReactNode } from "react";
import { NodeChip } from "@/components/graph/NodeChip";
import { MasteryBadge } from "@/components/learner/MasteryBadge";
import { domainLabel, kindLabel } from "@/lib/graph/labels";
import type { nodes } from "@content/graph/nodes";

type GraphNode = (typeof nodes)[number];

/**
 * The specimen placard — the exhibit's catalogue record (the design signature).
 * ML Lab calls itself "a quiet interactive museum"; a specimen has a placard, and
 * ours sets the exhibit's real knowledge-graph coordinates — classification,
 * what it builds on, what it leads to, its place in a journey, the learner's
 * standing — in the same precise mono-label-over-data voice the live readouts
 * speak. It fills the masthead and orients the learner before the interactive;
 * the forward motion (continue the journey) stays at the foot of the page.
 */

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-5 py-3">
      <dt className="font-mono text-[10px] tracking-[0.18em] text-ink-faint uppercase">
        {label}
      </dt>
      <dd className="mt-1.5">{children}</dd>
    </div>
  );
}

export function SpecimenPlacard({
  node,
  buildsOn,
  leadsTo,
  journey,
}: {
  node: GraphNode;
  buildsOn: GraphNode[];
  leadsTo: GraphNode[];
  journey?: { title: string; stopIndex: number; count: number };
}) {
  return (
    <aside
      aria-label="This exhibit's place in the collection"
      className="rounded-xl border border-line bg-raised"
    >
      {/* The classification + the learner's standing, the way a museum tag pairs
          a specimen's catalogue class with its acquisition note. A single accent
          tick is the only colour the record spends on itself. */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <span className="flex items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
          <span className="font-mono text-[11px] tracking-[0.14em] text-ink-muted uppercase">
            {domainLabel(node.domain)} · {kindLabel(node.kind)}
          </span>
        </span>
        <MasteryBadge nodeId={node.id} />
      </div>

      <dl className="divide-y divide-line">
        {buildsOn.length > 0 && (
          <Row label="Builds on">
            <ul className="flex flex-wrap gap-2">
              {buildsOn.map((n) => (
                <li key={n.id}>
                  <NodeChip node={n as ComponentProps<typeof NodeChip>["node"]} />
                </li>
              ))}
            </ul>
          </Row>
        )}

        {leadsTo.length > 0 && (
          <Row label="Leads to">
            <ul className="flex flex-wrap gap-2">
              {leadsTo.map((n) => (
                <li key={n.id}>
                  <NodeChip node={n as ComponentProps<typeof NodeChip>["node"]} />
                </li>
              ))}
            </ul>
          </Row>
        )}

        {journey && (
          <Row label="Journey">
            <span className="font-mono text-sm tabular-nums text-ink">
              {journey.title}
              <span className="text-ink-faint">
                {" · "}stop {journey.stopIndex + 1} of {journey.count}
              </span>
            </span>
          </Row>
        )}
      </dl>
    </aside>
  );
}
