"use client";

import { useEffect, useState } from "react";
import { GradientField } from "@/components/viz/GradientField";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { useLearner, whenHydrated } from "@/lib/learner/store";
import { ascend, surface, type Vec2 } from "@/lib/models/gradient";

/**
 * The interactive "Break it" lab: greedy gradient ascent is blind beyond the local
 * slope. Drop a start point and release — it climbs along +∇f to the nearest summit and
 * stops where the gradient vanishes. Start in the lower-left basin and it's trapped on
 * the shorter hill; the gradient there is zero, but it isn't the highest point. Drag the
 * start to the other basin and the same rule reaches the true summit — initialisation,
 * not the gradient, decided which. Trigger → symptom → diagnose → repair.
 */
const GLOBAL_F = 1.5;
const TRAP_BELOW = 1.3; // a summit lower than this is the local-max trap

type Phase = "armed" | "trapped" | "summit";

export function GradientBreakIt() {
  const [start, setStart] = useState<Vec2>({ x: -2.0, y: -1.4 });
  const [result, setResult] = useState<{ path: Vec2[]; settled: Vec2 } | null>(null);
  const [hasSeenTrap, setHasSeenTrap] = useState(false);

  const settledF = result ? surface(result.settled.x, result.settled.y) : null;
  const trapped = settledF !== null && settledF < TRAP_BELOW;
  if (trapped && !hasSeenTrap) setHasSeenTrap(true);
  useEffect(() => {
    if (hasSeenTrap) reportTaskEvent("the-gradient:local-max-trap");
  }, [hasSeenTrap]);

  const phase: Phase = !result ? "armed" : trapped ? "trapped" : "summit";

  const moveStart = (p: Vec2) => {
    whenHydrated(() => useLearner.getState().recordPractice("the-gradient"));
    setStart(p);
    setResult(null);
  };
  const release = () => {
    whenHydrated(() => useLearner.getState().recordPractice("the-gradient"));
    setResult(ascend(start));
  };

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
            <span
              role="status"
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide ${
                phase === "trapped" ? "border-[var(--viz-error)] text-[var(--viz-error-ink)]" : phase === "summit" ? "border-accent text-accent" : "border-line text-ink-faint"
              }`}
            >
              {phase === "trapped" ? "Trapped on the lower hill" : phase === "summit" ? "Reached the true summit" : "Drag the start, then release"}
            </span>
          </div>

          {settledF !== null && (
            <p className="font-mono text-xs text-ink-faint tabular-nums">
              settled at height {settledF.toFixed(2)} of {GLOBAL_F.toFixed(2)} · gradient there ≈ 0
            </p>
          )}
          <p className="text-sm leading-relaxed text-ink-faint">
            The hollow ring is where you dropped it; the trail is the greedy climb; the gold
            dot is where the gradient hit zero and it stopped.
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
          <span className="font-medium text-ink">Boundary:</span> on a single smooth bowl
          (one minimum, convex) there&apos;s only one basin, so a vanishing gradient really
          is the answer — the trap is specific to landscapes with more than one hill.
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
          stationary point — it could be the global summit, a lower local one, or a saddle.
          The gradient only sees the local slope; it&apos;s blind to the taller hill across
          the valley. <span className="font-medium text-ink">Repair:</span> drag the start
          into the other basin and release again.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase">Arm it</p>
      <p className="mt-2 leading-relaxed text-ink">
        Drop a point and release a greedy climb: it steps along +∇f until the gradient
        vanishes at a summit. The start sits in the lower-left basin — predict which peak it
        reaches, then release and watch.
      </p>
    </div>
  );
}
