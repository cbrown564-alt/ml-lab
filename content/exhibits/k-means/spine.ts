import type { Spine } from "@/lib/exhibit/spine";

/**
 * k-means spine: one persistent scatter, re-framed as centroid placement, nearest-point
 * assignment, averaging, and the wrong-k failure. The committed prediction sits on the
 * wrong-k beat: before the reveal, commit what forcing k=2 onto three blobs will do.
 */
export type KMeansFrame = {
  k: 2 | 3 | 5;
  step: number;
  showVoronoi?: boolean;
  showTrails?: boolean;
};

export const kMeansSpine: Spine<KMeansFrame> = [
  {
    sectionId: "hook",
    frame: { k: 3, step: 1, showVoronoi: true },
    terms: [
      { phrase: "no labels", hue: "truth" },
      { phrase: "three centres", hue: "param" },
      { phrase: "nearest-centroid regions", hue: "prediction" },
    ],
  },
  {
    sectionId: "assign-nearest",
    frame: { k: 3, step: 0, showVoronoi: true },
    terms: [
      { phrase: "nearest centroid", hue: "prediction" },
      { phrase: "claim the points around it", hue: "prediction" },
      { phrase: "just distance", hue: "param" },
    ],
  },
  {
    sectionId: "average-centroids",
    frame: { k: 3, step: 1, showVoronoi: true, showTrails: true },
    terms: [
      { phrase: "move to the average", hue: "param" },
      { phrase: "the mean of its assigned points", hue: "param" },
      { phrase: "one update is enough", hue: "truth" },
    ],
  },
  {
    sectionId: "wrong-k",
    frame: { k: 2, step: 1, showVoronoi: true },
    terms: [
      { phrase: "force three blobs into two groups", hue: "error" },
      { phrase: "merged two real clusters", hue: "error" },
      { phrase: "inertia jumps", hue: "error" },
    ],
    predict: {
      prompt:
        "You are about to force k = 2 onto data that visibly has three blobs. What will the algorithm do?",
      options: [
        {
          label:
            "It must merge two real blobs under one centroid, so the regions get visibly worse and the inertia jumps",
          correct: true,
          feedback:
            "Right. k-means cannot invent a third centre when you only allow two, so one centroid has to serve two natural groups. The partition looks worse and the within-cluster sum of squares rises sharply.",
        },
        {
          label:
            "Nothing serious — the centroids will slide a bit, but two centres can still represent three clean blobs just as well",
          feedback:
            "That would only be true if two of the blobs were already one group. Here they are well separated, so one centroid is forced to straddle two natural clusters and the objective worsens a lot.",
        },
        {
          label:
            "It will fix the mismatch by moving faster and splitting one centroid into two during later iterations",
          feedback:
            "k-means never changes k on its own. Lloyd's loop only reassigns points and averages the same fixed number of centroids you gave it.",
        },
      ],
    },
  },
  {
    sectionId: "repeat-until-stable",
    frame: { k: 5, step: 1, showVoronoi: true },
    terms: [
      { phrase: "repeat until nothing changes", hue: "param" },
      { phrase: "extra centroids", hue: "error" },
      { phrase: "the objective only knows distance", hue: "param" },
    ],
  },
];
