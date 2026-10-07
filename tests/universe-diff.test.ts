import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { universeDiff } from "../src/domain/universe-diff";
import { weightedChange } from "../src/domain/analytics";
import { companiesForCity, cityCatalog } from "../src/domain/cities/catalog";

const { companies } = createDemo();

test("universe diff partitions each universe exactly once", () => {
  const d = universeDiff(companies, "sp500", "nasdaq100");
  for (const s of [d.a, d.b]) {
    const city = cityCatalog.find((c) => c.universe === s.universe)!;
    const members = companiesForCity(companies, city);
    // Shared plus this side's own companies is the whole universe, no more.
    assert.equal(s.all.companies.length, members.length);
    assert.equal(
      d.shared.companies.length + s.only.companies.length,
      members.length,
      `${s.universe} is not shared + only`,
    );
  }
  const tickers = [
    ...d.shared.companies,
    ...d.a.only.companies,
    ...d.b.only.companies,
  ].map((c) => c.ticker);
  assert.equal(new Set(tickers).size, tickers.length, "a company sits in two segments");
  // Sector rows hold every company once.
  const rowCount = d.sectors.reduce(
    (n, s) => n + s.shared.length + s.onlyA.length + s.onlyB.length,
    0,
  );
  assert.equal(rowCount, tickers.length);
});

test("the headline gap is fully explained by each universe's own companies", () => {
  // Hold for any day, so check several simulated sessions, both directions.
  for (const [a, b] of [
    ["sp500", "nasdaq100"],
    ["nasdaq100", "sp500"],
  ] as const) {
    for (const shift of [-3, -0.5, 0, 1.2, 4]) {
      const day = companies.map((c, i) => ({
        ...c,
        changePercent: c.changePercent + shift * ((i % 5) - 2) * 0.4,
      }));
      const d = universeDiff(day, a, b);
      const cityA = cityCatalog.find((c) => c.universe === a)!;
      const cityB = cityCatalog.find((c) => c.universe === b)!;
      // The headline each city shows is the move the diff reports for it.
      assert.ok(
        Math.abs(d.a.all.change - weightedChange(companiesForCity(day, cityA))) < 1e-9,
      );
      assert.ok(
        Math.abs(d.b.all.change - weightedChange(companiesForCity(day, cityB))) < 1e-9,
      );
      assert.ok(
        Math.abs(d.gap - (d.a.onlyEffect - d.b.onlyEffect)) < 1e-9,
        `gap ${d.gap} is not explained by ${d.a.onlyEffect} − ${d.b.onlyEffect}`,
      );
      assert.ok(d.a.onlyWeight >= 0 && d.a.onlyWeight <= 1);
    }
  }
});

test("segments list the largest companies first", () => {
  const d = universeDiff(companies, "sp500", "nasdaq100");
  for (const seg of [d.shared, d.a.only]) {
    const caps = seg.companies.map((c) => c.marketCap);
    assert.deepEqual(caps, [...caps].sort((x, y) => y - x));
  }
});
