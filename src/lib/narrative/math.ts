/**
 * Math-drawer types (docs/01-vision.md, exhibit anatomy): the formal
 * treatment available on demand, after the intuition is built. Same
 * philosophy as the narrative types — plain data, no markup pipeline.
 * Equations are carefully set Unicode strings (ŷ, Σ, ∂, η, x̄): honest,
 * dependency-free typesetting; a TeX pipeline arrives only if Phase 3's
 * math exhibits demand one.
 */

export type MathBlock =
  | { kind: "prose"; text: string }
  | { kind: "equation"; lines: string[]; caption?: string };

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
