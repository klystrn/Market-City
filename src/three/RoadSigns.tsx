import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cityStreets } from "@/domain/geography";
export default function RoadSigns({
  focusedSector,
}: {
  focusedSector: string | null;
}) {
  const [visible, setVisible] = useState(false);
  useFrame(({ camera }) => {
    const close = camera.zoom >= 17;
    if (close !== visible) setVisible(close);
  });
  const signs = useMemo(
    () =>
      cityStreets().map((street) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#234e54";
        ctx.fillRect(0, 0, 512, 128);
        ctx.strokeStyle = "#d7eae2";
        ctx.lineWidth = 5;
        ctx.strokeRect(6, 6, 500, 116);
        let font = 45;
        ctx.font = "600 " + font + "px Arial";
        while (ctx.measureText(street.name).width > 474) {
          font--;
          ctx.font = "600 " + font + "px Arial";
        }
        ctx.fillStyle = "#f8f3dc";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(street.name, 256, 65);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return { street, texture };
      }),
    [],
  );
  useEffect(() => () => signs.forEach((s) => s.texture.dispose()), [signs]);
  return (
    <group visible={visible}>
      {signs
        .filter(
          ({ street }) => !focusedSector || street.sector === focusedSector,
        )
        .map(({ street, texture }) => (
          <group
            key={street.id}
            position={[street.start[0] - 1, 1.1, street.z + 2.1]}
          >
            <mesh position={[0, 1.3, 0]}>
              <cylinderGeometry args={[0.07, 0.1, 2.6, 8]} />
              <meshStandardMaterial color="#566f79" />
            </mesh>
            {[0, Math.PI].map((rotation) => (
              <mesh
                key={rotation}
                position={[0, 2.5, rotation ? -0.045 : 0.045]}
                rotation={[0, rotation, 0]}
              >
                <planeGeometry args={[5.6, 1.4]} />
                <meshBasicMaterial map={texture} />
              </mesh>
            ))}
          </group>
        ))}
    </group>
  );
}
