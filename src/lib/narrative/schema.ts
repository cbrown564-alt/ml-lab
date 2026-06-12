/**
 * Narrative types (docs/01-vision.md, exhibit anatomy). Plain prose strings,
 * deliberately: no markdown pipeline until the content demands one. The
 * hook runs before the experiment (the cold open); the story unpacks what
 * the learner just manipulated; field notes connect it to the real world.
 */

export type StorySection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type ExhibitNarrative = {
  nodeId: string;
  /** The cold open: the real problem this concept exists to solve. */
  hook: string[];
  /** After the experiment: building the idea the hands already know. */
  story: StorySection[];
  /** Where this lives in the real world. */
  fieldNotes: string[];
};
