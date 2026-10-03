import type { Sector } from "./types";
export type SectorIdentity = Omit<Sector, "x" | "z" | "width" | "depth">;
// The eleven GICS sectors every city shares. Identity lives here, on its own,
// so the panels and lists that only need a name and a colour do not drag a
// city's ground geometry into the first download with them.
export const sectorIdentities: SectorIdentity[] = [
  { id: "technology", name: "Information Technology", short: "Technology", color: "#418ce0" },
  { id: "financials", name: "Financials", short: "Financials", color: "#d7a441" },
  { id: "healthcare", name: "Health Care", short: "Healthcare", color: "#d76b91" },
  { id: "consumer", name: "Consumer Discretionary", short: "Consumer", color: "#b17ad2" },
  { id: "communications", name: "Communication Services", short: "Communications", color: "#e07a2e" },
  { id: "industrials", name: "Industrials", short: "Industrials", color: "#4697b0" },
  { id: "staples", name: "Consumer Staples", short: "Staples", color: "#c8b083" },
  { id: "energy", name: "Energy", short: "Energy", color: "#f0c62f" },
  { id: "utilities", name: "Utilities", short: "Utilities", color: "#a3b7c0" },
  { id: "materials", name: "Materials", short: "Materials", color: "#9c7350" },
  { id: "realestate", name: "Real Estate", short: "Real Estate", color: "#7868d8" },
];
