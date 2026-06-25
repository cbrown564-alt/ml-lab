"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { hueMark, MOTION_QUICK, usePrefersReducedMotion } from "./shared";

type PortalContextValue = {
  activeEntityId: string | null;
  setActiveEntityId: (id: string | null) => void;
  isHighlighted: (id: string) => boolean;
};

const RepresentationPortalContext = createContext<PortalContextValue | null>(
  null,
);

/** Read linked-entity highlight state inside a RepresentationPortal. */
export function useRepresentationPortal(): PortalContextValue {
  const ctx = useContext(RepresentationPortalContext);
  if (!ctx) {
    throw new Error(
      "useRepresentationPortal must be used within <RepresentationPortal>",
    );
  }
  return ctx;
}

/**
 * TRACE/INSPECT — Representation portal (visual-standards audit).
 *
 * Hover or focus an entity in one representation and the corresponding entity
 * highlights everywhere — the learner sees one object persisting across views.
 */
export function RepresentationPortal({
  children,
  activeEntityId: controlledId,
  defaultActiveEntityId = null,
  onActiveEntityChange,
}: {
  children: ReactNode;
  activeEntityId?: string | null;
  defaultActiveEntityId?: string | null;
  onActiveEntityChange?: (id: string | null) => void;
}) {
  const [internal, setInternal] = useState<string | null>(defaultActiveEntityId);
  const activeEntityId = controlledId ?? internal;

  const setActiveEntityId = useCallback(
    (id: string | null) => {
      if (controlledId === undefined) setInternal(id);
      onActiveEntityChange?.(id);
    },
    [controlledId, onActiveEntityChange],
  );

  const value = useMemo<PortalContextValue>(
    () => ({
      activeEntityId,
      setActiveEntityId,
      isHighlighted: (id: string) => activeEntityId === id,
    }),
    [activeEntityId, setActiveEntityId],
  );

  return (
    <RepresentationPortalContext.Provider value={value}>
      {children}
    </RepresentationPortalContext.Provider>
  );
}

/**
 * Slot for one synchronized representation. Wrap entities with
 * {@link PortalEntity} sharing the same `entityId`.
 */
export function PortalView({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className="min-w-0 flex-1">
      <p className="mb-2 font-mono text-[10px] tracking-widest text-ink-faint uppercase">
        {label}
      </p>
      {children}
    </section>
  );
}

/** A single linkable entity inside a portal view. */
export function PortalEntity({
  entityId,
  children,
  hue = "truth",
  className = "",
}: {
  entityId: string;
  children: ReactNode;
  hue?: "prediction" | "truth" | "error" | "param" | "neutral";
  className?: string;
}) {
  const { setActiveEntityId, isHighlighted } = useRepresentationPortal();
  const reduceMotion = usePrefersReducedMotion();
  const highlighted = isHighlighted(entityId);
  const mark = hueMark(hue);

  return (
    <div
      role="button"
      tabIndex={0}
      className={`rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      style={{
        boxShadow: highlighted
          ? `0 0 0 2px ${mark}, 0 0 12px color-mix(in oklab, ${mark} 35%, transparent)`
          : undefined,
        transition: reduceMotion ? undefined : `box-shadow ${MOTION_QUICK}`,
      }}
      onMouseEnter={() => setActiveEntityId(entityId)}
      onMouseLeave={() => setActiveEntityId(null)}
      onFocus={() => setActiveEntityId(entityId)}
      onBlur={() => setActiveEntityId(null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setActiveEntityId(entityId);
      }}
    >
      {children}
    </div>
  );
}
