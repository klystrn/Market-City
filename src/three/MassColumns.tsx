import { useMemo } from "react";
import type { Company } from "@/domain/types";
import type { CityDistrict } from "@/domain/cities/types";
// A translucent column standing over each district, its volume proportional to
// that sector's share of the whole universe's market capitalisation.
//
// The skyline already shows weight, but only where you happen to be standing:
// a district of many mid-caps can look busier than one holding a single
// mega-cap. These columns put the same quantity on one scale you can read
// across the city from the overview. Footprint is fixed and height carries the
// share, so a column twice as tall really is twice the weight.
const FOOTPRINT = 9;
const TALLEST = 74;
export default function MassColumns({
  districts,
  companies,
  dark,
}: {
  districts: CityDistrict[];
  companies: Company[];
  dark: boolean;
}) {
  const columns = useMemo(() => {
    const total = companies.reduce((sum, c) => sum + c.marketCap, 0);
    if (!total) return [];
    return districts
      .map((district) => {
        const share =
          companies
            .filter((c) => c.sector === district.id)
            .reduce((sum, c) => sum + c.marketCap, 0) / total;
        return { district, share };
      })
      .filter(({ share }) => share > 0);
  }, [districts, companies]);
  // The largest sector reaches full height, so the tallest column is legible
  // whatever the universe; the ratios between columns stay true either way.
  const peak = columns.reduce((max, c) => Math.max(max, c.share), 0.0001);
  return (
    <group>
      {columns.map(({ district, share }) => {
        const height = (share / peak) * TALLEST;
        return (
          <group key={district.id} position={[district.x, 0, district.z]}>
            <mesh position={[0, height / 2 + 1.2, 0]}>
              <boxGeometry args={[FOOTPRINT, height, FOOTPRINT]} />
              <meshStandardMaterial
                color={district.color}
                transparent
                opacity={dark ? 0.22 : 0.17}
                depthWrite={false}
                roughness={0.15}
                metalness={0.1}
              />
            </mesh>
            {/* A solid cap, so the top of each column is easy to compare. */}
            <mesh position={[0, height + 1.5, 0]}>
              <boxGeometry args={[FOOTPRINT * 1.16, 0.7, FOOTPRINT * 1.16]} />
              <meshStandardMaterial
                color={district.color}
                transparent
                opacity={0.85}
                roughness={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
