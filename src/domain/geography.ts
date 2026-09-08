import type { Sector } from "./types";
import { subsectors } from "./subsectors";
export type Point = [number, number];
// Stylized Tokyo topology, not a georeferenced replica: inland west/north,
// eastern river wards and a southeastern bay of reclaimed sector islands.
export function riverX(z: number) {
  return 61 + 10 * Math.sin((z + 30) / 42) + 3 * Math.sin(z / 17);
}
export function riverWidth(z: number) {
  return 3.5 + Math.max(0, z + 65) * 0.025;
}
export const riverSpine: Point[] = Array.from({ length: 109 }, (_, i) => [
  riverX(-404 + i * 4),
  -404 + i * 4,
]);
export const riverLeft = riverSpine.map(([x, z]): Point => [
  x - riverWidth(z),
  z,
]);
export const riverRight = riverSpine.map(([x, z]): Point => [
  x + riverWidth(z),
  z,
]);
export const coast: Point[] = [
  [-220, 130],
  [-160, 113],
  [-115, 97],
  [-81, 92],
  [-59, 80],
  [-40, 63],
  [-9, 55],
  [17, 38],
  [35, 17],
  [52, 6],
  [72, 19],
  [105, 24],
  [146, 10],
  [191, -13],
  [250, -26],
];
export const mainland: Point[] = [
  ...coast,
  [250, -400],
  [-400, -400],
  [-400, 130],
];
export const islands: Point[][] = [
  [
    [-53, 76],
    [-12, 67],
    [10, 81],
    [5, 112],
    [-33, 120],
    [-53, 102],
  ],
  [
    [61, 38],
    [108, 35],
    [119, 74],
    [103, 96],
    [61, 88],
  ],
  [
    [78, 105],
    [133, 100],
    [151, 122],
    [143, 161],
    [87, 166],
    [75, 138],
  ],
];
export const waterOutline: Point[] = [...coast, [280, 260], [-230, 260]];
export const channels: Point[][] = [
  [...riverLeft, ...riverRight.toReversed()],
  [
    [100, -404],
    [103, -172],
    [97, -135],
    [87, -108],
    [86, -87],
    [81, -70],
    [77, -44],
    [82, -16],
    [88, 30],
    [96, 30],
    [89, -15],
    [84, -43],
    [88, -69],
    [92, -86],
    [94, -106],
    [104, -134],
    [110, -172],
    [107, -404],
  ],
];
export const sectors: Sector[] = [
  {
    id: "technology",
    name: "Information Technology",
    short: "Technology",
    x: -50,
    z: -40,
    width: 54,
    depth: 54,
    color: "#418ce0",
  },
  {
    id: "financials",
    name: "Financials",
    short: "Financials",
    x: -19,
    z: 20,
    width: 49,
    depth: 32,
    color: "#d7a441",
  },
  {
    id: "healthcare",
    name: "Health Care",
    short: "Healthcare",
    x: 110,
    z: -57,
    width: 43,
    depth: 38,
    color: "#d76b91",
  },
  {
    id: "consumer",
    name: "Consumer Discretionary",
    short: "Consumer",
    x: 14,
    z: -32,
    width: 48,
    depth: 38,
    color: "#b17ad2",
  },
  {
    id: "communications",
    name: "Communication Services",
    short: "Communications",
    x: -54,
    z: -104,
    width: 45,
    depth: 28,
    color: "#e48046",
  },
  {
    id: "industrials",
    name: "Industrials",
    short: "Industrials",
    x: 86,
    z: 65,
    width: 36,
    depth: 36,
    color: "#4697b0",
  },
  {
    id: "staples",
    name: "Consumer Staples",
    short: "Staples",
    x: -76,
    z: 21,
    width: 30,
    depth: 28,
    color: "#d5a45c",
  },
  {
    id: "energy",
    name: "Energy",
    short: "Energy",
    x: 111,
    z: 130,
    width: 30,
    depth: 32,
    color: "#eead39",
  },
  {
    id: "utilities",
    name: "Utilities",
    short: "Utilities",
    x: -78,
    z: 65,
    width: 29,
    depth: 29,
    color: "#64a596",
  },
  {
    id: "materials",
    name: "Materials",
    short: "Materials",
    x: -126,
    z: 4,
    width: 26,
    depth: 32,
    color: "#b48060",
  },
  {
    id: "realestate",
    name: "Real Estate",
    short: "Real Estate",
    x: -24,
    z: 91,
    width: 41,
    depth: 29,
    color: "#748dde",
  },
];
export const landmarks = [
  { sector: "technology", name: "Innovation Gate", x: -47, z: -76, radius: 6 },
  { sector: "financials", name: "Exchange Hall", x: -28, z: -9, radius: 4 },
  { sector: "healthcare", name: "Medical Campus", x: 112, z: -88, radius: 6 },
  { sector: "consumer", name: "Scramble Square", x: 16, z: -5, radius: 5 },
  {
    sector: "communications",
    name: "Broadcast Tower",
    x: -54,
    z: -130,
    radius: 6,
  },
  { sector: "industrials", name: "Container Port", x: 110, z: 65, radius: 6 },
  { sector: "staples", name: "Market Hall", x: -77, z: 48, radius: 5 },
  { sector: "energy", name: "Nuclear Power Island", x: 112, z: 156, radius: 8 },
  { sector: "utilities", name: "Wind Garden", x: -103, z: 72, radius: 7 },
  { sector: "materials", name: "Terraced Quarry", x: -151, z: 5, radius: 9 },
  { sector: "realestate", name: "Marina Gardens", x: -22, z: 112, radius: 5 },
];
export const railLoop: Point[] = [
  [-87, -123],
  [-9, -123],
  [4, -109],
  [4, -58],
  [-17, -54],
  [-17, -7],
  [-51, -1],
  [-51, 43],
  [-98, 43],
  [-98, -20],
  [-85, -75],
  [-87, -123],
];
export interface Street {
  id: string;
  sector: string;
  name: string;
  start: Point;
  end: Point;
  z: number;
  spacing: number;
}
export function cityStreets(): Street[] {
  return sectors.flatMap((sector) => {
    const groups = subsectors.filter((s) => s.sector === sector.id),
      spacing = (sector.depth - 3) / groups.length;
    return groups.map((s, i) => {
      const z = sector.z - sector.depth / 2 + 1.5 + (i + 0.5) * spacing;
      return {
        id: s.id,
        sector: sector.id,
        name: s.street,
        start: [sector.x - sector.width / 2 + 1, z],
        end: [sector.x + sector.width / 2 - 1, z],
        z,
        spacing,
      };
    });
  });
}

export interface Road {
  id: string;
  points: Point[];
  width: number;
  bridge?: boolean;
}
export function cityRoads(): Road[] {
  const roads: Road[] = cityStreets().map((s) => ({
    id: s.id,
    points: [s.start, s.end],
    width: 1.8,
  }));
  for (const s of sectors) {
    const left = s.x - s.width / 2 + 1,
      right = s.x + s.width / 2 - 1,
      top = s.z - s.depth / 2 - 1,
      bottom = s.z + s.depth / 2 + 1;
    roads.push({
      id: s.id + "-ring",
      points: [
        [left, top],
        [right, top],
        [right, bottom],
        [left, bottom],
        [left, top],
      ],
      width: 2.2,
    });
  }
  const links: Record<string, Point[]> = {
    technology: [
      [-76, -12],
      [-98, -12],
    ],
    financials: [
      [-42.5, 37],
      [-51, 37],
    ],
    healthcare: [
      [98, -94],
      [98, -77],
    ],
    consumer: [
      [-9, -12],
      [-17, -12],
    ],
    communications: [
      [-32.5, -119],
      [-9, -119],
    ],
    staples: [
      [-90, 36],
      [-98, 36],
    ],
    utilities: [
      [-64.5, 49.5],
      [-51, 49.5],
      [-51, 43],
    ],
    materials: [
      [-114, -13],
      [-98, -13],
    ],
    realestate: [
      [-43.5, 75.5],
      [-43.5, 53],
      [-43.5, 37],
    ],
    industrials: [
      [69, 46],
      [57, 22],
      [46, 4],
      [37, -12],
    ],
    energy: [
      [97, 113],
      [94, 97],
      [101, 84],
    ],
  };
  for (const [id, points] of Object.entries(links))
    roads.push({
      id: id + "-link",
      points,
      width: 2.6,
      bridge: ["realestate", "industrials", "energy"].includes(id),
    });
  roads.push({ id: "metropolitan-loop", points: railLoop, width: 2.5 });
  roads.push({
    id: "central-river-link",
    points: [
      [37, -52],
      [riverX(-52) - riverWidth(-52) - 3, -52],
    ],
    width: 2.5,
  });
  for (const sign of [-1, 1])
    roads.push({
      id: sign < 0 ? "west-embankment" : "east-embankment",
      points: riverSpine
        .filter(([, z]) => z >= -170 && z <= 10)
        .map(([x, z]): Point => [x + sign * (riverWidth(z) + 3), z]),
      width: 2.5,
    });
  for (const z of [-94, -37])
    roads.push({
      id: "river-crossing-" + z,
      points: [
        [riverX(z) - riverWidth(z) - 4, z],
        [98, z],
      ],
      width: 3.2,
      bridge: true,
    });
  return roads;
}
export function pointInPolygon([x, z]: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i],
      [xj, zj] = polygon[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
      inside = !inside;
  }
  return inside;
}

export function isLand(p: Point) {
  return (
    (pointInPolygon(p, mainland) ||
      islands.some((i) => pointInPolygon(p, i))) &&
    !channels.some((c) => pointInPolygon(p, c))
  );
}
