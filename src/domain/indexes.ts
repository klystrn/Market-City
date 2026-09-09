import type { UniverseId } from "./cities/types";
// Index membership for the seeded development universe.
//
// Provenance and limits:
// - The seeded 100 companies are an S&P 500-style development subset. Every one
//   of them is treated as an S&P 500 member here.
// - `nasdaq100Members` lists the seeded companies that also belong to the
//   Nasdaq-100, which admits only Nasdaq-listed companies and holds essentially
//   no large banks. NYSE-listed names in this dataset (JPM, XOM, WMT, LLY, CAT,
//   NEE, PLD and others) are therefore absent by construction.
// - This is a static list compiled from public index descriptions, not a live
//   constituent feed. Index membership is reviewed and changed periodically, so
//   treat it as an approximate development fixture rather than a current roster.
// - Selecting the Nasdaq-100 universe therefore renders a partial index: the
//   seeded members only. Completing it requires adding the remaining
//   constituents to the dataset.
// - The seeded set is chosen so that every sector has at least one Nasdaq-100
//   member, which is what keeps the Nasdaq-100 city from showing empty
//   districts. Energy and materials are genuinely thin: the real index carries
//   one company in each, so those districts stay small rather than being
//   padded with companies that are not in the index.
export const nasdaq100Members = [
  "AAPL",
  "MSFT",
  "NVDA",
  "AVGO",
  "AMD",
  "ADBE",
  "CSCO",
  "QCOM",
  "TXN",
  "INTU",
  "AMAT",
  "MU",
  "PANW",
  "AMGN",
  "ISRG",
  "AMZN",
  "TSLA",
  "BKNG",
  "SBUX",
  "CMG",
  "GOOGL",
  "META",
  "NFLX",
  "TMUS",
  "CMCSA",
  "HON",
  "ADP",
  "COST",
  "PEP",
  "MDLZ",
  "CEG",
  "AEP",
  "LIN",
  "EQIX",
  "LRCX",
  "KLAC",
  "ADI",
  "SNPS",
  "CDNS",
  "MRVL",
  "NXPI",
  "ADSK",
  "PYPL",
  "COIN",
  "VRTX",
  "REGN",
  "GILD",
  "IDXX",
  "ABNB",
  "MAR",
  "ORLY",
  "LULU",
  "CHTR",
  "TTWO",
  "CTAS",
  "CSX",
  "PCAR",
  "FAST",
  "ODFL",
  "MNST",
  "KDP",
  "KHC",
  "FANG",
  "EXC",
  "XEL",
  "CSGP",
  "SBAC",
] as const;
const nasdaqSet = new Set<string>(nasdaq100Members);
export function inUniverse(ticker: string, universe: UniverseId): boolean {
  return universe === "sp500" ? true : nasdaqSet.has(ticker);
}
export const universeNames: Record<UniverseId, string> = {
  sp500: "S&P 500",
  nasdaq100: "Nasdaq-100",
};
export const universeNotes: Record<UniverseId, string> = {
  sp500:
    "Seeded S&P 500-style development subset of 100 companies, not the full index.",
  nasdaq100:
    "Seeded Nasdaq-100 members only. The rest of the index is not in this dataset.",
};
