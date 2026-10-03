import { useMemo } from "react";
import type { CityDefinition } from "@/domain/cities/types";
import type { Plot } from "@/domain/types";
import { fabricFor, type FabricBlock } from "@/domain/cities/fabric";
import { seasonPalette, type Season } from "@/domain/seasons";
import { Boxes, cylinder, treeGeometry, type Part } from "./SceneryParts";
// The ordinary city around the company buildings: terraces fronting the
// streets, corner shops, street trees, lamp posts and parked cars.
//
// The palette is bright and toy-like on purpose, but it deliberately avoids
// green and red. Those two are the daily-change encoding: a terrace painted
// red would read as a company having a bad day. Everything here lives in the
// blues, yellows, teals, violets and terracottas that are left — which is
// enough range to be lively while keeping the one channel that means something
// unambiguous. Height does the rest of the work: nothing in the fabric is tall
// enough to compete with a mega-cap tower.
const WALLS = [
  "#f0d9a8",
  "#e8b98c",
  "#9fc6d8",
  "#d9a6b8",
  "#c3b6dd",
  "#f2cf7c",
  "#8fc2bd",
  "#e9a98c",
  "#aebfe0",
];
const ROOFS = [
  "#c27a52",
  "#8c6f9e",
  "#4f7f96",
  "#b35f4e",
  "#5d7f8c",
  "#a8713f",
];
const CARS = ["#edeef0", "#7f93a8", "#d9b04a", "#4f6f8f", "#8e6fb0", "#55707a"];
const AWNINGS = ["#e07a5f", "#5aa88c", "#4f85b5", "#d9a441", "#a46fae"];
const GROUND = 1.04;
/** Stable pseudo-randomness for choices made at render time rather than in the
 * generator — which windows are lit, which bays hold a car. Same hash as the
 * generator uses, so the two agree on what "random" means. */
function noise2(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
function blockParts(
  b: FabricBlock,
  walls: Part[],
  roofs: Part[],
  windows: Part[],
  trims: Part[],
) {
  const base = GROUND + 0.04;
  // The block's own axes in world space. Local X points at the street, local Z
  // runs along it, which is what `rotation` is defined to mean. Everything
  // placed on a wall is positioned through these rather than by guessing at
  // sines and cosines at each call site.
  const ax = Math.cos(b.rotation),
    az = -Math.sin(b.rotation);
  const front = (distance: number): [number, number] => [
    b.x + ax * distance,
    b.z + az * distance,
  ];
  // Scale is [localX, Y, localZ], so depth — the dimension running back from
  // the street — is the X component.
  walls.push({
    position: [b.x, base + b.height / 2, b.z],
    scale: [b.depth, b.height, b.width],
    rotation: b.rotation,
    color: WALLS[b.seed % WALLS.length],
  });
  if (b.kind === "house") {
    // A pitched roof, approximated as two stacked slabs — enough of a
    // silhouette at this scale to read as a house rather than a box.
    roofs.push({
      position: [b.x, base + b.height + 0.22, b.z],
      scale: [b.depth + 0.3, 0.44, b.width + 0.3],
      rotation: b.rotation,
      color: ROOFS[b.seed % ROOFS.length],
    });
    roofs.push({
      position: [b.x, base + b.height + 0.6, b.z],
      scale: [b.depth * 0.55, 0.42, b.width * 0.55],
      rotation: b.rotation,
      color: ROOFS[b.seed % ROOFS.length],
    });
    // A chimney, set back from the front and off the ridge centre.
    const [cx, cz] = front(-b.depth * 0.22);
    trims.push({
      position: [cx, base + b.height + 1.05, cz],
      scale: [0.34, 0.8, 0.34],
      rotation: b.rotation,
      color: "#8a7064",
    });
  } else {
    // Flat roof with a parapet, and a rooftop unit on the taller ones.
    roofs.push({
      position: [b.x, base + b.height + 0.1, b.z],
      scale: [b.depth + 0.22, 0.2, b.width + 0.22],
      rotation: b.rotation,
      color: ROOFS[(b.seed + 2) % ROOFS.length],
    });
    if (b.height > 4.5)
      trims.push({
        position: [b.x, base + b.height + 0.45, b.z],
        scale: [b.depth * 0.4, 0.5, b.width * 0.4],
        rotation: b.rotation,
        color: "#9aa0a0",
      });
  }
  // Ground-floor retail: a glazed band across the street frontage, with an
  // awning over it. This is what separates a shopping street from a
  // residential one at a glance.
  if (b.kind === "shop") {
    const [gx, gz] = front(b.depth / 2 + 0.02);
    trims.push({
      position: [gx, base + 0.85, gz],
      scale: [0.08, 1.3, b.width * 0.86],
      rotation: b.rotation,
      color: "#7fa7b5",
    });
    const [awx, awz] = front(b.depth / 2 + 0.42);
    trims.push({
      position: [awx, base + 1.7, awz],
      scale: [0.85, 0.1, b.width * 0.9],
      rotation: b.rotation,
      color: AWNINGS[b.seed % AWNINGS.length],
    });
  }
  // Window bands rather than individual panes: one row per floor, on the front
  // and back walls. Individual windows would cost thousands of instances to
  // say the same thing at the zoom the city is usually read from.
  const floors = Math.max(1, Math.floor(b.height / 1.5));
  for (let f = 0; f < floors; f++) {
    const y = base + 0.9 + f * 1.5;
    if (y > base + b.height - 0.4) break;
    if (b.kind === "shop" && f === 0) continue;
    for (const sign of [-1, 1]) {
      const [wx, wz] = front(sign * (b.depth / 2 + 0.015));
      windows.push({
        position: [wx, y, wz],
        scale: [0.04, 0.42, b.width * 0.72],
        rotation: b.rotation,
      });
    }
  }
}
export default function UrbanFabric({
  city,
  plots,
  season,
  dark,
  night,
  detail,
}: {
  city: CityDefinition;
  plots: Plot[];
  season: Season;
  dark: boolean;
  /**
   * The exchange session is closed or after-hours. This is the app's existing
   * notion of time of day, and the honest one to light the city by: `dark` here
   * means the market is *down*, so lighting the windows from it would make a
   * falling index look like nightfall.
   */
  night: boolean;
  /** 1 is the full city; lower values thin it when the device is struggling. */
  detail: number;
}) {
  const fabric = useMemo(
    () =>
      fabricFor({
        baked: city.bakedFabric,
        land: city.land,
        water: city.water,
        roads: city.roads(plots),
        plots,
        landmarks: city.landmarks,
        districts: city.districts,
        maxBlocks: city.budget.fabric,
      }),
    [city, plots],
  );
  const parts = useMemo(() => {
    const walls: Part[] = [],
      roofs: Part[] = [],
      windows: Part[] = [],
      trims: Part[] = [],
      trunks: Part[] = [],
      crowns: Part[] = [],
      lamps: Part[] = [],
      lampHeads: Part[] = [],
      cars: Part[] = [],
      crossings: Part[] = [],
      ground: Part[] = [],
      furnishings: Part[] = [],
      litWindows: Part[] = [],
      litLamps: Part[] = [];
    // Thinning keeps every nth item rather than truncating the list, so a
    // struggling device still gets a city spread over its whole area instead of
    // a dense corner and an empty remainder.
    const keep = (i: number) => detail >= 1 || i % Math.round(1 / detail) === 0;
    fabric.blocks.forEach((b, i) => {
      if (keep(i)) blockParts(b, walls, roofs, windows, trims);
    });
    const leaf = seasonPalette[season].leaf;
    fabric.furniture.trees.forEach(([x, z], i) => {
      if (!keep(i)) return;
      // Kept deliberately smaller than a house. A street tree the size of the
      // building behind it stops reading as a tree and starts reading as a
      // lollipop dropped on the map.
      trunks.push({ position: [x, GROUND + 0.75, z], scale: [0.16, 1.5, 0.16] });
      if (season !== "winter")
        crowns.push({
          position: [x, GROUND + 1.75, z],
          scale: [0.8, 0.92, 0.8],
          color: leaf,
        });
    });
    fabric.furniture.lamps.forEach(([x, z], i) => {
      if (!keep(i)) return;
      lamps.push({ position: [x, GROUND + 1.4, z], scale: [0.14, 2.7, 0.14] });
      lampHeads.push({
        position: [x, GROUND + 2.8, z],
        scale: [0.5, 0.16, 0.22],
        color: dark ? "#ffe9b0" : "#dfd8c4",
      });
    });
    fabric.furniture.cars.forEach(({ at: [x, z], rotation, seed }, i) => {
      if (!keep(i)) return;
      cars.push({
        position: [x, GROUND + 0.33, z],
        scale: [0.95, 0.5, 2.1],
        rotation,
        color: CARS[seed % CARS.length],
      });
      cars.push({
        position: [x, GROUND + 0.68, z],
        scale: [0.82, 0.38, 1.1],
        rotation,
        color: dark ? "#39424a" : "#8ea4b2",
      });
    });
    // What sits inside a block: a garden square, a paved one, or somewhere to
    // leave a car. Each is a ground patch plus the two or three objects that
    // say which it is — benches and trees, a fountain, or bays and vehicles.
    fabric.interiors.forEach((space, i) => {
      if (!keep(i)) return;
      const pad = (color: string, inset = 0) =>
        ground.push({
          position: [space.x, GROUND + 0.03, space.z],
          scale: [space.width - inset, 0.06, space.depth - inset],
          rotation: space.rotation,
          color,
        });
      if (space.kind === "green") {
        pad(season === "winter" ? "#9fae8e" : "#86b971");
        // Two trees and a bench, offset so the square is not symmetrical.
        for (const sign of [-1, 1]) {
          const tx = space.x + Math.cos(space.rotation) * sign * space.width * 0.26,
            tz = space.z - Math.sin(space.rotation) * sign * space.width * 0.26;
          trunks.push({
            position: [tx, GROUND + 0.8, tz],
            scale: [0.17, 1.6, 0.17],
          });
          if (season !== "winter")
            crowns.push({
              position: [tx, GROUND + 1.85, tz],
              scale: [0.95, 1.05, 0.95],
              color: leaf,
            });
        }
        furnishings.push({
          position: [space.x, GROUND + 0.26, space.z + space.depth * 0.3],
          scale: [1.1, 0.34, 0.3],
          rotation: space.rotation,
          color: "#9a7a5c",
        });
      } else if (space.kind === "square") {
        pad("#ded3c0");
        // A fountain basin, which is the cheapest thing that reads as a plaza.
        furnishings.push({
          position: [space.x, GROUND + 0.18, space.z],
          scale: [1.5, 0.3, 1.5],
          color: "#cdc2ae",
        });
        furnishings.push({
          position: [space.x, GROUND + 0.3, space.z],
          scale: [1.05, 0.1, 1.05],
          color: "#7fb6c9",
        });
      } else {
        pad("#8e9199");
        // Bay markings and a couple of cars actually parked in them.
        for (let bay = -1; bay <= 1; bay++) {
          const bx = space.x + Math.cos(space.rotation) * bay * 1.35,
            bz = space.z - Math.sin(space.rotation) * bay * 1.35;
          furnishings.push({
            position: [bx, GROUND + 0.07, bz],
            scale: [0.07, 0.02, space.depth * 0.6],
            rotation: space.rotation,
            color: "#e4e2d6",
          });
          if (noise2(space.seed + bay) > 0.4) {
            cars.push({
              position: [bx, GROUND + 0.33, bz],
              scale: [0.95, 0.5, 2.1],
              rotation: space.rotation,
              color: CARS[(space.seed + bay + 3) % CARS.length],
            });
            cars.push({
              position: [bx, GROUND + 0.68, bz],
              scale: [0.82, 0.38, 1.1],
              rotation: space.rotation,
              color: dark ? "#39424a" : "#8ea4b2",
            });
          }
        }
      }
    });
    // Zebra stripes, drawn just above the asphalt.
    fabric.furniture.crossings.forEach(({ at: [x, z], rotation, width }, i) => {
      if (!keep(i)) return;
      const stripes = Math.max(3, Math.round(width / 0.65));
      for (let s = 0; s < stripes; s++) {
        const offset = (s - (stripes - 1) / 2) * 0.62;
        crossings.push({
          position: [
            x + Math.cos(rotation) * offset,
            GROUND + 0.09,
            z - Math.sin(rotation) * offset,
          ],
          scale: [0.3, 0.02, 2.2],
          rotation,
          color: dark ? "#c8cbc4" : "#f2efe4",
        });
      }
    });
    // After dark some of the windows are lit and the lamps are on. Which
    // windows is fixed per building rather than random per frame, so the city
    // does not flicker as the camera moves; roughly two in five, because a
    // block with every window lit reads as an office at midnight, not a
    // neighbourhood.
    if (night) {
      for (let i = windows.length - 1; i >= 0; i--)
        if (noise2(i * 7 + 1) > 0.6) litWindows.push(...windows.splice(i, 1));
      litLamps.push(...lampHeads.splice(0, lampHeads.length));
    }
    // Everything that is a cube in the default material, in draw order: ground
    // patches first so the things standing on them sort above.
    const windowTint = dark ? "#f3d9a2" : "#9fb9c6";
    for (const w of windows) w.color ??= windowTint;
    for (const t of trunks) t.color ??= "#7b6248";
    return {
      boxes: [
        ...ground,
        ...crossings,
        ...furnishings,
        ...walls,
        ...roofs,
        ...trims,
        ...windows,
        ...cars,
        ...lampHeads,
      ],
      posts: [...trunks, ...lamps],
      crowns,
      litWindows,
      litLamps,
    };
  }, [fabric, season, dark, night, detail]);
  // One batch per geometry-and-material combination rather than one per kind of
  // thing. Colour travels per instance, so ground, crossings, walls, roofs,
  // trims, windows, cars and street furniture are all the same cube with the
  // same material and belong in a single instanced mesh; separating them by
  // what they represent cost a draw call each for no rendering reason.
  // What genuinely cannot merge: the two other geometries, and anything that
  // lights itself, since emissiveness is a material property.
  return (
    <group>
      <Boxes parts={parts.boxes} />
      <Boxes parts={parts.posts} color="#5c6165" geometry={cylinder} />
      <Boxes parts={parts.crowns} geometry={treeGeometry} />
      <Boxes
        parts={parts.litWindows}
        color="#ffd07a"
        glow={1.25}
        glowColor="#ffc361"
      />
      <Boxes
        parts={parts.litLamps}
        color="#ffe6b4"
        glow={1.8}
        glowColor="#ffdca0"
      />
    </group>
  );
}
