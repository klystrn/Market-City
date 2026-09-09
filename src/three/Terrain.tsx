import { useEffect, useMemo } from "react";
import {
  cityRoads,
  cityStreets,
  mainland,
  islands,
  waterOutline,
  coast,
  riverLeft,
  riverRight,
  sectors,
  landmarks,
  channels,
  isLand,
} from "@/domain/geography";
import { seasonPalette, type Season } from "@/domain/seasons";
import type { Plot } from "@/domain/types";
import {
  Boxes,
  landGeometry,
  segment,
  treeGeometry,
  type Part,
} from "./SceneryParts";
import Mountains, { mountainHeight } from "./Mountains";
import DistrictSpaces from "./DistrictSpaces";
import CivicSpaces from "./CivicSpaces";
import { civicSites, districtSites } from "@/domain/civic";
import Landmarks from "./Landmarks";
import type { MapFeatures } from "@/domain/map-features";
export default function Terrain({
  mapFeatures,
  dark,
  plots,
  season,
  relativeVolume,
}: {
  mapFeatures: MapFeatures;
  dark: boolean;
  plots: Plot[];
  season: Season;
  relativeVolume: number;
}) {
  const palette = seasonPalette[season];
  const geometry = useMemo(
    () => ({
      land: [mainland, ...islands].map((p) => landGeometry(p, 0.95)),
      water: landGeometry(waterOutline, 0.35),
      channels: channels.map((c) => landGeometry(c, 0.04)),
    }),
    [],
  );
  useEffect(
    () => () => {
      geometry.land.forEach((g) => g.dispose());
      geometry.channels.forEach((g) => g.dispose());
      geometry.water.dispose();
    },
    [geometry],
  );
  const parts = useMemo(() => {
    const roads = cityRoads(),
      streets = cityStreets();
    const asphalt: Part[] = [],
      sidewalks: Part[] = [],
      lines: Part[] = [],
      railings: Part[] = [],
      pillars: Part[] = [],
      crosswalks: Part[] = [],
      trunks: Part[] = [],
      crowns: Part[] = [],
      curbs: Part[] = [],
      lamps: Part[] = [],
      neighborhoods: Part[] = [],
      neighborhoodRoofs: Part[] = [],
      neighborhoodWindows: Part[] = [],
      petals: Part[] = [];
    for (const road of roads) {
      for (let i = 1; i < road.points.length; i++) {
        const a = road.points[i - 1],
          b = road.points[i];
        const elevation = road.bridge ? 1.22 : 1.04;
        sidewalks.push(
          segment(
            a,
            b,
            road.width + 1.05,
            road.bridge ? 0.4 : 0.12,
            elevation - 0.05,
          ),
        );
        asphalt.push(segment(a, b, road.width, 0.045, elevation + 0.035));
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
        for (let d = 1; d < length; d += 3) {
          const t = d / length,
            u = Math.min(1, (d + 1.2) / length);
          lines.push(
            segment(
              [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
              [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u],
              0.08,
              0.016,
              elevation + 0.067,
            ),
          );
        }
        if (road.bridge) {
          const nx = (b[1] - a[1]) / length,
            nz = -(b[0] - a[0]) / length;
          for (const sign of [-1, 1]) {
            railings.push(
              segment(
                [a[0] + nx * 2.1 * sign, a[1] + nz * 2.1 * sign],
                [b[0] + nx * 2.1 * sign, b[1] + nz * 2.1 * sign],
                0.2,
                0.65,
                elevation + 0.33,
              ),
            );
          }
          for (const t of [0.25, 0.5, 0.75])
            pillars.push({
              position: [
                a[0] + (b[0] - a[0]) * t,
                0.2,
                a[1] + (b[1] - a[1]) * t,
              ],
              scale: [1.1, 1.9, 2.5],
            });
        }
      }
    }
    for (const street of streets) {
      for (const endpoint of [street.start, street.end]) {
        for (let stripe = 0; stripe < 5; stripe++)
          crosswalks.push({
            position: [endpoint[0] + (stripe - 2) * 0.28, 1.115, endpoint[1]],
            scale: [0.16, 0.02, 1.7],
          });
        const lx = endpoint[0],
          lz = endpoint[1] + 1.55;
        lamps.push(
          { position: [lx, 2.1, lz], scale: [0.09, 2.2, 0.09] },
          { position: [lx + 0.25, 3.15, lz], scale: [0.6, 0.12, 0.24] },
        );
      }
    }

    for (const bank of [
      riverLeft,
      riverRight,
      coast,
      ...islands.map((i) => [...i, i[0]]),
    ])
      for (let i = 1; i < bank.length; i++)
        curbs.push(segment(bank[i - 1], bank[i], 0.6, 0.6, 0.77));
    const nearLandmark = (x: number, z: number, margin = 0) =>
      [...landmarks, ...civicSites, ...districtSites].some(
        (l) =>
          Math.abs(x - l.x) < l.radius + margin &&
          Math.abs(z - l.z) < l.radius + margin,
      );
    const nearRoad = (x: number, z: number, margin: number) =>
      roads.some((r) =>
        r.points.slice(1).some((b, i) => {
          const a = r.points[i],
            dx = b[0] - a[0],
            dz = b[1] - a[1],
            t = Math.max(
              0,
              Math.min(
                1,
                ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1),
              ),
            );
          return (
            Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz) <
            r.width / 2 + margin
          );
        }),
      );
    let candidate = 0;
    for (let x = -225; x < 159; x += 5.7)
      for (let z = -187; z < 169; z += 5.9) {
        candidate++;
        const px = x + Math.sin(candidate * 3.1) * 2,
          pz = z + Math.cos(candidate * 2.4) * 1.9;
        if (!isLand([px, pz]) || nearLandmark(px, pz, 2) || nearRoad(px, pz, 2))
          continue;
        if (
          sectors.some(
            (s) =>
              Math.abs(px - s.x) < s.width / 2 + 8 &&
              Math.abs(pz - s.z) < s.depth / 2 + 8,
          )
        )
          continue;
        if (Math.abs(Math.sin(candidate * 12.9898) * 43758.5453) % 1 > 0.24)
          continue;
        const elevation = mountainHeight(px, pz);
        if (elevation > 0.05) continue;
        const ground = 1 + elevation,
          size = 0.9 + (candidate % 5) * 0.13,
          evergreen = candidate % 4 === 0;
        trunks.push({
          position: [px, ground + 0.65, pz],
          scale: [0.22, 1.3, 0.22],
        });
        if (season === "winter" && !evergreen) {
          trunks.push({
            position: [px, ground + 1.25, pz],
            scale: [1.3, 0.13, 0.13],
            rotation: candidate,
          });
          trunks.push({
            position: [px, ground + 1.7, pz],
            scale: [0.8, 0.12, 0.12],
            rotation: candidate + 0.8,
          });
        } else {
          const color = evergreen
            ? palette.evergreen
            : season === "spring" && candidate % 5 === 0
              ? "#68a36a"
              : candidate % 2
                ? palette.leaf
                : palette.accent;
          crowns.push({
            position: [px, ground + 2, pz],
            scale: [size, size * (evergreen ? 1.7 : 1.05), size],
            color,
          });
          if (!evergreen)
            crowns.push({
              position: [px + 0.6, ground + 1.8, pz + 0.4],
              scale: [size * 0.72, size * 0.72, size * 0.72],
              color,
            });
          if (season === "winter" && evergreen)
            crowns.push({
              position: [px, ground + 2.9, pz],
              scale: [size * 0.75, 0.4, size * 0.75],
              color: palette.accent,
            });
          if (season === "spring" && !evergreen && candidate % 3 === 1)
            petals.push({
              position: [px + 0.5, ground + 0.03, pz],
              scale: [1.5, 0.025, 1.5],
              color: palette.accent,
            });
        }
      }
    // Muted architectural colors distinguish urban scenery from stock-performance buildings.
    const wallColors = [
      "#dbb989",
      "#dfcbb0",
      "#a4bbca",
      "#bac7cc",
      "#d9b6a7",
      "#c4c9b0",
    ];
    // Low-rise scenery reads as the neighbourhood a company town sits in, so it
    // has to stay clearly secondary to the buildings that carry market data.
    // The grid is spaced well wider than a block and keeps only some of the
    // cells, which leaves gaps between blocks instead of a continuous carpet.
    for (let x = -148; x < 139; x += 5.2)
      for (let z = -140; z < 163; z += 5.4) {
        if (
          ![-1.4, 1.4].every((dx) =>
            [-1.4, 1.4].every((dz) => isLand([x + dx, z + dz])),
          ) ||
          nearRoad(x, z, 1.8) ||
          nearLandmark(x, z, 2)
        )
          continue;
        const town = sectors.find(
          (s) =>
            Math.abs(x - s.x) < s.width / 2 + 8 &&
            Math.abs(z - s.z) < s.depth / 2 + 8,
        );
        if (
          !town ||
          plots.some(
            (p) =>
              Math.abs(x - p.x) < p.width / 2 + 2 &&
              Math.abs(z - p.z) < p.depth / 2 + 2,
          )
        )
          continue;
        const seed = Math.abs(Math.round(x * 13 + z * 7));
        if (seed % 10 >= 6) continue;
        const h = 1.5 + (seed % 5) * 0.6,
          w = seed % 3 === 0 ? 2.6 : 3.4,
          d = 3.2;
        neighborhoods.push({
          position: [x, 1.1 + h / 2, z],
          scale: [w, h, d],
          color: wallColors[seed % wallColors.length],
        });
        neighborhoodRoofs.push({
          position: [x, 1.15 + h, z],
          scale: [w + 0.15, 0.17, d + 0.15],
          color: seed % 4 === 0 ? town.color : seed % 2 ? "#f0e1c5" : "#7f9dad",
        });
        for (const sign of [-1, 1]) {
          neighborhoodWindows.push({
            position: [x, 1.1 + h * 0.65, z + sign * (d / 2 + 0.01)],
            scale: [w * 0.8, 0.4, 0.03],
          });
          neighborhoodWindows.push({
            position: [x + sign * (w / 2 + 0.01), 1.1 + h * 0.65, z],
            scale: [0.03, 0.4, d * 0.8],
          });
        }
      }
    const plotsides = plots.map((p) => ({
      position: [p.x, 1.04, p.z] as [number, number, number],
      scale: [p.width + 0.8, 0.1, p.depth + 0.8] as [number, number, number],
    }));
    return {
      asphalt,
      sidewalks,
      lines,
      railings,
      pillars,
      crosswalks,
      trunks,
      crowns,
      curbs,
      lamps,
      neighborhoods,
      neighborhoodRoofs,
      neighborhoodWindows,
      plotsides,
      petals,
    };
  }, [plots, season, palette]);
  return (
    <group>
      <mesh geometry={geometry.water} position={[0, -0.65, 0]}>
        <meshStandardMaterial color={palette.water} roughness={0.4} />
      </mesh>
      {geometry.land.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial
            color={dark ? "#466d56" : palette.ground}
            roughness={1}
          />
        </mesh>
      ))}
      {geometry.channels.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, 0.96, 0]}>
          <meshStandardMaterial color={palette.water} roughness={0.4} />
        </mesh>
      ))}
      {mapFeatures.mountains && <Mountains season={season} />}
      <group visible={mapFeatures.context}>
        <Boxes parts={parts.neighborhoods} />
        <Boxes parts={parts.neighborhoodRoofs} />
        <Boxes
          parts={parts.neighborhoodWindows}
          color={dark ? "#a4c7cf" : "#447d94"}
        />
      </group>
      <Boxes parts={parts.curbs} color={dark ? "#748e91" : "#cec4b3"} />
      <Boxes parts={parts.sidewalks} color={dark ? "#8f9995" : "#e6d7bd"} />
      <Boxes parts={parts.plotsides} color={dark ? "#80968f" : "#d9cfb6"} />
      <Boxes parts={parts.asphalt} color={dark ? "#354453" : "#566775"} />
      <Boxes parts={[...parts.lines, ...parts.crosswalks]} color="#f6eacb" />
      <Boxes
        parts={[...parts.railings, ...parts.pillars]}
        color={dark ? "#90aebd" : "#adc5ce"}
      />
      <Boxes parts={parts.lamps} color="#384a5b" />
      <group visible={mapFeatures.greenery}>
        <Boxes parts={parts.trunks} color="#795a47" />
        <Boxes parts={parts.crowns} geometry={treeGeometry} />
        <Boxes parts={parts.petals} />
      </group>
      <Landmarks
        civic={mapFeatures.civic}
        transit={mapFeatures.transit}
        greenery={mapFeatures.greenery}
      />
      {mapFeatures.civic && <DistrictSpaces />}
      <CivicSpaces
        features={mapFeatures}
        season={season}
        relativeVolume={relativeVolume}
      />
    </group>
  );
}
