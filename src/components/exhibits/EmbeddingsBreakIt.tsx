"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { reportTaskEvent } from "@/lib/assessment/task-events";
import { EmbeddingMap } from "@/components/viz/EmbeddingMap";
import { StatGrid } from "@/components/viz/StatGrid";
import {
  embeddingTokens,
  learnedDomain,
  nearestByCosine,
} from "@/lib/models/embeddings";
import { analogyFixture } from "@content/exhibits/embeddings/experiment";

type Mode = "one-hot" | "analogy";

export function EmbeddingsBreakIt() {
  const [mode, setMode] = useState<Mode>("one-hot");

  return (
    <div className="rounded-xl border border-line bg-raised p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Which embedding failure to trigger"
          className="inline-flex self-start rounded-full border border-line p-0.5 text-sm"
        >
          {([
            ["One-hot", "one-hot"],
            ["Analogy", "analogy"],
          ] as const).map(([label, value]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-full px-3.5 py-1 transition-colors ${
                mode === value ? "bg-accent text-accent-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="font-mono text-[11px] text-ink-faint">
          {mode === "one-hot"
            ? "failure ① — no geometry, no neighbours"
            : "failure ② — verify the analogy lands"}
        </p>
      </div>
      {mode === "one-hot" ? <OneHotLoop /> : <AnalogyLoop />}
    </div>
  );
}

function OneHotLoop() {
  const [oneHot, setOneHot] = useState(true);

  useEffect(() => {
    if (oneHot) reportTaskEvent("embeddings:one-hot");
  }, [oneHot]);

  const neighbors = useMemo(() => {
    if (oneHot) return [];
    return nearestByCosine("king", embeddingTokens, 3);
  }, [oneHot]);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <Guidance
          tone={oneHot ? "broken" : "ready"}
          kicker={oneHot ? "Symptom · no neighbours" : "Trigger it"}
          body={
            oneHot ? (
              <>
                In a one-hot space every token is an orthogonal corner — cosine similarity is{" "}
                <span className="font-medium text-[var(--viz-error-ink)]">0 everywhere</span>.
                There is no notion of near.
              </>
            ) : (
              "Learned embeddings restore dense geometry — king again has meaningful neighbours."
            )
          }
          foot={
            oneHot ? (
              <>
                <span className="font-medium text-ink">Repair:</span> use dense learned vectors.
              </>
            ) : undefined
          }
        />
        <button
          type="button"
          onClick={() => setOneHot((value) => !value)}
          className="self-start rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-faint"
        >
          {oneHot ? "Repair · learned embeddings" : "Break · one-hot view"}
        </button>
        <StatGrid
          direction="col"
          stats={[
            {
              label: "cos(k,q)",
              value: oneHot ? "0.00" : nearestByCosine("king", embeddingTokens, 1)[0]?.cosine.toFixed(3) ?? "—",
              hue: oneHot ? "var(--viz-error-ink)" : "var(--viz-prediction-ink)",
              note: "king·queen",
            },
          ]}
        />
      </div>
      <EmbeddingMap
        tokens={embeddingTokens}
        layout="learned"
        xDomain={learnedDomain}
        yDomain={learnedDomain}
        selectedId="king"
        neighborIds={neighbors.map((row) => row.token.id)}
        width={560}
        height={360}
        ariaLabel={
          oneHot
            ? "One-hot view: king has no cosine neighbours."
            : "Learned view: king neighbours restored."
        }
      />
    </div>
  );
}

function AnalogyLoop() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <Guidance
        tone="ready"
        kicker="Verify the offset"
        body={
          <>
            Run king − man + woman. Distance to queen:{" "}
            <span className="font-mono tabular-nums text-[var(--viz-prediction-ink)]">
              {analogyFixture.distanceToQueen.toFixed(2)}
            </span>
            . Switch to PCA in Run it to watch the same arithmetic fail.
          </>
        }
      />
      <EmbeddingMap
        tokens={embeddingTokens}
        layout="learned"
        xDomain={learnedDomain}
        yDomain={learnedDomain}
        selectedId="king"
        analogy={{ a: "king", b: "man", c: "woman", target: "queen", showResult: true }}
        width={560}
        height={360}
        ariaLabel="Analogy overlay: king minus man plus woman lands on queen."
      />
    </div>
  );
}

function Guidance({
  tone,
  kicker,
  body,
  foot,
}: {
  tone: "ready" | "broken";
  kicker: string;
  body: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        tone === "broken" ? "border-[var(--viz-error)] bg-[color-mix(in_srgb,var(--viz-error)_8%,transparent)]" : "border-line bg-sunken"
      }`}
    >
      <p className="font-mono text-[11px] tracking-widest text-ink-faint uppercase">{kicker}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
      {foot ? <p className="mt-3 text-sm leading-relaxed text-ink-muted">{foot}</p> : null}
    </div>
  );
}
