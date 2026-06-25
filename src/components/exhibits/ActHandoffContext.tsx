"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Visual state passed between exhibit acts — See → Run → Break → Explain.
 * The story's final frame can seed the experiment; chrome discipline flags
 * collapse redundant template chrome once the learner has engaged.
 */

export type ActHandoffContextValue = {
  /** The spine act currently on screen (`see`, `run`, `break`, `explain`). */
  activeActId: string | null;
  /** Acts the learner has opened at least once. */
  visitedActIds: ReadonlySet<string>;
  /** The See-it story's active frame — hand off to Run-it on act change. */
  storyFrame: unknown | null;
  /** First beat step or spine advance — compact placard, fold beat-rail chrome. */
  chromeEngaged: boolean;
  /** Left See-it — deeper fold on spine purpose lines and redundant metrics. */
  chromeImmersed: boolean;
  setActiveAct: (actId: string) => void;
  setStoryFrame: (frame: unknown) => void;
  markStoryInteraction: () => void;
};

const ActHandoffContext = createContext<ActHandoffContextValue | null>(null);

export function ActHandoffProvider({
  children,
  initialActId = "see",
}: {
  children: ReactNode;
  /** Opening act — See-it is the server-rendered default (C5). */
  initialActId?: string;
}) {
  const [activeActId, setActiveActId] = useState<string | null>(initialActId);
  const [visitedActIds, setVisitedActIds] = useState<Set<string>>(
    () => new Set([initialActId]),
  );
  const [storyFrame, setStoryFrameState] = useState<unknown | null>(null);
  const [storyEngaged, setStoryEngaged] = useState(false);
  const [spineAdvanced, setSpineAdvanced] = useState(false);

  const setActiveAct = useCallback((actId: string) => {
    setActiveActId(actId);
    setVisitedActIds((prev) => (prev.has(actId) ? prev : new Set(prev).add(actId)));
    if (actId !== "see") setSpineAdvanced(true);
  }, []);

  const setStoryFrame = useCallback((frame: unknown) => {
    setStoryFrameState(frame);
  }, []);

  const markStoryInteraction = useCallback(() => {
    setStoryEngaged(true);
  }, []);

  const chromeEngaged = storyEngaged || spineAdvanced;
  const chromeImmersed =
    spineAdvanced ||
    (activeActId !== null && activeActId !== "see" && visitedActIds.has(activeActId));

  const value = useMemo<ActHandoffContextValue>(
    () => ({
      activeActId,
      visitedActIds,
      storyFrame,
      chromeEngaged,
      chromeImmersed,
      setActiveAct,
      setStoryFrame,
      markStoryInteraction,
    }),
    [
      activeActId,
      visitedActIds,
      storyFrame,
      chromeEngaged,
      chromeImmersed,
      setActiveAct,
      setStoryFrame,
      markStoryInteraction,
    ],
  );

  return (
    <ActHandoffContext.Provider value={value}>
      <div
        className="act-handoff-root"
        data-chrome-engaged={chromeEngaged || undefined}
        data-chrome-immersed={chromeImmersed || undefined}
        data-active-act={activeActId ?? undefined}
      >
        {children}
      </div>
    </ActHandoffContext.Provider>
  );
}

export function useActHandoff(): ActHandoffContextValue {
  const ctx = useContext(ActHandoffContext);
  if (!ctx) {
    throw new Error("useActHandoff must be used within ActHandoffProvider");
  }
  return ctx;
}

/** Optional hook — null outside the provider (e.g. isolated story previews). */
export function useActHandoffOptional(): ActHandoffContextValue | null {
  return useContext(ActHandoffContext);
}

/** The See-it story frame handed to later acts. Null until the story steps. */
export function useActHandoffFrame<Frame>(): Frame | null {
  const ctx = useActHandoffOptional();
  return (ctx?.storyFrame ?? null) as Frame | null;
}
