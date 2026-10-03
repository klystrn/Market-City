import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { cities } from "../src/domain/cities/all";
import { companiesForCity } from "../src/domain/cities";
import { plotsFor } from "../src/domain/cities/layout-key";
import { generateFabric } from "../src/domain/cities/fabric";

const demo = createDemo();
// The most a city may draw regardless of what it declares. A budget is a
// promise the city makes about itself; this is the ceiling on that promise, so
// a new city cannot simply declare a huge one and call itself within budget.
const CEILING = {
  lots: 260,
  landmarks: 40,
  roadSegments: 400,
  labels: 90,
  fabric: 640,
};
// Below this a city stops reading as a place and starts reading as a diagram
// of a market with some roads drawn on it.
const MIN_FABRIC = 180;
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
    fabric: generateFabric({
      land: city.land,
      water: city.water,
      roads: city.roads(plots),
      plots,
      landmarks: city.landmarks,
      districts: city.districts,
      maxBlocks: city.budget.fabric,
    }).blocks.length,
  };
}

test("every city stays inside the geometry budget it declares", () => {
  for (const city of cities) {
    const actual = measure(city);
    for (const key of [
      "lots",
      "landmarks",
      "roadSegments",
      "labels",
      "fabric",
    ] as const)
      assert.ok(
        actual[key] <= city.budget[key],
        `${city.id} draws ${actual[key]} ${key}, over its declared budget of ${city.budget[key]}`,
      );
  }
});

test("no city may declare a budget above the shared ceiling", () => {
  for (const city of cities)
    for (const key of [
      "lots",
      "landmarks",
      "roadSegments",
      "labels",
      "fabric",
    ] as const)
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

test("every city is actually built out, not just roads and company lots", () => {
  // The fabric budget is a cap passed to the generator, so unlike the other
  // figures it cannot be over-run — the risk runs the other way. A city whose
  // roads or land changed such that almost nothing can front a street would
  // still pass every other check while looking deserted, so the floor is the
  // assertion that matters for this one.
  for (const city of cities) {
    const actual = measure(city);
    assert.ok(
      actual.fabric >= MIN_FABRIC,
      `${city.id} fills its streets with only ${actual.fabric} ordinary buildings, so it would read as a diagram rather than a city`,
    );
  }
});
