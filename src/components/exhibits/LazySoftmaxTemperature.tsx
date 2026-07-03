"use client";

import dynamic from "next/dynamic";

/**
 * Client boundary that lazy-loads the SoftmaxTemperature math widget with `ssr: false`,
 * keeping the attention model + fixture JSON out of the shared MathView bundle that
 * every exhibit route pays for (the gradient-descent route sits at its js ceiling).
 */
const SoftmaxTemperature = dynamic(
  () =>
    import("@/components/exhibits/SoftmaxTemperature").then((m) => m.SoftmaxTemperature),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] rounded-lg border border-line bg-sunken" aria-hidden />
    ),
  },
);

export function LazySoftmaxTemperature() {
  return <SoftmaxTemperature />;
}
