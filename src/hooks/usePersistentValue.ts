"use client";
import { useCallback, useEffect, useState } from "react";
// A single string preference persisted to localStorage, hydrated after mount so
// server- and first-client-render markup match.
export function usePersistentValue(key: string, fallback: string) {
  const [value, setValue] = useState(fallback);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate the stored preference once on mount.
      if (stored) setValue(stored);
    } catch {
      // Storage unavailable; keep the fallback.
    }
    setHydrated(true);
  }, [key]);
  const update = useCallback(
    (next: string) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // Ignore quota/availability errors; the choice still applies now.
      }
    },
    [key],
  );
  return [value, update, hydrated] as const;
}
