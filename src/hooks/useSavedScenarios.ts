"use client";
import { useCallback, useEffect, useState } from "react";
import type { SavedScenario, ScenarioState } from "@/domain/scenarios";
const KEY = "market-city-scenarios";
function isSaved(v: unknown): v is SavedScenario {
  return typeof v === "object" && v !== null && "id" in v && "god" in v;
}
export function useSavedScenarios() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.every(isSaved))
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate persisted scenarios once on mount.
        setScenarios(parsed);
    } catch {
      // Storage unavailable or corrupt; start empty.
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(scenarios));
    } catch {
      // Ignore quota/availability errors.
    }
  }, [scenarios, hydrated]);
  const save = useCallback(
    (name: string, state: ScenarioState) =>
      setScenarios((prev) => [
        ...prev,
        {
          ...state,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          createdAt: new Date().toISOString(),
        },
      ]),
    [],
  );
  const remove = useCallback(
    (id: string) => setScenarios((prev) => prev.filter((s) => s.id !== id)),
    [],
  );
  return { scenarios, save, remove };
}
