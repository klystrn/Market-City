import test from "node:test";
import assert from "node:assert/strict";
import { createDemo } from "../src/data/demo";
import { cities } from "../src/domain/cities/all";
import { companiesForCity } from "../src/domain/cities";
import { plotsFor } from "../src/domain/cities/layout-key";
import { formFor, formsBySector, signatureForms } from "../src/domain/forms";
import { sectorIdentities } from "../src/domain/sectors";

const demo = createDemo();

test("every sector has its own architecture", () => {
  for (const sector of sectorIdentities) {
    const forms = formsBySector[sector.id];
    assert.ok(
      forms?.length,
      `${sector.id} has no building forms, so its companies would fall back to a shape chosen by index position`,
    );
    for (const form of forms)
      assert.ok(
        Number.isInteger(form) && form >= 0 && form < 12,
        `${sector.id} asks for form ${form}, which no building renders`,
      );
  }
});

test("a company's shape comes from what it does, not where it sits in the list", () => {
  // The bug this replaced: form came from index position, so the same company
  // could take a different industry's silhouette purely by being listed later.
  for (const sector of sectorIdentities) {
    const allowed = new Set(formsBySector[sector.id]);
    for (let index = 0; index < 40; index++)
      assert.ok(
        allowed.has(formFor("NOT-A-SIGNATURE", index, sector.id)),
        `a ${sector.id} company at position ${index} got a form from outside its sector`,
      );
  }
});

test("the curated signature buildings keep their hand-picked massing", () => {
  // Their brand accents are positioned for a flat, centred facade; a sector
  // form would put a logo on a taper or a drum.
  for (const [ticker, form] of Object.entries(signatureForms))
    for (const sector of sectorIdentities)
      assert.equal(
        formFor(ticker, 7, sector.id),
        form,
        `${ticker} lost its curated massing`,
      );
});

test("no district is a row of identical buildings", () => {
  for (const city of cities) {
    const plots = plotsFor(city, companiesForCity(demo.companies, city));
    const bySector = new Map<string, Set<number>>();
    for (const plot of plots) {
      const company = demo.companies.find((c) => c.ticker === plot.ticker);
      if (!company) continue;
      const seen = bySector.get(company.sector) ?? new Set<number>();
      seen.add(plot.variant);
      bySector.set(company.sector, seen);
    }
    for (const [sector, forms] of bySector) {
      const members = plots.filter((p) => {
        const c = demo.companies.find((x) => x.ticker === p.ticker);
        return c?.sector === sector;
      }).length;
      // A sector with several companies should show more than one silhouette;
      // one with a single member obviously cannot.
      if (members >= 4)
        assert.ok(
          forms.size >= 2,
          `${city.id}'s ${sector} district draws ${members} companies with one shape between them`,
        );
    }
  }
});
