import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * PCA concept check. The target misconceptions: rotation itself causes loss, the first
 * component is automatically the "most important", and scale before PCA does not matter.
 */
export const pcaCheck: ConceptCheck = {
  nodeId: "pca",
  items: [
    {
      id: "what-pc1-is",
      kind: "choice",
      prompt: "What exactly is PC1 choosing?",
      options: [
        {
          label:
            "The direction through the centered cloud with the largest variance — the line that captures the most spread",
          correct: true,
          feedback:
            "Right. PCA searches over directions, not original features, and picks the one along which the projected points vary the most.",
        },
        {
          label:
            "The original feature with the largest range, because PCA always keeps the biggest axis first",
          feedback:
            "Only if raw scale is allowed to dominate. PCA is about rotated directions; after standardization, PC1 is usually a mixture of features, not one raw axis.",
        },
        {
          label:
            "The direction that best separates classes or predicts the target variable",
          feedback:
            "That would be supervised dimensionality reduction. PCA never looks at labels; it optimizes variance, not prediction.",
        },
      ],
      difficulty: 2,
      targets: ["pca:pc1-direction"],
    },
    {
      id: "where-loss-enters",
      kind: "choice",
      prompt: "When does PCA actually lose information?",
      options: [
        {
          label:
            "When you drop components after the rotation; using all principal components keeps the information",
          correct: true,
          feedback:
            "Exactly. Rotation to an orthogonal basis is reversible. The approximation appears only when you keep fewer coordinates than you started with.",
        },
        {
          label:
            "The moment it rotates the axes, because diagonalizing the covariance matrix throws away the off-diagonal information",
          feedback:
            "The off-diagonal information is not thrown away; it is re-expressed in the rotated basis. With all components kept, you can reconstruct the original centered point exactly.",
        },
        {
          label:
            "Whenever PC1 explains less than 100%, because any cloud not on a perfect line is already lossy",
          feedback:
            "Explained variance below 100% only says more than one component is needed for a lossless representation. Keeping all components is still exact.",
        },
      ],
      difficulty: 2,
      targets: ["pca:loss-after-drop"],
    },
    {
      id: "scale-predict",
      kind: "predict",
      setup:
        "You run PCA on two correlated features, but one is measured on a much larger numeric scale than the other.",
      prompt: "What is the most likely outcome before you standardize?",
      options: [
        {
          label:
            "PC1 leans toward the large-scale feature, because raw variance from units dominates the covariance matrix",
          correct: true,
          feedback:
            "Right. PCA reads the covariance matrix you feed it. A huge-unit feature contributes huge variance, so its axis can overwhelm the shared structure.",
        },
        {
          label:
            "Nothing changes, because PCA is rotation-invariant and therefore unit-invariant",
          feedback:
            "PCA is rotation-invariant, not unit-invariant. Rescaling one axis changes the covariance matrix and therefore changes the principal directions.",
        },
        {
          label:
            "PC1 becomes the shorter axis, because PCA tries to keep the least redundant direction first",
          feedback:
            "PCA orders directions by largest variance first, not smallest. The short residual direction is what later components capture.",
        },
      ],
      verify:
        "In Break it, start on Raw units and compare the nearly horizontal PC1 to the standardized fit that follows the shared tilted cloud.",
      difficulty: 2,
      targets: ["pca:scale-matters"],
    },
    {
      id: "transfer-variance-vs-task",
      kind: "transfer",
      scenario:
        "A genomics team uses PCA to compress thousands of gene-expression features before predicting whether a tumour responds to a treatment. PC1 and PC2 explain most of the variance, so a teammate proposes throwing away every later component because 'low variance means low importance.'",
      prompt:
        "What would you say back? Explain when that reasoning is valid, when it fails, and what you would check next. Write it in your own words.",
      open: {
        placeholder:
          "e.g. high explained variance guarantees small reconstruction error, but it does not guarantee… I would keep/compare…",
        answer:
          "I would push back on equating explained variance with importance for the treatment task. PCA's guarantee is geometric: keeping the first components gives a low squared reconstruction error for the expression matrix. That can be great for compression, denoising, or visualization. But a treatment-response signal could live in a low-variance direction if it affects only a small subset of genes or patients. In that case, dropping later components because they explain little overall variance could remove exactly the information the predictor needs. The right move is to treat PCA as a candidate preprocessing step, not a proof: standardize appropriately, compare downstream model performance as you vary the number of retained components, and keep the dimensionality that works on held-out response data. 'Low variance' means 'little leftover spread,' not 'irrelevant to every task.'",
      },
      difficulty: 3,
      targets: ["pca:transfer-metric-mismatch"],
    },
  ],
};
