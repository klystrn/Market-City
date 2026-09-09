"use client";
import { useCallback, useEffect, useState } from "react";
// A small string set persisted to localStorage, hydrated after mount so
// server- and first-client-render markup match (avoids hydration mismatch).
export function usePersistentSet(key: string) {
  const [items, setItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string"))
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate persisted items once on mount.
        setItems(parsed);
    } catch {
      // Ignore unavailable or corrupt storage; the set simply starts empty.
    }
    setHydrated(true);
  }, [key]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Storage may be full or disabled; the in-memory set still works.
    }
  }, [key, items, hydrated]);
  const toggle = useCallback(
    (ticker: string) =>
      setItems((prev) =>
        prev.includes(ticker)
          ? prev.filter((t) => t !== ticker)
          : [...prev, ticker],
      ),
    [],
  );
  const add = useCallback(
    (ticker: string) =>
      setItems((prev) => (prev.includes(ticker) ? prev : [...prev, ticker])),
    [],
  );
  const remove = useCallback(
    (ticker: string) =>
      setItems((prev) => prev.filter((t) => t !== ticker)),
    [],
  );
  const has = useCallback((ticker: string) => items.includes(ticker), [items]);
  return { items, toggle, add, remove, has, hydrated };
}
