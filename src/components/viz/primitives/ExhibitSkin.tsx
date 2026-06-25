"use client";

import {
  createContext,
  useContext,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { VizHue } from "@/lib/exhibit/spine";
import { hueMark } from "./shared";

type ExhibitSkinValue = {
  motif: string;
  accentHue: VizHue;
  accentMark: string;
};

const ExhibitSkinContext = createContext<ExhibitSkinValue | null>(null);

/** Read concept-specific skin tokens inside an ExhibitSkin wrapper. */
export function useExhibitSkin(): ExhibitSkinValue {
  const ctx = useContext(ExhibitSkinContext);
  if (!ctx) {
    throw new Error("useExhibitSkin must be used within <ExhibitSkin>");
  }
  return ctx;
}

type MotifKind = "grid" | "dots" | "waves" | "none";

/**
 * IDENTITY/NAV — Exhibit skin (visual-standards audit).
 *
 * Concept-specific material or motif layered over global semantic colors — the
 * exhibit's texture without redefining prediction/truth/error/param meaning.
 */
export function ExhibitSkin({
  children,
  motif = "grid",
  accentHue = "param",
  className = "",
  style,
}: {
  children: ReactNode;
  /** Background texture motif; hues still come from the global grammar. */
  motif?: MotifKind;
  /** Secondary accent layered on top of semantic marks. */
  accentHue?: VizHue;
  className?: string;
  style?: CSSProperties;
}) {
  const accentMark = hueMark(accentHue);
  const value = useMemo<ExhibitSkinValue>(
    () => ({ motif, accentHue, accentMark }),
    [motif, accentHue, accentMark],
  );

  const motifStyle = motifBackground(motif, accentMark);

  return (
    <ExhibitSkinContext.Provider value={value}>
      <div
        className={`relative ${className}`}
        style={{
          ...motifStyle,
          ...style,
        }}
        data-exhibit-motif={motif}
      >
        {children}
      </div>
    </ExhibitSkinContext.Provider>
  );
}

function motifBackground(
  motif: MotifKind,
  accent: string,
): CSSProperties {
  switch (motif) {
    case "grid":
      return {
        backgroundImage: `
          linear-gradient(color-mix(in oklab, ${accent} 8%, transparent) 1px, transparent 1px),
          linear-gradient(90deg, color-mix(in oklab, ${accent} 8%, transparent) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(circle, color-mix(in oklab, ${accent} 18%, transparent) 1px, transparent 1px)`,
        backgroundSize: "16px 16px",
      };
    case "waves":
      return {
        backgroundImage: `repeating-linear-gradient(
          135deg,
          transparent,
          transparent 12px,
          color-mix(in oklab, ${accent} 6%, transparent) 12px,
          color-mix(in oklab, ${accent} 6%, transparent) 13px
        )`,
      };
    case "none":
      return {};
    default: {
      const _exhaustive: never = motif;
      return _exhaustive;
    }
  }
}
