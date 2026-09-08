"use client";
import { useEffect, useRef } from "react";
export default function MapGuide() {
  const guide = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !guide.current?.contains(event.target) &&
        guide.current
      )
        guide.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && guide.current) guide.current.open = false;
    };
    document.addEventListener("click", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <details ref={guide} className="glass map-guide">
      <summary>
        Read the city <span>Guide</span>
      </summary>
      <dl>
        <div>
          <dt>Building height & footprint</dt>
          <dd>
            Compressed market capitalization. Bigger company, bigger building.
          </dd>
        </div>
        <div>
          <dt>Green / red</dt>
          <dd>
            Daily gains / losses. Glass towers use tinted façades and colored
            podiums.
          </dd>
        </div>
        <div>
          <dt>Traffic & station lights</dt>
          <dd>
            Relative trading volume versus normal activity—not money moving
            between companies.
          </dd>
        </div>
        <div>
          <dt>Town / street</dt>
          <dd>
            Sector / subsector. Click a town to zoom; double-click a company to
            explore.
          </dd>
        </div>
        <div>
          <dt>Event beacons</dt>
          <dd>Significant catalysts. Open Layers & view → Catalysts.</dd>
        </div>
        <div>
          <dt>Fire / earthquake</dt>
          <dd>
            Stock below −10% / index at or below −5%. God simulations are
            fictional.
          </dd>
        </div>
        <div>
          <dt>Public spaces & Fuji</dt>
          <dd>
            Seasonal scenery, with no stock quote. Toggle map details in Layers
            & view.
          </dd>
        </div>
      </dl>
      <p>WASD / arrows move · Drag rotates · Scroll zooms.</p>
    </details>
  );
}
