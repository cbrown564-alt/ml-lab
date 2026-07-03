import type { Spine } from "@/lib/exhibit/spine";

/**
 * CNN spine: one persistent conv visualization reframed as locality, weight sharing,
 * sliding receptive fields, and the parameter explosion a dense layer would need.
 */
export type CnnsFrame = {
  imageIndex: number;
  filterIndex: number;
  slide: number;
  showParamCompare?: boolean;
};

const midSlide = 17;

export const cnnsSpine: Spine<CnnsFrame> = [
  {
    sectionId: "hook",
    frame: { imageIndex: 0, filterIndex: 1, slide: midSlide },
    terms: [
      { phrase: "8×8 grid", hue: "truth" },
      { phrase: "one 3×3 filter", hue: "param" },
      { phrase: "shared everywhere", hue: "param" },
    ],
  },
  {
    sectionId: "local-receptive-field",
    frame: { imageIndex: 0, filterIndex: 1, slide: 0 },
    terms: [
      { phrase: "receptive field", hue: "param" },
      { phrase: "local patch", hue: "truth" },
      { phrase: "dot product", hue: "prediction" },
    ],
  },
  {
    sectionId: "weight-sharing",
    frame: { imageIndex: 1, filterIndex: 0, slide: midSlide },
    terms: [
      { phrase: "same filter", hue: "param" },
      { phrase: "every output pixel", hue: "prediction" },
      { phrase: "ten weights", hue: "truth" },
    ],
  },
  {
    sectionId: "fc-vs-conv",
    frame: { imageIndex: 0, filterIndex: 1, slide: midSlide, showParamCompare: true },
    terms: [
      { phrase: "2,304 weights", hue: "error" },
      { phrase: "ten weights", hue: "truth" },
      { phrase: "translation", hue: "prediction" },
    ],
    predict: {
      prompt:
        "An 8×8 image feeds a 6×6 output grid. A fully connected layer would need a separate weight for every input–output pixel pairing. A 3×3 convolution shares one filter everywhere. Which needs more parameters?",
      options: [
        {
          label:
            "The fully connected layer — thousands of weights versus ten for the shared filter",
          correct: true,
          feedback:
            "Right. A dense layer from 64 inputs to 36 outputs needs 2,304 weights plus biases. One 3×3 filter plus bias is ten numbers reused at every position.",
        },
        {
          label:
            "About the same — both connect every input pixel to every output pixel",
          feedback:
            "That describes a fully connected layer, not a convolution. The conv layer reuses the same small kernel at each slide position instead of learning a separate weight per pairing.",
        },
        {
          label:
            "The convolution — it has to store a separate 3×3 kernel at every output cell",
          feedback:
            "Weight sharing is the whole point. One kernel is stored once and applied everywhere; that is why conv nets scale to large images at all.",
        },
      ],
    },
  },
  {
    sectionId: "hierarchy",
    frame: { imageIndex: 2, filterIndex: 0, slide: 8 },
    terms: [
      { phrase: "stack layers", hue: "param" },
      { phrase: "edges", hue: "prediction" },
      { phrase: "parts", hue: "truth" },
    ],
  },
];
