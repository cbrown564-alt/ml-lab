"use client";

import { useMemo, useState } from "react";
import { ParamSlider } from "@/components/viz/ParamSlider";
import { DataPoints, Plot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { ErrorCurves } from "@/components/exhibits/ErrorCurves";
import type { Point } from "@/lib/models/linear-regression";
import { polyMSE, predictPoly, ridgeFit } from "@/lib/models/polynomial";
import { biasVarianceExperiment } from "@content/exhibits/bias-variance/experiment";
import fixtures from "@/lib/models/fixtures/polynomial.json";

/**
 * The Explain-it companion. Act continuity: the protagonist is the variance swarm —
 * the fan of bootstrap-resampled fits over the scatter — so it leads here, the same
 * object the learner met in See/Run/Break. The error-vs-complexity U is kept beneath it
 * as the secondary diagnostic the checks still reference.
 *
 * Raise the degree and the swarm fans wider (the model swings with the sample) while the
 * U's test arm climbs — bias falling, variance rising, in one move.
 */
const TRAIN: Point[] = fixtures.train as Point[];
const TEST: Point[] = fixtures.test as Point[];
const DEG = biasVarianceExperiment.params[0];

// Seeded bootstrap, matching the hero so the fan reads as the same protagonist.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bootstrapFits(degree: number, n = 10) {
  const fits: ReturnType<typeof ridgeFit>[] = [];
  for (let s = 0; s < n; s++) {
    const rng = mulberry32(s * 17 + degree);
    const sample = TRAIN.map(() => TRAIN[Math.floor(rng() * TRAIN.length)]);
    fits.push(ridgeFit(sample, degree, 0));
  }
  return fits;
}

export function BiasVarianceCheckLab() {
  const [degree, setDegree] = useState(4);
  const w = useMemo(() => ridgeFit(TRAIN, degree, 0), [degree]);
  const swarm = useMemo(() => bootstrapFits(degree), [degree]);
  const trainErr = polyMSE(TRAIN, w);
  const testErr = polyMSE(TEST, w);
  const kicker =
    degree <= 2 ? "too stiff — underfits" : degree >= 10 ? "too flexible — overfits" : "about right";

  return (
    <figure className="rounded-xl border border-line bg-raised p-5">
      <figcaption className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">
          Answer against the U
        </span>
        <span className="hidden font-mono text-[11px] tracking-wide text-ink-faint uppercase sm:inline">
          deg {degree} · {kicker}
        </span>
      </figcaption>
      <Plot
        width={460}
        height={230}
        xDomain={[-0.02, 1.02]}
        yDomain={[-1.55, 1.55]}
        ariaLabel={`A degree-${degree} polynomial fit (${kicker}). Bootstrap resamples fan out as a variance swarm; raise the degree and the fan widens as test error ${testErr.toFixed(
          2,
        )} climbs.`}
      >
        <g style={{ opacity: 0.55 }} aria-hidden>
          {swarm.map((fit, i) => (
            <PolyCurve key={`${degree}-${i}`} predict={(xv) => predictPoly(fit, xv)} faint />
          ))}
        </g>
        <PolyCurve predict={(xv) => predictPoly(w, xv)} />
        <DataPoints points={TRAIN} />
      </Plot>
      <div className="mt-3 border-t border-line pt-3">
        <ErrorCurves train={TRAIN} test={TEST} degree={degree} maxDegree={DEG.max} width={360} height={150} />
      </div>
      <div className="mt-3 rounded-lg border border-line bg-sunken p-3">
        <ParamSlider def={DEG} value={degree} onChange={(v) => setDegree(Math.round(v))} />
      </div>
      <p className="mt-2 font-mono text-xs text-ink-faint tabular-nums">
        degree {degree} · train {trainErr.toFixed(3)} · test {testErr.toFixed(3)}
      </p>
    </figure>
  );
}
