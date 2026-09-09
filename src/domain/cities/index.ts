import type { CityDefinition, CityId } from "./types";
// Each city's geometry is fetched on demand, so the first load carries only the
// city being shown. The three modules are named literally rather than built from
// a variable, because a bundler can only split what it can see statically.
const loaders: Record<CityId, () => Promise<{ city: CityDefinition }>> = {
  newyork: async () => ({ city: (await import("./newyork")).newYork }),
  london: async () => ({ city: (await import("./london")).london }),
  tokyo: async () => ({ city: (await import("./tokyo")).tokyo }),
};
const cache = new Map<CityId, CityDefinition>();
/** The full city, from cache when it has already been fetched once. */
export async function loadCity(id: CityId): Promise<CityDefinition> {
  const cached = cache.get(id);
  if (cached) return cached;
  const { city } = await loaders[id]();
  cache.set(id, city);
  return city;
}
/** The city if it is already loaded, without starting a fetch. */
export function loadedCity(id: CityId): CityDefinition | undefined {
  return cache.get(id);
}
export {
  cityCatalog,
  defaultCityId,
  getCatalogEntry,
  companiesForCity,
  type CityCatalogEntry,
} from "./catalog";
export type { CityDefinition, CityId } from "./types";
