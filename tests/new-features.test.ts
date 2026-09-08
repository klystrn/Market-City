import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { companyGroups, findGroup } from "../src/domain/groups";
import { parseCommand, resolveIntent } from "../src/services/commands";
import { linksFor, supplyChainLinks } from "../src/domain/supply-chain";
import { marketHistory } from "../src/domain/market-history";
import {
  computeIntradayTrail,
  computeAllIntradayTrails,
  etMinuteOfIso,
} from "../src/domain/intraday";
import { runIntradayWorker } from "../src/workers/intraday.worker";
import {
  historicalVolatility,
  sectorBreadthRatio,
} from "../src/domain/analytics";
import { encodeScenario, decodeScenario } from "../src/domain/scenarios";
import { defaultGod } from "../src/domain/simulation";

const demo = createDemo();
const tickers = new Set(demo.companies.map((c) => c.ticker));

test("Big Tech and Magnificent Seven groups resolve across multiple sectors", () => {
  for (const group of companyGroups) {
    for (const ticker of group.tickers)
      assert.ok(tickers.has(ticker), `${ticker} missing from seeded companies`);
    const sectorsTouched = new Set(
      demo.companies
        .filter((c) => group.tickers.includes(c.ticker))
        .map((c) => c.sector),
    );
    assert.ok(
      sectorsTouched.size > 1,
      `${group.name} should span more than one sector`,
    );
  }
  const found = findGroup("show big tech");
  assert.equal(found?.id, "big-tech");
  const intent = parseCommand("Magnificent Seven", demo);
  assert.deepEqual(intent, { type: "group", group: "magnificent-seven" });
  const result = resolveIntent(intent, demo);
  assert.equal(result.tickers.length, 7);
});

test("supply-chain links only reference seeded tickers and are queryable both ways", () => {
  for (const link of supplyChainLinks) {
    assert.ok(tickers.has(link.a), `${link.a} missing from seeded companies`);
    assert.ok(tickers.has(link.b), `${link.b} missing from seeded companies`);
  }
  const nvdaLinks = linksFor("NVDA");
  assert.ok(nvdaLinks.length > 0);
  assert.ok(nvdaLinks.every((l) => l.a === "NVDA" || l.b === "NVDA"));
});

test("market history is real, dated and chronologically distinct", () => {
  const dates = marketHistory.map((e) => Date.parse(e.date));
  assert.ok(dates.every((d) => !Number.isNaN(d)));
  assert.equal(
    new Set(marketHistory.map((e) => e.id)).size,
    marketHistory.length,
  );
  assert.ok(marketHistory.every((e) => e.description.length > 20));
});

test("intraday trails are deterministic and bridge from open to the current price", () => {
  const company = demo.companies.find((c) => c.ticker === "AAPL")!;
  const a = computeIntradayTrail(company, 800);
  const b = computeIntradayTrail(company, 800);
  assert.deepEqual(a, b);
  assert.equal(a[0].price, company.previousClose);
  assert.equal(a[a.length - 1].price, company.price);
  assert.ok(a.every((p) => p.minute >= 570 && p.minute <= 960));
  const all = computeAllIntradayTrails(demo.companies.slice(0, 5), 700);
  assert.equal(Object.keys(all).length, 5);
});

test("the self-contained worker body matches domain/intraday.ts exactly", () => {
  let captured: unknown = null;
  const scope = {
    onmessage: null as ((event: { data: unknown }) => void) | null,
    postMessage: (message: unknown) => {
      captured = message;
    },
  };
  runIntradayWorker(scope as never);
  const companies = demo.companies.slice(0, 8);
  scope.onmessage!({ data: { requestId: 7, companies, minute: 730 } });
  const expected = {
    requestId: 7,
    trails: computeAllIntradayTrails(companies, 730),
  };
  assert.deepEqual(captured, expected);
});

test("etMinuteOfIso matches the God simulation's fixed UTC-4 convention", () => {
  assert.equal(etMinuteOfIso("2026-09-08T15:35:00.000Z"), 11 * 60 + 35);
});

test("sectorBreadthRatio and historicalVolatility stay within sane bounds", () => {
  const techCompanies = demo.companies.filter((c) => c.sector === "technology");
  const ratio = sectorBreadthRatio(techCompanies);
  assert.ok(ratio >= 0 && ratio <= 1);
  for (const c of demo.companies.slice(0, 10)) {
    const sigma = historicalVolatility(c);
    assert.ok(sigma > 0 && sigma < 1);
  }
});

test("scenario links round-trip through base64url encoding", () => {
  const state = { god: { ...defaultGod(), index: -4.2 }, tomorrow: 1 as const };
  const code = encodeScenario(state);
  assert.ok(!code.includes("+") && !code.includes("/") && !code.includes("="));
  const decoded = decodeScenario(code);
  assert.deepEqual(decoded, state);
  assert.equal(decodeScenario("not-valid-base64!!"), null);
});
