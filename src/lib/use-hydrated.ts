"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * False during SSR and the hydration render, true afterwards. Client-only
 * state (mastery, settings) must render its server fallback until this flips,
 * or the hydration render won't match the server HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
