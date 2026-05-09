"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChartStore {
  hiddenBuckets: string[];
  toggleBucket: (id: string) => void;
  isBucketHidden: (id: string) => boolean;
}

export const useChartStore = create<ChartStore>()(
  persist(
    (set, get) => ({
      hiddenBuckets: [],
      toggleBucket: (id) =>
        set((state) => {
          const exists = state.hiddenBuckets.includes(id);
          return {
            hiddenBuckets: exists
              ? state.hiddenBuckets.filter((b) => b !== id)
              : [...state.hiddenBuckets, id],
          };
        }),
      isBucketHidden: (id) => get().hiddenBuckets.includes(id),
    }),
    {
      name: "munny-chart-prefs",
    }
  )
);
