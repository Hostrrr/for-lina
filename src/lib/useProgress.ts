"use client";

import { useCallback, useEffect, useState } from "react";
import type { Progress, Screen } from "./types";
import { INITIAL_PROGRESS, STORAGE_KEY } from "./types";

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Progress;
        setProgress({ ...INITIAL_PROGRESS, ...parsed });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Progress) => {
    setProgress(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const go = useCallback(
    (screen: Screen, patch?: Partial<Progress>) => {
      persist({ ...progress, ...patch, screen });
    },
    [persist, progress],
  );

  const reset = useCallback(() => {
    persist(INITIAL_PROGRESS);
  }, [persist]);

  return { progress, ready, go, reset };
}
