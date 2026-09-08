import type { Company, Plot, Sector } from "../types";
import type { Point, Road } from "../geography";
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
  roads: Road[];
  createPlots: (companies: Company[]) => Plot[];
  /** Camera offset from its target, and the default overview target. */
  camera: {
    offset: [number, number, number];
    target: [number, number, number];
    overviewDivisor: [number, number];
    /** Upper bound for the overview zoom, which is also the zoom-out limit. */
    overviewMax: number;
  };
  /** Tokyo keeps its own bespoke terrain, seasons and Fuji. */
  bespokeTerrain?: boolean;
}
