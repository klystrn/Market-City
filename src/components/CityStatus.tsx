"use client";
import {
  Building2,
  Car,
  Keyboard,
  Gauge,
  Landmark,
  Moon,
  Sun,
  TrendingUp,
} from "lucide-react";
import type { Snapshot } from "@/domain/types";
import { compact } from "@/domain/analytics";
import { cityStats, sessionNames, trafficWord } from "@/domain/city-stats";
import { usePersistentValue } from "@/hooks/usePersistentValue";

/**
 * The city-builder status strip in the footer: what the city holds, what it
 * is worth, how many of its companies are rising, how busy its streets are and
 * whether the sun is up. A small toggle swaps it for the controls hint, and
 * the choice is remembered. Every figure is one the app shows in fuller form
 * elsewhere; this only says it the way a city game would.
 */
export default function CityStatus({
  snapshot,
  hint,
}: {
  snapshot: Snapshot;
  hint: string;
}) {
  const [mode, setMode] = usePersistentValue("market-city-status", "stats");
  const s = cityStats(snapshot);
  const daylight = s.session === "regular" || s.session === "pre-market";
  const showStats = mode !== "hint";
  return (
    <span className="city-status">
      <button
        className="city-status-toggle"
        onClick={() => setMode(showStats ? "hint" : "stats")}
        aria-label={
          showStats
            ? "Show controls instead of city stats"
            : "Show city stats instead of controls"
        }
        title={showStats ? "Show controls" : "Show city stats"}
      >
        {showStats ? <Keyboard size={11} /> : <Gauge size={11} />}
      </button>
      {showStats ? (
        <span className="city-stats" aria-label="City status">
          <span title="Companies in this city's universe">
            <Building2 size={11} />
            {s.companies} companies
          </span>
          <span title="Total market capitalisation of the companies on the map">
            <Landmark size={11} />${compact(s.marketCap)} value
          </span>
          <span title="Share of companies advancing today">
            <TrendingUp size={11} />
            {Math.round(s.rising * 100)}% rising
          </span>
          <span
            title={`Mean relative volume ${s.traffic.toFixed(2)}× an ordinary day`}
          >
            <Car size={11} />
            {trafficWord(s.traffic)} traffic
          </span>
          <span title="Exchange session, which also sets the sun">
            {daylight ? <Sun size={11} /> : <Moon size={11} />}
            {sessionNames[s.session]}
          </span>
        </span>
      ) : (
        <span>{hint}</span>
      )}
    </span>
  );
}
