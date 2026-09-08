import { useMemo } from "react";
import type { Company } from "@/domain/types";
import type { CityDistrict, CityLandmark } from "@/domain/cities/types";
import { sectorBreadthRatio } from "@/domain/analytics";
// Optional decorative gauge: a small garden beside each sector's gateway
// landmark, lusher when more of that sector's companies are advancing today.
export default function BreadthGardens({
  companies,
  districts,
  landmarks,
}: {
  companies: Company[];
  districts: CityDistrict[];
  landmarks: CityLandmark[];
}) {
  const gardens = useMemo(
    () =>
      districts
        .map((s) => {
          const landmark = landmarks.find((l) => l.sector === s.id);
          if (!landmark) return null;
          const ratio = sectorBreadthRatio(
            companies.filter((c) => c.sector === s.id),
          );
          return {
            id: s.id,
            x: landmark.x + landmark.radius + 4,
            z: landmark.z,
            ratio,
          };
        })
        .filter((g): g is NonNullable<typeof g> => g !== null),
    [companies, districts, landmarks],
  );
  return (
    <>
      {gardens.map((g) => {
        const lushness = 0.35 + g.ratio * 0.85;
        const wilted = g.ratio < 0.4;
        const bloomColor = wilted
          ? "#b6975f"
          : g.ratio > 0.6
            ? "#4fa953"
            : "#8ab369";
        return (
          <group key={g.id} position={[g.x, 1.12, g.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[2.5, 18]} />
              <meshStandardMaterial
                color={wilted ? "#cdbd93" : "#8ec27c"}
                roughness={0.92}
              />
            </mesh>
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const h = 0.25 + lushness * 0.55;
              return (
                <mesh
                  key={i}
                  position={[
                    Math.cos(angle) * 1.4,
                    h / 2,
                    Math.sin(angle) * 1.4,
                  ]}
                >
                  <sphereGeometry args={[0.55, 8, 6]} />
                  <meshStandardMaterial color={bloomColor} roughness={0.75} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </>
  );
}
