import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { cities } from "../src/domain/cities/all";
import { companiesForCity } from "../src/domain/cities";
import { plotsFor } from "../src/domain/cities/layout-key";
import { pointInPolygon } from "../src/domain/geography";
import {
  boatRoutes,
  cloudCount,
  pavements,
  vehicleShape,
  walkers,
} from "../src/domain/street-life";

const demo = createDemo();
const layout = (city: (typeof cities)[number]) => {
  const plots = plotsFor(city, companiesForCity(demo.companies, city));
  return { plots, roads: city.roads(plots) };
};

test("pavements run beside the streets, never down the middle of them", () => {
  for (const city of cities) {
    const { roads } = layout(city);
    const walks = pavements(roads);
    assert.ok(walks.length > 20, `${city.id} has almost no pavement`);
    for (const road of roads.filter((r) => !r.bridge))
      for (let i = 1; i < road.points.length; i++) {
        const [a, b] = [road.points[i - 1], road.points[i]];
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        // Both pavements of this segment sit outside its carriageway.
        const near = walks.filter((w) => {
          const wm = [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2];
          return Math.hypot(wm[0] - mid[0], wm[1] - mid[1]) < road.width;
        });
        for (const w of near) {
          const wm = [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2];
          assert.ok(
            Math.hypot(wm[0] - mid[0], wm[1] - mid[1]) > road.width / 2,
            `${city.id}: a pavement runs inside road ${road.id}`,
          );
        }
      }
  }
});

test("pedestrians are spread over the city, not piled on the first streets", () => {
  for (const city of cities) {
    const walks = pavements(layout(city).roads);
    const people = walkers(walks, 400);
    assert.ok(people.length > 50, `${city.id} has only ${people.length} people`);
    assert.ok(people.length <= 400);
    // The last walker stands on one of the last pavements, not the first few.
    const furthest = Math.max(...people.map((p) => p.walk));
    assert.ok(furthest > walks.length * 0.8, `${city.id} people stop early`);
    for (const p of people) assert.ok(p.start >= 0 && p.start <= 1);
  }
});

test("boats stay on the water the whole way", () => {
  for (const city of cities) {
    const routes = boatRoutes(city.land, city.water, city.surround, 14);
    assert.ok(routes.length >= 6, `${city.id} has only ${routes.length} boats`);
    for (const r of routes)
      for (let s = 0; s <= 20; s++) {
        const t = s / 20;
        const p: [number, number] = [
          r.a[0] + (r.b[0] - r.a[0]) * t,
          r.a[1] + (r.b[1] - r.a[1]) * t,
        ];
        const onLand = city.land.some((poly) => pointInPolygon(p, poly));
        const onRiver = city.water.some((poly) => pointInPolygon(p, poly));
        assert.ok(
          city.surround === "sea" ? !onLand || onRiver : onRiver,
          `${city.id}: boat ${r.seed} runs aground at ${p.map(Math.round)}`,
        );
      }
    // Deterministic: the same city always gets the same boats.
    assert.deepEqual(routes, boatRoutes(city.land, city.water, city.surround, 14));
  }
});

test("traffic is mostly cars, with every other kind present", () => {
  const kinds = new Map<string, number>();
  for (let i = 0; i < 240; i++) {
    const k = vehicleShape(i).kind;
    kinds.set(k, (kinds.get(k) ?? 0) + 1);
  }
  assert.ok((kinds.get("car") ?? 0) > 120);
  for (const k of ["van", "bus", "truck"])
    assert.ok((kinds.get(k) ?? 0) >= 5, `only ${kinds.get(k) ?? 0} ${k}s`);
});

test("cloud cover follows the weather the header reports", () => {
  assert.ok(cloudCount("Clear skies") < cloudCount("Light haze"));
  assert.ok(cloudCount("Light haze") < cloudCount("Overcast"));
  assert.ok(cloudCount("Clear skies") > 0);
});
