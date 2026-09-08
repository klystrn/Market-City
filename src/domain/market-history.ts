// Verified public financial history. Dates and figures are well-documented
// historical facts, independent of this app's simulated demo data — never
// invented, and never a claim about future performance.
export interface HistoricalEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}
export const marketHistory: HistoricalEvent[] = [
  {
    id: "black-tuesday-1929",
    date: "1929-10-29",
    title: "Black Tuesday",
    description:
      "The Dow Jones Industrial Average fell roughly 12% in a single session, capping a week of steep declines that opened the Great Depression era for U.S. equities.",
  },
  {
    id: "black-monday-1987",
    date: "1987-10-19",
    title: "Black Monday",
    description:
      "The Dow fell 22.6% in one day — still its largest one-day percentage decline — amid program trading and portfolio-insurance selling across global markets.",
  },
  {
    id: "dotcom-peak-2000",
    date: "2000-03-10",
    title: "Dot-com bubble peaks",
    description:
      "The Nasdaq Composite closed at an intraday-era high near 5,048 before a two-year decline that erased most internet-sector gains of the late 1990s.",
  },
  {
    id: "911-reopen-2001",
    date: "2001-09-17",
    title: "Markets reopen after September 11",
    description:
      "U.S. exchanges reopened after a four-trading-day closure; the Dow fell 7.1% on the first day back, then its steepest weekly point drop to that date.",
  },
  {
    id: "lehman-2008",
    date: "2008-09-15",
    title: "Lehman Brothers collapses",
    description:
      "Lehman Brothers filed the largest bankruptcy in U.S. history, intensifying the global financial crisis; the S&P 500 fell nearly 4.7% that session.",
  },
  {
    id: "flash-crash-2010",
    date: "2010-05-06",
    title: "The Flash Crash",
    description:
      "U.S. indices plunged and rebounded within minutes — the Dow briefly dropped about 9% intraday — in an event later tied to automated trading dynamics.",
  },
  {
    id: "covid-crash-2020",
    date: "2020-03-16",
    title: "COVID-19 crash",
    description:
      "The Dow fell 12.9% — its worst single-day point and percentage loss to that date — as pandemic lockdowns began across major economies.",
  },
  {
    id: "covid-bottom-2020",
    date: "2020-03-23",
    title: "2020 bear-market low",
    description:
      "U.S. indices bottomed after a roughly one-month, 34% S&P 500 decline from its February peak, before a rebound aided by fiscal and monetary stimulus.",
  },
  {
    id: "gamestop-2021",
    date: "2021-01-27",
    title: "GameStop short squeeze",
    description:
      "Retail-driven buying, organized largely on social media, drove heavily shorted stocks like GameStop sharply higher, prompting brokerage trading restrictions and regulatory review.",
  },
  {
    id: "svb-2023",
    date: "2023-03-10",
    title: "Silicon Valley Bank collapses",
    description:
      "Regulators closed Silicon Valley Bank after a deposit run, the largest U.S. bank failure since 2008, prompting emergency measures to backstop depositors.",
  },
];
