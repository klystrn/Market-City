"use client";
import MapGuide from "./MapGuide";
import { type MapFeatures } from "@/domain/map-features";
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
  Columns3,
  CalendarClock,
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
  weightedChange,
} from "@/domain/analytics";
import { sectorIdentities as sectors } from "@/domain/sectors";

import { parseCommand, resolveIntent } from "@/services/commands";
import CompanyPanel from "./CompanyPanel";
import MarketList from "./MarketList";
import { validateSnapshot } from "@/services/snapshot";
import Dialog from "./Dialog";
import WatchlistPanel from "./WatchlistPanel";
import ComparePanel from "./ComparePanel";
import CameraBookmarks from "./CameraBookmarks";
import DistrictDirectory from "./DistrictDirectory";
import LandmarkIndex from "./LandmarkIndex";
import MarketHistoryTimeline from "./MarketHistoryTimeline";
import { usePersistentSet } from "@/hooks/usePersistentSet";
import { useCameraBookmarks } from "@/hooks/useCameraBookmarks";
import type { CameraBookmark } from "@/domain/bookmarks";
import { decodeScenario } from "@/domain/scenarios";
import type { Menu } from "./control-types";
import {
  companiesForCity,
  defaultCityId,
  getCatalogEntry,
  loadCity,
  loadedCity,
} from "@/domain/cities";
import { plotsFor } from "@/domain/cities/layout-key";
import { universeNames } from "@/domain/indexes";
import type { CityDefinition, CityId } from "@/domain/cities/types";
import { usePersistentValue } from "@/hooks/usePersistentValue";
import { useCityPreferences } from "@/hooks/useCityPreferences";
import CityOnboarding from "./CityOnboarding";
import GuidedTour from "./GuidedTour";
const CityScene = dynamic(() => import("@/three/CityScene"), {
  ssr: false,
  loading: () => null,
});
export default function MarketCity() {
  const [cityId, setCityId] = usePersistentValue(
    "market-city-city",
    defaultCityId,
  );
  const [city, setCity] = useState<CityDefinition | null>(() =>
    loadedCity(defaultCityId) ?? null,
  );
  useEffect(() => {
    let live = true;
    const id = getCatalogEntry(cityId).id;
    // Always through loadCity: it resolves from cache once a city has been
    // fetched, so switching back to one already seen costs a microtask.
    void loadCity(id).then((loaded) => {
      if (live) setCity(loaded);
    });
    return () => {
      live = false;
    };
  }, [cityId]);
  // The view stays mounted across city switches, so a change of city keeps the
  // God session, comparison and data mode the way a change of view should.
  return city ? (
    <MarketCityView city={city} setCityId={setCityId} />
  ) : (
    <main className="market-app">
      <div className="loading-screen" role="status">
        <div className="brand-mark large">
          <i />
          <i />
          <i />
          <i />
        </div>
        <h2>Building {getCatalogEntry(cityId).name}…</h2>
        <p>Laying out the districts.</p>
      </div>
    </main>
  );
}
function MarketCityView({
  city,
  setCityId,
}: {
  city: CityDefinition;
  setCityId: (id: string) => void;
}) {
  // Layers, season and the last camera bookmark are remembered per city, so
  // each city keeps the feel it was left in.
  const {
    prefs,
    update: updatePrefs,
    hydrated: prefsReady,
  } = useCityPreferences(city.id);
  const mapFeatures = prefs.mapFeatures;
  const setMapFeatures = useCallback(
    (next: MapFeatures) => updatePrefs({ mapFeatures: next }),
    [updatePrefs],
  );
  const seasonMode = prefs.seasonMode;
  const setSeasonMode = useCallback(
    (next: SeasonMode) => updatePrefs({ seasonMode: next }),
    [updatePrefs],
  );
  // Shown once per city: switching city changes how the map is read.
  const seenCities = usePersistentSet("market-city-oriented");
  const [tourStep, setTourStep] = useState<number | null>(null);
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
  const source = dataMode === "snapshot" && cached ? cached : simulated;
  // A city renders only its own market universe, so the pulse, search, lists
  // and catalysts all agree with the skyline.
  const snapshot = useMemo(() => {
    const companies = companiesForCity(source.companies, city);
    if (companies.length === source.companies.length) return source;
    const tickers = new Set(companies.map((c) => c.ticker));
    return {
      ...source,
      companies,
      // The headline move is recomputed over the narrower universe, so it
      // describes the same companies as the breadth track beneath it.
      market: { ...source.market, indexChange: weightedChange(companies) },
      catalysts: source.catalysts.filter((c) => tickers.has(c.ticker)),
      news: source.news.filter((n) => n.tickers.some((t) => tickers.has(t))),
    };
  }, [source, city]);
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
    [menu, setMenu] = useState<Menu>(null);
  const [dark, setDark] = useState(false),
    [reduced, setReduced] = useState(false),
    [traffic, setTraffic] = useState(true),
    [adaptiveQuality, setAdaptiveQuality] = useState(true),
    [listMode, setListMode] = useState(false),
    [webglFailed, setWebglFailed] = useState(false),
    [ready, setReady] = useState(false),
    [resetKey, setResetKey] = useState(0);
  const [earningsVisible, setEarningsVisible] = useState(true);
  const watchlist = usePersistentSet("market-city-watchlist");
  const [compareSet, setCompareSet] = useState<string[]>([]);
  const cameraBookmarks = useCameraBookmarks();
  const toggleCompare = useCallback(
    (ticker: string) =>
      setCompareSet((prev) =>
        prev.includes(ticker)
          ? prev.filter((t) => t !== ticker)
          : prev.length >= 4
            ? prev
            : [...prev, ticker],
      ),
    [],
  );
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
  const focusSector = useCallback(
    (id: string) => {
      setFocusedSector(id);
      setSelected(null);
      setDeep(false);
      setMatches(
        snapshot.companies.filter((c) => c.sector === id).map((c) => c.ticker),
      );
      setSearchOpen(false);
      setResultLabel("Sector view");
      setResetKey((n) => n + 1);
    },
    [snapshot.companies],
  );
  const focusSubsector = useCallback(
    (id: string) => {
      const result = resolveIntent(
        { type: "subsector", subsector: id },
        snapshot,
      );
      setMatches(result.tickers);
      setResultLabel(result.label);
      setFocusedSector(result.sector ?? null);
      setSelected(null);
      setDeep(false);
      setSearchOpen(false);
      setResetKey((n) => n + 1);
    },
    [snapshot],
  );
  const goToBookmark = useCallback(
    (b: CameraBookmark) => {
      setMenu(null);
      updatePrefs({ bookmarkId: b.id });
      if (b.ticker) {
        setSelected(b.ticker);
        setDeep(b.deep);
        setFocusedSector(null);
        setMatches(null);
        setResultLabel("");
      } else if (b.sector) {
        focusSector(b.sector);
      } else {
        reset();
      }
      setResetKey((n) => n + 1);
    },
    [focusSector, reset, updatePrefs],
  );
  // Hydrate a scenario shared via ?scenario= link, once on mount.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("scenario");
    if (!code) return;
    const decoded = decodeScenario(code);
    if (!decoded) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydrate a scenario from a shared link, once on mount.
    setDataMode("demo");
    setSelected(null);
    setDeep(false);
    setGod(decoded.god);
    setTomorrow(decoded.tomorrow);
    const url = new URL(window.location.href);
    url.searchParams.delete("scenario");
    window.history.replaceState({}, "", url.toString());
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
      if (menu === "tools" && !target.closest(".tools-wrap")) setMenu(null);
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
      // Searching for a company is a deliberate pick, so zoom the camera
      // straight to its building rather than leaving the city framing.
      setDeep(true);
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
  const structuralKey = snapshot.companies
    .map((c) => `${c.ticker}:${c.marketCap}`)
    .join("|");
  const tierByTicker = useMemo(() => {
    const map = new Map<string, string>();
    for (const plot of plotsFor(city, snapshot.companies))
      if (plot.tier) map.set(plot.ticker, plot.tier);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Placement depends on structure, not quote ticks.
  }, [city, structuralKey]);
  // Reopening a city returns to the view it was left in, rather than dropping
  // the reader back at the overview every time they switch.
  const restored = useRef<string | null>(null);
  useEffect(() => {
    if (!prefsReady || !cameraBookmarks.hydrated) return;
    if (restored.current === city.id) return;
    restored.current = city.id;
    const saved = cameraBookmarks.bookmarks.find(
      (b) => b.id === prefs.bookmarkId,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore this city's remembered view once its stored state has been read.
    if (saved) goToBookmark(saved);
  }, [
    city.id,
    prefsReady,
    prefs.bookmarkId,
    cameraBookmarks.hydrated,
    cameraBookmarks.bookmarks,
    goToBookmark,
  ]);
  const company = snapshot.companies.find((c) => c.ticker === selected);
  const tierName = company
    ? city.tiers.find((t) => t.id === tierByTicker.get(company.ticker))?.name
    : undefined;
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
        city={city}
        setCity={(id: CityId) => {
          setCityId(id);
          reset();
        }}
        cityCount={snapshot.companies.length}
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
            city={city}
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
            adaptiveQuality={adaptiveQuality}
            resetKey={resetKey}
            onSelect={onSelect}
            onSector={focusSector}
            onExplore={onExplore}
            onHover={onHover}
            onReady={onReady}
            onFailure={onFailure}
            onMuseum={() => setMenu("history")}
            earningsVisible={earningsVisible}
            onHideEarnings={() => setEarningsVisible(false)}
          />
        </div>
      )}
      {listMode && (
        <MarketList
          city={city}
          snapshot={snapshot}
          matches={matches}
          onSelect={onSelect}
        />
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
            {matches !== null && (
              <b>
                {" "}
                {matches.length}{" "}
                {matches.length === 1 ? "company" : "companies"}
              </b>
            )}
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
          cityContext={tierName ? `${city.tierNoun} · ${tierName}` : city.name}
          indexName={universeNames[city.universe]}
          pinned={watchlist.has(company.ticker)}
          onTogglePin={() => watchlist.toggle(company.ticker)}
          compared={compareSet.includes(company.ticker)}
          onToggleCompare={() => toggleCompare(company.ticker)}
          onSelectTicker={onSelect}
        />
      )}
      {compareSet.length > 0 && menu !== "compare" && (
        <button
          className="glass compare-pill"
          onClick={() => setMenu("compare")}
        >
          <Columns3 size={15} /> Compare ({compareSet.length})
        </button>
      )}
      {!selected && !listMode && (
        <div className="glass market-pulse">
          <div className="index-line">
            <span>{universeNames[city.universe]}</span>
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
          <p>
            {seasonNames[season]} in the city ·{" "}
            {city.bespokeTerrain ? "Japan seasons" : "seasonal environment"}
          </p>
        </div>
      )}
      {!selected && !listMode && !earningsVisible && (
        <button
          className="glass earnings-toggle"
          onClick={() => setEarningsVisible(true)}
          aria-label="Show earnings arrivals"
        >
          <CalendarClock size={15} /> Earnings
        </button>
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
        adaptiveQuality={adaptiveQuality}
        setAdaptiveQuality={setAdaptiveQuality}
        listMode={listMode}
        setListMode={setListMode}
        webglFailed={webglFailed}
        setReady={setReady}
        reset={reset}
        watchlistCount={watchlist.items.length}
        compareCount={compareSet.length}
        bookmarkCount={cameraBookmarks.bookmarks.length}
      />
      {menu === "watchlist" && (
        <WatchlistPanel
          tickers={watchlist.items}
          snapshot={snapshot}
          onSelect={(t) => {
            onSelect(t);
            setMenu(null);
          }}
          onRemove={watchlist.remove}
          onClose={() => setMenu(null)}
          compare={compareSet}
          onToggleCompare={toggleCompare}
        />
      )}
      {menu === "compare" && (
        <ComparePanel
          tickers={compareSet}
          snapshot={snapshot}
          onRemove={(t) => setCompareSet((prev) => prev.filter((x) => x !== t))}
          onClose={() => setMenu(null)}
        />
      )}
      {menu === "camera" && (
        <CameraBookmarks
          bookmarks={cameraBookmarks.bookmarks}
          onSave={(name) =>
            cameraBookmarks.save(name, selected, deep, focusedSector)
          }
          onGo={goToBookmark}
          onRemove={cameraBookmarks.remove}
          onClose={() => setMenu(null)}
          currentLabel={
            selected
              ? deep
                ? `${selected} · deep dive`
                : `${selected} · in focus`
              : focusedSector
                ? `${sectors.find((s) => s.id === focusedSector)?.short ?? focusedSector} district`
                : "City overview"
          }
        />
      )}
      {menu === "directory" && (
        <DistrictDirectory
          onSector={focusSector}
          onSubsector={focusSubsector}
          onClose={() => setMenu(null)}
        />
      )}
      {!listMode && !selected && seenCities.hydrated && !seenCities.has(city.id) && (
        <CityOnboarding
          city={city}
          onStartTour={() => {
            seenCities.add(city.id);
            setTourStep(0);
          }}
          onDismiss={() => seenCities.add(city.id)}
        />
      )}
      {tourStep !== null && (
        <GuidedTour
          city={city}
          step={tourStep}
          setStep={setTourStep}
          onVisit={focusSector}
          onFinish={() => {
            setTourStep(null);
            reset();
          }}
        />
      )}
      {menu === "landmarks" && (
        <LandmarkIndex
          city={city}
          onSector={focusSector}
          onCompany={onSelect}
          onClose={() => setMenu(null)}
        />
      )}
      {menu === "history" && (
        <MarketHistoryTimeline onClose={() => setMenu(null)} />
      )}

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
        <Dialog
          label="How to explore Market City"
          eyebrow="WELCOME TO THE NEIGHBORHOOD"
          onClose={() => setMenu(null)}
        >
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
              <strong>A daily change of color.</strong>Green is up, red is down.
              Stronger color means a larger move.
            </p>
          </div>
          <div className="guide-row">
            <Compass />
            <p>
              <strong>Every town is a sector.</strong>Named streets group
              subsectors. Drag to orbit, use WASD or arrow keys to pan, and
              scroll to zoom. Click a sector label or its ground to enter the
              town. Double-click a company building to explore. Road signs
              appear only at close zoom. Low-rise blocks and civic landmarks are
              scenery.
            </p>
          </div>
          <div className="guide-row">
            <List />
            <p>
              <strong>A view for everyone.</strong>Search any company with your
              keyboard or switch to the lightweight list in Layers & view. Open
              Tools for your watchlist, comparisons, saved camera views, the
              district directory and the Museum of Markets.
            </p>
          </div>
          <button className="primary-button" onClick={() => setMenu(null)}>
            Let’s explore <ArrowUpRight size={16} />
          </button>
        </Dialog>
      )}
    </main>
  );
}
