import { companyNamesForSpeech } from "@/domain/company-names";
import type { MarketState, Snapshot } from "@/domain/types";
import { sectors } from "@/domain/city";
import { weightedChange } from "@/domain/analytics";
export function marketBulletin(
  snapshot: Snapshot,
  session?: MarketState["session"],
) {
  const allDemo = snapshot.companies.every((c) => c.dataStatus === "demo");
  const top = [...sectors].sort(
    (a, b) =>
      weightedChange(snapshot.companies.filter((c) => c.sector === b.id)) -
      weightedChange(snapshot.companies.filter((c) => c.sector === a.id)),
  )[0];
  const prefix =
    snapshot.market.dataStatus === "demo" ? "God simulation bulletin. " : "";
  const opening =
    session === "regular"
      ? "The opening bell has rung. "
      : session === "after-hours"
        ? "The closing bell has rung. "
        : "";
  const direction = snapshot.market.indexChange >= 0 ? "higher" : "lower";
  const text = `${prefix}You’re tuned to Market City! Here’s your market check-in. ${opening}The S and P 500 is ${Math.abs(snapshot.market.indexChange).toFixed(2)} percent ${direction}. ${allDemo ? `${top.short} leads the simulated city. ` : ""}${snapshot.market.dataStatus === "demo" ? "These figures are simulated." : ""} Now, back to the city.`;
  return companyNamesForSpeech(text, snapshot.companies);
}
import type { News, Company } from "@/domain/types";
export function newsBulletin(
  news: News,
  companies: Pick<Company, "ticker" | "name">[] = [],
) {
  return `${news.dataStatus === "demo" ? "God simulation. Fictional headline. " : "In the headlines. "}${companyNamesForSpeech(news.title, companies, news.tickers)}. Back to the music.`;
}
