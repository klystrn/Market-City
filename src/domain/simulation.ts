import type { Snapshot, Catalyst } from "./types";
export interface GodSettings {
  index: number | null;
  sectors: Record<string, number>;
  companies: Record<string, number>;
  minute: number;
  volume: number;
  vix: number;
  effects: boolean;
  events: { ticker: string; type: Catalyst["type"]; sentiment: number }[];
}
export const defaultGod = (): GodSettings => ({
  index: null,
  sectors: {},
  companies: {},
  minute: 695,
  volume: 1,
  vix: 17.6,
  effects: true,
  events: [],
});
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
export const isFire = (change: number) => change < -10;
export const isEarthquake = (change: number) => change <= -5;
export function applyGod(base: Snapshot, settings: GodSettings): Snapshot {
  const minute = clamp(settings.minute, 480, 1200);
  // Fixed September simulation date uses EDT (UTC−4); this is not a live exchange clock.
  const updatedAt = new Date(Date.UTC(2026, 8, 8, 4, minute)).toISOString();
  const provenance = {
    source: "God · fictional simulation",
    dataStatus: "demo" as const,
    updatedAt,
  };
  const companies = base.companies.map((c) => {
    // Explicit company target takes precedence over its sector target, then the seed.
    const changePercent = clamp(
      settings.companies[c.ticker] ??
        settings.sectors[c.sector] ??
        c.changePercent,
      -95,
      100,
    );
    const relativeVolume = clamp(c.relativeVolume * settings.volume, 0.1, 20);
    return {
      ...c,
      ...provenance,
      changePercent,
      price: Number((c.previousClose * (1 + changePercent / 100)).toFixed(2)),
      relativeVolume,
      volume: Math.round(c.averageVolume * relativeVolume),
    };
  });
  const indexChange = clamp(settings.index ?? base.market.indexChange, -30, 30);
  return {
    ...base,
    generatedAt: updatedAt,
    companies,
    market: {
      ...base.market,
      ...provenance,
      indexChange,
      indexPrice:
        (base.market.indexPrice / (1 + base.market.indexChange / 100)) *
        (1 + indexChange / 100),
      vix: clamp(settings.vix, 9, 80),
      session:
        minute < 570
          ? "pre-market"
          : minute < 960
            ? "regular"
            : minute < 1200
              ? "after-hours"
              : "closed",
    },
    news: [
      ...settings.events.map((e, i) => ({
        ...provenance,
        id: `god-news-${i}`,
        title: `${e.ticker}: simulated ${e.type === "EARNINGS" ? "earnings announcement" : e.type === "ANALYST_ACTION" ? "analyst action" : "company catalyst"} (${e.sentiment >= 0 ? "positive" : "negative"} scenario)`,
        tickers: [e.ticker],
        publishedAt: updatedAt,
        sentiment: e.sentiment,
        significance: 0.95,
      })),
      ...base.news,
    ],
    catalysts: [
      ...settings.events.map((e, i) => ({
        ...provenance,
        id: `god-event-${i}`,
        ticker: e.ticker,
        title: `Simulated ${e.type.toLowerCase().replaceAll("_", " ")} announcement`,
        type: e.type,
        date: updatedAt,
        significance: 0.95,
      })),
      ...base.catalysts,
    ],
  };
}
// Random-walk benchmark: next close equals current price. Shock bounds use the
// trailing return standard deviation; scenario shocks are assumptions, not learned news.
export function projectTomorrow(snapshot: Snapshot) {
  return snapshot.companies.map((c) => {
    const closes = c.history
      .slice(-61)
      .map((h) => h.close)
      .filter((n) => n > 0);
    const returns = closes.slice(1).map((v, i) => Math.log(v / closes[i]));
    const mean =
      returns.reduce((a, b) => a + b, 0) / Math.max(1, returns.length);
    const sigma = Math.max(
      0.005,
      Math.sqrt(
        returns.reduce((a, r) => a + (r - mean) ** 2, 0) /
          Math.max(1, returns.length - 1),
      ),
    );
    return {
      ticker: c.ticker,
      baseline: c.price,
      downside: c.price * Math.exp(-1.96 * sigma),
      upside: c.price * Math.exp(1.96 * sigma),
      sigma,
      observations: returns.length,
    };
  });
}
export function tomorrowSnapshot(
  today: Snapshot,
  direction: -1 | 0 | 1,
): Snapshot {
  const projections = projectTomorrow(today);
  const nextDate = new Date(today.generatedAt);
  do {
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  } while ([0, 6].includes(nextDate.getUTCDay()));
  const updatedAt = nextDate.toISOString();
  return {
    ...today,
    generatedAt: updatedAt,
    companies: today.companies.map((c, i) => {
      const p = projections[i],
        price =
          direction < 0 ? p.downside : direction > 0 ? p.upside : p.baseline;
      return {
        ...c,
        updatedAt,
        previousClose: c.price,
        price,
        changePercent: (price / c.price - 1) * 100,
        source: "God · next-session scenario (unvalidated)",
        dataStatus: "demo",
      };
    }),
    market: {
      ...today.market,
      updatedAt,
      indexChange: ((direction * today.market.vix) / Math.sqrt(252)) * 1.96,
      indexPrice:
        today.market.indexPrice *
        (1 + (((direction * today.market.vix) / Math.sqrt(252)) * 1.96) / 100),
      source: "God · assumed index stress from VIX",
      dataStatus: "demo",
    },
    warnings: [
      "Next-session what-if: synthetic history, uncalibrated ranges; no event prediction.",
    ],
  };
}
