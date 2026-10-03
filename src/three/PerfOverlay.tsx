import { useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
// What the renderer is actually doing, shown on request via ?perf=1.
//
// The scene already trims itself when frames get slow, but nothing recorded
// what "slow" was or what it cost — so every performance decision was a guess
// about which of draw calls, instance count or fill rate was the problem. This
// reports all three from the renderer's own counters rather than from anything
// the app believes about itself.
//
// It is deliberately opt-in and absent otherwise: a permanent overlay is one
// more thing to render, and this one exists to measure, not to decorate.
export interface PerfSample {
  /** Milliseconds per rendered frame, averaged over the last second. */
  frameMs: number;
  /** Worst single frame in that window, which is what a reader actually feels. */
  worstMs: number;
  drawCalls: number;
  triangles: number;
  /** Geometries and textures currently resident. */
  geometries: number;
  textures: number;
  programs: number;
}
/**
 * Whether ?perf=1 is set. Read through useSyncExternalStore rather than an
 * effect: the page is statically exported and hydrated, so reading the query
 * string during render would disagree with the server's HTML, and setting it
 * from an effect would be a synchronous state write in an effect body.
 * The flag never changes within a page load, so the subscribe function has
 * nothing to listen to.
 */
const neverChanges = () => () => {};
export function usePerfEnabled(): boolean {
  return useSyncExternalStore(
    neverChanges,
    () => new URLSearchParams(window.location.search).get("perf") === "1",
    () => false,
  );
}
/**
 * Lives inside the Canvas, where the renderer is reachable. Samples once a
 * second rather than every frame: reading the counters is cheap, but calling
 * setState per frame would itself distort the number being measured.
 */
export default function PerfOverlay({
  onSample,
}: {
  onSample: (sample: PerfSample) => void;
}) {
  const { gl } = useThree();
  const frames = useRef<number[]>([]);
  const since = useRef(0);
  useFrame((_, delta) => {
    if (delta <= 0) return;
    frames.current.push(delta * 1000);
    since.current += delta;
    if (since.current < 1) return;
    const samples = frames.current;
    const info = gl.info;
    onSample({
      frameMs: samples.reduce((a, b) => a + b, 0) / samples.length,
      worstMs: Math.max(...samples),
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length ?? 0,
    });
    frames.current = [];
    since.current = 0;
  });
  return null;
}
/**
 * The readout itself, outside the Canvas so it is ordinary DOM. Frame time
 * leads rather than a frames-per-second figure: milliseconds are what a budget
 * is spent in, and the difference between 60fps and 50fps reads as a rounding
 * error while 16.7ms against 20ms does not.
 */
export function PerfReadout({ sample }: { sample: PerfSample | null }) {
  if (!sample) return null;
  const rows: [string, string][] = [
    ["frame", `${sample.frameMs.toFixed(1)} ms`],
    ["worst", `${sample.worstMs.toFixed(1)} ms`],
    ["draws", String(sample.drawCalls)],
    ["tris", `${(sample.triangles / 1000).toFixed(0)}k`],
    ["geom", String(sample.geometries)],
    ["prog", String(sample.programs)],
  ];
  return (
    <aside className="perf-readout" aria-label="Rendering performance">
      <span className="eyebrow">RENDERER</span>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p>Only rendered frames count; the scene draws on demand.</p>
    </aside>
  );
}
