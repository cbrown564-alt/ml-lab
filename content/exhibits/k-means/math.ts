import type { MathDrawerContent } from "@/lib/narrative/math";
import { goodK, tooManyK, wrongK } from "./experiment";

/**
 * The two-line engine of k-means: nearest-centroid assignment and mean update, repeated
 * until the centroids stop moving. The committed fixture numbers are folded into the
 * captions so the learner can tie the equations back to the actual blobs on screen.
 */
export const kMeansMath: MathDrawerContent = {
  nodeId: "k-means",
  invitation:
    "k-means is almost insultingly small. One equation says who owns each point, one says where each centroid moves, and one objective — inertia — tells you whether the partition got tighter.",
  sections: [
    {
      id: "assignment",
      heading: "Assign each point to its nearest centroid",
      blocks: [
        {
          kind: "equation",
          lines: ["c(i) = argminⱼ ‖xᵢ − μⱼ‖²"],
          caption:
            "Point xᵢ takes the label of the centroid μⱼ with the smallest squared Euclidean distance. That one line draws the nearest-centroid regions you see in the exhibit: every patch of the plane belongs to whichever centre is closest.",
          highlights: [
            { text: "argmin", hue: "param" },
            { text: "‖xᵢ − μⱼ‖²", hue: "prediction" },
          ],
        },
      ],
    },
    {
      id: "update",
      heading: "Move each centroid to the mean of its cluster",
      blocks: [
        {
          kind: "equation",
          lines: ["μⱼ ← (1 / |Cⱼ|) Σᵢ∈Cⱼ xᵢ"],
          caption:
            "Once cluster Cⱼ knows which points it owns, centroid μⱼ moves to their arithmetic mean. On this fixture, one Lloyd update already lands on the settled k = 3 centres: three clean blob middles, not a long chase.",
          highlights: [
            { text: "μⱼ", hue: "param" },
            { text: "mean", hue: "truth" },
          ],
        },
      ],
    },
    {
      id: "objective",
      heading: "Inertia is the within-cluster squared distance",
      blocks: [
        {
          kind: "equation",
          lines: ["J = Σᵢ ‖xᵢ − μ_{c(i)}‖²"],
          caption: `This objective is called inertia in scikit-learn. On the committed blobs, forcing k = 2 leaves J = ${wrongK.inertia.toFixed(2)}; letting the data have k = 3 drops it to ${goodK.inertia.toFixed(2)}; pushing to k = 5 shaves it further to ${tooManyK.inertia.toFixed(2)} by inventing extra centroids inside real clusters.`,
          highlights: [
            { text: "J", hue: "error" },
            { text: "‖xᵢ − μ_{c(i)}‖²", hue: "error" },
          ],
        },
        {
          kind: "prose",
          text: "That last comparison is the key warning. The objective always prefers tighter clusters, so inertia can keep falling even after you have passed the humanly meaningful grouping. k-means optimises distance, not semantics.",
          highlights: [
            { text: "distance", hue: "param" },
            { text: "not semantics", hue: "error" },
          ],
        },
      ],
    },
  ],
  mathNodeIds: [],
};
