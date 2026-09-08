import { useMemo } from "react";
import { Boxes, cylinder, treeGeometry, type Part } from "./SceneryParts";
import { civicSites } from "@/domain/civic";
import { seasonPalette, type Season } from "@/domain/seasons";
import type { MapFeatures } from "@/domain/map-features";
export default function CivicSpaces({
  season,
  relativeVolume,
  features,
}: {
  season: Season;
  relativeVolume: number;
  features: MapFeatures;
}) {
  const parts = useMemo(() => {
    const parks: Part[] = [],
      civic: Part[] = [],
      transit: Part[] = [],
      trees: Part[] = [],
      trunks: Part[] = [];
    const add = (
      list: Part[],
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: string,
    ) => list.push({ position: [x, y, z], scale: [w, h, d], color });
    const [park, museum, garden, station] = civicSites;
    // A full city block of open lawn; the existing elevated rail crosses its eastern promenade.
    add(parks, park.x, 1.12, park.z, 50, 0.15, 40, "#81b777");
    for (const z of [-18, 18])
      add(parks, park.x, 1.24, park.z + z, 48, 0.08, 1.6, "#eedbbc");
    for (const x of [-23, 23])
      add(parks, park.x + x, 1.24, park.z, 1.6, 0.08, 36, "#eedbbc");
    add(parks, park.x, 1.25, park.z + 6, 46, 0.08, 2, "#e7d1aa");
    add(parks, park.x - 2, 1.25, park.z, 2, 0.08, 35, "#e7d1aa");
    // A broad west lawn stays bare; trees line the perimeter instead of filling every square.
    for (let i = 0; i < 20; i++) {
      const side = i < 10 ? -1 : 1,
        x = park.x - 21 + (i % 10) * 4.6,
        z = park.z + side * 15.5;
      trunks.push({ position: [x, 2.1, z], scale: [0.3, 2, 0.3] });
      if (season !== "winter")
        trees.push({
          position: [x, 4, z],
          scale: [1.6, 1.9, 1.6],
          color: seasonPalette[season].leaf,
        });
      add(parks, x, 1.7, z - side * 2.2, 1.7, 0.35, 0.6, "#a77c52");
    }
    for (let i = 0; i < 5; i++)
      add(
        parks,
        park.x + 14,
        1.4 + i * 0.22,
        park.z + 11,
        9 - i,
        0.25,
        5 - i * 0.6,
        "#d5c3a1",
      );
    add(civic, museum.x, 1.12, museum.z, 19, 0.2, 19, "#d8cbb8");
    for (const sign of [-1, 1])
      add(civic, museum.x + sign * 7, 3.3, museum.z, 4, 4.3, 17, "#e3d4ba");
    add(civic, museum.x, 3.3, museum.z - 7, 12, 4.3, 3, "#e3d4ba");
    for (let i = -3; i <= 3; i++)
      add(
        civic,
        museum.x + i * 2,
        3.4,
        museum.z - 5.4,
        0.55,
        3,
        0.55,
        "#f9edcf",
      );
    add(parks, garden.x, 1.12, garden.z, 12, 0.2, 12, "#779e69");
    add(transit, station.x, 4.25, station.z, 13, 0.3, 12, "#d4bb94");
    add(transit, station.x, 7, station.z, 13, 0.4, 12, "#528d9b");
    for (const x of [-5, 5])
      for (const z of [-4, 4])
        add(
          transit,
          station.x + x,
          5.5,
          station.z + z,
          0.4,
          2.5,
          0.4,
          "#e7d9c3",
        );
    for (let i = 0; i < 5; i++)
      add(
        transit,
        station.x - 4 + i * 2,
        7.3,
        station.z,
        1.2,
        0.18,
        6,
        i < Math.round(Math.min(5, relativeVolume * 2)) ? "#efbd53" : "#617776",
      );
    return { parks, civic, transit, trees, trunks };
  }, [season, relativeVolume]);
  const [park, museum, garden] = civicSites;
  return (
    <group>
      <group visible={features.parks}>
        <Boxes parts={parts.parks} />
        <group visible={features.greenery}>
          <Boxes parts={parts.trees} geometry={treeGeometry} />
          <Boxes parts={parts.trunks} geometry={cylinder} color="#876148" />
        </group>
        <mesh
          position={[park.x - 13, 1.3, park.z - 6]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 0.65, 1]}
        >
          <circleGeometry args={[7, 32]} />
          <meshStandardMaterial color="#419fad" roughness={0.3} />
        </mesh>
        <mesh position={[park.x + 15, 1.5, park.z - 9]}>
          <cylinderGeometry args={[3, 3, 0.5, 20]} />
          <meshStandardMaterial color="#d8d0bb" />
        </mesh>
        <mesh
          position={[park.x + 15, 1.78, park.z - 9]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[2.6, 20]} />
          <meshStandardMaterial color="#56afbc" />
        </mesh>
        {[-3, 3].map((x, i) => (
          <mesh
            key={x}
            position={[garden.x + x, 1.2, garden.z]}
            scale={[1, 1 + i * 0.3, 1]}
          >
            <sphereGeometry args={[3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#98d4ce"
              roughness={0.25}
              metalness={0.15}
            />
          </mesh>
        ))}
      </group>
      <group visible={features.civic}>
        <Boxes parts={parts.civic} />
        <mesh
          position={[museum.x, 3.9, museum.z + 2]}
          rotation={[0, Math.PI / 4, 0]}
        >
          <coneGeometry args={[5, 5.5, 4]} />
          <meshStandardMaterial
            color="#6ab7c9"
            metalness={0.2}
            roughness={0.35}
          />
        </mesh>
      </group>
      <group visible={features.transit}>
        <Boxes parts={parts.transit} />
      </group>
    </group>
  );
}
