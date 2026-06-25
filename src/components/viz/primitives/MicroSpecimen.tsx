"use client";

import type { ReactNode } from "react";

/**
 * IDENTITY/NAV — Micro specimen (visual-standards audit).
 *
 * A restrained miniature of the exhibit's defining transformation — the hero
 * portrait grammar (bordered panel, mono figcaption) without full readouts.
 */
export function MicroSpecimen({
  children,
  caption,
  kicker,
  aspectRatio = "21 / 9",
  ariaLabel,
}: {
  children: ReactNode;
  /** Mono figcaption beneath the miniature. */
  caption: string;
  kicker?: string;
  aspectRatio?: string;
  ariaLabel: string;
}) {
  return (
    <figure
      className="overflow-hidden rounded-xl border border-line bg-raised"
      aria-label={ariaLabel}
    >
      {(kicker || caption) && (
        <figcaption className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-2">
          {kicker && (
            <span className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
              {kicker}
            </span>
          )}
          <span className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
            {caption}
          </span>
        </figcaption>
      )}
      <div
        className="flex items-center justify-center overflow-hidden px-2 py-2"
        style={{ aspectRatio }}
      >
        {children}
      </div>
    </figure>
  );
}
