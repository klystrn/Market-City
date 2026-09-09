import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { cities } from "../src/domain/cities/all";
import { companiesForCity } from "../src/domain/cities";
import { plotsFor } from "../src/domain/cities/layout-key";

const demo = createDemo();
// The most a city may draw regardless of what it declares. A budget is a
// promise the city makes about itself; this is the ceiling on that promise, so
// a new city cannot simply declare a huge one and call itself within budget.
const CEILING = { lots: 260, landmarks: 40, roadSegments: 400, labels: 90 };
// Buildings only label themselves above a zoom threshold, and the label pass
// caps how many it will draw at once. See the Labels component in CityScene.
const MAX_BUILDING_LABELS = 22;

function measure(city: (typeof cities)[number]) {
  const plots = plotsFor(city, companiesForCity(demo.companies, city));
  return {
    lots: plots.length,
    landmarks: city.landmarks.length,
    roadSegments: city.roads(plots).reduce((n, r) => n + r.points.length - 1, 0),
    // Districts always label; landmarks label only when they identify a sector.
    labels:
      city.districts.length +
      city.landmarks.filter((l) => l.sector).length +
      MAX_BUILDING_LABELS,
  };
}

test("every city stays inside the geometry budget it declares", () => {
  for (const city of cities) {
    const actual = measure(city);
    for (const key of ["lots", "landmarks", "roadSegments", "labels"] as const)
      assert.ok(
        actual[key] <= city.budget[key],
        `${city.id} draws ${actual[key]} ${key}, over its declared budget of ${city.budget[key]}`,
      );
  }
});

test("no city may declare a budget above the shared ceiling", () => {
  for (const city of cities)
    for (const key of ["lots", "landmarks", "roadSegments", "labels"] as const)
      assert.ok(
        city.budget[key] <= CEILING[key],
        `${city.id} budgets ${city.budget[key]} ${key}, above the ${CEILING[key]} ceiling every city shares`,
      );
});

test("a budget stays a real constraint rather than headroom", () => {
  // A budget far above what the city actually draws would never catch a
  // regression, so it has to stay within reach of the real geometry.
  for (const city of cities) {
    const actual = measure(city);
    for (const key of ["lots", "roadSegments"] as const)
      assert.ok(
        city.budget[key] <= Math.max(40, actual[key] * 3),
        `${city.id} budgets ${city.budget[key]} ${key} but only draws ${actual[key]}, so the budget would never fail`,
      );
  }
});
