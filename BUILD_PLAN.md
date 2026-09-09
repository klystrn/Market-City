# Market City build record

Source of truth: [MARKET_CITY.md](MARKET_CITY.md). Preserve its scope and anti-overload rules.

## Agreed with owner
- Work through the full phase-1 MVP, without intermediate approval gates.
- Use this repository. GitHub hosting initially; reginaldtan.com/MarketCity is a later step.
- Assume no provider accounts or credentials. No paid dependencies.
- Follow the specified architectural-model city and editorial/glass UI direction.
- Owner refinement: use the supplied low-poly city references for varied detailed buildings (window grids, roof equipment, storefronts, setbacks), preserving financial performance colors.
- Replace the square platform with unique semi-realistic terrain, a winding river, bridges and connected roads dividing sector towns.
- Add subsector streets within towns, including software, semiconductors and memory; support subsector search/focus.
- Keep Explore Company in a separate card below the details panel, and support double-clicking a building to explore.
- Latest owner refinement: use the Market Atlas screenshot as a city-density and skyline reference. Expand into a hybrid elongated/sprawling financial metropolis, with broader river curves, tidal branches, connected blocks, greenery and mountains. Preserve the agreed UI and market colors.
- Add WASD/arrow-key ground panning, faster scroll zoom and outside-click dismissal of floating cards.
- Superseding geography refinement: Tokyo-inspired inland sprawl, eastern rivers and a southeastern bay; Energy, Industrials and Real Estate occupy separate islands. No ocean behind the inland mountains.
- Mount Fuji is the dominant distant landmark: broad volcanic cone, small summit crater, faceted rock, forested foothills and seasonal snow. The layout is a stylized interpretation, not a georeferenced copy of Tokyo.
- Add all four Japanese calendar seasons, with an automatic JST calendar setting and manual previews in Layers & view. Keep seasonal scenery independent of financial weather and quote data.
- Owner now requests a more vibrant palette. Enrich landscape, water, roofs and civic accents, keeping company gains green and losses red.
- Make sector labels and town ground clickable to zoom. Give the FAANG/Magnificent Seven distinct architectural signatures. Replace floating street names with physical roadside signs visible only at close zoom.

## Architecture decisions
- Next.js static export for GitHub Pages; React/strict TypeScript/R3F/Three.js.
- City geometry, domain facts, derived interpretations and UI stay separate.
- Seeded 100-company demo runs entirely without credentials. Every simulated item is labeled.
- API credentials only in an offline/server-side refresh script or GitHub Actions secrets. Browsers fetch a shared JSON snapshot, never provider APIs.
- Scheduled GitHub jobs are best-effort and cannot promise five-minute live news. Freshness remains explicit. Provider adapters remain replaceable for future server hosting.
- Synthesized original ambient music removes external stream/licensing dependency; browser speech synthesis provides opt-in bulletins.

## Milestones
- [x] Foundation and deterministic 100-company demo dataset
- [x] City core, sector towns, subsector streets and stable layout
- [x] Company drawer, separate Explore card and deep dive
- [x] Themes, session lighting, weather and traffic
- [x] News adapter and shared snapshot path (fixture validated)
- [x] EOD market data adapter (fixture validated)
- [x] Deterministic intelligence and command parser
- [x] Opt-in original radio and browser TTS
- [x] Responsive list fallback, keyboard controls and interaction validation
- [x] Metropolitan refinement: curved estuary, five bridges, tidal branches, outer boulevards, neutral urban blocks, wooded hills and twelve architectural forms
- [x] Tokyo/Fuji refinement: mainland and three sector islands, eleven civic identifiers, elevated rail loop, four seasonal environments and a more vibrant palette
- [x] Click-to-zoom sectors, eight company signatures and close-range road signs
- [ ] Live provider verification: requires account credentials; no accounts assumed
- [ ] GitHub Pages publication: workflow prepared; no deployment claimed

## Validation record
Layout tests check every company footprint against land and channels, other company lots, district bounds and road corridors. Environment tests check Japanese season boundaries, island assignments and inland mountain geography. Browser checks cover company exploration, outside dismissal, keyboard panning, sector-click zoom, spring blossoms and close-range physical signs. Demo data remains labeled and provider secrets remain outside the client.

## Deferred by specification
Full live S&P 500, historical replay, Google authentication, trading, paid AI/TTS, portfolio accounting, and custom-domain deployment.

## God simulation and civic spaces (owner scope update)
The owner explicitly superseded the original no-disaster/no-prediction restrictions with God simulation, fire/earthquake metaphors and a next-session model. Keep these fictional and deterministic; this does not authorize trading or claims of reliable forecasts.

- [x] City-first opening framing with Fuji behind the skyline.
- [x] Commons Park, a museum courtyard and pyramid, botanical conservatories and covered elevated station. Reserved civic lots exclude generated filler buildings and trees.
- [x] God panel is collapsed by default; company and sector targets, independent index, session time, VIX, relative volume, fictional announcements, presets and reset.
- [x] Fire below −10%; brief earthquake on entry to index ≤−5%. Effects toggle and reduced-motion support.
- [x] Next-session random-walk benchmark and ±1.96 trailing-return-volatility stress scenarios, clearly unvalidated with synthetic history. User-injected events are assumptions; future news is not predicted. Weekends are skipped; exchange holidays are not modeled.
- [x] Domain tests cover override precedence, price coherence, nonmutation, session boundaries, exact effect thresholds and forecast ordering.

Civic ideas: keep parks and conservatories seasonal scenery. Station platform lighting shows mean relative volume (not capital flows). A museum can later teach verified market history; do not invent historical exhibits as facts. Optional breadth gardens and earnings arrivals remain ideas, not implemented encodings.

## City identity and map controls (latest owner refinement)
- [x] Central Commons Park enlarged to 50×40 world units, with open lawns, lake, fountain, amphitheater steps and perimeter trees. Existing company plots remain stable.
- [x] No generated trees on Fuji; background tree coverage thinned with deterministic sampling.
- [x] Farm and grain silo by Staples; shopping arcade by Consumer; bronze bull and flag-lined exchange promenade by Financials; orbital sculpture at the Technology gateway; SpaceX rocket exhibit on the industrial island. SpaceX has no invented quote or stock plot.
- [x] Continuous glass shafts, tapered polygonal spires and twisting floor plates; glazed Microsoft, Meta, Tesla and Alphabet campuses. Larger signature details and Amazon courtyard conservatories improve recognition.
- [x] Google Maps-inspired feature tiles independently control parks, civic scenery, transit, trees, background blocks, Fuji, labels, close-range signs, company identity details and market shocks.
- [x] Opening marketing copy replaced by an expandable, dismissible city guide. Keyboard pan sensitivity raised from 380 to 900 / zoom.
- [x] Civic footprint tests prevent shore overhang and company overlap. Browser checks confirmed tree/transit/label toggles and guide expansion.

## Sector audit, music library and zoom boundary
- [x] Audited all 100 seeded companies against the public GICS reference CSV, retrieved 2026-09-08; 100 matched. Alphabet and Meta remain in Communication Services. Dated results in `src/data/sector-audit.json`; input fixture and regeneration script retained.
- [x] Jazz autostart requested by owner supersedes the original opt-in default. Broadcasts/news default on; browser autoplay denial waits for the first interaction and remains visibly stopped. Pause cancels music and speech.
- [x] Owner music folders: jazz 21, lofi 20; classical and technopop reserved. Predev/prebuild generate the manifest and copy files into public/music without changing originals.
- [x] Warmer presenter defaults: preferred natural English voices, with Zira selected from this browser's installed voices; rate 1.04 and pitch 1.08. User can choose another presenter. Actual voice quality depends on the browser's available voices.
- [x] Minimum camera zoom now equals responsive overview zoom, limiting zoom-out to the initial city/Fuji composition.

- Broadcast refinement: shared ticker-to-company-name mapping covers all 100 seeded companies and accepts provider names for new companies. Market and news scripts expand complete ticker tokens; original headlines and city labels stay unchanged. News metadata disambiguates one-letter/common-word symbols.

## UI/UX, market visualization, features and optimization batch (owner-selected proposals)
- [x] Search resolves curated cross-sector groups ("Big Tech", "Magnificent Seven") alongside tickers, sectors and subsectors.
- [x] Pinnable company cards double as a local watchlist (localStorage), reachable from the new Tools menu; each pin/unpin toggles from the company panel.
- [x] Bookmarked camera views: save the current company/sector focus with an auto-generated name and jump back to it later.
- [x] Keyboard-accessible district directory: every sector and subsector street reachable without the 3D map, with arrow-key roving between entries.
- [x] Optional sector-breadth gardens beside each sector's landmark, lusher when more of that sector's seeded companies are advancing.
- [x] Selectable supply-chain connections: curated, illustrative ticker-pair relationships drawn as arcs between buildings when a company is selected; also listed as chips on its company card.
- [x] Earnings arrivals board at Central Exchange Station, listing the soonest upcoming EARNINGS catalysts like a departures board.
- [x] Intraday performance trails: a deterministic, seeded bridge-random-walk from the session open to the current price, rendered as a small ribbon beside the selected company and the day's biggest movers. Labeled illustrative — this offline demo has no real intraday feed.
- [x] Optional volatility halos: a ground ring around each building sized and colored by trailing daily-return volatility.
- [x] Side-by-side company comparison: add up to four companies from a card or the watchlist, compare price, change, market cap, volume and sector in one table.
- [x] God scenarios can be saved by name (localStorage) or shared as a link (?scenario=… encodes every God setting).
- [x] Museum of Markets: a verified, curated timeline of real U.S. financial history (Black Tuesday through the 2023 SVB collapse), reachable by clicking the museum building or the Tools menu — clearly separated from this app's simulated data.
- [x] Adaptive graphics quality: a frame-time monitor trims device pixel ratio and disables traffic/optional layers under sustained low frame rates, and restores them once performance recovers; toggle in Layers & view (default on).
- [x] Heavier per-minute intraday-trail computation moved to a background Web Worker (self-contained Blob worker, since this project's static-export build does not compile a `new Worker(new URL(...))` reference) so dragging the God session-minute slider never blocks the main thread; falls back to a synchronous compute if Workers are unavailable.

## Signature buildings and UI/UX pass
- [x] Every sector now has at least one hand-modeled signature landmark, not just the technology-adjacent giants: JPM (financials), LLY (healthcare), CAT (industrials), WMT (staples), XOM (energy), NEE (utilities), LIN (materials), PLD (real estate) join the original eight. Each got a curated base architecture variant (`signatureForms` in `domain/city.ts`) so its accents land on a flat, centered facade instead of a taper/drum silhouette. JPM's design nods to 270 Park Avenue's diagonal exoskeleton bracing.
- [x] UI/UX proportion and margin audit across desktop, laptop, tablet and mobile widths (390–1680px): fixed the "Layers & view" and "Tools" dropdown panels going off-screen on narrow viewports (they were anchored to a flex-positioned launcher button rather than the viewport), removed the dead/conflicting CSS rules that caused it, and hid the station's earnings-arrivals board while a company panel is open so the two never compete for the same screen region.
- [x] JPM's exoskeleton wraps all four elevations with four corner supercolumns planted at ground level, after owner feedback that a single-face brace did not read as 270 Park Avenue.
- [x] Picking a company from search (suggestion click or Enter) now moves the camera to its building and opens the company view. Building clicks in the 3D scene keep single-click preview / double-click explore.

## Multiple cities (owner scope update)

The owner asked for the market universe and the city geography to become separate,
switchable choices rather than one fixed map.

### Correction recorded
The owner described the existing city as showing the Nasdaq-100. The seeded
development dataset is actually an **S&P 500-style subset of 100 companies** — it
contains NYSE-listed names (JPM, XOM, CVX, WMT, PG, KO, JNJ, LLY, UNH, CAT, GE,
NEE, PLD and others) that are not Nasdaq-100 constituents. Rather than relabel the
data, each seeded company now carries accurate index-membership flags, and the
Nasdaq-100 city renders only the seeded companies that are genuinely NDX members.
Completing a true Nasdaq-100 city needs the remaining NDX constituents added to the
dataset; that is a data task, not a layout task.

### Agreed geography
- **Tokyo — Nasdaq-100.** The existing inland-sprawl/bay/Fuji layout is preserved
  unchanged and becomes the Nasdaq-100 city. Sector towns and subsector streets stay.
- **London — S&P 500.** Concentric zones with zone 1 at the centre (nine as first
  specified, later trimmed to the seven that hold companies — see Revisions). Every sector
  cuts through every zone as a wedge, so a district is a radial slice rather than a
  town. Lower zone number = larger market capitalisation. No subsector sorting in the
  layout; subsector is shown on the company card instead. Thames, royal parks,
  museums and recognisable landmarks (the Shard, Tower Bridge, the London Eye,
  Buckingham Palace, the Gherkin, Canary Wharf). Sector placement follows the real
  city where it exists — financials at Canary Wharf and the City.
- **New York City — S&P 500.** Five boroughs ranked by sector market-cap tier:
  Manhattan (highest), Queens, Staten Island, Brooklyn, Bronx (lowest). Boroughs carry
  the tier, neighbourhoods carry the sector, streets carry the subsector. Hudson and
  East rivers, Central Park, museums and landmarks. Real anchoring where it exists —
  Wall Street for financials, Hudson Yards for technology. Existing skyscrapers stand
  in for their real occupants. The opening camera looks across Manhattan with Queens
  and Brooklyn behind it.
- **Sizing.** Market capitalisation maps to the **total built volume** a company
  occupies — a combination of land footprint and height — rather than height alone.
- **Switching.** The user picks the city; the choice persists locally.

### Not claimed
These are stylised interpretations at an illustrative scale, not georeferenced maps.
Landmark shapes are simplified low-poly massing, not architectural reproductions.
Assigning a real building to a company is an identity cue for exploration; it is not a
claim about property ownership or occupancy.

### Delivered
All three cities ship. `src/domain/cities/` holds one module per city — tiers,
districts, landmarks, land and water polygons, roads, a `createPlots` function and
an opening camera — behind a shared `CityDefinition`. `src/three/CityTerrain.tsx`
and `src/three/CityLandmarks.tsx` render any data-described city; Tokyo keeps its
bespoke terrain, seasons and Fuji through the `bespokeTerrain` flag, so its
geography module remains the source of truth and nothing about it changed.
Buildings, signature architecture, traffic, labels and every analytical overlay are
shared across all three.

- **Universes.** `src/domain/indexes.ts` filters the seeded dataset per city. The
  headline index move is recomputed over the narrower universe, so the pulse,
  breadth track, search, lists and catalysts all describe the same companies as
  the skyline. Districts with no members in the active universe say so rather than
  reporting a change of +0.00%.
- **Volume massing.** `src/domain/massing.ts` maps market capitalisation to a
  footprint and a height on one compressed log scale. Where a dense New York street
  clips the footprint, the height is raised to preserve volume, capped at 1.7×.
- **Switching.** The header globe control picks the city; the choice persists in
  `localStorage` via `usePersistentValue`.
- **Company card.** Shows the subsector alongside the city's own band — Borough ·
  Manhattan, Zone · Zone 3, Town · Technology.

### Validation
`tests/cities.test.ts` asserts, for every city: each universe member is placed
exactly once, no two lots overlap, and the layout does not depend on the market
session. For New York it checks that the borough ranking really does follow the
seeded sector market-cap ordering (so the documented rule cannot drift) and that
every lot falls inside the borough polygon its neighbourhood belongs to. For London
it checks that a larger company never sits in a higher zone number than a smaller
one in the same sector, that each sector stays within its own wedge, and that lots
land inside the zone they claim — with the companies pinned to a real building
exempted, since they stand where that building really is. Browser checks cover the
picker, per-city rendering, persistence across a reload, search-to-zoom, and the
narrow-viewport header and popover layout.

### Revisions — London (owner follow-up)
1. **Empty zones removed.** Zones 8 and 9 held no companies in the seeded dataset,
   so the ring count is seven and the built radius drops from 170 to 138 units.
   `tests/cities.test.ts` fails if any declared zone ends up with no companies, so
   the model cannot quietly grow empty rings again.
2. **No zone separation.** The concentric ring roads are gone. Streets front each
   row of buildings, stop at the avenues either side, and each neighbourhood sits a
   little further in or out than its neighbours, so nothing lines up into a ring.
   Radial arterials still run out of the centre and break around any landmark that
   stands in for a company. A test asserts no road closes into a ring and none
   crosses a lot.
3. **Inland, not coastal.** `CityDefinition.surround` is `"land"` for London and
   `"sea"` for Tokyo and New York. The horizon beyond London's built-up area is open
   country in the city's own ground colour, set flush with the ground so no shoreline
   or step appears. The Thames still runs through it.
4. **Streets follow the buildings.** `CityDefinition.roads` is now a function of the
   placed lots, so a city draws no road network where it has not built. This also
   fixed a real bug from the first multi-city commit: traffic ran on Tokyo's street
   coordinates in every city. Vehicles now travel the active city's own carriageways.

### Landmark fidelity and label decluttering (owner follow-up)
Two complaints from the shipped multi-city build: too many floating landmark
names cluttering the skyline, and several landmarks not looking like the real
place they name. Both are fixed in `src/three/CityLandmarks.tsx`.

1. **Labels only where they carry information.** A landmark label is now shown
   only when the landmark identifies a sector (`landmark.sector` set) — the same
   role Tokyo's original sector landmarks always played. Every purely decorative
   landmark (Tower Bridge, Buckingham Palace, the London Eye, St Paul's, Central
   Park, the Statue of Liberty, and others) lost its label and now has to be
   recognizable from its shape alone.
2. **Bespoke shapes for the landmarks that need one.** A small id-keyed lookup,
   checked before the shared per-kind renderer, gives the most iconic buildings
   their own geometry instead of the generic template every other landmark of
   that kind uses: Tower Bridge (bascule towers with turrets) is now visually
   distinct from Brooklyn Bridge (Gothic suspension piers with fanned cables);
   the Gherkin tapers through five rings instead of standing as a plain cylinder;
   Canary Wharf gets its pyramidal roof; the Empire State Building, Chrysler
   Building and One World Trade Center each get their own real profile (setback
   tiers, a terraced sunburst crown, a chamfered tapering obelisk) instead of
   sharing one spire template; Battersea Power Station is a brick block with four
   chimneys, replacing a train-shed shape that was simply wrong for it; St Paul's,
   Greenwich Observatory and Tate Modern are each distinct from the O2's flat
   dome and from each other; Washington Square Arch is an actual arch rather than
   the placeholder museum block its data `kind` had defaulted it to; and the
   Statue of Liberty and Buckingham Palace — both the only landmark of their kind
   — were improved in place (a draped robe, raised torch and crown; a porticoed
   facade with columns, pediment and flag) rather than needing a bespoke
   override.
3. **Parks modelled on their real counterparts.** `PARK_STYLES` in the same file
   gives Hyde Park, Regent's Park, Central Park and Prospect Park each their own
   water body — the Serpentine, the Boating Lake, the Reservoir and the Lake on
   Central Park's long north-south strip, and Prospect Park Lake — sized and
   positioned as a fraction of that park's own footprint, plus a crossing pair of
   paths on every park. Prospect Park's trees cluster on one side (the Ravine)
   instead of bordering the lawn symmetrically like the royal parks, and Central
   Park is deliberately sparser (more open meadow, per the real park) rather than
   using the same tree density as the others.
4. **A real bug found and fixed along the way.** The Shard (`ticker: "AAPL"`) and
   Apple's own company building were both rendering at the exact same
   coordinates — an unrelated static landmark mesh directly overlapping the
   company's performance-coloured building. A landmark with a `ticker` now
   renders no mesh and no label at all: the company's own building already
   stands there and already carries the identity (Apple's logo sculpture) and
   the daily-change colour encoding a second shape would have duplicated or
   obscured.

### Full sector coverage in every city (owner follow-up)
The Nasdaq-100 city had no financials and no energy buildings at all, and its
districts were drowning in decorative low-rise blocks. Both traced back to the
same cause: Tokyo rendered only the 34 seeded companies that were Nasdaq-100
members, so two districts had nothing to place and the scenery generator filled
the 66 empty lots' worth of ground with filler.

1. **Roster extended to 133 companies.** 33 real Nasdaq-100 constituents were
   added, chosen so every sector has at least one member in the Nasdaq-100 city
   as well as the S&P 500 ones. Each addition is verified against the dated
   public GICS sector reference by `tests/radio-sector.test.ts`, which fails if a
   company is filed under the wrong sector. The Nasdaq-100 view goes from 34 to
   67 companies and no district is empty. Energy and materials stay at one
   company each because the real index genuinely carries about one of each —
   padding them with non-members would have been a fabrication.
2. **Tokyo scenery cut to a supporting role.** The low-rise grid went from
   3.8×3.9 spacing keeping 7 cells in 8, to 5.2×5.4 keeping 6 in 10 — 604 blocks
   down to 189 against 67 company buildings, so the buildings that carry market
   data read first and the blocks sit between them with visible gaps rather than
   forming a carpet.
3. **Two modelling faults the change exposed.** Tokyo's plots never set `tier`,
   so its company cards fell back to "Tokyo" instead of naming the sector town
   the way the zone and borough cities name theirs. And New York's borough
   assignment had drifted: adding utilities companies pushed that sector above
   materials, which broke the documented rule that the Bronx holds the smallest
   sector. Utilities moved to Sunset Park & Gowanus in Brooklyn and materials to
   Port Morris & Hunts Point in the Bronx, with Yankee Stadium and the Coney
   Island Wonder Wheel swapping which sector they identify so each landmark
   still stands in the borough it really stands in.
4. **London grew to eight zones**, since the larger roster fills one more ring.
5. **Counts are derived, not hard-coded.** The tests asserted `100` companies and
   `29` streets in four places, which would have to be edited by hand every time
   the roster grows. They now read `companySeeds.length` and `subsectors.length`,
   and a new test asserts that every city places buildings for every sector and
   that every lot names a tier its city declares.

### Orientation, breadth and budgets (owner follow-up)
The owner selected nine backlog proposals — UI/UX 1 and 3, Market visualisation 1
and 2, Features 2 and 3, and all three Optimisation items — and asked for them in
one pass. §75.11 of `MARKET_CITY.md` records each in full; the parts worth
carrying forward:

1. **Orientation is per city, and so is the tour.** A card states how *this* city
   is arranged and comes back for a city you have not seen, tracked in a set
   rather than a single "seen the intro" flag — switching city changes the rules
   of the map. The tour reuses the existing sector-flyto and advances only on a
   click, never a timer, so it cannot take the map away mid-thought.
2. **Breadth and mass are two layers because they are two facts.** A ribbon along
   each band's edge counts what share is advancing; a translucent column over each
   district measures that sector's share of index market cap. They disagree
   routinely, which is the point: a band of small companies mostly rising reads
   green while its column stays short.
3. **One `tierOutline` per city drives the ribbon in all three.** The contract is
   an explicit closed loop, because the renderer walks consecutive pairs. New
   York's borough shapes are stored open for polygon fill, so its `tierOutline`
   closes them — without that, every borough ribbon stopped one segment short.
   `tests/orientation.test.ts` asserts closure for every band of every city, and
   that is what caught it.
4. **A budget only constrains if it also has a ceiling and a floor.** Each city
   declares lots, landmarks, road segments and labels; the test checks the city is
   under its budget, the budget is under a shared ceiling, and the budget is not
   far above what the city actually draws. Without that last check a generous
   number would pass forever.
5. **Code-splitting exposed a dependency nothing else would have.** Tokyo's
   geometry kept loading eagerly because sector identities lived in the same
   module as its terrain. `sectorIdentities` moved to `src/domain/sectors.ts` and
   `geography.ts` now imports from it, inverting the edge. The split was verified
   by grepping the built chunks for city-specific markers, not by trusting the
   import syntax.
6. **Baked layouts key on structure, not price.** The cache signature is ticker,
   sector, subsector and market cap — never price or volume — so a quote refresh
   reuses the fixture and a roster change falls back to solving in the browser. A
   stale fixture is a slower boot, never a wrong city.
