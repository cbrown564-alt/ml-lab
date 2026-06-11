import Link from "next/link";
import { LinearRegressionLab } from "@/components/exhibits/LinearRegressionLab";

/**
 * Linear-regression exhibit, v1 (interactive experiment only — narrative,
 * audio, math drawer, and assessments arrive in later iterations; the
 * completeness model keeps this honest as a partial exhibit).
 */
export default function LinearRegressionExhibit() {
  return (
    <main className="mx-auto w-full max-w-4xl px-8 py-16">
      <nav className="mb-10 text-sm">
        <Link href="/" className="text-ink-faint hover:text-ink-muted">
          ← ML Lab
        </Link>
      </nav>

      <p className="font-mono text-sm tracking-widest text-ink-faint uppercase">
        Supervised · Algorithm
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Linear Regression</h1>
      <p className="mt-4 max-w-[65ch] text-lg leading-relaxed text-ink-muted">
        The straight line that started it all. Before the math, get your hands
        on it: every point below is data the line must answer to, and the line
        you see is always the best one available — for a very particular
        meaning of “best.”
      </p>

      <div className="mt-10">
        <LinearRegressionLab />
      </div>

      <p className="mt-8 max-w-[65ch] text-sm leading-relaxed text-ink-faint">
        Exhibit under construction: narrative, audio, the math drawer, and
        concept checks are on their way. The experiment above is the real
        thing — the same implementation our tests verify against scikit-learn.
      </p>
    </main>
  );
}
