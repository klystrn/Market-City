import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { Point } from "@/domain/geography";
export type Part = {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: number;
  color?: string;
};
export const box = new THREE.BoxGeometry(1, 1, 1);
export const treeGeometry = new THREE.IcosahedronGeometry(1, 1);
export const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
export function Boxes({
  parts,
  color = "#ffffff",
  geometry = box,
}: {
  parts: Part[];
  color?: string;
  geometry?: THREE.BufferGeometry;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  useEffect(() => {
    if (!mesh.current) return;
    const object = new THREE.Object3D(),
      tint = new THREE.Color();
    parts.forEach((p, i) => {
      object.position.set(...p.position);
      object.scale.set(...p.scale);
      object.rotation.set(0, p.rotation ?? 0, 0);
      object.updateMatrix();
      mesh.current!.setMatrixAt(i, object.matrix);
      mesh.current!.setColorAt(i, tint.set(p.color ?? color));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
    invalidate();
  }, [parts, color, invalidate]);
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, parts.length]}>
      <meshStandardMaterial roughness={0.86} />
    </instancedMesh>
  );
}
export function landGeometry(points: Point[], depth: number) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], i) =>
    i === 0 ? shape.moveTo(x, -z) : shape.lineTo(x, -z),
  );
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    steps: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
export function segment(
  a: Point,
  b: Point,
  width: number,
  height: number,
  y: number,
): Part {
  return {
    position: [(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2],
    scale: [width, height, Math.hypot(b[0] - a[0], b[1] - a[1])],
    rotation: Math.atan2(b[0] - a[0], b[1] - a[1]),
  };
}
