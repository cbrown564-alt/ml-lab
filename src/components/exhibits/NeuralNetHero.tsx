"use client";

import { useEffect, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { accuracy, initNet, predictProba, train, type Net } from "@/lib/models/neural-net";
import { NN_LR, xorData } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * The specimen hero — why a network needs a hidden layer, as a before/after on XOR.
 * One neuron can only draw a straight line, and no straight line separates XOR, so
 * it tops out (~75%). Give it a hidden layer and the boundary bends into the X the
 * problem needs (~100%). Same data, a linear cut vs a learned curve. The nets are
 * trained once at module load (deterministic seeds); fields fade in on load.
 */

const NEURON: Net = train(initNet(1, 2), xorData, NN_LR, 500).net;
const SOLVED: Net = train(initNet(6, 6), xorData, NN_LR, 900).net;
const ACC_NEURON = Math.round(accuracy(NEURON, xorData) * 100);
const ACC_SOLVED = Math.round(accuracy(SOLVED, xorData) * 100);

function Panel({
  kicker,
  acc,
  accHue,
  net,
  reveal,
}: {
  kicker: string;
  acc: number;
  accHue: string;
  net: Net;
  reveal: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2 px-1 pb-1">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</span>
        <span className="font-mono text-[11px] tabular-nums" style={{ color: accHue }}>
          {acc}% on XOR
        </span>
      </div>
      <div style={{ opacity: reveal, transition: "opacity 500ms ease" }}>
        <DecisionField
          points={xorData}
          predictProba={(x1, x2) => predictProba(net, x1, x2)}
          width={520}
          height={400}
        />
      </div>
    </div>
  );
}

export function NeuralNetHero() {
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setReveal(1));
      return () => cancelAnimationFrame(id);
    }
    const t = window.setTimeout(() => setReveal(1), 360);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Neural networks
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          a straight line can&apos;t solve XOR
        </span>
      </figcaption>
      <div className="flex flex-col gap-4 px-3 py-3 sm:flex-row">
        <Panel kicker="one neuron — a straight line" acc={ACC_NEURON} accHue="var(--viz-error-ink)" net={NEURON} reveal={reveal} />
        <Panel kicker="a hidden layer — the bent X" acc={ACC_SOLVED} accHue="var(--viz-truth-ink)" net={SOLVED} reveal={reveal} />
      </div>
    </figure>
  );
}
