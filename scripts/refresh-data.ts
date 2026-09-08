import { readFile, writeFile, mkdir } from "node:fs/promises";
import {
  MarketauxProvider,
  AlphaVantageProvider,
} from "../src/services/providers";
import { companySeeds } from "../src/data/companies";
import { createDemo } from "../src/data/demo";
import { validateSnapshot } from "../src/services/snapshot";
import type { Snapshot } from "../src/domain/types";

async function main() {
  const newsKey = process.env.MARKETAUX_API_TOKEN,
    priceKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!newsKey && !priceKey) {
    console.log(
      "No provider credentials configured. Demo Mode remains available.",
    );
    return;
  }
  let cached: Snapshot | null = null;
  try {
    const data: unknown = JSON.parse(
      await readFile("public/data/market.json", "utf8"),
    );
    if (validateSnapshot(data)) cached = data;
  } catch {
    /* First run. */
  }
  const now = new Date();
  const warnings: string[] = [];
  const snapshot: Snapshot =
    cached && cached.companies.length ? structuredClone(cached) : createDemo();
  snapshot.generatedAt = now.toISOString();
  // Independent labels keep simulated index/environment separate from real company data.
  snapshot.warnings = [];
  if (newsKey) {
    try {
      const incoming = await new MarketauxProvider(newsKey).latest(
        companySeeds.map(([t]) => t),
      );
      const merged = new Map(
        [
          ...snapshot.news.filter((n) => n.dataStatus !== "demo"),
          ...incoming,
        ].map((n) => [n.id, n]),
      );
      snapshot.news = [...merged.values()]
        .filter((n) => now.getTime() - Date.parse(n.publishedAt) < 7 * 86400000)
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
        .slice(0, 150);
      snapshot.catalysts = snapshot.news
        .filter((n) => n.significance >= 0.6)
        .flatMap((n) =>
          n.tickers.map((ticker) => ({
            id: `news-${n.id}-${ticker}`,
            ticker,
            title: n.title,
            type: "BREAKING_NEWS" as const,
            date: n.publishedAt,
            significance: n.significance,
            source: n.source,
            updatedAt: n.updatedAt,
            dataStatus: n.dataStatus,
          })),
        );
    } catch {
      warnings.push(
        "News refresh failed. Last successfully cached stories retained.",
      );
    }
  }
  // Quotes only on explicitly requested daily runs; never every news refresh.
  const dailyQuoteWindow =
    now.getUTCHours() === 22 && now.getUTCDay() >= 1 && now.getUTCDay() <= 5;
  if (priceKey && (process.env.REFRESH_QUOTES === "true" || dailyQuoteWindow)) {
    const offset =
      (Math.floor(now.getTime() / 86400000) * 7) % companySeeds.length;
    const provider = new AlphaVantageProvider(priceKey);
    for (let i = 0; i < 7; i++) {
      const [ticker, , sector] =
        companySeeds[(offset + i) % companySeeds.length];
      try {
        const company = await provider.company(ticker, sector);
        const idx = snapshot.companies.findIndex((c) => c.ticker === ticker);
        if (idx >= 0) snapshot.companies[idx] = company;
        else snapshot.companies.push(company);
      } catch {
        warnings.push(
          `${ticker}: EOD refresh unavailable; previous data retained.`,
        );
        break;
      }
    }
  }
  const demos = snapshot.companies.filter(
    (c) => c.dataStatus === "demo",
  ).length;
  if (demos)
    warnings.push(
      `${demos} company quotes remain simulated. Check each company’s data label.`,
    );
  warnings.push(
    "S&P 500 and VIX environment inputs remain simulated until an index provider is configured.",
  );
  warnings.push(
    "Free-tier news coverage is limited; scheduled refresh times are best-effort.",
  );
  snapshot.warnings = warnings;
  if (!validateSnapshot(snapshot))
    throw new Error("Snapshot validation failed; existing file preserved");
  await mkdir("public/data", { recursive: true });
  await writeFile(
    "public/data/market.json",
    JSON.stringify(snapshot, null, 2) + "\n",
  );
  console.log(
    `Saved snapshot: ${snapshot.companies.length} companies, ${snapshot.news.length} stories. ${warnings.length} coverage notices.`,
  );
}
main().catch(() => {
  console.error("Data refresh failed. Existing snapshot was preserved.");
  process.exitCode = 1;
});
