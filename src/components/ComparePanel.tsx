"use client";
import { X } from "lucide-react";
import type { Snapshot } from "@/domain/types";
import { compact, money, pct } from "@/domain/analytics";
import { sectors } from "@/domain/city";
import Dialog from "./Dialog";
const rows: {
  label: string;
  value: (c: Snapshot["companies"][number]) => string;
  tone?: boolean;
}[] = [
  { label: "Price", value: (c) => money(c.price) },
  {
    label: "Daily change",
    value: (c) => pct(c.changePercent),
    tone: true,
  },
  { label: "Market cap", value: (c) => `$${compact(c.marketCap)}` },
  { label: "Rel. volume", value: (c) => `${c.relativeVolume.toFixed(1)}×` },
  { label: "Volume", value: (c) => compact(c.volume) },
  {
    label: "Sector",
    value: (c) => sectors.find((s) => s.id === c.sector)?.short ?? c.sector,
  },
  { label: "Data", value: (c) => c.dataStatus.toUpperCase() },
];
export default function ComparePanel({
  tickers,
  snapshot,
  onRemove,
  onClose,
}: {
  tickers: string[];
  snapshot: Snapshot;
  onRemove: (ticker: string) => void;
  onClose: () => void;
}) {
  const companies = tickers
    .map((t) => snapshot.companies.find((c) => c.ticker === t))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  return (
    <Dialog
      label="Compare companies"
      eyebrow="SIDE BY SIDE"
      onClose={onClose}
      className="compare-panel"
    >
      <h2>Compare companies.</h2>
      {companies.length < 2 ? (
        <p className="muted">
          Add at least two companies to compare. Use “Add to compare” on a
          company card or the watchlist.
        </p>
      ) : (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col">Metric</th>
                {companies.map((c) => (
                  <th scope="col" key={c.ticker}>
                    <div className="compare-head">
                      <span>
                        <strong>{c.ticker}</strong>
                        <small>{c.name}</small>
                      </span>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${c.ticker} from comparison`}
                        onClick={() => onRemove(c.ticker)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {companies.map((c) => (
                    <td
                      key={c.ticker}
                      className={
                        row.tone
                          ? c.changePercent >= 0
                            ? "positive"
                            : "negative"
                          : ""
                      }
                    >
                      {row.value(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="fine-print">Comparison is session-only and not saved.</p>
    </Dialog>
  );
}
