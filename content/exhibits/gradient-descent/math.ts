import type { MathDrawerContent } from "@/lib/narrative/math";

export const gradientDescentMath: MathDrawerContent = {
  nodeId: "gradient-descent",
  invitation:
    "You've walked the surface. Here is the update rule, the gradient it follows, and the precise number where this dataset's walk tips from convergence into explosion.",
  sections: [
    {
      id: "the-update-rule",
      heading: "The update rule",
      blocks: [
        {
          kind: "equation",
          lines: ["w ← w − η · ∂L/∂w", "b ← b − η · ∂L/∂b"],
          caption: "η (eta) is the learning rate — the stride knob you turned.",
        },
        {
          kind: "prose",
          text: "For mean squared error the partial derivatives work out to sums over the misses, with ŷᵢ = w·xᵢ + b the current line's prediction:",
        },
        {
          kind: "equation",
          lines: [
            "∂L/∂w = (2/n) · Σᵢ (ŷᵢ − yᵢ) · xᵢ",
            "∂L/∂b = (2/n) · Σᵢ (ŷᵢ − yᵢ)",
          ],
        },
        {
          kind: "prose",
          text: "This is letter for letter the gradient function in the lab's model layer — every step you played, stepped, or scrubbed was computed by exactly these two lines. Notice that both sums are driven by the misses (ŷᵢ − yᵢ): a line that fits well feels almost no pull. That is the self-throttling you watched — the walk slows precisely where the surface flattens.",
        },
      ],
    },
    {
      id: "the-speed-limit",
      heading: "The speed limit, exactly",
      blocks: [
        {
          kind: "prose",
          text: "The predict item promised that 0.06 converges and 0.12 explodes. That cliff isn't folklore. For a quadratic bowl like this one, the sharpest curvature of the surface sets a hard ceiling on the stride:",
        },
        {
          kind: "equation",
          lines: ["η < 2 / λₘₐₓ"],
          caption:
            "λₘₐₓ is the surface's steepest curvature — the largest eigenvalue of its matrix of second derivatives (the Hessian).",
        },
        {
          kind: "prose",
          text: "Step under the ceiling and every stride lands lower than it left. Step over it and every stride lands higher up the far wall, compounding upward — the explosion you triggered on purpose. For the dataset in this experiment the ceiling works out to η ≈ 0.077, which is exactly why 0.06 walks home and 0.12 rockets off the map. A unit test computes this number from the data and holds this paragraph to it.",
        },
        {
          kind: "prose",
          text: "One more honest number: this valley is about 52 times steeper across than along — the ratio of the two curvatures, called the condition number. That lopsidedness is what makes the path zigzag: a stride large enough to make progress along the gentle valley overshoots the steep walls, so the walk bounces from side to side as it descends. It is exactly the problem that optimizers with memory — momentum, Adam — were built to fix. They have their own exhibits ahead.",
        },
      ],
    },
  ],
  mathNodeIds: ["the-gradient"],
};
