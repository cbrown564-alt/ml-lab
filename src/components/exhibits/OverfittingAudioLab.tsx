"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Axes, DataPoints, Plot, usePlot } from "@/components/viz/Plot";
import { PolyCurve } from "@/components/viz/PolyCurve";
import { StatGrid } from "@/components/viz/StatGrid";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import type { Point } from "@/lib/models/linear-regression";
import { predictCheb } from "@/lib/models/polynomial";
import {
  audioParamsFor,
  buildOverfittingSweep,
  heldOutMinimum,
  type AudioVoiceParams,
  type OverfittingAudioParams,
  type OverfittingSweepPoint,
} from "@/lib/models/overfitting-audio";
import fixtures from "@/lib/models/fixtures/polynomial.json";

const TRAIN = fixtures.train as Point[];
const HELD_OUT = fixtures.test as Point[];
const SWEEP = buildOverfittingSweep(TRAIN, HELD_OUT);
const BEST = heldOutMinimum(SWEEP);

type Mix = "both" | "training" | "held-out";

type VoiceNodes = {
  carrier: OscillatorNode;
  filter: BiquadFilterNode;
  tremolo: GainNode;
  mix: GainNode;
  modulator: OscillatorNode;
  modulation: GainNode;
};

type Instrument = {
  context: AudioContext;
  training: VoiceNodes;
  heldOut: VoiceNodes;
};

function ramp(param: AudioParam, value: number, context: AudioContext) {
  const now = context.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + 0.06);
}

function createVoice(
  context: AudioContext,
  output: AudioNode,
  kind: OscillatorType,
  pan: number,
): VoiceNodes {
  const carrier = context.createOscillator();
  const filter = context.createBiquadFilter();
  const tremolo = context.createGain();
  const mix = context.createGain();
  const modulator = context.createOscillator();
  const modulation = context.createGain();
  const panner = context.createStereoPanner();

  carrier.type = kind;
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  tremolo.gain.value = 0.026;
  mix.gain.value = 1;
  panner.pan.value = pan;

  carrier.connect(filter).connect(tremolo).connect(mix).connect(panner).connect(output);
  modulator.connect(modulation).connect(tremolo.gain);
  carrier.start();
  modulator.start();

  return { carrier, filter, tremolo, mix, modulator, modulation };
}

function setVoice(voice: VoiceNodes, params: AudioVoiceParams, context: AudioContext) {
  ramp(voice.carrier.frequency, params.frequency, context);
  ramp(voice.filter.frequency, params.filterHz, context);
  ramp(voice.modulator.frequency, params.modulationHz, context);
  ramp(voice.modulation.gain, params.modulationDepth, context);
}

function updateInstrument(
  instrument: Instrument,
  params: OverfittingAudioParams,
  mix: Mix,
) {
  setVoice(instrument.training, params.training, instrument.context);
  setVoice(instrument.heldOut, params.heldOut, instrument.context);
  ramp(instrument.training.mix.gain, mix === "held-out" ? 0 : 1, instrument.context);
  ramp(instrument.heldOut.mix.gain, mix === "training" ? 0 : 1, instrument.context);
}

async function createInstrument(params: OverfittingAudioParams, mix: Mix) {
  const AudioContextCtor = window.AudioContext;
  if (!AudioContextCtor) throw new Error("Web Audio is not available in this browser.");
  const context = new AudioContextCtor();
  const master = context.createGain();
  const limiter = context.createDynamicsCompressor();
  master.gain.value = 0.55;
  limiter.threshold.value = -18;
  limiter.knee.value = 8;
  limiter.ratio.value = 8;
  master.connect(limiter).connect(context.destination);

  const instrument: Instrument = {
    context,
    training: createVoice(context, master, "triangle", -0.28),
    heldOut: createVoice(context, master, "sine", 0.28),
  };
  updateInstrument(instrument, params, mix);
  await context.resume();
  return instrument;
}

function TestPoints() {
  const { x, y } = usePlot();
  return (
    <g aria-hidden>
      {HELD_OUT.map((point, index) => (
        <circle
          key={index}
          cx={x(point.x)}
          cy={y(point.y)}
          r={3.7}
          fill="none"
          stroke="var(--viz-truth)"
          strokeWidth={1.3}
          strokeOpacity={0.58}
        />
      ))}
    </g>
  );
}

function ErrorTrace({ row }: { row: OverfittingSweepPoint }) {
  const width = 440;
  const height = 190;
  const margin = { left: 38, right: 12, top: 18, bottom: 28 };
  const errors = SWEEP.flatMap((point) => [point.trainError, point.heldOutError]);
  const low = Math.log10(Math.min(...errors));
  const high = Math.log10(Math.max(...errors));
  const x = (degree: number) =>
    margin.left + ((degree - 1) / (SWEEP.length - 1)) * (width - margin.left - margin.right);
  const y = (error: number) =>
    height - margin.bottom -
    ((Math.log10(error) - low) / (high - low)) * (height - margin.top - margin.bottom);
  const path = (key: "trainError" | "heldOutError") =>
    SWEEP.map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(point.degree).toFixed(1)} ${y(point[key]).toFixed(1)}`,
    ).join(" ");

  return (
    <figure className="border-t border-line pt-4">
      <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-ink">The two error trajectories</span>
        <span className="font-mono text-[11px] text-ink-faint">log scale · fixed domain</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Training and held-out error across degree 1 through 12 on a log scale. Held-out error is lowest at degree ${BEST.degree}. The current degree is ${row.degree}.`}
        className="h-auto w-full"
      >
        <line x1={margin.left} x2={width - margin.right} y1={height - margin.bottom} y2={height - margin.bottom} stroke="var(--line)" />
        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={height - margin.bottom} stroke="var(--line)" />
        <line x1={x(BEST.degree)} x2={x(BEST.degree)} y1={margin.top} y2={height - margin.bottom} stroke="var(--accent)" strokeDasharray="3 4" strokeOpacity={0.65} />
        <line x1={x(row.degree)} x2={x(row.degree)} y1={margin.top} y2={height - margin.bottom} stroke="var(--viz-param)" strokeWidth={1.8} />
        <path d={path("trainError")} fill="none" stroke="var(--viz-neutral)" strokeWidth={2.2} strokeLinejoin="round" />
        <path d={path("heldOutError")} fill="none" stroke="var(--viz-error)" strokeWidth={2.5} strokeLinejoin="round" />
        <circle cx={x(row.degree)} cy={y(row.trainError)} r={4} fill="var(--viz-neutral)" />
        <circle cx={x(row.degree)} cy={y(row.heldOutError)} r={4.5} fill="var(--viz-error)" />
        <text x={margin.left} y={height - 8} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">degree 1</text>
        <text x={width - margin.right} y={height - 8} textAnchor="end" fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">12</text>
        <text x={8} y={margin.top + 2} fontSize={10} fontFamily="var(--font-mono)" fill="var(--ink-faint)">error</text>
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
        <span><span aria-hidden style={{ color: "var(--viz-neutral)" }}>━</span> training · lower voice</span>
        <span><span aria-hidden style={{ color: "var(--viz-error)" }}>━</span> held-out · higher voice</span>
      </div>
    </figure>
  );
}

function stateSentence(row: OverfittingSweepPoint) {
  if (row.degree < BEST.degree) {
    return `Degree ${row.degree}: training and held-out error are both falling.`;
  }
  if (row.degree === BEST.degree) {
    return `Degree ${row.degree}: held-out error reaches its minimum.`;
  }
  return `Degree ${row.degree}: training error keeps falling while held-out error rises. The gap is overfitting.`;
}

export function OverfittingAudioLab() {
  const [degree, setDegree] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [mix, setMix] = useState<Mix>("both");
  const [learnerMark, setLearnerMark] = useState<number>();
  const [audioError, setAudioError] = useState<string>();
  const [reducedMotion, setReducedMotion] = useState(false);
  const instrumentRef = useRef<Instrument | null>(null);
  const row = SWEEP[degree - 1];
  const params = useMemo(() => audioParamsFor(row, SWEEP), [row]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (instrumentRef.current) updateInstrument(instrumentRef.current, params, mix);
  }, [params, mix]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setDegree((current) => {
        if (current >= SWEEP.length) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const suspend = () => {
      if (document.hidden) {
        setPlaying(false);
        void instrumentRef.current?.context.suspend();
      }
    };
    document.addEventListener("visibilitychange", suspend);
    return () => document.removeEventListener("visibilitychange", suspend);
  }, []);

  useEffect(() => () => {
    void instrumentRef.current?.context.close();
    instrumentRef.current = null;
  }, []);

  const record = () =>
    whenHydrated(() => useLearner.getState().recordPractice("overfitting-regularization"));

  const enableAudio = async () => {
    setAudioError(undefined);
    try {
      const instrument = await createInstrument(params, mix);
      instrumentRef.current = instrument;
      setAudioEnabled(true);
      record();
      return true;
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : "Sound could not start.");
      return false;
    }
  };

  const mute = async () => {
    setPlaying(false);
    const instrument = instrumentRef.current;
    instrumentRef.current = null;
    if (instrument) await instrument.context.close();
    setAudioEnabled(false);
  };

  const changeDegree = (next: number) => {
    setPlaying(false);
    setDegree(Math.max(1, Math.min(SWEEP.length, next)));
    record();
  };

  const togglePlayback = async () => {
    if (!audioEnabled && !(await enableAudio())) return;
    if (instrumentRef.current?.context.state === "suspended") {
      await instrumentRef.current.context.resume();
    }
    if (degree === SWEEP.length) setDegree(1);
    setPlaying((value) => !value);
    record();
  };

  const markFeedback = learnerMark === undefined
    ? undefined
    : Math.abs(learnerMark - BEST.degree) <= 1
      ? `You marked degree ${learnerMark}. Yes—the turn is around degree ${BEST.degree}, where held-out error stops improving even as training error keeps falling.`
      : learnerMark < BEST.degree
        ? `You marked degree ${learnerMark}. Both errors are still improving there. Listen and look near degree ${BEST.degree}, where the held-out trajectory reverses.`
        : `You marked degree ${learnerMark}. Overfitting is obvious there, but it began earlier—near degree ${BEST.degree}, when held-out error first turned upward.`;

  return (
    <section className="rounded-xl border border-line bg-raised p-6" aria-labelledby="hear-gap-title">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-[65ch]">
          <h3 id="hear-gap-title" className="text-2xl font-semibold">Hear the gap</h3>
          <p className="mt-2 leading-relaxed text-ink-muted">
            Raise model complexity and follow two streams. The lower voice carries training
            error; the higher voice carries held-out error. Rougher means more error. The
            mapping is authored to reveal relative change—read the values for exact numbers.
          </p>
        </div>
        <button
          type="button"
          onClick={audioEnabled ? () => void mute() : () => void enableAudio()}
          aria-pressed={audioEnabled}
          className={audioEnabled
            ? "rounded-full border border-line px-5 py-2 text-sm font-medium text-ink-muted hover:border-ink-faint hover:text-ink"
            : "rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink"}
        >
          {audioEnabled ? "Mute sound" : "Start sound"}
        </button>
      </div>

      {audioError && <p role="alert" className="mt-3 text-sm text-[var(--viz-error-ink)]">{audioError}</p>}

      <div className="mt-7 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)] lg:items-start lg:gap-8">
        <div>
          <Plot
            width={680}
            height={430}
            xDomain={[0, 1]}
            yDomain={[-1.8, 1.8]}
            ariaLabel={`Degree ${degree} polynomial. Training error ${row.trainError.toFixed(3)}; held-out error ${row.heldOutError.toFixed(3)}. ${stateSentence(row)}`}
          >
            <Axes />
            <TestPoints />
            <PolyCurve predict={(x) => predictCheb(row.model, x)} />
            <DataPoints points={TRAIN} />
          </Plot>
        </div>

        <div className="mt-6 flex flex-col gap-5 lg:mt-0">
          <div>
            <label htmlFor="overfitting-degree" className="flex items-baseline justify-between gap-3 text-sm text-ink-muted">
              <span>Model complexity</span>
              <span className="font-mono tabular-nums text-[var(--viz-param-ink)]">degree {degree}</span>
            </label>
            <input
              id="overfitting-degree"
              type="range"
              min={1}
              max={SWEEP.length}
              step={1}
              value={degree}
              onChange={(event) => changeDegree(Number(event.target.value))}
              className="mt-2 w-full accent-[var(--viz-param)]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void togglePlayback()}
              disabled={reducedMotion}
              title={reducedMotion ? "Automatic sweep is disabled by your reduced-motion preference." : undefined}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted hover:border-ink-faint hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
            >
              {playing ? "Pause" : "Play sweep"}
            </button>
            <button type="button" onClick={() => changeDegree(degree - 1)} disabled={degree === 1} aria-label="Previous degree" className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted hover:border-ink-faint hover:text-ink disabled:opacity-40">← Step</button>
            <button type="button" onClick={() => changeDegree(degree + 1)} disabled={degree === SWEEP.length} aria-label="Next degree" className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted hover:border-ink-faint hover:text-ink disabled:opacity-40">Step →</button>
          </div>

          <div>
            <p className="text-sm text-ink-muted">Listen to</p>
            <div role="group" aria-label="Choose audio streams" className="mt-2 inline-flex rounded-full border border-line p-0.5 text-sm">
              {(["training", "both", "held-out"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mix === value}
                  onClick={() => setMix(value)}
                  className={`rounded-full px-3 py-1.5 ${mix === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"}`}
                >
                  {value === "held-out" ? "Held-out" : value[0].toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <StatGrid
            direction="col"
            caption={`Degree ${degree} · same state in sound and sight`}
            stats={[
              { label: "training error", value: row.trainError.toFixed(3), hue: "var(--viz-neutral-ink)", note: "lower voice" },
              { label: "held-out error", value: row.heldOutError.toFixed(3), hue: "var(--viz-error-ink)", note: "higher voice" },
            ]}
          />

          <div className="border-t border-line pt-4">
            <p className="leading-relaxed text-ink" aria-live="off">{stateSentence(row)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setLearnerMark(degree);
                  record();
                }}
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-ink"
              >
                Mark the turn here
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setDegree(1);
                  setLearnerMark(undefined);
                }}
                className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted hover:border-ink-faint hover:text-ink"
              >
                Reset
              </button>
            </div>
            {markFeedback && <p role="status" className="mt-3 text-sm leading-relaxed text-ink-muted">{markFeedback}</p>}
          </div>
        </div>
      </div>

      <div className="mt-7">
        <ErrorTrace row={row} />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Sound is optional, starts only when you ask, and contains no generated voice or external request.
        Stereo position is only a supporting cue; timbre, labels, traces, and values carry the same distinction.
      </p>
    </section>
  );
}
