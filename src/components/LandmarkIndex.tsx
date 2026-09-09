"use client";
import { MapPin } from "lucide-react";
import type { CityDefinition, CityLandmark } from "@/domain/cities/types";
import { sectorIdentities } from "@/domain/sectors";
import Dialog from "./Dialog";
const kindNames: Record<CityLandmark["kind"], string> = {
  park: "Park",
  tower: "Tower",
  spire: "Tower",
  bridge: "Bridge",
  museum: "Museum",
  palace: "Palace",
  wheel: "Observation wheel",
  arena: "Stadium",
  statue: "Monument",
  dome: "Dome",
  terminal: "Terminal",
  greenway: "Greenway",
};
/**
 * Every real place in the active city, and exactly what each one is doing
 * there. A landmark can be scenery, it can identify a sector, or it can stand
 * in for a company — and from the map alone the three look similar. This says
 * which is which in words, so an identity cue is never mistaken for a claim.
 */
export default function LandmarkIndex({
  city,
  onSector,
  onCompany,
  onClose,
}: {
  city: CityDefinition;
  onSector: (id: string) => void;
  onCompany: (ticker: string) => void;
  onClose: () => void;
}) {
  const landmarks = [...city.landmarks].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const sectorName = (id: string) =>
    sectorIdentities.find((s) => s.id === id)?.short ?? id;
  return (
    <Dialog
      label={`${city.name} landmark index`}
      eyebrow="WHAT EVERY LANDMARK IS DOING"
      onClose={onClose}
    >
      <h2>The places in {city.name}.</h2>
      <p className="fine-print">
        Simplified low-poly massing of real places, drawn as scenery. A landmark
        that stands in for a company is an identity cue for exploration — never
        a claim about ownership, tenancy or headquarters location.
      </p>
      <div className="landmark-index">
        {landmarks.map((l) => {
          const role = l.ticker
            ? { text: `Stands in for ${l.ticker}`, action: () => onCompany(l.ticker!) }
            : l.sector
              ? {
                  text: `Identifies ${sectorName(l.sector)}`,
                  action: () => onSector(l.sector!),
                }
              : null;
          return (
            <div key={l.id} className="landmark-row">
              <span className="landmark-row-name">
                <MapPin size={14} />
                <span>
                  <strong>{l.name}</strong>
                  <small>{kindNames[l.kind]}</small>
                </span>
              </span>
              {role ? (
                <button
                  className="landmark-role"
                  onClick={() => {
                    role.action();
                    onClose();
                  }}
                >
                  {role.text}
                </button>
              ) : (
                <span className="landmark-role muted">Scenery only</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="fine-print">
        {landmarks.filter((l) => l.ticker || l.sector).length} of{" "}
        {landmarks.length} landmarks carry a meaning; the rest are there because
        the real city has them.
      </p>
    </Dialog>
  );
}
