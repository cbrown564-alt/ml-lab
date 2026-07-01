import type { MathDrawerContent } from "@/lib/narrative/math";

/**
 * PCA's mechanism: diagonalize the covariance matrix, project onto the eigenvectors,
 * and read reconstruction loss as the variance left in the dropped components.
 */
export const pcaMath: MathDrawerContent = {
  nodeId: "pca",
  invitation:
    "PCA is just linear algebra on the cloud: a covariance matrix, its eigenvectors, and a projection that drops the low-variance directions.",
  sections: [
    {
      id: "covariance",
      heading: "The cloud becomes a covariance matrix",
      blocks: [
        {
          kind: "equation",
          lines: [
            "Σ = (1/n) Σᵢ zᵢ zᵢᵀ",
            "   = [ var(z₁)         cov(z₁, z₂) ]",
            "     [ cov(z₁, z₂)    var(z₂)      ]",
          ],
          caption:
            "After centering (and usually standardizing) the features, PCA studies the covariance matrix Σ.",
          highlights: [{ text: "Σ", hue: "param" }],
        },
        {
          kind: "prose",
          text: "The eigenvectors of Σ are the principal directions. Their eigenvalues are the variances along those directions. Big eigenvalue: a long axis in the cloud. Tiny eigenvalue: a thin leftover sliver.",
          highlights: [
            { text: "eigenvectors", hue: "prediction" },
            { text: "eigenvalues", hue: "error" },
          ],
        },
      ],
    },
    {
      id: "projection",
      heading: "Projection is a dot product",
      blocks: [
        {
          kind: "equation",
          lines: [
            "score on PC₁ = z · v₁",
            "score on PC₂ = z · v₂",
          ],
          caption:
            "Each centered point z becomes coordinates on the rotated basis vectors v₁ and v₂.",
          highlights: [
            { text: "v₁", hue: "prediction" },
            { text: "v₂", hue: "error" },
          ],
        },
        {
          kind: "prose",
          text: "Keeping only the first k scores is the dimensionality reduction step. In 2-D, keeping only PC1 means every point is replaced by its shadow on the PC1 line.",
          highlights: [{ text: "its shadow on the PC1 line", hue: "prediction" }],
        },
      ],
    },
    {
      id: "loss",
      heading: "Dropped variance becomes reconstruction loss",
      blocks: [
        {
          kind: "equation",
          lines: [
            "ẑ(k) = Σⱼ≤k (z · vⱼ) vⱼ",
            "MSE_recon = average ||z - ẑ(k)||²",
          ],
          caption: "Reconstruct from the kept components; the miss is the discarded part.",
          highlights: [
            { text: "ẑ(k)", hue: "prediction" },
            { text: "||z - ẑ(k)||²", hue: "error" },
          ],
        },
        {
          kind: "prose",
          text: "For orthogonal principal components, the average squared reconstruction loss from dropping the last directions is exactly their leftover variance. That is what 'explained variance ratio' measures: compression quality, not task-specific usefulness.",
          highlights: [{ text: "explained variance ratio", hue: "error" }],
        },
      ],
    },
  ],
  mathNodeIds: ["feature-scaling"],
};
