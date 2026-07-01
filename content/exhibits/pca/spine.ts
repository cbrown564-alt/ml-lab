import type { Spine } from "@/lib/exhibit/spine";

/**
 * PCA's story spine keeps one cloud alive and changes only the coordinate story told
 * over it: first the raw oval, then the first principal axis, then the collapse to one
 * number per point, then the small but real reconstruction loss from dropping PC2.
 */
export type PcaFrame = {
  stage: "cloud" | "axis" | "projection" | "reconstruction";
  components: 1 | 2;
};

export const pcaSpine: Spine<PcaFrame> = [
  {
    sectionId: "hook",
    frame: { stage: "cloud", components: 2 },
    terms: [
      { phrase: "a tilted cloud", hue: "truth" },
      { phrase: "mostly one direction", hue: "prediction" },
    ],
  },
  {
    sectionId: "pc1-axis",
    frame: { stage: "axis", components: 2 },
    terms: [
      { phrase: "PC1", hue: "prediction" },
      { phrase: "the longest spread", hue: "param" },
      { phrase: "variance", hue: "error" },
    ],
  },
  {
    sectionId: "collapse-to-1d",
    frame: { stage: "projection", components: 1 },
    terms: [
      { phrase: "one number per point", hue: "prediction" },
      { phrase: "the dot product", hue: "param" },
      { phrase: "PC2", hue: "error" },
    ],
    predict: {
      prompt:
        "Project every point onto PC1 and keep only that one score. What part of the cloud disappears?",
      options: [
        {
          label:
            "The thickness perpendicular to PC1 disappears — variation along PC2 is what gets discarded",
          correct: true,
          feedback:
            "Right. Projection onto one axis keeps only the coordinate along that axis. The little side-to-side thickness is exactly what PC2 measures, so dropping PC2 removes it.",
        },
        {
          label:
            "Nothing important disappears, because PCA keeps the same points and only renames the axes",
          feedback:
            "Rotation alone keeps all the information. The loss appears when you keep only one of the rotated coordinates and throw the other away.",
        },
        {
          label:
            "The long direction disappears, because projection flattens the cloud onto the short axis",
          feedback:
            "Projection onto PC1 keeps the long direction and discards the short one. PCA orders the axes by how much spread they capture, largest first.",
        },
      ],
    },
  },
  {
    sectionId: "reconstruction-loss",
    frame: { stage: "reconstruction", components: 1 },
    terms: [
      { phrase: "reconstruction loss", hue: "error" },
      { phrase: "almost all the spread", hue: "prediction" },
      { phrase: "the discarded sliver", hue: "error" },
    ],
  },
];
