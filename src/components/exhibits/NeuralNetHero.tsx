"use client";

import { useEffect, useMemo, useState } from "react";
import { FeatureFoldField } from "@/components/viz/FeatureFoldField";
import { accuracy, initNet, train, type Net } from "@/lib/models/neural-net";
import { NN_LR, xorData } from "@content/exhibits/neural-network-fundamentals/experiment";

/**
 * The specimen hero — hidden units as half-space folds that progressively bend
 * feature space into the XOR X. On load each fold line appears in turn; the
 * decision boundary morphs from a useless straight split into the solved shape.
 * One living field, not a before/after diptych.
 */

const SOLVED: Net = train(initNet(4, 6), xorData, NN_LR, 900).net;
const ACC = Math.round(accuracy(SOLVED, xorData) * 100);
const UNIT_COUNT = SOLVED.W1.length;
const DURATION = 1600;

export function NeuralNetHero() {
  const [foldCount, setFoldCount] = useState(0);
  const [reveal, setReveal] = useState(0);

  const visibleUnits = useMemo(() => {
    const s = new Set<number>();
    for (let j = 0; j < foldCount; j++) s.add(j);
    return s;
  }, [foldCount]);

  const muted = useMemo(() => {
    const s = new Set<number>();
    for (let j = foldCount; j < UNIT_COUNT; j++) s.add(j);
    return s;
  }, [foldCount]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => {
        setFoldCount(UNIT_COUNT);
        setReveal(1);
      });
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 2.2);
      setFoldCount(Math.min(UNIT_COUNT, Math.ceil(eased * UNIT_COUNT)));
      setReveal(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const arm = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 320);
    return () => {
      window.clearTimeout(arm);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-raised">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-2.5">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Neural networks
        </span>
        <span className="hidden font-mono text-[11px] tracking-widest text-ink-faint uppercase sm:inline">
          {foldCount < UNIT_COUNT ? "each hidden unit folds the space" : `${ACC}% on XOR`}
        </span>
      </figcaption>
      <div className="px-3 py-3" style={{ opacity: 0.35 + reveal * 0.65, transition: "opacity 400ms ease" }}>
        <FeatureFoldField
          net={SOLVED}
          points={xorData}
          muted={muted}
          visibleUnits={visibleUnits}
          width={1200}
          height={400}
          bare
        />
      </div>
      <p className="sr-only">
        {foldCount} of {UNIT_COUNT} hidden-unit folds revealed. With all folds active the network reaches {ACC}% accuracy on XOR.
      </p>
    </figure>
  );
}
