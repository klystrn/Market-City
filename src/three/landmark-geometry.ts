import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { CityLandmark } from "@/domain/cities/types";

// Simplified low-poly massing for the recognizable places in London and New
// York. These are silhouettes that read at a glance, not architectural
// reproductions, and none of them carries a market encoding.
//
// Landmarks never move, so rather than give every piece its own mesh — about a
// hundred draw calls on New York, the single largest cost in the frame — each
// landmark is described as a list of pieces and the whole set is baked into
// one merged geometry per material, with colour carried per vertex. Shapes,
// colours and finishes are exactly what the per-mesh version drew; only how
// they reach the GPU changed. Instancing was the other option, but these are
// two dozen different shapes with a handful of copies each, which is the case
// merging serves and instancing does not.
//
// A landmark that stands in for a company (`ticker` set) gets no pieces at
// all: the company's own building already stands at that spot, carrying the
// daily-performance colour encoding, so a second unrelated shape on top of it
// would just overlap. Its real-world identity comes through on the company
// card instead.
const GROUND = 1.1;

/** A surface finish. Colour is per vertex; everything else splits batches. */
export interface Finish {
  color: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  doubleSide?: boolean;
}
export interface Piece {
  geometry: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
  finish: Finish;
}
type Vec3 = [number, number, number];

const unitBox = new THREE.BoxGeometry(1, 1, 1);

/** Collects pieces under a stack of group transforms, like nested <group>s. */
export class PieceBuilder {
  readonly pieces: Piece[] = [];
  private stack: THREE.Matrix4[] = [new THREE.Matrix4()];
  private get top() {
    return this.stack[this.stack.length - 1];
  }
  group(position: Vec3, rotation: Vec3, draw: () => void) {
    const local = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(1, 1, 1),
    );
    this.stack.push(this.top.clone().multiply(local));
    draw();
    this.stack.pop();
  }
  mesh(
    geometry: THREE.BufferGeometry,
    finish: Finish,
    position: Vec3,
    rotation: Vec3 = [0, 0, 0],
    scale: Vec3 = [1, 1, 1],
  ) {
    const local = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale),
    );
    this.pieces.push({
      geometry,
      matrix: this.top.clone().multiply(local),
      finish,
    });
  }
  box(finish: Finish, position: Vec3, scale: Vec3, rotation: Vec3 = [0, 0, 0]) {
    this.mesh(unitBox, finish, position, rotation, scale);
  }
  // A short diagonal strut between two points in the local X-Y plane (X
  // across, Y up), used for bridge cables and roof struts.
  beam(x1: number, y1: number, x2: number, y2: number, thickness: number, color: string) {
    const length = Math.hypot(x2 - x1, y2 - y1) || 0.01;
    this.box(
      { color },
      [(x1 + x2) / 2, (y1 + y2) / 2, 0],
      [length, thickness, thickness],
      [0, 0, Math.atan2(y2 - y1, x2 - x1)],
    );
  }
}

type Draw = (b: PieceBuilder, l: CityLandmark) => void;
const cone = (r: number, h: number, seg: number) =>
  new THREE.ConeGeometry(r, h, seg);
const cyl = (rt: number, rb: number, h: number, seg: number) =>
  new THREE.CylinderGeometry(rt, rb, h, seg);
const sphere = (r: number, w: number, h: number) =>
  new THREE.SphereGeometry(r, w, h);
const hemisphere = (r: number, w: number, h: number) =>
  new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, Math.PI / 2);
const at = (l: CityLandmark, draw: () => void, b: PieceBuilder, rotate = false) =>
  b.group([l.x, GROUND, l.z], [0, rotate ? (l.rotation ?? 0) : 0, 0], draw);

const Wheel: Draw = (b, l) => {
  const r = l.radius;
  b.group([l.x, GROUND + r * 0.95, l.z], [0, 0, 0], () => {
    b.mesh(
      new THREE.TorusGeometry(r * 0.9, r * 0.07, 8, 26),
      { color: "#c9d6dc", metalness: 0.4, roughness: 0.4 },
      [0, 0, 0],
      [0, Math.PI / 2, 0],
    );
    for (let i = 0; i < 8; i++)
      b.box({ color: "#dbe4e7" }, [0, 0, 0], [0.06, r * 1.8, 0.06], [
        (i / 8) * Math.PI,
        Math.PI / 2,
        0,
      ]);
    // Rim capsules, the detail that actually reads as "Ferris wheel" rather
    // than "ring on a stick" at a glance.
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      b.box(
        { color: "#f2f6f2" },
        [Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9, 0],
        [0.34, 0.24, 0.26],
      );
    }
    b.box({ color: "#b9c6c9" }, [0, -r * 0.95, 0], [r * 0.5, r * 0.2, r * 0.5]);
  });
};
// The default bridge silhouette: twin Gothic stone piers with fanned
// suspension cables, matching Brooklyn Bridge — used for it directly, and as
// the fallback for any future bridge that isn't given its own bespoke shape.
const SuspensionBridge: Draw = (b, l) => {
  const r = l.radius;
  const towerX = r * 0.68,
    towerTopY = r * 1.98,
    deckY = 0.5;
  at(l, () => {
    b.box({ color: "#9b8f78" }, [0, deckY, 0], [r * 2.6, 0.26, 0.42]);
    for (const side of [-1, 1]) {
      for (const leg of [-1, 1])
        b.box({ color: "#c9beac" }, [side * towerX, r * 0.85, leg * r * 0.2], [
          r * 0.2,
          r * 1.7,
          r * 0.2,
        ]);
      b.box({ color: "#b3a68f" }, [side * towerX, r * 1.78, 0], [
        r * 0.5,
        r * 0.22,
        r * 0.46,
      ]);
      b.mesh(cone(r * 0.32, r * 0.4, 4), { color: "#a89b83" }, [
        side * towerX,
        r * 1.98,
        0,
      ]);
      for (const f of [0.35, 0.7, 1.05])
        b.beam(side * towerX, towerTopY, side * towerX * (1 - f), deckY, 0.07, "#8b8272");
    }
  }, b, true);
};
// Tower Bridge: bascule towers with turrets and a high-level walkway, styled
// in painted blue-grey ironwork — deliberately not the suspension shape above,
// so the two most famous bridges in the dataset read as different bridges.
const TowerBridge: Draw = (b, l) => {
  const r = l.radius;
  at(l, () => {
    for (const side of [-1, 1])
      b.group([side * r * 0.62, 0, 0], [0, 0, 0], () => {
        b.box({ color: "#8a95a0" }, [0, r * 1.1, 0], [r * 0.5, r * 2.2, r * 0.5]);
        for (const [cx, cz] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ])
          b.mesh(cone(r * 0.09, r * 0.34, 4), { color: "#5f6a76" }, [
            cx * r * 0.22,
            r * 2.35,
            cz * r * 0.22,
          ]);
        b.box({ color: "#4d5760" }, [0, r * 2.5, 0], [r * 0.56, 0.12, r * 0.56]);
      });
    b.box({ color: "#8fa3ac" }, [0, r * 1.9, 0], [r * 1.24, 0.22, 0.5]);
    b.box({ color: "#b4a893" }, [0, 0.6, 0], [r * 2.6, 0.3, r * 0.5]);
    b.box({ color: "#2f5f8a" }, [0, 0.42, 0], [r * 2.6, 0.1, r * 0.56]);
  }, b, true);
};
// The Statue of Liberty: a stepped pedestal, draped patina-green robe, raised
// torch arm and a spiked crown — the only statue-kind landmark, so this is
// simply the generic renderer rather than a bespoke override.
const Statue: Draw = (b, l) => {
  const h = l.height ?? 12;
  const patina = { color: "#6fae9c" };
  at(l, () => {
    b.box({ color: "#9b9082" }, [0, h * 0.09, 0], [h * 0.5, h * 0.18, h * 0.5]);
    b.box({ color: "#a89d8d" }, [0, h * 0.22, 0], [h * 0.36, h * 0.16, h * 0.36]);
    b.mesh(cone(h * 0.16, h * 0.5, 8), patina, [0, h * 0.56, 0]);
    b.mesh(sphere(h * 0.07, 10, 8), patina, [0, h * 0.84, 0]);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      b.mesh(cone(h * 0.015, h * 0.08, 4), { color: "#5f9c8b" }, [
        Math.cos(a) * h * 0.08,
        h * 0.9,
        Math.sin(a) * h * 0.08,
      ]);
    }
    b.box(patina, [h * 0.13, h * 0.78, 0], [h * 0.32, h * 0.05, h * 0.05], [0, 0, -0.5]);
    b.mesh(
      cone(h * 0.045, h * 0.09, 6),
      { color: "#f0c766", emissive: "#e0a93c", emissiveIntensity: 0.5 },
      [h * 0.22, h * 0.95, 0],
    );
  }, b);
};
// The default dome: a low, wide tent with perimeter mast lines, matching the
// O2 — used directly, and as the fallback for a future dome without its own
// bespoke shape.
const TentDome: Draw = (b, l) => {
  const r = l.radius;
  at(l, () => {
    b.box({ color: "#ddd2c0" }, [0, r * 0.4, 0], [r * 1.5, r * 0.8, r * 1.5]);
    b.mesh(
      hemisphere(r * 0.62, 14, 8),
      { color: "#9fb4b8", metalness: 0.25, roughness: 0.4 },
      [0, r * 0.8, 0],
    );
    b.box({ color: "#e8dcc4" }, [0, r * 1.5, 0], [0.14, r * 0.4, 0.14]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.box(
        { color: "#e0c452" },
        [Math.cos(a) * r * 1.5, r * 0.55, Math.sin(a) * r * 1.5],
        [0.08, r * 1.1, 0.08],
      );
    }
  }, b);
};
// St Paul's Cathedral: a stone drum carrying the dome, with a lantern and
// cross above it, taller and narrower than the O2's flat tent so the two
// domes read as different buildings.
const StPauls: Draw = (b, l) => {
  const r = l.radius;
  at(l, () => {
    b.box({ color: "#d8d0bd" }, [0, r * 0.3, 0], [r * 1.8, r * 0.6, r * 1.1]);
    b.mesh(cyl(r * 0.62, r * 0.68, r * 0.7, 16), { color: "#cfc7b1" }, [0, r * 0.85, 0]);
    b.mesh(
      hemisphere(r * 0.62, 16, 10),
      { color: "#8fa6ac", metalness: 0.2, roughness: 0.5 },
      [0, r * 1.35, 0],
    );
    b.box({ color: "#cfc7b1" }, [0, r * 1.86, 0], [0.16, r * 0.34, 0.16]);
    b.mesh(cone(r * 0.1, r * 0.18, 8), { color: "#e8dcc4" }, [0, r * 2.06, 0]);
  }, b);
};
// Royal Observatory Greenwich: a small dome on the hill it actually stands on,
// with the red time-ball mast beside it.
const Greenwich: Draw = (b, l) => {
  const r = l.radius;
  at(l, () => {
    b.mesh(cyl(r * 1.3, r * 1.5, r * 0.36, 16), { color: "#7fae6c" }, [0, r * 0.18, 0]);
    b.box({ color: "#d3c7a9" }, [0, r * 0.55, 0], [r * 1.1, r * 0.5, r * 0.8]);
    b.mesh(
      sphere(r * 0.32, 12, 8),
      { color: "#4c5a63", metalness: 0.3, roughness: 0.4 },
      [r * 0.3, r * 0.92, 0],
    );
    b.box({ color: "#8a7f6a" }, [-r * 0.3, r * 1.05, 0], [0.06, r * 0.5, 0.06]);
    b.mesh(sphere(r * 0.1, 8, 8), { color: "#c94c3f" }, [-r * 0.3, r * 1.32, 0]);
  }, b);
};
function bowl(b: PieceBuilder, r: number, segments: number) {
  b.mesh(cyl(r, r * 1.05, r * 0.56, segments), { color: "#cfc6b1" }, [0, r * 0.28, 0]);
  b.mesh(
    new THREE.CircleGeometry(r * 0.78, segments),
    { color: "#6ea765" },
    [0, r * 0.58, 0],
    [-Math.PI / 2, 0, 0],
  );
}
const Arena: Draw = (b, l) => at(l, () => bowl(b, l.radius, 18), b);
// Wembley Stadium: the same bowl as any other arena, plus the arch that
// actually makes it recognizable, traced as a string of beads over the roof.
const Wembley: Draw = (b, l) => {
  const r = l.radius;
  const segs = 9;
  at(l, () => {
    bowl(b, r, 20);
    for (let i = 0; i < segs; i++) {
      const angle = (i / (segs - 1)) * Math.PI;
      b.mesh(
        sphere(1, 6, 6),
        { color: "#e7e2d6", metalness: 0.4, roughness: 0.4 },
        [Math.cos(angle) * r * 1.15, Math.sin(angle) * r * 1.35 + r * 0.4, 0],
        [0, 0, 0],
        [0.18, 0.18, 0.18],
      );
    }
  }, b);
};
const Spire: Draw = (b, l) => {
  const h = l.height ?? 24;
  const r = l.radius;
  at(l, () => {
    b.box(
      { color: l.color ?? "#9fb3bd", metalness: 0.3, roughness: 0.4 },
      [0, h * 0.32, 0],
      [r * 1.7, h * 0.64, r * 1.7],
    );
    b.box({ color: l.color ?? "#adc0c8" }, [0, h * 0.76, 0], [r * 1.1, h * 0.26, r * 1.1]);
    b.mesh(
      cone(r * 0.5, h * 0.16, 6),
      { color: "#c8d6da", metalness: 0.5, roughness: 0.3 },
      [0, h * 0.95, 0],
    );
    b.box({ color: "#dbe5e8" }, [0, h * 1.12, 0], [0.1, h * 0.2, 0.1]);
  }, b);
};
// The Empire State Building: setback tiers narrowing toward a mast, rather
// than one plain box — the defining Art Deco profile.
const EmpireState: Draw = (b, l) => {
  const h = l.height ?? 34;
  const r = l.radius;
  at(l, () => {
    b.box({ color: "#b7a98d" }, [0, h * 0.28, 0], [r * 1.7, h * 0.56, r * 1.7]);
    b.box({ color: "#c2b596" }, [0, h * 0.64, 0], [r * 1.15, h * 0.24, r * 1.15]);
    b.box({ color: "#cabf9e" }, [0, h * 0.82, 0], [r * 0.7, h * 0.12, r * 0.7]);
    b.box({ color: "#d8cfae" }, [0, h * 0.95, 0], [0.12, h * 0.22, 0.12]);
    b.mesh(
      cone(0.05, h * 0.1, 6),
      { color: "#f2c265", emissive: "#e0a93c", emissiveIntensity: 0.35 },
      [0, h * 1.08, 0],
    );
  }, b);
};
// The Chrysler Building: terraced stainless rings tapering to a needle spire,
// the sunburst crown that makes it unmistakable.
const Chrysler: Draw = (b, l) => {
  const h = l.height ?? 27;
  const r = l.radius;
  at(l, () => {
    b.box({ color: "#c7bfae" }, [0, h * 0.34, 0], [r * 1.6, h * 0.68, r * 1.6]);
    [0.7, 0.82, 0.92].forEach((t, i) =>
      b.mesh(
        cyl(r * (0.95 - i * 0.22), r * (1.05 - i * 0.2), h * 0.1, 8),
        { color: "#d7d2c2", metalness: 0.55, roughness: 0.25 },
        [0, h * t, 0],
      ),
    );
    b.box(
      { color: "#e4e0d2", metalness: 0.5, roughness: 0.2 },
      [0, h * 1.02, 0],
      [0.1, h * 0.22, 0.1],
    );
  }, b);
};
// One World Trade Center: a tapered obelisk built from shrinking, 45°-turned
// segments to hint the real building's chamfered corners, rather than a plain
// stepped box.
const OneWtc: Draw = (b, l) => {
  const h = l.height ?? 40;
  const r = l.radius;
  const segs = 4;
  at(l, () => {
    for (let i = 0; i < segs; i++) {
      const rad = r * (1 - (i / segs) * 0.55);
      const segH = h / segs;
      b.box(
        { color: "#a9c3cc", metalness: 0.4, roughness: 0.3 },
        [0, segH * (i + 0.5), 0],
        [rad * 1.3, segH * 1.02, rad * 1.3],
        [0, Math.PI / 4, 0],
      );
    }
    b.box({ color: "#cfe0e5" }, [0, h + 1, 0], [0.1, 2, 0.1]);
  }, b);
};
const Tower: Draw = (b, l) => {
  const h = l.height ?? 18;
  const r = l.radius;
  at(l, () => {
    b.mesh(
      cyl(r * 0.62, r * 0.8, h, 14),
      { color: l.color ?? "#8fb6c4", metalness: 0.35, roughness: 0.35 },
      [0, h / 2, 0],
    );
    b.mesh(cyl(r * 0.4, r * 0.6, 0.8, 14), { color: "#cfdce0" }, [0, h + 0.4, 0]);
  }, b);
};
// The Gherkin: five tapered rings that bulge in the middle and pinch at both
// ends, tracing the building's tapered "pickle" profile instead of a plain
// cylinder.
const Gherkin: Draw = (b, l) => {
  const h = l.height ?? 18;
  const r = l.radius;
  const segs = 5;
  at(l, () => {
    for (let i = 0; i < segs; i++) {
      const bulge = Math.sin(((i + 0.5) / segs) * Math.PI);
      const rad = r * (0.45 + bulge * 0.75);
      const segH = h / segs;
      b.mesh(
        cyl(rad * 0.98, rad, segH * 1.02, 12),
        { color: "#8fbfc7", metalness: 0.4, roughness: 0.25 },
        [0, segH * (i + 0.5), 0],
      );
    }
    b.mesh(cone(r * 0.22, 0.9, 8), { color: "#cfe4e7" }, [0, h + 0.4, 0]);
  }, b);
};
// Canary Wharf (One Canada Square): a plain tower topped with the pyramidal
// roof that identifies it on the skyline.
const CanaryWharf: Draw = (b, l) => {
  const h = l.height ?? 26;
  const r = l.radius;
  at(l, () => {
    b.box(
      { color: "#c3ccd1", metalness: 0.35, roughness: 0.3 },
      [0, h / 2, 0],
      [r * 1.1, h, r * 1.1],
    );
    b.mesh(
      cone(r * 0.85, r * 1.1, 4),
      { color: "#dfe6e8", metalness: 0.4, roughness: 0.25 },
      [0, h + r * 0.55, 0],
    );
  }, b);
};
const Museum: Draw = (b, l) => {
  const r = l.radius;
  at(l, () => {
    b.box({ color: "#ddd3bd" }, [0, r * 0.35, 0], [r * 2, r * 0.7, r * 1.5]);
    for (let i = 0; i < 5; i++)
      b.box({ color: "#f2e9d3" }, [(i - 2) * r * 0.36, r * 0.42, r * 0.78], [
        r * 0.13,
        r * 0.84,
        r * 0.13,
      ]);
    b.box({ color: "#c9bda4" }, [0, r * 0.86, r * 0.5], [r * 1.9, r * 0.16, r * 0.8]);
  }, b);
};
// Tate Modern: the converted Bankside power station's single tall chimney on
// a long brick block, kept deliberately distinct from Battersea's four
// corner chimneys below.
const TateModern: Draw = (b, l) => {
  const r = l.radius;
  const chimneyH = r * 2.6;
  at(l, () => {
    b.box({ color: "#8a5a48" }, [0, r * 0.45, 0], [r * 2.2, r * 0.9, r * 1.3]);
    b.box({ color: "#7a4d3d" }, [0, chimneyH / 2, 0], [r * 0.34, chimneyH, r * 0.34]);
  }, b);
};
// Washington Square Arch: a memorial arch, not a museum block — two piers and
// a lintel with a darker inset hinting the archway, since the data's "museum"
// kind was a placeholder rather than a real fit.
const WashingtonSquareArch: Draw = (b, l) => {
  const r = l.radius;
  const marble = { color: "#e7e2d3" };
  at(l, () => {
    for (const side of [-1, 1])
      b.box(marble, [side * r * 0.55, r * 0.7, 0], [r * 0.32, r * 1.4, r * 0.5]);
    b.box(marble, [0, r * 1.5, 0], [r * 1.5, r * 0.3, r * 0.5]);
    b.box({ color: "#cfd6c9" }, [0, r * 0.75, 0], [r * 0.7, r * 1.2, r * 0.3]);
  }, b);
};
const Palace: Draw = (b, l) => {
  const r = l.radius;
  at(l, () => {
    b.box({ color: "#d9cdb4" }, [0, r * 0.36, 0], [r * 2.4, r * 0.72, r * 1.1]);
    for (const side of [-1, 1])
      b.box({ color: "#cfc2a8" }, [side * r * 1.1, r * 0.3, r * 0.6], [
        r * 0.55,
        r * 0.6,
        r * 0.9,
      ]);
    // Portico columns, so it reads as a state building rather than a plain
    // block — Buckingham Palace is the only palace-kind landmark, so this is
    // the generic renderer rather than a bespoke override.
    for (const cx of [-0.5, -0.17, 0.17, 0.5])
      b.box({ color: "#efe6d2" }, [cx * r * 1.6, r * 0.34, r * 0.62], [0.14, r * 0.6, 0.14]);
    b.box({ color: "#a9a08a" }, [0, r * 0.78, 0], [r * 2.5, r * 0.12, r * 1.2]);
    b.box({ color: "#8a7f6a" }, [0, r * 1.05, 0], [0.06, r * 0.36, 0.06]);
    b.box({ color: "#c94c3f" }, [r * 0.16, r * 1.2, 0], [r * 0.28, r * 0.16, 0.02]);
  }, b);
};
const Terminal: Draw = (b, l) => {
  const r = l.radius;
  at(l, () => {
    b.box({ color: "#c8b79b" }, [0, r * 0.34, 0], [r * 2.1, r * 0.68, r * 1.4]);
    b.mesh(
      new THREE.CylinderGeometry(r * 0.7, r * 0.7, r * 2, 12, 1, false, 0, Math.PI),
      { color: "#8fa9b3", metalness: 0.3, roughness: 0.4, doubleSide: true },
      [0, r * 0.72, 0],
      [0, 0, Math.PI / 2],
    );
    b.mesh(cyl(r * 0.16, r * 0.16, 0.06, 16), { color: "#f2ecdb" }, [0, r * 0.5, r * 0.71]);
  }, b);
};
// Battersea Power Station: a long brick block with its four white chimneys —
// the previous generic train-shed shape was a poor fit for a power station,
// so this replaces it entirely.
const Battersea: Draw = (b, l) => {
  const r = l.radius;
  const chimneyH = r * 2.2;
  at(l, () => {
    b.box({ color: "#b5735a" }, [0, r * 0.5, 0], [r * 2.1, r, r * 1.3]);
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.box({ color: "#e9e4da" }, [sx * r * 0.78, chimneyH / 2, sz * r * 0.5], [
        r * 0.16,
        chimneyH,
        r * 0.16,
      ]);
  }, b);
};

// Landmarks whose real shape doesn't match the shared per-kind template
// closely enough, keyed by id and checked before the kind lookup below.
const BESPOKE: Record<string, Draw> = {
  "tower-bridge": TowerBridge,
  "brooklyn-bridge": SuspensionBridge,
  "st-pauls": StPauls,
  greenwich: Greenwich,
  gherkin: Gherkin,
  "canary-wharf": CanaryWharf,
  battersea: Battersea,
  "tate-modern": TateModern,
  wembley: Wembley,
  "empire-state": EmpireState,
  chrysler: Chrysler,
  "one-wtc": OneWtc,
  "washington-square": WashingtonSquareArch,
};
const BY_KIND: Partial<Record<CityLandmark["kind"], Draw>> = {
  wheel: Wheel,
  bridge: SuspensionBridge,
  statue: Statue,
  dome: TentDome,
  arena: Arena,
  spire: Spire,
  tower: Tower,
  museum: Museum,
  palace: Palace,
  terminal: Terminal,
};

/** The pieces a city's landmark structures are built from. */
export function landmarkPieces(landmarks: CityLandmark[], extra?: (b: PieceBuilder) => void) {
  const b = new PieceBuilder();
  for (const l of landmarks) {
    // The company's own building already stands here; a second unrelated
    // shape on top of it would just overlap.
    if (l.ticker) continue;
    (BESPOKE[l.id] ?? BY_KIND[l.kind])?.(b, l);
  }
  extra?.(b);
  return b.pieces;
}

export interface MergedBatch {
  key: string;
  geometry: THREE.BufferGeometry;
  finish: Omit<Finish, "color">;
}
const finishKey = (f: Finish) =>
  [f.metalness ?? 0, f.roughness ?? 1, f.emissive ?? "", f.emissiveIntensity ?? 0, f.doubleSide ? 1 : 0].join("|");

/**
 * Bakes pieces into one geometry per finish. Each source geometry is cloned,
 * moved into world space and painted with its colour as a vertex attribute,
 * so a batch is a single draw call however many pieces and colours it holds.
 * The source geometries are never uploaded to the GPU, so they need no
 * disposal; only the merged batches do, which the caller owns.
 */
export function mergePieces(pieces: Piece[]): MergedBatch[] {
  const groups = new Map<string, { finish: Finish; parts: THREE.BufferGeometry[] }>();
  const tint = new THREE.Color();
  for (const p of pieces) {
    const g = p.geometry.clone();
    g.applyMatrix4(p.matrix);
    // Keep only what every source shares, so the batch merges cleanly.
    for (const name of Object.keys(g.attributes))
      if (name !== "position" && name !== "normal") g.deleteAttribute(name);
    // Colour.set converts to the linear working space vertex colours use.
    tint.set(p.finish.color);
    const count = g.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const key = finishKey(p.finish);
    const group = groups.get(key) ?? { finish: p.finish, parts: [] };
    group.parts.push(g.index ? g.toNonIndexed() : g);
    groups.set(key, group);
  }
  return [...groups].map(([key, { finish, parts }]) => {
    const geometry = mergeGeometries(parts)!;
    geometry.computeBoundingSphere();
    const { color: _color, ...rest } = finish;
    void _color;
    return { key, geometry, finish: rest };
  });
}
