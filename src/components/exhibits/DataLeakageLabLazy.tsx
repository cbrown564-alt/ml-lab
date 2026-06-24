"use client";

import dynamic from "next/dynamic";

/**
 * A client boundary that lazy-loads the data-leakage experiment lab with `ssr: false`,
 * so the lab's harness + experiment content load as a separate chunk on the Run-it tab
 * rather than in this route's initial bundle. The route already carries the leakage
 * model + fixture for the See-it story and the hero, so adding the before/after hero
 * pushed the eager bundle over budget; deferring the below-the-fold lab reclaims it.
 */
const DataLeakageLab = dynamic(
  () => import("@/components/exhibits/DataLeakageLab").then((m) => m.DataLeakageLab),
  { ssr: false, loading: () => <div className="h-[420px] rounded-xl border border-line bg-sunken" aria-hidden /> },
);

export function DataLeakageLabLazy() {
  return <DataLeakageLab />;
}
