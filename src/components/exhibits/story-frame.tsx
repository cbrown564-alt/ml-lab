"use client";

import { createContext, useContext } from "react";

/**
 * The frame channel between the story presentation and the lab. The active beat
 * asserts a `frame`; the `StoryStepper` provides it here, and the lab reads it
 * with `useActiveFrame()` and reacts (which scenario to load, which view to
 * show). The frame is opaque to this module — only the exhibit's lab interprets
 * it — so the same channel serves every exhibit.
 */
export const FrameContext = createContext<unknown>(null);

/** Read the frame asserted by the active beat. Null outside a story. */
export function useActiveFrame<Frame>(): Frame | null {
  return useContext(FrameContext) as Frame | null;
}
