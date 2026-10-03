import { useMemo } from "react";
import type { CityDefinition } from "@/domain/cities/types";
import type { Plot } from "@/domain/types";
import { generateFabric, type FabricBlock } from "@/domain/cities/fabric";
import { seasonPalette, type Season } from "@/domain/seasons";
import { Boxes, cylinder, treeGeometry, type Part } from "./SceneryParts";
// The ordinary city around the company buildings: terraces fronting the
// streets, corner shops, street trees, lamp posts and parked cars.
//
// All of it is deliberately quiet. Company buildings carry the market data and
// must read first, so the fabric uses muted wall colours, never the green and
// red of a daily move, and stays low enough that no terrace competes with a
// mega-cap tower for the eye.
const WALLS = [
  "#d8c3a5",
  "#c9b49b",
  "#bfc7c4",
  "#d3b1a3",
  "#c2c8b4",
  "#cdbfd0",
  "#b9c3cf",
];
const ROOFS = ["#8d6e63", "#7a6a66", "#6f7f86", "#9c6f5f", "#6b7465"];
const CARS = ["#c9ccd1", "#9aa4ad", "#b4584f", "#4f6f8f", "#d8d2c2", "#5f6b5a"];
const GROUND = 1.04;
function blockParts(
  b: FabricBlock,
  walls: Part[],
  roofs: Part[],
  windows: Part[],
  trims: Part[],
) {
  const base = GROUND + 0.04;
  walls.push({
    position: [b.x, base + b.height / 2, b.z],
    scale: [b.width, b.height, b.depth],
    rotation: b.rotation,
    color: WALLS[b.seed % WALLS.length],
  });
  if (b.kind === "house") {
    // A pitched roof, approximated as two stacked slabs — enough of a
    // silhouette at this scale to read as a house rather than a box.
    roofs.push({
      position: [b.x, base + b.height + 0.22, b.z],
      scale: [b.width + 0.3, 0.44, b.depth + 0.3],
      rotation: b.rotation,
      color: ROOFS[b.seed % ROOFS.length],
    });
    roofs.push({
      position: [b.x, base + b.height + 0.6, b.z],
      scale: [b.width * 0.55, 0.42, b.depth * 0.55],
      rotation: b.rotation,
      color: ROOFS[b.seed % ROOFS.length],
    });
    // A chimney, offset so it does not sit dead centre.
    trims.push({
      position: [
        b.x + Math.sin(b.rotation) * b.width * 0.26,
        base + b.height + 1.05,
        b.z + Math.cos(b.rotation) * b.width * 0.26,
      ],
      scale: [0.34, 0.8, 0.34],
      rotation: b.rotation,
      color: "#8a7064",
    });
  } else {
    // Flat roof with a parapet, and a rooftop unit on the taller ones.
    roofs.push({
      position: [b.x, base + b.height + 0.1, b.z],
      scale: [b.width + 0.22, 0.2, b.depth + 0.22],
      rotation: b.rotation,
      color: ROOFS[(b.seed + 2) % ROOFS.length],
    });
    if (b.height > 4.5)
      trims.push({
        position: [b.x, base + b.height + 0.45, b.z],
        scale: [b.width * 0.4, 0.5, b.depth * 0.4],
        rotation: b.rotation,
        color: "#9aa0a0",
      });
  }
  // Ground-floor retail: a glazed band along the street frontage. This is what
  // separates a shopping street from a residential one at a glance.
  if (b.kind === "shop") {
    const front = b.depth / 2 + 0.02;
    trims.push({
      position: [
        b.x + Math.cos(b.rotation) * front,
        base + 0.85,
        b.z - Math.sin(b.rotation) * front,
      ],
      scale: [b.width * 0.86, 1.3, 0.08],
      rotation: b.rotation,
      color: "#7fa7b5",
    });
    // An awning over it, which is most of what makes a shopfront legible.
    trims.push({
      position: [
        b.x + Math.cos(b.rotation) * (front + 0.3),
        base + 1.65,
        b.z - Math.sin(b.rotation) * (front + 0.3),
      ],
      scale: [b.width * 0.9, 0.1, 0.8],
      rotation: b.rotation,
      color: ["#b5675d", "#5f8a6d", "#5d7fa0"][b.seed % 3],
    });
  }
  // Window bands rather than individual panes: one row per floor, on both long
  // faces. Individual windows would cost thousands of instances to say the
  // same thing at the zoom the city is usually read from.
  const floors = Math.max(1, Math.floor(b.height / 1.5));
  for (let f = 0; f < floors; f++) {
    const y = base + 0.9 + f * 1.5;
    if (y > base + b.height - 0.4) break;
    if (b.kind === "shop" && f === 0) continue;
    for (const sign of [-1, 1]) {
      const off = (b.depth / 2 + 0.015) * sign;
      windows.push({
        position: [
          b.x + Math.cos(b.rotation) * off,
          y,
          b.z - Math.sin(b.rotation) * off,
        ],
        scale: [b.width * 0.72, 0.42, 0.04],
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
  detail,
}: {
  city: CityDefinition;
  plots: Plot[];
  season: Season;
  dark: boolean;
  /** 1 is the full city; lower values thin it when the device is struggling. */
  detail: number;
}) {
  const fabric = useMemo(
    () =>
      generateFabric({
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
      crossings: Part[] = [];
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
    return {
      walls,
      roofs,
      windows,
      trims,
      trunks,
      crowns,
      lamps,
      lampHeads,
      cars,
      crossings,
    };
  }, [fabric, season, dark, detail]);
  return (
    <group>
      <Boxes parts={parts.crossings} />
      <Boxes parts={parts.walls} />
      <Boxes parts={parts.roofs} />
      <Boxes parts={parts.trims} />
      <Boxes parts={parts.windows} color={dark ? "#f3d9a2" : "#9fb9c6"} />
      <Boxes parts={parts.cars} />
      <Boxes parts={parts.trunks} color="#7b6248" geometry={cylinder} />
      <Boxes parts={parts.crowns} geometry={treeGeometry} />
      <Boxes parts={parts.lamps} color="#5c6165" geometry={cylinder} />
      <Boxes parts={parts.lampHeads} />
    </group>
  );
}
