import type { Company } from "../types";
import { inUniverse } from "../indexes";
import type { CityId, UniverseId } from "./types";
// The little that has to be known about every city before one is chosen: enough
// for the picker, the header and the universe filter. Everything with weight —
// land and water polygons, roads, landmarks, placement — lives in the city's own
// module and is fetched only for the city actually being shown, so the first
// load does not carry two cities nobody is looking at.
export interface CityCatalogEntry {
  id: CityId;
  name: string;
  region: string;
  universe: UniverseId;
  tagline: string;
  /** What this city calls a market-cap band: Zone, Borough or Town. */
  tierNoun: string;
  /** How the city orders companies, shown in the guide and company card. */
  layoutNote: string;
}
export const cityCatalog: CityCatalogEntry[] = [
  {
    id: "newyork",
    name: "New York City",
    region: "United States",
    universe: "sp500",
    tagline: "Five boroughs, Manhattan first",
    tierNoun: "Borough",
    layoutNote:
      "Boroughs rank sectors by market capitalisation, neighbourhoods hold sectors and streets hold subsectors.",
  },
  {
    id: "london",
    name: "London",
    region: "United Kingdom",
    universe: "sp500",
    tagline: "Zones out from the centre",
    tierNoun: "Zone",
    layoutNote:
      "Sectors run outward from the centre as wedges. The larger the company, the lower its zone.",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    region: "Japan",
    universe: "nasdaq100",
    tagline: "Sector towns and subsector streets",
    tierNoun: "Town",
    layoutNote:
      "Each sector is a town and each subsector a street, with Mount Fuji behind the skyline.",
  },
];
export const defaultCityId: CityId = "newyork";
export function getCatalogEntry(id: string | null | undefined): CityCatalogEntry {
  return cityCatalog.find((c) => c.id === id) ?? cityCatalog[0];
}
// A city renders only the companies in its market universe.
export function companiesForCity(
  companies: Company[],
  city: { universe: UniverseId },
): Company[] {
  return companies.filter((c) => inUniverse(c.ticker, city.universe));
}
