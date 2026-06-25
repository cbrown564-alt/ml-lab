import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * Bias–variance as one knob's story: too stiff misses the shape (bias), too
 * flexible memorizes the noise (variance), and validation error — on data the
 * model never saw during selection — is often lowest in between. The decomposition arrives in Run it.
 */
export const biasVarianceNarrative: ExhibitNarrative = {
  nodeId: "bias-variance",
  hook: [
    "You can make a model fit the training data closely — just give it enough flexibility and it will thread a curve through every last point. The catch is that validation error — on data held out during model selection — is what guides the choice, and a model that memorizes its training set is often worse there than a cruder one that didn't.",
    "Here is a smooth truth, sampled with a little noise. One knob — how wiggly the curve is allowed to be — and two scores: the error on the points you trained on, and the error on points you held back for validation. Watch them part ways.",
  ],
  story: [
    {
      id: "underfit",
      heading: "Too stiff to see the shape",
      paragraphs: [
        "Start simple: a straight line. It can't bend to follow the curve, so it misses the shape everywhere — and it misses the training points and the held-out points by about the same amount. Both errors are high together. That shared, stubborn error is bias: the model is too rigid to represent the truth, and with the model class held fixed, more data does not remove approximation bias.",
      ],
    },
    {
      id: "overfit",
      heading: "Flexible enough to memorize",
      paragraphs: [
        "Now give it more freedom. As the degree climbs, the curve bends closer to the training points, and the training error keeps dropping — all the way to near zero, where it tracks every training dot closely. But look what the curve does between the dots: it lunges and overshoots, contorting to hit noise it should have ignored. It hasn't learned the shape; it has memorized the sample.",
      ],
    },
    {
      id: "the-sweet-spot",
      heading: "Validation error is often U-shaped",
      paragraphs: [
        "That's the tradeoff in one picture. Training error only ever falls. But validation error — on points the model never saw during selection — often starts high (too stiff), drops as the model gains just enough flexibility to catch the real shape, then climbs again as the extra flexibility goes into chasing noise. Lowest in the middle in this classical setting. The art is finding that degree using validation or cross-validation, without peeking at the final test set.",
      ],
    },
    {
      id: "decomposition",
      heading: "Bias, variance, and irreducible noise",
      paragraphs: [
        "Underneath, the expected error splits into three parts: bias² (how far the model's average prediction sits from the truth), variance (how much the fit jitters as the training sample changes), and the noise you can never remove. Simpler models tend to have more bias and less variance; more flexible models tend to reverse that balance; the sweet spot is the smallest total. More data often reduces estimation variance, which is why it lets you afford a more complex model.",
      ],
    },
  ],
  fieldNotes: [
    "You never actually see the final test error while choosing — that would be peeking. In practice you hold out a validation set, or use cross-validation, to estimate the U and pick the degree, then report the real test error once, at the end.",
    "Every capacity knob lives on this curve: tree depth, the number of neighbours in k-NN, hidden units in a network, training epochs. Regularisation (next door) is the other lever — it lets a flexible model behave like a simpler one without changing its degree.",
  ],
};
