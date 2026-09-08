// Node/Actions-only adapters. Never import this module into a client component.
import type { Company, News } from "@/domain/types";
import { subsectorFor } from "@/domain/subsectors";
import { importance } from "@/domain/analytics";
export interface NewsProvider {
  latest(tickers: string[]): Promise<News[]>;
}
export interface MarketDataProvider {
  company(ticker: string, sector: string): Promise<Company>;
}
type Fetcher = typeof fetch;
export function marketCloseTimestamp(day: string) {
  const parts = new Intl.DateTimeFormat('en-US',{ timeZone:'America/New_York', timeZoneName:'shortOffset' }).formatToParts(new Date(`${day}T16:00:00Z`));
  const offset = Number(parts.find(p=>p.type==='timeZoneName')?.value.match(/GMT([+-]\d+)/)?.[1] ?? '-5');
  return new Date(`${day}T${String(16-offset).padStart(2,'0')}:00:00Z`).toISOString();
}
async function getJson(
  url: URL,
  fetcher: Fetcher,
): Promise<Record<string, unknown>> {
  // Do not include the request URL (which contains credentials) in errors or logs.
  let response: Response;
  try {
    response = await fetcher(url, { signal: AbortSignal.timeout(15000) });
  } catch {
    throw new Error("Provider request failed or timed out");
  }
  if (!response.ok)
    throw new Error(`Provider returned HTTP ${response.status}`);
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("Invalid provider response");
  return data as Record<string, unknown>;
}
export class MarketauxProvider implements NewsProvider {
  constructor(
    private token: string,
    private fetcher: Fetcher = fetch,
  ) {}
  async latest(tickers: string[]) {
    const url = new URL("https://api.marketaux.com/v1/news/all");
    url.search = new URLSearchParams({
      api_token: this.token,
      countries: "us",
      language: "en",
      must_have_entities: "true",
      filter_entities: "true",
      group_similar: "true",
      limit: "3",
      symbols: tickers.join(","),
    }).toString();
    const data = await getJson(url, this.fetcher);
    if (!Array.isArray(data.data))
      throw new Error("News provider quota, authentication, or response error");
    const now = new Date().toISOString();
    return data.data.flatMap((raw: Record<string, unknown>): News[] => {
      if (
        typeof raw.uuid !== "string" ||
        typeof raw.title !== "string" ||
        typeof raw.url !== "string" ||
        !raw.url.startsWith("https://") ||
        typeof raw.published_at !== "string" ||
        !Number.isFinite(Date.parse(raw.published_at)) ||
        !Array.isArray(raw.entities)
      )
        return [];
      const entities = raw.entities as {
        symbol?: string;
        sentiment_score?: number;
      }[];
      const matched = entities.filter(
        (e) => e.symbol && tickers.includes(e.symbol),
      );
      if (!matched.length) return [];
      const sentiment =
        matched.reduce(
          (sum, e) =>
            sum + (Number.isFinite(e.sentiment_score) ? e.sentiment_score! : 0),
          0,
        ) / matched.length;
      const news: News = {
        id: raw.uuid,
        title: raw.title,
        url: raw.url,
        tickers: matched.map((e) => e.symbol!),
        sentiment,
        significance: 0,
        publishedAt: raw.published_at,
        updatedAt: now,
        source: typeof raw.source === "string" ? raw.source : "Marketaux",
        dataStatus: "live",
      };
      news.significance = importance(news, Date.parse(now));
      return [news];
    });
  }
}
export class AlphaVantageProvider implements MarketDataProvider {
  constructor(
    private key: string,
    private fetcher: Fetcher = fetch,
  ) {}
  private request(fn: string, ticker: string) {
    const url = new URL("https://www.alphavantage.co/query");
    url.search = new URLSearchParams({
      function: fn,
      symbol: ticker,
      apikey: this.key,
    }).toString();
    return getJson(url, this.fetcher);
  }
  async company(ticker: string, sector: string): Promise<Company> {
    // Two calls per company. Seven companies/day = 14 calls, below the 25/day free cap.
    const profile = await this.request("OVERVIEW", ticker);
    if (
      typeof profile.Name !== "string" ||
      !Number.isFinite(Number(profile.MarketCapitalization)) ||
      Number(profile.MarketCapitalization) <= 0
    )
      throw new Error("Company fundamentals unavailable");
    const daily = await this.request("TIME_SERIES_DAILY", ticker);
    const series = daily["Time Series (Daily)"];
    if (!series || typeof series !== "object")
      throw new Error("Daily history unavailable or quota exhausted");
    const rows = Object.entries(
      series as Record<string, Record<string, string>>,
    ).sort(([a], [b]) => a.localeCompare(b));
    if (rows.length < 22) throw new Error("Insufficient daily history");
    const last = rows[rows.length - 1],
      prev = rows[rows.length - 2];
    const price = Number(last[1]["4. close"]),
      previousClose = Number(prev[1]["4. close"]),
      volume = Number(last[1]["5. volume"]);
    const averageVolume =
      rows.slice(-21, -1).reduce((s, [, r]) => s + Number(r["5. volume"]), 0) /
      20;
    if (
      ![price, previousClose, volume, averageVolume].every(
        (n) => Number.isFinite(n) && n > 0,
      )
    )
      throw new Error("Invalid quote fields");
    return {
      ticker,
      name: profile.Name,
      sector,
      subsector: subsectorFor(ticker)?.id ?? "other",
      marketCap: Number(profile.MarketCapitalization),
      price,
      previousClose,
      changePercent: (price / previousClose - 1) * 100,
      volume,
      averageVolume,
      relativeVolume: volume / averageVolume,
      history: rows
        .slice(-90)
        .map(([date, row]) => ({ date, close: Number(row["4. close"]) })),
      updatedAt: marketCloseTimestamp(last[0]),
      source: "Alpha Vantage · EOD prices / latest company overview",
      dataStatus: "eod",
    };
  }
}
