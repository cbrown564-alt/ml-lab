import { describe, expect, it } from "vitest";
import fixtures from "./fixtures/cnns.json";
import {
  activationMass,
  conv2dValid,
  convParamCount,
  fullyConnectedParamCount,
  GRID_SIZE,
  KERNEL_SIZE,
  OUTPUT_SIZE,
  shiftGridRight,
} from "./cnn";

const images = fixtures.images as Record<string, number[][]>;
const filters = fixtures.filters as Record<string, number[][]>;
const outputs = fixtures.outputs as Record<string, Record<string, number[][]>>;

describe("cnn model layer", () => {
  it("matches committed fixture conv outputs for every image/filter pair", () => {
    for (const [imageId, image] of Object.entries(images)) {
      for (const [filterId, kernel] of Object.entries(filters)) {
        const expected = outputs[imageId]![filterId]!;
        const actual = conv2dValid(image, kernel);
        expect(actual.length).toBe(expected.length);
        for (let r = 0; r < expected.length; r++) {
          for (let c = 0; c < expected[r]!.length; c++) {
            expect(actual[r]![c]).toBeCloseTo(expected[r]![c]!, 5);
          }
        }
      }
    }
  });

  it("pins the parameter-count story the narrative tells", () => {
    const fc = fullyConnectedParamCount(GRID_SIZE, GRID_SIZE, OUTPUT_SIZE, OUTPUT_SIZE);
    const conv = convParamCount(KERNEL_SIZE, KERNEL_SIZE);
    expect(fc).toBe(fixtures.paramCounts.fullyConnected);
    expect(conv).toBe(fixtures.paramCounts.convolution);
    expect(fc / conv).toBeGreaterThan(200);
  });

  it("shows translation equivariance: shifting the input shifts the feature map", () => {
    const image = images["horizontal-stripes"]!;
    const kernel = filters.vertical!;
    const base = conv2dValid(image, kernel);
    const shifted = conv2dValid(shiftGridRight(image), kernel);
    const fixture = fixtures.shiftDemo as {
      originalOutput: number[][];
      shiftedOutput: number[][];
    };
    expect(base).toEqual(fixture.originalOutput);
    for (let r = 0; r < fixture.shiftedOutput.length; r++) {
      for (let c = 0; c < fixture.shiftedOutput[r]!.length; c++) {
        expect(shifted[r]![c]).toBeCloseTo(fixture.shiftedOutput[r]![c]!, 5);
      }
    }
    expect(activationMass(base)).toBeCloseTo(25.2, 1);
    expect(activationMass(shifted)).toBeCloseTo(27.9, 1);
    expect(base[0]![0]).not.toBeCloseTo(shifted[0]![0]!, 3);
  });
});
