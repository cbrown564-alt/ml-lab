/**
 * Visual-argument primitives — Batch 1 of the ML Lab visual-standards audit.
 * Composable building blocks for exhibits; semantic hues from globals.css.
 */

export { ActHandoff } from "./ActHandoff";
export { CausalTrace, type CausalStep } from "./CausalTrace";
export { ContributionStack, type Contribution } from "./ContributionStack";
export { CounterfactualReplay } from "./CounterfactualReplay";
export {
  DecisionConveyor,
  type ConveyorItem,
  type ConveyorMetrics,
} from "./DecisionConveyor";
export { ExhibitSkin, useExhibitSkin } from "./ExhibitSkin";
export {
  ExplorableSentence,
  useExplorableMark,
  type ExplorableTerm,
} from "./ExplorableSentence";
export { MicroSpecimen } from "./MicroSpecimen";
export { PinAndCompare } from "./PinAndCompare";
export { ProbeLens } from "./ProbeLens";
export { ProvenancePipe, type ProvenanceStage } from "./ProvenancePipe";
export {
  PortalEntity,
  PortalView,
  RepresentationPortal,
  useRepresentationPortal,
} from "./RepresentationPortal";
export { StepMicroscope } from "./StepMicroscope";
export { VarianceSwarm } from "./VarianceSwarm";
export {
  hueInk,
  hueMark,
  MOTION_MOVE,
  MOTION_QUICK,
  usePrefersReducedMotion,
} from "./shared";
export {
  clamp01,
  lerp,
  lerpRecord,
  reversibleProgress,
} from "./interpolation";
