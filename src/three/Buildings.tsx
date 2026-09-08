import { useEffect, useMemo, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { Company, Plot } from "@/domain/types";
import { performanceColor } from "@/domain/city";
type MaterialKind =
  | "towerGlass"
  | "taperGlass"
  | "wall"
  | "trim"
  | "glass"
  | "roof"
  | "equipment"
  | "shadow"
  | "drum"
  | "drumTrim";
interface Piece {
  rotation?: number;
  ticker: string;
  position: [number, number, number];
  scale: [number, number, number];
}
const box = new THREE.BoxGeometry(1, 1, 1);
const taper = new THREE.CylinderGeometry(0.24, 0.5, 1, 8);
const drum = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
function architecture(plots: Plot[]) {
  const pieces: Record<MaterialKind, Piece[]> = {
    towerGlass: [],
    taperGlass: [],
    wall: [],
    trim: [],
    glass: [],
    roof: [],
    equipment: [],
    shadow: [],
    drum: [],
    drumTrim: [],
  };
  for (const p of plots) {
    const ground = 1.1;
    const put = (
      kind: MaterialKind,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      rotation = 0,
    ) =>
      pieces[kind].push({
        ticker: p.ticker,
        rotation,
        position: [p.x + x, ground + y, p.z + z],
        scale: [w, h, d],
      });
    const block = (
      x: number,
      z: number,
      w: number,
      d: number,
      height: number,
      bottom = 0,
    ) => {
      if (["MSFT", "META", "TSLA", "GOOGL"].includes(p.ticker)) {
        put("towerGlass", x, bottom + height / 2, z, w, height, d);
        put("wall", x, bottom + 0.2, z, w + 0.03, 0.4, d + 0.03);
        put("wall", x, bottom + height, z, w + 0.04, 0.18, d + 0.04);
        for (const side of [-1, 1]) {
          put(
            "trim",
            x + (side * w) / 2,
            bottom + height / 2,
            z,
            0.07,
            height,
            d + 0.04,
          );
          put(
            "trim",
            x,
            bottom + height / 2,
            z + (side * d) / 2,
            w,
            0.06,
            0.08,
          );
          for (let y = 2; y < height; y += 3)
            put(
              "glass",
              x,
              bottom + y,
              z + side * (d / 2 + 0.01),
              w,
              0.035,
              0.025,
            );
        }
        return;
      }
      put("wall", x, bottom + height / 2, z, w, height, d);
      put("roof", x, bottom + height + 0.07, z, w + 0.12, 0.14, d + 0.12);
      // Roof parapets and a shallow cornice give the mass a legible architectural edge.
      for (const side of [-1, 1]) {
        put(
          "trim",
          x + (side * w) / 2,
          bottom + height + 0.25,
          z,
          0.14,
          0.45,
          d + 0.14,
        );
        put(
          "trim",
          x,
          bottom + height + 0.25,
          z + (side * d) / 2,
          w,
          0.45,
          0.14,
        );
      }
      const floors = Math.max(1, Math.min(8, Math.floor(height / 1.55))),
        columns = Math.max(2, Math.min(5, Math.floor(w / 0.95))),
        sideCols = Math.max(2, Math.min(4, Math.floor(d / 0.95)));
      for (let row = 0; row < floors; row++) {
        const y = bottom + 0.65 + ((row + 0.5) * (height - 0.8)) / floors;
        for (let col = 0; col < columns; col++) {
          const wx = x + ((col - (columns - 1) / 2) * w) / (columns + 0.4),
            windowW = (w / (columns + 0.4)) * 0.56;
          for (const side of [-1, 1]) {
            put(
              "trim",
              wx,
              y,
              z + side * (d / 2 + 0.025),
              windowW + 0.12,
              0.85,
              0.06,
            );
            put(
              "glass",
              wx,
              y,
              z + side * (d / 2 + 0.064),
              windowW,
              0.7,
              0.025,
            );
          }
        }
        for (let col = 0; col < sideCols; col++) {
          const wz = z + ((col - (sideCols - 1) / 2) * d) / (sideCols + 0.4),
            windowD = (d / (sideCols + 0.4)) * 0.56;
          for (const side of [-1, 1]) {
            put(
              "trim",
              x + side * (w / 2 + 0.025),
              y,
              wz,
              0.06,
              0.85,
              windowD + 0.12,
            );
            put(
              "glass",
              x + side * (w / 2 + 0.064),
              y,
              wz,
              0.025,
              0.7,
              windowD,
            );
          }
        }
        if (p.variant === 0 || p.variant === 5) {
          put(
            "trim",
            x,
            bottom + ((row + 1) * height) / floors,
            z + d / 2 + 0.065,
            w + 0.08,
            0.1,
            0.12,
          );
          put(
            "trim",
            x + w / 2 + 0.065,
            bottom + ((row + 1) * height) / floors,
            z,
            0.12,
            0.1,
            d + 0.08,
          );
        }
      }
      // A restrained rooftop plant and service box, as in the supplied model references.
      put(
        "equipment",
        x - w * 0.2,
        bottom + height + 0.32,
        z - d * 0.15,
        Math.min(0.6, w * 0.22),
        0.4,
        Math.min(0.8, d * 0.3),
      );
      put(
        "equipment",
        x + w * 0.16,
        bottom + height + 0.3,
        z - d * 0.17,
        Math.min(0.45, w * 0.18),
        0.34,
        Math.min(0.65, d * 0.24),
      );
      put(
        "glass",
        x - w * 0.2,
        bottom + height + 0.53,
        z - d * 0.15,
        Math.min(0.35, w * 0.12),
        0.025,
        Math.min(0.45, d * 0.18),
      );
    };
    const { width: w, depth: d, height: h } = p;
    put(
      "shadow",
      h * 0.09,
      -0.006,
      -h * 0.09,
      w + h * 0.16,
      0.014,
      d + h * 0.16,
    );
    if (p.variant === 0) {
      // A continuous glazed shaft and thin exoskeleton, with performance-colored podium/crown.
      put("wall", 0, h * 0.06, 0, w, h * 0.12, d);
      put("towerGlass", 0, h * 0.56, 0, w * 0.86, h * 0.88, d * 0.84);
      for (const side of [-1, 1]) {
        put("trim", side * w * 0.43, h * 0.56, 0, 0.07, h * 0.88, d * 0.86);
        put(
          "trim",
          0,
          h * 0.56,
          side * d * 0.42,
          w * 0.88,
          h * 0.88 * 0.012,
          0.07,
        );
        for (let y = h * 0.2; y < h; y += 2.6)
          put("glass", 0, y, side * d * 0.425, w * 0.86, 0.045, 0.03);
      }
      put("wall", 0, h, 0, w * 0.9, 0.22, d * 0.88);
    } else if (p.variant === 3) {
      // Eight-sided taper evokes a crystalline financial spire without widening its plot.
      put("wall", 0, h * 0.05, 0, w, h * 0.1, d);
      put("taperGlass", 0, h * 0.55, 0, w * 0.96, h * 0.9, d * 0.96);
      put("trim", 0, h * 0.96, 0, 0.12, h * 0.08, 0.12);
    } else if (p.variant === 4) {
      // Rotating floor plates fit within the same stable lot at every angle.
      const side = Math.min(w, d) * 0.66;
      for (let i = 0; i < 8; i++) {
        const angle = i * 0.12;
        put("towerGlass", 0, ((i + 0.5) * h) / 8, 0, side, h / 8, side, angle);
        put(
          i % 3 === 0 ? "wall" : "trim",
          0,
          ((i + 1) * h) / 8,
          0,
          side + 0.02,
          0.08,
          side + 0.02,
          angle,
        );
      }
    } else if (p.variant === 6) {
      // Faceted oval office tower on a broad civic podium.
      block(0, 0, w, d, h * 0.18);
      put("drum", 0, h * 0.59, 0, w * 0.86, h * 0.82, d * 0.85);
      for (let y = h * 0.25; y < h; y += 1.3)
        put("drumTrim", 0, y, 0, w * 0.88, 0.06, d * 0.87);
      put("drumTrim", 0, h + 0.15, 0, w * 0.9, 0.3, d * 0.9);
    } else if (p.variant === 7) {
      // Twin towers sharing a low podium and an elevated skybridge.
      block(0, 0, w, d, h * 0.18);
      block(-w * 0.29, 0, w * 0.36, d * 0.82, h * 0.82, h * 0.18);
      block(w * 0.29, 0, w * 0.36, d * 0.82, h * 0.67, h * 0.18);
      put("glass", 0, h * 0.68, 0, w * 0.55, 0.65, d * 0.4);
    } else if (p.variant === 8) {
      // Art-deco setbacks culminate in a slender crown, contained in encoded height.
      block(0, 0, w, d, h * 0.5);
      block(0, 0, w * 0.76, d * 0.76, h * 0.24, h * 0.5);
      block(0, 0, w * 0.5, d * 0.52, h * 0.16, h * 0.74);
      put("trim", 0, h * 0.95, 0, w * 0.12, h * 0.1, d * 0.12);
    } else if (p.variant === 9) {
      // U-shaped courtyard campus with a tall rear wing.
      block(0, -d * 0.32, w, d * 0.36, h);
      block(-w * 0.34, d * 0.18, w * 0.32, d * 0.64, h * 0.62);
      block(w * 0.34, d * 0.18, w * 0.32, d * 0.64, h * 0.62);
    } else if (p.variant === 10) {
      // Cascading terraces lend the waterfront a different silhouette.
      for (let tier = 0; tier < 4; tier++)
        block(
          -w * tier * 0.065,
          -d * tier * 0.065,
          w * (1 - tier * 0.18),
          d * (1 - tier * 0.18),
          h * 0.25,
          tier * h * 0.25,
        );
    } else if (p.variant === 11) {
      // Slender slab over a generous entrance colonnade.
      for (const side of [-1, 1])
        put("trim", side * w * 0.35, h * 0.09, 0, w * 0.12, h * 0.18, d * 0.7);
      block(0, 0, w, d * 0.72, h * 0.82, h * 0.18);
      put("roof", 0, h * 0.19, 0, w, 0.2, d);
    } else if (p.variant === 1) {
      block(0, 0, w, d, h * 0.72);
      block(-w * 0.07, -d * 0.05, w * 0.72, d * 0.72, h * 0.28, h * 0.72 + 0.2);
    } else if (p.variant === 2) {
      block(-w * 0.15, 0, w * 0.7, d, h);
      block(w * 0.35, d * 0.16, w * 0.3, d * 0.68, h * 0.55);
    } else {
      block(0, 0, w, d, h);
    }
    // Entrance, canopy and ground-floor glazing are visible when the user approaches.
    put("trim", 0, 0.65, d / 2 + 0.075, Math.min(0.9, w * 0.3), 1.25, 0.09);
    put("glass", 0, 0.58, d / 2 + 0.13, Math.min(0.65, w * 0.22), 1.08, 0.035);
    put("roof", 0, 1.38, d / 2 + 0.38, Math.min(w * 0.62, 2.2), 0.14, 0.75);
    if (p.variant === 3 || p.variant === 4) {
      for (const side of [-1, 1])
        put("trim", side * (w / 2 - 0.12), h / 2, d / 2 + 0.075, 0.17, h, 0.15);
    }
  }
  return pieces;
}
interface Props {
  plots: Plot[];
  companies: Company[];
  dark: boolean;
  matches: string[] | null;
  focus: string | null;
  selected: string | null;
  onSelect: (ticker: string) => void;
  onExplore: (ticker: string) => void;
  onHover: (company: Company | null, x?: number, y?: number) => void;
}
function Batch({
  parts,
  kind,
  ...props
}: Props & { parts: Piece[]; kind: MaterialKind }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const lookup = useMemo(
    () => new Map(props.companies.map((c) => [c.ticker, c])),
    [props.companies],
  );
  useEffect(() => {
    if (!mesh.current) return;
    const object = new THREE.Object3D();
    parts.forEach((p, i) => {
      object.position.set(...p.position);
      object.scale.set(...p.scale);
      object.rotation.y = p.rotation ?? 0;
      object.updateMatrix();
      mesh.current!.setMatrixAt(i, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
    invalidate();
  }, [parts, invalidate]);
  useEffect(() => {
    if (!mesh.current) return;
    const color = new THREE.Color();
    parts.forEach((p, i) => {
      const active =
        (!props.matches || props.matches.includes(p.ticker)) &&
        (!props.focus || props.focus === p.ticker);
      const palette = {
        towerGlass: "#68a6bf",
        taperGlass: "#6294b2",
        trim: props.dark ? "#b5c7cf" : "#f1e5cf",
        glass: props.dark ? "#699dad" : "#4a97b6",
        roof: props.dark ? "#8296ae" : "#aec9d6",
        equipment: props.dark ? "#7d8980" : "#bfc5b9",
        shadow: "#304437",
        drumTrim: props.dark ? "#819897" : "#aac0b8",
        drum: "#a3bba2",
      };
      color.set(
        kind === "wall" || kind === "drum"
          ? performanceColor(
              lookup.get(p.ticker)?.changePercent ?? 0,
              props.dark,
            )
          : palette[kind],
      );
      if (kind === "towerGlass" || kind === "taperGlass")
        color.lerp(
          new THREE.Color(
            performanceColor(
              lookup.get(p.ticker)?.changePercent ?? 0,
              props.dark,
            ),
          ),
          0.48,
        );
      if (!active && kind !== "shadow")
        color.lerp(new THREE.Color(props.dark ? "#435047" : "#c6cebb"), 0.8);
      mesh.current!.setColorAt(i, color);
    });
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
    invalidate();
  }, [parts, lookup, props.dark, props.matches, props.focus, kind, invalidate]);
  function ticker(e: ThreeEvent<MouseEvent | PointerEvent>) {
    e.stopPropagation();
    return parts[e.instanceId ?? -1]?.ticker;
  }
  return (
    <instancedMesh
      ref={mesh}
      args={[
        kind === "taperGlass"
          ? taper
          : kind === "drum" || kind === "drumTrim"
            ? drum
            : box,
        undefined,
        parts.length,
      ]}
      onPointerMove={
        kind === "shadow"
          ? undefined
          : (e) => {
              const t = ticker(e);
              if (t) props.onHover(lookup.get(t)!, e.clientX, e.clientY);
            }
      }
      onPointerOut={kind === "shadow" ? undefined : () => props.onHover(null)}
      onClick={
        kind === "shadow"
          ? undefined
          : (e) => {
              const t = ticker(e);
              if (t) props.onSelect(t);
            }
      }
      onDoubleClick={
        kind === "shadow"
          ? undefined
          : (e) => {
              const t = ticker(e);
              if (t) props.onExplore(t);
            }
      }
    >
      {kind === "shadow" ? (
        <meshBasicMaterial transparent opacity={0.09} depthWrite={false} />
      ) : (
        <meshStandardMaterial
          roughness={
            kind === "towerGlass" || kind === "taperGlass"
              ? 0.18
              : kind === "glass"
                ? 0.35
                : 0.95
          }
          metalness={
            kind === "towerGlass" || kind === "taperGlass" ? 0.4 : 0.05
          }
        />
      )}
    </instancedMesh>
  );
}
export default function Buildings(props: Props) {
  const pieces = useMemo(() => architecture(props.plots), [props.plots]);
  const selected = props.plots.find((p) => p.ticker === props.selected);
  return (
    <>
      {(Object.keys(pieces) as MaterialKind[]).map((kind) => (
        <Batch key={kind} {...props} parts={pieces[kind]} kind={kind} />
      ))}
      {selected && (
        <mesh
          position={[selected.x, 1.16, selected.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry
            args={[
              Math.max(selected.width, selected.depth) * 0.74,
              Math.max(selected.width, selected.depth) * 0.74 + 0.16,
              48,
            ]}
          />
          <meshBasicMaterial
            color={props.dark ? "#e7d8a6" : "#315d48"}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  );
}
