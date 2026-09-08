import type { Company, Plot } from "./types";
import { sectors, cityStreets } from "./geography";
import { subsectors } from "./subsectors";
import { signatureForms } from "./forms";
export { sectors } from "./geography";
export function createPlots(companies: Company[]): Plot[] {
  const streets = cityStreets();
  return sectors.flatMap((sector) =>
    subsectors
      .filter((s) => s.sector === sector.id)
      .flatMap((group) => {
        const street = streets.find((s) => s.id === group.id)!;
        // Taxonomy order is stable: filtering or quote refreshes cannot move a plot.
        const members = companies
          .filter((c) => c.sector === sector.id && c.subsector === group.id)
          .sort(
            (a, b) =>
              group.tickers.indexOf(a.ticker) - group.tickers.indexOf(b.ticker),
          );
        const columns = Math.max(1, Math.ceil(members.length / 2));
        const usable = sector.width - 7,
          cell = usable / columns;
        return members.map((c, i) => {
          const desired = 3.1 + Math.log10(c.marketCap / 4e10 + 1) * 3.6;
          const width = Math.min(cell * 0.78, desired);
          const depth = Math.min((street.spacing - 2.7) / 2, desired * 0.78);
          return {
            ticker: c.ticker,
            x: sector.x + (Math.floor(i / 2) - (columns - 1) / 2) * cell,
            z: street.z + (i % 2 === 0 ? -1 : 1) * (1.3 + depth / 2),
            width,
            depth,
            height: 4 + Math.log10(c.marketCap / 4e10 + 1) * 11,
            variant:
              signatureForms[c.ticker] ??
              (group.tickers.indexOf(c.ticker) +
                subsectors.indexOf(group) * 3) %
                12,
          };
        });
      }),
  );
}
export function performanceColor(change: number, dark = false) {
  if (Math.abs(change) < 0.15) return dark ? "#939a90" : "#c2c7bb";
  const intensity = Math.min(Math.abs(change) / 5, 1);
  const low = change > 0 ? [104, 184, 137] : [231, 136, 118];
  const high = change > 0 ? [17, 143, 100] : [213, 62, 69];
  return `rgb(${low.map((v, i) => Math.round(v + (high[i] - v) * intensity)).join(",")})`;
}
