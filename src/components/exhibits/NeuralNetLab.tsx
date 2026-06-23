"use client";

import { useEffect, useState } from "react";
import { DecisionField } from "@/components/viz/DecisionField";
import { NetworkDiagram } from "@/components/viz/NetworkDiagram";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { accuracy, initNet, logLoss, predictProba, step, type Net } from "@/lib/models/neural-net";
import { DEFAULT_HIDDEN, HIDDEN_CHOICES, NN_LR, neuralNetScenario, xorData } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * Watch a small network learn XOR. Press Train and a hidden layer bends the decision
 * field from a useless straight split into the X that XOR needs, while the wiring diagram
 * shows the weights thicken and flip. Drop to one hidden unit and it can only draw a line
 * — it gets stuck. The same model, as a surface and as a circuit, learning in real time.
 */
const STEPS_PER_TICK = 14;
const MAX_EPOCHS = 1400;

export function NeuralNetLab() {
  const [hidden, setHidden] = useState<number>(DEFAULT_HIDDEN);
  const [seed, setSeed] = useState(2);
  const [net, setNet] = useState<Net>(() => initNet(DEFAULT_HIDDEN, 2));
  const [epoch, setEpoch] = useState(0);
  const [training, setTraining] = useState(false);

  const reset = (h: number, s: number) => {
    setTraining(false);
    setHidden(h);
    setSeed(s);
    setNet(initNet(h, s));
    setEpoch(0);
  };

  useEffect(() => {
    if (!training) return;
    const id = setInterval(() => {
      setNet((prev) => {
        let c = prev;
        for (let i = 0; i < STEPS_PER_TICK; i++) c = step(c, xorData, NN_LR);
        return c;
      });
      setEpoch((e) => {
        const next = e + STEPS_PER_TICK;
        if (next >= MAX_EPOCHS) setTraining(false);
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [training]);

  const loss = logLoss(net, xorData);
  const acc = accuracy(net, xorData);

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <p className="leading-relaxed text-ink-muted">{neuralNetScenario.prompt}</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                whenHydrated(() => useLearner.getState().recordPractice("neural-network-fundamentals"));
                setTraining((t) => !t);
              }}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink hover:opacity-90"
            >
              {training ? "Pause" : epoch === 0 ? "Train ▶" : "Resume ▶"}
            </button>
            <button type="button" onClick={() => reset(hidden, seed + 1)} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-sunken">
              Reset
            </button>
          </div>

          <div className="rounded-lg border border-line bg-sunken p-4">
            <p className="text-sm text-ink-muted">Hidden units</p>
            <div className="mt-2 flex gap-1.5">
              {HIDDEN_CHOICES.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={hidden === h}
                  onClick={() => reset(h, seed)}
                  className={`flex-1 rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${hidden === h ? "border-accent bg-accent text-accent-ink" : "border-line text-ink-muted hover:text-ink"}`}
                >
                  {h}
                </button>
              ))}
            </div>
            {hidden === 1 && (
              <p className="mt-2 text-xs leading-relaxed text-[var(--viz-error-ink)]">
                One unit can only bend the space once — it can&apos;t draw the X, so it stalls near a single line.
              </p>
            )}
          </div>

          <StatGrid
            direction="col"
            caption={`${epoch} training steps`}
            stats={[
              { label: "loss", value: loss.toFixed(3), hue: "var(--viz-error-ink)", note: "cross-entropy, falling as it learns" },
              { label: "accuracy on XOR", value: `${Math.round(acc * 100)}%`, hue: "var(--viz-truth-ink)", note: hidden === 1 ? "a line tops out ~75%" : "a hidden layer reaches ~100%" },
              { label: "weights", value: `${hidden * 2 + hidden + hidden + 1}`, hue: "var(--viz-param)", note: "numbers backprop tunes" },
            ]}
          />
        </div>

        <div className="mt-6 lg:mt-0">
          <DecisionField points={xorData} predictProba={(x1, x2) => predictProba(net, x1, x2)} width={520} height={420} />
          <div className="mx-auto mt-4 w-full max-w-[320px]">
            <NetworkDiagram net={net} />
          </div>
        </div>
      </div>
    </div>
  );
}
