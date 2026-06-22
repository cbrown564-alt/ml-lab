import type { AudioSection } from "@/lib/narrative/audio";

/**
 * The story spine. An exhibit is not a document with a figure pinned in it; it
 * is one persistent graphic that a sequence of prose beats re-frames as the
 * learner *steps* through them (`StoryStepper` — the Seeing-Theory / Distill
 * model that replaced the original R2D3 scroll spine). The spine is that
 * sequence.
 *
 * Prose stays in `narrative.ts` so it remains the single source the narration
 * audio is generated from (C3); a beat references a narrative section by id and
 * adds the three things the canvas-first form needs: the framing the graphic
 * should take at this beat, the key phrases coloured to match their referents on
 * the canvas, and any equation to compose beside the graphic.
 */

/**
 * Visual-grammar hues, bound to the same meaning lab-wide. A term coloured
 * `prediction` is the same blue as the model's line; `truth` the same gold as
 * the data; and so on. Rendered with the `-ink` token siblings so prose stays
 * legible (see globals.css).
 */
export type VizHue = "prediction" | "truth" | "error" | "param" | "neutral";

/** A key phrase in beat prose, coloured to match its referent on the canvas. */
export type Term = { phrase: string; hue: VizHue };

/**
 * One scroll beat. `Frame` is the exhibit-specific description of the canvas
 * state this beat asserts; the lab interprets it (e.g. which scenario to load,
 * which error view to show). It is opaque to the generic scroller and to the
 * frame, and travels to the lab through React context.
 */
export type Beat<Frame> = {
  /** Narrative section id ("hook" or a story id): the prose + audio for this beat. */
  sectionId: string;
  /** Coloured key phrases; each must occur in the section prose, first match wins. */
  terms?: Term[];
  /** The canvas state this beat asserts as it scrolls to centre (object constancy). */
  frame: Frame;
  /** A single equation line composed beside the graphic at this beat (pattern 5). */
  equation?: string;
};

export type Spine<Frame> = Beat<Frame>[];

/** A beat joined with its prose + audio, ready to render. */
export type BeatView<Frame> = Beat<Frame> & {
  heading?: string;
  paragraphs: string[];
  audio?: AudioSection;
};
