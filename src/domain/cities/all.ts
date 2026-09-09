import { tokyo } from "./tokyo";
import { london } from "./london";
import { newYork } from "./newyork";
import type { CityDefinition } from "./types";
// Every city loaded eagerly, for tests and build scripts that need to compare
// them side by side. The application never imports this: it loads one city at a
// time through `loadCity`, which is what keeps the other two out of the first
// download.
export const cities: CityDefinition[] = [newYork, london, tokyo];
export function getCity(id: string | null | undefined): CityDefinition {
  return cities.find((c) => c.id === id) ?? cities[0];
}
