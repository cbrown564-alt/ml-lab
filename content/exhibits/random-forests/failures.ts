import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Random-forest failure gallery. Averaging is powerful but it only does one job — kill
 * variance — so the failures are the two things it can't do: it can't fix bias (a forest
 * of stumps still underfits), and it can't see past the data (trees don't extrapolate, and
 * averaging blind trees is still blind).
 */
export const randomForestsFailures: FailureGallery = {
  nodeId: "random-forests",
  intro:
    "A forest's one trick is averaging away variance. Both failures below are jobs averaging cannot do, no matter how many trees you add.",
  cards: [
    {
      id: "stumps-underfit",
      primitive: "underfitting",
      title: "A forest of stumps still underfits",
      trigger:
        "Cap every tree's depth to a stump (one or two splits) and then grow thousands of them.",
      symptom:
        "The boundary is smooth but wrong — it can't follow the moons — and the held-out score plateaus low. Adding more trees makes it steadier, never better.",
      diagnosis:
        "Averaging cancels variance, not bias. Shallow trees are high-bias; a thousand of them average to the same biased shape. The mean of B copies has the same expected value as one copy — so more copies can't reach a shape one copy can't.",
      repair:
        "Let the trees grow deep so each is low-bias, and let the forest average their variance away. Per-tree depth is the bias knob; the number of trees is the variance knob — turn the right one.",
      boundary:
        "If the true boundary really is simple, shallow trees are correct and a forest of them is just a robust version — bias is only a failure relative to a shape the trees can't reach.",
    },
    {
      id: "cant-extrapolate",
      primitive: "distribution-shift",
      title: "Blind beyond the data",
      trigger:
        "Ask the forest to predict in a region far outside the training points — or on data whose distribution has shifted away from what it was trained on.",
      symptom:
        "The prediction flattens to a constant and stays confident: every tree just returns the vote of its nearest leaf, with nothing out there to tell it otherwise.",
      diagnosis:
        "Trees partition the space they have seen; beyond the training cloud they extend the edge leaf's value forever — they cannot extrapolate a trend. The forest inherits this, because averaging blind trees is still blind.",
      repair:
        "Don't extrapolate with trees: for a global trend reach for a model that has one (a line), gather data that covers the range, or at least detect and flag out-of-distribution inputs instead of trusting a confident flat answer.",
      boundary:
        "Inside the training distribution that flatness is a feature — trees don't chase spurious trends off the edge of the data. It is only a failure when you ask about inputs the data never covered.",
    },
  ],
};
