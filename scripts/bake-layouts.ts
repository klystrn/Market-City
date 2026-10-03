import { mkdirSync, writeFileSync } from "node:fs";
import { createDemo } from "../src/data/demo";
import { cities } from "../src/domain/cities/all";
import { companiesForCity } from "../src/domain/cities";
import { layoutKey } from "../src/domain/cities/layout-key";
import {
  encodeFabric,
  fabricKey,
  generateFabric,
} from "../src/domain/cities/fabric";
// Solve every city's placement once here rather than on every page load. Each
// city's layout is written next to it so it rides that city's lazily loaded
// chunk; the key records which company set it was solved for, and the runtime
// falls back to solving in the browser whenever that set differs.
//
// tests/layouts.test.ts re-solves each city and fails if a baked file has gone
// stale, so a placement change that is not re-baked cannot ship.
const demo = createDemo();
mkdirSync("src/data/layouts", { recursive: true });
mkdirSync("src/data/fabric", { recursive: true });
for (const city of cities) {
  const companies = companiesForCity(demo.companies, city);
  const layout = {
    city: city.id,
    key: layoutKey(companies),
    plots: city.createPlots(companies),
  };
  writeFileSync(
    `src/data/layouts/${city.id}.json`,
    JSON.stringify(layout, null, 2) + "\n",
  );
  // The ordinary buildings are derived from those lots and from the city's own
  // roads and coastline, so they can be solved here too. Generation is fast
  // now, but it still runs on every city switch and a phone pays several times
  // what this machine does; the fixture rides the same lazy chunk the city
  // already downloads.
  const fabric = encodeFabric(
    fabricKey(layout.plots),
    generateFabric({
      land: city.land,
      water: city.water,
      roads: city.roads(layout.plots),
      plots: layout.plots,
      landmarks: city.landmarks,
      districts: city.districts,
      maxBlocks: city.budget.fabric,
    }),
  );
  writeFileSync(
    `src/data/fabric/${city.id}.json`,
    JSON.stringify(fabric) + "\n",
  );
  console.log(
    `${city.id}: ${layout.plots.length} lots, ${fabric.blocks.length} ordinary buildings baked`,
  );
}
