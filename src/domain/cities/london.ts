import type { Company, Plot } from "../types";
import type { Point, Road } from "../geography";
import { massing } from "../massing";
import { sectorIdentities } from "../sectors";
import { formFor } from "../forms";
import type { CityDefinition, CityDistrict, CityLandmark } from "./types";
// London — S&P 500.
//
// A radial city centred on Charing Cross. Market-capitalisation zones run out
// from the centre and every sector cuts through all of them as an angular wedge,
// so a district is a slice from the middle to the edge rather than a town. The
// lower the zone number, the larger the company. Subsector is not used for
// placement here; it appears on the company card instead.
//
// Zones order the buildings but are not drawn as rings: streets front each row
// and stop at the avenues either side, and each neighbourhood's building line is
// offset a little from its neighbours', so nothing reads as a boundary between
// one zone and the next. London is inland, so the horizon beyond the built-up
// area is open country rather than sea.
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
// Seven rings, not nine: the outer two were empty for every sector in the
// seeded dataset, and empty rings only make the model larger to fly across.
// tests/cities.test.ts fails if a zone ends up with no companies in it.
const ZONE_COUNT = 7;
// Radial avenues between wedges are kept at a constant ground width, so the
// angle they consume shrinks as the rings grow.
const AVENUE_ARC = 9;
const SPACING = 10;
/** Distance from a row of lots out to the street that fronts it. Lots are
 *  axis-aligned, so a big diagonal lot reaches hypot(w, d) / 2 ≈ 5.4 radially;
 *  the gap clears that corner plus the carriageway. */
const LOT_STREET_GAP = 6.9;
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
/** Which zone a distance from the centre falls in, clamped to the built city. */
export const zoneOf = (radius: number) =>
  Math.min(ZONE_COUNT, Math.max(1, Math.ceil((radius - CENTRE_RADIUS) / ZONE_WIDTH)));
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

// Each neighbourhood sits a little further in or out than its neighbours, so
// building lines and the streets that front them never line up into a ring
// across the whole city. A company's zone is unchanged: this only shifts a wedge
// within its own band.
const sectorOrder = Object.keys(bearings);
const stagger = (sector: string) =>
  (((sectorOrder.indexOf(sector) * 5) % 7) - 3) * 1.1;
/** Radius of a sector's building line in a given zone. */
export const buildingLine = (sector: string, rank: number) =>
  zoneMid(rank) + stagger(sector);
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
  const bearing = Math.atan2(landmark.z, landmark.x);
  const avenues = Object.values(bearings).map((b) => rad(b) + WEDGE / 2);
  let best = avenues[0];
  let bestGap = Infinity;
  for (const avenue of avenues) {
    const gap = Math.abs(
      Math.atan2(Math.sin(bearing - avenue), Math.cos(bearing - avenue)),
    );
    if (gap < bestGap) {
      bestGap = gap;
      best = avenue;
    }
  }
  // A landmark that stands in for a company gets a company-sized lot, so it is
  // also pulled onto its zone's building line: the same zone, and so the same
  // market-cap band, but clear of the street that fronts the row. The radial
  // arterial breaks around it, the way a road passes behind a large building.
  const line = landmark.ticker
    ? buildingLine(landmark.sector ?? sectorOrder[0], zoneOf(radius))
    : radius;
  return {
    ...landmark,
    x: Math.cos(best) * line,
    z: Math.sin(best) * line,
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
      const radius = buildingLine(sector.id, rank);
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
      const radius = buildingLine(sector.id, ZONE_COUNT) + (index % 2) * 4;
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
// A street across one neighbourhood: two long straight runs meeting in a shallow
// bend, rather than a smooth arc, so it reads as a street rather than as part of
// a ring. It stops at the avenues on either side.
function street(
  id: string,
  radius: number,
  centreBearing: number,
  width: number,
): Road {
  const span = usableAngle(radius);
  const points: Point[] = [-0.5, 0, 0.5].map((t) => {
    const a = centreBearing + t * span;
    return [Math.cos(a) * radius, Math.sin(a) * radius] as Point;
  });
  return { id, points, width };
}
/** How far out each sector actually builds, so no street is drawn past it. */
function builtDepth(plots: Plot[]): Record<string, number> {
  const depth: Record<string, number> = {};
  for (const id of sectorOrder) depth[id] = 0;
  for (const plot of plots) {
    const bearing = Math.atan2(plot.z, plot.x);
    let best = sectorOrder[0],
      bestGap = Infinity;
    for (const id of sectorOrder) {
      const gap = Math.abs(
        Math.atan2(
          Math.sin(bearing - rad(bearings[id])),
          Math.cos(bearing - rad(bearings[id])),
        ),
      );
      if (gap < bestGap) {
        bestGap = gap;
        best = id;
      }
    }
    depth[best] = Math.max(depth[best], zoneOf(Math.hypot(plot.x, plot.z)));
  }
  return depth;
}
export function londonRoads(plots: Plot[] = []): Road[] {
  const roads: Road[] = [];
  // With no lots yet there is nothing to serve, so the city starts empty rather
  // than drawing a road network over open ground.
  const depth = builtDepth(plots);
  // Radial arterials run out of the centre along the avenues the layout already
  // reserves between sectors, the way London's A-roads leave the middle.
  for (const [id, bearing] of Object.entries(bearings)) {
    const a = rad(bearing) + WEDGE / 2;
    const at = (r: number): Point => [Math.cos(a) * r, Math.sin(a) * r];
    // Any landmark standing in for a company sits on an avenue, so the arterial
    // runs up to it and resumes past it rather than through it.
    const blocking = londonLandmarks
      .filter(
        (l) =>
          l.ticker &&
          Math.abs(
            Math.atan2(
              Math.sin(Math.atan2(l.z, l.x) - a),
              Math.cos(Math.atan2(l.z, l.x) - a),
            ),
          ) < 0.02,
      )
      .map((l) => Math.hypot(l.x, l.z))
      .sort((x, y) => x - y);
    // Two neighbourhoods share each avenue, so it runs as far as the deeper.
    const neighbours = sectorOrder.filter(
      (other) =>
        Math.abs(
          Math.atan2(Math.sin(rad(bearings[other]) - a), Math.cos(rad(bearings[other]) - a)),
        ) <
        WEDGE * 0.75,
    );
    const outermost = Math.max(0, ...neighbours.map((other) => depth[other]));
    if (!outermost) continue;
    const edge = buildingLine(id, outermost) + LOT_STREET_GAP + 5;
    let from = CENTRE_RADIUS;
    const push = (name: string, a0: number, a1: number) => {
      // A stub shorter than a block is not a street; drop it.
      if (a1 - a0 > 8)
        roads.push({ id: name, points: [at(a0), at(a1)], width: 2.6 });
    };
    blocking.forEach((r, i) => {
      push(`radial-${id}-${i}`, from, r - 7);
      from = r + 7;
    });
    push(`radial-${id}`, from, edge);
  }
  // Ordinary streets front each row of lots inside its own neighbourhood, and
  // stop at the avenue rather than closing into a ring, so the city reads as a
  // street network instead of concentric bands dividing one zone from the next.
  for (const [id, bearing] of Object.entries(bearings))
    for (let rank = 1; rank <= depth[id]; rank++)
      roads.push(
        street(
          `street-${id}-${rank}`,
          buildingLine(id, rank) + LOT_STREET_GAP,
          rad(bearing),
          rank <= 3 ? 2.1 : 1.8,
        ),
      );
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
// London is inland, so this is the built-up area rather than a coastline: it
// carries the city's ground tint and then meets open country of the same colour,
// with no shore to read as an island edge.
const outline: Point[] = Array.from({ length: 97 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  const r = LONDON_RADIUS + 14 + Math.sin(a * 3) * 5 + Math.cos(a * 5) * 3;
  return [Math.cos(a) * r, Math.sin(a) * r] as Point;
});
export const london: CityDefinition = {
  id: "london",
  name: "London",
  region: "United Kingdom",
  universe: "sp500",
  tagline: "Zones out from the centre",
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
  roads: londonRoads,
  createPlots: createLondonPlots,
  surround: "land",
  camera: {
    offset: [250, 275, 300],
    target: [6, 0, 4],
    overviewDivisor: [284, 194],
    overviewMax: 6.2,
  },
};
