import type { Snapshot } from "@/domain/types";
import { sectors } from "@/domain/city";
import { subsectors } from '@/domain/subsectors';
import { pct, weightedChange } from "@/domain/analytics";
export default function MarketList({
  snapshot,
  matches,
  onSelect,
}: {
  snapshot: Snapshot;
  matches: string[] | null;
  onSelect: (ticker: string) => void;
}) {
  return (
    <div className="market-list" aria-label="Accessible market overview">
      <div className="list-intro">
        <span className="eyebrow">THE MARKET, AT A GLANCE</span>
        <h1>Your market towns.</h1>
        <p>
          Explore companies by sector. All the intelligence, in a lighter view.
        </p>
      </div>
      {sectors.map((s) => {
        const companies = snapshot.companies.filter(
          (c) => c.sector === s.id && (!matches || matches.includes(c.ticker)),
        );
        return companies.length ? (
          <section key={s.id} className="list-sector">
            <div className="panel-heading">
              <h2>{s.short}</h2>
              <b
                className={
                  weightedChange(companies) >= 0 ? "positive" : "negative"
                }
              >
                {pct(weightedChange(companies))}
              </b>
            </div>
            {subsectors.filter(sub=>sub.sector===s.id&&companies.some(c=>c.subsector===sub.id)).map(sub=><div key={sub.id} className="list-street"><h3>{sub.street} <span>{sub.name}</span></h3><div className="company-tiles">
              {companies.filter(c=>c.subsector===sub.id).map((c) => (
                <button key={c.ticker} onClick={() => onSelect(c.ticker)}>
                  <strong>{c.ticker}</strong>
                  <span>{c.name}</span>
                  <b className={c.changePercent >= 0 ? "positive" : "negative"}>
                    {pct(c.changePercent)}
                  </b>
                  <small className="fine-print">
                    {c.dataStatus.toUpperCase()}
                  </small>
                </button>
              ))}
            </div></div>)}
          </section>
        ) : null;
      })}
      {matches?.length === 0 && (
        <p>No companies match this filter. Clear it to see the city again.</p>
      )}
    </div>
  );
}
