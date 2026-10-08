import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { breadth } from "../src/domain/analytics";
import { cityStats, sessionNames, trafficWord } from "../src/domain/city-stats";

test("the status strip restates figures the app already computes", () => {
  const snapshot = createDemo();
  const s = cityStats(snapshot);
  assert.equal(s.companies, snapshot.companies.length);
  assert.equal(
    s.marketCap,
    snapshot.companies.reduce((sum, c) => sum + c.marketCap, 0),
  );
  // "Rising" is exactly the breadth track's advancing share.
  assert.equal(s.rising, breadth(snapshot.companies).up / snapshot.companies.length);
  assert.ok(s.traffic > 0);
  assert.ok(sessionNames[s.session]);
});

test("traffic words rise with volume", () => {
  const order = ["Light", "Steady", "Busy", "Heavy"];
  let last = -1;
  for (const v of [0.5, 0.9, 1.0, 1.2, 1.5, 1.7, 3]) {
    const rank = order.indexOf(trafficWord(v));
    assert.ok(rank >= last, `${v} reads quieter than a smaller volume`);
    last = rank;
  }
});

test("an empty city reports zeros, not NaN", () => {
  const empty = { ...createDemo(), companies: [] };
  const s = cityStats(empty);
  assert.equal(s.rising, 0);
  assert.equal(s.traffic, 0);
});
