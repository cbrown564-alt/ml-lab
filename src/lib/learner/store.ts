"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { learnerStorage } from "./storage";

/**
 * The learner model (docs/03-data-model.md §4): local-first mastery state.
 * `level` is deliberately coarse and legible — "you've *seen* attention,
 * you've *mastered* gradient descent" — and never moves backwards. `score`
 * is internal fuel for future recommendations.
 */

export const MASTERY_LEVELS = [
  "untouched",
  "seen",
  "practiced",
  "assessed",
  "mastered",
] as const;
export type MasteryLevel = (typeof MASTERY_LEVELS)[number];

export type MasteryEvidence = { itemId: string; correct: boolean; at: string };

export type NodeMastery = {
  level: MasteryLevel;
  score?: number;
  lastTouched: string;
  evidence: MasteryEvidence[];
};

export type VisitEvent = { nodeId: string; at: string };

export type LearnerState = {
  schemaVersion: number;
  mastery: Record<string, NodeMastery>;
  history: VisitEvent[];
  recordVisit: (nodeId: string) => void;
  recordPractice: (nodeId: string) => void;
  recordAnswer: (
    nodeId: string,
    itemId: string,
    correct: boolean,
    itemCount: number,
  ) => void;
};

const rank = (level: MasteryLevel) => MASTERY_LEVELS.indexOf(level);
const atLeast = (current: MasteryLevel, floor: MasteryLevel): MasteryLevel =>
  rank(floor) > rank(current) ? floor : current;

const blank = (): NodeMastery => ({
  level: "untouched",
  lastTouched: new Date().toISOString(),
  evidence: [],
});

export const useLearner = create<LearnerState>()(
  persist(
    (set) => ({
      schemaVersion: 1,
      mastery: {},
      history: [],

      recordVisit: (nodeId) =>
        set((s) => {
          const node = s.mastery[nodeId] ?? blank();
          return {
            history: [...s.history, { nodeId, at: new Date().toISOString() }],
            mastery: {
              ...s.mastery,
              [nodeId]: {
                ...node,
                level: atLeast(node.level, "seen"),
                lastTouched: new Date().toISOString(),
              },
            },
          };
        }),

      recordPractice: (nodeId) =>
        set((s) => {
          const node = s.mastery[nodeId] ?? blank();
          return {
            mastery: {
              ...s.mastery,
              [nodeId]: {
                ...node,
                level: atLeast(node.level, "practiced"),
                lastTouched: new Date().toISOString(),
              },
            },
          };
        }),

      recordAnswer: (nodeId, itemId, correct, itemCount) =>
        set((s) => {
          const node = s.mastery[nodeId] ?? blank();
          const evidence = [
            ...node.evidence,
            { itemId, correct, at: new Date().toISOString() },
          ];
          // The latest answer per item is the one that counts: a learner who
          // corrects a misconception has corrected it.
          const latest = new Map<string, boolean>();
          for (const e of evidence) latest.set(e.itemId, e.correct);
          const right = [...latest.values()].filter(Boolean).length;
          const score = itemCount > 0 ? right / itemCount : 0;
          const level =
            latest.size >= itemCount && right === itemCount
              ? atLeast(node.level, "mastered")
              : atLeast(node.level, "assessed");
          return {
            mastery: {
              ...s.mastery,
              [nodeId]: {
                ...node,
                level,
                score,
                evidence,
                lastTouched: new Date().toISOString(),
              },
            },
          };
        }),
    }),
    {
      name: "learner-v1",
      storage: createJSONStorage(() => learnerStorage),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        mastery: s.mastery,
        history: s.history,
      }),
    },
  ),
);

/**
 * Run a learner-model write only once rehydration has finished. Storage is
 * async (IndexedDB): a write issued before hydration is computed from the
 * blank in-memory state and persisted over the real record — a mount-time
 * recordVisit would silently demote "mastered" to "seen".
 */
export function whenHydrated(fn: () => void): void {
  if (useLearner.persist.hasHydrated()) {
    fn();
    return;
  }
  const unsub = useLearner.persist.onFinishHydration(() => {
    unsub();
    fn();
  });
}
