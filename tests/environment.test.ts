import test from "node:test";
import assert from "node:assert/strict";
import { japanSeason, seasonPalette } from "../src/domain/seasons";
import {
  mainland,
  islands,
  waterOutline,
  pointInPolygon,
  landmarks,
  isLand,
} from "../src/domain/geography";
import { createDemo } from "../src/data/demo";
import { createPlots } from "../src/domain/city";

test("Japanese season boundaries use JST, including year rollover", () => {
  assert.equal(japanSeason(Date.parse("2026-02-28T14:59:00Z")), "winter");
  assert.equal(japanSeason(Date.parse("2026-02-28T15:00:00Z")), "spring");
  assert.equal(japanSeason(Date.parse("2026-05-31T15:00:00Z")), "summer");
  assert.equal(japanSeason(Date.parse("2026-08-31T15:00:00Z")), "autumn");
  assert.equal(japanSeason(Date.parse("2026-11-30T15:00:00Z")), "winter");
  assert.equal(japanSeason(Date.parse("2026-12-31T15:00:00Z")), "winter");
  assert.ok(seasonPalette.winter.snowLine < seasonPalette.spring.snowLine);
  assert.ok(seasonPalette.spring.snowLine < seasonPalette.summer.snowLine);
});
test("bay sectors occupy separate islands, while the mountain hinterland stays inland", () => {
  const demo = createDemo(),
    plots = createPlots(demo.companies);
  for (const [id, index] of [
    ["realestate", 0],
    ["industrials", 1],
    ["energy", 2],
  ] as const) {
    for (const p of plots.filter(
      (p) => demo.companies.find((c) => c.ticker === p.ticker)?.sector === id,
    )) {
      assert.ok(
        pointInPolygon([p.x, p.z], islands[index]),
        p.ticker + " is not on its sector island",
      );
      assert.ok(!pointInPolygon([p.x, p.z], mainland));
    }
  }
  for (const p of [
    [-242, -222],
    [-287, -184],
    [-249, -290],
  ] as [number, number][]) {
    assert.ok(pointInPolygon(p, mainland));
    assert.ok(!pointInPolygon(p, waterOutline));
  }
  assert.equal(new Set(landmarks.map((l) => l.sector)).size, 11);
  for (const l of landmarks)
    assert.ok(isLand([l.x, l.z]), l.name + " must stand on land");
});
