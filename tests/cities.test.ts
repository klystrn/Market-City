import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { cities, companiesForCity, getCity } from "../src/domain/cities";
import { boroughShapes, newYorkDistricts } from "../src/domain/cities/newyork";
import {
  LONDON_RADIUS,
  londonDistricts,
  londonLandmarks,
  londonRoads,
  zoneInner,
  zoneOuter,
} from "../src/domain/cities/london";
import { inUniverse, nasdaq100Members } from "../src/domain/indexes";
import { parseCommand } from "../src/services/commands";
import { massing } from "../src/domain/massing";
import { sectorIdentities } from "../src/domain/sectors";
import type { Point } from "../src/domain/geography";
import type { Plot } from "../src/domain/types";

const demo = createDemo();

function overlaps(a: Plot, b: Plot) {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 - 0.01 &&
    Math.abs(a.z - b.z) < (a.depth + b.depth) / 2 - 0.01
  );
}

// Ray casting, so a lot can be checked against the borough polygon it claims.
function inPolygon(x: number, z: number, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i],
      [xj, zj] = polygon[j];
    if (
      zi > z !== zj > z &&
      x < ((xj - xi) * (z - zi)) / (zj - zi) + xi
    )
      inside = !inside;
  }
  return inside;
}

test("every city places its whole universe, deterministically and without overlaps", () => {
  for (const city of cities) {
    const members = companiesForCity(demo.companies, city);
    const plots = city.createPlots(members);
    assert.equal(
      new Set(plots.map((p) => p.ticker)).size,
      members.length,
      city.id + " must place every member exactly once",
    );
    assert.deepEqual(
      plots,
      city.createPlots(companiesForCity(createDemo("selloff", 25).companies, city)),
      city.id + " layout must not depend on the market session",
    );
    for (let i = 0; i < plots.length; i++)
      for (let j = i + 1; j < plots.length; j++)
        assert.ok(
          !overlaps(plots[i], plots[j]),
          `${city.id}: ${plots[i].ticker} overlaps ${plots[j].ticker}`,
        );
  }
});

test("market cap is encoded as built volume, not height alone", () => {
  const small = massing(2e10),
    large = massing(2.5e12);
  assert.ok(large.footprint > small.footprint, "footprint must grow with cap");
  assert.ok(large.height > small.height, "height must grow with cap");
  assert.ok(large.volume > small.volume * 4, "volume must separate the tiers");
  // Both cities rank companies by the volume they occupy, so a mega-cap on a
  // tight street still owns more space than a mid-cap on a wide one.
  for (const city of cities.filter((c) => c.id !== "tokyo")) {
    const plots = city.createPlots(companiesForCity(demo.companies, city));
    const byTicker = new Map(plots.map((p) => [p.ticker, p]));
    const ranked = companiesForCity(demo.companies, city)
      .slice()
      .sort((a, b) => b.marketCap - a.marketCap);
    const top = byTicker.get(ranked[0].ticker)!,
      bottom = byTicker.get(ranked[ranked.length - 1].ticker)!;
    const volume = (p: Plot) => p.width * p.depth * p.height;
    assert.ok(
      volume(top) > volume(bottom) * 3,
      city.id + " must give the largest company far more built volume",
    );
  }
});

test("New York boroughs rank sectors by market capitalisation", () => {
  const capBySector = new Map<string, number>();
  for (const c of demo.companies)
    capBySector.set(c.sector, (capBySector.get(c.sector) ?? 0) + c.marketCap);
  const rankOf = new Map(
    getCity("newyork").tiers.map((t) => [t.id, t.rank] as const),
  );
  // Documented rule: Manhattan, Queens, Staten Island, Brooklyn, Bronx from the
  // largest sector market capitalisation to the smallest. Every sector in a
  // higher-ranked borough must out-capitalise every sector below it.
  for (const a of newYorkDistricts)
    for (const b of newYorkDistricts) {
      if (rankOf.get(a.tier!)! >= rankOf.get(b.tier!)!) continue;
      assert.ok(
        capBySector.get(a.id)! > capBySector.get(b.id)!,
        `${a.id} (${a.tier}) must out-capitalise ${b.id} (${b.tier})`,
      );
    }
});

test("New York lots stay inside the borough their neighbourhood belongs to", () => {
  const city = getCity("newyork");
  const tierOf = new Map(newYorkDistricts.map((d) => [d.id, d.tier!] as const));
  const sectorOf = new Map(demo.companies.map((c) => [c.ticker, c.sector]));
  for (const p of city.createPlots(companiesForCity(demo.companies, city))) {
    const borough = tierOf.get(sectorOf.get(p.ticker)!)!;
    assert.equal(p.tier, borough, p.ticker + " must record its borough");
    assert.ok(
      inPolygon(p.x, p.z, boroughShapes[borough]),
      `${p.ticker} sits outside ${borough}`,
    );
  }
  assert.deepEqual(
    newYorkDistricts.map((d) => d.id).sort(),
    sectorIdentities.map((s) => s.id).sort(),
    "every sector needs a neighbourhood",
  );
});

test("London zones run largest-first from the centre outward", () => {
  const city = getCity("london");
  const plots = city.createPlots(companiesForCity(demo.companies, city));
  const capOf = new Map(demo.companies.map((c) => [c.ticker, c.marketCap]));
  const pinned = new Set(
    londonLandmarks.filter((l) => l.ticker).map((l) => l.ticker!),
  );
  assert.ok(pinned.has("AAPL"), "the Shard stands in for Apple");
  const bySector = new Map<string, Plot[]>();
  for (const p of plots) {
    const sector = demo.companies.find((c) => c.ticker === p.ticker)!.sector;
    bySector.set(sector, [...(bySector.get(sector) ?? []), p]);
  }
  for (const [sector, members] of bySector) {
    const zoneOf = (p: Plot) => Number(p.tier!.replace("zone-", ""));
    const ordered = members
      .slice()
      .sort((a, b) => capOf.get(b.ticker)! - capOf.get(a.ticker)!);
    for (let i = 1; i < ordered.length; i++)
      assert.ok(
        zoneOf(ordered[i]) >= zoneOf(ordered[i - 1]),
        `${sector}: ${ordered[i].ticker} must not sit inside a larger neighbour`,
      );
    // Each sector cuts through the zones, so its members share one wedge —
    // apart from the companies pinned to a real London building, which stand
    // wherever that building really is.
    const bearings = members
      .filter((p) => !pinned.has(p.ticker))
      .map((p) => Math.atan2(p.z, p.x));
    const spread = Math.max(...bearings) - Math.min(...bearings);
    assert.ok(spread < Math.PI / 2, sector + " must stay in one wedge");
  }
  for (const p of plots) {
    if (pinned.has(p.ticker)) continue;
    const rank = Number(p.tier!.replace("zone-", ""));
    const radius = Math.hypot(p.x, p.z);
    assert.ok(
      radius >= zoneInner(rank) - 8 && radius <= zoneOuter(Math.max(rank, 1)) + 8,
      `${p.ticker} is not inside zone ${rank}`,
    );
    assert.ok(radius < LONDON_RADIUS + 20, p.ticker + " is outside the city");
  }
  assert.equal(londonDistricts.length, sectorIdentities.length);
});

test("universes filter the skyline and every city declares one", () => {
  assert.ok(nasdaq100Members.every((t) => inUniverse(t, "nasdaq100")));
  assert.ok(demo.companies.every((c) => inUniverse(c.ticker, "sp500")));
  const nasdaq = companiesForCity(demo.companies, getCity("tokyo"));
  assert.ok(
    nasdaq.length > 0 && nasdaq.length < demo.companies.length,
    "the Nasdaq-100 view must be a strict subset",
  );
  assert.ok(
    !nasdaq.some((c) => c.ticker === "JPM"),
    "NYSE-listed banks are not Nasdaq-100 members",
  );
  for (const city of cities) {
    assert.ok(city.tiers.length > 0, city.id + " needs market-cap tiers");
    assert.ok(city.tierNoun.length > 0, city.id + " needs a tier noun");
    assert.deepEqual(
      city.tiers.map((t) => t.rank),
      city.tiers.map((_, i) => i + 1),
      city.id + " tiers must be ranked 1..n in order",
    );
  }
  assert.equal(getCity("nowhere").id, cities[0].id, "unknown ids fall back");
});

test("a partial company name resolves the way the suggestion list promises", () => {
  for (const [query, ticker] of [
    ["JPMorgan", "JPM"],
    ["Berkshire", "BRK.B"],
    ["nvidia", "NVDA"],
  ] as const) {
    const intent = parseCommand(query, demo);
    assert.equal(intent.type, "company", query + " must find a company");
    assert.equal(
      intent.type === "company" ? intent.ticker : "",
      ticker,
      query + " must find " + ticker,
    );
  }
  // Structured queries still win over the substring fallback.
  assert.equal(parseCommand("energy", demo).type, "sector");
  assert.equal(parseCommand("earnings this week", demo).type, "earnings");
});

test("London has no empty zone and no road running through a building", () => {
  const city = getCity("london");
  const plots = city.createPlots(companiesForCity(demo.companies, city));
  // Zones exist to carry companies; an empty ring only makes the model bigger.
  for (const zone of city.tiers)
    assert.ok(
      plots.some((p) => p.tier === zone.id),
      zone.name + " has no companies and should not exist",
    );
  assert.ok(
    plots.every((p) => city.tiers.some((t) => t.id === p.tier)),
    "every lot must name a zone the city declares",
  );
  // Streets front the rows rather than dividing them, so no carriageway may
  // cross a lot. Sampling is dense enough to catch a clipped corner.
  for (const road of londonRoads(plots)) {
    if (road.bridge) continue;
    for (let i = 1; i < road.points.length; i++) {
      const [ax, az] = road.points[i - 1],
        [bx, bz] = road.points[i];
      for (let t = 0; t <= 1; t += 0.02) {
        const x = ax + (bx - ax) * t,
          z = az + (bz - az) * t;
        for (const p of plots) {
          const dx = Math.max(0, Math.abs(x - p.x) - p.width / 2),
            dz = Math.max(0, Math.abs(z - p.z) - p.depth / 2);
          assert.ok(
            Math.hypot(dx, dz) >= road.width / 2,
            `${road.id} runs through ${p.ticker}`,
          );
        }
      }
    }
  }
  // No street is drawn where the city has not built.
  assert.ok(
    londonRoads([]).every((r) => r.bridge),
    "an empty London draws only its river crossings",
  );
  // No closed ring roads: a street must not return to where it started.
  for (const road of londonRoads(plots)) {
    const first = road.points[0],
      last = road.points[road.points.length - 1];
    assert.ok(
      Math.hypot(first[0] - last[0], first[1] - last[1]) > 4,
      road.id + " closes into a ring",
    );
  }
  // London is inland: no sea beyond the edge, but the Thames still runs.
  assert.equal(city.surround, "land");
  assert.ok(city.water.length > 0, "the Thames must still be drawn");
  assert.equal(getCity("newyork").surround, "sea");
});
