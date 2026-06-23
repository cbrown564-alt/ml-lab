"use client";

import { DecisionField } from "@/components/viz/DecisionField";
import { NetworkDiagram } from "@/components/viz/NetworkDiagram";
import { useActiveFrame } from "@/components/exhibits/story-frame";
import type { NeuralNetFrame } from "@content/exhibits/neural-network-fundamentals/spine";
import { accuracy, initNet, predictProba, train, type Net } from "@/lib/models/neural-net";
import { NN_LR, xorData } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * The See-it graphic: the decision field at three stages — a single neuron's straight
 * line that XOR defeats, a hidden layer part-way through bending, and the solved X. The
 * nets are trained once at module load so the beats are deterministic.
 */
const NEURON: Net = train(initNet(1, 2), xorData, NN_LR, 500).net;
const BENDING: Net = train(initNet(4, 6), xorData, NN_LR, 70).net;
const SOLVED: Net = train(initNet(6, 6), xorData, NN_LR, 900).net;

const STATE: Record<NeuralNetFrame["stage"], { net: Net; caption: string }> = {
  neuron: { net: NEURON, caption: "One neuron — a straight line XOR defeats" },
  bending: { net: BENDING, caption: "A hidden layer, mid-training — the boundary bends" },
  solved: { net: SOLVED, caption: "Solved — the X that XOR needs" },
};

export function NeuralNetStory() {
  const frame = useActiveFrame<NeuralNetFrame>();
  const stage = frame?.stage ?? "neuron";
  const { net, caption } = STATE[stage];
  const acc = Math.round(accuracy(net, xorData) * 100);

  return (
    <figure className="flex flex-col rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-center justify-between font-mono text-[11px] tracking-widest text-ink-faint uppercase">
        <span>{caption}</span>
        <span className={stage === "neuron" ? "text-[var(--viz-error-ink)]" : "text-[var(--viz-truth-ink)]"}>{acc}% on XOR</span>
      </figcaption>
      <DecisionField points={xorData} predictProba={(x1, x2) => predictProba(net, x1, x2)} width={520} height={400} />
      {stage !== "neuron" && (
        <div className="mx-auto mt-3 w-full max-w-[300px]">
          <NetworkDiagram net={net} height={150} />
        </div>
      )}
    </figure>
  );
}
