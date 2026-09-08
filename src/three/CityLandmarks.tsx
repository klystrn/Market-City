import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { CityLandmark } from "@/domain/cities/types";
import { seasonPalette, type Season } from "@/domain/seasons";
import { Boxes, cylinder, treeGeometry, type Part } from "./SceneryParts";
// Simplified low-poly massing for the recognizable places in London and New
// York. These are silhouettes that read at a glance, not architectural
// reproductions, and none of them carries a market encoding.
const GROUND = 1.1;
function Wheel({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND + r * 0.95, landmark.z]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[r * 0.9, r * 0.07, 8, 26]} />
        <meshStandardMaterial color="#c9d6dc" metalness={0.4} roughness={0.4} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          rotation={[(i / 8) * Math.PI, Math.PI / 2, 0]}
          scale={[0.06, r * 1.8, 0.06]}
        >
          <boxGeometry />
          <meshStandardMaterial color="#dbe4e7" />
        </mesh>
      ))}
      <mesh position={[0, -r * 0.95, 0]} scale={[r * 0.5, r * 0.2, r * 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#b9c6c9" />
      </mesh>
    </group>
  );
}
function Bridge({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group
      position={[landmark.x, GROUND, landmark.z]}
      rotation={[0, landmark.rotation ?? 0, 0]}
    >
      <mesh position={[0, 0.6, 0]} scale={[r * 2.6, 0.3, r * 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#b4a893" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * r * 0.7, 0, 0]}>
          <mesh position={[0, r * 0.7, 0]} scale={[r * 0.28, r * 1.4, r * 0.5]}>
            <boxGeometry />
            <meshStandardMaterial color="#9aa7ad" />
          </mesh>
          <mesh position={[0, r * 1.5, 0]}>
            <coneGeometry args={[r * 0.22, r * 0.5, 4]} />
            <meshStandardMaterial color="#7d99a6" />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, r * 1.05, side * r * 0.24]}
          scale={[r * 1.4, 0.09, 0.09]}
        >
          <boxGeometry />
          <meshStandardMaterial color="#8fa3ac" />
        </mesh>
      ))}
    </group>
  );
}
function Statue({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 12;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, h * 0.18, 0]} scale={[h * 0.42, h * 0.36, h * 0.42]}>
        <boxGeometry />
        <meshStandardMaterial color="#b3a894" />
      </mesh>
      <mesh position={[0, h * 0.6, 0]} scale={[h * 0.14, h * 0.5, h * 0.14]}>
        <boxGeometry />
        <meshStandardMaterial color="#7fb4a4" />
      </mesh>
      <mesh position={[h * 0.1, h * 0.92, 0]} scale={[0.09, h * 0.24, 0.09]}>
        <boxGeometry />
        <meshStandardMaterial color="#7fb4a4" />
      </mesh>
      <mesh position={[h * 0.1, h * 1.06, 0]}>
        <coneGeometry args={[h * 0.06, h * 0.14, 6]} />
        <meshStandardMaterial
          color="#f0c766"
          emissive="#e0a93c"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}
function Dome({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.4, 0]} scale={[r * 1.5, r * 0.8, r * 1.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#ddd2c0" />
      </mesh>
      <mesh position={[0, r * 0.8, 0]}>
        <sphereGeometry args={[r * 0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#9fb4b8" metalness={0.25} roughness={0.4} />
      </mesh>
      <mesh position={[0, r * 1.5, 0]} scale={[0.14, r * 0.4, 0.14]}>
        <boxGeometry />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>
    </group>
  );
}
function Arena({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.28, 0]}>
        <cylinderGeometry args={[r, r * 1.05, r * 0.56, 18]} />
        <meshStandardMaterial color="#cfc6b1" />
      </mesh>
      <mesh position={[0, r * 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 0.78, 18]} />
        <meshStandardMaterial color="#6ea765" />
      </mesh>
    </group>
  );
}
function Spire({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 24;
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, h * 0.32, 0]} scale={[r * 1.7, h * 0.64, r * 1.7]}>
        <boxGeometry />
        <meshStandardMaterial
          color={landmark.color ?? "#9fb3bd"}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, h * 0.76, 0]} scale={[r * 1.1, h * 0.26, r * 1.1]}>
        <boxGeometry />
        <meshStandardMaterial color={landmark.color ?? "#adc0c8"} />
      </mesh>
      <mesh position={[0, h * 0.95, 0]}>
        <coneGeometry args={[r * 0.5, h * 0.16, 6]} />
        <meshStandardMaterial color="#c8d6da" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, h * 1.12, 0]} scale={[0.1, h * 0.2, 0.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#dbe5e8" />
      </mesh>
    </group>
  );
}
function Tower({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 18;
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r * 0.62, r * 0.8, h, 14]} />
        <meshStandardMaterial
          color={landmark.color ?? "#8fb6c4"}
          metalness={0.35}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, h + 0.4, 0]}>
        <cylinderGeometry args={[r * 0.4, r * 0.6, 0.8, 14]} />
        <meshStandardMaterial color="#cfdce0" />
      </mesh>
    </group>
  );
}
function Museum({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.35, 0]} scale={[r * 2, r * 0.7, r * 1.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#ddd3bd" />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          position={[(i - 2) * r * 0.36, r * 0.42, r * 0.78]}
          scale={[r * 0.13, r * 0.84, r * 0.13]}
        >
          <boxGeometry />
          <meshStandardMaterial color="#f2e9d3" />
        </mesh>
      ))}
      <mesh position={[0, r * 0.86, r * 0.5]} scale={[r * 1.9, r * 0.16, r * 0.8]}>
        <boxGeometry />
        <meshStandardMaterial color="#c9bda4" />
      </mesh>
    </group>
  );
}
function Palace({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.36, 0]} scale={[r * 2.4, r * 0.72, r * 1.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#d9cdb4" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * r * 1.1, r * 0.3, r * 0.6]}
          scale={[r * 0.55, r * 0.6, r * 0.9]}
        >
          <boxGeometry />
          <meshStandardMaterial color="#cfc2a8" />
        </mesh>
      ))}
      <mesh position={[0, r * 0.78, 0]} scale={[r * 2.5, r * 0.12, r * 1.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#a9a08a" />
      </mesh>
    </group>
  );
}
function Terminal({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.34, 0]} scale={[r * 2.1, r * 0.68, r * 1.4]}>
        <boxGeometry />
        <meshStandardMaterial color="#c8b79b" />
      </mesh>
      <mesh position={[0, r * 0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.7, r * 0.7, r * 2, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#8fa9b3"
          metalness={0.3}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
export default function CityLandmarks({
  landmarks,
  season,
  labels,
}: {
  landmarks: CityLandmark[];
  season: Season;
  labels: boolean;
}) {
  const palette = seasonPalette[season];
  const greens = useMemo(() => {
    const lawns: Part[] = [],
      crowns: Part[] = [],
      trunks: Part[] = [];
    for (const l of landmarks) {
      if (l.kind !== "park" && l.kind !== "greenway") continue;
      const w = l.width ?? l.radius * 2,
        d = l.depth ?? l.radius * 2;
      lawns.push({
        position: [l.x, 1.12, l.z],
        scale: [w, 0.15, d],
        color: season === "winter" ? "#cdd6c4" : "#86bb78",
      });
      const rows = Math.max(2, Math.round(d / 6));
      for (let i = 0; i < rows; i++)
        for (const side of [-1, 1]) {
          const x = l.x + side * (w / 2 - 1.4);
          const z = l.z - d / 2 + ((i + 0.5) * d) / rows;
          trunks.push({ position: [x, 2, z], scale: [0.26, 1.8, 0.26] });
          if (season !== "winter")
            crowns.push({
              position: [x, 3.5, z],
              scale: [1.5, 1.7, 1.5],
              color: i % 2 ? palette.leaf : palette.accent,
            });
        }
    }
    return { lawns, crowns, trunks };
  }, [landmarks, season, palette]);
  return (
    <group>
      <Boxes parts={greens.lawns} />
      <Boxes parts={greens.trunks} geometry={cylinder} color="#7d6047" />
      <Boxes parts={greens.crowns} geometry={treeGeometry} />
      {landmarks.map((l) => {
        switch (l.kind) {
          case "wheel":
            return <Wheel key={l.id} landmark={l} />;
          case "bridge":
            return <Bridge key={l.id} landmark={l} />;
          case "statue":
            return <Statue key={l.id} landmark={l} />;
          case "dome":
            return <Dome key={l.id} landmark={l} />;
          case "arena":
            return <Arena key={l.id} landmark={l} />;
          case "spire":
            return <Spire key={l.id} landmark={l} />;
          case "tower":
            return <Tower key={l.id} landmark={l} />;
          case "museum":
            return <Museum key={l.id} landmark={l} />;
          case "palace":
            return <Palace key={l.id} landmark={l} />;
          case "terminal":
            return <Terminal key={l.id} landmark={l} />;
          default:
            return null;
        }
      })}
      {labels &&
        landmarks
          .filter((l) => l.radius >= 4)
          .map((l) => (
            <Html
              key={l.id}
              position={[l.x, (l.height ?? l.radius * 1.6) + 2.4, l.z]}
              center
              zIndexRange={[3, 0]}
            >
              <span className="landmark-label">{l.name}</span>
            </Html>
          ))}
    </group>
  );
}
