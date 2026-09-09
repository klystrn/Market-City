import test from "node:test";
import assert from "node:assert/strict";
import { cities } from "../src/domain/cities/all";
import { orientations } from "../src/domain/cities/orientation";
import { sectorIdentities } from "../src/domain/sectors";
import { breadthColor } from "../src/domain/analytics";

test("every city explains itself and offers a tour that goes somewhere", () => {
  for (const city of cities) {
    const orientation = orientations[city.id];
    assert.ok(orientation, `${city.id} has no orientation`);
    assert.ok(
      orientation.headline.length > 10 && orientation.detail.length > 20,
      `${city.id}'s orientation is too thin to orient anyone`,
    );
    assert.ok(
      orientation.tour.length >= 3 && orientation.tour.length <= 4,
      `${city.id}'s tour has ${orientation.tour.length} stops; three or four keeps it short enough to finish`,
    );
    for (const stop of orientation.tour) {
      assert.ok(
        sectorIdentities.some((s) => s.id === stop.sector),
        `${city.id} tours "${stop.sector}", which is not a sector`,
      );
      assert.ok(
        stop.body.length > 40,
        `${city.id}'s "${stop.title}" stop does not explain an encoding`,
      );
    }
    // A tour that visited the same district twice would waste a stop.
    const visited = orientation.tour.map((s) => s.sector);
    assert.equal(
      new Set(visited).size,
      visited.length,
      `${city.id}'s tour visits the same district twice`,
    );
  }
});

test("every city can outline each of its market-cap bands", () => {
  for (const city of cities)
    for (const tier of city.tiers) {
      const outline = city.tierOutline(tier.id);
      assert.ok(
        outline.length >= 4,
        `${city.id} cannot outline ${tier.id}, so its breadth ribbon would be missing`,
      );
      const [first] = outline;
      const last = outline[outline.length - 1];
      assert.ok(
        Math.hypot(first[0] - last[0], first[1] - last[1]) < 0.01,
        `${city.id}'s ${tier.id} outline does not close, so its ribbon would have a gap`,
      );
    }
  // An unknown band has no shape rather than a wrong one.
  assert.deepEqual(cities[0].tierOutline("not-a-tier"), []);
});

test("breadth colour reads advancing as green and declining as red", () => {
  const rising = breadthColor(1);
  const falling = breadthColor(0);
  const even = breadthColor(0.5);
  // Neutral comes back as a hex grey and the rest as rgb(), so read both.
  const channel = (c: string, i: number) =>
    c.startsWith("#")
      ? parseInt(c.slice(1 + i * 2, 3 + i * 2), 16)
      : Number(c.slice(4, -1).split(",")[i]);
  assert.ok(
    channel(rising, 1) > channel(rising, 0),
    "a fully advancing band must read green",
  );
  assert.ok(
    channel(falling, 0) > channel(falling, 1),
    "a fully declining band must read red",
  );
  assert.ok(
    Math.abs(channel(even, 0) - channel(even, 1)) < 25,
    "an evenly split band must read neutral rather than picking a side",
  );
});
