import type { ParamDef } from "@/lib/experiment/spec";
import {
  attentionHeads,
  attentionPinned,
  attentionSentence,
  attentionTokens,
  headState,
} from "@/lib/models/attention";

export const tokens = attentionTokens;
export const heads = attentionHeads;

export const queryChoices = tokens.map((token, index) => ({
  index,
  id: token.id,
  label: token.label,
}));

export const headChoices = heads.map((head, index) => ({
  index,
  id: head.id,
  label: head.label,
}));

export const queryParam: ParamDef = {
  id: "query",
  label: "Query token",
  hint: "Pick which row asks the question — each query compares against every key and softmax-normalises the scores.",
  min: 0,
  max: queryChoices.length - 1,
  step: 1,
  default: queryChoices.findIndex((choice) => choice.id === "sat"),
};

export const headParam: ParamDef = {
  id: "head",
  label: "Attention head",
  hint: "Multi-head attention runs several lookups in parallel. Syntax routes by role; Local listens to neighbours.",
  min: 0,
  max: headChoices.length - 1,
  step: 1,
  default: 0,
};

export const queryAt = (index: number) =>
  queryChoices[Math.max(0, Math.min(queryChoices.length - 1, index))]!.label;

export const headAt = (index: number) =>
  headChoices[Math.max(0, Math.min(headChoices.length - 1, index))]!.label;

export const headIdAt = (index: number) =>
  headChoices[Math.max(0, Math.min(headChoices.length - 1, index))]!.id;

export const attentionScenario = {
  id: "sentence-routing",
  title: "Who does each token listen to?",
  prompt:
    `On the committed sentence "${attentionSentence}", each token issues a query vector and compares it to every key. Softmax turns the scores into weights that mix value vectors — content-dependent routing, not a fixed window.`,
};

export const attentionState = (queryIndex: number, headIndex: number) => {
  const headId = headIdAt(headIndex);
  const state = headState(headId, queryIndex);
  const top = state.mix[0];
  return {
    ...state,
    headId,
    headLabel: state.head.label,
    queryLabel: state.query.label,
    topKeyLabel: top?.token.label ?? "—",
    topWeight: top?.weight ?? 0,
    highlightKeyIndex: top?.keyIndex,
  };
};

export { attentionPinned, attentionSentence };
