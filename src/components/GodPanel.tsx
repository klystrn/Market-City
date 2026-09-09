"use client";
import { useState } from "react";
import { X, SlidersHorizontal, Share2, Save, Trash2, Play } from "lucide-react";
import { sectorIdentities as sectors } from "@/domain/sectors";
import {
  defaultGod,
  projectTomorrow,
  type GodSettings,
} from "@/domain/simulation";
import type { Snapshot, Catalyst } from "@/domain/types";
import { money, pct } from "@/domain/analytics";
import { encodeScenario } from "@/domain/scenarios";
import { useSavedScenarios } from "@/hooks/useSavedScenarios";
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="god-field">
      <span>
        {label}
        <output>
          {value.toFixed(step < 1 ? 1 : 0)}
          {suffix}
        </output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export default function GodPanel({
  settings,
  setSettings,
  today,
  tomorrow,
  setTomorrow,
  onActivate,
}: {
  settings: GodSettings;
  setSettings: (s: GodSettings) => void;
  today: Snapshot;
  tomorrow: -1 | 0 | 1 | null;
  setTomorrow: (v: -1 | 0 | 1 | null) => void;
  onActivate: () => void;
}) {
  const [open, setOpen] = useState(false),
    [ticker, setTicker] = useState("AAPL"),
    [sector, setSector] = useState("technology"),
    [event, setEvent] = useState<Catalyst["type"]>("EARNINGS"),
    [positive, setPositive] = useState(true);
  const [scenarioName, setScenarioName] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const {
    scenarios,
    save: saveScenario,
    remove: removeScenario,
  } = useSavedScenarios();
  async function copyShareLink() {
    const code = encodeScenario({ god: settings, tomorrow });
    const url = new URL(window.location.href);
    url.searchParams.set("scenario", code);
    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Link copied to clipboard.");
    } catch {
      setShareStatus(url.toString());
    }
  }
  const company = today.companies.find((c) => c.ticker === ticker)!;
  const projection = projectTomorrow(today).find((c) => c.ticker === ticker)!;
  const change = (s: GodSettings) => {
    onActivate();
    setTomorrow(null);
    setSettings(s);
  };
  return (
    <div
      className="god-wrap"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        className="glass view-pill god-launch"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) onActivate();
        }}
      >
        <SlidersHorizontal size={16} />
        God <span>mode</span>
      </button>
      {open && (
        <>
          <div className="god-dismiss" onClick={() => setOpen(false)} />
          <aside
            className="glass god-panel"
            aria-label="God simulation controls"
          >
            <div className="panel-heading">
              <span className="eyebrow">GOD · SIMULATED DATA</span>
              <button
                className="icon-button"
                aria-label="Close God controls"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <h2>Shape the market.</h2>
            <p className="fine-print">
              Every change is fictional. Company targets override sector
              targets. The index is an independent scenario input.
            </p>
            <div className="god-presets">
              <button
                onClick={() =>
                  change({
                    ...defaultGod(),
                    index: -5,
                    vix: 42,
                    sectors: Object.fromEntries(sectors.map((s) => [s.id, -5])),
                    companies: { AAPL: -12 },
                    volume: 2.5,
                  })
                }
              >
                Panic selling
              </button>
              <button
                onClick={() =>
                  change({
                    ...defaultGod(),
                    index: 3,
                    sectors: Object.fromEntries(sectors.map((s) => [s.id, 3])),
                    vix: 12,
                  })
                }
              >
                Relief rally
              </button>
              <button
                onClick={() => {
                  change(defaultGod());
                }}
              >
                Reset all
              </button>
            </div>
            <Slider
              label="Index daily change"
              value={settings.index ?? today.market.indexChange}
              min={-15}
              max={15}
              step={0.1}
              suffix="%"
              onChange={(index) => change({ ...settings, index })}
            />
            <label className="field-label">
              Sector
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.short}
                  </option>
                ))}
              </select>
            </label>
            <Slider
              label="Sector daily target"
              value={settings.sectors[sector] ?? 0}
              min={-30}
              max={30}
              step={0.1}
              suffix="%"
              onChange={(n) =>
                change({
                  ...settings,
                  sectors: { ...settings.sectors, [sector]: n },
                })
              }
            />
            <label className="field-label">
              Company
              <select
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              >
                {today.companies.map((c) => (
                  <option key={c.ticker} value={c.ticker}>
                    {c.ticker} · {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Slider
              label="Company daily target"
              value={company.changePercent}
              min={-50}
              max={50}
              step={0.1}
              suffix="%"
              onChange={(n) =>
                change({
                  ...settings,
                  companies: { ...settings.companies, [ticker]: n },
                })
              }
            />
            <button
              className="text-button"
              onClick={() => {
                const companies = { ...settings.companies };
                delete companies[ticker];
                change({ ...settings, companies });
              }}
            >
              Clear {ticker} override
            </button>
            <Slider
              label="Relative volume multiplier"
              value={settings.volume}
              min={0.1}
              max={5}
              step={0.1}
              suffix="×"
              onChange={(volume) => change({ ...settings, volume })}
            />
            <Slider
              label="VIX assumption"
              value={settings.vix}
              min={9}
              max={80}
              step={0.1}
              onChange={(vix) => change({ ...settings, vix })}
            />
            <Slider
              label="Session minute (ET)"
              value={settings.minute}
              min={480}
              max={1200}
              step={5}
              onChange={(minute) => change({ ...settings, minute })}
            />
            <p className="fine-print">
              {String(Math.floor(settings.minute / 60)).padStart(2, "0")}:
              {String(settings.minute % 60).padStart(2, "0")} ET · Open 09:30 /
              close 16:00 · simulated Sep 8 session
            </p>
            <label className="field-label">
              Announce for {ticker}
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value as Catalyst["type"])}
              >
                <option value="EARNINGS">Earnings</option>
                <option value="BREAKING_NEWS">Company catalyst</option>
                <option value="ANALYST_ACTION">Analyst action</option>
              </select>
            </label>
            <label className="toggle-row">
              Positive sentiment
              <input
                type="checkbox"
                checked={positive}
                onChange={(e) => setPositive(e.target.checked)}
              />
            </label>
            <button
              className="primary-button"
              onClick={() =>
                change({
                  ...settings,
                  events: [
                    ...settings.events.slice(-19),
                    { ticker, type: event, sentiment: positive ? 0.8 : -0.8 },
                  ],
                })
              }
            >
              Announce fictional event
            </button>
            <p className="fine-print" role="status">
              {settings.events.length} injected events. Announcements feed news
              and beacons; set their price impact above.
            </p>
            <div className="settings-divider" />
            <h3>Save & share this scenario</h3>
            <p className="fine-print">
              Every setting above — index, sector and company targets, VIX,
              session time and announcements — travels with the link.
            </p>
            <button className="text-button" onClick={copyShareLink}>
              <Share2 size={15} /> Copy share link
            </button>
            {shareStatus && (
              <p className="fine-print" role="status">
                {shareStatus}
              </p>
            )}
            <div className="scenario-save-row">
              <input
                aria-label="Scenario name"
                placeholder="Name this scenario…"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
              <button
                className="icon-button"
                aria-label="Save scenario"
                disabled={!scenarioName.trim()}
                onClick={() => {
                  saveScenario(scenarioName.trim(), {
                    god: settings,
                    tomorrow,
                  });
                  setScenarioName("");
                }}
              >
                <Save size={16} />
              </button>
            </div>
            {scenarios.length > 0 && (
              <ul className="scenario-list">
                {scenarios.map((s) => (
                  <li key={s.id}>
                    <button
                      className="scenario-load"
                      onClick={() => {
                        change(s.god);
                        setTomorrow(s.tomorrow);
                      }}
                    >
                      <Play size={13} />
                      {s.name}
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete scenario ${s.name}`}
                      onClick={() => removeScenario(s.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label className="toggle-row">
              Fire & earthquake effects
              <input
                type="checkbox"
                checked={settings.effects}
                onChange={(e) =>
                  change({ ...settings, effects: e.target.checked })
                }
              />
            </label>
            <p className="fine-print">
              Fire: stock below −10%. Earthquake: index at or below −5%. Reduced
              effects stops animation.
            </p>
            <div className="settings-divider" />
            <h3>Tomorrow laboratory</h3>
            <p className="fine-print">
              Random-walk benchmark: tomorrow’s baseline equals today’s price. A
              trailing-return volatility model creates downside/upside what-ifs.
              These synthetic, uncalibrated ranges do not predict news or give
              reliable odds.
            </p>
            <div className="god-projection">
              <b>
                {ticker} baseline {money(projection.baseline)}
              </b>
              <span>
                {money(projection.downside)} — {money(projection.upside)}
              </span>
              <small>
                ±1.96σ illustration · {projection.observations} synthetic
                returns
              </small>
            </div>
            <div className="god-presets">
              {([-1, 0, 1] as const).map((v) => (
                <button
                  className={tomorrow === v ? "active" : ""}
                  key={v}
                  onClick={() => {
                    onActivate();
                    setTomorrow(v);
                  }}
                >
                  {v < 0 ? "Downside" : v > 0 ? "Upside" : "Baseline"}
                </button>
              ))}
              <button onClick={() => setTomorrow(null)}>Back to today</button>
            </div>
            <p className="fine-print" role="status">
              {tomorrow === null
                ? `Today · ${pct(company.changePercent)}`
                : "NEXT SESSION PREVIEW · all stocks share the selected stress direction. Events remain today’s context."}
            </p>
            <details>
              <summary>City metaphor ideas</summary>
              <p className="fine-print">
                Parks: seasonal breathing space, no price signal. Museum: a
                learning destination for market history, not a stock. Station:
                lit platforms track average relative volume. Conservatories:
                seasonal scenery. Future ideas: museum exhibits for verified
                past crises; a park breadth gauge only as an optional layer;
                station arrivals for earnings calendars.
              </p>
            </details>
          </aside>
        </>
      )}
    </div>
  );
}
