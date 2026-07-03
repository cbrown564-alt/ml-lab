import type { FailureGallery } from "@/lib/failure/schema";
import { convParams, fcParams } from "./experiment";

export const cnnsFailures: FailureGallery = {
  nodeId: "cnns",
  intro:
    "CNNs fail where their spatial assumptions break: kernels too small to see the pattern, dense layers that forget translation, and padding choices that silently change tensor shape.",
  cards: [
    {
      id: "kernel-too-small",
      primitive: "underfitting",
      title: "The receptive field never sees the whole pattern",
      trigger: "Use a 3×3 filter on a corner that only activates when the full L-shape is visible at once.",
      symptom:
        "Activations flicker as you slide, but no single position captures the global corner — the filter is locally correct and globally blind.",
      diagnosis:
        "One convolution layer with a tiny kernel only sees local geometry. A pattern larger than the receptive field requires stacking layers or using a bigger kernel.",
      repair:
        "Stack conv layers so later filters integrate earlier feature maps, or increase kernel size / use dilated convolutions when the task demands a wider field of view.",
      boundary:
        "Huge kernels everywhere explode parameters and compute. Depth and stacking usually beat one giant filter.",
    },
    {
      id: "flatten-loses-translation",
      primitive: "distribution-shift",
      title: "Flattening destroys translation structure",
      trigger:
        "Compare the committed shift demo: move the horizontal stripes one pixel right and watch a dense layer's implicit wiring scramble while the conv feature map shifts cleanly.",
      symptom: `A fully connected layer needs ${fcParams.toLocaleString()} weights for this toy grid; a conv layer needs ${convParams}. Shift the input and the dense mapping has no shared notion of "the same edge moved".`,
      diagnosis:
        "Flattening treats pixel index as an arbitrary feature id. The network must relearn every spatial variant as if it were a new feature.",
      repair:
        "Keep the grid, share weights, and stack hierarchical filters — or use architectures (convs, local attention) that respect locality.",
      boundary:
        "Some tabular problems genuinely have no spatial structure; flattening is fine there. Images are not tabular.",
    },
    {
      id: "valid-padding-shrinks",
      primitive: "underfitting",
      title: "Valid convolution shrinks the grid every layer",
      trigger: "Stack several valid 3×3 convs without padding on a small image.",
      symptom:
        "An 8×8 input becomes 6×6, then 4×4, then 2×2 — the representation vanishes before deep hierarchy can form.",
      diagnosis:
        "Valid conv drops border pixels from the output. Deep stacks shrink spatial size aggressively unless you pad or stride carefully.",
      repair:
        "Use same padding to preserve spatial size, or accept shrinkage but plan the architecture (and use pooling deliberately, not accidentally).",
      boundary:
        "Padding is not free — it invents border context the network did not measure. The right choice depends on whether edge pixels matter.",
    },
  ],
};
