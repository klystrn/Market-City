import type { Intent, Snapshot } from "@/domain/types";
import { sectors } from "@/domain/city";
import { subsectors } from "@/domain/subsectors";
import { weightedChange } from "@/domain/analytics";
export function parseCommand(input: string, snapshot: Snapshot): Intent {
  const q = input.toLowerCase().trim().replace(/[?!]/g, "");
  if (/^(reset|clear|city|show all|city view|back)$/.test(q))
    return { type: "reset" };
  const company = snapshot.companies.find(
    (c) =>
      q === c.ticker.toLowerCase() ||
      q === c.name.toLowerCase() ||
      new RegExp(`\\b${c.ticker.toLowerCase().replace(".", "\\.")}\\b`).test(
        q,
      ) ||
      q.includes(c.name.toLowerCase()),
  );
  if (company)
    return {
      type: "company",
      ticker: company.ticker,
      news: q.includes("news"),
    };
  const sub = subsectors.find(
    (s) =>
      q.includes(s.name.toLowerCase()) ||
      q.includes(s.street.toLowerCase()) ||
      q === s.id ||
      (s.id === "semiconductors" &&
        /\b(semi|semis|semiconductor|chips)\b/.test(q)),
  );
  if (sub) return { type: "subsector", subsector: sub.id };
  if (q.includes("strongest") || q.includes("best sector"))
    return { type: "strongest" };
  if (q.includes("earnings")) return { type: "earnings" };
  if (q.includes("catalyst") || q.includes("major event"))
    return { type: "catalysts" };
  if (q.includes("volume") || q.includes("unusual activity"))
    return { type: "volume" };
  const move = q.match(/(down|up|gainers|losers)(?:.*?(\d+(?:\.\d+)?))?/);
  if (move)
    return {
      type: "move",
      direction: ["down", "losers"].includes(move[1]) ? "down" : "up",
      threshold: Number(move[2] ?? 0),
    };
  const sector = sectors.find(
    (s) =>
      q.includes(s.name.toLowerCase()) ||
      q.includes(s.short.toLowerCase()) ||
      q.includes(s.id),
  );
  if (sector) return { type: "sector", sector: sector.id };
  if (/moving|movers|summary|market today/.test(q)) return { type: "movers" };
  return { type: "unknown", query: input };
}
export function resolveIntent(
  intent: Intent,
  snapshot: Snapshot,
): { tickers: string[]; label: string; sector?: string } {
  const companies = snapshot.companies;
  if (intent.type === "subsector") {
    const s = subsectors.find((s) => s.id === intent.subsector)!;
    return {
      tickers: companies
        .filter((c) => c.subsector === s.id)
        .map((c) => c.ticker),
      label: `${s.street} · ${s.name}`,
      sector: s.sector,
    };
  }
  if (intent.type === "sector") {
    const s = sectors.find((s) => s.id === intent.sector)!;
    return {
      tickers: companies.filter((c) => c.sector === s.id).map((c) => c.ticker),
      label: s.name,
      sector: s.id,
    };
  }
  if (intent.type === "strongest") {
    const sector = [...sectors].sort(
      (a, b) =>
        weightedChange(companies.filter((c) => c.sector === b.id)) -
        weightedChange(companies.filter((c) => c.sector === a.id)),
    )[0];
    return resolveIntent({ type: "sector", sector: sector.id }, snapshot);
  }
  if (intent.type === "move")
    return {
      tickers: companies
        .filter((c) =>
          intent.direction === "up"
            ? c.changePercent > intent.threshold
            : c.changePercent < -intent.threshold,
        )
        .map((c) => c.ticker),
      label: `Stocks ${intent.direction} more than ${intent.threshold}%`,
    };
  if (intent.type === "volume")
    return {
      tickers: companies
        .filter((c) => c.relativeVolume >= 2)
        .map((c) => c.ticker),
      label: "Unusual volume · 2× normal or more",
    };
  if (intent.type === "earnings") {
    const now = Date.parse(snapshot.generatedAt);
    return {
      tickers: snapshot.catalysts
        .filter(
          (c) =>
            c.type === "EARNINGS" &&
            Date.parse(c.date) >= now &&
            Date.parse(c.date) <= now + 7 * 86400000,
        )
        .map((c) => c.ticker),
      label: "Earnings · next 7 days",
    };
  }
  if (intent.type === "catalysts")
    return {
      tickers: snapshot.catalysts
        .filter((c) => c.significance >= 0.6)
        .map((c) => c.ticker),
      label: "Major catalysts",
    };
  if (intent.type === "movers")
    return {
      tickers: [...companies]
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 8)
        .map((c) => c.ticker),
      label: "Today’s biggest movers",
    };
  return { tickers: [], label: "" };
}
