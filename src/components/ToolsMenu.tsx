"use client";
import {
  Wrench,
  ChevronDown,
  Bookmark,
  Columns3,
  Camera,
  Compass,
  Landmark,
  X,
} from "lucide-react";
import type { Menu } from "./control-types";
export default function ToolsMenu({
  menu,
  setMenu,
  watchlistCount,
  compareCount,
  bookmarkCount,
}: {
  menu: Menu;
  setMenu: (v: Menu) => void;
  watchlistCount: number;
  compareCount: number;
  bookmarkCount: number;
}) {
  const open = menu === "tools";
  const items: {
    id: Exclude<Menu, "tools" | null>;
    label: string;
    hint: string;
    icon: typeof Bookmark;
    count?: number;
  }[] = [
    {
      id: "watchlist",
      label: "Watchlist",
      hint: "Pinned companies",
      icon: Bookmark,
      count: watchlistCount,
    },
    {
      id: "compare",
      label: "Compare",
      hint: "Side-by-side metrics",
      icon: Columns3,
      count: compareCount,
    },
    {
      id: "camera",
      label: "Bookmarked views",
      hint: "Saved camera positions",
      icon: Camera,
      count: bookmarkCount,
    },
    {
      id: "directory",
      label: "District directory",
      hint: "Keyboard-friendly index",
      icon: Compass,
    },
    {
      id: "history",
      label: "Market history",
      hint: "Museum of Markets",
      icon: Landmark,
    },
  ];
  return (
    <div className="tools-wrap">
      {open && (
        <section className="glass tools-panel">
          <div className="panel-heading">
            <span className="eyebrow">EXPLORE TOOLS</span>
            <button
              className="icon-button"
              aria-label="Close tools menu"
              onClick={() => setMenu(null)}
            >
              <X size={15} />
            </button>
          </div>
          {items.map((item) => (
            <button
              key={item.id}
              className="layer-option"
              onClick={() => setMenu(item.id)}
            >
              <span>
                <item.icon size={17} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
              </span>
              {!!item.count && <span className="tool-count">{item.count}</span>}
            </button>
          ))}
        </section>
      )}
      <button
        className="glass view-pill"
        onClick={() => setMenu(open ? null : "tools")}
        aria-expanded={open}
      >
        <Wrench size={16} />
        <span>Tools</span>
        <ChevronDown size={13} />
      </button>
    </div>
  );
}
