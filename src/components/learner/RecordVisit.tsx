"use client";

import { useEffect } from "react";
import { useLearner, whenHydrated } from "@/lib/learner/store";

/** Marks a node as seen when its exhibit is actually opened. */
export function RecordVisit({ nodeId }: { nodeId: string }) {
  const recordVisit = useLearner((s) => s.recordVisit);
  useEffect(() => {
    whenHydrated(() => recordVisit(nodeId));
  }, [nodeId, recordVisit]);
  return null;
}
