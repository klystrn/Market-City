"use client";
import MapGuide from "./MapGuide";
import { defaultMapFeatures } from "@/domain/map-features";
import GodPanel from "./GodPanel";
import { applyGod, defaultGod, tomorrowSnapshot } from "@/domain/simulation";
import ViewControls from "./ViewControls";
import { japanSeason, seasonNames, type SeasonMode } from "@/domain/seasons";
import CommandBar from "./CommandBar";
import CityHeader from "./CityHeader";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Compass,
  X,
  Building2,
  List,
  CloudSun,
  ArrowLeft,
} from "lucide-react";
import { createDemo } from "@/data/demo";
import type { Company, Layer, Snapshot } from "@/domain/types";
import {
  breadth,
  compact,
  money,
  pct,
  themeFor,
  weather,
} from "@/domain/analytics";

import { parseCommand, resolveIntent } from "@/services/commands";
import CompanyPanel from "./CompanyPanel";
import MarketList from "./MarketList";
import { validateSnapshot } from "@/services/snapshot";
const CityScene = dynamic(() => import("@/three/CityScene"), {
  ssr: false,
  loading: () => null,
});
export default function MarketCity() {
  const [mapFeatures, setMapFeatures] = useState(defaultMapFeatures);
  const [seasonMode, setSeasonMode] = useState<SeasonMode>("auto");
  const [now, setNow] = useState(0);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  const demo = useMemo(() => createDemo(), []);
  const [cached, setCached] = useState<Snapshot | null>(null),
    [dataMode, setDataMode] = useState<"demo" | "snapshot">("demo"),
    [dataMessage, setDataMessage] = useState(
      "Checking for a shared market snapshot…",
    );
  const [god, setGod] = useState(defaultGod);
  const [tomorrow, setTomorrow] = useState<-1 | 0 | 1 | null>(null);
  const today = useMemo(() => applyGod(demo, god), [demo, god]);
  const simulated = useMemo(
    () => (tomorrow === null ? today : tomorrowSnapshot(today, tomorrow)),
    [today, tomorrow],
  );
  const snapshot = dataMode === "snapshot" && cached ? cached : simulated;
  const season =
    seasonMode === "auto"
      ? japanSeason(now || Date.parse(snapshot.generatedAt))
      : seasonMode;
  const [selected, setSelected] = useState<string | null>(null),
    [deep, setDeep] = useState(false),
    [focusedSector, setFocusedSector] = useState<string | null>(null),
    [matches, setMatches] = useState<string[] | null>(null),
    [resultLabel, setResultLabel] = useState("");
  const [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [layer, setLayer] = useState<Layer>("market"),
    [menu, setMenu] = useState<"layers" | "profile" | "info" | "data" | null>(
      null,
    );
  const [dark, setDark] = useState(false),
    [reduced, setReduced] = useState(false),
    [traffic, setTraffic] = useState(true),
    [listMode, setListMode] = useState(false),
    [webglFailed, setWebglFailed] = useState(false),
    [ready, setReady] = useState(false),
    [resetKey, setResetKey] = useState(0);
  const [hover, setHover] = useState<{
    company: Company;
    x: number;
    y: number;
  } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const headerMenu = useRef<HTMLDivElement>(null);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => {
    setWebglFailed(true);
    setListMode(true);
    setReady(true);
  }, []);
  const onHover = useCallback(
    (company: Company | null, x = 0, y = 0) =>
      setHover(company ? { company, x, y } : null),
    [],
  );
  const onSelect = useCallback((ticker: string) => {
    setSelected(ticker);
    setHover(null);
    setSearchOpen(false);
  }, []);
  const onExplore = useCallback((ticker: string) => {
    setSelected(ticker);
    setDeep(true);
    setHover(null);
    setSearchOpen(false);
  }, []);
  const reset = useCallback(() => {
    setSelected(null);
    setDeep(false);
    setFocusedSector(null);
    setMatches(null);
    setResultLabel("");
    setQuery("");
    setResetKey((n) => n + 1);
  }, []);
  // Initial browser preference hydration; subsequent changes use the media subscription.

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 700px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate the browser preference once.
    setReduced(media.matches);
    if (small.matches) {
      setListMode(true);
      setReady(true);
    }
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  // The external market snapshot drives theme transitions with a deadband.

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronize the external market theme.
    setDark((previous) => themeFor(snapshot.market.indexChange, previous));
  }, [snapshot.market.indexChange]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/data/market.json`,
          { signal: controller.signal, cache: "no-cache" },
        );
        if (!response.ok) throw new Error("No shared snapshot");
        const data: unknown = await response.json();
        if (!validateSnapshot(data)) throw new Error("Invalid snapshot");
        if (!data.companies.length && !data.news.length) {
          setDataMessage(
            "No provider data yet. God simulation is fully available.",
          );
          return;
        }
        setCached(data);
        setDataMessage(
          `Shared snapshot · ${new Date(data.generatedAt).toLocaleString()}`,
        );
      } catch (e) {
        if ((e as Error).name !== "AbortError")
          setDataMessage(
            "Shared data unavailable. Explore the God simulation city.",
          );
      }
    }
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 300000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        input.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        if (menu) setMenu(null);
        else if (searchOpen) setSearchOpen(false);
        else if (deep) setDeep(false);
        else setSelected(null);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [menu, searchOpen, deep]);
  useEffect(() => {
    let start: [number, number] | null = null;
    const down = (e: PointerEvent) => {
      start = [e.clientX, e.clientY];
    };
    const dismiss = (e: MouseEvent) => {
      if (
        !(e.target instanceof Element) ||
        (start && Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 6)
      )
        return;
      const target = e.target;
      if (
        selected &&
        !target.closest(".company-panel, .company-explore-card")
      ) {
        setSelected(null);
        setDeep(false);
      }
      if (!target.closest(".command-wrap")) setSearchOpen(false);
      if (
        (menu === "profile" || menu === "data") &&
        !headerMenu.current?.contains(target)
      )
        setMenu(null);
      if (menu === "layers" && !target.closest(".layers-wrap")) setMenu(null);
    };
    document.addEventListener("pointerdown", down, true);
    document.addEventListener("click", dismiss, true);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      document.removeEventListener("click", dismiss, true);
    };
  }, [menu, selected]);
  function execute(text: string) {
    const intent = parseCommand(text, snapshot);
    setSearchOpen(false);
    setQuery("");
    setHover(null);
    if (intent.type === "reset") {
      reset();
      return;
    }
    if (intent.type === "company") {
      setSelected(intent.ticker);
      setFocusedSector(null);
      setDeep(false);
      setMatches(null);
      setResultLabel("");
      return;
    }
    if (intent.type === "unknown") {
      setResultLabel(
        `No match for “${text}”. Try a ticker, sector, “unusual volume” or “earnings this week”.`,
      );
      setMatches(null);
      return;
    }
    const result = resolveIntent(intent, snapshot);
    setMatches(result.tickers);
    setResultLabel(result.label);
    setFocusedSector(result.sector ?? null);
    setSelected(null);
    setDeep(false);
    if (intent.type === "volume") setLayer("volume");
    else if (intent.type === "earnings" || intent.type === "catalysts")
      setLayer("catalysts");
    else setLayer("market");
  }
  const company = snapshot.companies.find((c) => c.ticker === selected);
  const b = breadth(snapshot.companies);
  const suggestions = query.trim()
    ? snapshot.companies
        .filter((c) =>
          `${c.ticker} ${c.name}`.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 5)
    : [];
  const stale =
    dataMode === "snapshot" &&
    now - Date.parse(snapshot.generatedAt) > 36 * 3600000;
  return (
    <main
      className={`market-app ${dark ? "dark" : ""} ${reduced ? "reduced-motion" : ""} ${listMode ? "list-mode" : ""}`}
    >
      <CityHeader
        snapshot={snapshot}
        dataMode={dataMode}
        setDataMode={setDataMode}
        cached={cached}
        dataMessage={dataMessage}
        menu={menu}
        setMenu={setMenu}
        headerMenu={headerMenu}
        reset={reset}
        stale={stale}
      />

      <GodPanel
        settings={god}
        setSettings={(settings) => {
          if (settings.events.length > god.events.length) setLayer("catalysts");
          setGod(settings);
        }}
        today={today}
        tomorrow={tomorrow}
        setTomorrow={setTomorrow}
        onActivate={() => {
          setDataMode("demo");
          setSelected(null);
          setDeep(false);
        }}
      />
      <CommandBar
        query={query}
        setQuery={setQuery}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        input={input}
        execute={execute}
        suggestions={suggestions}
      />
      {!listMode && (
        <div className="scene-region" aria-label="Interactive 3D market city">
          <CityScene
            mapFeatures={mapFeatures}
            disasterEffects={
              dataMode === "demo" && god.effects && mapFeatures.disasters
            }
            season={season}
            snapshot={snapshot}
            selected={selected}
            focus={deep ? selected : null}
            focusedSector={focusedSector}
            matches={matches}
            dark={dark}
            layer={layer}
            reduced={reduced}
            traffic={traffic}
            resetKey={resetKey}
            onSelect={onSelect}
            onSector={(id) => {
              setFocusedSector(id);
              setSelected(null);
              setDeep(false);
              setMatches(
                snapshot.companies
                  .filter((c) => c.sector === id)
                  .map((c) => c.ticker),
              );
              setSearchOpen(false);
              setResultLabel("Sector view");
              setResetKey((n) => n + 1);
            }}
            onExplore={onExplore}
            onHover={onHover}
            onReady={onReady}
            onFailure={onFailure}
          />
        </div>
      )}
      {listMode && (
        <MarketList snapshot={snapshot} matches={matches} onSelect={onSelect} />
      )}
      {!ready && !listMode && (
        <div className="loading-screen" role="status">
          <div className="brand-mark large">
            <i />
            <i />
            <i />
            <i />
          </div>
          <h2>
            Building today’s market<span>.</span>
          </h2>
          <p>Mapping sectors. Preparing the skyline.</p>
          <div className="loading-track">
            <span />
          </div>
          <button
            className="text-button"
            onClick={() => {
              setListMode(true);
              setReady(true);
            }}
          >
            Open lightweight view instead
          </button>
        </div>
      )}
      {!listMode && <MapGuide />}
      {deep && (
        <button
          className="glass back-city"
          onClick={() => {
            setDeep(false);
            setFocusedSector(null);
          }}
        >
          <ArrowLeft size={16} /> City view
        </button>
      )}
      {resultLabel && (
        <div className="glass result-banner" role="status">
          <span>
            {resultLabel}
            {matches !== null && <b> {matches.length} companies</b>}
          </span>
          <button
            className="icon-button"
            onClick={reset}
            aria-label="Clear filter"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {hover && !selected && !searchOpen && (
        <div
          className="glass company-tooltip"
          style={{
            left: Math.min(hover.x + 16, window.innerWidth - 245),
            top: Math.max(90, Math.min(hover.y - 90, window.innerHeight - 150)),
          }}
        >
          <div className="panel-heading">
            <strong>{hover.company.ticker}</strong>
            <b
              className={
                hover.company.changePercent >= 0 ? "positive" : "negative"
              }
            >
              {pct(hover.company.changePercent)}
            </b>
          </div>
          <p>{hover.company.name}</p>
          <strong>{money(hover.company.price)}</strong>
          <span className="fine-print">
            {hover.company.dataStatus.toUpperCase()} · $
            {compact(hover.company.marketCap)}
          </span>
        </div>
      )}
      {company && (
        <CompanyPanel
          key={company.ticker}
          company={company}
          snapshot={snapshot}
          deep={deep}
          now={now}
          onExplore={() => {
            setDeep(true);
            setSearchOpen(false);
          }}
          onClose={() => {
            setSelected(null);
            setDeep(false);
          }}
          onBack={() => {
            setDeep(false);
            setSelected(null);
            setFocusedSector(null);
          }}
        />
      )}
      {!selected && !listMode && (
        <div className="market-pulse">
          <div className="index-line">
            <span>S&P 500</span>
            <b
              className={
                snapshot.market.indexChange >= 0 ? "positive" : "negative"
              }
            >
              {snapshot.market.indexChange >= 0 ? "↗" : "↘"}{" "}
              {pct(snapshot.market.indexChange)}
            </b>
          </div>
          <div className="breadth-track">
            <span
              style={{ width: `${(b.up / snapshot.companies.length) * 100}%` }}
            />
          </div>
          <div className="breadth-label">
            <span>{b.up} advancing</span>
            <span>{b.down} declining</span>
          </div>
          <p>
            <CloudSun size={13} />
            {weather(snapshot)} <span>·</span> VIX{" "}
            {snapshot.market.vix.toFixed(1)}
          </p>
          <p>{seasonNames[season]} in the city · Japan seasons</p>
        </div>
      )}
      <ViewControls
        mapFeatures={mapFeatures}
        setMapFeatures={setMapFeatures}
        seasonMode={seasonMode}
        setSeasonMode={setSeasonMode}
        snapshot={snapshot}
        menu={menu}
        setMenu={setMenu}
        layer={layer}
        setLayer={setLayer}
        reduced={reduced}
        setReduced={setReduced}
        traffic={traffic}
        setTraffic={setTraffic}
        listMode={listMode}
        setListMode={setListMode}
        webglFailed={webglFailed}
        setReady={setReady}
        reset={reset}
      />

      {tomorrow !== null && dataMode === "demo" && (
        <div className="glass result-banner" role="status">
          Next session ·{" "}
          {tomorrow < 0 ? "Downside" : tomorrow > 0 ? "Upside" : "Baseline"}{" "}
          what-if · unvalidated simulation
        </div>
      )}
      <div className="status-line">
        <span>
          <span className="status-dot" />
          {dataMode === "demo"
            ? "GOD · SIMULATED DATA"
            : snapshot.companies.some((c) => c.dataStatus === "demo")
              ? "SHARED SNAPSHOT · INCLUDES DEMO DATA"
              : stale
                ? "STALE SNAPSHOT"
                : "SHARED DATA SNAPSHOT"}
        </span>
        <span>
          {listMode
            ? "Select a company to explore"
            : "WASD / arrows to pan · Drag to orbit · Scroll to zoom"}
        </span>
        <span>
          {new Date(snapshot.generatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/New_York",
          })}{" "}
          ET
        </span>
      </div>
      {menu === "info" && (
        <div className="info-scrim" onClick={() => setMenu(null)}>
          <section
            className="glass info-panel"
            role="dialog"
            aria-modal="true"
            aria-label="How to explore Market City"
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              const controls = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>(
                  "button, a[href], input, select",
                ),
              );
              const first = controls[0],
                last = controls[controls.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-heading">
              <span className="eyebrow">WELCOME TO THE NEIGHBORHOOD</span>
              <button
                className="icon-button"
                aria-label="Close guide"
                onClick={() => setMenu(null)}
                autoFocus
              >
                <X size={18} />
              </button>
            </div>
            <h2>
              Read the market.
              <br />
              Explore the city.
            </h2>
            <div className="guide-row">
              <Building2 />
              <p>
                <strong>Bigger company. Bigger building.</strong>Footprint and
                height represent compressed market capitalization.
              </p>
            </div>
            <div className="guide-row">
              <ArrowDown />
              <p>
                <strong>A daily change of color.</strong>Green is up, red is
                down. Stronger color means a larger move.
              </p>
            </div>
            <div className="guide-row">
              <Compass />
              <p>
                <strong>Every town is a sector.</strong>Named streets group
                subsectors. Drag to orbit, use WASD or arrow keys to pan, and
                scroll to zoom. Click a sector label or its ground to enter the
                town. Double-click a company building to explore. Road signs
                appear only at close zoom. Low-rise blocks and civic landmarks
                are scenery.
              </p>
            </div>
            <div className="guide-row">
              <List />
              <p>
                <strong>A view for everyone.</strong>Search any company with
                your keyboard or switch to the lightweight list in Layers &
                view.
              </p>
            </div>
            <button className="primary-button" onClick={() => setMenu(null)}>
              Let’s explore <ArrowUpRight size={16} />
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
