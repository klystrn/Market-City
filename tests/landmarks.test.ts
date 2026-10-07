import test from "node:test";
import assert from "node:assert/strict";
import { cities } from "../src/domain/cities/all";
import { landmarkPieces, mergePieces } from "../src/three/landmark-geometry";

// Landmarks are baked into one mesh per finish. These checks keep the bake
// honest: it must actually collapse the draw calls, must not lose a landmark
// along the way, and must leave company stand-ins to the company's building.
test("landmark structures merge into a handful of draw calls", () => {
  for (const city of cities) {
    const pieces = landmarkPieces(city.landmarks);
    const batches = mergePieces(pieces);
    // One batch per distinct finish; the per-mesh version drew one per piece.
    assert.ok(
      batches.length <= 24,
      `${city.id} needs ${batches.length} landmark draw calls`,
    );
    if (pieces.length > 0)
      assert.ok(
        batches.length * 4 <= pieces.length,
        `${city.id}: ${pieces.length} pieces only merged into ${batches.length} batches`,
      );
    const vertices = batches.reduce(
      (sum, b) => sum + b.geometry.attributes.position.count,
      0,
    );
    const expected = pieces.reduce((sum, p) => {
      const g = p.geometry;
      return sum + (g.index ? g.index.count : g.attributes.position.count);
    }, 0);
    assert.equal(vertices, expected, `${city.id} lost geometry in the merge`);
    for (const b of batches)
      assert.equal(
        b.geometry.attributes.color.count,
        b.geometry.attributes.position.count,
        `${city.id} batch ${b.key} is missing vertex colours`,
      );
  }
});

test("every structural landmark draws, and company stand-ins draw nothing", () => {
  for (const city of cities)
    for (const landmark of city.landmarks) {
      const count = landmarkPieces([landmark]).length;
      if (landmark.ticker)
        assert.equal(count, 0, `${landmark.id} stands in for ${landmark.ticker} but draws`);
      else if (landmark.kind !== "park" && landmark.kind !== "greenway")
        assert.ok(count > 0, `${city.id} landmark ${landmark.id} draws nothing`);
    }
});
