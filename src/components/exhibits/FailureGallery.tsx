import type { FailureCard, FailureGallery as Gallery } from "@/lib/failure/schema";
import { failurePrimitives } from "@content/failures/primitives";

/**
 * The "Break it" surface (product promise: See it · Run it · Break it · Explain
 * it). Each failure is a structured diagnostic card — Trigger → Symptom →
 * Diagnose → Repair → Boundary — bound to a reusable taxonomy primitive
 * (docs/07-failure-taxonomy.md). Most educational products teach the happy path;
 * making failure diagnosis a recognisable, reusable primitive is one of the
 * clearest ways the lab is more useful to a working engineer than a visual
 * explainer. Presentational by design: it teaches the diagnosis; the live
 * reproduction lives one tab over in the open bench.
 */

function Step({
  label,
  tone = "neutral",
  children,
}: {
  label: string;
  tone?: "neutral" | "error" | "accent";
  children: string;
}) {
  const labelColor =
    tone === "error"
      ? "text-[var(--viz-error-ink)]"
      : tone === "accent"
        ? "text-accent"
        : "text-ink-faint";
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[6.5rem_1fr]">
      <dt className={`font-mono text-[10px] tracking-[0.16em] uppercase ${labelColor} pt-0.5`}>
        {label}
      </dt>
      <dd className={tone === "accent" ? "text-[15px] leading-relaxed text-ink" : "text-[15px] leading-relaxed text-ink-muted"}>
        {children}
      </dd>
    </div>
  );
}

function Card({ card }: { card: FailureCard }) {
  const primitive = failurePrimitives[card.primitive];
  return (
    <article className="rounded-xl border border-line bg-raised p-6 sm:p-7">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-line pb-4">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-[var(--viz-error)]"
            aria-hidden
          />
          {card.title}
        </h3>
        <span
          className="rounded-full border border-line bg-sunken px-2.5 py-0.5 font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase"
          title={primitive.gist}
        >
          {primitive.title}
        </span>
      </header>

      <dl className="mt-2 divide-y divide-line">
        <Step label="Trigger">{card.trigger}</Step>
        <Step label="Symptom" tone="error">{card.symptom}</Step>
        <Step label="Diagnose" tone="accent">{card.diagnosis}</Step>
        <Step label="Repair">{card.repair}</Step>
        <Step label="Boundary">{card.boundary}</Step>
      </dl>

      {card.scenarioId && (
        <p className="mt-4 font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">
          Reproduce it live in the Experiment tab
        </p>
      )}
    </article>
  );
}

export function FailureGallery({
  gallery,
  asFieldGuide = false,
}: {
  gallery: Gallery;
  /** When the interactive Break-it lab leads the act, the gallery is the
   * reference catalogue beneath it — the field guide, not the headline. */
  asFieldGuide?: boolean;
}) {
  return (
    <section>
      <div className="max-w-[68ch]">
        {asFieldGuide ? (
          <>
            <p className="font-mono text-xs tracking-[0.18em] text-ink-faint uppercase">
              The field guide
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Every way it breaks
            </h3>
            <p className="mt-2 leading-relaxed text-ink-muted">
              {gallery.intro ??
                "The one you just drove, and the others worth recognising — each as the same drill: what triggers it, the symptom to spot, which assumption gave way, and the repair (and when the repair is itself the wrong move)."}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold tracking-tight">Break it</h2>
            <p className="mt-2 leading-relaxed text-ink-muted">
              {gallery.intro ??
                "The happy path is the easy part. A concept isn't understood until you know its operating envelope — how it breaks, what the symptom looks like, and which assumption gave way. Each card is a failure you can trigger, name, and repair."}
            </p>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {gallery.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
