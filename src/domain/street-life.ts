import { pointInPolygon, type Point, type Road } from "./geography";

// The life of the city: people on the pavements, a mix of traffic, boats on
// the water and the shade of passing clouds. It is decoration, and kept to
// two rules that stop decoration turning into noise.
//
// It encodes nothing new. Vehicles still gather where the busiest companies
// stand (that was already the traffic layer's meaning); the other life is
// spread evenly, so a crowded pavement never reads as a signal. The one
// exception is clouds, which follow the weather the header already states —
// clear, hazy or overcast — so the sky never contradicts the words beside it.
//
// It is deterministic. The same city always has the same ferries on the same
// routes; nothing here is random per load, so a screenshot is reproducible
// and a test can count it.

function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A straight stretch of pavement a pedestrian walks along. */
export interface Walk {
  a: Point;
  b: Point;
  length: number;
}

/**
 * Pavement either side of every street. Each run sits just beyond the
 * carriageway's edge, so walkers pass beside the traffic rather than through
 * it, and bridges are skipped because their decks carry no pavement.
 */
export function pavements(roads: Road[]): Walk[] {
  const walks: Walk[] = [];
  for (const road of roads) {
    if (road.bridge) continue;
    const offset = road.width / 2 + 0.55;
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1],
        b = road.points[i];
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (length < 3) continue;
      // Unit normal to the street, for the two sides.
      const nx = -(b[1] - a[1]) / length,
        nz = (b[0] - a[0]) / length;
      for (const side of [-1, 1])
        walks.push({
          a: [a[0] + nx * offset * side, a[1] + nz * offset * side],
          b: [b[0] + nx * offset * side, b[1] + nz * offset * side],
          length,
        });
    }
  }
  return walks;
}

export interface Walker {
  walk: number;
  /** Where along the walk it starts, 0–1. */
  start: number;
  /** World units per second, signed for direction. */
  speed: number;
  seed: number;
}

/** Pedestrians spread evenly over the pavement, roughly one per `spacing`. */
export function walkers(walks: Walk[], max: number, spacing = 9): Walker[] {
  const total = walks.reduce((s, w) => s + w.length, 0);
  if (!total || max <= 0) return [];
  const count = Math.min(max, Math.floor(total / spacing));
  const out: Walker[] = [];
  // Walk the pavement at an even stride so people are spread over the whole
  // city instead of clustered on whichever streets come first in the list.
  const stride = total / count;
  let walk = 0,
    covered = 0;
  for (let i = 0; i < count; i++) {
    const at = (i + noise(i) * 0.6) * stride;
    while (walk < walks.length - 1 && covered + walks[walk].length < at)
      covered += walks[walk++].length;
    const w = walks[walk];
    out.push({
      walk,
      start: Math.min(1, Math.max(0, (at - covered) / w.length)),
      speed: (0.55 + noise(i + 101) * 0.45) * (noise(i + 7) > 0.5 ? 1 : -1),
      seed: i,
    });
  }
  return out;
}

export type VehicleKind = "car" | "van" | "bus" | "truck";
export interface VehicleShape {
  kind: VehicleKind;
  /** Body length, width and height, and the cabin's share of the length. */
  length: number;
  width: number;
  height: number;
  cabin: number;
}
const SHAPES: Record<VehicleKind, VehicleShape> = {
  car: { kind: "car", length: 0.85, width: 0.4, height: 0.28, cabin: 0.52 },
  van: { kind: "van", length: 1.0, width: 0.44, height: 0.42, cabin: 0.35 },
  bus: { kind: "bus", length: 2.1, width: 0.5, height: 0.52, cabin: 0 },
  truck: { kind: "truck", length: 1.55, width: 0.48, height: 0.5, cabin: 0.28 },
};
/**
 * What a given vehicle is. Mostly cars, as on any real street, with enough
 * vans, buses and lorries that the traffic reads as a mix.
 */
export function vehicleShape(seed: number): VehicleShape {
  const r = noise(seed * 3 + 11);
  return r < 0.68
    ? SHAPES.car
    : r < 0.82
      ? SHAPES.van
      : r < 0.92
        ? SHAPES.truck
        : SHAPES.bus;
}

export interface BoatRoute {
  a: Point;
  b: Point;
  length: number;
  kind: "ferry" | "barge" | "launch";
  seed: number;
}
/**
 * Straight crossings that stay on open water the whole way. Each candidate is
 * sampled along its length, so a route never clips a shore or an island,
 * however the water curves.
 *
 * Water means different things per city. A coastal city ("sea") is surrounded
 * by water, so anything off the land counts, kept within sight of the shore.
 * An inland one ("land") has only its rivers, drawn as polygons over the land.
 */
export function boatRoutes(
  land: Point[][],
  water: Point[][],
  surround: "sea" | "land",
  max: number,
): BoatRoute[] {
  const routes: BoatRoute[] = [];
  const area = surround === "sea" ? land : water;
  if (!area.length || max <= 0) return routes;
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  for (const poly of area)
    for (const [x, z] of poly) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
  // At sea, stay within a short reach of the shore, where boats are seen.
  const margin = surround === "sea" ? 25 : 0;
  minX -= margin;
  maxX += margin;
  minZ -= margin;
  maxZ += margin;
  const wet = (p: Point) =>
    p[0] >= minX &&
    p[0] <= maxX &&
    p[1] >= minZ &&
    p[1] <= maxZ &&
    (surround === "sea"
      ? // Off the land, and inside the drawn sea where a city draws one
        // (Tokyo's bay does; New York's sea is simply everywhere else).
        !land.some((poly) => pointInPolygon(p, poly)) &&
        (!water.length || water.some((poly) => pointInPolygon(p, poly)))
      : water.some((poly) => pointInPolygon(p, poly)));
  for (let attempt = 0; attempt < max * 80 && routes.length < max; attempt++) {
    const a: Point = [
      minX + noise(attempt * 5 + 1) * (maxX - minX),
      minZ + noise(attempt * 5 + 2) * (maxZ - minZ),
    ];
    if (!wet(a)) continue;
    const angle = noise(attempt * 5 + 3) * Math.PI * 2;
    const length = 16 + noise(attempt * 5 + 4) * 44;
    const b: Point = [
      a[0] + Math.cos(angle) * length,
      a[1] + Math.sin(angle) * length,
    ];
    let clear = true;
    // Sampled every half unit: finer than any bend in a river, and fine
    // enough to catch the seams where a river polygon's banks are joined.
    const samples = Math.ceil(length / 0.5);
    for (let s = 1; s <= samples && clear; s++) {
      const t = s / samples;
      clear = wet([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
    // At sea, keep to rivers and harbours: a route whose middle has no shore
    // within reach is out in open water, where nobody looks and few boats go.
    const mid: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const coastal =
      surround !== "sea" ||
      Array.from({ length: 8 }, (_, k) => (k / 8) * Math.PI * 2).some(
        (dir) => {
          const probe: Point = [
            mid[0] + Math.cos(dir) * 16,
            mid[1] + Math.sin(dir) * 16,
          ];
          return land.some((poly) => pointInPolygon(probe, poly));
        },
      );
    // Two boats on top of each other read as one glitch, not two boats.
    if (
      !clear ||
      !coastal ||
      routes.some((r) => Math.hypot(r.a[0] - a[0], r.a[1] - a[1]) < 14)
    )
      continue;
    const k = noise(attempt * 5 + 5);
    routes.push({
      a,
      b,
      length,
      kind: k < 0.4 ? "ferry" : k < 0.65 ? "barge" : "launch",
      seed: routes.length,
    });
  }
  return routes;
}

export type Sky = "Clear skies" | "Light haze" | "Overcast";
/**
 * How many clouds pass over, from the weather the header already reports.
 * A clear day keeps a few fair-weather clouds — a sky with none at all looks
 * like a render, not a day — and an overcast one many more.
 */
export function cloudCount(sky: string): number {
  return sky === "Overcast" ? 18 : sky === "Light haze" ? 10 : 5;
}
