import type { Company, Snapshot, MarketEvent, News } from "./types";
export const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
export const compact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(n);
export function weightedChange(companies: Company[]) {
  const total = companies.reduce((s, c) => s + c.marketCap, 0);
  return total
    ? companies.reduce((s, c) => s + c.changePercent * c.marketCap, 0) / total
    : 0;
}
export function breadth(companies: Company[]) {
  return {
    up: companies.filter((c) => c.changePercent > 0.05).length,
    down: companies.filter((c) => c.changePercent < -0.05).length,
    flat: companies.filter((c) => Math.abs(c.changePercent) <= 0.05).length,
  };
}
// Share of a sector's companies advancing on the day, in [0, 1]. Powers the
// optional sector-breadth garden layer; unrelated to market-cap weighting.
export function sectorBreadthRatio(companies: Company[]): number {
  if (!companies.length) return 0.5;
  const b = breadth(companies);
  return b.up / companies.length;
}
// Colour for a breadth ratio in [0, 1]: half the band advancing is neutral,
// all of it advancing is fully green, none of it fully red. Deliberately the
// same green-up / red-down semantics the buildings use, so one legend covers
// both — but this reads a share of companies, never a price move.
export function breadthColor(ratio: number, dark = false): string {
  const away = Math.min(1, Math.abs(ratio - 0.5) * 2);
  if (away < 0.08) return dark ? "#8d968c" : "#bcc3b6";
  const low = ratio > 0.5 ? [124, 191, 150] : [232, 150, 133];
  const high = ratio > 0.5 ? [22, 138, 99] : [206, 66, 74];
  return `rgb(${low.map((v, i) => Math.round(v + (high[i] - v) * away)).join(",")})`;
}
// Trailing daily-return volatility (standard deviation of log returns) over
// up to the last 60 sessions. Purely descriptive; not a forecast.
export function historicalVolatility(company: Company): number {
  const closes = company.history
    .slice(-61)
    .map((h) => h.close)
    .filter((n) => n > 0);
  const returns = closes.slice(1).map((v, i) => Math.log(v / closes[i]));
  if (returns.length < 2) return 0.01;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  return Math.sqrt(
    returns.reduce((a, r) => a + (r - mean) ** 2, 0) / (returns.length - 1),
  );
}
export function explain(c: Company, snapshot: Snapshot) {
  const peers = snapshot.companies.filter(
    (p) =>
      p.sector === c.sector &&
      (p.dataStatus === "demo") === (c.dataStatus === "demo") &&
      p.updatedAt.slice(0, 10) === c.updatedAt.slice(0, 10),
  );
  const comparisonAvailable = peers.length > 1;
  const relative = c.changePercent - weightedChange(peers);
  // Never combine fictional news with real quotes as explanatory evidence.
  const stories = snapshot.news.filter(
    (n) =>
      n.tickers.includes(c.ticker) &&
      (n.dataStatus === "demo") === (c.dataStatus === "demo"),
  );
  const reference = Date.parse(c.updatedAt);
  const recent = stories.filter(
    (n) =>
      reference >= Date.parse(n.publishedAt) &&
      reference - Date.parse(n.publishedAt) < 48 * 3600000,
  );
  const evidence = [
    comparisonAvailable
      ? `${Math.abs(relative).toFixed(2)} percentage points ${relative >= 0 ? "ahead of" : "behind"} tracked sector peers`
      : "Sector comparison unavailable for this quote date",
    `${c.relativeVolume.toFixed(1)}× normal daily trading volume`,
  ];
  if (recent.length)
    evidence.push(
      `${recent.length} relevant ${c.dataStatus === "demo" ? "simulated " : ""}recent ${recent.length === 1 ? "story" : "stories"}`,
    );
  const catalyst = snapshot.catalysts.find(
    (e) =>
      e.ticker === c.ticker &&
      (e.dataStatus === "demo") === (c.dataStatus === "demo") &&
      e.type === "EARNINGS" &&
      Date.parse(e.date) >= reference,
  );
  if (catalyst)
    evidence.push(
      `Earnings in ${Math.ceil((Date.parse(catalyst.date) - reference) / 86400000)} ${Math.ceil((Date.parse(catalyst.date) - reference) / 86400000) === 1 ? "day" : "days"}`,
    );
  return {
    evidence,
    relative,
    comparisonAvailable,
    confidence:
      recent.length >= 3 && c.relativeVolume >= 1.5
        ? "High"
        : recent.length && catalyst
          ? "Moderate"
          : "Low",
    note: recent.length
      ? "These observations provide context; they do not establish what caused the price move."
      : "No verified catalyst is available. Relative performance alone does not explain causation.",
  };
}
export function events(snapshot: Snapshot): MarketEvent[] {
  return snapshot.catalysts.map((e) => ({
    ...e,
    title: `${e.ticker}: ${e.title}`,
    tickers: [e.ticker],
    eligibleForRadio: e.significance >= 0.85,
    eligibleForWeather: e.significance >= 0.8,
    eligibleForBeacon: e.significance >= 0.6,
  }));
}
export function importance(
  news: Pick<News, "publishedAt" | "sentiment" | "tickers">,
  now: number,
) {
  return Math.min(
    1,
    0.35 +
      Math.abs(news.sentiment) * 0.25 +
      Math.min(news.tickers.length, 5) * 0.05 +
      Math.max(0, 1 - (now - Date.parse(news.publishedAt)) / 86400000) * 0.15,
  );
}
export function themeFor(change: number, previous: boolean) {
  return change < -0.08 ? true : change > 0.08 ? false : previous;
}
export function weather(snapshot: Snapshot) {
  const b = breadth(snapshot.companies);
  return snapshot.market.vix > 25
    ? "Overcast"
    : b.up / snapshot.companies.length < 0.45 || snapshot.market.vix > 18
      ? "Light haze"
      : "Clear skies";
}
