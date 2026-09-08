import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Company, Plot } from "@/domain/types";
import { historicalVolatility } from "@/domain/analytics";
const ring = new THREE.RingGeometry(0.86, 1, 40);
// A thin ground ring around each building, wider and more saturated for
// companies with higher trailing daily-return volatility. Purely descriptive.
export default function VolatilityHalos({
  plots,
  companies,
  dark,
}: {
  plots: Plot[];
  companies: Company[];
  dark: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const lookup = useMemo(
    () => new Map(companies.map((c) => [c.ticker, c])),
    [companies],
  );
  const sigmas = useMemo(
    () =>
      plots.map((p) => {
        const c = lookup.get(p.ticker);
        return c ? historicalVolatility(c) : 0.01;
      }),
    [plots, lookup],
  );
  const maxSigma = Math.max(0.01, ...sigmas);
  useEffect(() => {
    if (!mesh.current) return;
    const object = new THREE.Object3D();
    plots.forEach((p, i) => {
      const radius = Math.max(p.width, p.depth) * 0.62;
      const scale = radius * (1 + (sigmas[i] / maxSigma) * 0.7);
      object.position.set(p.x, 1.14, p.z);
      object.rotation.set(-Math.PI / 2, 0, 0);
      object.scale.set(scale, scale, scale);
      object.updateMatrix();
      mesh.current!.setMatrixAt(i, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
    invalidate();
  }, [plots, sigmas, maxSigma, invalidate]);
  useEffect(() => {
    if (!mesh.current) return;
    const color = new THREE.Color();
    const warm = new THREE.Color(dark ? "#e3a04b" : "#c8722f");
    const calm = new THREE.Color(dark ? "#2c3a35" : "#dfe4d6");
    plots.forEach((_, i) => {
      const intensity = sigmas[i] / maxSigma;
      color.copy(calm).lerp(warm, intensity);
      mesh.current!.setColorAt(i, color);
    });
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
    invalidate();
  }, [plots, sigmas, maxSigma, dark, invalidate]);
  return (
    <instancedMesh
      ref={mesh}
      args={[ring, undefined, plots.length]}
      frustumCulled={false}
    >
      <meshBasicMaterial
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
