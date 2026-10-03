import test from "node:test";
import assert from "node:assert/strict";
import { seasonPalette } from "../src/domain/seasons";
import { sectorIdentities } from "../src/domain/sectors";
import {
  DIRECTIONAL_CLEARANCE,
  NEUTRAL_CLEARANCE,
  colorDistance,
  directionalClearance,
  neutralClearance,
} from "../src/domain/palette";
import { FABRIC_COLORS } from "../src/three/palette-fabric";

// Colour is the city's only encoding of the daily move. Everything else that is
// coloured is decoration, and decoration that lands on the signal makes the
// signal ambiguous — so the separation is asserted here rather than left to
// whoever next picks a nice colour.

test("no foliage colour can be mistaken for a company's daily move", () => {
  for (const [season, palette] of Object.entries(seasonPalette))
    for (const key of ["leaf", "accent", "evergreen"] as const) {
      const hex = palette[key];
      const clearance = directionalClearance(hex);
      assert.ok(
        clearance >= DIRECTIONAL_CLEARANCE,
        `${season}'s ${key} (${hex}) is only ${clearance.toFixed(1)} from the green/red encoding, so a tree would read as a moving company`,
      );
    }
});

test("the ground stays off the encoding, by a lower bar than objects", () => {
  // Grass is green, and insisting it clear the advancing green by the same
  // margin as a tree would make every city's lawn an unnatural colour. The
  // ground is also the one surface that cannot be mistaken for a building: it
  // is continuous, it is underneath everything, and nothing about it is
  // building-shaped. What matters for it is only that a company's green still
  // reads against it, which is a contrast question and a weaker constraint.
  for (const [season, palette] of Object.entries(seasonPalette)) {
    const clearance = directionalClearance(palette.ground);
    assert.ok(
      clearance >= 15,
      `${season}'s ground (${palette.ground}) is ${clearance.toFixed(1)} from the encoding, close enough that an advancing building would sink into the lawn`,
    );
  }
});

test("no ordinary building, roof, awning or car reads as market data", () => {
  for (const [group, colors] of Object.entries(FABRIC_COLORS))
    for (const hex of colors) {
      const clearance = directionalClearance(hex);
      assert.ok(
        clearance >= DIRECTIONAL_CLEARANCE,
        `fabric ${group} colour ${hex} is only ${clearance.toFixed(1)} from the green/red encoding`,
      );
    }
});

test("scenery stays off the flat grey too, by a looser margin", () => {
  // Being mistaken for a company that is not moving is a milder error than
  // being mistaken for one that is, and a strict bar here would outlaw every
  // pale or desaturated colour the city legitimately needs.
  for (const [group, colors] of Object.entries(FABRIC_COLORS))
    for (const hex of colors) {
      const clearance = neutralClearance(hex);
      assert.ok(
        clearance >= NEUTRAL_CLEARANCE,
        `fabric ${group} colour ${hex} is only ${clearance.toFixed(1)} from the flat-change grey`,
      );
    }
});

test("sector colours stay distinguishable from each other", () => {
  // Districts are told apart by colour on the ground pads and in the directory,
  // so two sectors sharing a hue would make the map unreadable in a different
  // way from the encoding problem above.
  const seen: { id: string; color: string }[] = [];
  for (const sector of sectorIdentities) {
    for (const other of seen) {
      const apart = colorDistance(sector.color, other.color);
      assert.ok(
        apart >= 18,
        `${sector.id} and ${other.id} are only ${apart.toFixed(1)} apart, so their districts would look like one`,
      );
    }
    seen.push({ id: sector.id, color: sector.color });
  }
});
