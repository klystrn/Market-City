import { useMemo } from "react";
import type { Company } from "@/domain/types";
import type { CityDefinition } from "@/domain/cities/types";
import { breadthColor, sectorBreadthRatio } from "@/domain/analytics";
import { Boxes, segment, type Part } from "./SceneryParts";
// A thin band along the edge of each market-cap band — a London ring, a New
// York borough shore, a Tokyo town boundary — coloured by the share of that
// band's companies advancing today.
//
// This is breadth, not weight: a band of small companies mostly rising reads
// green even though it carries little of the index. The mass columns are the
// layer that shows weight.
const RIBBON_Y = 1.16;
export default function BreadthRibbons({
  city,
  companies,
  dark,
}: {
  city: CityDefinition;
  companies: Company[];
  dark: boolean;
}) {
  const parts = useMemo(() => {
    // Which sectors sit in each band, so a band's breadth is its own members'.
    const sectorsByTier = new Map<string, string[]>();
    for (const district of city.districts) {
      const tier = district.tier ?? district.id;
      sectorsByTier.set(tier, [...(sectorsByTier.get(tier) ?? []), district.id]);
    }
    const ribbons: Part[] = [];
    for (const tier of city.tiers) {
      const outline = city.tierOutline(tier.id);
      if (outline.length < 2) continue;
      const members = companies.filter((c) =>
        (sectorsByTier.get(tier.id) ?? []).includes(c.sector),
      );
      if (!members.length) continue;
      const color = breadthColor(sectorBreadthRatio(members), dark);
      for (let i = 1; i < outline.length; i++)
        ribbons.push({
          ...segment(outline[i - 1], outline[i], 1.1, 0.16, RIBBON_Y),
          color,
        });
    }
    return ribbons;
  }, [city, companies, dark]);
  return <Boxes parts={parts} />;
}
