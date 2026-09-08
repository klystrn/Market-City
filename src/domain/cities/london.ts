import type { Company, Plot } from "../types";
import type { Point, Road } from "../geography";
import { massing } from "../massing";
import { sectorIdentities } from "../sectors";
import { formFor } from "../forms";
import type { CityDefinition, CityDistrict, CityLandmark } from "./types";
// London — S&P 500.
//
// A radial city centred on Charing Cross. Nine concentric zones ring the centre;
// every sector cuts through every zone as an angular wedge, so a district is a
// slice from the middle to the edge rather than a town. The lower the zone
// number, the larger the company. Subsector is not used for placement here; it
// appears on the company card instead.
//
// Bearings are anchored to the real city where a real anchor exists: financials
// point east toward the City and Canary Wharf, technology north-east toward
// King's Cross and Shoreditch, healthcare north toward Bloomsbury and Euston,
// energy south toward the South Bank. The remaining sectors fill the circle in a
// stable order. This is a stylised interpretation, not a georeferenced map.
// The innermost disc is the civic core — Westminster, Trafalgar Square and the
// river frontage — so company lots begin on the Zone 1 ring outside it.
const CENTRE_RADIUS = 26;
const ZONE_WIDTH = 16;
const ZONE_COUNT = 9;
// Radial avenues between wedges are kept at a constant ground width, so the
// angle they consume shrinks as the rings grow.
const AVENUE_ARC = 9;
const SPACING = 10;
export const londonZones = Array.from({ length: ZONE_COUNT }, (_, i) => ({
  id: `zone-${i + 1}`,
  name: `Zone ${i + 1}`,
  rank: i + 1,
  note: i === 0 ? "Central London" : undefined,
}));
export const zoneInner = (rank: number) =>
  CENTRE_RADIUS + (rank - 1) * ZONE_WIDTH;
export const zoneOuter = (rank: number) => CENTRE_RADIUS + rank * ZONE_WIDTH;
export const zoneMid = (rank: number) => zoneInner(rank) + ZONE_WIDTH / 2;
export const LONDON_RADIUS = zoneOuter(ZONE_COUNT);
// Clockwise from due east, matching the screen frame (+x east, +z south).
const bearings: Record<string, number> = {
  financials: 0,
  industrials: 32.7,
  utilities: 65.5,
  energy: 98.2,
  realestate: 130.9,
  consumer: 163.6,
  staples: 196.4,
  materials: 229.1,
  healthcare: 261.8,
  technology: 294.5,
  communications: 327.3,
};
const WEDGE = (Math.PI * 2) / 11;
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Usable angle of a wedge at a given radius, once the avenues are removed. */
function usableAngle(radius: number) {
  return Math.max(0.1, WEDGE - AVENUE_ARC / radius);
}
export const londonDistricts: CityDistrict[] = sectorIdentities.map((s) => {
  // The label and click target sit in the middle of the wedge, a few zones out.
  const angle = rad(bearings[s.id]);
  const r = zoneMid(4);
  return {
    ...s,
    x: Math.cos(angle) * r,
    z: Math.sin(angle) * r,
    width: 16,
    depth: 16,
  };
});
// The Thames, west to east, with the Westminster bend and the Isle of Dogs loop.
export const thames: Point[] = [
  [-LONDON_RADIUS, -4],
  [-118, 2],
  [-86, 9],
  [-58, 15],
  [-32, 19],
  [-8, 16],
  [12, 12],
  [32, 16],
  [52, 27],
  [70, 20],
  [94, 11],
  [124, 16],
  [LONDON_RADIUS, 12],
];
export const THAMES_HALF_WIDTH = 5.5;
const rawLandmarks: CityLandmark[] = [
  {
    id: "shard",
    name: "The Shard",
    x: 30,
    z: 22,
    radius: 4,
    kind: "spire",
    height: 30,
    ticker: "AAPL",
  },
  {
    id: "tower-bridge",
    name: "Tower Bridge",
    x: 36,
    z: 16,
    radius: 7,
    kind: "bridge",
    rotation: Math.PI / 2,
  },
  { id: "london-eye", name: "London Eye", x: 2, z: 18, radius: 6, kind: "wheel" },
  {
    id: "buckingham",
    name: "Buckingham Palace",
    x: -15,
    z: 7,
    radius: 6,
    kind: "palace",
  },
  { id: "st-pauls", name: "St Paul's Cathedral", x: 20, z: 3, radius: 5, kind: "dome" },
  {
    id: "gherkin",
    name: "The Gherkin",
    x: 29,
    z: 1,
    radius: 3,
    kind: "tower",
    height: 18,
    sector: "financials",
  },
  {
    id: "canary-wharf",
    name: "Canary Wharf",
    x: 62,
    z: 16,
    radius: 8,
    kind: "tower",
    height: 26,
  },
  {
    id: "hyde-park",
    name: "Hyde Park",
    x: -31,
    z: -2,
    radius: 15,
    width: 28,
    depth: 18,
    kind: "park",
  },
  {
    id: "regents-park",
    name: "Regent's Park",
    x: -12,
    z: -30,
    radius: 12,
    width: 22,
    depth: 16,
    kind: "park",
  },
  {
    id: "british-museum",
    name: "British Museum",
    x: 3,
    z: -13,
    radius: 5,
    kind: "museum",
    sector: "healthcare",
  },
  { id: "tate-modern", name: "Tate Modern", x: 14, z: 19, radius: 5, kind: "museum" },
  {
    id: "kings-cross",
    name: "King's Cross",
    x: 8,
    z: -22,
    radius: 5,
    kind: "terminal",
    sector: "technology",
  },
  { id: "o2", name: "The O2", x: 74, z: 21, radius: 6, kind: "dome" },
  {
    id: "wembley",
    name: "Wembley Stadium",
    x: -62,
    z: -36,
    radius: 8,
    kind: "arena",
  },
  {
    id: "greenwich",
    name: "Royal Observatory Greenwich",
    x: 84,
    z: 30,
    radius: 6,
    kind: "museum",
  },
  {
    id: "battersea",
    name: "Battersea Power Station",
    x: -18,
    z: 22,
    radius: 6,
    kind: "terminal",
    sector: "energy",
  },
];
// A landmark building standing on a wedge's centre line would take the lot the
// sector's largest company should hold. Snapping it to the nearest radial
// avenue keeps its distance from the centre — and so its zone — while moving it
// only a few degrees around. Open space is left where it is.
function snapToAvenue(landmark: CityLandmark): CityLandmark {
  if (landmark.kind === "park" || landmark.kind === "greenway") return landmark;
  const radius = Math.hypot(landmark.x, landmark.z);
  if (radius < CENTRE_RADIUS || radius > LONDON_RADIUS) return landmark;
  const angle = Math.atan2(landmark.z, landmark.x);
  const avenues = Object.values(bearings).map((b) => rad(b) + WEDGE / 2);
  let best = avenues[0];
  let bestGap = Infinity;
  for (const avenue of avenues) {
    const gap = Math.abs(
      Math.atan2(Math.sin(angle - avenue), Math.cos(angle - avenue)),
    );
    if (gap < bestGap) {
      bestGap = gap;
      best = avenue;
    }
  }
  return {
    ...landmark,
    x: Math.cos(best) * radius,
    z: Math.sin(best) * radius,
  };
}
export const londonLandmarks: CityLandmark[] = rawLandmarks.map(snapToAvenue);
function distanceToPath(x: number, z: number, path: Point[]) {
  let best = Infinity;
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1],
      [bx, bz] = path[i];
    const dx = bx - ax,
      dz = bz - az;
    const t = Math.max(
      0,
      Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)),
    );
    best = Math.min(best, Math.hypot(x - ax - t * dx, z - az - t * dz));
  }
  return best;
}
const pinnedLandmarks = new Map(
  londonLandmarks.filter((l) => l.ticker).map((l) => [l.ticker!, l]),
);
// Company lots keep clear of the river and of every landmark ground, including
// the landmarks that stand in for a company. Open space claims its full
// footprint; a landmark building only claims its own plot, because central
// London's towers and museums stand shoulder to shoulder with everything else.
function landmarkClearance(landmark: CityLandmark) {
  return landmark.kind === "park" || landmark.kind === "greenway"
    ? Math.max(landmark.width ?? 0, landmark.depth ?? 0, landmark.radius) / 2
    : Math.min(landmark.radius, 3.5);
}
export function londonBlocked(x: number, z: number, clearance: number) {
  if (distanceToPath(x, z, thames) < THAMES_HALF_WIDTH + clearance) return true;
  return londonLandmarks.some(
    (l) => Math.hypot(x - l.x, z - l.z) < landmarkClearance(l) + clearance,
  );
}
/** Evenly spaced lot centres across a wedge's usable arc, largest ring first. */
function zoneSlots(rank: number) {
  const radius = zoneMid(rank);
  const arc = usableAngle(radius) * radius;
  const count = Math.max(1, Math.floor(arc / SPACING));
  const step = SPACING / radius;
  return Array.from(
    { length: count },
    (_, i) => (i - (count - 1) / 2) * step,
  );
}
export function createLondonPlots(companies: Company[]): Plot[] {
  const plots: Plot[] = [];
  for (const sector of sectorIdentities) {
    const bearing = rad(bearings[sector.id]);
    // Largest first, so the biggest company in each sector reaches Zone 1.
    const members = companies
      .filter((c) => c.sector === sector.id)
      .sort(
        (a, b) => b.marketCap - a.marketCap || a.ticker.localeCompare(b.ticker),
      );
    let index = 0;
    for (let rank = 1; rank <= ZONE_COUNT && index < members.length; rank++) {
      const radius = zoneMid(rank);
      for (const offset of zoneSlots(rank)) {
        if (index >= members.length) break;
        const company = members[index];
        const { footprint, height } = massing(company.marketCap);
        const landmark = pinnedLandmarks.get(company.ticker);
        const x = Math.cos(bearing + offset) * radius;
        const z = Math.sin(bearing + offset) * radius;
        // A slot the river or a landmark occupies is left empty rather than
        // displaced, which keeps every remaining lot collision-free.
        if (!landmark && londonBlocked(x, z, footprint / 2 + 1.4)) continue;
        index++;
        plots.push({
          ticker: company.ticker,
          x: landmark ? landmark.x : x,
          z: landmark ? landmark.z : z,
          width: footprint,
          depth: footprint * 0.86,
          height: landmark?.height ?? height,
          variant: formFor(
            company.ticker,
            sectorIdentities.indexOf(sector) * 3 + index,
          ),
          tier: `zone-${rank}`,
        });
      }
    }
    // Anything still unplaced takes the outer ring on the wedge centre line.
    while (index < members.length) {
      const company = members[index++];
      const { footprint, height } = massing(company.marketCap);
      const radius = zoneMid(ZONE_COUNT) + (index % 2) * 6;
      plots.push({
        ticker: company.ticker,
        x: Math.cos(bearing) * radius,
        z: Math.sin(bearing) * radius,
        width: footprint,
        depth: footprint * 0.86,
        height,
        variant: formFor(company.ticker, index),
        tier: `zone-${ZONE_COUNT}`,
      });
    }
  }
  return plots;
}
export function londonRoads(): Road[] {
  const roads: Road[] = [];
  for (let rank = 1; rank <= ZONE_COUNT; rank++) {
    const radius = zoneOuter(rank);
    const points: Point[] = Array.from({ length: 65 }, (_, i) => {
      const a = (i / 64) * Math.PI * 2;
      return [Math.cos(a) * radius, Math.sin(a) * radius] as Point;
    });
    roads.push({ id: `ring-${rank}`, points, width: rank <= 2 ? 2.6 : 2.2 });
  }
  for (const [id, bearing] of Object.entries(bearings)) {
    const a = rad(bearing) + WEDGE / 2;
    roads.push({
      id: `radial-${id}`,
      points: [
        [Math.cos(a) * CENTRE_RADIUS, Math.sin(a) * CENTRE_RADIUS],
        [Math.cos(a) * LONDON_RADIUS, Math.sin(a) * LONDON_RADIUS],
      ],
      width: 2.6,
    });
  }
  for (const crossing of [-30, -8, 20, 36, 62]) {
    const index = thames.findIndex(([x]) => x >= crossing);
    const z = thames[Math.max(1, index)][1];
    roads.push({
      id: `bridge-${crossing}`,
      points: [
        [crossing, z - THAMES_HALF_WIDTH - 5],
        [crossing, z + THAMES_HALF_WIDTH + 5],
      ],
      width: 3,
      bridge: true,
    });
  }
  return roads;
}
const outline: Point[] = Array.from({ length: 97 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  // A gently irregular edge keeps the city from reading as a perfect disc.
  const r = LONDON_RADIUS + 9 + Math.sin(a * 3) * 6 + Math.cos(a * 5) * 4;
  return [Math.cos(a) * r, Math.sin(a) * r] as Point;
});
export const london: CityDefinition = {
  id: "london",
  name: "London",
  region: "United Kingdom",
  universe: "sp500",
  tagline: "Nine zones around the centre",
  tierNoun: "Zone",
  layoutNote:
    "Sectors run outward from the centre as wedges. The larger the company, the lower its zone.",
  tiers: londonZones,
  districts: londonDistricts,
  landmarks: londonLandmarks,
  land: [outline],
  water: [
    thames
      .map(([x, z]): Point => [x, z - THAMES_HALF_WIDTH])
      .concat(
        thames
          .map(([x, z]): Point => [x, z + THAMES_HALF_WIDTH])
          .reverse(),
      ),
  ],
  roads: londonRoads(),
  createPlots: createLondonPlots,
  camera: {
    offset: [250, 275, 300],
    target: [6, 0, 4],
    overviewDivisor: [400, 272],
    overviewMax: 4.6,
  },
};
