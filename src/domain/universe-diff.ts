import type { Company } from "./types";
import type { UniverseId } from "./cities/types";
import { inUniverse } from "./indexes";
import { weightedChange } from "./analytics";
import { sectorIdentities } from "./sectors";

// Switching city switches universe, and with it which buildings exist and what
// the headline move says. Without an account of the difference that change is
// surprising: the S&P 500 can be up while the Nasdaq-100 is down on the same
// simulated day, and a third of the skyline vanishes. This states which
// companies each universe holds and why the two headline moves differ.
//
// The headline gap is decomposed exactly rather than described. With s the
// cap-weighted move of the shared companies, and w the share of a universe's
// market cap held by companies only it contains, moving at o:
//   move(A) − s = wA·(oA − s)   and   move(B) − s = wB·(oB − s)
// so move(A) − move(B) = wA·(oA − s) − wB·(oB − s). Each term is "what the
// companies only this universe holds did to it", and they sum to the gap.

export interface Segment {
  companies: Company[];
  marketCap: number;
  /** Cap-weighted daily move of this segment, in percent. */
  change: number;
}
export interface UniverseSide {
  universe: UniverseId;
  all: Segment;
  /** Companies held by this universe and not the other. */
  only: Segment;
  /** Share of this universe's market cap held by `only`, 0–1. */
  onlyWeight: number;
  /** What `only` did to this universe's headline, in percentage points. */
  onlyEffect: number;
}
export interface SectorDiff {
  sector: string;
  name: string;
  shared: Company[];
  onlyA: Company[];
  onlyB: Company[];
}
export interface UniverseDiff {
  a: UniverseSide;
  b: UniverseSide;
  shared: Segment;
  /** move(A) − move(B), in percentage points; equals a.onlyEffect − b.onlyEffect. */
  gap: number;
  sectors: SectorDiff[];
}

const byCap = (x: Company, y: Company) => y.marketCap - x.marketCap;
function segment(companies: Company[]): Segment {
  const sorted = [...companies].sort(byCap);
  return {
    companies: sorted,
    marketCap: sorted.reduce((s, c) => s + c.marketCap, 0),
    change: weightedChange(sorted),
  };
}
function side(
  universe: UniverseId,
  all: Company[],
  only: Company[],
  shared: Segment,
): UniverseSide {
  const a = segment(all),
    o = segment(only);
  const onlyWeight = a.marketCap ? o.marketCap / a.marketCap : 0;
  return {
    universe,
    all: a,
    only: o,
    onlyWeight,
    onlyEffect: only.length ? onlyWeight * (o.change - shared.change) : 0,
  };
}

/** Compares two universes over one roster. `a` is usually the one on screen. */
export function universeDiff(
  companies: Company[],
  a: UniverseId,
  b: UniverseId,
): UniverseDiff {
  const inA = companies.filter((c) => inUniverse(c.ticker, a));
  const inB = companies.filter((c) => inUniverse(c.ticker, b));
  const bSet = new Set(inB.map((c) => c.ticker));
  const aSet = new Set(inA.map((c) => c.ticker));
  const shared = segment(inA.filter((c) => bSet.has(c.ticker)));
  const onlyA = inA.filter((c) => !bSet.has(c.ticker));
  const onlyB = inB.filter((c) => !aSet.has(c.ticker));
  const sideA = side(a, inA, onlyA, shared);
  const sideB = side(b, inB, onlyB, shared);
  const sectors = sectorIdentities
    .map((s) => ({
      sector: s.id,
      name: s.short,
      shared: shared.companies.filter((c) => c.sector === s.id),
      onlyA: sideA.only.companies.filter((c) => c.sector === s.id),
      onlyB: sideB.only.companies.filter((c) => c.sector === s.id),
    }))
    .filter((s) => s.shared.length + s.onlyA.length + s.onlyB.length > 0);
  return {
    a: sideA,
    b: sideB,
    shared,
    gap: sideA.all.change - sideB.all.change,
    sectors,
  };
}
