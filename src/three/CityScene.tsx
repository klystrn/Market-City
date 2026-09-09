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
import type { CityDefinition } from "@/domain/cities/types";
import { civicSites } from "@/domain/civic";
import type { Season } from "@/domain/seasons";
import { etMinuteOfIso } from "@/domain/intraday";
import MarketDisasters from "./MarketDisasters";
import Terrain from "./Terrain";
import CityTerrain from "./CityTerrain";
import CityLandmarks from "./CityLandmarks";
import BreadthRibbons from "./BreadthRibbons";
import MassColumns from "./MassColumns";
import { plotsFor } from "@/domain/cities/layout-key";
import RoadSigns from "./RoadSigns";
import SignatureBuildings, { signatureTickers } from "./SignatureBuildings";
import Buildings from "./Buildings";
import BreadthGardens from "./BreadthGardens";
import SupplyChainLines from "./SupplyChainLines";
import EarningsArrivals from "./EarningsArrivals";
import IntradayTrails from "./IntradayTrails";
import VolatilityHalos from "./VolatilityHalos";
import PerformanceMonitor, { type QualityTier } from "./PerformanceMonitor";
import { pct, weightedChange } from "@/domain/analytics";

import type { MapFeatures } from "@/domain/map-features";
type Props = {
  city: CityDefinition;
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
  adaptiveQuality: boolean;
  resetKey: number;
  onSelect: (ticker: string) => void;
  onSector: (sector: string) => void;
  onExplore: (ticker: string) => void;
  onHover: (company: Company | null, x?: number, y?: number) => void;
  onReady: () => void;
  onFailure: () => void;
  onMuseum: () => void;
  earningsVisible: boolean;
  onHideEarnings: () => void;
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
// Vehicles run on the active city's own carriageways, so each city's traffic
// follows the streets it actually draws rather than another city's grid.
function Traffic({
  city,
  plots,
  companies,
  enabled,
  dark,
}: {
  city: CityDefinition;
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
  const vehicles = useMemo(() => {
    // Every carriageway segment the city draws, as a straight run a vehicle can
    // travel. Bridges ride higher, matching the deck the terrain renders.
    const runs = city.roads(plots).flatMap((road) =>
      road.points.slice(1).map((b, i) => {
        const a = road.points[i];
        return {
          a,
          b,
          length: Math.hypot(b[0] - a[0], b[1] - a[1]),
          angle: Math.atan2(b[1] - a[1], b[0] - a[0]),
          y: road.bridge ? 1.46 : 1.28,
        };
      }),
    );
    if (!runs.length) return [];
    return plots
      .flatMap((p, i) =>
        Array.from(
          { length: Math.min(3, Math.ceil(companies[i]?.relativeVolume ?? 1)) },
          (_, j) => {
            // The nearest run, so traffic gathers on the streets that serve the
            // busiest lots instead of spreading evenly over the whole network.
            let run = runs[0],
              best = Infinity;
            for (const candidate of runs) {
              const mx = (candidate.a[0] + candidate.b[0]) / 2,
                mz = (candidate.a[1] + candidate.b[1]) / 2;
              const d = Math.hypot(p.x - mx, p.z - mz);
              if (d < best) {
                best = d;
                run = candidate;
              }
            }
            return {
              run,
              offset: j * 2.4 + i,
              speed: 0.8 + (companies[i]?.relativeVolume ?? 1) * 0.5,
            };
          },
        ),
      )
      .slice(0, 240);
  }, [city, plots, companies]);
  useFrame((_, delta) => {
    if (!enabled || !ref.current) return;
    elapsed.current += Math.min(delta, 0.1);
    vehicles.forEach(({ run, offset, speed }, i) => {
      const t = ((elapsed.current * speed + offset) % run.length) / run.length;
      const along = i % 2 === 0 ? t : 1 - t;
      // Half a lane either side of the centre line, so the two directions pass.
      const lane = i % 2 === 0 ? 0.42 : -0.42;
      object.position.set(
        run.a[0] + (run.b[0] - run.a[0]) * along - Math.sin(run.angle) * lane,
        run.y,
        run.a[1] + (run.b[1] - run.a[1]) * along + Math.cos(run.angle) * lane,
      );
      object.rotation.set(0, -run.angle, 0);
      object.scale.set(0.85, 0.28, 0.4);
      object.updateMatrix();
      ref.current!.setMatrixAt(i, object.matrix);
      object.position.y = run.y + 0.2;
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
  city,
  focus,
  focusedSector,
  plots,
  reduced,
  resetKey,
}: {
  city: CityDefinition;
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
    Math.min(
      city.camera.overviewMax,
      size.width / city.camera.overviewDivisor[0],
      size.height / city.camera.overviewDivisor[1],
    ),
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
      district = city.districts.find((s) => s.id === focusedSector);
    const target = plot
      ? new THREE.Vector3(plot.x, plot.height * 0.45, plot.z)
      : district
        ? new THREE.Vector3(district.x, 0, district.z)
        : new THREE.Vector3(...city.camera.target);
    desired.current = {
      position: target.clone().add(new THREE.Vector3(...city.camera.offset)),
      target,
      zoom: plot
        ? 15
        : district
          ? Math.max(9, overviewZoom * 1.4)
          : overviewZoom,
    };
    invalidate();
  }, [focus, focusedSector, plots, resetKey, invalidate, overviewZoom, city]);
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
        props.city.districts.map((s) => (
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
                <small>
                  {props.city.landmarks.find((l) => l.sector === s.id)?.name}
                </small>
              )}
              {(() => {
                // A sector can be empty when the city's universe excludes all
                // of its members, and an empty sector is not a flat one.
                const members = props.snapshot.companies.filter(
                  (c) => c.sector === s.id,
                );
                if (!members.length) return <b className="muted">No members</b>;
                const change = weightedChange(members);
                return (
                  <b className={change >= 0 ? "positive" : "negative"}>
                    {pct(change)}
                  </b>
                );
              })()}
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
  const [tier, setTier] = useState<QualityTier>(0);
  const effectiveTier: QualityTier = props.adaptiveQuality ? tier : 0;
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
    () => plotsFor(props.city, props.snapshot.companies),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Geometry depends on the structural signature, not quote ticks.
    [structure, props.city],
  );
  const night =
    props.snapshot.market.session === "closed" ||
    props.snapshot.market.session === "after-hours";
  const trailCompanies = useMemo(() => {
    const byMove = [...props.snapshot.companies].sort(
      (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent),
    );
    const selected = props.snapshot.companies.find(
      (c) => c.ticker === props.selected,
    );
    const rest = byMove.filter((c) => c.ticker !== selected?.ticker);
    return (selected ? [selected, ...rest] : rest).slice(0, 5);
  }, [props.snapshot.companies, props.selected]);
  const sessionMinute = etMinuteOfIso(props.snapshot.generatedAt);
  const dpr: [number, number] =
    effectiveTier >= 2 ? [1, 1] : effectiveTier === 1 ? [1, 1.25] : [1, 1.6];
  return (
    <SceneBoundary onFailure={props.onFailure}>
      <Canvas
        orthographic
        camera={{
          position: props.city.camera.offset,
          zoom: 2,
          near: 0.1,
          far: 1800,
        }}
        dpr={dpr}
        frameloop={visible ? "demand" : "never"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {props.adaptiveQuality && <PerformanceMonitor onTier={setTier} />}
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
          {props.city.bespokeTerrain ? (
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
          ) : (
            <>
              <CityTerrain
                city={props.city}
                plots={plots}
                dark={props.dark}
                season={props.season}
                districtPads={props.mapFeatures.labels}
              />
              {props.mapFeatures.civic && (
                <CityLandmarks
                  landmarks={props.city.landmarks}
                  season={props.season}
                  labels={props.mapFeatures.labels}
                />
              )}
            </>
          )}
          {props.mapFeatures.breadthRibbons && (
            <BreadthRibbons
              city={props.city}
              companies={props.snapshot.companies}
              dark={props.dark}
            />
          )}
          {props.mapFeatures.massColumns && (
            <MassColumns
              districts={props.city.districts}
              companies={props.snapshot.companies}
              dark={props.dark}
            />
          )}
          <MarketDisasters
            snapshot={props.snapshot}
            plots={plots}
            reduced={props.reduced || !visible || !active}
            enabled={props.disasterEffects}
          />
          {props.mapFeatures.signs && props.city.bespokeTerrain && (
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
          {props.city.districts.map((s) => (
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
          {props.mapFeatures.civic &&
            (() => {
              const museum = props.city.bespokeTerrain
                ? civicSites.find((s) => s.id === "museum")!
                : (props.city.landmarks.find((l) => l.kind === "museum") ??
                  props.city.landmarks[0]);
              return (
                <mesh
                  position={[museum.x, 1.13, museum.z]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onMuseum();
                  }}
                >
                  <circleGeometry args={[museum.radius, 24]} />
                  <meshBasicMaterial
                    transparent
                    opacity={0}
                    depthWrite={false}
                  />
                </mesh>
              );
            })()}
          {props.mapFeatures.breadthGardens && (
            <BreadthGardens
              companies={props.snapshot.companies}
              districts={props.city.districts}
              landmarks={props.city.landmarks}
            />
          )}
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
            city={props.city}
            plots={plots}
            companies={plots.map((p) =>
              props.snapshot.companies.find((c) => c.ticker === p.ticker)!,
            )}
            enabled={
              props.traffic &&
              !props.reduced &&
              visible &&
              active &&
              effectiveTier < 2
            }
            dark={props.dark}
          />
          {props.mapFeatures.connections && (
            <SupplyChainLines
              plots={plots}
              selected={props.selected}
              dark={props.dark}
              onSelect={props.onSelect}
            />
          )}
          {props.mapFeatures.trails && effectiveTier < 2 && !props.reduced && (
            <IntradayTrails
              plots={plots}
              companies={trailCompanies}
              minute={sessionMinute}
              dark={props.dark}
            />
          )}
          {props.mapFeatures.halos && effectiveTier < 2 && (
            <VolatilityHalos
              plots={plots}
              companies={props.snapshot.companies}
              dark={props.dark}
            />
          )}
          {props.mapFeatures.transit &&
            props.earningsVisible &&
            !props.selected && (
              <EarningsArrivals
                catalysts={props.snapshot.catalysts}
                now={Date.parse(props.snapshot.generatedAt)}
                station={
                  props.city.bespokeTerrain
                    ? civicSites.find((s) => s.id === "station")!
                    : (props.city.landmarks.find(
                        (l) => l.kind === "terminal",
                      ) ?? props.city.districts[0])
                }
                onSelect={props.onSelect}
                onDismiss={props.onHideEarnings}
              />
            )}
          {props.mapFeatures.labels && <Labels {...props} plots={plots} />}
        </group>
        <Camera
          city={props.city}
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
