import type { Snapshot } from "./types";
import { breadth } from "./analytics";

// The city-builder status strip: a handful of facts about the city on screen,
// in the vocabulary of a city game. Each is a figure the app already shows in
// fuller form somewhere else — the strip renames, it never invents. "Value"
// is total market cap, "rising" is breadth, "traffic" is mean relative volume,
// exactly as the traffic layer already uses it.
export interface CityStats {
  companies: number;
  marketCap: number;
  /** Share of companies advancing, 0–1, by the breadth rule's threshold. */
  rising: number;
  /** Mean relative volume: 1 is an ordinary day's trading. */
  traffic: number;
  session: Snapshot["market"]["session"];
}

export function cityStats(snapshot: Snapshot): CityStats {
  const { companies } = snapshot;
  const n = companies.length;
  return {
    companies: n,
    marketCap: companies.reduce((s, c) => s + c.marketCap, 0),
    rising: n ? breadth(companies).up / n : 0,
    traffic: n ? companies.reduce((s, c) => s + c.relativeVolume, 0) / n : 0,
    session: snapshot.market.session,
  };
}

export const sessionNames: Record<CityStats["session"], string> = {
  "pre-market": "Pre-market",
  regular: "Session open",
  "after-hours": "After hours",
  closed: "Market closed",
};

/** How busy the streets are, in words, from mean relative volume. */
export function trafficWord(traffic: number): string {
  return traffic >= 1.6
    ? "Heavy"
    : traffic >= 1.15
      ? "Busy"
      : traffic >= 0.85
        ? "Steady"
        : "Light";
}
