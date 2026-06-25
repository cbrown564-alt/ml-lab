import type { FailureGallery } from "@/lib/failure/schema";

/**
 * Neural-network failure gallery. The live failure is overfitting from too much capacity;
 * the other is the architecture mistake that wastes depth — stacking linear layers with no
 * nonlinearity, which collapses to a single line and underfits anything curved.
 */
export const neuralNetworkFundamentalsFailures: FailureGallery = {
  nodeId: "neural-network-fundamentals",
  cards: [
    {
      id: "too-much-capacity",
      primitive: "overfitting",
      title: "Too much capacity overfits",
      trigger: "Give a small, noisy dataset far more hidden units than the pattern needs, and train to convergence.",
      symptom: "Train accuracy climbs toward perfect while held-out accuracy falls; the decision boundary grows islands and tendrils around individual points.",
      diagnosis: "With enough weights the network can memorize every training point — including the noisy ones — instead of learning the smooth rule. The widening train–validation gap is the signature.",
      repair: "Reduce capacity (fewer units/layers), regularize (weight decay, dropout), or stop training early — keep capacity for the signal, not the noise.",
      boundary: "Too little capacity underfits — it can't represent the real shape at all. The goal isn't minimal capacity, it's the right amount plus regularization.",
    },
    {
      id: "missing-nonlinearity",
      primitive: "underfitting",
      title: "Depth with no squiggle is just a line",
      trigger: "Stack layers but leave out the nonlinearity between them (or use too few units to bend the space).",
      symptom: "However many layers you add, the decision boundary stays straight — the network can't fit XOR, circles, or any curved pattern.",
      diagnosis: "A composition of linear maps is itself a linear map: W₂(W₁x) = (W₂W₁)x. Without a nonlinear activation between the layers, all that depth collapses to a single line.",
      repair: "Put a nonlinearity (tanh, ReLU, …) after each hidden unit's weighted sum — that's the ingredient that prevents stacked linear maps from collapsing into one linear map. The output activation depends on the task.",
      boundary: "On genuinely linearly-separable data a straight boundary is correct, and the missing nonlinearity does no harm — the failure is reaching for depth and then defeating it.",
    },
  ],
};
