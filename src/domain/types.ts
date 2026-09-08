export type DataStatus = "demo" | "eod" | "delayed" | "live";
export type Scenario = "balanced" | "rally" | "selloff";
export type Layer = "market" | "volume" | "catalysts";
export interface Provenance {
  source: string;
  updatedAt: string;
  dataStatus: DataStatus;
}
export interface Company extends Provenance {
  ticker: string;
  name: string;
  sector: string;
  subsector: string;
  marketCap: number;
  price: number;
  previousClose: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  relativeVolume: number;
  history: { date: string; close: number }[];
}
export interface Sector {
  id: string;
  name: string;
  short: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
}
export interface News extends Provenance {
  id: string;
  title: string;
  url?: string;
  publishedAt: string;
  tickers: string[];
  sentiment: number;
  significance: number;
}
export interface Catalyst extends Provenance {
  id: string;
  ticker: string;
  title: string;
  date: string;
  type: "EARNINGS" | "BREAKING_NEWS" | "ANALYST_ACTION";
  significance: number;
}
export interface MarketEvent extends Provenance {
  id: string;
  type: Catalyst["type"] | "MARKET_OPEN" | "MARKET_CLOSE";
  title: string;
  tickers: string[];
  significance: number;
  eligibleForRadio: boolean;
  eligibleForWeather: boolean;
  eligibleForBeacon: boolean;
}
export interface MarketState extends Provenance {
  indexChange: number;
  indexPrice: number;
  vix: number;
  session: "pre-market" | "regular" | "after-hours" | "closed";
}
export interface Snapshot {
  schemaVersion: 1;
  generatedAt: string;
  companies: Company[];
  news: News[];
  catalysts: Catalyst[];
  market: MarketState;
  warnings: string[];
}
export interface Plot {
  ticker: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  variant: number;
}
export type Intent =
  | { type: "reset" }
  | { type: "company"; ticker: string; news?: boolean }
  | { type: "sector"; sector: string }
  | { type: "subsector"; subsector: string }
  | { type: "move"; direction: "up" | "down"; threshold: number }
  | { type: "volume" }
  | { type: "earnings" }
  | { type: "catalysts" }
  | { type: "movers" }
  | { type: "strongest" }
  | { type: "unknown"; query: string };
