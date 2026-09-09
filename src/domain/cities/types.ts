import type { Company, Plot, Sector } from "../types";
import type { Point, Road } from "../geography";
import type { BakedLayout } from "./layout-key";
export type CityId = "tokyo" | "london" | "newyork";
export type UniverseId = "nasdaq100" | "sp500";
export type LandmarkKind =
  | "park"
  | "tower"
  | "spire"
  | "bridge"
  | "museum"
  | "palace"
  | "wheel"
  | "arena"
  | "statue"
  | "dome"
  | "terminal"
  | "greenway";
// A recognizable place in the real city, rendered as simplified low-poly massing.
// `ticker` marks a landmark that stands in for a company's building: an identity
// cue for exploration, never a claim about ownership, tenancy or headquarters.
export interface CityLandmark {
  id: string;
  name: string;
  x: number;
  z: number;
  radius: number;
  kind: LandmarkKind;
  /** Rectangular footprint for parks and campuses; radius is used when absent. */
  width?: number;
  depth?: number;
  height?: number;
  rotation?: number;
  color?: string;
  ticker?: string;
  /** District this landmark identifies, matching the Tokyo landmark convention. */
  sector?: string;
}
// London zone or New York borough. Rank 1 holds the largest market caps.
export interface CityTier {
  id: string;
  name: string;
  rank: number;
  note?: string;
}
export interface CityDistrict extends Sector {
  tier?: string;
}
export interface CityBudget {
  /** Company lots placed on the ground. */
  lots: number;
  /** Landmark meshes drawn as scenery. */
  landmarks: number;
  /** Straight road segments the terrain instances. */
  roadSegments: number;
  /** Floating labels that can share the screen: districts, landmarks, buildings. */
  labels: number;
}
export interface CityDefinition {
  id: CityId;
  name: string;
  region: string;
  universe: UniverseId;
  tagline: string;
  /** What this city calls a market-cap band: Zone, Borough or Town. */
  tierNoun: string;
  /** How the city orders companies, shown in the guide and company card. */
  layoutNote: string;
  tiers: CityTier[];
  districts: CityDistrict[];
  landmarks: CityLandmark[];
  land: Point[][];
  water: Point[][];
  /** Streets for the lots actually placed, so a city draws no road network
   *  where it has no buildings. */
  roads: (plots: Plot[]) => Road[];
  createPlots: (companies: Company[]) => Plot[];
  /** Camera offset from its target, and the default overview target. */
  camera: {
    offset: [number, number, number];
    target: [number, number, number];
    overviewDivisor: [number, number];
    /** Upper bound for the overview zoom, which is also the zoom-out limit. */
    overviewMax: number;
  };
  /** What lies beyond the city edge. London is inland, so its horizon is land. */
  surround: "sea" | "land";
  /** Placement solved at build time, used whenever it still matches the roster. */
  bakedLayout?: BakedLayout;
  /**
   * What this city is allowed to draw. Every count is an upper bound the city
   * must stay under, declared next to the city so adding one is a deliberate
   * act; tests/budget.test.ts measures the real geometry against it, so a new
   * or grown city cannot quietly regress frame rate.
   */
  budget: CityBudget;
  /**
   * The closed outline of one market-cap band, in ground coordinates. Each city
   * knows its own shape — a London ring, a New York borough shore, a Tokyo town
   * boundary — which is what lets one breadth layer draw all three. The loop is
   * explicit: the first point is repeated as the last, so a renderer that walks
   * consecutive pairs draws the closing edge too. Unknown bands return [].
   */
  tierOutline: (tierId: string) => Point[];
  /** Tokyo keeps its own bespoke terrain, seasons and Fuji. */
  bespokeTerrain?: boolean;
}
