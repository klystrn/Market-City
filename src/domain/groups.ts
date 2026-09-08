// Curated cross-sector search groups. Membership reflects common public
// shorthand for these groupings, not an official index or classification.
export interface CompanyGroup {
  id: string;
  name: string;
  aliases: string[];
  tickers: string[];
}
export const companyGroups: CompanyGroup[] = [
  {
    id: "magnificent-seven",
    name: "Magnificent Seven",
    aliases: ["magnificent 7", "mag 7", "mag seven"],
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA"],
  },
  {
    id: "big-tech",
    name: "Big Tech",
    aliases: ["big technology"],
    tickers: [
      "AAPL",
      "MSFT",
      "GOOGL",
      "AMZN",
      "META",
      "NVDA",
      "NFLX",
      "ORCL",
      "CRM",
      "ADBE",
      "CSCO",
      "IBM",
    ],
  },
];
export function findGroup(query: string): CompanyGroup | undefined {
  const q = query.toLowerCase();
  return companyGroups.find(
    (g) =>
      q.includes(g.name.toLowerCase()) || g.aliases.some((a) => q.includes(a)),
  );
}
