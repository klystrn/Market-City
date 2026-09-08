import { companySeeds } from "./companies";
import { subsectorFor } from "@/domain/subsectors";
import type { Snapshot, Scenario, Company, MarketState } from "@/domain/types";
export const DEMO_DATE = "2026-09-08T15:35:00.000Z";
export function seed(ticker: string) {
  return [...ticker].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 17);
}
export function createDemo(
  scenario: Scenario = "balanced",
  tick = 0,
  session: MarketState["session"] = "regular",
): Snapshot {
  const updatedAt =
    session === "regular"
      ? DEMO_DATE
      : `2026-09-08T${session === "pre-market" ? "12:00" : session === "after-hours" ? "21:10" : "01:00"}:00.000Z`;
  const companies: Company[] = companySeeds.map(
    ([ticker, name, sector, cap, price], i) => {
      const n = seed(ticker);
      const drift = Math.sin(tick * 0.45 + i) * 0.13;
      let changePercent =
        (n % 631) / 100 -
        2.3 +
        drift +
        (scenario === "rally" ? 1.7 : scenario === "selloff" ? -3.4 : 0);
      if (ticker === "NVDA")
        changePercent =
          (scenario === "selloff"
            ? -4.82
            : scenario === "rally"
              ? 5.64
              : 3.42) + drift;
      const relativeVolume = Number((0.6 + (n % 220) / 100).toFixed(2));
      const current = Number((price * (1 + changePercent / 100)).toFixed(2));
      return {
        ticker,
        name,
        sector,
        subsector: subsectorFor(ticker)?.id ?? "other",
        marketCap: cap * 1e9,
        price: current,
        previousClose: price,
        changePercent: Number(changePercent.toFixed(2)),
        averageVolume: 1e6 + (n % 80000000),
        volume: Math.round((1e6 + (n % 80000000)) * relativeVolume),
        relativeVolume,
        source: "Market City seeded simulation",
        updatedAt,
        dataStatus: "demo",
        history: Array.from({ length: 90 }, (_, day) => ({
          date: new Date(Date.UTC(2026, 5, 11 + day))
            .toISOString()
            .slice(0, 10),
          close: Number(
            (
              price *
              (0.87 + day * 0.0014 + Math.sin(day * 0.24 + n) * 0.022)
            ).toFixed(2),
          ),
        })),
      };
    },
  );
  const featured = [
    "NVDA",
    "AAPL",
    "JPM",
    "LLY",
    "AMZN",
    "XOM",
    "GOOGL",
    "CAT",
    "WMT",
    "NEE",
    "LIN",
    "PLD",
  ];
  return {
    schemaVersion: 1,
    generatedAt: updatedAt,
    companies,
    market: {
      indexPrice: 5634.61,
      indexChange:
        scenario === "selloff" ? -1.86 : scenario === "rally" ? 1.74 : 0.68,
      vix: scenario === "selloff" ? 29.4 : scenario === "rally" ? 13.2 : 17.6,
      session,
      updatedAt,
      source: "Market City seeded simulation",
      dataStatus: "demo",
    },
    news: featured.map((ticker, i) => ({
      id: `demo-news-${ticker}`,
      ticker,
      tickers: [ticker],
      title: [
        `${ticker} in focus as investors assess the sector outlook`,
        `${ticker} draws attention ahead of its next earnings update`,
        `${ticker} sees elevated trading activity in a mixed session`,
      ][i % 3],
      publishedAt: new Date(
        Date.parse(updatedAt) - (i * 7 + 4) * 60000,
      ).toISOString(),
      updatedAt,
      source: "Demo newsroom · fictional story",
      dataStatus: "demo",
      sentiment: i % 3 === 0 ? 0.6 : i % 3 === 1 ? 0.1 : -0.35,
      significance: 0.9 - i * 0.025,
    })),
    catalysts: featured.map((ticker, i) => ({
      id: `demo-event-${ticker}`,
      ticker,
      title: "Quarterly earnings",
      date: new Date(
        Date.parse(updatedAt) + ((i % 9) + 1) * 86400000,
      ).toISOString(),
      type: "EARNINGS",
      significance: 0.85,
      updatedAt,
      source: "Demo calendar · illustrative date",
      dataStatus: "demo",
    })),
    warnings: [],
  };
}
