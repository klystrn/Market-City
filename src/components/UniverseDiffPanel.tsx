"use client";
import { useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";
import type { Company } from "@/domain/types";
import type { UniverseId } from "@/domain/cities/types";
import { cityCatalog } from "@/domain/cities/catalog";
import { universeNames, universeNotes } from "@/domain/indexes";
import { compact, pct } from "@/domain/analytics";
import { universeDiff } from "@/domain/universe-diff";
import Dialog from "./Dialog";

const points = (n: number) =>
  `${Math.abs(n).toFixed(2)} point${Math.abs(n).toFixed(2) === "1.00" ? "" : "s"}`;
const share = (w: number) => `${Math.round(w * 100)}%`;
const tone = (n: number) => (n >= 0 ? "positive" : "negative");

/**
 * Which companies each market universe holds, and why the two headline moves
 * differ. Switching city switches universe, so without this a third of the
 * skyline disappearing and the pulse changing sign would be unexplained.
 */
export default function UniverseDiffPanel({
  companies,
  universe,
  onSelect,
  onSwitchCity,
  onClose,
}: {
  /** The full roster, before the active city filtered it. */
  companies: Company[];
  universe: UniverseId;
  onSelect: (ticker: string) => void;
  onSwitchCity: (cityId: string) => void;
  onClose: () => void;
}) {
  const other: UniverseId = universe === "sp500" ? "nasdaq100" : "sp500";
  const d = useMemo(
    () => universeDiff(companies, universe, other),
    [companies, universe, other],
  );
  const here = universeNames[universe],
    there = universeNames[other];
  const otherCity = cityCatalog.find((c) => c.universe === other);
  // A company only exists on this map if it is in this universe.
  const chip = (c: Company, onMap: boolean) =>
    onMap ? (
      <button
        key={c.ticker}
        className="universe-chip"
        title={`${c.name} · $${compact(c.marketCap)}`}
        onClick={() => {
          onSelect(c.ticker);
          onClose();
        }}
      >
        {c.ticker}
      </button>
    ) : (
      <span
        key={c.ticker}
        className="universe-chip off-map"
        title={`${c.name} · $${compact(c.marketCap)} · not on this map`}
      >
        {c.ticker}
      </span>
    );
  // Name the side whose own companies opened the gap, in words.
  const lead =
    Math.abs(d.a.onlyEffect) >= Math.abs(d.b.onlyEffect) ? d.a : d.b;
  return (
    <Dialog
      label={`${here} and ${there} compared`}
      eyebrow="UNIVERSE DIFF"
      onClose={onClose}
      className="universe-panel"
    >
      <h2>
        {here} and {there}, side by side.
      </h2>
      <div className="universe-tiles">
        <div>
          <strong>{d.shared.companies.length}</strong>
          <small>in both</small>
        </div>
        <div>
          <strong>{d.a.only.companies.length}</strong>
          <small>only in {here}</small>
        </div>
        <div>
          <strong>{d.b.only.companies.length}</strong>
          <small>only in {there}</small>
        </div>
      </div>
      <dl className="universe-moves">
        <div>
          <dt>{here}</dt>
          <dd className={tone(d.a.all.change)}>{pct(d.a.all.change)}</dd>
        </div>
        <div>
          <dt>{there}</dt>
          <dd className={tone(d.b.all.change)}>{pct(d.b.all.change)}</dd>
        </div>
        <div>
          <dt>Companies in both</dt>
          <dd className={tone(d.shared.change)}>{pct(d.shared.change)}</dd>
        </div>
      </dl>
      <p className="universe-why">
        {Math.abs(d.gap) < 0.005 ? (
          <>The two headlines agree today to two decimal places.</>
        ) : (
          <>
            {here} reads {points(d.gap)} {d.gap > 0 ? "higher" : "lower"} than{" "}
            {there}.{" "}
            {lead.only.companies.length > 0 && (
              <>
                The {lead.only.companies.length} companies only{" "}
                {universeNames[lead.universe]} holds make up{" "}
                {share(lead.onlyWeight)} of its market cap and moved{" "}
                {pct(lead.only.change)} against {pct(d.shared.change)} for the
                companies in both
                {Math.abs(d.a.onlyEffect) > 0.004 &&
                Math.abs(d.b.onlyEffect) > 0.004
                  ? `, which accounts for ${points(lead.onlyEffect)} of the gap.`
                  : ", which accounts for all of it."}
              </>
            )}
          </>
        )}
      </p>
      <div className="universe-sectors" role="table" aria-label="Companies by sector">
        <div className="universe-sector-head" role="row">
          <span role="columnheader">Sector</span>
          <span role="columnheader">{here}</span>
          <span role="columnheader">{there}</span>
        </div>
        {d.sectors.map((s) => (
          <div key={s.sector} className="universe-sector" role="row">
            <strong role="rowheader">{s.name}</strong>
            <span role="cell">{s.shared.length + s.onlyA.length}</span>
            <span role="cell">{s.shared.length + s.onlyB.length}</span>
            <div className="universe-chips" role="cell">
              {s.onlyA.map((c) => chip(c, true))}
              {s.onlyB.map((c) => chip(c, false))}
              {s.onlyA.length + s.onlyB.length === 0 && (
                <span className="muted">Same companies in both</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {d.b.only.companies.length === 0 && (
        <p className="fine-print">
          Every {there} company here is also in the {here} set, because this
          dataset treats every seeded company as an S&amp;P 500 member. The real
          indexes overlap less: some Nasdaq-100 members are not in the S&amp;P
          500.
        </p>
      )}
      <p className="fine-print">
        {universeNotes[universe]} {universeNotes[other]} Simulated prices.
      </p>
      {otherCity && (
        <button
          className="universe-switch"
          onClick={() => {
            onSwitchCity(otherCity.id);
            onClose();
          }}
        >
          <ArrowRightLeft size={15} />
          Switch to {otherCity.name} · {there}
        </button>
      )}
    </Dialog>
  );
}
