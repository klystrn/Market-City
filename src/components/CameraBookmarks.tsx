"use client";
import { Bookmark, ArrowUpRight, Trash2 } from "lucide-react";
import type { CameraBookmark } from "@/domain/bookmarks";
import { sectorIdentities as sectors } from "@/domain/sectors";
import Dialog from "./Dialog";
function label(b: CameraBookmark) {
  if (b.ticker)
    return b.deep ? `${b.ticker} · deep dive` : `${b.ticker} · in focus`;
  if (b.sector)
    return `${sectors.find((s) => s.id === b.sector)?.short ?? b.sector} district`;
  return "City overview";
}
export default function CameraBookmarks({
  bookmarks,
  onSave,
  onGo,
  onRemove,
  onClose,
  currentLabel,
}: {
  bookmarks: CameraBookmark[];
  onSave: (name: string) => void;
  onGo: (b: CameraBookmark) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  currentLabel: string;
}) {
  return (
    <Dialog
      label="Bookmarked camera views"
      eyebrow="SAVED VIEWS"
      onClose={onClose}
    >
      <h2>Come back to this view.</h2>
      <p className="fine-print">
        Save the current camera focus and jump back to it any time. Saved views
        live only in this browser.
      </p>
      <button className="primary-button" onClick={() => onSave(currentLabel)}>
        <Bookmark size={16} /> Save “{currentLabel}”
      </button>
      <div className="settings-divider" />
      {bookmarks.length ? (
        <ul className="bookmark-list">
          {bookmarks.map((b) => (
            <li key={b.id}>
              <button className="bookmark-go" onClick={() => onGo(b)}>
                <span>
                  <strong>{b.name}</strong>
                  <small>{label(b)}</small>
                </span>
                <ArrowUpRight size={15} />
              </button>
              <button
                className="icon-button"
                aria-label={`Delete bookmark ${b.name}`}
                onClick={() => onRemove(b.id)}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">
          No saved views yet. Explore the city, then save a view to build a
          shortcut list.
        </p>
      )}
    </Dialog>
  );
}
