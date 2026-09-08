"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  X,
  Newspaper,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import type { Company, Snapshot } from "@/domain/types";
import {
  compact,
  explain,
  money,
  pct,
  weightedChange,
} from "@/domain/analytics";
import { sectors } from "@/domain/city";
import { subsectorFor } from "@/domain/subsectors";
function Chart({ company }: { company: Company }) {
  const [range, setRange] = useState(90);
  const history = company.history.slice(-range);
  const vals = history.map((p) => p.close);
  const min = Math.min(...vals),
    max = Math.max(...vals),
    span = max - min || 1;
  const points = history
    .map(
      (p, i) =>
        `${8 + (i / Math.max(1, history.length - 1)) * 304},${91 - ((p.close - min) / span) * 71}`,
    )
    .join(" ");
  return (
    <div className="chart">
      <div className="panel-heading">
        <span className="eyebrow">PRICE HISTORY</span>
        <div className="segmented">
          {[7, 30, 90].map((n) => (
            <button
              key={n}
              className={range === n ? "active" : ""}
              onClick={() => setRange(n)}
            >
              {n === 7 ? "1W" : n === 30 ? "1M" : "3M"}
            </button>
          ))}
        </div>
      </div>
      {history.length > 1 ? (
        <>
          <svg
            viewBox="0 0 320 110"
            role="img"
            aria-label={`${company.ticker} ${history.length} historical price points, ${money(vals[0])} to ${money(vals[vals.length - 1])}`}
          >
            <path
              d="M 8 20 H 312 M 8 55 H 312 M 8 90 H 312"
              className="chart-grid"
            />
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              cx="312"
              cy={91 - ((vals[vals.length - 1] - min) / span) * 71}
              r="3"
              fill="currentColor"
            />
          </svg>
          <div className="chart-axis">
            <span>{history[0].date}</span>
            <span>
              {money(min)} – {money(max)}
            </span>
          </div>
        </>
      ) : (
        <p className="muted">
          Historical prices unavailable for this snapshot.
        </p>
      )}
      <p className="fine-print">
        {company.dataStatus === "demo"
          ? "Illustrative history · simulated prices"
          : "Daily closing prices"}{" "}
        · {company.source}
      </p>
    </div>
  );
}
export default function CompanyPanel({
  company: c,
  snapshot,
  deep,
  onExplore,
  onClose,
  onBack,
  now,
}: {
  company: Company;
  snapshot: Snapshot;
  deep: boolean;
  onExplore: () => void;
  onClose: () => void;
  onBack: () => void;
  now: number;
}) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.scrollTo({ top: 0 });
  }, [deep, c.ticker]);
  const priceStale =
    c.dataStatus !== "demo" && now - Date.parse(c.updatedAt) > 36 * 3600000;
  const insights = explain(c, snapshot);
  const sector = sectors.find((s) => s.id === c.sector)!;
  const news = snapshot.news.filter((n) => n.tickers.includes(c.ticker));
  const catalysts = snapshot.catalysts.filter((e) => e.ticker === c.ticker);
  return (
    <>
      <aside
        ref={panel}
        className={`glass company-panel ${deep ? "deep-panel" : ""}`}
        aria-label={`${c.name} company details`}
      >
        <div className="panel-heading">
          <span className="eyebrow">
            {deep ? "COMPANY EXPLORER" : "IN FOCUS"}
          </span>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close company details"
          >
            <X size={18} />
          </button>
        </div>
        <div className="company-title">
          <div className="ticker-avatar">{c.ticker.slice(0, 2)}</div>
          <div>
            <h2>{c.name}</h2>
            <span className="muted">
              {c.ticker} <span className="dot-divider">·</span> {sector.short}
            </span>
            <span className="company-street">
              {subsectorFor(c.ticker)?.street}
            </span>
          </div>
        </div>
        {["GOOGL", "META"].includes(c.ticker) && (
          <p className="fine-print">
            GICS classifies search and social-media platforms as Communication
            Services, even when they also build technology.
          </p>
        )}
        <div className="price-line">
          <strong>{money(c.price)}</strong>
          <span
            className={`change-pill ${c.changePercent >= 0 ? "positive" : "negative"}`}
          >
            {c.changePercent >= 0 ? "↗" : "↘"} {pct(c.changePercent)}
          </span>
        </div>
        <p className="freshness">
          <span className="tiny-dot" />
          {c.dataStatus === "demo"
            ? "Simulated session"
            : `${c.dataStatus.toUpperCase()}${priceStale ? " · STALE" : ""}`}{" "}
          ·{" "}
          {new Date(c.updatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/New_York",
          })}{" "}
          ET
        </p>
        <section className="insight-block">
          <div className="panel-heading">
            <h3>Why it’s moving</h3>
            <span className="confidence">{insights.confidence} evidence</span>
          </div>
          <ul className="evidence-list">
            {insights.evidence.map((e, i) => (
              <li key={e}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {e}
              </li>
            ))}
          </ul>
          <p className="fine-print">{insights.note}</p>
        </section>
        <div className="comparison">
          <div>
            <span>vs. sector</span>
            <b className={insights.relative >= 0 ? "positive" : "negative"}>
              {insights.comparisonAvailable
                ? `${insights.relative >= 0 ? "+" : ""}${insights.relative.toFixed(2)} pp`
                : "—"}
            </b>
          </div>
          <div>
            <span>Market cap</span>
            <b>${compact(c.marketCap)}</b>
          </div>
          <div>
            <span>Rel. volume</span>
            <b>{c.relativeVolume.toFixed(1)}×</b>
          </div>
        </div>
        <section className="detail-section">
          <div className="section-title">
            <CalendarDays size={16} />
            <h3>On the horizon</h3>
          </div>
          {catalysts.length ? (
            catalysts.map((e) => (
              <div className="catalyst-card" key={e.id}>
                <div>
                  <strong>{e.title}</strong>
                  <span>
                    {e.dataStatus === "demo"
                      ? "Illustrative date"
                      : "Calendar event"}
                  </span>
                </div>
                <time dateTime={e.date}>
                  {new Date(e.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              </div>
            ))
          ) : (
            <p className="muted">No upcoming catalyst available.</p>
          )}
        </section>
        <section className="detail-section">
          <div className="section-title">
            <Newspaper size={16} />
            <h3>Latest stories</h3>
            <span className="count">{news.length}</span>
          </div>
          {news.length > 0 && (
            <p className="fine-print">
              Last news refresh:{" "}
              {new Date(
                Math.max(...news.map((n) => Date.parse(n.updatedAt))),
              ).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: "America/New_York",
              })}{" "}
              ET
            </p>
          )}
          {news.length ? (
            news.slice(0, deep ? 5 : 3).map((n) => (
              <article key={n.id} className="news-item">
                <div className="news-source">
                  <span>{n.source}</span>
                  <time dateTime={n.publishedAt}>
                    {new Date(n.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                {n.url ? (
                  <a href={n.url} target="_blank" rel="noreferrer">
                    {n.title}
                    <ArrowUpRight size={14} />
                  </a>
                ) : (
                  <p>{n.title}</p>
                )}
                <span className="fine-print">
                  {n.dataStatus === "demo"
                    ? "Fictional demo story"
                    : `Published ${new Date(n.publishedAt).toLocaleTimeString()}`}
                </span>
              </article>
            ))
          ) : (
            <p className="muted">
              No matching stories. News coverage may be limited.
            </p>
          )}
        </section>
        {deep && (
          <>
            <Chart company={c} />
            <div className="comparison">
              <div>
                <span>Sector</span>
                <b>
                  {pct(
                    weightedChange(
                      snapshot.companies.filter((p) => p.sector === c.sector),
                    ),
                  )}
                </b>
              </div>
              <div>
                <span>S&P 500</span>
                <b>{pct(snapshot.market.indexChange)}</b>
              </div>
              <div>
                <span>Volume</span>
                <b>{compact(c.volume)}</b>
              </div>
            </div>
            <p className="fine-print">
              Fundamentals and analyst estimates are unavailable in this
              dataset.
            </p>
          </>
        )}
      </aside>
      <div className="glass company-explore-card">
        <button
          className="primary-button explore-button"
          onClick={deep ? onBack : onExplore}
        >
          {deep ? (
            <>
              <ArrowLeft size={16} /> Return to city
            </>
          ) : (
            <>
              <span>
                <strong>Explore {c.name}</strong>
                <small>Company view · double-click its building</small>
              </span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
