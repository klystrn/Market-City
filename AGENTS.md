<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Market City project guidance

Read `MARKET_CITY.md` and `BUILD_PLAN.md` before changing product scope. The user approved working through the full phase-1 MVP in this existing repository. Preserve the city-first interface, progressive disclosure, strict TypeScript, deterministic intelligence and provider boundaries. Demo data must remain unmistakably simulated. No paid API dependencies. GitHub Pages is the initial deployment target; the existing portfolio and custom-domain path are a later step. Run lint, type checks and relevant tests after meaningful changes. Do not introduce phase-2 replay, full authentication or trading prematurely.
