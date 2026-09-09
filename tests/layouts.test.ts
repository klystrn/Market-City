import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { cities } from "../src/domain/cities/all";
import { companiesForCity } from "../src/domain/cities";
import { layoutKey, plotsFor } from "../src/domain/cities/layout-key";

const demo = createDemo();

test("every city ships a baked layout that matches what it would solve", () => {
  for (const city of cities) {
    const companies = companiesForCity(demo.companies, city);
    const baked = city.bakedLayout;
    assert.ok(baked, `${city.id} has no baked layout; run npm run bake:layouts`);
    assert.equal(
      baked.key,
      layoutKey(companies),
      `${city.id}'s baked layout was solved for a different roster; run npm run bake:layouts`,
    );
    assert.deepEqual(
      baked.plots,
      city.createPlots(companies),
      `${city.id}'s baked layout is stale; run npm run bake:layouts`,
    );
    // The whole point is that boot reads the file instead of solving.
    assert.equal(plotsFor(city, companies), baked.plots);
  }
});

test("a roster the layout was not baked for is solved instead of misplaced", () => {
  for (const city of cities) {
    const companies = companiesForCity(demo.companies, city).slice(0, 12);
    const plots = plotsFor(city, companies);
    assert.notEqual(
      plots,
      city.bakedLayout!.plots,
      `${city.id} reused a baked layout for a roster it was not baked for`,
    );
    assert.deepEqual(plots, city.createPlots(companies));
  }
});

test("the layout key ignores everything placement does not depend on", () => {
  const companies = demo.companies;
  const session = createDemo("selloff", 25).companies;
  assert.equal(
    layoutKey(companies),
    layoutKey(session),
    "prices and volumes moved the key, so every quote refresh would re-solve",
  );
  assert.notEqual(
    layoutKey(companies),
    layoutKey(companies.slice(0, -1)),
    "dropping a company must invalidate the key",
  );
  assert.notEqual(
    layoutKey(companies),
    layoutKey(
      companies.map((c, i) =>
        i === 0 ? { ...c, marketCap: c.marketCap * 2 } : c,
      ),
    ),
    "market capitalisation sizes a lot, so it must invalidate the key",
  );
});
