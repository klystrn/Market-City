"use client";
import {
  Layers3,
  ChevronDown,
  Check,
  Building2,
  SlidersHorizontal,
  Sun,
  RotateCcw,
  Info,
  X,
} from "lucide-react";
import type { Snapshot, Layer } from "@/domain/types";
import type { Menu } from "./control-types";
import MapDetails from "./MapDetails";
import type { MapFeatures } from "@/domain/map-features";
import Radio from "./Radio";
import type { SeasonMode } from "@/domain/seasons";
export default function ViewControls({
  mapFeatures,
  setMapFeatures,
  seasonMode,
  setSeasonMode,
  snapshot,
  menu,
  setMenu,
  layer,
  setLayer,
  reduced,
  setReduced,
  traffic,
  setTraffic,
  listMode,
  setListMode,
  webglFailed,
  setReady,
  reset,
}: {
  mapFeatures: MapFeatures;
  setMapFeatures: (v: MapFeatures) => void;
  seasonMode: SeasonMode;
  setSeasonMode: (season: SeasonMode) => void;
  snapshot: Snapshot;
  menu: Menu;
  setMenu: (v: Menu) => void;
  layer: Layer;
  setLayer: (v: Layer) => void;
  reduced: boolean;
  setReduced: (v: boolean) => void;
  traffic: boolean;
  setTraffic: (v: boolean) => void;
  listMode: boolean;
  setListMode: (v: boolean) => void;
  webglFailed: boolean;
  setReady: (v: boolean) => void;
  reset: () => void;
}) {
  return (
    <footer className="bottom-bar">
      <Radio snapshot={snapshot} />
      <div className="city-legend">
        <span>DAILY CHANGE</span>
        <div className="legend-scale">
          <span>−5%</span>
          <i />
          <span>+5%</span>
        </div>
        <p>Building size = market cap</p>
      </div>
      <div className="view-controls">
        <div className="layers-wrap">
          {menu === "layers" && (
            <section className="glass layers-panel">
              <div className="panel-heading">
                <span className="eyebrow">MAKE IT YOUR VIEW</span>
                <button
                  className="icon-button"
                  aria-label="Close view settings"
                  onClick={() => setMenu(null)}
                >
                  <X size={15} />
                </button>
              </div>
              {(["market", "volume", "catalysts"] as Layer[]).map((l) => (
                <button
                  key={l}
                  className={`layer-option ${layer === l ? "active" : ""}`}
                  onClick={() => setLayer(l)}
                >
                  <span>
                    {l === "market" ? (
                      <Building2 size={17} />
                    ) : l === "volume" ? (
                      <SlidersHorizontal size={17} />
                    ) : (
                      <Sun size={17} />
                    )}
                    <span>
                      <strong>
                        {l === "market"
                          ? "Market"
                          : l === "volume"
                            ? "Trading activity"
                            : "Catalysts"}
                      </strong>
                      <small>
                        {l === "market"
                          ? "The shape of the market"
                          : l === "volume"
                            ? "Traffic shows relative volume"
                            : "Discover significant events"}
                      </small>
                    </span>
                  </span>
                  {layer === l && <Check size={16} />}
                </button>
              ))}
              <MapDetails features={mapFeatures} setFeatures={setMapFeatures} />
              <div className="settings-divider" />
              <label className="toggle-row">
                <span>Season</span>
                <select
                  aria-label="City season"
                  value={seasonMode}
                  onChange={(e) => setSeasonMode(e.target.value as SeasonMode)}
                >
                  <option value="auto">Auto · Japan calendar</option>
                  <option value="spring">Spring · cherry blossoms</option>
                  <option value="summer">Summer · lush greenery</option>
                  <option value="autumn">Autumn · golden foliage</option>
                  <option value="winter">Winter · snowy mountains</option>
                </select>
              </label>
              <label className="toggle-row">
                <span>Traffic</span>
                <input
                  type="checkbox"
                  checked={traffic}
                  onChange={(e) => setTraffic(e.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>Reduced effects</span>
                <input
                  type="checkbox"
                  checked={reduced}
                  onChange={(e) => setReduced(e.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>Lightweight list view</span>
                <input
                  type="checkbox"
                  checked={listMode}
                  disabled={webglFailed}
                  onChange={(e) => {
                    setListMode(e.target.checked);
                    setReady(true);
                  }}
                />
              </label>
              {webglFailed && (
                <p className="fine-print">
                  3D is unavailable on this device. All company details work in
                  this view.
                </p>
              )}
            </section>
          )}
          <button
            className="glass view-pill"
            onClick={() => setMenu(menu === "layers" ? null : "layers")}
            aria-expanded={menu === "layers"}
          >
            <Layers3 size={17} />
            <span>Layers & view</span>
            <ChevronDown size={13} />
          </button>
        </div>
        <button
          className="glass icon-control"
          onClick={reset}
          title="Reset city view"
          aria-label="Reset city view"
        >
          <RotateCcw size={17} />
        </button>
        <button
          className="glass icon-control info-control"
          onClick={() => setMenu(menu === "info" ? null : "info")}
          aria-label="How to explore"
        >
          <Info size={17} />
        </button>
      </div>
    </footer>
  );
}
