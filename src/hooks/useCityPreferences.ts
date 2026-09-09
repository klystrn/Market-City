"use client";
import { useCallback, useEffect, useState } from "react";
import { defaultMapFeatures, type MapFeatures } from "@/domain/map-features";
import type { SeasonMode } from "@/domain/seasons";
export interface CityPreferences {
  mapFeatures: MapFeatures;
  seasonMode: SeasonMode;
  /** The camera bookmark to restore when this city is opened again. */
  bookmarkId: string | null;
}
const defaults: CityPreferences = {
  mapFeatures: defaultMapFeatures,
  seasonMode: "auto",
  bookmarkId: null,
};
const key = (cityId: string) => `market-city-prefs:${cityId}`;
function read(cityId: string): CityPreferences {
  try {
    const raw = window.localStorage.getItem(key(cityId));
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return defaults;
    const stored = parsed as Partial<CityPreferences>;
    return {
      // Merged over the defaults so a preference file written before a layer
      // existed does not leave that layer undefined.
      mapFeatures: { ...defaultMapFeatures, ...(stored.mapFeatures ?? {}) },
      seasonMode: stored.seasonMode ?? defaults.seasonMode,
      bookmarkId: stored.bookmarkId ?? null,
    };
  } catch {
    return defaults;
  }
}
/**
 * Layers, season and last camera bookmark, remembered per city.
 *
 * The three cities are different places to be, and a layer that helps in
 * London's rings can be noise in Tokyo's towns. Keeping one shared set of
 * toggles would mean re-tuning the view every time you switch, so each city
 * keeps its own feel.
 */
export function useCityPreferences(cityId: string) {
  const [prefs, setPrefs] = useState<CityPreferences>(defaults);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load this city's stored preferences when the city changes.
    setPrefs(read(cityId));
    setHydrated(true);
  }, [cityId]);
  const update = useCallback(
    (patch: Partial<CityPreferences>) =>
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        try {
          window.localStorage.setItem(key(cityId), JSON.stringify(next));
        } catch {
          // Storage unavailable; the choice still applies to this session.
        }
        return next;
      }),
    [cityId],
  );
  return { prefs, update, hydrated };
}
