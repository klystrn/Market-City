import test from "node:test";
import assert from "node:assert/strict";
import { sunAt, shadowLength, viewAzimuth, SUNRISE, SUNSET } from "../src/domain/sun";
import { cities } from "../src/domain/cities/all";

const at = (h: number, m = 0) => h * 60 + m;

test("the sun is up through the session and down at night", () => {
  for (const minute of [at(9, 30), at(12), at(16)])
    assert.ok(sunAt(minute).up, `sun down at ${minute}`);
  for (const minute of [at(2), at(5), at(21), at(23, 59)])
    assert.ok(!sunAt(minute).up, `sun up at ${minute}`);
  assert.ok(SUNRISE < at(9, 30) && SUNSET > at(16));
});

test("shadows are longest at the open and close, shortest mid-session", () => {
  const open = shadowLength(sunAt(at(9, 30)));
  const noon = shadowLength(sunAt(at(13)));
  const close = shadowLength(sunAt(at(16)));
  assert.ok(noon < open && noon < close);
  // Never so low that shadows run off the map, never so high they vanish.
  for (let m = SUNRISE; m <= SUNSET; m += 15) {
    const length = shadowLength(sunAt(m));
    assert.ok(length > 0.8 && length < 4, `shadow length ${length} at ${m}`);
  }
});

test("the sun crosses the sky rather than standing still", () => {
  const morning = sunAt(at(8)).direction,
    evening = sunAt(at(18)).direction;
  const dot =
    morning[0] * evening[0] + morning[1] * evening[1] + morning[2] * evening[2];
  assert.ok(dot < 0.6, "morning and evening light come from nearly the same side");
  for (const minute of [at(8), at(12), at(18)]) {
    const d = sunAt(minute).direction;
    assert.ok(Math.abs(Math.hypot(...d) - 1) < 1e-9, "direction is not a unit vector");
  }
});

test("mid-session shadows fall sideways across the opening view", () => {
  // A sun behind the viewer hides every shadow behind its own building. For
  // each city's opening camera, the ground shadow at midday should run mostly
  // across the screen, not straight away from the viewer.
  for (const city of cities) {
    const az = viewAzimuth(city.camera.offset);
    const toCamera = [Math.cos(az), Math.sin(az)];
    const d = sunAt(at(12, 45), az).direction;
    const shadow = [-d[0], -d[2]];
    const norm = Math.hypot(...shadow);
    const along = (shadow[0] * toCamera[0] + shadow[1] * toCamera[1]) / norm;
    assert.ok(Math.abs(along) < 0.6, `${city.id}: shadows run ${along.toFixed(2)} along the view`);
  }
});

test("the sun reads the clock, not the market", () => {
  // Same minute, same sun: nothing about prices goes in.
  assert.deepEqual(sunAt(at(11, 35), 1), sunAt(at(11, 35), 1));
  assert.equal(sunAt.length <= 2, true);
});
