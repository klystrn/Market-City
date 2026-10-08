import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Plot } from "@/domain/types";
import { sunAt, viewAzimuth } from "@/domain/sun";

// The city's one directional light, placed by the simulated clock, and the
// shadows it casts. Shadows are the cheapest single cue that a model is a
// place: they sit buildings on the ground and give the streets depth.
//
// What casts is decided here rather than on every mesh: anything opaque casts
// and receives; anything translucent — volatility halos, mass columns, trails,
// glows — does neither, because those are overlays that measure something and
// a shadow would make them look like objects. A mesh can opt out explicitly
// with `userData.noShadow`.
const DISTANCE = 420;

function markCasters(scene: THREE.Object3D) {
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    const opaque = materials.every(
      (m) => m && !m.transparent && m.opacity >= 1,
    );
    const cast = opaque && !mesh.userData.noShadow;
    mesh.castShadow = cast;
    mesh.receiveShadow = cast;
  });
}

export default function SunLight({
  minute,
  night,
  plots,
  cameraOffset,
  shadows,
  mapSize,
}: {
  /** Simulated minutes since midnight ET. */
  minute: number;
  night: boolean;
  plots: Plot[];
  /** The city's opening camera offset; the sun is placed relative to it. */
  cameraOffset: [number, number, number];
  shadows: boolean;
  mapSize: number;
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  const { scene, invalidate } = useThree();
  // The shadow camera covers the built city and no more: every texel spent on
  // open sea or distant mountains is one not spent on a street.
  const frame = useMemo(() => {
    if (!plots.length) return { x: 0, z: 0, radius: 120 };
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    for (const p of plots) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z);
      maxZ = Math.max(maxZ, p.z);
    }
    return {
      x: (minX + maxX) / 2,
      z: (minZ + maxZ) / 2,
      radius: Math.hypot(maxX - minX, maxZ - minZ) / 2 + 24,
    };
  }, [plots]);
  const sun = sunAt(minute, viewAzimuth(cameraOffset));
  // After the close the light is the moon: dim, blue, from low on the other
  // side, and casting nothing.
  const direction: [number, number, number] = night
    ? [
        Math.cos(viewAzimuth(cameraOffset) - 0.9) * 0.95,
        0.32,
        Math.sin(viewAzimuth(cameraOffset) - 0.9) * 0.95,
      ]
    : sun.direction;
  const casting = shadows && !night && sun.up;
  // Lower sun, warmer light: the colour shifts toward amber near the ends of
  // the day, which is most of what makes a low sun read as late.
  const low = 1 - Math.sin(sun.progress * Math.PI);
  const color = night
    ? "#6f86b8"
    : new THREE.Color("#fff3dc").lerp(new THREE.Color("#ffc98f"), low * 0.7);
  const intensity = night ? 0.34 : 2.6 - low * 0.4;

  useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.target.position.set(frame.x, 0, frame.z);
    l.target.updateMatrixWorld();
    const cam = l.shadow.camera;
    cam.left = -frame.radius;
    cam.right = frame.radius;
    cam.top = frame.radius;
    cam.bottom = -frame.radius;
    cam.near = 1;
    cam.far = DISTANCE + frame.radius * 2;
    cam.updateProjectionMatrix();
    invalidate();
  }, [frame, invalidate]);
  useEffect(() => {
    const l = light.current;
    if (!l || l.shadow.mapSize.x === mapSize) return;
    l.shadow.mapSize.set(mapSize, mapSize);
    // The render target is sized on first use; drop it so the next frame
    // allocates one at the new size.
    l.shadow.map?.dispose();
    l.shadow.map = null;
    invalidate();
  }, [mapSize, invalidate]);
  // Meshes mount and unmount as layers toggle, so re-mark on a slow timer
  // rather than requiring every component to remember the rule.
  useEffect(() => {
    if (!casting) return;
    markCasters(scene);
    invalidate();
    const timer = setInterval(() => markCasters(scene), 1500);
    return () => clearInterval(timer);
  }, [casting, scene, invalidate]);

  return (
    <directionalLight
      ref={light}
      position={[
        frame.x + direction[0] * DISTANCE,
        direction[1] * DISTANCE,
        frame.z + direction[2] * DISTANCE,
      ]}
      intensity={intensity}
      color={color}
      castShadow={casting}
      shadow-bias={-0.0004}
      shadow-normalBias={0.35}
    />
  );
}
