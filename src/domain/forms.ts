// Base massing variant per company.
//
// Two rules decide a building's silhouette. Sixteen companies are curated by
// hand, so their brand accents land on a flat, centred facade instead of a
// taper or a drum. Everything else takes a form from its *sector*, so what a
// company does shows in its shape: a bank is a spire or a deco setback, a
// miner is a broad low plant, a REIT is a terraced block.
//
// Before this, a company's form came from its position in the index listing,
// which meant a bank and a warehouse operator could end up identical by
// accident of ordering. Shape said nothing true about the company. It now
// does — but only about the sector, never about performance: height and
// footprint remain the market-cap encoding and colour remains the daily move.
// Nothing here changes either of those.
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
// The forms each sector draws from, in the order a district fills them. Every
// sector lists several so a street is not a row of identical buildings; the
// set is chosen so that any one of them still reads as that industry.
//
// 0 glazed shaft · 1 block with a setback top · 2 slab and lower wing
// 3 octagonal spire · 4 rotating plates · 5 plain broad mass
// 6 oval on a podium · 7 twin towers · 8 deco setbacks · 9 courtyard campus
// 10 cascading terraces · 11 slab on a colonnade
const sectorForms: Record<string, number[]> = {
  // Glass shafts and campuses: the vocabulary of a corporate tech estate.
  technology: [0, 9, 7, 4],
  // Broadcast and media slabs, with one landmark form among them.
  communications: [2, 0, 4, 9],
  // The two forms finance actually built: the crystalline spire and the
  // pre-war setback tower with a crown.
  financials: [3, 8, 0, 3],
  // Research campuses and the curved civic frontage of a hospital group.
  healthcare: [7, 6, 9, 1],
  // Retail and leisure: a podium with a tower over it, or a terraced block.
  consumer: [10, 2, 11, 1],
  // Supermarket and distribution sheds — broad, low-rise, flat.
  staples: [1, 5, 11, 1],
  // Works and yards: a plain mass or a courtyard of sheds.
  industrials: [5, 9, 1, 5],
  // Refineries and tank farms are horizontal, not vertical.
  energy: [5, 2, 1, 5],
  // Plant buildings and substations, plain and functional.
  utilities: [11, 5, 1, 11],
  // Processing plants: the broadest and plainest of all.
  materials: [5, 1, 9, 5],
  // The one sector whose buildings are its product, so it gets the terraces
  // and the oval that read as architecture rather than industry.
  realestate: [10, 6, 1, 10],
};
/**
 * The massing a company's building uses. `index` only picks between the forms
 * its sector offers, so adding or reordering companies varies the street
 * without ever giving a company a silhouette from another industry.
 */
export function formFor(
  ticker: string,
  index: number,
  sector?: string,
): number {
  const signature = signatureForms[ticker];
  if (signature !== undefined) return signature;
  const forms = sector ? sectorForms[sector] : undefined;
  if (!forms) return (((index % 12) + 12) % 12);
  return forms[(((index % forms.length) + forms.length) % forms.length)];
}
/** Exposed so a test can check every sector is covered and uses real forms. */
export const formsBySector = sectorForms;
