import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Company, Plot } from "@/domain/types";
import type { ThreeEvent } from "@react-three/fiber";
// One flagship per sector so every district has at least one instantly
// recognizable landmark, not just the technology-adjacent giants.
export const signatureTickers = [
  "AAPL",
  "MSFT",
  "AMZN",
  "GOOGL",
  "META",
  "NVDA",
  "TSLA",
  "NFLX",
  "JPM",
  "LLY",
  "CAT",
  "WMT",
  "XOM",
  "NEE",
  "LIN",
  "PLD",
];
const apple = new THREE.Shape();
apple.moveTo(0, -0.78);
apple.bezierCurveTo(-0.3, -1.02, -0.55, -0.92, -0.79, -0.54);
apple.bezierCurveTo(-1.1, -0.05, -1.12, 0.55, -0.69, 0.78);
apple.bezierCurveTo(-0.39, 0.99, -0.16, 0.71, 0, 0.72);
apple.bezierCurveTo(0.26, 0.76, 0.55, 1, 0.87, 0.58);
apple.bezierCurveTo(0.4, 0.36, 0.4, -0.05, 0.87, -0.22);
apple.bezierCurveTo(0.68, -0.68, 0.37, -1.02, 0.1, -0.79);
apple.closePath();
const leaf = new THREE.Shape();
leaf.moveTo(0.02, 0.89);
leaf.bezierCurveTo(0.02, 1.23, 0.3, 1.49, 0.62, 1.47);
leaf.bezierCurveTo(0.59, 1.1, 0.35, 0.9, 0.02, 0.89);
const appleGeometry = new THREE.ExtrudeGeometry([apple, leaf], {
  depth: 0.12,
  bevelEnabled: true,
  bevelSegments: 1,
  steps: 1,
  bevelSize: 0.035,
  bevelThickness: 0.025,
});
export function Wordmark({
  text,
  color,
  background,
  width,
  height = 1.1,
  position,
  active,
}: {
  text: string;
  color: string;
  background: string;
  width: number;
  height?: number;
  position: [number, number, number];
  active: boolean;
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = color;
    ctx.font = "bold 74px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 69, 480);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, color, background]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent opacity={active ? 1 : 0.3} />
    </mesh>
  );
}
function Signature({ p, active }: { p: Plot; active: boolean }) {
  const { width: w, depth: d, height: h } = p;
  const tone = (color: string) =>
    active
      ? color
      : new THREE.Color(color).lerp(new THREE.Color("#bac5be"), 0.78);
  const curve = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(Math.sin(t) * w * 0.4, Math.sin(t * 2) * 0.65, 0),
      );
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [w]);
  const smile = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-w * 0.34, 0, 0),
        new THREE.Vector3(0, -1.2, 0),
        new THREE.Vector3(w * 0.34, 0.15, 0),
      ),
    [w],
  );
  const block = (
    key: string,
    position: [number, number, number],
    scale: [number, number, number],
    color: string,
  ) => (
    <mesh key={key} position={position}>
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color={tone(color)}
        metalness={0.25}
        roughness={0.55}
      />
    </mesh>
  );
  if (p.ticker === "AAPL")
    return (
      <group>
        <mesh position={[0, h + 2.5, 0]} rotation={[0, 0.55, 0]} scale={1.7}>
          <primitive object={appleGeometry} attach="geometry" />
          <meshStandardMaterial
            color={tone("#edf1f2")}
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
        {block("plinth", [0, h + 0.65, 0], [w * 0.45, 0.3, d * 0.4], "#bdcbd2")}
      </group>
    );
  if (p.ticker === "MSFT")
    return (
      <group>
        {["#f25022", "#7fba00", "#00a4ef", "#ffb900"].map((color, i) =>
          block(
            "window" + i,
            [((i % 2) - 0.5) * 1.7, h * 0.72 + (i < 2 ? 1.7 : 0), d / 2 + 0.12],
            [1.5, 1.5, 0.15],
            color,
          ),
        )}
        {block(
          "atrium",
          [0, h * 0.19, 0],
          [w * 0.32, 0.35, d * 0.95],
          "#74bfd8",
        )}
      </group>
    );
  if (p.ticker === "AMZN")
    return (
      <group>
        {[-1, 0, 1].map((i) => (
          <mesh key={i} position={[i * w * 0.18, 1.3, d * 0.12]}>
            <sphereGeometry
              args={[w * 0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial
              color={tone("#8ed0c6")}
              roughness={0.18}
              metalness={0.3}
            />
          </mesh>
        ))}
        <Wordmark
          text="amazon"
          color="#ffffff"
          background="#273647"
          width={w * 0.82}
          height={1.35}
          position={[0, h * 0.42, d / 2 + 0.14]}
          active={active}
        />
        <mesh position={[0, h * 0.34, d / 2 + 0.2]}>
          <tubeGeometry args={[smile, 24, 0.13, 6, false]} />
          <meshStandardMaterial color={tone("#f5a623")} />
        </mesh>
        {block(
          "delivery-canopy",
          [0, 1.6, d / 2 + 0.28],
          [w * 0.9, 0.22, 0.65],
          "#eda637",
        )}
      </group>
    );
  if (p.ticker === "GOOGL")
    return (
      <group>
        {["#4285f4", "#ea4335", "#fbbc05", "#34a853"].map((color, i) => (
          <mesh
            key={color}
            position={[0, h * 0.37, d / 2 + 0.13]}
            rotation={[0, 0, (i * Math.PI) / 2]}
          >
            <torusGeometry args={[1, 0.22, 8, 16, Math.PI / 2 - 0.1]} />
            <meshStandardMaterial color={tone(color)} />
          </mesh>
        ))}
        {block(
          "g-bar",
          [0.55, h * 0.37, d / 2 + 0.15],
          [1.1, 0.32, 0.2],
          "#4285f4",
        )}
        {["#4285f4", "#ea4335", "#fbbc05", "#34a853"].map((color, i) =>
          block(
            "terrace" + i,
            [-w * 0.3 + i * w * 0.18, h * 0.25 + 0.25, d * 0.35],
            [w * 0.14, 0.3, 0.55],
            color,
          ),
        )}
      </group>
    );
  if (p.ticker === "META")
    return (
      <group>
        <mesh position={[0, h * 0.7, d * 0.44]} scale={[1, 1.8, 1]}>
          <tubeGeometry args={[curve, 64, 0.18, 8, false]} />
          <meshStandardMaterial
            color={tone("#2275ed")}
            metalness={0.4}
            roughness={0.25}
          />
        </mesh>
        {block(
          "skydeck",
          [0, h * 0.69, 0],
          [w * 0.65, 0.2, d * 0.4],
          "#4095d2",
        )}
      </group>
    );
  if (p.ticker === "NVDA")
    return (
      <group>
        {block(
          "chip-crown",
          [0, h + 0.7, 0],
          [w * 0.48, 0.5, d * 0.52],
          "#26392c",
        )}
        {block(
          "chip-die",
          [0, h + 1.05, 0],
          [w * 0.25, 0.24, d * 0.29],
          "#8dca24",
        )}
        {Array.from({ length: 5 }, (_, i) =>
          [-1, 1].map((side) =>
            block(
              "pin" + i + side,
              [(i - 2) * w * 0.08, h + 0.72, side * d * 0.29],
              [w * 0.035, 0.18, d * 0.13],
              "#b2cd88",
            ),
          ),
        )}
        <Wordmark
          text="NVIDIA"
          color="#a6d944"
          background="#223529"
          width={w * 0.85}
          height={1.6}
          position={[0, h * 0.35, d / 2 + 0.13]}
          active={active}
        />
      </group>
    );
  if (p.ticker === "TSLA")
    return (
      <group>
        <Wordmark
          text="T"
          color="#e83243"
          background="#edf0e6"
          width={2}
          height={3.4}
          position={[0, h * 0.65, d * 0.36 + 0.12]}
          active={active}
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            {block(
              "charger",
              [side * w * 0.28, 0.75, d / 2 + 0.45],
              [0.45, 1.5, 0.25],
              "#f1efdf",
            )}
            {block(
              "charger-red",
              [side * w * 0.28, 1.45, d / 2 + 0.6],
              [0.36, 0.2, 0.07],
              "#df4351",
            )}
            {block(
              "charger-screen",
              [side * w * 0.28, 0.9, d / 2 + 0.6],
              [0.23, 0.6, 0.06],
              "#35424b",
            )}
          </group>
        ))}
        {block(
          "solar-roof",
          [0, h + 0.6, 0],
          [w * 0.76, 0.15, d * 0.56],
          "#35677f",
        )}
      </group>
    );
  if (p.ticker === "NFLX")
    return (
      <group>
        <Wordmark
          text="N"
          color="#e72a3b"
          background="#202b34"
          width={2.2}
          height={4.2}
          position={[-w * 0.28, h * 0.6, d / 2 + 0.13]}
          active={active}
        />
        <Wordmark
          text="NETFLIX"
          color="#ffe5df"
          background="#b62e44"
          width={w * 0.85}
          height={0.9}
          position={[0, 2, d / 2 + 0.7]}
          active={active}
        />
        {block(
          "cinema-marquee",
          [0, 2.55, d / 2 + 0.3],
          [w * 0.95, 0.2, 1],
          "#d74550",
        )}
      </group>
    );
  // Financials — a tapering glass tower crossed by a diagonal exoskeleton,
  // the single most recognizable feature of JPMorgan's 270 Park Avenue.
  if (p.ticker === "JPM") {
    const braceLength = Math.hypot(w, h) * 0.94;
    const braceAngle = Math.atan2(h, w);
    return (
      <group>
        {[braceAngle, -braceAngle].map((angle) => (
          <mesh
            key={angle}
            position={[0, h * 0.52, d / 2 + 0.15]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[braceLength, 0.2, 0.1]} />
            <meshStandardMaterial
              color={tone("#a7bac6")}
              metalness={0.65}
              roughness={0.25}
            />
          </mesh>
        ))}
        <Wordmark
          text="JPMORGAN"
          color="#ffffff"
          background="#101b26"
          width={w * 0.78}
          height={0.85}
          position={[0, h * 0.18, d / 2 + 0.18]}
          active={active}
        />
      </group>
    );
  }
  // Healthcare — a rooftop cross and an italic red wordmark, echoing the
  // universal healthcare symbol alongside the brand's own color.
  if (p.ticker === "LLY")
    return (
      <group>
        {block("cross-v", [0, h + 1, 0], [0.32, 1.5, 0.32], "#e0182d")}
        {block("cross-h", [0, h + 1, 0], [1.5, 0.32, 0.32], "#e0182d")}
        <Wordmark
          text="Lilly"
          color="#e0182d"
          background="#ffffff"
          width={w * 0.7}
          height={1.2}
          position={[0, h * 0.5, d / 2 + 0.13]}
          active={active}
        />
        {block(
          "canopy",
          [0, 1.5, d / 2 + 0.35],
          [w * 0.7, 0.18, 0.5],
          "#e0182d",
        )}
      </group>
    );
  // Industrials — Caterpillar yellow crown and a crawler-track base row.
  if (p.ticker === "CAT")
    return (
      <group>
        {block(
          "crown-band",
          [0, h + 0.4, 0],
          [w * 0.92, 0.8, d * 0.92],
          "#ffcd11",
        )}
        <Wordmark
          text="CAT"
          color="#000000"
          background="#ffcd11"
          width={w * 0.6}
          height={1.4}
          position={[0, h * 0.5, d / 2 + 0.13]}
          active={active}
        />
        {Array.from({ length: 5 }, (_, i) =>
          block(
            "tread" + i,
            [-w * 0.4 + i * w * 0.2, 0.55, d / 2 + 0.3],
            [w * 0.14, 0.5, 0.22],
            "#26241f",
          ),
        )}
      </group>
    );
  // Staples — a rooftop "spark" of six spokes above the Walmart wordmark.
  if (p.ticker === "WMT")
    return (
      <group>
        <Wordmark
          text="walmart"
          color="#0071ce"
          background="#ffffff"
          width={w * 0.85}
          height={1.1}
          position={[0, h * 0.45, d / 2 + 0.13]}
          active={active}
        />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.55, h + 0.75, Math.sin(a) * 0.55]}
              rotation={[0, -a, 0]}
            >
              <boxGeometry args={[0.9, 0.16, 0.16]} />
              <meshStandardMaterial
                color={tone("#ffc220")}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
          );
        })}
      </group>
    );
  // Energy — a lit flare stack, the most recognizable refinery silhouette.
  if (p.ticker === "XOM")
    return (
      <group>
        <Wordmark
          text="ExxonMobil"
          color="#e31837"
          background="#ffffff"
          width={w * 0.85}
          height={0.9}
          position={[0, h * 0.45, d / 2 + 0.13]}
          active={active}
        />
        <mesh position={[w * 0.3, h + 1.3, -d * 0.2]}>
          <cylinderGeometry args={[0.12, 0.16, 2.2, 8]} />
          <meshStandardMaterial
            color={tone("#8a8f92")}
            metalness={0.7}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[w * 0.3, h + 2.6, -d * 0.2]}>
          <coneGeometry args={[0.32, 0.6, 8]} />
          <meshStandardMaterial
            color={tone("#f5a623")}
            emissive={tone("#f5a623")}
            emissiveIntensity={active ? 0.6 : 0.1}
          />
        </mesh>
      </group>
    );
  // Utilities — a rooftop wind turbine, tying the brand to renewables and
  // to the district's own Wind Garden landmark.
  if (p.ticker === "NEE")
    return (
      <group>
        <Wordmark
          text="NextEra"
          color="#00558c"
          background="#ffffff"
          width={w * 0.8}
          height={1}
          position={[0, h * 0.45, d / 2 + 0.13]}
          active={active}
        />
        <mesh position={[0, h + 1.3, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.6, 8]} />
          <meshStandardMaterial color={tone("#e7ece9")} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <group
            key={i}
            position={[0, h + 2.1, 0]}
            rotation={[0, 0, (i * Math.PI * 2) / 3]}
          >
            <mesh position={[0.75, 0, 0]}>
              <boxGeometry args={[1.4, 0.14, 0.05]} />
              <meshStandardMaterial color={tone("#e7ece9")} />
            </mesh>
          </group>
        ))}
      </group>
    );
  // Materials — an orbiting-molecule motif for an industrial gases maker.
  if (p.ticker === "LIN")
    return (
      <group>
        <Wordmark
          text="Linde"
          color="#00539b"
          background="#ffffff"
          width={w * 0.7}
          height={1.1}
          position={[0, h * 0.45, d / 2 + 0.13]}
          active={active}
        />
        <mesh position={[0, h + 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.09, 8, 20]} />
          <meshStandardMaterial
            color={tone("#00539b")}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.7, h + 1, Math.sin(a) * 0.7]}
            >
              <sphereGeometry args={[0.22, 10, 8]} />
              <meshStandardMaterial
                color={tone("#8ec9e8")}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
    );
  // Real estate — an alternating sawtooth roofline, the classic warehouse
  // and logistics-park silhouette.
  if (p.ticker === "PLD")
    return (
      <group>
        <Wordmark
          text="Prologis"
          color="#f37021"
          background="#ffffff"
          width={w * 0.8}
          height={1}
          position={[0, h * 0.45, d / 2 + 0.13]}
          active={active}
        />
        {Array.from({ length: 4 }, (_, i) =>
          block(
            "sawtooth" + i,
            [-w * 0.3 + i * w * 0.2, h + 0.35, 0],
            [w * 0.16, 0.5, d * 0.9],
            i % 2 ? "#f37021" : "#5b6b73",
          ),
        )}
      </group>
    );
  // Defensive fallback for a future signature ticker with no bespoke
  // geometry yet: still readable as a landmark via its own wordmark.
  return (
    <group>
      <Wordmark
        text={p.ticker}
        color="#283d35"
        background="#ffffff"
        width={w * 0.7}
        height={1.2}
        position={[0, h * 0.5, d / 2 + 0.13]}
        active={active}
      />
    </group>
  );
}
export default function SignatureBuildings({
  plots,
  companies,
  focus,
  matches,
  onSelect,
  onExplore,
  onHover,
}: {
  plots: Plot[];
  companies: Company[];
  focus: string | null;
  matches: string[] | null;
  onSelect: (ticker: string) => void;
  onExplore: (ticker: string) => void;
  onHover: (c: Company | null, x?: number, y?: number) => void;
}) {
  const select = (e: ThreeEvent<MouseEvent>, ticker: string, deep = false) => {
    e.stopPropagation();
    if (deep) onExplore(ticker);
    else onSelect(ticker);
  };
  return (
    <>
      {plots
        .filter((p) => signatureTickers.includes(p.ticker))
        .map((p) => (
          <group
            key={p.ticker}
            position={[p.x, 1.1, p.z]}
            onClick={(e) => select(e, p.ticker)}
            onDoubleClick={(e) => select(e, p.ticker, true)}
            onPointerMove={(e) => {
              e.stopPropagation();
              onHover(
                companies.find((c) => c.ticker === p.ticker)!,
                e.clientX,
                e.clientY,
              );
            }}
            onPointerOut={() => onHover(null)}
          >
            <Signature
              p={p}
              active={
                (!focus || focus === p.ticker) &&
                (!matches || matches.includes(p.ticker))
              }
            />
          </group>
        ))}
    </>
  );
}
