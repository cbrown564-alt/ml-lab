"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Lab-wide learner settings (docs/06, A4: settings persist — mode
 * preference, later audio autoplay). Local-first like everything else;
 * localStorage is enough for a handful of scalar preferences.
 */

export type ExperimentMode = "visual" | "code";

type SettingsState = {
  schemaVersion: number;
  /** Preferred experiment representation, remembered across exhibits. */
  mode: ExperimentMode;
  setMode: (mode: ExperimentMode) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      schemaVersion: 1,
      mode: "visual",
      setMode: (mode) => set({ mode }),
    }),
    { name: "ml-lab-settings-v1" },
  ),
);
