// Curated, illustrative supply-chain / value-chain relationships between
// seeded companies. A simplified exploration layer, not a claim of current
// contractual or financial ties.
export interface SupplyLink {
  a: string;
  b: string;
  label: string;
}
export const supplyChainLinks: SupplyLink[] = [
  { a: "AAPL", b: "QCOM", label: "Modem chip supply" },
  { a: "AAPL", b: "AVGO", label: "RF & connectivity chips" },
  { a: "AAPL", b: "TXN", label: "Analog & power chips" },
  { a: "MSFT", b: "NVDA", label: "AI datacenter GPUs" },
  { a: "AMZN", b: "NVDA", label: "AWS GPU capacity" },
  { a: "GOOGL", b: "NVDA", label: "Cloud AI infrastructure" },
  { a: "META", b: "NVDA", label: "AI training infrastructure" },
  { a: "NVDA", b: "AMAT", label: "Fab equipment" },
  { a: "AMD", b: "AMAT", label: "Fab equipment" },
  { a: "MU", b: "AMAT", label: "Fab equipment" },
  { a: "MSFT", b: "EQIX", label: "Colocation & interconnection" },
  { a: "AMZN", b: "EQIX", label: "Colocation & interconnection" },
  { a: "TMUS", b: "AMT", label: "Cell tower leases" },
  { a: "VZ", b: "AMT", label: "Cell tower leases" },
  { a: "T", b: "AMT", label: "Cell tower leases" },
  { a: "WMT", b: "PG", label: "Retail distribution" },
  { a: "WMT", b: "KO", label: "Retail distribution" },
  { a: "WMT", b: "PEP", label: "Retail distribution" },
  { a: "COST", b: "PG", label: "Retail distribution" },
  { a: "AMZN", b: "UPS", label: "Package logistics" },
  { a: "HD", b: "DE", label: "Equipment retail" },
  { a: "SLB", b: "XOM", label: "Oilfield services" },
  { a: "SLB", b: "CVX", label: "Oilfield services" },
  { a: "EOG", b: "MPC", label: "Crude supply to refining" },
  { a: "UNP", b: "CAT", label: "Freight rail for heavy equipment" },
  { a: "V", b: "JPM", label: "Card network & issuing" },
  { a: "MA", b: "BAC", label: "Card network & issuing" },
];
export function linksFor(ticker: string): SupplyLink[] {
  return supplyChainLinks.filter((l) => l.a === ticker || l.b === ticker);
}
export function partnerOf(link: SupplyLink, ticker: string): string {
  return link.a === ticker ? link.b : link.a;
}
