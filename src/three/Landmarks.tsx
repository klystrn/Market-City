import { useMemo } from "react";
import * as THREE from "three";
import { landmarks, railLoop, sectors } from "@/domain/geography";
import {
  Boxes,
  cylinder,
  treeGeometry,
  segment,
  type Part,
} from "./SceneryParts";
const dome = new THREE.SphereGeometry(
  0.5,
  16,
  8,
  0,
  Math.PI * 2,
  0,
  Math.PI / 2,
);
const cone = new THREE.ConeGeometry(0.5, 1, 8);
export default function Landmarks({
  civic,
  transit,
  greenery,
}: {
  civic: boolean;
  transit: boolean;
  greenery: boolean;
}) {
  const parts = useMemo(() => {
    const blocks: Part[] = [],
      rail: Part[] = [],
      round: Part[] = [],
      domes: Part[] = [],
      cones: Part[] = [],
      gardens: Part[] = [];
    for (const l of landmarks) {
      const accent = sectors.find((s) => s.id === l.sector)!.color;
      const put = (
        x: number,
        y: number,
        z: number,
        w: number,
        h: number,
        d: number,
        color: string,
        list = blocks,
      ) =>
        list.push({
          position: [l.x + x, 1 + y, l.z + z],
          scale: [w, h, d],
          color,
        });
      put(0, 0.04, 0, l.radius * 2, 0.08, l.radius * 1.6, "#d8cec0");
      switch (l.sector) {
        case "energy":
          // Symbolic nuclear campus: two containment domes, turbine hall and switchyard.
          for (const x of [-4.5, 1]) {
            put(x, 1.7, 0, 4.3, 3.4, 4.3, "#d9e4e8", round);
            put(x, 3.4, 0, 4.3, 4.3, 4.3, "#edf4f3", domes);
            put(x, 0.15, 0, 5.3, 0.3, 5.3, "#e6ae3a");
          }
          put(0, 1.1, 4.6, 12, 2.2, 3.1, "#4388b3");
          for (let i = 0; i < 5; i++)
            put(-5 + i * 2.3, 1.3, -4, 1, 2.6, 0.7, "#647886");
          break;
        case "communications":
          for (let i = 0; i < 10; i++) {
            const w = 7 - i * 0.55;
            for (const side of [-1, 1])
              put(
                side * w * 0.43,
                1.2 + i * 2.15,
                0,
                0.4,
                2.4,
                0.4,
                i % 2 ? "#f5ede1" : "#e86643",
              );
            put(
              0,
              2.3 + i * 2.15,
              0,
              w,
              0.24,
              1.4,
              i % 2 ? "#f5ede1" : "#e86643",
            );
          }
          put(0, 15, 0, 5.4, 2, 4, "#eae6db");
          put(0, 24, 0, 0.45, 7, 0.45, "#e56d44", round);
          break;
        case "industrials":
          for (let i = 0; i < 3; i++) {
            put(0, 4 + i * 0.1, (i - 1) * 4, 0.55, 8, 0.55, "#e8b33a");
            put(-2.5, 8 + i * 0.1, (i - 1) * 4, 8, 0.5, 0.6, "#e8b33a");
            put(-5.8, 6, (i - 1) * 4, 0.12, 4, 0.12, "#465666");
          }
          for (let i = 0; i < 8; i++)
            put(
              -3 + (i % 4) * 1.8,
              0.6,
              6 + Math.floor(i / 4) * 1.5,
              1.5,
              1.2,
              1.25,
              ["#337fa2", "#d3734b", "#d3af4f"][i % 3],
            );
          break;
        case "financials":
          put(0, 1.8, 0, 8, 3.6, 5, "#cfbd92");
          for (let i = 0; i < 6; i++)
            put(-3.3 + i * 1.3, 1.8, 3, 0.28, 3.6, 0.28, "#f2e5c6", round);
          put(0, 3.7, 0, 9, 0.35, 6.5, "#dbc080");
          put(0, 4.5, 0, 8, 1.5, 6, "#5b847e", cones);
          break;
        case "healthcare":
          put(-2, 2, 0, 5, 4, 8, "#eee9e0");
          put(2, 2, 0, 5, 4, 8, "#e5ecee");
          put(0, 4.2, 0, 4, 0.35, 1, "#de6784");
          put(0, 4.2, 0, 1, 0.35, 4, "#de6784");
          break;
        case "technology":
          for (const x of [-4, 4]) put(x, 4, 0, 1.2, 8, 1.2, "#367cc3");
          put(0, 8, 0, 10, 1.3, 2, "#7251af");
          put(0, 6.4, 0, 6, 0.45, 1, "#f0c76b");
          for (let i = 0; i < 3; i++)
            put(-2 + i * 2, 3, -2, 0.7, 6, 0.7, "#56b5d5");
          break;
        case "consumer":
          put(0, 0.13, 0, 9, 0.18, 9, "#46556b");
          for (let i = 0; i < 7; i++) {
            put(-3 + i, 0.24, 0, 0.4, 0.05, 8, "#f6dfbf");
          }
          for (const x of [-4, 4]) {
            put(x, 3, -4, 0.3, 6, 0.3, "#566278");
            put(x, 5, -4, 2.5, 2, 0.3, accent);
          }
          break;
        case "staples":
          put(0, 1.3, 0, 8, 2.6, 5, "#e6cda1");
          for (let i = 0; i < 7; i++)
            put(
              -3.5 + i * 1.15,
              2.8,
              0,
              1.1,
              0.35,
              6,
              i % 2 ? "#f3e5be" : "#dd8550",
            );
          break;
        case "utilities":
          for (const x of [-4, 1, 5]) {
            put(x, 4, 0, 0.32, 8, 0.32, "#e9e7d6", round);
            put(x, 8, 0, 0.7, 0.7, 0.7, "#c7dfdf", round);
            put(x, 9.8, 0, 0.27, 3.6, 0.18, "#eef3e8");
            put(x, 7.5, 0, 4.5, 0.28, 0.18, "#eef3e8");
          }
          break;
        case "materials":
          for (let i = 0; i < 4; i++)
            put(
              0,
              0.4 + i * 0.7,
              0,
              17 - i * 3,
              0.8,
              13 - i * 2,
              ["#bf9972", "#d1ae83", "#b68c67", "#927564"][i],
            );
          put(5, 3, 3, 2.8, 1.4, 1.5, "#edb33c");
          break;
        case "realestate":
          for (const x of [-3, 0, 3]) {
            put(x, 0.18, 3, 0.45, 0.35, 7, "#9b7755");
            put(x, 1, 4, 0.15, 2, 0.15, "#f4e8d3");
          }
          put(0, 1, -2, 8, 2, 3, "#709dcc");
          break;
      }
      // Landscape beds give every landmark a colored, recognizable civic setting.
      for (const side of [-1, 1])
        put(
          side * l.radius,
          0.9,
          -l.radius * 0.6,
          1.6,
          1.8,
          1.6,
          "#4b976a",
          gardens,
        );
    }
    // An elevated urban rail loop and a green commuter train evoke Tokyo's connected wards.
    for (let i = 1; i < railLoop.length; i++) {
      const a = railLoop[i - 1],
        b = railLoop[i],
        deck = segment(a, b, 1.75, 0.3, 4.1);
      rail.push({ ...deck, color: "#bcc4bc" });
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]),
        nx = ((b[1] - a[1]) / length) * 0.52,
        nz = (-(b[0] - a[0]) / length) * 0.52;
      for (const sign of [-1, 1])
        rail.push({
          ...segment(
            [a[0] + nx * sign, a[1] + nz * sign],
            [b[0] + nx * sign, b[1] + nz * sign],
            0.09,
            0.12,
            4.32,
          ),
          color: "#63757b",
        });
      for (let d = 5; d < length; d += 12)
        rail.push({
          position: [
            a[0] + ((b[0] - a[0]) * d) / length,
            2.5,
            a[1] + ((b[1] - a[1]) * d) / length,
          ],
          scale: [0.5, 3, 0.5],
          color: "#aab6b3",
        });
    }
    for (let i = 0; i < 6; i++) {
      const x = -77 + i * 3.6;
      rail.push({
        position: [x, 5.1, -123],
        scale: [3.2, 1.35, 1.35],
        color: "#eff0dd",
      });
      rail.push({
        position: [x, 5.3, -122.31],
        scale: [2.8, 0.3, 0.03],
        color: "#47877a",
      });
      rail.push({
        position: [x, 4.75, -122.3],
        scale: [3.2, 0.25, 0.04],
        color: "#79b453",
      });
    }
    return { blocks, rail, round, domes, cones, gardens };
  }, []);
  return (
    <>
      <group visible={civic}>
        <Boxes parts={parts.blocks} />
        <Boxes parts={parts.round} geometry={cylinder} />
        <Boxes parts={parts.domes} geometry={dome} />
        <Boxes parts={parts.cones} geometry={cone} />
        {greenery && <Boxes parts={parts.gardens} geometry={treeGeometry} />}
      </group>
      {transit && <Boxes parts={parts.rail} />}
    </>
  );
}
