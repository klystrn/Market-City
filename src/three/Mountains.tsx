import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { seasonPalette, type Season } from "@/domain/seasons";
// A triangulated ridge field: irregular spurs, exposed rock and elevation-based snow.
// All peaks are inland, well beyond the urban districts.
function nativeMountainHeight(x: number, z: number) {
  const dx = x + 242,
    dz = z + 222,
    r = Math.hypot(dx, dz),
    angle = Math.atan2(dz, dx);
  // Fuji's broad, nearly symmetric stratovolcano: a small crater rim, long
  // continuous slopes and subtle radial gullies, rather than competing peaks.
  const slope = Math.max(0, 1 - r / 96);
  let height = Math.min(80, 85 * Math.pow(slope, 1.12));
  if (r < 6) height = 75 + r * 0.8;
  height += Math.sin(angle * 13) * slope * (1 - slope) * 3;
  const peaks = [
    [-307, -175, 19, 57],
    [-172, -266, 17, 53],
    [-295, -297, 15, 55],
  ];
  for (const [px, pz, h, r] of peaks) {
    const dx = x - px,
      dz = z - pz,
      a = Math.atan2(dz, dx);
    const radius = r * (1 + 0.14 * Math.sin(a * 5 + px));
    const slope = Math.max(0, 1 - Math.hypot(dx, dz) / radius);
    height = Math.max(
      height,
      h * Math.pow(slope, 1.4) * (1 + 0.09 * Math.sin(x * 0.37 + z * 0.23)),
    );
  }
  return height;
}
export function mountainHeight(x: number, z: number) {
  return nativeMountainHeight((x + 5) / 0.55, (z - 25) / 0.55) * 0.55;
}
export default function Mountains({ season }: { season: Season }) {
  const geometry = useMemo(() => {
    const vertices: number[] = [],
      colors: number[] = [],
      palette = seasonPalette[season],
      tint = new THREE.Color();
    const point = (x: number, z: number): [number, number, number] => {
      const px = x + Math.sin(x * 17 + z * 9) * 0.8,
        pz = z + Math.cos(x * 11 - z * 7) * 0.8;
      return [px, 1 + nativeMountainHeight(px, pz), pz];
    };
    for (let x = -365; x < -108; x += 3)
      for (let z = -365; z < -125; z += 3) {
        const a = point(x, z),
          b = point(x + 3, z),
          c = point(x, z + 3),
          d = point(x + 3, z + 3);
        for (const tri of [
          [a, c, b],
          [b, c, d],
        ]) {
          const y = tri.reduce((sum, p) => sum + p[1], 0) / 3;
          if (y < 1.08) continue;
          const snow =
            y > 83 * palette.snowLine + Math.sin(x * 0.17 + z * 0.19) * 4;
          const rock = y > 18;
          tint.set(
            snow
              ? "#f2f7fa"
              : rock
                ? "#777b87"
                : y > 8
                  ? palette.evergreen
                  : palette.ground,
          );
          tint.multiplyScalar(
            0.96 + 0.05 * (0.5 + 0.5 * Math.sin(x * 1.2 + z * 0.9)),
          );
          for (const p of tri) {
            vertices.push(...p);
            colors.push(tint.r, tint.g, tint.b);
          }
        }
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [season]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} scale={[0.55, 0.55, 0.55]} position={[-5, 0, 25]}>
      <meshStandardMaterial vertexColors roughness={1} flatShading />
    </mesh>
  );
}
