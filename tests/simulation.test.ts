import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import {
  applyGod,
  defaultGod,
  isFire,
  isEarthquake,
  projectTomorrow,
  tomorrowSnapshot,
} from "../src/domain/simulation";
test("God targets are coherent, non-mutating and take company precedence", () => {
  const base = createDemo(),
    saved = JSON.stringify(base),
    s = defaultGod();
  s.sectors.technology = -8;
  s.companies.AAPL = -12;
  s.index = -5;
  s.events = [{ ticker: "AAPL", type: "EARNINGS", sentiment: -0.8 }];
  const result = applyGod(base, s),
    a = result.companies.find((c) => c.ticker === "AAPL")!;
  assert.equal(a.changePercent, -12);
  assert.equal(a.price, Number((a.previousClose * 0.88).toFixed(2)));
  assert.equal(
    result.companies.find((c) => c.ticker === "MSFT")!.changePercent,
    -8,
  );
  assert.equal(result.market.indexChange, -5);
  assert.equal(result.catalysts[0].ticker, "AAPL");
  assert.equal(result.news[0].dataStatus, "demo");
  assert.equal(JSON.stringify(base), saved);
  assert.equal(isFire(-10), false);
  assert.equal(isFire(-10.01), true);
  assert.equal(isEarthquake(-5), true);
  assert.equal(isEarthquake(-4.99), false);
});
test("God session boundaries and reset are deterministic", () => {
  const base = createDemo();
  for (const [minute, session] of [
    [565, "pre-market"],
    [570, "regular"],
    [960, "after-hours"],
    [1200, "closed"],
  ] as const)
    assert.equal(
      applyGod(base, { ...defaultGod(), minute }).market.session,
      session,
    );
  assert.deepEqual(applyGod(base, defaultGod()), applyGod(base, defaultGod()));
});
test("Next-session benchmark anchors to today, with ordered stress bounds", () => {
  const today = applyGod(createDemo(), defaultGod());
  const p = projectTomorrow(today);
  p.forEach((r, i) => {
    assert.equal(r.baseline, today.companies[i].price);
    assert.ok(r.downside < r.baseline && r.upside > r.baseline);
  });
  const next = tomorrowSnapshot(today, 0);
  assert.ok(next.companies.every((c) => c.changePercent === 0));
  assert.equal(next.companies[0].previousClose, today.companies[0].price);
  assert.ok(
    tomorrowSnapshot(today, -1).companies.every((c) => c.changePercent < 0),
  );
});

import { civicSites, districtSites } from "../src/domain/civic";
import { createPlots } from "../src/domain/city";
import { isLand } from "../src/domain/geography";
test("central park and district exhibit footprints do not displace stock buildings", () => {
  const plots = createPlots(createDemo().companies);
  const footprints = [
    ...civicSites.map((s, i) => ({
      ...s,
      w: [50, 19, 12, 13][i],
      d: [40, 19, 12, 12][i],
    })),
    ...districtSites.map((s, i) => ({
      ...s,
      w: [23, 19, 12, 11][i],
      d: [21, 18, 7, 10][i],
    })),
  ];
  for (const site of footprints) {
    for (const dx of [-site.w / 2, site.w / 2])
      for (const dz of [-site.d / 2, site.d / 2])
        assert.ok(
          isLand([site.x + dx, site.z + dz]),
          `${site.id} must be on land`,
        );
    for (const p of plots)
      assert.ok(
        Math.abs(p.x - site.x) >= (p.width + site.w) / 2 ||
          Math.abs(p.z - site.z) >= (p.depth + site.d) / 2,
        `${site.id} overlaps ${p.ticker}`,
      );
  }
});
