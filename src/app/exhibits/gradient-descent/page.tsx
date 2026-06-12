import Link from "next/link";
import { GradientDescentLab } from "@/components/exhibits/GradientDescentLab";

/**
 * Gradient-descent exhibit, v1 (interactive experiment only — narrative,
 * audio, math drawer, and assessments arrive in later iterations; the
 * completeness model keeps this honest as a partial exhibit).
 */
export default function GradientDescentExhibit() {
  return (
    <main className="mx-auto w-full max-w-5xl px-8 py-16">
      <nav className="mb-10 text-sm">
        <Link href="/" className="text-ink-faint hover:text-ink-muted">
          ← ML Lab
        </Link>
      </nav>

      <p className="font-mono text-sm tracking-widest text-ink-faint uppercase">
        Optimization · Algorithm
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Gradient Descent</h1>
      <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-ink-muted">
        The engine under nearly everything. A model starts out wrong, measures
        exactly how wrong, and takes one small step downhill — then does it
        again, a few thousand times. Here you hold the clock: step, play,
        scrub back through time, and turn the one knob that decides whether
        the walk converges, crawls, or explodes.
      </p>

      <div className="mt-10">
        <GradientDescentLab />
      </div>

      <p className="mt-8 max-w-[65ch] text-sm leading-relaxed text-ink-faint">
        Exhibit under construction: narrative, audio, the math drawer, and
        concept checks are on their way. The experiment above is the real
        thing — the same step-able implementation our tests verify against
        scikit-learn, and every scenario&rsquo;s claim is itself under test.
      </p>
    </main>
  );
}
