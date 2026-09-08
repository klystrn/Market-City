import test from "node:test";
import assert from "node:assert/strict";
import {
  MarketauxProvider,
  AlphaVantageProvider,
  marketCloseTimestamp,
} from "../src/services/providers";
const fake = (body: unknown) => async () =>
  new Response(JSON.stringify(body), { status: 200 });
test('EOD timestamps account for Eastern daylight saving time',()=>{assert.equal(marketCloseTimestamp('2026-09-08'),'2026-09-08T20:00:00.000Z');assert.equal(marketCloseTimestamp('2026-01-08'),'2026-01-08T21:00:00.000Z');});
test("Marketaux normalizes entity matches and excludes unsafe or irrelevant stories", async () => {
  const provider = new MarketauxProvider(
    "test-key",
    fake({
      data: [
        {
          uuid: "a",
          title: "Company earnings",
          url: "https://example.com/story",
          published_at: "2026-09-08T10:00:00Z",
          source: "Example",
          entities: [{ symbol: "NVDA", sentiment_score: 0.7 }],
        },
        {
          uuid: "b",
          title: "Unsafe",
          url: "javascript:alert(1)",
          published_at: "2026-09-08",
          entities: [],
        },
      ],
    }),
  );
  const news = await provider.latest(["NVDA"]);
  assert.equal(news.length, 1);
  assert.equal(news[0].dataStatus, "live");
  assert.deepEqual(news[0].tickers, ["NVDA"]);
});
test("provider failures do not expose credential-bearing URLs", async () => {
  const provider = new MarketauxProvider("secret-token", async () => {
    throw new Error("https://api.example.com?key=secret-token");
  });
  await assert.rejects(
    () => provider.latest(["NVDA"]),
    (error) =>
      error instanceof Error && !error.message.includes("secret-token"),
  );
  await assert.rejects(
    () =>
      new MarketauxProvider(
        "key",
        fake({ error: { code: "rate_limit" } }),
      ).latest(["NVDA"]),
    /quota/,
  );
});
test("EOD adapter requires real market cap, daily history and computes relative volume", async () => {
  const daily: Record<string, Record<string, string>> = {};
  for (let i = 1; i <= 25; i++)
    daily[`2026-08-${String(i).padStart(2, "0")}`] = {
      "4. close": String(100 + i),
      "5. volume": String(i === 25 ? 200 : 100),
    };
  let calls = 0;
  const provider = new AlphaVantageProvider(
    "key",
    async () =>
      new Response(
        JSON.stringify(
          calls++ === 0
            ? { Name: "Example", MarketCapitalization: "100000000000" }
            : { "Time Series (Daily)": daily },
        ),
      ),
  );
  const company = await provider.company("EXM", "technology");
  assert.equal(company.dataStatus, "eod");
  assert.equal(company.relativeVolume, 2);
  assert.equal(company.price, 125);
  assert.equal(company.previousClose, 124);
  assert.equal(calls, 2);
});
