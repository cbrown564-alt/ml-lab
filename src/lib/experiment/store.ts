"use client";

import { create } from "zustand";
import type { ExperimentSpec, Scenario } from "./spec";
import type { Point } from "@/lib/models/linear-regression";

/**
 * Experiment state factory — one store instance per experiment island.
 * Holds the manipulable state (dataset points, parameter values, active
 * scenario); model fitting stays derived and pure in the component layer.
 */

export type ExperimentState = {
  spec: ExperimentSpec;
  datasetId: string;
  points: Point[];
  params: Record<string, number>;
  scenarioId: string | null;
  movePoint: (index: number, point: Point) => void;
  addPoint: (point: Point) => void;
  removePoint: (index: number) => void;
  setParam: (id: string, value: number) => void;
  loadDataset: (datasetId: string) => void;
  loadScenario: (scenarioId: string) => void;
  reset: () => void;
};

export function createExperimentStore(spec: ExperimentSpec) {
  const defaultParams = Object.fromEntries(spec.params.map((p) => [p.id, p.default]));
  const initialDataset = spec.datasets[0];

  const datasetPoints = (datasetId: string): Point[] => {
    const ds = spec.datasets.find((d) => d.id === datasetId) ?? initialDataset;
    return ds.points.map((p) => ({ ...p }));
  };

  return create<ExperimentState>((set, get) => ({
    spec,
    datasetId: initialDataset.id,
    points: datasetPoints(initialDataset.id),
    params: { ...defaultParams },
    scenarioId: null,

    movePoint: (index, point) =>
      set((s) => ({
        points: s.points.map((p, i) => (i === index ? point : p)),
      })),

    addPoint: (point) => set((s) => ({ points: [...s.points, point] })),

    removePoint: (index) =>
      set((s) => ({ points: s.points.filter((_, i) => i !== index) })),

    setParam: (id, value) => set((s) => ({ params: { ...s.params, [id]: value } })),

    loadDataset: (datasetId) =>
      set({ datasetId, points: datasetPoints(datasetId), scenarioId: null }),

    loadScenario: (scenarioId) => {
      const scenario: Scenario | undefined = get().spec.scenarios.find(
        (sc) => sc.id === scenarioId,
      );
      if (!scenario) return;
      set({
        scenarioId,
        datasetId: scenario.datasetId,
        points: datasetPoints(scenario.datasetId),
        params: { ...defaultParams, ...scenario.params },
      });
    },

    reset: () =>
      set((s) => ({
        points: datasetPoints(s.datasetId),
        params: { ...defaultParams },
        scenarioId: null,
      })),
  }));
}
