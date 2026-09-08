import { Html } from "@react-three/drei";
import type { Catalyst } from "@/domain/types";
import { X } from "lucide-react";
// A departures-board style readout at the Central Exchange Station, listing
// the soonest upcoming earnings dates like train arrivals.
export default function EarningsArrivals({
  catalysts,
  now,
  station,
  onSelect,
  onDismiss,
}: {
  catalysts: Catalyst[];
  now: number;
  /** The city's transit landmark, where the board hangs. */
  station: { x: number; z: number };
  onSelect: (ticker: string) => void;
  onDismiss: () => void;
}) {
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
        <div className="earnings-board-heading">
          <span className="earnings-board-title">EARNINGS ARRIVALS</span>
          <button
            className="earnings-board-close"
            aria-label="Hide earnings arrivals"
            title="Hide earnings arrivals"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
          >
            <X size={12} />
          </button>
        </div>
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
