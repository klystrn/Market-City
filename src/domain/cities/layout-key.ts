import type { Company, Plot } from "../types";
// A baked layout is only valid for the exact company set it was solved for.
// Placement depends on which companies exist, their sector and subsector, and
// their market capitalisation — and on nothing else, which is the same rule the
// layout tests assert. Quote ticks and God overrides move prices, not lots, so
// they must not appear here or the key would miss on every refresh.
export function layoutKey(companies: Company[]): string {
  return companies
    .map((c) => `${c.ticker}:${c.sector}:${c.subsector}:${c.marketCap}`)
    .sort()
    .join("|");
}
export interface BakedLayout {
  key: string;
  plots: Plot[];
}
/**
 * The city's lots, taken from the layout baked at build time when it still
 * applies and solved in the browser when it does not — a live provider snapshot
 * can carry a different roster than the seeded one.
 */
export function plotsFor(
  city: { createPlots: (c: Company[]) => Plot[]; bakedLayout?: BakedLayout },
  companies: Company[],
): Plot[] {
  const baked = city.bakedLayout;
  return baked && baked.key === layoutKey(companies)
    ? baked.plots
    : city.createPlots(companies);
}
