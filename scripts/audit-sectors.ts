import { companySeeds } from "../src/data/companies";
import { readFileSync, writeFileSync } from "node:fs";
// RFC 4180 parser, including embedded commas and escaped quotes.
function csv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(field);
      field = "";
    } else if (ch === "\n" && !quoted) {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  return rows;
}
const rows = csv(
  readFileSync(
    process.argv[2] ?? "tests/fixtures/sector-reference.csv",
    "utf8",
  ),
);
const mapping: Record<string, string> = {
  "Information Technology": "technology",
  Financials: "financials",
  "Health Care": "healthcare",
  "Consumer Discretionary": "consumer",
  "Communication Services": "communications",
  Industrials: "industrials",
  "Consumer Staples": "staples",
  Energy: "energy",
  Utilities: "utilities",
  Materials: "materials",
  "Real Estate": "realestate",
};
const audit = companySeeds.map(([ticker, name, sector]) => {
  const r = rows.find((r) => r[0] === ticker);
  return {
    ticker,
    name,
    sector,
    reference: r?.[2] ?? "NOT FOUND",
    expected: r ? mapping[r[2]] : null,
    match: r ? mapping[r[2]] === sector : false,
  };
});
writeFileSync(
  "src/data/sector-audit.json",
  JSON.stringify(
    {
      checkedOn: "2026-09-08",
      source:
        "https://github.com/datasets/s-and-p-500-companies/blob/main/data/constituents.csv",
      upstream: "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies",
      companies: audit,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    { checked: audit.length, mismatches: audit.filter((r) => !r.match) },
    null,
    2,
  ),
);
