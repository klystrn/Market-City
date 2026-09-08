import { useMemo } from "react";
import { Boxes, cylinder, type Part } from "./SceneryParts";
import { landmarks } from "@/domain/geography";
import { districtSites } from "@/domain/civic";
import { Wordmark } from "./SignatureBuildings";
export default function DistrictSpaces() {
  const parts = useMemo(() => {
    const blocks: Part[] = [],
      round: Part[] = [];
    const add = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: string,
      list = blocks,
    ) => list.push({ position: [x, y, z], scale: [w, h, d], color });
    const [farm, mall, space, exchange] = districtSites;
    add(farm.x, 1.13, farm.z, 23, 0.2, 21, "#a98b54");
    for (let i = 0; i < 10; i++)
      add(
        farm.x - 9 + i * 1.8,
        1.35,
        farm.z - 2,
        0.65,
        0.3,
        14,
        i % 3 ? "#b8bd50" : "#6eaa57",
      );
    add(farm.x - 5, 2.8, farm.z + 7, 7, 3.2, 5, "#bd5949");
    add(farm.x - 5, 4.6, farm.z + 7, 8, 0.4, 6, "#e5d4b3");
    add(farm.x + 5, 3.5, farm.z + 7, 3.4, 4.5, 3.4, "#bbc5c5", round);
    add(mall.x, 1.15, mall.z, 19, 0.2, 18, "#dcc6af");
    for (const side of [-1, 1]) {
      add(mall.x + side * 6, 3.3, mall.z, 5, 4.3, 15, "#d9bcb5");
      add(mall.x + side * 6, 5.6, mall.z, 5.5, 0.35, 15.5, "#e9ce9a");
      for (let j = 0; j < 5; j++) {
        add(
          mall.x + side * 3.4,
          2.6,
          mall.z - 6 + j * 3,
          0.12,
          2.1,
          2,
          "#679aaa",
        );
        add(
          mall.x + side * 3,
          3.8,
          mall.z - 6 + j * 3,
          1,
          0.22,
          2.3,
          ["#d96476", "#e5ac53", "#619fb4"][j % 3],
        );
      }
    }
    add(mall.x, 2, mall.z - 6, 7, 2, 3, "#b67db1");
    add(space.x, 1.18, space.z, 12, 0.25, 7, "#9fadb3");
    add(space.x - 3, 3, space.z, 5, 3.7, 6, "#d1d9db");
    add(space.x - 3, 5, space.z, 5.5, 0.35, 6.5, "#414f60");
    add(exchange.x, 1.14, exchange.z, 11, 0.2, 10, "#d9d1bd");
    for (const side of [-1, 1])
      for (let i = 0; i < 4; i++) {
        add(
          exchange.x + side * 4.5,
          3,
          exchange.z - 4 + i * 2.6,
          0.16,
          3.8,
          0.16,
          "#394e58",
        );
        add(
          exchange.x + side * 4.2,
          4.3,
          exchange.z - 4 + i * 2.6,
          0.8,
          1.1,
          0.08,
          side === 1 ? "#4e7c8f" : "#bc9b58",
        );
      }
    return { blocks, round };
  }, []);
  const [farm, mall, space, exchange] = districtSites;
  const tech = landmarks.find((l) => l.sector === "technology")!;
  return (
    <group>
      <group position={[tech.x, 5, tech.z]}>
        <mesh>
          <icosahedronGeometry args={[2.1, 0]} />
          <meshStandardMaterial color="#65bac5" wireframe />
        </mesh>
        {[0, 1].map((i) => (
          <mesh key={i} rotation={[Math.PI / 3, (i * Math.PI) / 2, 0.5]}>
            <torusGeometry args={[3, 0.12, 6, 32]} />
            <meshStandardMaterial color={i ? "#c5a652" : "#6e8eca"} />
          </mesh>
        ))}
      </group>
      <Boxes parts={parts.blocks} />
      <Boxes parts={parts.round} geometry={cylinder} />
      <Wordmark
        text="MARKET FARM"
        color="#fff2cc"
        background="#6b8048"
        width={6}
        position={[farm.x - 5, 3, farm.z + 9.6]}
        active
      />
      <Wordmark
        text="CITY GALLERIA"
        color="#fff4dd"
        background="#955e84"
        width={7}
        position={[mall.x, 4, mall.z + 5]}
        active
      />
      <mesh
        position={[mall.x, 4.5, mall.z]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[1, 1, 2.4]}
      >
        <cylinderGeometry args={[2.5, 2.5, 5, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#88baca"
          roughness={0.2}
          metalness={0.25}
        />
      </mesh>
      <group position={[space.x + 3, 1.3, space.z]}>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 10, 12]} />
          <meshStandardMaterial
            color="#e1e6e6"
            metalness={0.6}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[0, 11, 0]}>
          <coneGeometry args={[0.85, 2, 12]} />
          <meshStandardMaterial color="#344957" />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.9, 1.4, 0]}>
            <boxGeometry args={[0.4, 2.8, 1]} />
            <meshStandardMaterial color="#354453" />
          </mesh>
        ))}
      </group>
      <Wordmark
        text="SPACEX"
        color="#ffffff"
        background="#263a4c"
        width={5}
        height={1.4}
        position={[space.x - 3, 3.3, space.z + 3.05]}
        active
      />
      <Wordmark
        text="EXHIBIT · NO QUOTE"
        color="#d4e6ea"
        background="#263a4c"
        width={5}
        height={0.6}
        position={[space.x - 3, 2.1, space.z + 3.06]}
        active
      />
      <group position={[exchange.x, 1.3, exchange.z]}>
        <mesh position={[0, 1.2, 0]} scale={[2, 1, 1]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#987740" metalness={0.55} />
        </mesh>
        <mesh position={[1.8, 1.7, 0]}>
          <icosahedronGeometry args={[0.75, 1]} />
          <meshStandardMaterial color="#987740" metalness={0.55} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh
              position={[1.9, 2.4, side * 0.65]}
              rotation={[side * 0.6, 0, 0]}
            >
              <coneGeometry args={[0.13, 1, 6]} />
              <meshStandardMaterial color="#bea36b" />
            </mesh>
            {[-1, 1].map((x) => (
              <mesh key={x} position={[x, 0.4, side * 0.6]}>
                <boxGeometry args={[0.3, 0.8, 0.3]} />
                <meshStandardMaterial color="#987740" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}
