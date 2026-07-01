import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * PCA through one concrete picture: a correlated cloud rotated into its own axes,
 * then compressed. The key distinction is kept explicit throughout: rotation itself
 * loses nothing; dropping later components is where the approximation enters.
 */
export const pcaNarrative: ExhibitNarrative = {
  nodeId: "pca",
  hook: [
    "Some datasets look high-dimensional only because several features are telling nearly the same story. Plot two of them and the points don't fill the square; they huddle in a tilted cloud, mostly stretching one way with only a little thickness the other.",
    "PCA names those directions. It rotates the coordinate system so the first new axis follows the longest spread, the second takes what is left, and then it gives you a choice: keep them all, or compress the cloud by throwing away the tiny leftovers.",
  ],
  story: [
    {
      id: "pc1-axis",
      heading: "Rotate to the cloud, not the ruler",
      paragraphs: [
        "Raw axes are accidents of measurement: dollars and years, pixels and milliseconds, sensor A and sensor B. PCA ignores those labels and asks a geometric question instead: along which direction do the points vary the most? That direction is PC1.",
        "Once PC1 is fixed, the second axis is forced: it must be perpendicular to the first, and among all such directions it captures the largest remaining spread. In two dimensions that is PC2. In higher dimensions the same game continues, each component orthogonal to the ones before it.",
      ],
    },
    {
      id: "collapse-to-1d",
      heading: "Each point becomes coordinates on the new axes",
      paragraphs: [
        "After the rotation, every point is described by its coordinates on PC1 and PC2 instead of x1 and x2. The PC1 score is a dot product: 'how far along this axis does the point sit?' For this cloud the first score already tells almost the whole story, because the points barely spread sideways.",
        "That is the compression move. Keep only PC1 and every two-number point becomes one number. The geometry is no longer exact, but if the discarded directions were thin enough, the approximation stays close.",
      ],
    },
    {
      id: "reconstruction-loss",
      heading: "Dropping a component is where the loss lives",
      paragraphs: [
        "A common misconception is that PCA 'loses information when it rotates'. Rotation alone loses nothing: using PC1 and PC2 together reconstructs the cloud exactly. The loss appears only when you keep fewer components than the data originally had.",
        "Explained variance is the compression budget. If PC1 explains 98% of the variance, that means the average squared miss from using only PC1 is about the 2% left behind in PC2. Large explained variance is not 'importance' in every downstream task — it is specifically small squared reconstruction error.",
      ],
    },
  ],
  fieldNotes: [
    "PCA is often the first lens for tabular data, embeddings, gene expression, or image features because it gives a quick low-dimensional map of what is redundant and what is not.",
    "Feature scale matters before PCA. If one variable is measured in dollars and another in percentages, the raw covariance matrix lets the dollar axis dominate — which is why standardization so often comes first.",
  ],
};
