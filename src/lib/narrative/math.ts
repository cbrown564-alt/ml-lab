/**
 * Math-view types (docs/01-vision.md, exhibit anatomy): the formal treatment
 * composed as its own act — "math beside its consequence" (Stream 2, pattern 5),
 * not a sealed drawer. Same philosophy as the narrative types: plain data, no
 * markup pipeline. Equations are carefully set Unicode strings (ŷ, Σ, ∂, η, x̄):
 * honest, dependency-free typesetting; a TeX pipeline arrives only if Phase 3's
 * math exhibits demand one.
 *
 * `highlights` carry the canvas's colour grammar into the symbols themselves: a
 * substring tinted to the hue of its mark on the graphic (η in param-purple, the
 * miss ŷ−y in error-red), always with weight so colour is never the only cue.
 * A `widget` block drops a live instrument into the prose so a claim — "this is
 * the speed limit" — becomes a thing the reader can cross, not just read.
 */

import type { VizHue } from "@/lib/exhibit/spine";

/** A literal substring of a block's text, tinted to a visual-grammar hue. */
export type MathHighlight = { text: string; hue: VizHue };

/** Reference marks drawn on a stability scale (e.g. the rates the story used). */
export type StabilityMark = {
  eta: number;
  label: string;
  /** Which side of the cliff this mark sits on — sets its colour and gloss. */
  tone: "safe" | "danger";
};

/** A 1-D stability number-line: where a stride tips from convergence to blow-up. */
export type StabilityConfig = {
  /** η ceiling — the cliff; strides below converge, strides above explode. */
  etaCritical: number;
  /** Right edge of the axis. */
  max: number;
  /** Where the draggable stride marker starts. */
  defaultEta: number;
  /** Fixed reference strides to annotate (the rates the story walked). */
  marks: StabilityMark[];
};

/** A draggable miss whose squared penalty grows as a visible area (r → r²). */
export type PenaltyConfig = {
  /** Right edge of the residual (miss) axis. */
  maxResidual: number;
  /** Where the draggable miss starts. */
  defaultResidual: number;
};

export type MathBlock =
  | { kind: "prose"; text: string; highlights?: MathHighlight[] }
  | { kind: "equation"; lines: string[]; caption?: string; highlights?: MathHighlight[] }
  | { kind: "widget"; widget: "stability"; config: StabilityConfig }
  | { kind: "widget"; widget: "penalty"; config: PenaltyConfig };

export type MathDrawerSection = {
  id: string;
  heading: string;
  blocks: MathBlock[];
};

export type MathDrawerContent = {
  nodeId: string;
  /** One sentence, outside the drawer, saying what's inside and for whom. */
  invitation: string;
  sections: MathDrawerSection[];
  /** Math-foundation nodes this treatment leans on (Phase 3 territory). */
  mathNodeIds: string[];
};
