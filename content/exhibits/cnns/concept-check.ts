import type { ConceptCheck } from "@/lib/assessment/schema";

/**
 * CNN concept check. Misconceptions: that conv learns separate weights per output
 * cell, that flattening is equivalent, and that bigger kernels alone replace depth.
 */
export const cnnsCheck: ConceptCheck = {
  nodeId: "cnns",
  items: [
    {
      id: "weight-sharing",
      kind: "choice",
      prompt: "What makes a convolution different from a fully connected layer on the same grid?",
      options: [
        {
          label:
            "The same small filter is reused at every position — weight sharing instead of a separate weight per input–output pairing",
          correct: true,
          feedback:
            "Right. One 3×3 kernel plus bias defines the whole feature map. A dense layer would need thousands of independent weights and would not shift coherently when the image moves.",
        },
        {
          label:
            "Convolution uses fewer pixels — it ignores the border of the image entirely by design",
          feedback:
            "Valid padding shrinks the output unless you pad, but that is not the defining difference. The core move is local connectivity plus sharing the same filter everywhere.",
        },
        {
          label:
            "Convolution is just matrix multiplication with a fancy name — the math is identical to a dense layer",
          feedback:
            "A conv can be expressed as a sparse matrix multiply, but the structure matters: sharing and locality are baked in, not learned from scratch as 2,304 independent pairings.",
        },
      ],
      difficulty: 2,
      targets: ["cnns:sharing"],
    },
    {
      id: "receptive-field",
      kind: "choice",
      prompt: "What does each output pixel 'see' in a single 3×3 convolution layer?",
      options: [
        {
          label: "Only a 3×3 local patch of the input — its receptive field — not the whole image",
          correct: true,
          feedback:
            "Exactly. One layer with a 3×3 kernel has a 3×3 receptive field. Larger patterns require stacking layers or bigger kernels.",
        },
        {
          label: "The entire input image at once, because the filter slides everywhere",
          feedback:
            "Sliding everywhere does not widen one cell's view — it reuses the same local filter. Each output still comes from just a 3×3 patch.",
        },
        {
          label: "Whichever pixels have the highest intensity, regardless of position",
          feedback:
            "That would be a global pooling move, not a convolution. Conv outputs depend on structured local patches, not on picking the brightest pixels globally.",
        },
      ],
      difficulty: 2,
      targets: ["cnns:receptive-field"],
    },
    {
      id: "fc-params-predict",
      kind: "predict",
      setup:
        "An 8×8 image produces a 6×6 feature map with valid 3×3 convolution. Compare parameter counts before you peek at the math drawer.",
      prompt: "Which layer needs more learnable weights?",
      options: [
        {
          label:
            "The fully connected layer — roughly 2,300 weights versus about ten for the shared filter",
          correct: true,
          feedback:
            "Right. 64 inputs times 36 outputs plus biases dwarfs one 3×3 kernel shared everywhere.",
        },
        {
          label: "The convolution — it stores a separate 3×3 kernel at each of the 36 output cells",
          feedback:
            "That would be locally connected without sharing — expensive and not what CNNs do. One kernel is stored once.",
        },
        {
          label: "They are the same because both map 64 input values to 36 outputs",
          feedback:
            "The output shape can match while the wiring differs completely. Dense connects every input to every output; conv reuses one local filter.",
        },
      ],
      verify:
        "Open Run it and read the parameter comparison beside the grids — or open the math view for the pinned 2,340 versus 10 readout.",
      difficulty: 2,
      targets: ["cnns:params"],
    },
    {
      id: "break-translation",
      kind: "experiment-task",
      prompt:
        "Break it: switch to Translation and shift the stripes one pixel. Watch the conv feature map slide coherently while the dense readout scrambles — then repair by returning to the original image.",
      taskEvent: "cnns:translation-shift",
      feedback:
        "Translation equivariance is the payoff of weight sharing. The detector moves with the pattern instead of relearning every shifted version as a new feature.",
      difficulty: 1,
      targets: ["cnns:break"],
    },
    {
      id: "transfer-small-image",
      kind: "transfer",
      scenario:
        "A team builds a dog-versus-cat classifier on 32×32 photos. Engineer A flattens each photo into a 1,024-length vector and attaches a dense layer with 512 hidden units. Engineer B keeps the 32×32 grid and uses three stacked 3×3 conv layers (with pooling) before a small dense head.",
      prompt:
        "Who baked in the right inductive bias for photos, what failure mode does the other approach invite, and what would you watch for in validation? Answer in your own words.",
      open: {
        placeholder:
          "e.g. Engineer B respects … while A will … I'd watch for …",
        answer:
          "Engineer B respects locality and translation: small shared filters hunt edges and textures on the grid where they live, and pooling builds hierarchy without connecting every pixel to every weight upfront. Engineer A treats pixel index like an arbitrary feature id, so the model must relearn the same ear detector in every corner of the frame and needs vastly more data to do it. The failure mode is poor generalisation when dogs shift position, scale, or pose — the dense model memorises coordinates instead of shapes. I'd watch validation accuracy on cropped or shifted test images, parameter count and overfitting on small data, and whether the conv model's early feature maps look like edge detectors at all. The tradeoff is that B's architecture takes more design (depth, channels, pooling) while A's is simpler to code but wrong for spatial data.",
      },
      difficulty: 3,
      targets: ["cnns:transfer"],
    },
  ],
};
