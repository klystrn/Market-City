import { Html } from "@react-three/drei";
import { civicSites } from "@/domain/civic";
import type { Catalyst } from "@/domain/types";
// A departures-board style readout at the Central Exchange Station, listing
// the soonest upcoming earnings dates like train arrivals.
export default function EarningsArrivals({
  catalysts,
  now,
  onSelect,
}: {
  catalysts: Catalyst[];
  now: number;
  onSelect: (ticker: string) => void;
}) {
  const station = civicSites.find((s) => s.id === "station")!;
  const upcoming = catalysts
    .filter((c) => c.type === "EARNINGS" && Date.parse(c.date) >= now)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    .slice(0, 4);
  if (!upcoming.length) return null;
  return (
    <Html position={[station.x, 8.6, station.z]} center zIndexRange={[4, 0]}>
      <div
        className="earnings-board"
        role="list"
        aria-label="Upcoming earnings arrivals"
      >
        <span className="earnings-board-title">EARNINGS ARRIVALS</span>
        {upcoming.map((c) => {
          const days = Math.max(
            0,
            Math.round((Date.parse(c.date) - now) / 86400000),
          );
          return (
            <button
              key={c.id}
              role="listitem"
              className="earnings-board-row"
              onClick={() => onSelect(c.ticker)}
            >
              <strong>{c.ticker}</strong>
              <span>{days === 0 ? "today" : `${days}d`}</span>
            </button>
          );
        })}
      </div>
    </Html>
  );
}
