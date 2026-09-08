export type Season = "spring" | "summer" | "autumn" | "winter";
export type SeasonMode = Season | "auto";
export const seasonNames: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
  winter: "Winter",
};
// Northern Japan calendar convention, resolved in Japan Standard Time.
// Scenery is an illustration of the season, not a local weather forecast.
export function japanSeason(timestamp: number): Season {
  const month = new Date(timestamp + 9 * 3600000).getUTCMonth();
  return month >= 2 && month <= 4
    ? "spring"
    : month >= 5 && month <= 7
      ? "summer"
      : month >= 8 && month <= 10
        ? "autumn"
        : "winter";
}
export const seasonPalette: Record<
  Season,
  {
    ground: string;
    leaf: string;
    accent: string;
    evergreen: string;
    snowLine: number;
    water: string;
  }
> = {
  spring: {
    ground: "#99bf79",
    leaf: "#f49ac0",
    accent: "#ffd1df",
    evergreen: "#38815c",
    snowLine: 0.62,
    water: "#40aabb",
  },
  summer: {
    ground: "#7daf63",
    leaf: "#45a05d",
    accent: "#8ac843",
    evergreen: "#267454",
    snowLine: 0.93,
    water: "#159caf",
  },
  autumn: {
    ground: "#91a978",
    leaf: "#d96336",
    accent: "#efba43",
    evergreen: "#3f7957",
    snowLine: 0.76,
    water: "#308fa7",
  },
  winter: {
    ground: "#c5d4ce",
    leaf: "#c5d5d3",
    accent: "#f0f4ed",
    evergreen: "#457064",
    snowLine: 0.38,
    water: "#568fa8",
  },
};
