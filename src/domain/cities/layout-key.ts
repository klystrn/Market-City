import type { Company, Plot } from "../types";
// A baked layout is only valid for the exact company set it was solved for.
// Placement depends on which companies exist, their sector and subsector, and
// their market capitalisation — and on nothing else, which is the same rule the
// layout tests assert. Quote ticks and God overrides move prices, not lots, so
// they must not appear here or the key would miss on every refresh.
/**
 * Bump whenever placement itself changes — plot positions, sizes, or the rule
 * that picks a building's massing. The roster can be identical while the
 * generator that turned it into lots is not, and without this a fixture baked
 * by the old generator would keep matching its key and silently win over the
 * new one. That is not a theoretical risk: choosing building forms by sector
 * rather than by index position changed every lot's `variant` without touching
 * a single company, and the key noticed nothing.
 */
export const LAYOUT_VERSION = 2;
export function layoutKey(companies: Company[]): string {
  return [
    `v${LAYOUT_VERSION}`,
    ...companies
      .map((c) => `${c.ticker}:${c.sector}:${c.subsector}:${c.marketCap}`)
      .sort(),
  ].join("|");
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
