"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import {
  Component,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Company, Layer, Plot, Snapshot } from "@/domain/types";
import { createPlots, sectors } from "@/domain/city";
import { cityStreets } from "@/domain/geography";
import { landmarks } from "@/domain/geography";
import type { Season } from "@/domain/seasons";
import { subsectorFor } from "@/domain/subsectors";
import MarketDisasters from "./MarketDisasters";
import Terrain from "./Terrain";
import RoadSigns from "./RoadSigns";
import SignatureBuildings, { signatureTickers } from "./SignatureBuildings";
import Buildings from "./Buildings";
import { pct, weightedChange } from "@/domain/analytics";

import type { MapFeatures } from "@/domain/map-features";
type Props = {
  mapFeatures: MapFeatures;
  disasterEffects: boolean;
  season: Season;
  snapshot: Snapshot;
  selected: string | null;
  focus: string | null;
  focusedSector: string | null;
  matches: string[] | null;
  dark: boolean;
  layer: Layer;
  reduced: boolean;
  traffic: boolean;
  resetKey: number;
  onSelect: (ticker: string) => void;
  onSector: (sector: string) => void;
  onExplore: (ticker: string) => void;
  onHover: (company: Company | null, x?: number, y?: number) => void;
  onReady: () => void;
  onFailure: () => void;
};
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
const box = new THREE.BoxGeometry(1, 1, 1);
function Traffic({
  plots,
  companies,
  enabled,
  dark,
}: {
  plots: Plot[];
  companies: Company[];
  enabled: boolean;
  dark: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cabins = useRef<THREE.InstancedMesh>(null);
  const { invalidate } = useThree();
  const object = useMemo(() => new THREE.Object3D(), []);
  const elapsed = useRef(0);
  const vehicles = useMemo(
    () =>
      plots
        .flatMap((p, i) =>
          Array.from(
            {
              length: Math.min(3, Math.ceil(companies[i]?.relativeVolume ?? 1)),
            },
            (_, j) => ({
              p,
              street: cityStreets().find(
                (s) => s.id === subsectorFor(p.ticker)?.id,
              )!,
              offset: j * 2.4 + i,
              speed: 0.8 + (companies[i]?.relativeVolume ?? 1) * 0.5,
            }),
          ),
        )
        .slice(0, 240),
    [plots, companies],
  );
  useFrame((_, delta) => {
    if (!enabled || !ref.current) return;
    elapsed.current += Math.min(delta, 0.1);
    vehicles.forEach(({ street, offset, speed }, i) => {
      const span = street.end[0] - street.start[0];
      const t = (elapsed.current * speed + offset) % span;
      object.position.set(
        i % 2 === 0 ? street.start[0] + t : street.end[0] - t,
        1.28,
        street.z + (i % 2 === 0 ? 0.42 : -0.42),
      );
      object.scale.set(0.85, 0.28, 0.4);
      object.updateMatrix();
      ref.current!.setMatrixAt(i, object.matrix);
      object.position.y = 1.48;
      object.scale.set(0.44, 0.18, 0.34);
      object.updateMatrix();
      cabins.current?.setMatrixAt(i, object.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (cabins.current) cabins.current.instanceMatrix.needsUpdate = true;
    invalidate();
  });
  return enabled ? (
    <>
      <instancedMesh
        ref={ref}
        args={[box, undefined, vehicles.length]}
        frustumCulled={false}
      >
        <meshBasicMaterial color={dark ? "#efcf83" : "#f9f2cd"} />
      </instancedMesh>
      <instancedMesh
        ref={cabins}
        args={[box, undefined, vehicles.length]}
        frustumCulled={false}
      >
        <meshBasicMaterial color={dark ? "#9cafb0" : "#c0d7d6"} />
      </instancedMesh>
    </>
  ) : null;
}
function Camera({
  focus,
  focusedSector,
  plots,
  reduced,
  resetKey,
}: {
  focus: string | null;
  focusedSector: string | null;
  plots: Plot[];
  reduced: boolean;
  resetKey: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { invalidate, size } = useThree();
  const overviewZoom = Math.max(
    1.1,
    Math.min(4.2, size.width / 330, size.height / 245),
  );
  const desired = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
    zoom: number;
  } | null>(null);
  const keys = useRef(new Set<string>());
  useEffect(() => {
    const supported = new Set([
      "w",
      "a",
      "s",
      "d",
      "arrowup",
      "arrowleft",
      "arrowdown",
      "arrowright",
    ]);
    const down = (event: KeyboardEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        !(event.target instanceof Element) ||
        event.target.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"], .company-panel, .radio-panel, .layers-panel, .god-panel, .search-results',
        )
      )
        return;
      const key = event.key.toLowerCase();
      if (!supported.has(key)) return;
      event.preventDefault();
      keys.current.add(key);
      desired.current = null;
      invalidate();
    };
    const up = (event: KeyboardEvent) =>
      keys.current.delete(event.key.toLowerCase());
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    document.addEventListener("focusin", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      document.removeEventListener("focusin", clear);
    };
  }, [invalidate]);
  useEffect(() => {
    const plot = plots.find((p) => p.ticker === focus),
      district = sectors.find((s) => s.id === focusedSector);
    const target = plot
      ? new THREE.Vector3(plot.x, plot.height * 0.45, plot.z)
      : district
        ? new THREE.Vector3(district.x, 0, district.z)
        : new THREE.Vector3(-12, 0, -12);
    desired.current = {
      position: target.clone().add(new THREE.Vector3(270, 285, 330)),
      target,
      zoom: plot
        ? 15
        : district
          ? Math.max(9, overviewZoom * 1.4)
          : overviewZoom,
    };
    invalidate();
  }, [focus, focusedSector, plots, resetKey, invalidate, overviewZoom]);
  useFrame(({ camera }, dt) => {
    if (controls.current && keys.current.size) {
      const held = keys.current;
      const x =
        Number(held.has("d") || held.has("arrowright")) -
        Number(held.has("a") || held.has("arrowleft"));
      const z =
        Number(held.has("s") || held.has("arrowdown")) -
        Number(held.has("w") || held.has("arrowup"));
      const right = new THREE.Vector3()
        .setFromMatrixColumn(camera.matrixWorld, 0)
        .setY(0)
        .normalize();
      const forward = new THREE.Vector3().crossVectors(
        new THREE.Vector3(0, 1, 0),
        right,
      );
      const offset = right
        .multiplyScalar(x)
        .addScaledVector(forward, -z)
        .normalize()
        .multiplyScalar((Math.min(dt, 0.05) * 900) / camera.zoom);
      const target = controls.current.target;
      offset.x =
        THREE.MathUtils.clamp(target.x + offset.x, -155, 155) - target.x;
      offset.z =
        THREE.MathUtils.clamp(target.z + offset.z, -180, 160) - target.z;
      camera.position.add(offset);
      target.add(offset);
      controls.current.update();
      invalidate();
    }
    if (!desired.current || !controls.current) return;
    const d = desired.current,
      amount = reduced ? 1 : 1 - Math.exp(-dt * 5);
    camera.position.lerp(d.position, amount);
    controls.current.target.lerp(d.target, amount);
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, d.zoom, amount);
    camera.updateProjectionMatrix();
    controls.current.update();
    if (
      camera.position.distanceTo(d.position) < 0.02 &&
      Math.abs(camera.zoom - d.zoom) < 0.01
    )
      desired.current = null;
    else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={!reduced}
      dampingFactor={0.1}
      minZoom={overviewZoom}
      maxZoom={24}
      zoomSpeed={1.65}
      minPolarAngle={0.3}
      maxPolarAngle={1.1}
      onStart={() => {
        desired.current = null;
      }}
      onChange={() => invalidate()}
      target={[0, 0, 0]}
    />
  );
}
function Labels({ plots, ...props }: Props & { plots: Plot[] }) {
  const [zoom, setZoom] = useState(4.8);
  const last = useRef(4.8);
  useFrame(({ camera }) => {
    if (Math.abs(camera.zoom - last.current) > 0.7) {
      last.current = camera.zoom;
      setZoom(camera.zoom);
    }
  });
  const visible = props.focus
    ? plots.filter((p) => p.ticker === props.focus)
    : zoom > 11
      ? plots
          .filter(
            (p) =>
              !props.focusedSector ||
              props.snapshot.companies.find((c) => c.ticker === p.ticker)
                ?.sector === props.focusedSector,
          )
          .slice(0, 22)
      : zoom > 8.5
        ? plots.filter(
            (p) =>
              p.height > 13 &&
              (!props.focusedSector ||
                props.snapshot.companies.find((c) => c.ticker === p.ticker)
                  ?.sector === props.focusedSector),
          )
        : [];
  return (
    <>
      {!props.focus &&
        sectors.map((s) => (
          <Html
            key={s.id}
            position={[s.x, 1, s.z + s.depth / 2 - 1]}
            center
            zIndexRange={[4, 0]}
          >
            <button
              className={`district-label ${props.focusedSector && props.focusedSector !== s.id ? "dim" : ""}`}
              aria-label={`Zoom to ${s.short} sector`}
              onClick={() => props.onSector(s.id)}
            >
              <span>{s.short}</span>
              {props.focusedSector === s.id && (
                <small>{landmarks.find((l) => l.sector === s.id)?.name}</small>
              )}
              <b
                className={
                  weightedChange(
                    props.snapshot.companies.filter((c) => c.sector === s.id),
                  ) >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {pct(
                  weightedChange(
                    props.snapshot.companies.filter((c) => c.sector === s.id),
                  ),
                )}
              </b>
            </button>
          </Html>
        ))}
      {visible.map((p) => (
        <Html
          key={p.ticker}
          position={[
            p.x,
            p.height + (signatureTickers.includes(p.ticker) ? 7 : 4),
            p.z,
          ]}
          center
          zIndexRange={[5, 0]}
        >
          <button
            className="building-label"
            onClick={() => props.onSelect(p.ticker)}
            onDoubleClick={() => props.onExplore(p.ticker)}
          >
            {p.ticker}
          </button>
        </Html>
      ))}
      {props.layer === "catalysts" &&
        !props.focus &&
        props.snapshot.catalysts
          .filter((e) => e.significance >= 0.6)
          .slice(0, 14)
          .map((e) => {
            const p = plots.find((p) => p.ticker === e.ticker);
            return p ? (
              <Html
                key={e.id}
                position={[p.x, p.height + 4, p.z]}
                center
                zIndexRange={[6, 0]}
              >
                <button
                  className="beacon"
                  title={`${e.ticker} · ${e.title}`}
                  aria-label={`${e.ticker}: ${e.title}`}
                  onClick={() => props.onSelect(e.ticker)}
                >
                  !
                </button>
              </Html>
            ) : null;
          })}
    </>
  );
}
function Ready({
  onReady,
  onFailure,
}: {
  onReady: () => void;
  onFailure: () => void;
}) {
  const { gl } = useThree();
  useEffect(() => {
    onReady();
    gl.domElement.setAttribute("tabindex", "0");
    gl.domElement.setAttribute(
      "aria-label",
      "City map. WASD or arrow keys to pan, scroll to zoom.",
    );
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener("webglcontextlost", lost);
    return () => gl.domElement.removeEventListener("webglcontextlost", lost);
  }, [onReady, onFailure, gl]);
  return null;
}
function CityScene(props: Props) {
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(true);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const activity = () => {
      setActive(true);
      clearTimeout(timer);
      timer = setTimeout(() => setActive(false), 30000);
    };
    for (const type of ["pointerdown", "pointermove", "wheel", "keydown"])
      window.addEventListener(type, activity, { passive: true });
    timer = setTimeout(() => setActive(false), 30000);
    return () => {
      clearTimeout(timer);
      for (const type of ["pointerdown", "pointermove", "wheel", "keydown"])
        window.removeEventListener(type, activity);
    };
  }, []);
  useEffect(() => {
    const change = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  const structure = props.snapshot.companies
    .map((c) => `${c.ticker}:${c.subsector}:${c.marketCap}`)
    .join("|");
  // Quote updates do not change structural data or reallocate geometry.

  const plots = useMemo(
    () => createPlots(props.snapshot.companies),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Geometry depends on the structural signature, not quote ticks.
    [structure],
  );
  const night =
    props.snapshot.market.session === "closed" ||
    props.snapshot.market.session === "after-hours";
  return (
    <SceneBoundary onFailure={props.onFailure}>
      <Canvas
        orthographic
        camera={{ position: [270, 285, 330], zoom: 2, near: 0.1, far: 1800 }}
        dpr={[1, 1.6]}
        frameloop={visible ? "demand" : "never"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={props.dark ? 0.95 : 0.85} />
        <hemisphereLight
          args={[
            night ? "#8297b4" : "#ffffff",
            props.dark ? "#424d48" : "#a2b6a0",
            0.85,
          ]}
        />
        <directionalLight
          position={[-35, 65, 35]}
          intensity={night ? 1 : 2.1}
          color={night ? "#adbedd" : "#fff1d6"}
        />
        <fog
          attach="fog"
          args={[
            props.dark ? "#222d2b" : "#e9eee6",
            props.snapshot.market.vix > 25 ? 450 : 650,
            1200,
          ]}
        />
        <group position={[0, -0.5, 0]}>
          <Terrain
            mapFeatures={props.mapFeatures}
            dark={props.dark}
            plots={plots}
            season={props.season}
            relativeVolume={
              props.snapshot.companies.reduce(
                (a, c) => a + c.relativeVolume,
                0,
              ) / props.snapshot.companies.length
            }
          />
          <MarketDisasters
            snapshot={props.snapshot}
            plots={plots}
            reduced={props.reduced || !visible || !active}
            enabled={props.disasterEffects}
          />
          {props.mapFeatures.signs && (
            <RoadSigns
              focusedSector={
                props.focus
                  ? (props.snapshot.companies.find(
                      (c) => c.ticker === props.focus,
                    )?.sector ?? null)
                  : props.focusedSector
              }
            />
          )}
          {sectors.map((s) => (
            <mesh
              key={s.id}
              position={[s.x, 1.07, s.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                props.onSector(s.id);
              }}
            >
              <planeGeometry args={[s.width, s.depth]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
          <Buildings
            plots={plots}
            companies={props.snapshot.companies}
            dark={props.dark}
            matches={props.matches}
            focus={props.focus}
            selected={props.selected}
            onSelect={props.onSelect}
            onExplore={props.onExplore}
            onHover={props.onHover}
          />
          {props.mapFeatures.brands && (
            <SignatureBuildings
              plots={plots}
              companies={props.snapshot.companies}
              focus={props.focus}
              matches={props.matches}
              onSelect={props.onSelect}
              onExplore={props.onExplore}
              onHover={props.onHover}
            />
          )}
          <Traffic
            plots={plots}
            companies={plots.map((p) =>
              props.snapshot.companies.find((c) => c.ticker === p.ticker)!,
            )}
            enabled={props.traffic && !props.reduced && visible && active}
            dark={props.dark}
          />
          {props.mapFeatures.labels && <Labels {...props} plots={plots} />}
        </group>
        <Camera
          focus={props.focus}
          focusedSector={props.focusedSector}
          plots={plots}
          reduced={props.reduced}
          resetKey={props.resetKey}
        />
        <Ready onReady={props.onReady} onFailure={props.onFailure} />
      </Canvas>
    </SceneBoundary>
  );
}
export default memo(CityScene);
