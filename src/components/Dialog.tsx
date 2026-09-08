"use client";
import { X } from "lucide-react";
import type { ReactNode } from "react";
export default function Dialog({
  label,
  eyebrow,
  onClose,
  children,
  className = "",
}: {
  label: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="info-scrim" onClick={onClose}>
      <section
        className={`glass info-panel ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const controls = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              "button, a[href], input, select",
            ),
          );
          const first = controls[0],
            last = controls[controls.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-heading">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : <span />}
          <button
            className="icon-button"
            aria-label={`Close ${label}`}
            onClick={onClose}
            autoFocus
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
