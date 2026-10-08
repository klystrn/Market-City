import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CityDefinition } from "@/domain/cities/types";
import type { Plot } from "@/domain/types";
import {
  boatRoutes,
  cloudCount,
  pavements,
  walkers,
} from "@/domain/street-life";
import { FABRIC_COLORS } from "./palette-fabric";

// People, boats and passing cloud shade. See src/domain/street-life.ts for
// what this may and may not mean; this file only draws and animates it.
//
// Everything moves only while someone is using the map and motion is allowed.
// Otherwise it holds still where it is rather than vanishing, so the city does
// not empty out the moment the reader stops to look at it.
const GROUND = 1.04;
const box = new THREE.BoxGeometry(1, 1, 1);
const head = new THREE.SphereGeometry(0.5, 6, 5);
const cloudPuff = new THREE.IcosahedronGeometry(1, 0);
const MAX_WALKERS = 420;
const MAX_BOATS = 20;
// Where the water surface stands in each kind of city, matching the terrain
// renderers: London's Thames is a thin slab over the land, New York's sea a
// plane below it, Tokyo's bay a shallow slab between the two.
function waterLevel(city: CityDefinition) {
  return city.surround === "land" ? 1.16 : city.bespokeTerrain ? -0.3 : -0.62;
}

export default function StreetLife({
  city,
  plots,
  sky,
  moving,
  night,
}: {
  city: CityDefinition;
  plots: Plot[];
  /** The weather the header reports; clouds follow it. */
  sky: string;
  /** Whether anything should animate this frame. */
  moving: boolean;
  night: boolean;
}) {
  const { invalidate } = useThree();
  const sea = waterLevel(city);
  const walks = useMemo(() => pavements(city.roads(plots)), [city, plots]);
  // Fewer people about after the close, as in any business district.
  const people = useMemo(
    () => walkers(walks, night ? MAX_WALKERS / 3 : MAX_WALKERS),
    [walks, night],
  );
  const routes = useMemo(
    () => boatRoutes(city.land, city.water, city.surround, MAX_BOATS),
    [city],
  );
  const clouds = useMemo(() => {
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
    if (!plots.length) minX = maxX = minZ = maxZ = 0;
    const span = Math.max(maxX - minX, maxZ - minZ) + 120;
    return Array.from({ length: cloudCount(sky) }, (_, i) => {
      const r = (k: number) => {
        const x = Math.sin((i * 7 + k) * 12.9898) * 43758.5453;
        return x - Math.floor(x);
      };
      return {
        x: (minX + maxX) / 2 - span / 2 + r(1) * span,
        z: (minZ + maxZ) / 2 - span / 2 + r(2) * span,
        size: 9 + r(3) * 12,
        span,
        cx: (minX + maxX) / 2,
        seed: i,
      };
    });
  }, [plots, sky]);

  const bodies = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  const hulls = useRef<THREE.InstancedMesh>(null);
  const decks = useRef<THREE.InstancedMesh>(null);
  const wakes = useRef<THREE.InstancedMesh>(null);
  const puffs = useRef<THREE.InstancedMesh>(null);
  const elapsed = useRef(0);
  const object = useMemo(() => new THREE.Object3D(), []);

  // Colours are fixed per instance, so they are written once rather than
  // every frame.
  useEffect(() => {
    const tint = new THREE.Color();
    const clothes = FABRIC_COLORS.clothes;
    people.forEach((p, i) => {
      bodies.current?.setColorAt(i, tint.set(clothes[p.seed % clothes.length]));
      heads.current?.setColorAt(i, tint.set(p.seed % 3 ? "#e8c7a4" : "#a9785a"));
    });
    routes.forEach((r, i) => {
      const hull =
        r.kind === "ferry"
          ? FABRIC_COLORS.hulls[0]
          : FABRIC_COLORS.hulls[(r.seed % (FABRIC_COLORS.hulls.length - 1)) + 1];
      hulls.current?.setColorAt(i, tint.set(hull));
      decks.current?.setColorAt(
        i,
        tint.set(r.kind === "barge" ? "#a38563" : "#f3f1ea"),
      );
    });
    for (const mesh of [bodies, heads, hulls, decks])
      if (mesh.current?.instanceColor)
        mesh.current.instanceColor.needsUpdate = true;
    invalidate();
  }, [people, routes, bodies, heads, invalidate]);

  const place = (
    mesh: THREE.InstancedMesh | null,
    i: number,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    rotation = 0,
  ) => {
    if (!mesh) return;
    object.position.set(x, y, z);
    object.rotation.set(0, rotation, 0);
    object.scale.set(sx, sy, sz);
    object.updateMatrix();
    mesh.setMatrixAt(i, object.matrix);
  };

  const pose = (time: number) => {
    people.forEach((p, i) => {
      const w = walks[p.walk];
      // Walk to the end of the pavement and back again, at a steady pace.
      const travel = Math.abs(p.speed) * time + p.start * w.length;
      const leg = travel % (w.length * 2);
      let t = leg < w.length ? leg / w.length : 2 - leg / w.length;
      if (p.speed < 0) t = 1 - t;
      const x = w.a[0] + (w.b[0] - w.a[0]) * t,
        z = w.a[1] + (w.b[1] - w.a[1]) * t;
      // A small bob makes a dot read as someone walking.
      const bob = Math.abs(Math.sin(time * 6 + p.seed)) * 0.04;
      // Drawn larger than true scale, as city-builders draw people: at true
      // scale a person is a pixel and the pavements read as empty.
      place(bodies.current, i, x, GROUND + 0.33 + bob, z, 0.28, 0.54, 0.2);
      place(heads.current, i, x, GROUND + 0.72 + bob, z, 0.24, 0.24, 0.24);
    });
    routes.forEach((r, i) => {
      // Ferries shuttle between their two landings, easing in and out.
      const period = r.length / (r.kind === "launch" ? 3.2 : 1.6);
      const phase = ((time / period + r.seed * 0.37) % 2 + 2) % 2;
      const outbound = phase < 1;
      const s = outbound ? phase : 2 - phase;
      const t = 0.5 - Math.cos(s * Math.PI) / 2;
      const x = r.a[0] + (r.b[0] - r.a[0]) * t,
        z = r.a[1] + (r.b[1] - r.a[1]) * t;
      const heading =
        -Math.atan2(r.b[1] - r.a[1], r.b[0] - r.a[0]) + (outbound ? 0 : Math.PI);
      const size = r.kind === "launch" ? 0.6 : r.kind === "barge" ? 1.15 : 1;
      place(hulls.current, i, x, sea + 0.2, z, 3.2 * size, 0.5, 1.2 * size, heading);
      place(
        decks.current,
        i,
        x,
        sea + (r.kind === "barge" ? 0.58 : 0.66),
        z,
        (r.kind === "barge" ? 2.3 : 1.5) * size,
        r.kind === "barge" ? 0.3 : 0.55,
        0.85 * size,
        heading,
      );
      // The wake trails behind and only shows while the boat is under way.
      const speed = Math.sin(s * Math.PI);
      const back = outbound ? -1 : 1;
      const dx = ((r.b[0] - r.a[0]) / r.length) * back,
        dz = ((r.b[1] - r.a[1]) / r.length) * back;
      place(
        wakes.current,
        i,
        x + dx * (2 + speed * 2.4),
        sea + 0.02,
        z + dz * (2 + speed * 2.4),
        0.4 + speed * 5 * size,
        0.04,
        0.9 * size,
        heading,
      );
    });
    clouds.forEach((c, i) => {
      // Drift slowly across the city on one wind, wrapping round.
      const x =
        ((c.x + time * 1.1 - (c.cx - c.span / 2)) % c.span) + (c.cx - c.span / 2);
      place(puffs.current, i * 3, x, 70, c.z, c.size, c.size * 0.35, c.size * 0.7);
      place(puffs.current, i * 3 + 1, x + c.size * 0.8, 70, c.z + 2, c.size * 0.7, c.size * 0.3, c.size * 0.55);
      place(puffs.current, i * 3 + 2, x - c.size * 0.7, 70, c.z - 1.5, c.size * 0.6, c.size * 0.28, c.size * 0.5);
    });
    for (const mesh of [bodies, heads, hulls, decks, wakes, puffs])
      if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true;
  };

  // Lay everything out once so a still city is still populated.
  useEffect(() => {
    pose(elapsed.current);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pose reads the memoised layouts listed here.
  }, [people, routes, clouds, walks, invalidate]);
  useFrame((_, delta) => {
    if (!moving) return;
    elapsed.current += Math.min(delta, 0.1);
    pose(elapsed.current);
    invalidate();
  });

  return (
    <group>
      <instancedMesh
        ref={bodies}
        args={[box, undefined, people.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={heads}
        args={[head, undefined, people.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={hulls}
        args={[box, undefined, routes.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      <instancedMesh
        ref={decks}
        args={[box, undefined, routes.length]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <instancedMesh
        ref={wakes}
        args={[box, undefined, routes.length]}
        frustumCulled={false}
        userData={{ noShadow: true }}
      >
        <meshBasicMaterial color="#eef6f6" transparent opacity={0.7} />
      </instancedMesh>
      {/* Clouds are drawn only into the shadow map. Visible, they would sit
          between an overhead camera and the buildings it is there to show;
          as shade alone they pass over the city without hiding any of it. */}
      <instancedMesh
        ref={puffs}
        args={[cloudPuff, undefined, clouds.length * 3]}
        frustumCulled={false}
        castShadow
        userData={{ cloud: true }}
      >
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
