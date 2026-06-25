"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FeatureFoldField } from "@/components/viz/FeatureFoldField";
import { NetworkDiagram } from "@/components/viz/NetworkDiagram";
import { StatGrid } from "@/components/viz/StatGrid";
import { PortalView, RepresentationPortal } from "@/components/viz/primitives";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { initNet, logLoss, predictProbaMuted, step, type Net } from "@/lib/models/neural-net";
import { DEFAULT_HIDDEN, HIDDEN_CHOICES, NN_LR, neuralNetScenario, xorData } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * Watch a small network learn XOR. The RepresentationPortal links each hidden unit
 * in the wiring diagram to its half-space fold in feature space — click to inspect,
 * mute to see what that fold contributes. Press Train and folds thicken while the
 * boundary bends into the X XOR needs.
 */
const STEPS_PER_TICK = 14;
const MAX_EPOCHS = 1400;

export function NeuralNetLab() {
  const [hidden, setHidden] = useState<number>(DEFAULT_HIDDEN);
  const [seed, setSeed] = useState(2);
  const [net, setNet] = useState<Net>(() => initNet(DEFAULT_HIDDEN, 2));
  const [epoch, setEpoch] = useState(0);
  const [training, setTraining] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [muted, setMuted] = useState<Set<number>>(() => new Set());

  const reset = (h: number, s: number) => {
    setTraining(false);
    setHidden(h);
    setSeed(s);
    setNet(initNet(h, s));
    setEpoch(0);
    setSelectedUnit(null);
    setMuted(new Set());
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

  const toggleMute = useCallback((unit: number) => {
    setMuted((prev) => {
      const next = new Set(prev);
      if (next.has(unit)) next.delete(unit);
      else next.add(unit);
      return next;
    });
    whenHydrated(() => useLearner.getState().recordPractice("neural-network-fundamentals"));
  }, []);

  const portalEntityId = selectedUnit !== null ? `fold-${selectedUnit}` : null;
  const onPortalEntityChange = useCallback((id: string | null) => {
    if (id === null) {
      setSelectedUnit(null);
      return;
    }
    const match = /^fold-(\d+)$/.exec(id);
    if (match) setSelectedUnit(Number(match[1]));
  }, []);

  const predict = useMemo(
    () => (x1: number, x2: number) => predictProbaMuted(net, x1, x2, muted),
    [net, muted],
  );
  const loss = logLoss(net, xorData);
  const acc = useMemo(
    () => xorData.filter((d) => (predict(d.x1, d.x2) >= 0.5 ? 1 : 0) === d.y).length / xorData.length,
    [predict],
  );

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
                One unit = one fold — it can&apos;t draw the X, so it stalls near a single line.
              </p>
            )}
          </div>

          {selectedUnit !== null && (
            <div className="rounded-lg border border-[var(--viz-param)] bg-sunken p-3">
              <p className="font-mono text-[11px] tracking-wide text-[var(--viz-param-ink)] uppercase">
                Fold {selectedUnit + 1} · half-space boundary
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                The dashed line is where this unit&apos;s pre-activation crosses zero — one fold of feature space.
              </p>
              <button
                type="button"
                onClick={() => toggleMute(selectedUnit)}
                className="mt-2 rounded-full border border-line px-3 py-1 text-xs text-ink-muted hover:bg-raised"
              >
                {muted.has(selectedUnit) ? "Unmute this fold" : "Mute this fold"}
              </button>
            </div>
          )}

          <StatGrid
            direction="col"
            caption={`${epoch} training steps`}
            stats={[
              { label: "loss", value: loss.toFixed(3), hue: "var(--viz-error-ink)", note: "cross-entropy, falling as it learns" },
              { label: "accuracy on XOR", value: `${Math.round(acc * 100)}%`, hue: "var(--viz-truth-ink)", note: hidden === 1 ? "one fold tops out ~75%" : acc >= 0.9 ? "folds reach the X" : "training — folds are bending" },
              { label: "active folds", value: `${hidden - muted.size}/${hidden}`, hue: "var(--viz-param)", note: "muted units contribute zero" },
            ]}
          />
        </div>

        <div className="mt-6 lg:mt-0">
          <RepresentationPortal
            activeEntityId={portalEntityId}
            onActiveEntityChange={onPortalEntityChange}
          >
            <div className="flex flex-col gap-4">
              <PortalView label="Feature space · XOR folds">
                <FeatureFoldField
                  net={net}
                  points={xorData}
                  muted={muted}
                  selectedUnit={selectedUnit}
                  width={520}
                  height={420}
                />
              </PortalView>
              <PortalView label="Network · click a hidden fold">
                <div className="mx-auto w-full max-w-[320px]">
                  <NetworkDiagram
                    net={net}
                    selectedUnit={selectedUnit}
                    mutedUnits={muted}
                    onSelectUnit={setSelectedUnit}
                  />
                </div>
              </PortalView>
            </div>
          </RepresentationPortal>
          <p className="mt-2 text-center text-xs text-ink-faint">
            Each hidden unit is one fold of feature space — click to inspect, mute to see what it contributes
          </p>
        </div>
      </div>
    </div>
  );
}
