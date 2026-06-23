/**
 * Client-safe frame URL builder (no fs — safe to import from client components).
 * The `/review/api/frame` handler streams a PNG from docs/ given a docs-relative
 * path; this centralizes the query encoding so captures and exemplars are
 * addressed identically.
 */
export function frameUrl(docsRelPath: string): string {
  return `/review/api/frame?path=${encodeURIComponent(docsRelPath)}`;
}

/** An exemplar frame "<slug>/<file>.png" lives under docs/exemplars/. */
export function exemplarUrl(frame: string): string {
  return frameUrl(`exemplars/${frame}`);
}
