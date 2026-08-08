"use client";

import dynamic from "next/dynamic";

/**
 * The audio instrument is only reachable after the learner opens Run it. Keep
 * its Web Audio graph and chart code out of the initial exhibit bundle, then
 * load the complete instrument at the stage boundary.
 */
const OverfittingAudioLab = dynamic(
  () =>
    import("@/components/exhibits/OverfittingAudioLab").then(
      (module) => module.OverfittingAudioLab,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[640px] rounded-xl border border-line bg-sunken"
        aria-label="Preparing the audio experiment"
        role="status"
      />
    ),
  },
);

export function OverfittingAudioLabLazy() {
  return <OverfittingAudioLab />;
}
