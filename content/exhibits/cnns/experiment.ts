import type { ParamDef } from "@/lib/experiment/spec";
import type { FilterId, ImageId } from "@/lib/models/cnn";
import {
  activationMass,
  conv2dValid,
  convParamCount,
  fullyConnectedParamCount,
  GRID_SIZE,
  KERNEL_SIZE,
  OUTPUT_SIZE,
} from "@/lib/models/cnn";
import fixtures from "@/lib/models/fixtures/cnns.json";

export type { FilterId, ImageId };

export const gridSize = fixtures.size as number;
export const outputSize = fixtures.outputSize as number;

export const images = fixtures.images as Record<ImageId, number[][]>;
export const filters = fixtures.filters as Record<FilterId, number[][]>;
export const outputs = fixtures.outputs as Record<ImageId, Record<FilterId, number[][]>>;

export const imageChoices: { id: ImageId; label: string }[] = [
  { id: "horizontal-stripes", label: "Horizontal stripes" },
  { id: "vertical-stripes", label: "Vertical stripes" },
  { id: "corner-block", label: "Corner block" },
];

export const filterChoices: { id: FilterId; label: string }[] = [
  { id: "horizontal", label: "Horizontal edge" },
  { id: "vertical", label: "Vertical edge" },
  { id: "blur", label: "Blur (3×3 mean)" },
];

export const imageParam: ParamDef = {
  id: "image",
  label: "Input image",
  hint: "Small 8×8 grids — the same size class as early MNIST digits, without the download.",
  min: 0,
  max: imageChoices.length - 1,
  step: 1,
  default: 0,
};

export const filterParam: ParamDef = {
  id: "filter",
  label: "Filter",
  hint: "One 3×3 kernel shared everywhere on the grid — the weight-sharing move that defines convolution.",
  min: 0,
  max: filterChoices.length - 1,
  step: 1,
  default: 1,
};

export const slideParam: ParamDef = {
  id: "slide",
  label: "Filter position",
  hint: "Slide the receptive field across the input. Each output pixel is one dot product between this patch and the filter.",
  min: 0,
  max: outputSize * outputSize - 1,
  step: 1,
  default: Math.floor((outputSize * outputSize) / 2),
};

export const imageAt = (index: number): ImageId =>
  imageChoices[Math.max(0, Math.min(imageChoices.length - 1, index))]!.id;

export const filterAt = (index: number): FilterId =>
  filterChoices[Math.max(0, Math.min(filterChoices.length - 1, index))]!.id;

export const slideToRowCol = (slide: number): { row: number; col: number } => {
  const clamped = Math.max(0, Math.min(outputSize * outputSize - 1, slide));
  return { row: Math.floor(clamped / outputSize), col: clamped % outputSize };
};

export const convState = (
  imageIndex: number,
  filterIndex: number,
  slide = slideParam.default,
) => {
  const imageId = imageAt(imageIndex);
  const filterId = filterAt(filterIndex);
  const image = images[imageId];
  const filter = filters[filterId];
  const featureMap = conv2dValid(image, filter);
  const { row, col } = slideToRowCol(slide);
  const outputValue = featureMap[row]![col]!;
  return {
    imageId,
    filterId,
    image,
    filter,
    featureMap,
    slide,
    row,
    col,
    outputValue,
    mass: activationMass(featureMap),
    fcParams: fullyConnectedParamCount(gridSize, gridSize, outputSize, outputSize),
    convParams: convParamCount(KERNEL_SIZE, KERNEL_SIZE),
  };
};

export const shiftDemo = fixtures.shiftDemo as {
  original: number[][];
  shifted: number[][];
  filter: number[][];
  originalOutput: number[][];
  shiftedOutput: number[][];
};

export const fcParams = fixtures.paramCounts.fullyConnected as number;
export const convParams = fixtures.paramCounts.convolution as number;

/** Strong vertical-edge response on horizontal stripes — pinned teaching case. */
export const verticalOnHorizontal = activationMass(
  conv2dValid(images["horizontal-stripes"], filters.vertical),
);

export const cnnsScenario = {
  id: "filter-slide",
  title: "Slide a filter across a grid",
  prompt:
    "Pick an image and a 3×3 filter, then scrub the filter position. Each output cell is one dot product between the filter and the patch beneath it — the same small kernel everywhere, not a separate weight per pixel pairing.",
};
