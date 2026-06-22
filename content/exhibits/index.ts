/**
 * Exhibit registry — which graph nodes have a live exhibit route. This is
 * deliberately separate from a node's `status`: status is a quality claim
 * that only advances through acceptance review (docs/06), while this is the
 * plain fact of whether a door exists to walk through.
 */
export const liveExhibits: Record<string, { href: string }> = {
  "linear-regression": { href: "/exhibits/linear-regression" },
  "gradient-descent": { href: "/exhibits/gradient-descent" },
  "loss-functions": { href: "/exhibits/loss-functions" },
  "feature-scaling": { href: "/exhibits/feature-scaling" },
  "bias-variance": { href: "/exhibits/bias-variance" },
};

export const isLive = (nodeId: string): boolean => nodeId in liveExhibits;
