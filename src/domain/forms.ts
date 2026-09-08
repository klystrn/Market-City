// Base massing variant per company. Curated for the signature buildings so
// their accents land on a flat, centered facade instead of a taper or drum
// silhouette; everything else falls back to a stable positional variant.
export const signatureForms: Record<string, number> = {
  AAPL: 6,
  MSFT: 7,
  AMZN: 9,
  GOOGL: 10,
  META: 7,
  NVDA: 8,
  TSLA: 11,
  NFLX: 2,
  JPM: 8,
  LLY: 0,
  CAT: 5,
  WMT: 1,
  XOM: 2,
  NEE: 11,
  LIN: 10,
  PLD: 1,
};
export function formFor(ticker: string, fallback: number): number {
  return signatureForms[ticker] ?? (((fallback % 12) + 12) % 12);
}
