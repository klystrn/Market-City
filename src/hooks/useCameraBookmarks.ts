"use client";
import { useCallback, useEffect, useState } from "react";
import type { CameraBookmark } from "@/domain/bookmarks";
const KEY = "market-city-camera-bookmarks";
function isBookmark(v: unknown): v is CameraBookmark {
  return (
    typeof v === "object" &&
    v !== null &&
    "id" in v &&
    "name" in v &&
    "deep" in v
  );
}
export function useCameraBookmarks() {
  const [bookmarks, setBookmarks] = useState<CameraBookmark[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.every(isBookmark))
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate persisted bookmarks once on mount.
        setBookmarks(parsed);
    } catch {
      // Storage unavailable or corrupt; start with an empty list.
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(bookmarks));
    } catch {
      // Ignore quota/availability errors; bookmarks stay in memory only.
    }
  }, [bookmarks, hydrated]);
  const save = useCallback(
    (name: string, ticker: string | null, deep: boolean, sector: string | null) =>
      setBookmarks((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name,
          ticker,
          deep,
          sector,
          createdAt: new Date().toISOString(),
        },
      ]),
    [],
  );
  const remove = useCallback(
    (id: string) =>
      setBookmarks((prev) => prev.filter((b) => b.id !== id)),
    [],
  );
  return { bookmarks, save, remove, hydrated };
}
