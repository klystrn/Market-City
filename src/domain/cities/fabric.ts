import { pointInPolygon, type Point, type Road } from "../geography";
import type { Plot } from "../types";
import type { CityDistrict, CityLandmark } from "./types";
// The ordinary buildings a city is mostly made of.
//
// Every building that carries market data is a company lot. Everything between
// those lots is the city itself — terraces, corner shops, the houses someone
// would actually live in — and without it a layout reads as a diagram of a
// market rather than a place. This module generates that fabric.
//
// It is placed by *fronting a street* rather than by scattering on a grid. A
// real neighbourhood is a line of buildings facing a road at a consistent
// setback, and following the road network means the fabric inherits whatever
// shape each city already has — a Manhattan grid, a London radial, a Tokyo
// town — instead of imposing a fourth one. It is pure and deterministic so the
// same city always builds the same, and so a test can count it.
export type FabricKind = "terrace" | "house" | "shop";
export interface FabricBlock {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  /**
   * Faces the street it fronts: at this rotation the box's local X axis points
   * from the building toward the road, so `width` runs along the street and
   * `depth` back from it. A renderer placing something on the front wall offsets
   * by (cos rotation, -sin rotation) — see `blockParts`.
   */
  rotation: number;
  kind: FabricKind;
  /** The district it stands in, so a neighbourhood keeps its sector's colour. */
  district?: string;
  /** Stable per-block randomness: colour, window rows, roof pitch. */
  seed: number;
}
export interface StreetFurniture {
  /** Trees in the verge, lamp posts at the kerb, cars parked along it. */
  trees: Point[];
  lamps: Point[];
  cars: { at: Point; rotation: number; seed: number }[];
  /** Zebra stripes where one street meets another. */
  crossings: { at: Point; rotation: number; width: number }[];
}
/**
 * What sits inside a block instead of a building. A real block is not solid:
 * it holds a garden square, a yard, somewhere to leave a car. These are what
 * stop the back rows reading as an undifferentiated mass of roofs.
 */
export type InteriorKind = "green" | "square" | "carpark";
export interface InteriorSpace {
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation: number;
  kind: InteriorKind;
  seed: number;
}
export interface FabricResult {
  blocks: FabricBlock[];
  furniture: StreetFurniture;
  interiors: InteriorSpace[];
}
export interface FabricInput {
  land: Point[][];
  water: Point[][];
  roads: Road[];
  plots: Plot[];
  landmarks: CityLandmark[];
  districts: CityDistrict[];
  /** Upper bound on blocks, so a city cannot silently outgrow its budget. */
  maxBlocks: number;
}
// Deterministic value in [0,1) from an integer seed. A hash rather than a
// counter, so inserting one building does not reshuffle every later one.
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function onLand(p: Point, land: Point[][], water: Point[][]): boolean {
  return (
    land.some((polygon) => pointInPolygon(p, polygon)) &&
    !water.some((polygon) => pointInPolygon(p, polygon))
  );
}
/** Distance from a point to a line segment, which is how road clearance is judged. */
function distanceToSegment([x, z]: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0],
    dz = b[1] - a[1];
  const lengthSquared = dx * dx + dz * dz;
  if (lengthSquared === 0) return Math.hypot(x - a[0], z - a[1]);
  const t = Math.max(
    0,
    Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / lengthSquared),
  );
  return Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t));
}
export function generateFabric(input: FabricInput): FabricResult {
  const { land, water, roads, plots, landmarks, districts, maxBlocks } = input;
  const blocks: FabricBlock[] = [];
  const interiors: InteriorSpace[] = [];
  const furniture: StreetFurniture = {
    trees: [],
    lamps: [],
    cars: [],
    crossings: [],
  };
  // Flatten the road network once; every clearance test walks it.
  const segments: { a: Point; b: Point; width: number; bridge: boolean }[] = [];
  for (const road of roads)
    for (let i = 1; i < road.points.length; i++)
      segments.push({
        a: road.points[i - 1],
        b: road.points[i],
        width: road.width,
        bridge: road.bridge === true,
      });
  const clearOfRoads = (p: Point, margin: number) =>
    !segments.some((s) => distanceToSegment(p, s.a, s.b) < s.width / 2 + margin);
  const clearOfPlots = (p: Point, margin: number) =>
    !plots.some(
      (plot) =>
        Math.abs(p[0] - plot.x) < plot.width / 2 + margin &&
        Math.abs(p[1] - plot.z) < plot.depth / 2 + margin,
    );
  const clearOfLandmarks = (p: Point, margin: number) =>
    !landmarks.some((l) => {
      const halfWidth = (l.width ?? l.radius * 2) / 2 + margin;
      const halfDepth = (l.depth ?? l.radius * 2) / 2 + margin;
      return Math.abs(p[0] - l.x) < halfWidth && Math.abs(p[1] - l.z) < halfDepth;
    });
  const districtAt = (p: Point) =>
    districts.find(
      (d) =>
        Math.abs(p[0] - d.x) <= d.width / 2 + 6 &&
        Math.abs(p[1] - d.z) <= d.depth / 2 + 6,
    );
  // Blocks already placed, kept as a flat list: the fabric is small enough that
  // a linear overlap check is cheaper than maintaining a spatial index.
  const clearOfBlocks = (p: Point, halfSpan: number) =>
    !blocks.some(
      (b) =>
        Math.abs(p[0] - b.x) < Math.max(b.width, b.depth) / 2 + halfSpan &&
        Math.abs(p[1] - b.z) < Math.max(b.width, b.depth) / 2 + halfSpan,
    );
  let placed = 0;
  for (const [index, s] of segments.entries()) {
    // Nothing fronts a bridge — it crosses water, and a terrace in the river
    // would be the most obvious possible tell that this is generated.
    if (s.bridge) continue;
    const dx = s.b[0] - s.a[0],
      dz = s.b[1] - s.a[1];
    const length = Math.hypot(dx, dz);
    if (length < 6) continue;
    // Unit vectors along the street and across it.
    const ux = dx / length,
      uz = dz / length;
    const nx = -uz,
      nz = ux;
    // Instanced boxes are rotated with the same convention `segment` uses: at
    // rotation r the box's local X axis points along (cos r, -sin r) in world
    // space, and its local Z along (sin r, cos r). `facing` is therefore the
    // rotation whose local Z runs along the street — correct for anything laid
    // *along* a road (crossings, parked cars, kerb markings).
    const facing = Math.atan2(ux, uz);
    // Front gardens are shallow and consistent, the way a terraced street is.
    const frontage = s.width / 2 + 3.1;
    const spacing = 4.6;
    // A city block is deep, not a single line of houses: rows step back from
    // the street into the interior until they run out of land or hit whatever
    // already owns the ground. Each row keeps the street's orientation, so a
    // deep block still reads as planned rather than scattered.
    const ROW_DEPTH = 5.2;
    for (const row of [0, 1, 2] as const)
    for (let along = spacing * 0.75; along < length - spacing * 0.5; along += spacing)
      for (const side of [-1, 1] as const) {
        if (placed >= maxBlocks) break;
        const setback = frontage + row * ROW_DEPTH;
        const seed = Math.round(
          index * 7919 + along * 131 + (side > 0 ? 3571 : 0) + row * 613,
        );
        const cx = s.a[0] + ux * along + nx * setback * side,
          cz = s.a[1] + uz * along + nz * setback * side;
        // A street is not solid: gaps are alleys, yards and side roads. Back
        // rows thin out, the way the inside of a block holds more yard than
        // building — and a gap behind the frontage becomes an actual place
        // rather than bare ground.
        if (noise(seed) < 0.28 + row * 0.12) {
          if (row > 0 && noise(seed + 11) > 0.45) {
            const at: Point = [cx, cz];
            const span = 4.4;
            if (
              onLand(at, land, water) &&
              clearOfRoads(at, 1.6) &&
              clearOfPlots(at, span) &&
              clearOfLandmarks(at, span) &&
              clearOfBlocks(at, span * 0.5)
            ) {
              const pick = noise(seed + 12);
              interiors.push({
                x: cx,
                z: cz,
                width: 4.2 + noise(seed + 13) * 1.6,
                depth: 4.2 + noise(seed + 14) * 1.6,
                rotation: facing,
                // A car park only makes sense where a car could reach it, so
                // it stays on the row immediately behind the frontage.
                kind:
                  pick > 0.74 && row === 1
                    ? "carpark"
                    : pick > 0.46
                      ? "square"
                      : "green",
                seed,
              });
            }
          }
          continue;
        }
        const at: Point = [cx, cz];
        const width = 2.8 + noise(seed + 1) * 1.4;
        const depth = 3.0 + noise(seed + 2) * 1.6;
        const halfSpan = Math.max(width, depth) / 2;
        // Every corner on land, clear of the things that already own the ground.
        const corners: Point[] = [
          [cx - halfSpan, cz - halfSpan],
          [cx + halfSpan, cz - halfSpan],
          [cx - halfSpan, cz + halfSpan],
          [cx + halfSpan, cz + halfSpan],
        ];
        if (!corners.every((c) => onLand(c, land, water))) continue;
        if (!clearOfRoads(at, 2.2)) continue;
        if (!clearOfPlots(at, halfSpan + 1.4)) continue;
        if (!clearOfLandmarks(at, halfSpan + 1)) continue;
        if (!clearOfBlocks(at, halfSpan + 0.5)) continue;
        const district = districtAt(at);
        const roll = noise(seed + 3);
        // A corner shop every so often, houses on the quieter stretches, and
        // terraces as the ordinary case. Shops only front the street: a row
        // deep inside a block has no passing trade to open onto.
        const kind: FabricKind =
          roll > 0.86 && row === 0 ? "shop" : roll < 0.3 ? "house" : "terrace";
        const height =
          kind === "house"
            ? 2.4 + noise(seed + 4) * 1.4
            : kind === "shop"
              ? 3.2 + noise(seed + 4) * 1.2
              : 3.4 + noise(seed + 4) * 3.6;
        blocks.push({
          x: cx,
          z: cz,
          width,
          depth,
          height,
          // A building is not laid along the street, it faces it. Its local X
          // has to point at the road so that the front is a face and not an
          // edge; with `facing` the box was turned ninety degrees out, which
          // put its windows and shopfront on the side walls.
          rotation: Math.atan2(nz * side, -nx * side),
          kind,
          district: district?.id,
          seed,
        });
        placed++;
      }
    // Street furniture sits in the verge between kerb and front gardens, so it
    // reads as part of the street rather than as objects dropped on a lawn.
    const vergeOffset = s.width / 2 + 1.25;
    for (let along = 5; along < length - 3; along += 9.5)
      for (const side of [-1, 1] as const) {
        const seed = Math.round(index * 104729 + along * 31 + (side > 0 ? 17 : 0));
        const at: Point = [
          s.a[0] + ux * along + nx * vergeOffset * side,
          s.a[1] + uz * along + nz * vergeOffset * side,
        ];
        if (!onLand(at, land, water)) continue;
        if (!clearOfPlots(at, 1.2) || !clearOfLandmarks(at, 1)) continue;
        // Alternate, so a street gets both light and shade rather than a row of
        // one or the other.
        if (noise(seed) > 0.45) furniture.trees.push(at);
        else furniture.lamps.push(at);
      }
    // Parked cars hug the kerb, which is the cheapest cue that a strip of grey
    // is a street someone uses and not a path.
    const kerbOffset = s.width / 2 - 0.5;
    if (s.width >= 2.4)
      for (let along = 4; along < length - 4; along += 6.5)
        for (const side of [-1, 1] as const) {
          const seed = Math.round(
            index * 15485863 + along * 97 + (side > 0 ? 7 : 0),
          );
          if (noise(seed) < 0.55) continue;
          const at: Point = [
            s.a[0] + ux * along + nx * kerbOffset * side,
            s.a[1] + uz * along + nz * kerbOffset * side,
          ];
          if (!onLand(at, land, water)) continue;
          furniture.cars.push({ at, rotation: facing, seed });
        }
    // A crossing at each end, where this street meets the next one.
    for (const end of [0.12, 0.88]) {
      const at: Point = [s.a[0] + dx * end, s.a[1] + dz * end];
      if (!onLand(at, land, water)) continue;
      furniture.crossings.push({ at, rotation: facing, width: s.width });
    }
  }
  return { blocks, furniture, interiors };
}
