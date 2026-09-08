import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { isEarthquake, isFire } from "@/domain/simulation";
import type { Plot, Snapshot } from "@/domain/types";
export default function MarketDisasters({
  snapshot,
  plots,
  reduced,
  enabled,
}: {
  snapshot: Snapshot;
  plots: Plot[];
  reduced: boolean;
  enabled: boolean;
}) {
  const flames = useRef<THREE.Group>(null),
    elapsed = useRef(0),
    shaking = useRef(0);
  const { invalidate } = useThree();
  const quake = enabled && isEarthquake(snapshot.market.indexChange);
  useEffect(() => {
    shaking.current = quake && !reduced ? 2.8 : 0;
    invalidate();
  }, [quake, reduced, invalidate]);
  useFrame(({ camera }, dt) => {
    elapsed.current += Math.min(dt, 0.05);
    if (!reduced && enabled && flames.current?.children.length) {
      flames.current.children.forEach((g, i) => {
        g.scale.y = 1 + 0.16 * Math.sin(elapsed.current * 9 + i);
      });
      invalidate();
    }
    // Brief rotational tremor; OrbitControls restores the view each frame. No accumulating pan.
    if (shaking.current > 0) {
      shaking.current = Math.max(0, shaking.current - Math.min(dt, 0.05));
      camera.rotateZ(
        Math.sin(elapsed.current * 42) * 0.0025 * Math.min(1, shaking.current),
      );
      invalidate();
    }
  }, 0);
  if (!enabled) return null;
  const affected = plots.filter((p) =>
    isFire(
      snapshot.companies.find((c) => c.ticker === p.ticker)?.changePercent ?? 0,
    ),
  );
  return (
    <group ref={flames}>
      {affected.map((p) => (
        <group key={p.ticker} position={[p.x, p.height + 1.1, p.z]}>
          {[0, 1, 2].map((i) => (
            <group key={i} position={[(i - 1) * p.width * 0.22, 0, 0]}>
              <mesh position={[0, 2, 0]}>
                <coneGeometry args={[1.15, 4.5, 5]} />
                <meshBasicMaterial color="#ff702b" />
              </mesh>
              <mesh position={[0, 1.3, 0.5]}>
                <coneGeometry args={[0.6, 2.8, 5]} />
                <meshBasicMaterial color="#ffe181" />
              </mesh>
              <mesh position={[0.7, 5.3 + i, 0]}>
                <icosahedronGeometry args={[1.1 + i * 0.2, 0]} />
                <meshStandardMaterial
                  color="#747e82"
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
