"use client";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { sectors } from "@/domain/city";
import { subsectors } from "@/domain/subsectors";
import Dialog from "./Dialog";
export default function DistrictDirectory({
  onSector,
  onSubsector,
  onClose,
}: {
  onSector: (id: string) => void;
  onSubsector: (id: string) => void;
  onClose: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  function roam(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = Array.from(
      list.current?.querySelectorAll<HTMLElement>("[data-directory-item]") ??
        [],
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index === -1) return;
    e.preventDefault();
    const next = e.key === "ArrowDown" ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  }
  return (
    <Dialog
      label="District directory"
      eyebrow="EVERY TOWN, ONE LIST"
      onClose={onClose}
    >
      <h2>Jump to any district.</h2>
      <p className="fine-print">
        A keyboard-friendly way to reach every sector and street without the 3D
        map. Use ↑ / ↓ to move, Enter to select.
      </p>
      <div className="district-directory" ref={list} onKeyDown={roam}>
        {sectors.map((s) => (
          <section key={s.id} className="directory-sector">
            <button
              data-directory-item
              className="directory-sector-button"
              onClick={() => {
                onSector(s.id);
                onClose();
              }}
            >
              <span
                className="directory-swatch"
                style={{ background: s.color }}
              />
              <strong>{s.short}</strong>
              <span className="fine-print">{s.name}</span>
            </button>
            <ul>
              {subsectors
                .filter((sub) => sub.sector === s.id)
                .map((sub) => (
                  <li key={sub.id}>
                    <button
                      data-directory-item
                      className="directory-subsector-button"
                      onClick={() => {
                        onSubsector(sub.id);
                        onClose();
                      }}
                    >
                      <ChevronRight size={13} />
                      <span>{sub.street}</span>
                      <small>{sub.name}</small>
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
