import test from "node:test";
import assert from "node:assert/strict";
import { companySeeds } from "../src/data/companies";
import audit from "../src/data/sector-audit.json";
import library from "../src/data/music-library.json";
import { preferredVoice, RecordedMusic } from "../src/services/radio";
import { createDemo } from "../src/data/demo";
import { marketBulletin, newsBulletin } from "../src/services/bulletins";
import { existsSync } from "node:fs";
import path from "node:path";
test("every company sector matches the dated external sector audit", () => {
  assert.equal(audit.companies.length, companySeeds.length);
  for (const [ticker, , sector] of companySeeds) {
    const row = audit.companies.find((c) => c.ticker === ticker);
    assert.ok(row, `Missing ${ticker}`);
    assert.equal(sector, row.expected, ticker);
    assert.equal(row.match, true);
  }
});
test("music manifest serves real recordings and reserves future stations", () => {
  assert.ok(library.find((s) => s.id === "jazz")!.tracks.length > 0);
  assert.ok(library.find((s) => s.id === "lofi")!.tracks.length > 0);
  for (const s of library)
    for (const track of s.tracks) {
      assert.ok(track.url.startsWith("/music/"));
      assert.ok(
        existsSync(path.join("music", decodeURIComponent(track.url.slice(7)))),
      );
    }
  for (const id of ["classical", "technopop"])
    assert.ok(library.some((s) => s.id === id));
});
test("voice preference favors natural English and falls back to a warmer installed voice", () => {
  const voices = [
    { name: "Microsoft David", lang: "en-US", voiceURI: "d", default: true },
    { name: "Microsoft Zira", lang: "en-US", voiceURI: "z", default: false },
    {
      name: "Microsoft Aria Natural",
      lang: "en-US",
      voiceURI: "a",
      default: false,
    },
  ];
  assert.equal(preferredVoice(voices)?.voiceURI, "a");
  assert.equal(preferredVoice(voices.slice(0, 2))?.voiceURI, "z");
  assert.equal(preferredVoice([]), undefined);
});
test("recorded music preserves user volume through ducking and forwards autoplay rejection", async () => {
  const element = {
    volume: 1,
    play: () => Promise.reject(new Error("NotAllowedError")),
    pause: () => {},
  } as unknown as HTMLAudioElement;
  const player = new RecordedMusic(element);
  player.setVolume(0.4);
  player.duck(true);
  assert.ok(element.volume < 0.1);
  player.duck(false);
  assert.equal(element.volume, 0.4);
  player.setVolume(0);
  player.duck(true);
  player.duck(false);
  assert.equal(element.volume, 0);
  await assert.rejects(player.play(), /NotAllowedError/);
});
test("radio always identifies synthetic quotes and headlines", () => {
  const snapshot = createDemo();
  assert.match(marketBulletin(snapshot), /God simulation/);
  assert.match(newsBulletin(snapshot.news[0]), /Fictional headline/);
});
