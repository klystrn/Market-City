import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { CityLandmark } from "@/domain/cities/types";
import { seasonPalette, type Season } from "@/domain/seasons";
import { Boxes, cylinder, treeGeometry, type Part } from "./SceneryParts";
// Simplified low-poly massing for the recognizable places in London and New
// York. These are silhouettes that read at a glance, not architectural
// reproductions, and none of them carries a market encoding.
//
// A landmark that stands in for a company (`ticker` set) gets no mesh here at
// all: the company's own building already stands at that spot, carrying the
// daily-performance colour encoding, so a second unrelated shape on top of it
// would just overlap. Its real-world identity comes through on the company
// card instead.
const GROUND = 1.1;
// A short diagonal strut between two points in the landmark's local X-Y plane
// (X across, Y up), used for bridge cables and roof struts.
function Beam({
  x1,
  y1,
  x2,
  y2,
  thickness = 0.1,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness?: number;
  color: string;
}) {
  const dx = x2 - x1,
    dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 0.01;
  const angle = Math.atan2(dy, dx);
  return (
    <mesh
      position={[(x1 + x2) / 2, (y1 + y2) / 2, 0]}
      rotation={[0, 0, angle]}
      scale={[length, thickness, thickness]}
    >
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
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
          key={`spoke-${i}`}
          rotation={[(i / 8) * Math.PI, Math.PI / 2, 0]}
          scale={[0.06, r * 1.8, 0.06]}
        >
          <boxGeometry />
          <meshStandardMaterial color="#dbe4e7" />
        </mesh>
      ))}
      {/* Rim capsules, the detail that actually reads as "Ferris wheel" rather
          than "ring on a stick" at a glance. */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <mesh
            key={`pod-${i}`}
            position={[Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, 0]}
            scale={[0.34, 0.24, 0.26]}
          >
            <boxGeometry />
            <meshStandardMaterial color="#f2f6f2" />
          </mesh>
        );
      })}
      <mesh position={[0, -r * 0.95, 0]} scale={[r * 0.5, r * 0.2, r * 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#b9c6c9" />
      </mesh>
    </group>
  );
}
// The default bridge silhouette: twin Gothic stone piers with fanned
// suspension cables, matching Brooklyn Bridge — used for it directly, and as
// the fallback for any future bridge that isn't given its own bespoke shape.
function SuspensionBridge({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  const towerX = r * 0.68,
    towerTopY = r * 1.98,
    deckY = 0.5;
  return (
    <group
      position={[landmark.x, GROUND, landmark.z]}
      rotation={[0, landmark.rotation ?? 0, 0]}
    >
      <mesh position={[0, deckY, 0]} scale={[r * 2.6, 0.26, 0.42]}>
        <boxGeometry />
        <meshStandardMaterial color="#9b8f78" />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          {[-1, 1].map((leg) => (
            <mesh
              key={leg}
              position={[side * towerX, r * 0.85, leg * r * 0.2]}
              scale={[r * 0.2, r * 1.7, r * 0.2]}
            >
              <boxGeometry />
              <meshStandardMaterial color="#c9beac" />
            </mesh>
          ))}
          <mesh
            position={[side * towerX, r * 1.78, 0]}
            scale={[r * 0.5, r * 0.22, r * 0.46]}
          >
            <boxGeometry />
            <meshStandardMaterial color="#b3a68f" />
          </mesh>
          <mesh position={[side * towerX, r * 1.98, 0]}>
            <coneGeometry args={[r * 0.32, r * 0.4, 4]} />
            <meshStandardMaterial color="#a89b83" />
          </mesh>
          {[0.35, 0.7, 1.05].map((f, i) => (
            <Beam
              key={i}
              x1={side * towerX}
              y1={towerTopY}
              x2={side * towerX * (1 - f)}
              y2={deckY}
              thickness={0.07}
              color="#8b8272"
            />
          ))}
        </group>
      ))}
    </group>
  );
}
// Tower Bridge: bascule towers with turrets and a high-level walkway, styled
// in painted blue-grey ironwork — deliberately not the suspension shape above,
// so the two most famous bridges in the dataset read as different bridges.
function TowerBridge({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group
      position={[landmark.x, GROUND, landmark.z]}
      rotation={[0, landmark.rotation ?? 0, 0]}
    >
      {[-1, 1].map((side) => (
        <group key={side} position={[side * r * 0.62, 0, 0]}>
          <mesh position={[0, r * 1.1, 0]} scale={[r * 0.5, r * 2.2, r * 0.5]}>
            <boxGeometry />
            <meshStandardMaterial color="#8a95a0" />
          </mesh>
          {[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ].map(([cx, cz], i) => (
            <mesh key={i} position={[cx * r * 0.22, r * 2.35, cz * r * 0.22]}>
              <coneGeometry args={[r * 0.09, r * 0.34, 4]} />
              <meshStandardMaterial color="#5f6a76" />
            </mesh>
          ))}
          <mesh position={[0, r * 2.5, 0]} scale={[r * 0.56, 0.12, r * 0.56]}>
            <boxGeometry />
            <meshStandardMaterial color="#4d5760" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, r * 1.9, 0]} scale={[r * 1.24, 0.22, 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#8fa3ac" />
      </mesh>
      <mesh position={[0, 0.6, 0]} scale={[r * 2.6, 0.3, r * 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#b4a893" />
      </mesh>
      <mesh position={[0, 0.42, 0]} scale={[r * 2.6, 0.1, r * 0.56]}>
        <boxGeometry />
        <meshStandardMaterial color="#2f5f8a" />
      </mesh>
    </group>
  );
}
// The Statue of Liberty: a stepped pedestal, draped patina-green robe, raised
// torch arm and a spiked crown — the only statue-kind landmark, so this is
// simply the generic renderer rather than a bespoke override.
function Statue({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 12;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, h * 0.09, 0]} scale={[h * 0.5, h * 0.18, h * 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#9b9082" />
      </mesh>
      <mesh position={[0, h * 0.22, 0]} scale={[h * 0.36, h * 0.16, h * 0.36]}>
        <boxGeometry />
        <meshStandardMaterial color="#a89d8d" />
      </mesh>
      <mesh position={[0, h * 0.56, 0]}>
        <coneGeometry args={[h * 0.16, h * 0.5, 8]} />
        <meshStandardMaterial color="#6fae9c" />
      </mesh>
      <mesh position={[0, h * 0.84, 0]}>
        <sphereGeometry args={[h * 0.07, 10, 8]} />
        <meshStandardMaterial color="#6fae9c" />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * h * 0.08, h * 0.9, Math.sin(a) * h * 0.08]}
          >
            <coneGeometry args={[h * 0.015, h * 0.08, 4]} />
            <meshStandardMaterial color="#5f9c8b" />
          </mesh>
        );
      })}
      <mesh
        position={[h * 0.13, h * 0.78, 0]}
        rotation={[0, 0, -0.5]}
        scale={[h * 0.32, h * 0.05, h * 0.05]}
      >
        <boxGeometry />
        <meshStandardMaterial color="#6fae9c" />
      </mesh>
      <mesh position={[h * 0.22, h * 0.95, 0]}>
        <coneGeometry args={[h * 0.045, h * 0.09, 6]} />
        <meshStandardMaterial
          color="#f0c766"
          emissive="#e0a93c"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}
// The default dome: a low, wide tent with perimeter mast lines, matching the
// O2 — used directly, and as the fallback for a future dome without its own
// bespoke shape.
function TentDome({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.4, 0]} scale={[r * 1.5, r * 0.8, r * 1.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#ddd2c0" />
      </mesh>
      <mesh position={[0, r * 0.8, 0]}>
        <sphereGeometry
          args={[r * 0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
        />
        <meshStandardMaterial
          color="#9fb4b8"
          metalness={0.25}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, r * 1.5, 0]} scale={[0.14, r * 0.4, 0.14]}>
        <boxGeometry />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r * 1.5, r * 0.55, Math.sin(a) * r * 1.5]}
            rotation={[0, 0, 0]}
            scale={[0.08, r * 1.1, 0.08]}
          >
            <boxGeometry />
            <meshStandardMaterial color="#e0c452" />
          </mesh>
        );
      })}
    </group>
  );
}
// St Paul's Cathedral: a stone drum carrying the dome, with a lantern and
// cross above it, taller and narrower than the O2's flat tent so the two
// domes read as different buildings.
function StPauls({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.3, 0]} scale={[r * 1.8, r * 0.6, r * 1.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#d8d0bd" />
      </mesh>
      <mesh position={[0, r * 0.85, 0]}>
        <cylinderGeometry args={[r * 0.62, r * 0.68, r * 0.7, 16]} />
        <meshStandardMaterial color="#cfc7b1" />
      </mesh>
      <mesh position={[0, r * 1.35, 0]}>
        <sphereGeometry args={[r * 0.62, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8fa6ac" metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0, r * 1.86, 0]} scale={[0.16, r * 0.34, 0.16]}>
        <boxGeometry />
        <meshStandardMaterial color="#cfc7b1" />
      </mesh>
      <mesh position={[0, r * 2.06, 0]}>
        <coneGeometry args={[r * 0.1, r * 0.18, 8]} />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>
    </group>
  );
}
// Royal Observatory Greenwich: a small dome on the hill it actually stands on,
// with the red time-ball mast beside it.
function Greenwich({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.18, 0]}>
        <cylinderGeometry args={[r * 1.3, r * 1.5, r * 0.36, 16]} />
        <meshStandardMaterial color="#7fae6c" />
      </mesh>
      <mesh position={[0, r * 0.55, 0]} scale={[r * 1.1, r * 0.5, r * 0.8]}>
        <boxGeometry />
        <meshStandardMaterial color="#d3c7a9" />
      </mesh>
      <mesh position={[r * 0.3, r * 0.92, 0]}>
        <sphereGeometry args={[r * 0.32, 12, 8]} />
        <meshStandardMaterial color="#4c5a63" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-r * 0.3, r * 1.05, 0]} scale={[0.06, r * 0.5, 0.06]}>
        <boxGeometry />
        <meshStandardMaterial color="#8a7f6a" />
      </mesh>
      <mesh position={[-r * 0.3, r * 1.32, 0]}>
        <sphereGeometry args={[r * 0.1, 8, 8]} />
        <meshStandardMaterial color="#c94c3f" />
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
// Wembley Stadium: the same bowl as any other arena, plus the arch that
// actually makes it recognizable, traced as a string of beads over the roof.
function Wembley({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  const segs = 9;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.28, 0]}>
        <cylinderGeometry args={[r, r * 1.05, r * 0.56, 20]} />
        <meshStandardMaterial color="#cfc6b1" />
      </mesh>
      <mesh position={[0, r * 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 0.78, 20]} />
        <meshStandardMaterial color="#6ea765" />
      </mesh>
      {Array.from({ length: segs }, (_, i) => {
        const t = i / (segs - 1);
        const angle = t * Math.PI;
        const cx = Math.cos(angle) * r * 1.15;
        const cy = Math.sin(angle) * r * 1.35 + r * 0.4;
        return (
          <mesh key={i} position={[cx, cy, 0]} scale={[0.18, 0.18, 0.18]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial color="#e7e2d6" metalness={0.4} roughness={0.4} />
          </mesh>
        );
      })}
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
// The Empire State Building: setback tiers narrowing toward a mast, rather
// than one plain box — the defining Art Deco profile.
function EmpireState({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 34;
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, h * 0.28, 0]} scale={[r * 1.7, h * 0.56, r * 1.7]}>
        <boxGeometry />
        <meshStandardMaterial color="#b7a98d" />
      </mesh>
      <mesh position={[0, h * 0.64, 0]} scale={[r * 1.15, h * 0.24, r * 1.15]}>
        <boxGeometry />
        <meshStandardMaterial color="#c2b596" />
      </mesh>
      <mesh position={[0, h * 0.82, 0]} scale={[r * 0.7, h * 0.12, r * 0.7]}>
        <boxGeometry />
        <meshStandardMaterial color="#cabf9e" />
      </mesh>
      <mesh position={[0, h * 0.95, 0]} scale={[0.12, h * 0.22, 0.12]}>
        <boxGeometry />
        <meshStandardMaterial color="#d8cfae" />
      </mesh>
      <mesh position={[0, h * 1.08, 0]}>
        <coneGeometry args={[0.05, h * 0.1, 6]} />
        <meshStandardMaterial
          color="#f2c265"
          emissive="#e0a93c"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}
// The Chrysler Building: terraced stainless rings tapering to a needle spire,
// the sunburst crown that makes it unmistakable.
function Chrysler({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 27;
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, h * 0.34, 0]} scale={[r * 1.6, h * 0.68, r * 1.6]}>
        <boxGeometry />
        <meshStandardMaterial color="#c7bfae" />
      </mesh>
      {[0.7, 0.82, 0.92].map((t, i) => (
        <mesh key={i} position={[0, h * t, 0]}>
          <cylinderGeometry
            args={[r * (0.95 - i * 0.22), r * (1.05 - i * 0.2), h * 0.1, 8]}
          />
          <meshStandardMaterial color="#d7d2c2" metalness={0.55} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, h * 1.02, 0]} scale={[0.1, h * 0.22, 0.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#e4e0d2" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}
// One World Trade Center: a tapered obelisk built from shrinking, 45°-turned
// segments to hint the real building's chamfered corners, rather than a plain
// stepped box.
function OneWtc({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 40;
  const r = landmark.radius;
  const segs = 4;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      {Array.from({ length: segs }, (_, i) => {
        const t = i / segs;
        const rad = r * (1 - t * 0.55);
        const segH = h / segs;
        return (
          <mesh
            key={i}
            position={[0, segH * (i + 0.5), 0]}
            rotation={[0, Math.PI / 4, 0]}
            scale={[rad * 1.3, segH * 1.02, rad * 1.3]}
          >
            <boxGeometry />
            <meshStandardMaterial color="#a9c3cc" metalness={0.4} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, h + 1, 0]} scale={[0.1, 2, 0.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#cfe0e5" />
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
// The Gherkin: five tapered rings that bulge in the middle and pinch at both
// ends, tracing the building's tapered "pickle" profile instead of a plain
// cylinder.
function Gherkin({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 18;
  const r = landmark.radius;
  const segs = 5;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      {Array.from({ length: segs }, (_, i) => {
        const t = (i + 0.5) / segs;
        const bulge = Math.sin(t * Math.PI);
        const rad = r * (0.45 + bulge * 0.75);
        const segH = h / segs;
        return (
          <mesh key={i} position={[0, segH * (i + 0.5), 0]}>
            <cylinderGeometry args={[rad * 0.98, rad, segH * 1.02, 12]} />
            <meshStandardMaterial color="#8fbfc7" metalness={0.4} roughness={0.25} />
          </mesh>
        );
      })}
      <mesh position={[0, h + 0.4, 0]}>
        <coneGeometry args={[r * 0.22, 0.9, 8]} />
        <meshStandardMaterial color="#cfe4e7" />
      </mesh>
    </group>
  );
}
// Canary Wharf (One Canada Square): a plain tower topped with the pyramidal
// roof that identifies it on the skyline.
function CanaryWharf({ landmark }: { landmark: CityLandmark }) {
  const h = landmark.height ?? 26;
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, h / 2, 0]} scale={[r * 1.1, h, r * 1.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#c3ccd1" metalness={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, h + r * 0.55, 0]}>
        <coneGeometry args={[r * 0.85, r * 1.1, 4]} />
        <meshStandardMaterial color="#dfe6e8" metalness={0.4} roughness={0.25} />
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
      <mesh
        position={[0, r * 0.86, r * 0.5]}
        scale={[r * 1.9, r * 0.16, r * 0.8]}
      >
        <boxGeometry />
        <meshStandardMaterial color="#c9bda4" />
      </mesh>
    </group>
  );
}
// Tate Modern: the converted Bankside power station's single tall chimney on
// a long brick block, kept deliberately distinct from Battersea's four
// corner chimneys below.
function TateModern({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  const chimneyH = r * 2.6;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.45, 0]} scale={[r * 2.2, r * 0.9, r * 1.3]}>
        <boxGeometry />
        <meshStandardMaterial color="#8a5a48" />
      </mesh>
      <mesh position={[0, chimneyH / 2, 0]} scale={[r * 0.34, chimneyH, r * 0.34]}>
        <boxGeometry />
        <meshStandardMaterial color="#7a4d3d" />
      </mesh>
    </group>
  );
}
// Washington Square Arch: a memorial arch, not a museum block — two piers and
// a lintel with a darker inset hinting the archway, since the data's "museum"
// kind was a placeholder rather than a real fit.
function WashingtonSquareArch({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * r * 0.55, r * 0.7, 0]} scale={[r * 0.32, r * 1.4, r * 0.5]}>
          <boxGeometry />
          <meshStandardMaterial color="#e7e2d3" />
        </mesh>
      ))}
      <mesh position={[0, r * 1.5, 0]} scale={[r * 1.5, r * 0.3, r * 0.5]}>
        <boxGeometry />
        <meshStandardMaterial color="#e7e2d3" />
      </mesh>
      <mesh position={[0, r * 0.75, 0]} scale={[r * 0.7, r * 1.2, r * 0.3]}>
        <boxGeometry />
        <meshStandardMaterial color="#cfd6c9" />
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
      {/* Portico columns, so it reads as a state building rather than a plain
          block — Buckingham Palace is the only palace-kind landmark, so this
          is the generic renderer rather than a bespoke override. */}
      {[-0.5, -0.17, 0.17, 0.5].map((cx, i) => (
        <mesh key={i} position={[cx * r * 1.6, r * 0.34, r * 0.62]} scale={[0.14, r * 0.6, 0.14]}>
          <boxGeometry />
          <meshStandardMaterial color="#efe6d2" />
        </mesh>
      ))}
      <mesh position={[0, r * 0.78, 0]} scale={[r * 2.5, r * 0.12, r * 1.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#a9a08a" />
      </mesh>
      <mesh position={[0, r * 1.05, 0]} scale={[0.06, r * 0.36, 0.06]}>
        <boxGeometry />
        <meshStandardMaterial color="#8a7f6a" />
      </mesh>
      <mesh position={[r * 0.16, r * 1.2, 0]} scale={[r * 0.28, r * 0.16, 0.02]}>
        <boxGeometry />
        <meshStandardMaterial color="#c94c3f" />
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
        <cylinderGeometry
          args={[r * 0.7, r * 0.7, r * 2, 12, 1, false, 0, Math.PI]}
        />
        <meshStandardMaterial
          color="#8fa9b3"
          metalness={0.3}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, r * 0.5, r * 0.71]}>
        <cylinderGeometry args={[r * 0.16, r * 0.16, 0.06, 16]} />
        <meshStandardMaterial color="#f2ecdb" />
      </mesh>
    </group>
  );
}
// Battersea Power Station: a long brick block with its four white chimneys —
// the previous generic train-shed shape was a poor fit for a power station,
// so this replaces it entirely.
function Battersea({ landmark }: { landmark: CityLandmark }) {
  const r = landmark.radius;
  const chimneyH = r * 2.2;
  return (
    <group position={[landmark.x, GROUND, landmark.z]}>
      <mesh position={[0, r * 0.5, 0]} scale={[r * 2.1, r, r * 1.3]}>
        <boxGeometry />
        <meshStandardMaterial color="#b5735a" />
      </mesh>
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * r * 0.78, chimneyH / 2, sz * r * 0.5]} scale={[r * 0.16, chimneyH, r * 0.16]}>
          <boxGeometry />
          <meshStandardMaterial color="#e9e4da" />
        </mesh>
      ))}
    </group>
  );
}
// Landmarks whose real shape doesn't match the shared per-kind template
// closely enough, keyed by id and checked before the kind switch below.
const BESPOKE: Record<string, typeof Wheel> = {
  "tower-bridge": TowerBridge,
  "brooklyn-bridge": SuspensionBridge,
  "st-pauls": StPauls,
  greenwich: Greenwich,
  gherkin: Gherkin,
  "canary-wharf": CanaryWharf,
  battersea: Battersea,
  "tate-modern": TateModern,
  wembley: Wembley,
  "empire-state": EmpireState,
  chrysler: Chrysler,
  "one-wtc": OneWtc,
  "washington-square": WashingtonSquareArch,
};
// How each real park is actually shaped: its defining water body (as a
// fraction of the park's own half-width/half-depth) and how its trees are
// arranged, so four "park" landmarks read as four different parks rather than
// one lawn template repeated.
const PARK_STYLES: Record<
  string,
  {
    ponds?: { ox: number; oz: number; rx: number; rz: number; rotation?: number }[];
    treeStyle?: "cluster";
    clusterSide?: -1 | 1;
    density?: number;
  }
> = {
  // The Serpentine, cutting diagonally across the southern half.
  "hyde-park": {
    ponds: [{ ox: -0.05, oz: 0.28, rx: 0.42, rz: 0.13, rotation: 0.5 }],
  },
  // The Boating Lake, off-centre toward the south-west.
  "regents-park": {
    ponds: [{ ox: -0.22, oz: 0.2, rx: 0.24, rz: 0.2 }],
  },
  // The Reservoir in the upper third and the Lake below it, on the strip's
  // long north-south axis — and fewer trees overall, since the real park is
  // mostly open meadow between them.
  "central-park": {
    ponds: [
      { ox: 0, oz: -0.34, rx: 0.58, rz: 0.12 },
      { ox: -0.15, oz: 0.14, rx: 0.3, rz: 0.09 },
    ],
    density: 0.55,
  },
  // Prospect Park Lake at the south end, with the wooded Ravine clustered on
  // one side rather than a border of trees all the way round.
  "prospect-park": {
    ponds: [{ ox: 0.1, oz: 0.32, rx: 0.32, rz: 0.16 }],
    treeStyle: "cluster",
    clusterSide: 1,
  },
};
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
  const [showAllLabels, setShowAllLabels] = useState(false);
  const labelDetail = useRef(false);
  useFrame(({ camera }) => {
    const detailed = camera.zoom >= 7.2;
    if (detailed !== labelDetail.current) {
      labelDetail.current = detailed;
      setShowAllLabels(detailed);
    }
  });
  const greens = useMemo(() => {
    const lawns: Part[] = [],
      crowns: Part[] = [],
      trunks: Part[] = [],
      paths: Part[] = [];
    for (const l of landmarks) {
      if (l.kind !== "park" && l.kind !== "greenway") continue;
      const w = l.width ?? l.radius * 2,
        d = l.depth ?? l.radius * 2;
      lawns.push({
        position: [l.x, 1.12, l.z],
        scale: [w, 0.15, d],
        color: season === "winter" ? "#cdd6c4" : "#86bb78",
      });
      if (l.kind === "park") {
        // A crossing pair of paths, the one cue every real park shares.
        const diag = Math.hypot(w, d) * 0.92;
        const angle = Math.atan2(d, w);
        paths.push(
          {
            position: [l.x, 1.13, l.z],
            scale: [diag, 0.06, 1.1],
            rotation: angle,
            color: "#e6d7bd",
          },
          {
            position: [l.x, 1.13, l.z],
            scale: [diag, 0.06, 1.1],
            rotation: -angle,
            color: "#e6d7bd",
          },
        );
      }
      const style = PARK_STYLES[l.id];
      const rows = Math.max(2, Math.round((d / 6) * (style?.density ?? 1)));
      if (style?.treeStyle === "cluster") {
        const side = style.clusterSide ?? 1;
        for (let col = 0; col < 2; col++) {
          const x = l.x + side * (w / 2 - 1.4 - col * 2.6);
          for (let i = 0; i < rows; i++) {
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
      } else {
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
    }
    return { lawns, crowns, trunks, paths };
  }, [landmarks, season, palette]);
  const ponds = useMemo(() => {
    const items: {
      key: string;
      x: number;
      z: number;
      rx: number;
      rz: number;
      rotation: number;
    }[] = [];
    for (const l of landmarks) {
      const style = PARK_STYLES[l.id];
      if (l.kind !== "park" || !style?.ponds) continue;
      const w = l.width ?? l.radius * 2,
        d = l.depth ?? l.radius * 2;
      style.ponds.forEach((p, i) => {
        items.push({
          key: `${l.id}-pond-${i}`,
          x: l.x + p.ox * (w / 2),
          z: l.z + p.oz * (d / 2),
          rx: p.rx * (w / 2),
          rz: p.rz * (d / 2),
          rotation: p.rotation ?? 0,
        });
      });
    }
    return items;
  }, [landmarks]);
  return (
    <group>
      <Boxes parts={greens.lawns} />
      <Boxes parts={greens.paths} />
      <Boxes parts={greens.trunks} geometry={cylinder} color="#7d6047" />
      <Boxes parts={greens.crowns} geometry={treeGeometry} />
      {ponds.map((p) => (
        <group key={p.key} position={[p.x, 1.14, p.z]} rotation={[0, p.rotation, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[p.rx, p.rz, 1]}>
            <circleGeometry args={[1, 22]} />
            <meshStandardMaterial color={palette.water} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {landmarks.map((l) => {
        // The company's own building already stands here; a second unrelated
        // shape on top of it would just overlap.
        if (l.ticker) return null;
        const Bespoke = BESPOKE[l.id];
        if (Bespoke) return <Bespoke key={l.id} landmark={l} />;
        switch (l.kind) {
          case "wheel":
            return <Wheel key={l.id} landmark={l} />;
          case "bridge":
            return <SuspensionBridge key={l.id} landmark={l} />;
          case "statue":
            return <Statue key={l.id} landmark={l} />;
          case "dome":
            return <TentDome key={l.id} landmark={l} />;
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
      {/* Only landmarks that identify a sector get a label at all: a
          functional cue for wayfinding, not decoration. A landmark standing
          in for a company (ticker set) has no mesh here to label, and every
          other decorative landmark relies on its own shape to be
          recognizable. Among those, the smaller ones stay hidden until the
          user zooms in enough to tell them apart from their surrounding
          streets, so the overview stays legible. */}
      {labels &&
        landmarks
          .filter((l) => l.sector && l.radius >= (showAllLabels ? 4 : 7))
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
