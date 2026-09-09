"use client";
import { useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import type { CityDefinition } from "@/domain/cities/types";
import { orientations } from "@/domain/cities/orientation";
/**
 * A short camera path through the active city, explaining one encoding at each
 * stop. Skippable at every step and never automatic: it moves only when the
 * reader asks it to, so it cannot take the map away from someone mid-thought.
 */
export default function GuidedTour({
  city,
  step,
  setStep,
  onVisit,
  onFinish,
}: {
  city: CityDefinition;
  step: number;
  setStep: (n: number) => void;
  onVisit: (sector: string) => void;
  onFinish: () => void;
}) {
  const stops = orientations[city.id].tour;
  const stop = stops[step];
  useEffect(() => {
    if (stop) onVisit(stop.sector);
  }, [stop, onVisit]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onFinish]);
  if (!stop) return null;
  const last = step === stops.length - 1;
  return (
    <aside className="glass guided-tour" aria-live="polite">
      <div className="panel-heading">
        <span className="eyebrow">
          TOUR · STOP {step + 1} OF {stops.length}
        </span>
        <button className="icon-button" onClick={onFinish} aria-label="End tour">
          <X size={15} />
        </button>
      </div>
      <strong>{stop.title}</strong>
      <p>{stop.body}</p>
      <div className="guided-tour-actions">
        <span className="tour-dots" aria-hidden>
          {stops.map((s, i) => (
            <i key={s.sector} className={i === step ? "on" : ""} />
          ))}
        </span>
        <button
          className="primary-button"
          onClick={() => (last ? onFinish() : setStep(step + 1))}
        >
          {last ? "Finish" : "Next"} <ArrowRight size={14} />
        </button>
      </div>
    </aside>
  );
}
