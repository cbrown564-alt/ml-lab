import type { Point } from "@/lib/models/linear-regression";
import { chebMSE, ridgeFitCheb, type ChebModel } from "@/lib/models/polynomial";

export type OverfittingSweepPoint = {
  degree: number;
  model: ChebModel;
  trainError: number;
  heldOutError: number;
};

export type AudioVoiceParams = {
  frequency: number;
  filterHz: number;
  modulationHz: number;
  modulationDepth: number;
};

export type OverfittingAudioParams = {
  training: AudioVoiceParams;
  heldOut: AudioVoiceParams;
};

export function buildOverfittingSweep(
  train: Point[],
  heldOut: Point[],
  maxDegree = 12,
): OverfittingSweepPoint[] {
  return Array.from({ length: maxDegree }, (_, index) => {
    const degree = index + 1;
    const model = ridgeFitCheb(train, degree, 0);
    return {
      degree,
      model,
      trainError: chebMSE(train, model),
      heldOutError: chebMSE(heldOut, model),
    };
  });
}

export function heldOutMinimum(sweep: OverfittingSweepPoint[]): OverfittingSweepPoint {
  if (sweep.length === 0) throw new Error("heldOutMinimum requires at least one state");
  return sweep.reduce((best, row) =>
    row.heldOutError < best.heldOutError ? row : best,
  );
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Error ratios span orders of magnitude in the seeded overfitting fixture. This
 * compression keeps the useful middle audible while saturating severe failure.
 * The result is a relative encoding; exact values remain in the visual readout.
 */
export function audibleError(error: number, minimum: number): number {
  const safeMinimum = Math.max(minimum, Number.EPSILON);
  const ratioAboveBest = Math.max(0, error / safeMinimum - 1);
  return clamp01(Math.log1p(ratioAboveBest) / Math.log(20));
}

export function audioParamsFor(
  row: OverfittingSweepPoint,
  sweep: OverfittingSweepPoint[],
): OverfittingAudioParams {
  const minTrain = Math.min(...sweep.map((point) => point.trainError));
  const minHeldOut = Math.min(...sweep.map((point) => point.heldOutError));
  const trainingError = audibleError(row.trainError, minTrain);
  const heldOutError = audibleError(row.heldOutError, minHeldOut);

  const voice = (
    error: number,
    frequency: number,
  ): AudioVoiceParams => ({
    frequency,
    filterHz: 1900 - error * 900,
    modulationHz: 2.2 + error * 4.6,
    modulationDepth: 0.002 + error * 0.018,
  });

  return {
    training: voice(trainingError, 174),
    heldOut: voice(heldOutError, 246),
  };
}
