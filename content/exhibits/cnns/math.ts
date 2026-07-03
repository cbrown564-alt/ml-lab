import type { MathDrawerContent } from "@/lib/narrative/math";
import { convParams, fcParams, verticalOnHorizontal } from "./experiment";

export const cnnsMath: MathDrawerContent = {
  nodeId: "cnns",
  invitation:
    "One sliding dot product, reused everywhere on the grid. The math is small; the parameter savings versus flattening are not.",
  sections: [
    {
      id: "conv-sum",
      heading: "Each output cell is a dot product",
      blocks: [
        {
          kind: "equation",
          lines: ["(I * F)[i,j] = Σ_{u,v} I[i+u, j+v] · F[u,v]"],
          caption:
            "At position (i, j) multiply a 3×3 patch of the input I by the filter F and sum. Valid padding here means the output shrinks to 6×6 on an 8×8 input.",
          highlights: [
            { text: "F", hue: "param" },
            { text: "Σ", hue: "prediction" },
          ],
        },
      ],
    },
    {
      id: "pinned-readout",
      heading: "Pinned fixture readout",
      blocks: [
        {
          kind: "prose",
          text: `On the committed horizontal-stripe image, the vertical-edge filter produces total activation mass ${verticalOnHorizontal.toFixed(
            2,
          )}. Recompute it from the fixture if the prose ever drifts — that number is a teaching anchor.`,
          highlights: [{ text: "activation mass", hue: "prediction" }],
        },
      ],
    },
    {
      id: "param-count",
      heading: "Parameters: dense versus shared",
      blocks: [
        {
          kind: "equation",
          lines: [
            "FC: 64 × 36 + 36 = 2,340",
            "Conv: 3 × 3 + 1 = 10",
          ],
          caption: `Flattening this toy grid into a fully connected layer needs ${fcParams.toLocaleString()} parameters — 2,304 weights plus 36 biases. One shared 3×3 filter needs ${convParams} (nine weights plus one bias). That ratio is why conv nets scale to real images.`,
          highlights: [
            { text: "2,340", hue: "error" },
            { text: "10", hue: "truth" },
          ],
        },
        { kind: "widget", widget: "conv-params" },
        {
          kind: "prose",
          text: "Drag the image size. The dense count is quadratic twice over — inputs × outputs — while the shared filter is a constant ten numbers reused at every position.",
          highlights: [{ text: "constant ten numbers", hue: "truth" }],
        },
      ],
    },
  ],
  mathNodeIds: ["the-gradient"],
};
