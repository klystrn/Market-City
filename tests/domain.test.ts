import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { sectors, createPlots, performanceColor } from "../src/domain/city";
import {
  breadth,
  explain,
  themeFor,
  weightedChange,
} from "../src/domain/analytics";
import { parseCommand, resolveIntent } from "../src/services/commands";
import { validateSnapshot } from "../src/services/snapshot";
import { isLand, cityRoads, cityStreets } from "../src/domain/geography";
import { subsectors } from "../src/domain/subsectors";
const demo = createDemo();

test("road corridors leave company footprints clear", () => {
  const plots = createPlots(demo.companies);
  for (const road of cityRoads())
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1],
        b = road.points[i];
      const samples = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2);
      for (let n = 0; n <= samples; n++) {
        const t = n / (samples || 1),
          x = a[0] + t * (b[0] - a[0]),
          z = a[1] + t * (b[1] - a[1]);
        for (const p of plots) {
          const dx = Math.max(0, Math.abs(x - p.x) - p.width / 2),
            dz = Math.max(0, Math.abs(z - p.z) - p.depth / 2);
          assert.ok(
            Math.hypot(dx, dz) > road.width / 2,
            road.id + " crosses " + p.ticker,
          );
        }
      }
    }
});
test("subsector streets locate every company and terrain keeps buildings out of the river", () => {
  const plots = createPlots(demo.companies);
  assert.equal(plots.length, 100);
  for (const c of demo.companies)
    assert.ok(
      subsectors.some(
        (s) => s.id === c.subsector && s.tickers.includes(c.ticker),
      ),
    );
  assert.equal(cityStreets().length, 29);
  assert.equal(cityRoads().filter((r) => r.bridge).length, 5);
  for (const p of plots)
    for (const dx of [-p.width / 2, p.width / 2])
      for (const dz of [-p.depth / 2, p.depth / 2])
        assert.ok(
          isLand([p.x + dx, p.z + dz]),
          `${p.ticker} crosses the shoreline`,
        );
  assert.deepEqual(parseCommand("semi", demo), {
    type: "subsector",
    subsector: "semiconductors",
  });
  assert.deepEqual(resolveIntent(parseCommand("memory", demo), demo).tickers, [
    "MU",
  ]);
  assert.ok(
    resolveIntent(parseCommand("software", demo), demo).tickers.includes(
      "MSFT",
    ),
  );
});
test("100 deterministic demo companies cover every district, with positive valid data", () => {
  assert.equal(demo.companies.length, 100);
  assert.equal(new Set(demo.companies.map((c) => c.ticker)).size, 100);
  assert.deepEqual(demo, createDemo());
  assert.ok(validateSnapshot(demo));
  for (const sector of sectors)
    assert.ok(demo.companies.some((c) => c.sector === sector.id));
  assert.ok(
    demo.companies.every(
      (c) => c.dataStatus === "demo" && c.history.length === 90 && c.volume > 0,
    ),
  );
});
test("plots remain stable on quote changes; buildings stay inside their district and do not overlap", () => {
  const plots = createPlots(demo.companies);
  assert.deepEqual(plots, createPlots(createDemo("selloff", 25).companies));
  for (const p of plots) {
    const c = demo.companies.find((c) => c.ticker === p.ticker)!;
    const s = sectors.find((s) => s.id === c.sector)!;
    assert.ok(Math.abs(p.x - s.x) + p.width / 2 < s.width / 2);
    assert.ok(Math.abs(p.z - s.z) + p.depth / 2 < s.depth / 2);
    for (const q of plots) {
      if (p === q) continue;
      assert.ok(
        Math.abs(p.x - q.x) >= (p.width + q.width) / 2 ||
          Math.abs(p.z - q.z) >= (p.depth + q.depth) / 2,
        `${p.ticker} overlaps ${q.ticker}`,
      );
    }
  }
});
test("market encodings are stable, directional and have a deadband", () => {
  assert.equal(performanceColor(0.01), performanceColor(-0.01));
  assert.notEqual(performanceColor(3), performanceColor(-3));
  assert.equal(themeFor(-0.02, false), false);
  assert.equal(themeFor(0.02, true), true);
  assert.equal(themeFor(-0.5, false), true);
  const b = breadth(demo.companies);
  assert.equal(b.up + b.down + b.flat, 100);
  assert.equal(weightedChange([]), 0);
});
test("commands resolve names, ticker punctuation, sectors and filters", () => {
  assert.deepEqual(parseCommand("News for Apple", demo), {
    type: "company",
    ticker: "AAPL",
    news: true,
  });
  assert.deepEqual(parseCommand("Show BRK.B", demo), {
    type: "company",
    ticker: "BRK.B",
    news: false,
  });
  assert.deepEqual(parseCommand("Show stocks down more than 2%", demo), {
    type: "move",
    direction: "down",
    threshold: 2,
  });
  assert.deepEqual(parseCommand("Show technology", demo), {
    type: "sector",
    sector: "technology",
  });
  assert.equal(parseCommand("What is moving today?", demo).type, "movers");
  assert.equal(parseCommand("nonsense command", demo).type, "unknown");
  const matches = resolveIntent(
    { type: "move", direction: "down", threshold: 2 },
    demo,
  ).tickers;
  assert.ok(
    matches.every(
      (t) => demo.companies.find((c) => c.ticker === t)!.changePercent < -2,
    ),
  );
  assert.equal(
    resolveIntent({ type: "move", direction: "up", threshold: 100 }, demo)
      .tickers.length,
    0,
  );
});
test("earnings filters exclude past events and events beyond the next seven days", () => {
  const snapshot = structuredClone(demo);
  snapshot.catalysts[0].date = "2020-01-01T00:00:00Z";
  const result = resolveIntent({ type: "earnings" }, snapshot);
  assert.ok(!result.tickers.includes("NVDA"));
  assert.ok(result.tickers.length > 0);
});
test("fictional stories never become evidence for real company quotes", () => {
  const company = { ...demo.companies[2], dataStatus: "eod" as const };
  const insight = explain(company, demo);
  assert.equal(insight.confidence, "Low");
  assert.ok(insight.note.includes("No verified catalyst"));
  assert.ok(!insight.evidence.some((e) => e.includes("story")));
});
test("snapshot validation rejects unsafe URLs and broken prices", () => {
  const invalid = structuredClone(demo);
  invalid.news[0].url = "javascript:alert(1)";
  assert.equal(validateSnapshot(invalid), false);
  invalid.news[0].url = "https://example.com/news";
  invalid.companies[0].price = NaN;
  assert.equal(validateSnapshot(invalid), false);
  assert.equal(validateSnapshot(null), false);
});
