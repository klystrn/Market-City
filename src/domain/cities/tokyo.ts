import { createPlots } from "../city";
import { landmarks, sectors, cityRoads, mainland, islands, waterOutline, channels } from "../geography";
import { civicSites } from "../civic";
import type { CityDefinition, CityLandmark } from "./types";
// Tokyo — Nasdaq-100.
//
// The original layout, unchanged: inland sprawl, eastern river wards, a
// southeastern bay carrying three sector islands, an elevated rail loop and
// Mount Fuji behind the skyline. Sector towns hold subsector streets.
//
// Tokyo keeps its bespoke terrain, seasons and civic buildings rather than the
// shared city renderer, so its geography module stays the source of truth.
const tokyoLandmarks: CityLandmark[] = [
  ...landmarks.map((l) => ({
    id: l.sector,
    name: l.name,
    x: l.x,
    z: l.z,
    radius: l.radius,
    kind: "tower" as const,
    sector: l.sector,
  })),
  ...civicSites.map((c) => ({
    id: c.id,
    name: c.name,
    x: c.x,
    z: c.z,
    radius: c.radius,
    kind: "museum" as const,
  })),
];
export const tokyo: CityDefinition = {
  id: "tokyo",
  name: "Tokyo",
  region: "Japan",
  universe: "nasdaq100",
  tagline: "Sector towns and subsector streets",
  tierNoun: "Town",
  layoutNote:
    "Each sector is a town and each subsector a street, with Mount Fuji behind the skyline.",
  tiers: sectors.map((s, i) => ({ id: s.id, name: s.short, rank: i + 1 })),
  districts: sectors,
  landmarks: tokyoLandmarks,
  land: [mainland, ...islands],
  water: [waterOutline, ...channels],
  roads: () => cityRoads(),
  createPlots,
  surround: "sea",
  camera: {
    offset: [270, 285, 330],
    target: [-12, 0, -12],
    overviewDivisor: [330, 245],
    overviewMax: 4.2,
  },
  bespokeTerrain: true,
};
