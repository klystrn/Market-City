"use client";
import {
  Trees,
  Landmark,
  TrainFront,
  Building2,
  Mountain,
  Tag,
  Signpost,
  Sparkles,
  Flame,
  Sprout,
  Flower2,
  Waypoints,
  Activity,
  CircleDashed,
  Ratio,
  BarChart3,
} from "lucide-react";
import type { MapFeatures } from "@/domain/map-features";
const options = [
  ["parks", "Parks", Trees],
  ["civic", "District landmarks", Landmark],
  ["transit", "Transit", TrainFront],
  ["greenery", "Trees", Sprout],
  ["context", "City blocks", Building2],
  ["mountains", "Mount Fuji", Mountain],
  ["labels", "Company & sector labels", Tag],
  ["signs", "Road signs", Signpost],
  ["brands", "Company identities", Sparkles],
  ["disasters", "Market shocks", Flame],
  ["breadthGardens", "Sector breadth gardens", Flower2],
  ["connections", "Supply-chain connections", Waypoints],
  ["trails", "Intraday performance trails", Activity],
  ["halos", "Volatility halos", CircleDashed],
  ["breadthRibbons", "Zone & borough breadth", Ratio],
  ["massColumns", "Sector mass columns", BarChart3],
] as const;
export default function MapDetails({
  features,
  setFeatures,
}: {
  features: MapFeatures;
  setFeatures: (features: MapFeatures) => void;
}) {
  return (
    <>
      <h3 className="map-details-title">Map details</h3>
      <div className="map-feature-grid">
        {options.map(([key, label, Icon]) => (
          <button
            key={key}
            role="checkbox"
            aria-checked={features[key]}
            className={`map-feature ${features[key] ? "active" : ""}`}
            onClick={() => setFeatures({ ...features, [key]: !features[key] })}
          >
            <span className={`feature-art feature-${key}`}>
              <Icon size={25} />
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
