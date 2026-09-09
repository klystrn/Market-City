import type { Snapshot } from "@/domain/types";
import { sectorIdentities as sectors } from "@/domain/sectors";
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v.length < 2000;
const number = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);
const date = (v: unknown): v is string =>
  text(v) && Number.isFinite(Date.parse(v));
const provenance = (v: Record<string, unknown>) =>
  text(v.source) &&
  date(v.updatedAt) &&
  ["demo", "eod", "delayed", "live"].includes(String(v.dataStatus));
export function validateSnapshot(value: unknown): value is Snapshot {
  if (!record(value) || value.schemaVersion !== 1 || !date(value.generatedAt))
    return false;
  const { companies, news, catalysts, market, warnings } = value;
  if (
    !Array.isArray(companies) ||
    companies.length > 1000 ||
    !Array.isArray(news) ||
    news.length > 500 ||
    !Array.isArray(catalysts) ||
    catalysts.length > 1000 ||
    !Array.isArray(warnings) ||
    !warnings.every(text)
  )
    return false;
  if (
    !record(market) ||
    !provenance(market) ||
    !number(market.indexChange) ||
    !number(market.indexPrice) ||
    !number(market.vix) ||
    !["regular", "pre-market", "after-hours", "closed"].includes(
      String(market.session),
    )
  )
    return false;
  if (
    !companies.every(
      (c) =>
        record(c) &&
        provenance(c) &&
        text(c.ticker) &&
        text(c.name) &&
        sectors.some((s) => s.id === c.sector) &&
        text(c.subsector) &&
        number(c.price) &&
        c.price > 0 &&
        number(c.previousClose) &&
        c.previousClose > 0 &&
        number(c.marketCap) &&
        c.marketCap > 0 &&
        number(c.changePercent) &&
        number(c.volume) &&
        c.volume >= 0 &&
        number(c.averageVolume) &&
        c.averageVolume > 0 &&
        number(c.relativeVolume) &&
        c.relativeVolume >= 0 &&
        Array.isArray(c.history) &&
        c.history.length <= 400 &&
        c.history.every(
          (p) => record(p) && date(p.date) && number(p.close) && p.close > 0,
        ),
    )
  )
    return false;
  if (new Set(companies.map((c) => c.ticker)).size !== companies.length)
    return false;
  if (
    !news.every(
      (n) =>
        record(n) &&
        provenance(n) &&
        text(n.id) &&
        text(n.title) &&
        date(n.publishedAt) &&
        Array.isArray(n.tickers) &&
        n.tickers.every(text) &&
        number(n.sentiment) &&
        number(n.significance) &&
        (!n.url || (text(n.url) && /^https:\/\//.test(n.url))),
    )
  )
    return false;
  return catalysts.every(
    (c) =>
      record(c) &&
      provenance(c) &&
      text(c.id) &&
      text(c.ticker) &&
      text(c.title) &&
      date(c.date) &&
      number(c.significance) &&
      ["EARNINGS", "BREAKING_NEWS", "ANALYST_ACTION"].includes(String(c.type)),
  );
}
