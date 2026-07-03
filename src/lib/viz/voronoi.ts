/** A 2-D point in data space. */
export type Vec2 = { x: number; y: number };

const EPS = 1e-10;

function dist2(a: Vec2, b: Vec2): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

function closerToSite(p: Vec2, site: Vec2, other: Vec2): boolean {
  return dist2(p, site) <= dist2(p, other) + EPS;
}

/** Intersect segment ab with the perpendicular bisector of site and other. */
function intersectWithBisector(a: Vec2, b: Vec2, site: Vec2, other: Vec2): Vec2 {
  const dx = other.x - site.x;
  const dy = other.y - site.y;
  const da = dist2(a, site) - dist2(a, other);
  const db = dist2(b, site) - dist2(b, other);
  const denom = da - db;
  if (Math.abs(denom) < EPS) return a;
  const t = da / denom;
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}

/** Sutherland–Hodgman clip: keep the half-plane closer to `site` than `other`. */
function clipToHalfPlane(polygon: Vec2[], site: Vec2, other: Vec2): Vec2[] {
  if (polygon.length === 0) return [];
  const out: Vec2[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const aIn = closerToSite(a, site, other);
    const bIn = closerToSite(b, site, other);
    if (aIn && bIn) {
      out.push(b);
    } else if (aIn && !bIn) {
      out.push(intersectWithBisector(a, b, site, other));
    } else if (!aIn && bIn) {
      out.push(intersectWithBisector(a, b, site, other));
      out.push(b);
    }
  }
  return out;
}

/**
 * Bounded Voronoi cell for one site: clip the plot rectangle to the half-planes
 * where this site is nearest. Produces a small polygon (typically 4–8 vertices) —
 * the replacement for a coarse rect grid that bloated SSR HTML and looked stepped.
 */
export function boundedVoronoiCell(
  site: Vec2,
  sites: Vec2[],
  bounds: { x0: number; x1: number; y0: number; y1: number },
): Vec2[] {
  let poly: Vec2[] = [
    { x: bounds.x0, y: bounds.y0 },
    { x: bounds.x1, y: bounds.y0 },
    { x: bounds.x1, y: bounds.y1 },
    { x: bounds.x0, y: bounds.y1 },
  ];
  for (const other of sites) {
    if (other === site) continue;
    if (dist2(site, other) < EPS) continue;
    poly = clipToHalfPlane(poly, site, other);
    if (poly.length < 3) return [];
  }
  return poly;
}

export function boundedVoronoiCells(
  sites: Vec2[],
  bounds: { x0: number; x1: number; y0: number; y1: number },
): Vec2[][] {
  return sites.map((site) => boundedVoronoiCell(site, sites, bounds));
}
