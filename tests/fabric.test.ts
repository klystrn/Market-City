import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { cities } from "../src/domain/cities/all";
import { companiesForCity } from "../src/domain/cities";
import { plotsFor } from "../src/domain/cities/layout-key";
import {
  decodeFabric,
  encodeFabric,
  fabricKey,
  generateFabric,
} from "../src/domain/cities/fabric";
import { pointInPolygon } from "../src/domain/geography";

const demo = createDemo();
function build(city: (typeof cities)[number]) {
  const plots = plotsFor(city, companiesForCity(demo.companies, city));
  return {
    plots,
    roads: city.roads(plots),
    ...generateFabric({
      land: city.land,
      water: city.water,
      roads: city.roads(plots),
      plots,
      landmarks: city.landmarks,
      districts: city.districts,
      maxBlocks: city.budget.fabric,
    }),
  };
}

test("no ordinary building stands in the water", () => {
  // The single most obvious way for generated scenery to betray itself.
  for (const city of cities) {
    const { blocks } = build(city);
    for (const b of blocks) {
      const onLand = city.land.some((p) => pointInPolygon([b.x, b.z], p));
      const inWater = city.water.some((p) => pointInPolygon([b.x, b.z], p));
      assert.ok(
        onLand && !inWater,
        `${city.id} puts a ${b.kind} at ${b.x.toFixed(1)},${b.z.toFixed(1)}, which is not on dry land`,
      );
    }
  }
});

test("ordinary buildings never sit on a company lot or inside each other", () => {
  for (const city of cities) {
    const { blocks, plots } = build(city);
    for (const b of blocks) {
      const onLot = plots.find(
        (p) =>
          Math.abs(b.x - p.x) < p.width / 2 && Math.abs(b.z - p.z) < p.depth / 2,
      );
      assert.ok(
        !onLot,
        `${city.id} builds over ${onLot?.ticker}'s lot, which would hide a company's own building`,
      );
    }
    // Overlap is checked on centres rather than rotated corners, matching how
    // the generator spaces them; a failure here means the spacing rule broke.
    for (let i = 0; i < blocks.length; i++)
      for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i],
          b = blocks[j];
        const apart = Math.hypot(a.x - b.x, a.z - b.z);
        assert.ok(
          apart > 1.5,
          `${city.id} stacks two buildings ${apart.toFixed(2)} apart, so they would intersect`,
        );
      }
  }
});

test("the same city always builds the same, and respects its cap", () => {
  for (const city of cities) {
    const once = build(city).blocks;
    const twice = build(city).blocks;
    assert.deepEqual(
      once.map((b) => [b.x, b.z, b.height, b.kind]),
      twice.map((b) => [b.x, b.z, b.height, b.kind]),
      `${city.id} builds a different city each run, so a reload would rearrange it`,
    );
    assert.ok(
      once.length <= city.budget.fabric,
      `${city.id} ignored its fabric cap of ${city.budget.fabric}`,
    );
  }
});

test("shops only ever front a street", () => {
  // A shopfront is drawn facing the road. One generated behind a terrace would
  // open onto the back of another building.
  for (const city of cities) {
    const { blocks, roads } = build(city);
    const segments = roads.flatMap((r) =>
      r.points.slice(1).map((b, i) => [r.points[i], b, r.width] as const),
    );
    for (const shop of blocks.filter((b) => b.kind === "shop")) {
      const nearest = Math.min(
        ...segments.map(([a, b, width]) => {
          const dx = b[0] - a[0],
            dz = b[1] - a[1];
          const len = dx * dx + dz * dz;
          const t = len
            ? Math.max(
                0,
                Math.min(
                  1,
                  ((shop.x - a[0]) * dx + (shop.z - a[1]) * dz) / len,
                ),
              )
            : 0;
          return (
            Math.hypot(shop.x - (a[0] + dx * t), shop.z - (a[1] + dz * t)) -
            width / 2
          );
        }),
      );
      assert.ok(
        nearest < 5,
        `${city.id} put a shop ${nearest.toFixed(1)} from the nearest kerb, with no street to open onto`,
      );
    }
  }
});

test("the baked fabric matches what the generator would build", () => {
  // A stale fixture is the failure mode this whole mechanism invites: the key
  // covers the lots and the version covers the generator, but only re-solving
  // proves the file on disk is actually what today's code produces.
  for (const city of cities) {
    const plots = plotsFor(city, companiesForCity(demo.companies, city));
    const input = {
      land: city.land,
      water: city.water,
      roads: city.roads(plots),
      plots,
      landmarks: city.landmarks,
      districts: city.districts,
      maxBlocks: city.budget.fabric,
    };
    assert.ok(city.bakedFabric, `${city.id} ships no baked fabric`);
    assert.equal(
      city.bakedFabric!.key,
      fabricKey(plots),
      `${city.id}'s baked fabric was built for different lots; run npm run bake:layouts`,
    );
    const fresh = encodeFabric(fabricKey(plots), generateFabric(input));
    assert.deepEqual(
      decodeFabric(city.bakedFabric!).blocks,
      decodeFabric(fresh).blocks,
      `${city.id}'s baked fabric is stale; run npm run bake:layouts`,
    );
  }
});

test("a city whose lots moved falls back to generating", () => {
  const city = cities[0];
  const plots = plotsFor(city, companiesForCity(demo.companies, city));
  const moved = plots.map((p, i) => (i ? p : { ...p, x: p.x + 40 }));
  assert.notEqual(
    fabricKey(moved),
    fabricKey(plots),
    "moving a lot must change the key, or a stale fixture would be reused",
  );
});
