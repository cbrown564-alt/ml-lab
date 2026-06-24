import Link from "next/link";
import { isLive, liveExhibits } from "@content/exhibits";
import type { ConceptNode } from "@/lib/graph/schema";

/**
 * A graph node as a chip: a door if the exhibit is live, marked territory
 * if it's still a stub. Shared by the exhibit frame's neighborhood and the
 * math drawer's foundations row.
 */
export function NodeChip({ node, title }: { node: ConceptNode; title?: string }) {
  // The hover text defaults to the node's one-liner, but a caller can pass the
  // edge's learner-facing note instead (e.g. why two concepts get confused).
  const hover = title ?? node.oneLiner;
  return isLive(node.id) ? (
    <Link
      href={liveExhibits[node.id].href}
      title={hover}
      className="rounded-full border border-accent px-3 py-1 text-sm text-accent transition-colors hover:bg-accent hover:text-accent-ink"
    >
      {node.title} →
    </Link>
  ) : (
    <span
      title={hover}
      className="rounded-full border border-line bg-sunken px-3 py-1 text-sm text-ink-muted"
    >
      {node.title}
    </span>
  );
}
