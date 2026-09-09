import type { CityId } from "./types";
// What a newcomer needs to know about the city in front of them, and a short
// path through it. Both are per city because the whole point of three cities is
// that the same market is arranged three different ways — an orientation that
// said the same thing everywhere would teach nothing.
export interface TourStop {
  /** A sector to fly to, which is how the camera already moves. */
  sector: string;
  title: string;
  /** One encoding, explained where you can see it. */
  body: string;
}
export interface CityOrientation {
  /** Two lines: where the biggest companies are, and what a district is. */
  headline: string;
  detail: string;
  tour: TourStop[];
}
export const orientations: Record<CityId, CityOrientation> = {
  newyork: {
    headline: "Five boroughs, biggest in Manhattan.",
    detail:
      "Each borough holds a band of sector market capitalisation, each neighbourhood a sector, each street a subsector.",
    tour: [
      {
        sector: "technology",
        title: "Manhattan holds the heaviest sectors",
        body: "Boroughs rank by sector market capitalisation, so the largest sectors sit closest to the centre of the island. Technology is the heaviest of all.",
      },
      {
        sector: "financials",
        title: "Building size is space owned",
        body: "A company's market capitalisation is its land and its height together, so a mega-cap reads as a large site rather than only a tall spike.",
      },
      {
        sector: "utilities",
        title: "Colour is today, not size",
        body: "Green and red show the daily move; they never change how big a building is. Weight changes slowly, performance changes every session.",
      },
      {
        sector: "materials",
        title: "The Bronx holds the lightest",
        body: "The smallest sector by market capitalisation sits in the outermost borough, which is the same rule that put Technology in Manhattan.",
      },
    ],
  },
  london: {
    headline: "Zones out from the centre, biggest in the middle.",
    detail:
      "Every sector runs outward as a wedge; the larger the company, the lower its zone number.",
    tour: [
      {
        sector: "financials",
        title: "Zone 1 is the largest",
        body: "Each sector cuts through every zone as a wedge. The biggest company in a sector reaches the innermost ring, and its smaller peers follow outward.",
      },
      {
        sector: "technology",
        title: "One wedge is one sector",
        body: "Follow a wedge from the centre to the edge and you are reading a single sector from its largest company to its smallest.",
      },
      {
        sector: "energy",
        title: "Streets front the buildings",
        body: "There are no ring roads dividing one zone from the next: ordinary streets front each row, so the city reads as a street network, not a dartboard.",
      },
    ],
  },
  tokyo: {
    headline: "A town per sector, a street per subsector.",
    detail:
      "The Nasdaq-100, so there are no big banks and only a single energy company — the index genuinely has almost none.",
    tour: [
      {
        sector: "technology",
        title: "Every town is a sector",
        body: "Technology is the largest town because the Nasdaq-100 is mostly technology. Named streets inside it group the subsectors.",
      },
      {
        sector: "financials",
        title: "A thin district is an honest one",
        body: "The Nasdaq-100 carries almost no financials, so this town is nearly empty. It is not missing data — that is what the index looks like.",
      },
      {
        sector: "consumer",
        title: "Traffic is trading volume",
        body: "Vehicles run on the streets in proportion to relative trading volume, so a busy street means unusual activity rather than a large company.",
      },
    ],
  },
};
