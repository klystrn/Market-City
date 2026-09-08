import type { Company } from "../types";
import { inUniverse } from "../indexes";
import { tokyo } from "./tokyo";
import { london } from "./london";
import { newYork } from "./newyork";
import type { CityDefinition, CityId } from "./types";
export const cities: CityDefinition[] = [newYork, london, tokyo];
export const defaultCityId: CityId = "newyork";
export function getCity(id: string | null | undefined): CityDefinition {
  return cities.find((c) => c.id === id) ?? cities[0];
}
// A city renders only the companies in its market universe.
export function companiesForCity(
  companies: Company[],
  city: CityDefinition,
): Company[] {
  return companies.filter((c) => inUniverse(c.ticker, city.universe));
}
export type { CityDefinition, CityId } from "./types";
