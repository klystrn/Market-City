"use client";
import { Compass, Play, X } from "lucide-react";
import type { CityDefinition } from "@/domain/cities/types";
import { orientations } from "@/domain/cities/orientation";
/**
 * Two lines telling a newcomer how this particular city is arranged, shown once
 * per city. Switching city changes the rules of the map, so the card comes back
 * for a city you have not seen — and stays gone for one you have.
 */
export default function CityOnboarding({
  city,
  onStartTour,
  onDismiss,
}: {
  city: CityDefinition;
  onStartTour: () => void;
  onDismiss: () => void;
}) {
  const orientation = orientations[city.id];
  return (
    <aside className="glass city-onboarding" aria-label={`${city.name} orientation`}>
      <div className="panel-heading">
        <span className="eyebrow">READING {city.name.toUpperCase()}</span>
        <button
          className="icon-button"
          onClick={onDismiss}
          aria-label="Dismiss orientation"
        >
          <X size={15} />
        </button>
      </div>
      <strong>{orientation.headline}</strong>
      <p>{orientation.detail}</p>
      <div className="city-onboarding-actions">
        <button className="primary-button" onClick={onStartTour}>
          <Play size={14} /> Take the tour
        </button>
        <button className="ghost-button" onClick={onDismiss}>
          <Compass size={14} /> Explore on my own
        </button>
      </div>
    </aside>
  );
}
