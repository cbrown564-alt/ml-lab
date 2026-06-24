"use client";

import dynamic from "next/dynamic";

/**
 * A client boundary that lazy-loads the NonlinearityToggle math widget with `ssr: false`,
 * so its heavy dependencies (the DecisionField canvas + the neural-net model) are a
 * separate client chunk loaded only on the one route that renders it — never bundled into
 * the shared MathView, which every exhibit pays for.
 */
const NonlinearityToggle = dynamic(
  () => import("@/components/exhibits/NonlinearityToggle").then((m) => m.NonlinearityToggle),
  { ssr: false, loading: () => <div className="h-[300px] rounded-lg border border-line bg-sunken" aria-hidden /> },
);

export function LazyNonlinearity() {
  return <NonlinearityToggle />;
}
