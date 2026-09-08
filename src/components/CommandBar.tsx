"use client";
import type { RefObject } from "react";
import { Search, Command, ArrowUpRight, X } from "lucide-react";
import type { Company } from "@/domain/types";
import { pct } from "@/domain/analytics";
export default function CommandBar({
  query,
  setQuery,
  searchOpen,
  setSearchOpen,
  input,
  execute,
  suggestions,
}: {
  query: string;
  setQuery: (v: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  input: RefObject<HTMLInputElement | null>;
  execute: (text: string) => void;
  suggestions: Company[];
}) {
  return (
    <div className="command-wrap">
      <form
        className="glass command-bar"
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) execute(query);
        }}
      >
        <Search size={18} />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search or ask Market City…"
          aria-label="Search companies or command Market City"
          autoComplete="off"
        />
        <kbd>
          <Command size={11} /> K
        </kbd>
        <button type="submit" aria-label="Run command">
          <ArrowUpRight size={18} />
        </button>
      </form>
      {searchOpen && (
        <div className="glass search-results">
          <div className="panel-heading">
            <span className="eyebrow">
              {query ? "COMPANIES & COMMANDS" : "A FEW PLACES TO START"}
            </span>
            <button
              className="icon-button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search suggestions"
            >
              <X size={14} />
            </button>
          </div>
          {suggestions.map((c) => (
            <button
              className="search-result"
              key={c.ticker}
              onClick={() => execute(c.ticker)}
            >
              <span>
                <b>{c.ticker}</b> {c.name}
              </span>
              <span className={c.changePercent >= 0 ? "positive" : "negative"}>
                {pct(c.changePercent)}
              </span>
            </button>
          ))}
          {(query
            ? [query]
            : [
                "Show technology",
                "Show Big Tech",
                "What is moving today?",
                "Show unusual volume",
                "Earnings this week",
              ]
          ).map((text) => (
            <button
              className="search-result"
              key={text}
              onClick={() => execute(text)}
            >
              <span>{text}</span>
              <ArrowUpRight size={14} />
            </button>
          ))}
          <p className="fine-print">
            Search a name or ticker, or try “stocks down more than 2%”.
          </p>
        </div>
      )}
    </div>
  );
}
