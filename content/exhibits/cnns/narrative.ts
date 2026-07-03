import type { ExhibitNarrative } from "@/lib/narrative/schema";

/**
 * CNNs as the spatial on-ramp: images are grids, filters are local, weights are shared,
 * and the alternative — flattening into a dense layer — explodes parameters and forgets
 * translation structure.
 */
export const cnnsNarrative: ExhibitNarrative = {
  nodeId: "cnns",
  hook: [
    "Feed a photograph into a plain multilayer perceptron and the first thing you do is destroy its shape: flatten the grid into one long vector and pretend pixel 47 has nothing special to do with pixel 48. Convolutional networks refuse that move. They keep the grid, look only at small local patches, and reuse the same filter everywhere.",
    "The result is not magic — it is a loop of tiny dot products. Slide a 3×3 kernel across an 8×8 image and each stop writes one number into a feature map. Early layers catch edges; deeper layers stack those edges into textures and parts. The architecture matches the data.",
  ],
  story: [
    {
      id: "local-receptive-field",
      heading: "Look locally, not at the whole image at once",
      paragraphs: [
        "At each position the network sees only a small receptive field — here a 3×3 patch of pixels — and compares that patch to a learned filter. The output is a single number: the dot product between the patch and the kernel. Nothing global, nothing about the whole image yet, just 'does this local pattern match?'",
        "Scrub the slide control and watch the highlighted patch move. The feature map lights up where the filter fits and stays quiet where it does not. That spatial map is the first representation a CNN builds — not a category label, but a grid of local matches.",
      ],
    },
    {
      id: "weight-sharing",
      heading: "One filter, reused at every position",
      paragraphs: [
        "The same 3×3 numbers are applied everywhere on the grid. That weight sharing is the defining trick: the horizontal-edge detector you learned at the top-left is the same horizontal-edge detector at the bottom-right. Ten parameters (nine weights plus a bias) define the whole feature map.",
        "Without sharing you would need a separate filter at every output cell — hundreds of redundant edge detectors that all ought to mean the same thing. Sharing encodes the assumption that a useful local pattern is useful everywhere, which is exactly what translation in images looks like.",
      ],
    },
    {
      id: "fc-vs-conv",
      heading: "Why not flatten and go fully connected?",
      paragraphs: [
        "You could flatten the 8×8 grid into 64 inputs and connect them densely to 36 outputs. That costs 2,304 weights plus biases — every input pixel gets its own private line to every output pixel. A convolution needs ten.",
        "The dense layer also bakes in a fixed pixel ordering: shift the image one pixel to the right and every weight sees a different input. A conv layer shifts its activations with the image — the pattern detector moves coherently. That translation structure is why CNNs took over vision.",
      ],
    },
    {
      id: "hierarchy",
      heading: "Stack filters into a hierarchy",
      paragraphs: [
        "Real networks stack many conv layers. The first map might highlight vertical edges; the next layer convolves over that map and picks out corners or curves built from those edges; deeper still, parts and object fragments appear. Each layer reads a grid and writes a new grid — the embedding story continues in the next exhibit.",
        "Pooling and stride shrink the grids between layers so deeper filters see larger chunks of the original image without growing the parameter count as fast as the pixel count. The hierarchy is local patterns composing into global structure — the same stacking move you met in neural-network fundamentals, now with spatial structure preserved.",
      ],
    },
  ],
  fieldNotes: [
    "Modern vision models still begin with convolutions (or their structural cousins) because images are translation-heavy: a cat's ear detector should work in the top-left or bottom-right. Weight sharing and local connectivity encode that assumption directly.",
    "CNNs are not the whole deep-learning story — transformers now dominate language and compete in vision — but the conv move (locality + sharing + hierarchy) is the lens that makes spatial deep learning legible.",
  ],
};
