"use client";
import { Landmark } from "lucide-react";
import { marketHistory } from "@/domain/market-history";
import Dialog from "./Dialog";
export default function MarketHistoryTimeline({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <Dialog
      label="Museum of Markets"
      eyebrow="VERIFIED HISTORY"
      onClose={onClose}
    >
      <div className="panel-heading">
        <h2>
          <Landmark size={18} /> Museum of Markets
        </h2>
      </div>
      <p className="fine-print">
        Real, well-documented events from U.S. financial history — unrelated to
        this city’s simulated companies and prices, and not a prediction of
        future performance.
      </p>
      <ol className="history-timeline">
        {marketHistory.map((e) => (
          <li key={e.id}>
            <time dateTime={e.date}>
              {new Date(e.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
            <div>
              <strong>{e.title}</strong>
              <p>{e.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Dialog>
  );
}
