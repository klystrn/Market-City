import { useEffect, useMemo } from "react";
import type { CityDefinition } from "@/domain/cities/types";
import type { Plot } from "@/domain/types";
import { seasonPalette, type Season } from "@/domain/seasons";
import { Boxes, landGeometry, segment, type Part } from "./SceneryParts";
// Shared ground renderer for the cities that describe themselves with data:
// land polygons, water, roads and per-lot pads. Tokyo keeps its own bespoke
// terrain, seasons and Fuji instead of using this.
export default function CityTerrain({
  city,
  plots,
  dark,
  season,
  districtPads,
}: {
  city: CityDefinition;
  plots: Plot[];
  dark: boolean;
  season: Season;
  districtPads: boolean;
}) {
  const palette = seasonPalette[season];
  const geometry = useMemo(
    () => ({
      land: city.land.map((polygon) => landGeometry(polygon, 0.95)),
      water: city.water.map((polygon) => landGeometry(polygon, 0.1)),
    }),
    [city],
  );
  useEffect(
    () => () => {
      geometry.land.forEach((g) => g.dispose());
      geometry.water.forEach((g) => g.dispose());
    },
    [geometry],
  );
  const parts = useMemo(() => {
    const asphalt: Part[] = [],
      sidewalks: Part[] = [],
      lines: Part[] = [],
      railings: Part[] = [],
      pillars: Part[] = [];
    for (const road of city.roads(plots))
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
        for (let d = 1; d < length; d += 3.2) {
          const t = d / length,
            u = Math.min(1, (d + 1.3) / length);
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
          for (const side of [-1, 1])
            railings.push(
              segment(
                [a[0] + nx * 2.1 * side, a[1] + nz * 2.1 * side],
                [b[0] + nx * 2.1 * side, b[1] + nz * 2.1 * side],
                0.2,
                0.65,
                elevation + 0.33,
              ),
            );
          for (const t of [0.3, 0.7])
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
    return { asphalt, sidewalks, lines, railings, pillars };
  }, [city, plots]);
  // A tinted pad under every lot carries its district colour, which is how the
  // zone wedges and borough neighbourhoods stay readable from the overview.
  const pads = useMemo(
    () =>
      plots.map((p): Part => {
        const district = city.districts.find((d) =>
          city.id === "london"
            ? Math.abs(Math.atan2(p.z, p.x) - Math.atan2(d.z, d.x)) < 0.3
            : Math.abs(p.x - d.x) <= d.width / 2 + 4 &&
              Math.abs(p.z - d.z) <= d.depth / 2 + 4,
        );
        return {
          position: [p.x, 1.04, p.z],
          scale: [p.width + 1.4, 0.1, p.depth + 1.4],
          color: district?.color ?? "#c9cfc0",
        };
      }),
    [plots, city],
  );
  return (
    <group>
      {/* The horizon beyond the city edge: open sea for a coastal city, or —
          for an inland one such as London — open country in the city's own
          ground colour, set flush with the built-up area so no shoreline or
          step appears where there is none. */}
      <mesh
        position={[0, city.surround === "land" ? 0.93 : -0.62, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial
          color={
            city.surround === "land"
              ? dark
                ? "#466d56"
                : palette.ground
              : palette.water
          }
          roughness={city.surround === "land" ? 1 : 0.42}
        />
      </mesh>
      {geometry.land.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial
            color={dark ? "#466d56" : palette.ground}
            roughness={1}
          />
        </mesh>
      ))}
      {/* Above the street grid, so ring roads read as crossings rather than
          chopping the river into fragments. Bridges sit higher still. */}
      {geometry.water.map((g, i) => (
        <mesh key={i} geometry={g} position={[0, 1.06, 0]}>
          <meshStandardMaterial color={palette.water} roughness={0.4} />
        </mesh>
      ))}
      <Boxes parts={parts.sidewalks} color={dark ? "#8f9995" : "#e6d7bd"} />
      <Boxes parts={parts.asphalt} color={dark ? "#354453" : "#566775"} />
      <Boxes parts={parts.lines} color="#f6eacb" />
      <Boxes
        parts={[...parts.railings, ...parts.pillars]}
        color={dark ? "#90aebd" : "#adc5ce"}
      />
      {districtPads && <Boxes parts={pads} />}
    </group>
  );
}
