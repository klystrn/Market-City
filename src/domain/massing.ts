// Market capitalization maps to the total volume of built space a company
// occupies. Land footprint and height share the encoding, so a mega-cap reads
// as a large *site* rather than only a tall spike. Both axes use the same
// compressed (log) scale so smaller members stay readable.
//
// Tokyo keeps its original footprint/height formulas in domain/city.ts; this is
// the shared encoding for the zone- and borough-based cities.
export interface Massing {
  footprint: number;
  height: number;
  volume: number;
}
export function massing(marketCap: number): Massing {
  const decades = Math.log10(Math.max(1e9, marketCap) / 1e9);
  const t = Math.max(0, Math.min(1, (decades - 1.6) / 2));
  const footprint = 3.1 + t * 5.1;
  const height = 4.2 + t * 20.5;
  return { footprint, height, volume: footprint * footprint * height };
}
