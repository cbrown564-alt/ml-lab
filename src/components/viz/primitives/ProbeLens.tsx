"use client";

import {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MOTION_QUICK, usePrefersReducedMotion } from "./shared";

/**
 * TRACE/INSPECT — Probe lens (visual-standards audit).
 *
 * Local detail appears on demand (hover, focus, or tap) so the base graphic stays
 * uncluttered — labels are not permanently baked into the frame.
 */
export function ProbeLens({
  children,
  probe,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  lensSize = 140,
  ariaLabel,
}: {
  /** The clean base graphic without permanent annotation. */
  children: ReactNode;
  /** Detail revealed inside the lens (magnified inset or callout). */
  probe: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  lensSize?: number;
  ariaLabel: string;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);
  const probeId = useId();

  const updatePos = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-lg border border-line bg-raised"
      aria-label={ariaLabel}
      onMouseMove={(e) => {
        if (!open) return;
        updatePos(e.clientX, e.clientY);
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        if (controlledOpen === undefined) setOpen(false);
      }}
    >
      {children}
      <button
        type="button"
        className="absolute bottom-2 right-2 rounded-full border border-line bg-raised/95 px-2.5 py-1 font-mono text-[10px] tracking-wider text-ink-muted uppercase hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-expanded={open}
        aria-controls={probeId}
        onClick={() => setOpen(!open)}
      >
        {open ? "hide detail" : "probe"}
      </button>
      {open && (
        <div
          id={probeId}
          className="pointer-events-none absolute z-10 overflow-hidden rounded-full border-2 shadow-md"
          style={{
            width: lensSize,
            height: lensSize,
            left: `calc(${pos.x * 100}% - ${lensSize / 2}px)`,
            top: `calc(${pos.y * 100}% - ${lensSize / 2}px)`,
            borderColor: "var(--viz-param)",
            background: "var(--surface-raised)",
            transition: reduceMotion ? undefined : `left ${MOTION_QUICK}, top ${MOTION_QUICK}`,
          }}
          role="tooltip"
        >
          {/* Keep content inside the circle's inscribed square (≈0.71×diameter) so
              corners — e.g. a flush-left caption — never clip on the round edge. */}
          <div className="flex h-full w-full items-center justify-center text-center text-xs">
            <div
              className="flex flex-col items-center justify-center"
              style={{ width: lensSize * 0.66, height: lensSize * 0.66 }}
            >
              {probe}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
