"use client";
import { Bookmark, Columns3, X } from "lucide-react";
import type { Snapshot } from "@/domain/types";
import { money, pct } from "@/domain/analytics";
import Dialog from "./Dialog";
export default function WatchlistPanel({
  tickers,
  snapshot,
  onSelect,
  onRemove,
  onClose,
  compare,
  onToggleCompare,
}: {
  tickers: string[];
  snapshot: Snapshot;
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  onClose: () => void;
  compare: string[];
  onToggleCompare: (ticker: string) => void;
}) {
  const companies = tickers
    .map((t) => snapshot.companies.find((c) => c.ticker === t))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  return (
    <Dialog label="Watchlist" eyebrow="YOUR WATCHLIST" onClose={onClose}>
      <h2>Companies you’re pinning.</h2>
      <p className="fine-print">
        Pin a company from its card to track it here. Saved only in this
        browser.
      </p>
      {companies.length ? (
        <ul className="watchlist-rows">
          {companies.map((c) => (
            <li key={c.ticker} className="watchlist-row">
              <button
                className="watchlist-select"
                onClick={() => onSelect(c.ticker)}
              >
                <span>
                  <strong>{c.ticker}</strong>
                  <small>{c.name}</small>
                </span>
                <span className="watchlist-price">
                  <b>{money(c.price)}</b>
                  <em
                    className={c.changePercent >= 0 ? "positive" : "negative"}
                  >
                    {pct(c.changePercent)}
                  </em>
                </span>
              </button>
              <button
                className={`icon-button ${compare.includes(c.ticker) ? "active" : ""}`}
                aria-pressed={compare.includes(c.ticker)}
                aria-label={`${compare.includes(c.ticker) ? "Remove" : "Add"} ${c.ticker} ${compare.includes(c.ticker) ? "from" : "to"} comparison`}
                onClick={() => onToggleCompare(c.ticker)}
                title="Add to comparison"
              >
                <Columns3 size={15} />
              </button>
              <button
                className="icon-button"
                aria-label={`Unpin ${c.ticker}`}
                onClick={() => onRemove(c.ticker)}
              >
                <X size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          <Bookmark size={14} /> No pinned companies yet. Open any company card
          and pin it to build your watchlist.
        </p>
      )}
    </Dialog>
  );
}
