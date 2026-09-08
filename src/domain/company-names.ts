import { companySeeds } from "@/data/companies";
import type { Company } from "./types";

// Keep broadcast names in sync with the company universe instead of maintaining
// a second hand-written list. Provider names override seeds for future additions.
export const tickerCompanyNames: Readonly<Record<string, string>> =
  Object.fromEntries(companySeeds.map(([ticker, name]) => [ticker, name]));
export function companyNamesForSpeech(
  text: string,
  companies: Pick<Company, "ticker" | "name">[] = [],
  mentionedTickers?: string[],
) {
  const names = new Map(Object.entries(tickerCompanyNames));
  for (const company of companies) names.set(company.ticker, company.name);
  const canonical = (ticker: string) => ticker.replaceAll("-", ".");
  const mentioned = mentionedTickers
    ? new Set(mentionedTickers.map(canonical))
    : null;
  // Match complete, case-sensitive symbols in a single pass. This preserves
  // words such as "cost", unknown symbols, and names such as AT&T. A bare
  // one-letter symbol requires news metadata; a cashtag is unambiguous.
  return text.replace(
    /(?<![\p{L}\p{N}_&])\$?[A-Z][A-Z0-9]*(?:[.-][A-Z0-9]+)*(?![\p{L}\p{N}_&])/gu,
    (token) => {
      const explicit = token.startsWith("$");
      const symbol = canonical(explicit ? token.slice(1) : token);
      const name = names.get(symbol);
      if (!name) return token;
      if (
        !explicit &&
        (mentioned ? !mentioned.has(symbol) : symbol.length === 1)
      )
        return token;
      return name;
    },
  );
}
