import type { Company, Plot } from "../types";
import type { Point, Road } from "../geography";
import { massing } from "../massing";
import { sectorIdentities } from "../sectors";
import { subsectors } from "../subsectors";
import { formFor } from "../forms";
import type { CityDefinition, CityDistrict, CityLandmark, CityTier } from "./types";
// New York City — S&P 500.
//
// Five boroughs carry market-cap tiers, neighbourhoods carry sectors and streets
// carry subsectors. Boroughs are ordered Manhattan, Queens, Staten Island,
// Brooklyn, Bronx from the largest sector market capitalisation to the smallest,
// as specified by the owner.
//
// Neighbourhood placement follows the real city wherever a real anchor exists:
// financials in the Financial District around Wall Street, technology along
// Hudson Yards and Chelsea, media in Midtown, hospitals and life science on the
// Queens waterfront opposite the East Side. A handful of companies are pinned to
// the real building associated with them, which is an identity cue rather than a
// claim about ownership or tenancy.
//
// The frame is +x east, +z south. It is a stylised interpretation at an
// illustrative scale, not a georeferenced map.
export const boroughs: CityTier[] = [
  { id: "manhattan", name: "Manhattan", rank: 1, note: "Largest sectors" },
  { id: "queens", name: "Queens", rank: 2 },
  { id: "staten-island", name: "Staten Island", rank: 3 },
  { id: "brooklyn", name: "Brooklyn", rank: 4 },
  { id: "bronx", name: "The Bronx", rank: 5, note: "Smallest sectors" },
];
export const boroughShapes: Record<string, Point[]> = {
  manhattan: [
    [-20, -150],
    [6, -150],
    [16, -88],
    [23, -12],
    [25, 31],
    [19, 62],
    [6, 84],
    [-9, 78],
    [-22, 31],
    [-26, -31],
    [-23, -93],
  ],
  bronx: [
    [-9, -235],
    [104, -238],
    [116, -176],
    [60, -157],
    [3, -163],
    [-19, -188],
  ],
  queens: [
    [48, -110],
    [235, -112],
    [250, -10],
    [200, 54],
    [112, 60],
    [60, 32],
    [44, -38],
  ],
  brooklyn: [
    [41, 64],
    [110, 58],
    [188, 66],
    [197, 144],
    [135, 185],
    [63, 163],
    [34, 107],
  ],
  "staten-island": [
    [-144, 113],
    [-63, 100],
    [-34, 144],
    [-60, 204],
    [-132, 201],
    [-157, 154],
  ],
};
// Hand-authored so each neighbourhood name suits the sector that lands in it.
// tests/cities.test.ts asserts this borough assignment really does follow the
// seeded sector market-cap ranking, so the documented rule cannot drift.
const neighbourhoods: {
  sector: string;
  borough: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
}[] = [
  {
    sector: "technology",
    borough: "manhattan",
    name: "Hudson Yards & Chelsea",
    x: 0,
    z: 40,
    width: 32,
    depth: 26,
  },
  {
    sector: "communications",
    borough: "manhattan",
    name: "Midtown & Rockefeller Center",
    x: -1,
    z: 18,
    width: 34,
    depth: 20,
  },
  {
    sector: "consumer",
    borough: "manhattan",
    name: "Upper East Side & Madison Avenue",
    x: 13,
    z: -16,
    width: 15,
    depth: 30,
  },
  {
    sector: "financials",
    borough: "manhattan",
    name: "Financial District & Wall Street",
    x: 2,
    z: 64,
    width: 21,
    depth: 16,
  },
  {
    sector: "healthcare",
    borough: "queens",
    name: "Long Island City & Astoria",
    x: 74,
    z: 6,
    width: 38,
    depth: 32,
  },
  {
    sector: "staples",
    borough: "queens",
    name: "Flushing & Corona",
    x: 152,
    z: -26,
    width: 44,
    depth: 34,
  },
  {
    sector: "industrials",
    borough: "staten-island",
    name: "Port Richmond",
    x: -97,
    z: 129,
    width: 40,
    depth: 28,
  },
  {
    sector: "energy",
    borough: "staten-island",
    name: "New Springville",
    x: -88,
    z: 173,
    width: 38,
    depth: 24,
  },
  {
    sector: "utilities",
    borough: "brooklyn",
    name: "Sunset Park & Gowanus",
    x: 96,
    z: 138,
    width: 36,
    depth: 28,
  },
  {
    sector: "realestate",
    borough: "brooklyn",
    name: "Downtown Brooklyn & Dumbo",
    x: 60,
    z: 86,
    width: 30,
    depth: 26,
  },
  {
    sector: "materials",
    borough: "bronx",
    name: "Port Morris & Hunts Point",
    x: 44,
    z: -191,
    width: 46,
    depth: 28,
  },
];
export const newYorkDistricts: CityDistrict[] = sectorIdentities.map((s) => {
  const place = neighbourhoods.find((n) => n.sector === s.id)!;
  return {
    ...s,
    name: place.name,
    x: place.x,
    z: place.z,
    width: place.width,
    depth: place.depth,
    tier: place.borough,
  };
});
export const newYorkLandmarks: CityLandmark[] = [
  {
    id: "central-park",
    name: "Central Park",
    x: -4,
    z: -14,
    radius: 21,
    width: 15,
    depth: 42,
    kind: "park",
  },
  {
    id: "empire-state",
    name: "Empire State Building",
    x: 3,
    z: 27,
    radius: 3,
    kind: "spire",
    height: 34,
  },
  {
    id: "chrysler",
    name: "Chrysler Building",
    x: 12,
    z: 22,
    radius: 3,
    kind: "spire",
    height: 27,
  },
  {
    id: "one-wtc",
    name: "One World Trade Center",
    x: -5,
    z: 65,
    radius: 4,
    kind: "spire",
    height: 40,
    sector: "financials",
  },
  {
    id: "liberty",
    name: "Statue of Liberty",
    x: -38,
    z: 96,
    radius: 5,
    kind: "statue",
    height: 12,
  },
  {
    id: "brooklyn-bridge",
    name: "Brooklyn Bridge",
    x: 26,
    z: 76,
    radius: 9,
    kind: "bridge",
  },
  {
    id: "grand-central",
    name: "Grand Central Terminal",
    x: 14,
    z: 21,
    radius: 4,
    kind: "terminal",
    sector: "communications",
  },
  { id: "met", name: "The Met", x: 7, z: -8, radius: 4, kind: "museum" },
  {
    id: "moma",
    name: "Museum of Modern Art",
    x: -2,
    z: 12,
    radius: 3,
    kind: "museum",
  },
  {
    id: "high-line",
    name: "The High Line",
    x: -17,
    z: 44,
    radius: 8,
    width: 3,
    depth: 20,
    kind: "greenway",
    sector: "technology",
  },
  {
    id: "yankee",
    name: "Yankee Stadium",
    x: 22,
    z: -168,
    radius: 8,
    kind: "arena",
    sector: "materials",
  },
  {
    id: "citi-field",
    name: "Citi Field & Flushing Meadows",
    x: 108,
    z: -46,
    radius: 10,
    kind: "arena",
    sector: "staples",
  },
  {
    id: "coney",
    name: "Coney Island Wonder Wheel",
    x: 112,
    z: 176,
    radius: 6,
    kind: "wheel",
    sector: "utilities",
  },
  {
    id: "prospect-park",
    name: "Prospect Park",
    x: 82,
    z: 110,
    radius: 13,
    width: 22,
    depth: 20,
    kind: "park",
    sector: "realestate",
  },
  {
    id: "si-ferry",
    name: "Staten Island Ferry Terminal",
    x: -52,
    z: 112,
    radius: 5,
    kind: "terminal",
    sector: "industrials",
  },
  {
    id: "washington-square",
    name: "Washington Square Arch",
    x: -6,
    z: 56,
    radius: 4,
    kind: "museum",
  },
];
// Real buildings that stand in for their occupant. Identity cue only: this is
// not a claim about ownership, tenancy or headquarters location.
export const newYorkPins: { ticker: string; name: string; x: number; z: number }[] =
  [
    { ticker: "JPM", name: "270 Park Avenue", x: 19, z: 16 },
    { ticker: "AAPL", name: "Apple Fifth Avenue", x: 18, z: 8 },
    { ticker: "GOOGL", name: "St John's Terminal", x: -9, z: 58 },
  ];
const pinned = new Map(newYorkPins.map((p) => [p.ticker, p]));
export function createNewYorkPlots(companies: Company[]): Plot[] {
  const plots: Plot[] = [];
  for (const district of newYorkDistricts) {
    const groups = subsectors.filter((s) => s.sector === district.id);
    const rows = Math.max(1, groups.length);
    const rowDepth = district.depth / rows;
    groups.forEach((group, row) => {
      // Taxonomy order keeps a company on the same street across refreshes.
      const members = companies
        .filter((c) => c.sector === district.id && c.subsector === group.id)
        .sort(
          (a, b) =>
            group.tickers.indexOf(a.ticker) - group.tickers.indexOf(b.ticker),
        );
      if (!members.length) return;
      const z = district.z - district.depth / 2 + (row + 0.5) * rowDepth;
      const cell = district.width / members.length;
      members.forEach((company, i) => {
        const pin = pinned.get(company.ticker);
        const { footprint, height } = massing(company.marketCap);
        const width = Math.min(cell * 0.82, footprint);
        const depth = Math.min(rowDepth * 0.66, footprint * 0.86);
        // Volume is preserved when a dense block clips the footprint, so a
        // mega-cap on a tight street grows upward instead of losing mass.
        const clipped = (footprint * footprint * 0.86) / (width * depth);
        plots.push({
          ticker: company.ticker,
          x: pin ? pin.x : district.x + (i + 0.5 - members.length / 2) * cell,
          z: pin ? pin.z : z,
          width,
          depth,
          height: height * Math.min(1.7, Math.max(1, clipped)),
          variant: formFor(company.ticker, i + row * 3),
          tier: district.tier,
        });
      });
    });
  }
  return plots;
}
export function newYorkRoads(): Road[] {
  const roads: Road[] = [];
  for (const district of newYorkDistricts) {
    const groups = subsectors.filter((s) => s.sector === district.id);
    const rows = Math.max(1, groups.length);
    const rowDepth = district.depth / rows;
    for (let row = 0; row < rows; row++) {
      const z = district.z - district.depth / 2 + (row + 1) * rowDepth;
      roads.push({
        id: `${district.id}-street-${row}`,
        points: [
          [district.x - district.width / 2 - 2, z],
          [district.x + district.width / 2 + 2, z],
        ],
        width: 1.9,
      });
    }
    for (const side of [-1, 1])
      roads.push({
        id: `${district.id}-avenue-${side}`,
        points: [
          [district.x + (side * district.width) / 2 - side * 1.5, district.z - district.depth / 2 - 3],
          [district.x + (side * district.width) / 2 - side * 1.5, district.z + district.depth / 2 + 3],
        ],
        width: 2.4,
      });
  }
  // Manhattan's spine, and the crossings that tie the boroughs together.
  roads.push({
    id: "broadway",
    points: [
      [-6, 80],
      [-2, 40],
      [4, 4],
      [0, -60],
      [-6, -130],
    ],
    width: 3,
  });
  roads.push({
    id: "brooklyn-bridge",
    points: [
      [12, 74],
      [44, 80],
    ],
    width: 3.2,
    bridge: true,
  });
  roads.push({
    id: "queensboro-bridge",
    points: [
      [22, 14],
      [62, 18],
    ],
    width: 3.2,
    bridge: true,
  });
  roads.push({
    id: "willis-bridge",
    points: [
      [4, -142],
      [22, -168],
    ],
    width: 3,
    bridge: true,
  });
  roads.push({
    id: "verrazzano-bridge",
    points: [
      [-46, 118],
      [56, 148],
    ],
    width: 3.2,
    bridge: true,
  });
  roads.push({
    id: "brooklyn-queens",
    points: [
      [70, 60],
      [96, 30],
    ],
    width: 2.8,
  });
  return roads;
}
export const newYork: CityDefinition = {
  id: "newyork",
  name: "New York City",
  region: "United States",
  universe: "sp500",
  tagline: "Five boroughs, Manhattan first",
  tierNoun: "Borough",
  layoutNote:
    "Boroughs rank sectors by market capitalisation, neighbourhoods hold sectors and streets hold subsectors.",
  tiers: boroughs,
  districts: newYorkDistricts,
  landmarks: newYorkLandmarks,
  land: boroughs.map((b) => boroughShapes[b.id]),
  water: [],
  roads: () => newYorkRoads(),
  createPlots: createNewYorkPlots,
  surround: "sea",
  // Opens over the Hudson looking east-south-east down the built length of
  // Manhattan, which puts Queens across the East River and Brooklyn beyond the
  // bridges in the background rather than beside the island.
  camera: {
    offset: [-250, 200, -92],
    target: [40, 0, 39],
    overviewDivisor: [188, 152],
    overviewMax: 7,
  },
};
