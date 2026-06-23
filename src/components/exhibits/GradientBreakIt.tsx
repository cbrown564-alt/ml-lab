"use client";

import { useEffect, useState } from "react";
import { GradientField } from "@/components/viz/GradientField";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { ascend, PEAKS, surface, type Vec2 } from "@/lib/models/gradient";

/**
 * The interactive "Break it" lab: greedy gradient ascent is blind beyond the local
 * slope, and it fails two distinguishable ways. Drop a start and release — it steps along
 * +∇f until the gradient vanishes. From the lower-left basin it's trapped on the shorter
 * hill (a local optimum, ∇f = 0 at a non-global peak). Drop it far out on the flat and the
 * steps shrink to a crawl — a vanishing gradient, ∇f tiny *far* from any peak. Drag the
 * start to the tall basin and the same rule reaches the true summit. Two failures, one
 * boundary: a small gradient at an optimum is good; a small gradient anywhere else is stuck.
 */
const GLOBAL_F = 1.5;
const NEAR_PEAK = 0.7; // within this of a summit counts as "reached it"
const CRAWL_STEPS = 50; // a climb this long crept there — a vanishing-gradient crawl
const TALL = PEAKS.reduce((a, b) => (a.height > b.height ? a : b));

type Phase = "armed" | "trapped" | "summit" | "stalled";

const distTo = (p: Vec2, cx: number, cy: number) => Math.hypot(p.x - cx, p.y - cy);

export function GradientBreakIt() {
  const [start, setStart] = useState<Vec2>({ x: -2.0, y: -1.4 });
  const [result, setResult] = useState<{ path: Vec2[]; settled: Vec2 } | null>(null);
  const [seenTrap, setSeenTrap] = useState(false);
  const [seenStall, setSeenStall] = useState(false);

  const settled = result?.settled ?? null;
  const atTall = settled ? distTo(settled, TALL.cx, TALL.cy) < NEAR_PEAK : false;
  // A long climb means the gradient was tiny most of the way — a flat-region crawl.
  const crawled = !!result && result.path.length > CRAWL_STEPS;

  const phase: Phase = !result ? "armed" : crawled ? "stalled" : atTall ? "summit" : "trapped";

  if (phase === "trapped" && !seenTrap) setSeenTrap(true);
  if (phase === "stalled" && !seenStall) setSeenStall(true);
  useEffect(() => {
    if (seenTrap) reportTaskEvent("the-gradient:local-max-trap");
  }, [seenTrap]);
  useEffect(() => {
    if (seenStall) reportTaskEvent("the-gradient:vanishing-gradient");
  }, [seenStall]);

  const moveStart = (p: Vec2) => {
    whenHydrated(() => useLearner.getState().recordPractice("the-gradient"));
    setStart(p);
    setResult(null);
  };
  const release = () => {
    whenHydrated(() => useLearner.getState().recordPractice("the-gradient"));
    setResult(ascend(start));
  };

  const status =
    phase === "trapped"
      ? "Trapped on the lower hill"
      : phase === "summit"
        ? "Reached the true summit"
        : phase === "stalled"
          ? "Stalled — crawling on the flat"
          : "Drag the start, then release";
  const statusTone = phase === "summit" ? "border-accent text-accent" : phase === "armed" ? "border-line text-ink-faint" : "border-[var(--viz-error)] text-[var(--viz-error-ink)]";

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <Guidance phase={phase} />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={release}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90"
            >
              Release ▶ run the climb
            </button>
            <span role="status" className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${statusTone}`}>
              {status}
            </span>
          </div>

          {result && (
            <p className="font-mono text-xs text-ink-faint tabular-nums">
              {phase === "stalled"
                ? `crawled ${result.path.length} tiny steps · ∇f tiny the whole way`
                : `settled at height ${surface(result.settled.x, result.settled.y).toFixed(2)} of ${GLOBAL_F.toFixed(2)} · gradient there ≈ 0`}
            </p>
          )}
          <p className="text-sm leading-relaxed text-ink-faint">
            The hollow ring is where you dropped it; the trail is the greedy climb; the gold
            dot is where it stopped. Try the lower-left basin, the tall basin, and far out on
            the dark flat.
          </p>
        </div>

        <div className="mt-6 lg:mt-0">
          <GradientField point={start} onMove={moveStart} path={result?.path} width={520} height={520} />
        </div>
      </div>
    </div>
  );
}

function Guidance({ phase }: { phase: Phase }) {
  if (phase === "summit") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Repaired ✓</p>
        <p className="mt-2 leading-relaxed text-ink">
          From this basin the very same rule reaches the <span className="font-medium text-accent">true summit</span>. The gradient
          didn&apos;t get any smarter — you changed where the climb <span className="font-medium">started</span>. That&apos;s why
          initialisation matters, and why training is run from many starts.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Boundary:</span> a vanishing gradient here
          really is the answer — it&apos;s the top. The failure is a small gradient
          <span className="italic"> away</span> from an optimum, not at one.
        </p>
      </div>
    );
  }
  if (phase === "stalled") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · a different break</p>
        <p className="mt-2 leading-relaxed text-ink">
          Out on the flat the climb <span className="font-medium text-[var(--viz-error-ink)]">creeps</span> — hundreds of tiny steps to
          go anywhere. The gradient is tiny here, so each step η·∇f is tiny, and progress
          slows to a near-stall.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> this is a{" "}
          <span className="font-medium">vanishing gradient</span> — small not because you&apos;ve
          arrived, but because the surface is flat. Descent moves by η·∇f, so it starves of
          signal. <span className="font-medium text-ink">Repair:</span> normalise inputs,
          keep activations unsaturated, add momentum — anything that keeps the gradient alive.
        </p>
      </div>
    );
  }
  if (phase === "trapped") {
    return (
      <div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--viz-error-ink)] uppercase">Symptom · it broke</p>
        <p className="mt-2 leading-relaxed text-ink">
          The climb stopped — the gradient vanished — but it&apos;s parked on the{" "}
          <span className="font-medium text-[var(--viz-error-ink)]">shorter hill</span>, not the tallest. Greedy ascent found{" "}
          <span className="italic">a</span> peak, not <span className="italic">the</span> peak.
        </p>
        <p className="mt-3 leading-relaxed text-ink-muted">
          <span className="font-medium text-ink">Diagnose:</span> a zero gradient marks a
          stationary point — global summit, a lower local one, or a saddle. The gradient only
          sees the local slope. <span className="font-medium text-ink">Repair:</span> drag the
          start into the tall basin and release again — or, far out on the flat, see the{" "}
          <span className="italic">other</span> failure.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Arm it</p>
      <p className="mt-2 leading-relaxed text-ink">
        Drop a point and release a greedy climb: it steps along +∇f until the gradient
        vanishes. The start sits in the lower-left basin — predict which peak it reaches, then
        release and watch. (Then try far out on the dark flat.)
      </p>
    </div>
  );
}
