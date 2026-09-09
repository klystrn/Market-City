import test from "node:test";
import assert from "node:assert/strict";
import {
  tickerCompanyNames,
  companyNamesForSpeech,
} from "../src/domain/company-names";
import { newsBulletin } from "../src/services/bulletins";
import { createDemo } from "../src/data/demo";
import { companySeeds } from "../src/data/companies";
test("broadcast mapping covers every seeded company and full ticker tokens", () => {
  assert.equal(Object.keys(tickerCompanyNames).length, companySeeds.length);
  assert.equal(
    companyNamesForSpeech("AAPL and MSFT rise; $NVDA follows."),
    "Apple and Microsoft rise; NVIDIA follows.",
  );
  assert.equal(
    companyNamesForSpeech("BRK.B and BRK-B hold steady."),
    "Berkshire Hathaway and Berkshire Hathaway hold steady.",
  );
  assert.equal(
    companyNamesForSpeech("AAPLX cost $12; UNKNOWN unchanged."),
    "AAPLX cost $12; UNKNOWN unchanged.",
  );
});
test("headline metadata disambiguates ordinary words and single-letter tickers", () => {
  assert.equal(
    companyNamesForSpeech("AT&T (T) lowers its cost NOW.", [], ["T"]),
    "AT&T (AT&T) lowers its cost NOW.",
  );
  assert.equal(
    companyNamesForSpeech("O and C rise.", [], ["O", "C"]),
    "Realty Income and Citigroup rise.",
  );
  assert.equal(
    companyNamesForSpeech("A and T remain letters."),
    "A and T remain letters.",
  );
});
test("news speech uses current company names and preserves original headline", () => {
  const news = {
    ...createDemo().news[0],
    title: "NVDA outpaces AAPL after earnings",
    tickers: ["NVDA", "AAPL"],
  };
  assert.match(newsBulletin(news), /NVIDIA outpaces Apple/);
  assert.equal(news.title, "NVDA outpaces AAPL after earnings");
  assert.match(
    newsBulletin(
      { ...news, title: "NEWCO announces earnings", tickers: ["NEWCO"] },
      [{ ticker: "NEWCO", name: "New Company" }],
    ),
    /New Company announces/,
  );
});
