import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { CityLandmark } from "@/domain/cities/types";
import { seasonPalette, type Season } from "@/domain/seasons";
import { Boxes, cylinder, treeGeometry, type Part } from "./SceneryParts";
import { landmarkPieces, mergePieces } from "./landmark-geometry";
// Parks, labels and the merged landmark structures for London and New York.
// The structures themselves are described in landmark-geometry.ts.
const pondDisc = new THREE.CircleGeometry(1, 22);
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
  // Every landmark structure and pond, baked into one mesh per finish.
  const batches = useMemo(
    () =>
      mergePieces(
        landmarkPieces(landmarks, (b) => {
          for (const l of landmarks) {
            const style = PARK_STYLES[l.id];
            if (l.kind !== "park" || !style?.ponds) continue;
            const w = l.width ?? l.radius * 2,
              d = l.depth ?? l.radius * 2;
            for (const p of style.ponds)
              b.group(
                [l.x + p.ox * (w / 2), 1.14, l.z + p.oz * (d / 2)],
                [0, p.rotation ?? 0, 0],
                () =>
                  b.mesh(
                    pondDisc,
                    { color: palette.water, roughness: 0.4 },
                    [0, 0, 0],
                    [-Math.PI / 2, 0, 0],
                    [p.rx * (w / 2), p.rz * (d / 2), 1],
                  ),
              );
          }
        }),
      ),
    [landmarks, palette.water],
  );
  useEffect(
    () => () => batches.forEach((batch) => batch.geometry.dispose()),
    [batches],
  );
  return (
    <group>
      <Boxes parts={greens.lawns} />
      <Boxes parts={greens.paths} />
      <Boxes parts={greens.trunks} geometry={cylinder} color="#7d6047" />
      <Boxes parts={greens.crowns} geometry={treeGeometry} />
      {batches.map(({ key, geometry, finish }) => (
        <mesh key={key} geometry={geometry}>
          <meshStandardMaterial
            vertexColors
            metalness={finish.metalness ?? 0}
            roughness={finish.roughness ?? 1}
            emissive={finish.emissive ?? "#000000"}
            emissiveIntensity={finish.emissiveIntensity ?? 0}
            side={finish.doubleSide ? THREE.DoubleSide : THREE.FrontSide}
          />
        </mesh>
      ))}
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
