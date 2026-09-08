"use client";
import type { RefObject } from "react";
import { ChevronDown, UserRound, ArrowUpRight, X } from "lucide-react";
import type { Snapshot } from "@/domain/types";
import type { Menu } from "./control-types";
export default function CityHeader({
  snapshot,
  dataMode,
  setDataMode,
  cached,
  dataMessage,
  menu,
  setMenu,
  headerMenu,
  reset,
  stale,
}: {
  snapshot: Snapshot;
  dataMode: "demo" | "snapshot";
  setDataMode: (v: "demo" | "snapshot") => void;
  cached: Snapshot | null;
  dataMessage: string;
  menu: Menu;
  setMenu: (v: Menu) => void;
  headerMenu: RefObject<HTMLDivElement | null>;
  reset: () => void;
  stale: boolean;
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={reset} aria-label="Market City home">
        <span className="brand-mark">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>
          Market City<span className="brand-period">.</span>
        </span>
      </button>
      <div className="topbar-right" ref={headerMenu}>
        <button
          className="market-session"
          onClick={() => setMenu(menu === "data" ? null : "data")}
          aria-expanded={menu === "data"}
        >
          <span className="session-dot" />
          {snapshot.market.dataStatus === "demo"
            ? "God session"
            : snapshot.market.session === "regular"
              ? "Market open"
              : "Market snapshot"}
          <ChevronDown size={13} />
        </button>
        <span className="header-divider" />
        <button
          className="profile-button"
          onClick={() => setMenu(menu === "profile" ? null : "profile")}
          aria-label="Profile and account"
          aria-expanded={menu === "profile"}
        >
          <UserRound size={17} />
          <span>Guest</span>
        </button>
        {menu === "profile" && (
          <section className="glass header-popover">
            <span className="eyebrow">YOUR CORNER OF THE CITY</span>
            <h3>Welcome, explorer.</h3>
            <p>
              You’re browsing as a guest. Every part of the city is open to you.
            </p>
            <div className="account-note">
              <UserRound size={18} />
              <span>
                Google sign-in is planned for a later release. No account needed
                today.
              </span>
            </div>
            <button className="primary-button" onClick={() => setMenu(null)}>
              Keep exploring <ArrowUpRight size={16} />
            </button>
          </section>
        )}
        {menu === "data" && (
          <section className="glass header-popover data-popover">
            <div className="panel-heading">
              <span className="eyebrow">DATA & SESSION</span>
              <button
                className="icon-button"
                onClick={() => setMenu(null)}
                aria-label="Close data settings"
              >
                <X size={16} />
              </button>
            </div>
            <h3>A city you can always explore.</h3>
            <p>
              God simulation uses fictional market figures and stories. Real
              snapshots appear when a data source is connected.
            </p>
            <div className="segmented data-switch">
              <button
                className={dataMode === "demo" ? "active" : ""}
                onClick={() => {
                  setDataMode("demo");
                  reset();
                }}
              >
                God
              </button>
              <button
                disabled={!cached}
                className={dataMode === "snapshot" ? "active" : ""}
                onClick={() => {
                  setDataMode("snapshot");
                  reset();
                }}
              >
                Shared snapshot
              </button>
            </div>
            <p className="fine-print" role="status">
              {dataMessage}
            </p>
            <p className="fine-print">
              Open God → Simulation to change prices, session time and events.
            </p>
            <p className="fine-print">
              Prices:{" "}
              {snapshot.companies.every((c) => c.dataStatus === "demo")
                ? "DEMO"
                : snapshot.companies.some((c) => c.dataStatus === "demo")
                  ? "Mixed EOD / demo · see company labels"
                  : "EOD"}
              <br />
              News:{" "}
              {snapshot.news.some((n) => n.dataStatus !== "demo")
                ? "Provider snapshot"
                : "Fictional demo stories"}
              <br />
              Snapshot: {new Date(snapshot.generatedAt).toLocaleString()}
              {stale ? " · STALE" : ""}
            </p>
            {snapshot.warnings.map((w) => (
              <p className="fine-print" key={w}>
                {w}
              </p>
            ))}
          </section>
        )}
      </div>
    </header>
  );
}
