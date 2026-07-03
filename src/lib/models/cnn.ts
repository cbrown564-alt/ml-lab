/**
 * Hand-rolled 2D convolution for the CNN exhibit. Step-able and auditable — every
 * output pixel is a dot product between a filter and a local patch of the input grid.
 */

export type Grid = number[][];

export type FilterId = "horizontal" | "vertical" | "blur";
export type ImageId = "horizontal-stripes" | "vertical-stripes" | "corner-block";

export const GRID_SIZE = 8;
export const KERNEL_SIZE = 3;
export const OUTPUT_SIZE = GRID_SIZE - KERNEL_SIZE + 1;

export function conv2dValid(input: Grid, kernel: Grid): Grid {
  const kh = kernel.length;
  const kw = kernel[0]?.length ?? 0;
  const outH = input.length - kh + 1;
  const outW = (input[0]?.length ?? 0) - kw + 1;
  const out: Grid = [];
  for (let r = 0; r < outH; r++) {
    const row: number[] = [];
    for (let c = 0; c < outW; c++) {
      let sum = 0;
      for (let kr = 0; kr < kh; kr++) {
        for (let kc = 0; kc < kw; kc++) {
          sum += input[r + kr]![c + kc]! * kernel[kr]![kc]!;
        }
      }
      row.push(sum);
    }
    out.push(row);
  }
  return out;
}

/** Sum of absolute activations — a simple readout for comparing feature maps. */
export function activationMass(map: Grid): number {
  return map.reduce((acc, row) => acc + row.reduce((s, v) => s + Math.abs(v), 0), 0);
}

/** Parameter count for a dense layer from every input pixel to every output pixel. */
export function fullyConnectedParamCount(
  inputH: number,
  inputW: number,
  outputH: number,
  outputW: number,
): number {
  return inputH * inputW * outputH * outputW + outputH * outputW;
}

/** Parameter count for one shared filter plus bias. */
export function convParamCount(kernelH: number, kernelW: number): number {
  return kernelH * kernelW + 1;
}

export function shiftGridRight(grid: Grid): Grid {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const out = grid.map((row) => row.map(() => 0));
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      out[r]![c] = grid[r]![c - 1]!;
    }
  }
  return out;
}

export function patchAt(input: Grid, kernel: Grid, row: number, col: number): Grid {
  const kh = kernel.length;
  const kw = kernel[0]?.length ?? 0;
  const patch: Grid = [];
  for (let kr = 0; kr < kh; kr++) {
    patch.push(input[row + kr]!.slice(col, col + kw));
  }
  return patch;
}

export function dotPatch(patch: Grid, kernel: Grid): number {
  let sum = 0;
  for (let r = 0; r < patch.length; r++) {
    for (let c = 0; c < patch[r]!.length; c++) {
      sum += patch[r]![c]! * kernel[r]![c]!;
    }
  }
  return sum;
}
