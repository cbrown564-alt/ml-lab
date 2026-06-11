import type { Point } from "@/lib/models/linear-regression";

/**
 * ExperimentSpec — the declarative contract of an exhibit's experiment
 * (docs/02-architecture.md, docs/03-data-model.md). The spec describes
 * datasets, manipulable parameters, and scenarios; the exhibit's client
 * component wires it to the model layer and visualization kit. Code mode
 * will consume the same spec to expose identical datasets and parameters
 * to learner Python.
 */

export type ParamDef = {
  id: string;
  label: string;
  /** What this parameter means, one learner-facing sentence. */
  hint?: string;
  min: number;
  max: number;
  step: number;
  default: number;
  /** Log-scaled control (learning rates live here). */
  log?: boolean;
};

export type DatasetDef = {
  id: string;
  label: string;
  /** Seeded generator or literal points — reproducibility is non-negotiable. */
  points: Point[];
  /** Whether the learner may drag/add/remove points in visual mode. */
  editable: boolean;
};

export type Scenario = {
  id: string;
  title: string;
  /** Learner-facing setup: what to look at and what question to hold. */
  prompt: string;
  datasetId: string;
  params?: Record<string, number>;
  /** Failure-gallery scenarios get flagged so the UI can frame them as "break it". */
  failure?: boolean;
};

export type ExperimentSpec = {
  id: string;
  title: string;
  params: ParamDef[];
  datasets: DatasetDef[];
  scenarios: Scenario[];
};
