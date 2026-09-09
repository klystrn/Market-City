"use client";
import { ChevronDown, Check, Globe2, X } from "lucide-react";
import { cityCatalog } from "@/domain/cities";
import type { CityDefinition, CityId } from "@/domain/cities/types";
import { universeNames, universeNotes } from "@/domain/indexes";
import type { Menu } from "./control-types";
export default function CityPicker({
  city,
  setCity,
  menu,
  setMenu,
  count,
}: {
  city: CityDefinition;
  setCity: (id: CityId) => void;
  menu: Menu;
  setMenu: (v: Menu) => void;
  /** Companies the active universe contributes to this city. */
  count: number;
}) {
  const open = menu === "city";
  return (
    <>
      <button
        className="city-switch"
        onClick={() => setMenu(open ? null : "city")}
        aria-expanded={open}
      >
        <Globe2 size={15} />
        <span>
          <strong>{city.name}</strong>
          <small>{universeNames[city.universe]}</small>
        </span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <section className="glass header-popover city-popover">
          <div className="panel-heading">
            <span className="eyebrow">CHOOSE YOUR CITY</span>
            <button
              className="icon-button"
              onClick={() => setMenu(null)}
              aria-label="Close city picker"
            >
              <X size={16} />
            </button>
          </div>
          <p>
            One market, several maps. Each city arranges the same companies a
            different way.
          </p>
          {cityCatalog.map((option) => (
            <button
              key={option.id}
              className={`layer-option ${option.id === city.id ? "active" : ""}`}
              onClick={() => {
                setCity(option.id);
                setMenu(null);
              }}
            >
              <span>
                <span>
                  <strong>
                    {option.name} · {universeNames[option.universe]}
                  </strong>
                  <small>{option.tagline}</small>
                </span>
              </span>
              {option.id === city.id && <Check size={16} />}
            </button>
          ))}
          <p className="fine-print">{city.layoutNote}</p>
          <p className="fine-print">
            {universeNotes[city.universe]} Showing {count} companies.
          </p>
          <p className="fine-print">
            City layouts are stylised interpretations at an illustrative scale,
            not georeferenced maps. A landmark standing in for a company is an
            identity cue, not a claim about ownership or tenancy.
          </p>
        </section>
      )}
    </>
  );
}
