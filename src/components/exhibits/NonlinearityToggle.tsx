"use client";

import { useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { accuracy as linAccuracy, fitLogistic } from "@/lib/models/logistic";
import { accuracy as nnAccuracy, initNet, predictProba, train } from "@/lib/models/neural-net";
import { NN_LR, xorData } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * The math claim made manipulable: with the nonlinearity (tanh), a hidden layer bends the
 * boundary into the XOR X; without it, the stack of linear maps collapses to a single line
 * (which is exactly logistic regression) and can't beat a coin flip. Toggle to see the
 * "W₂W₁x = Wx" algebra as a picture.
 */
const MLP = train(initNet(8, 6), xorData, NN_LR, 1200).net;
const LIN = fitLogistic(xorData);
const MLP_ACC = Math.round(nnAccuracy(MLP, xorData) * 100);
const LIN_ACC = Math.round(linAccuracy(xorData, LIN) * 100);

export function NonlinearityToggle() {
  const [on, setOn] = useState(true);
  return (
    <figure className="rounded-lg border border-line bg-sunken p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line p-0.5 text-xs">
          {[
            [true, "tanh on"],
            [false, "tanh off"],
          ].map(([v, label]) => (
            <button key={String(v)} type="button" aria-pressed={on === v} onClick={() => setOn(v as boolean)} className={`rounded-full px-3 py-1 transition-colors ${on === v ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}>
              {label}
            </button>
          ))}
        </div>
        <span className={`font-mono text-xs ${on ? "text-[var(--viz-truth-ink)]" : "text-[var(--viz-error-ink)]"}`}>{on ? MLP_ACC : LIN_ACC}% on XOR</span>
      </div>
      {on ? (
        <DecisionField points={xorData} predictProba={(x1, x2) => predictProba(MLP, x1, x2)} width={300} height={240} showProb={false} />
      ) : (
        <DecisionField points={xorData} params={LIN} width={300} height={240} showProb={false} />
      )}
      <p className="mt-2 text-xs leading-relaxed text-ink-faint">
        {on
          ? "With the nonlinearity the hidden layer carves the X — it solves XOR."
          : "Strip the tanh and the whole stack is one linear map: a single straight line, stuck at a coin flip. That's the algebra W₂W₁x = Wx, as a picture."}
      </p>
    </figure>
  );
}
