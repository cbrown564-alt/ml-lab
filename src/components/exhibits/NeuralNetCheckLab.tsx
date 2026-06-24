"use client";

import { useMemo, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { accuracy, initNet, predictProba, train } from "@/lib/models/neural-net";
import { breakTest, breakTrain, NN_LR } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * The Explain-it companion: the capacity trade-off in two clicks. A small network learns
 * the rule (train ≈ test); a big one memorises the noise (train climbs, test drops). The
 * gap, not the train score, is what the checks ask you to read.
 */
const EPOCHS = 1400;

export function NeuralNetCheckLab() {
  const [hidden, setHidden] = useState(4);
  const net = useMemo(() => train(initNet(hidden, 3), breakTrain, NN_LR, EPOCHS).net, [hidden]);
  const tr = Math.round(accuracy(net, breakTrain) * 100);
  const te = Math.round(accuracy(net, breakTest) * 100);

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 font-mono text-[11px] tracking-widest text-ink-faint uppercase">The capacity trade-off</figcaption>
      <div className="mb-3 inline-flex rounded-full border border-line p-0.5 text-sm">
        {[
          [4, "small (4)"],
          [32, "big (32)"],
        ].map(([h, label]) => (
          <button key={h} type="button" aria-pressed={hidden === h} onClick={() => setHidden(h as number)} className={`rounded-full px-4 py-1 transition-colors ${hidden === h ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>
      <DecisionField points={breakTrain} predictProba={(x1, x2) => predictProba(net, x1, x2)} width={340} height={280} />
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded border border-line p-2">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">train</dt>
          <dd className="font-mono text-base text-ink">{tr}%</dd>
        </div>
        <div className="rounded border border-line p-2">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">test</dt>
          <dd className="font-mono text-base text-[var(--viz-truth-ink)]">{te}%</dd>
        </div>
        <div className="rounded border border-line p-2">
          <dt className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">gap</dt>
          <dd className="font-mono text-base text-[var(--viz-error-ink)]">{tr - te}pt</dd>
        </div>
      </dl>
    </figure>
  );
}
