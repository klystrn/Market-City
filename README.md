# Market City

An interactive architectural model of the U.S. stock market. Explore 133 representative companies across three cities that arrange the same market three different ways: **New York City** (five boroughs), **London** (market-cap zones) and **Tokyo** (sector towns and subsector streets). Search and filter the city, inspect company evidence and catalysts, pin a watchlist, compare companies side by side, and listen to the jazz and lofi radio library.

**Status:** Functional demo application with replaceable provider adapters. Demo prices, news, catalysts, index values, and historical charts are explicitly simulated. Live provider operation requires free account credentials; the repository does not contain credentials or real market snapshots.

## Run locally

Requires Node.js 22 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No environment file is needed for Demo Mode.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

The production build is a static Next.js export in `out/`. `preview` serves a root-path build. The lockfile pins the installed dependencies.

## Choose your city

The globe control in the header switches between three layouts of the same seeded dataset. The choice is stored in your browser and survives a reload.

| City | Universe | How it is arranged |
| --- | --- | --- |
| **New York City** (default) | S&P 500 | Five boroughs rank sectors by market capitalisation — Manhattan, Queens, Staten Island, Brooklyn, the Bronx — with neighbourhoods for sectors and streets for subsectors. Opens over the Hudson looking down Manhattan, with Queens and Brooklyn behind it. |
| **London** | S&P 500 | Market-cap zones out from a civic core (eight at the current roster size). Each sector is a wedge running through every zone; the larger the company, the lower its zone number. Ordinary streets front each row of buildings — there are no ring roads dividing one zone from the next — and the city sits on open green country, since London is inland. Subsector appears on the company card instead of in the layout. |
| **Tokyo** | Nasdaq-100 | The original layout: a sector town for each district and a subsector street inside it, with bay islands, an elevated rail loop and Mount Fuji behind the skyline. |

The first time you open a city, a short card says how that particular city is arranged and offers a **guided tour** — three or four stops that fly to a district and explain one encoding at each. The tour advances only when you click and ends on `Escape`; it never moves the camera on a timer. The card returns for a city you have not opened before, because switching city changes the rules of the map, and stays gone for one you have.

Each city also remembers **its own** map layers, season and last camera bookmark, rather than carrying one global setting between geographies. Only the active city's terrain and landmark data is downloaded; the other two load when you switch to them.

In the zone and borough cities, market capitalisation is encoded as the **total volume of built space** — land footprint and height together — rather than height alone, so a mega-cap reads as a large site as well as a tall one. Both axes use the same compressed log scale.

London was specified as nine zones. The city carries as many rings as the roster actually fills and no more, rather than leaving empty rings for the camera to cross; a test fails if any declared zone ends up empty, so the count is re-checked whenever companies are added.

Landmarks are simplified low-poly massing of real places: Central Park, One World Trade Center, the Brooklyn Bridge, Grand Central, the Statue of Liberty, Prospect Park, Citi Field and Yankee Stadium in New York; the Shard, Tower Bridge, the London Eye, Buckingham Palace, Canary Wharf, Battersea Power Station and the O2 in London. A handful of companies stand on the building associated with them — JPMorgan at 270 Park Avenue, Alphabet at St John's Terminal, Apple at the Shard. **This is an identity cue for exploration, not a claim about ownership, tenancy or headquarters location**, and the layouts are stylised interpretations at an illustrative scale, not georeferenced maps.

Only a landmark that identifies a sector carries a floating name label; every other landmark — the ones that are purely decorative, including every landmark standing in for a company — relies on its own shape to be recognizable, keeping the skyline legible rather than a wall of text. The most iconic buildings get a distinct silhouette rather than a shared per-kind template: Tower Bridge's bascule towers read differently from Brooklyn Bridge's Gothic suspension piers, the Gherkin tapers like the real building instead of standing as a plain cylinder, the Empire State and Chrysler Buildings carry their own Art Deco crowns, and Battersea Power Station is a brick block with four chimneys rather than a train shed. Real parks vary too — Hyde Park's Serpentine, Regent's Park's Boating Lake, Central Park's reservoir and lake on its long north-south strip, and Prospect Park's lake beside a wooded cluster — instead of one lawn-and-trees template repeated four times. A company pinned to a real building (only Apple/the Shard today) has no separate landmark mesh of its own: the company's building already stands there with its own performance-colour encoding, so a second unrelated shape would just overlap it.

The seeded 133 companies are an S&P 500-style development subset, not the full index. Every one of them is checked against a dated public GICS sector reference by `tests/radio-sector.test.ts`, so a company can never be filed under a sector it does not belong to. The Nasdaq-100 view renders only the seeded companies that belong to that index (67 of them), compiled from public index descriptions as a static fixture rather than a live constituent feed; NYSE-listed names such as JPM and XOM are absent from it by construction. The roster is chosen so that **every sector has at least one Nasdaq-100 member**, which is what keeps that city from showing empty districts — energy and materials stay small because the real index genuinely carries about one company in each, rather than being padded with companies that are not in it. The headline index move, breadth, search, lists and catalysts are all recomputed for whichever universe is showing.

## Explore

- Use **WASD or arrow keys** to pan across the ground, drag to orbit, and scroll to zoom. Keyboard movement follows the camera orientation and pauses while typing or interacting with form controls. Click a company building to open its quick drawer.
- Click a **sector label or town ground** to zoom into its district. Physical roadside signs appear at close zoom (17× and above), rather than floating over company names.
- The separate **Explore Company** card beneath the drawer focuses the company and reveals a historical chart. Double-clicking a building does the same. **City view** returns to the overview.
- `Ctrl/Cmd + K` focuses search. `Escape` or clicking outside dismisses floating cards. Clicking within the separate Explore card preserves the selected company; dragging the map does not dismiss company details.
- Try `NVDA`, `News for Apple`, `Show technology`, `software`, `Show semiconductors` (or `semi`), `memory`, `Show Big Tech`, `Magnificent Seven`, `Show stocks down more than 2%`, `Show unusual volume`, `Earnings this week`, `Show strongest sector`, or `What is moving today?`. Picking a company from search moves the camera to its building and opens the company view; `Big Tech` and `Magnificent Seven` are curated cross-sector groups, not index memberships.
- **Tools** in the bottom bar opens the watchlist, side-by-side comparison, saved camera views, the keyboard district directory and the Museum of Markets.
- **Demo session** changes the market scenario and session lighting, or enables simulated quote updates.
- **Layers & view** controls catalysts, traffic, reduced effects, and the accessible list view. Phones start in the list view; WebGL failure falls back to it. The list view names the active city and its market-cap band (boroughs, zones or towns).
- **Season**, inside Layers & view, defaults to the current Japanese calendar in JST: spring March–May, summer June–August, autumn September–November and winter December–February. Manual previews show cherry blossoms, lush summer foliage, autumn colors or bare winter branches and snowier mountains. These are illustrative environments, independent of market-driven weather; they do not claim current weather or blossom conditions.
- **MC Jazz** attempts to start automatically, with market broadcasts and news enabled. If the browser blocks sound, the first click or keypress starts playback. Pause stops music and speech. Your local jazz/lofi recordings play in sequence with a Next track control. Natural English voices are preferred where available, with a presenter selector and livelier pacing. Unsupported speech falls back to text.

## Tools, layers and saved state

Everything below is stored in your browser only. Nothing is uploaded, and no account is required.

- **Watchlist** — pin any company from its card (bookmark icon). Pinned companies persist in `localStorage` and open from Tools → Watchlist.
- **Compare** — add up to four companies from a card or the watchlist and read price, daily change, market cap, relative volume, volume, sector and data status in one table. Session-only.
- **Bookmarked views** — save the current camera focus (a company, a district or the overview) and jump back to it.
- **District directory** — every sector and subsector street as a keyboard-navigable list, for reaching any district without using the 3D map. `↑`/`↓` move, `Enter` selects.
- **Museum of Markets** — a curated timeline of real, well-documented U.S. financial history from Black Tuesday to the 2023 SVB failure. Click the museum building or open it from Tools. These are historical facts, kept explicitly separate from this app's simulated prices, and they are not a forecast.
- **Landmark index** — every real place in the active city with its role stated in words: standing in for a company, identifying a sector, or scenery only. From the map alone the three look similar, so the index is what keeps an identity cue from being read as a claim. Rows that carry a meaning are clickable and take you to that company or sector.
- **God scenarios** — save a named scenario locally, or copy a share link. Every God setting travels in the `?scenario=` parameter.

**Layers & view → Map details** adds four optional analytical layers on top of the existing scenery toggles:

- **Sector breadth gardens** — a small garden beside each sector's landmark, lusher when more of that sector's companies are advancing.
- **Supply-chain connections** — curated, illustrative relationships between seeded companies, drawn as arcs when a company is selected and listed as chips on its card. A simplified exploration layer, not a claim about current contracts.
- **Intraday performance trails** — a deterministic seeded path from the session open to the current price, drawn beside the selected company and the day's biggest movers. Illustrative session texture; this offline demo has no intraday feed.
- **Volatility halos** — a ground ring sized and coloured by trailing daily-return volatility over up to 60 sessions.
- **Zone & borough breadth** — a thin band along the edge of each market-cap band (a London ring, a New York borough shore, a Tokyo town boundary), coloured by the share of that band's companies advancing today. This is a count, not a weight: a band of small companies mostly rising reads green even though it carries little of the index.
- **Sector mass columns** — a translucent column over each district whose height tracks that sector's share of total index market capitalisation, so weight is legible from the overview. Breadth and mass disagree routinely, which is why they are separate layers.

**Adaptive graphics quality** (Layers & view, on by default) watches frame timing and trims device pixel ratio, then traffic and the optional layers, when the frame rate drops — restoring them once it recovers. Intraday-trail computation runs in a Web Worker so dragging the God session-minute slider never blocks input, with a synchronous fallback where Workers are unavailable.

## GitHub Pages

The repository is configured for `https://klystrn.github.io/Market-City/` through `.github/workflows/pages.yml`. This is a prepared target, not a claim that deployment has occurred.

1. Push the validated source to the existing repository's `main` branch.
2. In **Settings → Pages**, choose **GitHub Actions** as the build source.
3. Run **Build and deploy Market City**, or push a change to `main`.

The workflow checks lint/types/tests, exports with `NEXT_PUBLIC_BASE_PATH=/Market-City`, and deploys `out/`. No paid hosting or server is required for the demo. No custom domain or changes to the existing portfolio have been made.

For the later `reginaldtan.com/MarketCity` integration, build with `NEXT_PUBLIC_BASE_PATH=/MarketCity` and mount the exported directory at that path in the portfolio's existing host. A path is not a separate DNS record. The correct deployment method depends on that site's current hosting setup.

## Optional financial data

Credentials are read only by `scripts/refresh-data.ts` in Node or GitHub Actions. The browser only fetches the public, normalized `data/market.json` snapshot. Do **not** put secrets in `NEXT_PUBLIC_*` variables.

- **Marketaux:** `MARKETAUX_API_TOKEN`. One market-wide request per refresh, ticker/entity matching, significance scoring, deduplication, and up to seven days of cached headlines. No article bodies are republished.
- **Alpha Vantage:** `ALPHA_VANTAGE_API_KEY`. Company overview plus daily history; derives daily change and volume relative to the prior 20 sessions. Seven rotating companies per daily run (up to 14 requests). Missing companies remain clearly labeled demo; no synthetic figures are relabeled as EOD.
- `INITIAL_OWNER_EMAIL` is reserved server-side configuration for future accounts. Guest access is available now; Google sign-in is intentionally deferred.

Add keys as repository **Actions secrets** to enable **Refresh shared market snapshot**. It runs hourly when credentials exist and skips entirely when none exist. Quote refresh runs in the 22:00 UTC weekday window; a manual run can explicitly request it. Avoid repeated manual quote runs that would consume the daily free allowance.

For local refreshes, export environment variables or create a gitignored `.env.local` and run:

```sh
node --env-file=.env.local --import tsx scripts/refresh-data.ts
```

Set `REFRESH_QUOTES=true` to request quotes outside the daily window. The refresh workflow preserves the last JSON snapshot in an Actions cache and deploys the regenerated static output without committing provider data. Failed calls retain previous values with warnings and original per-item timestamps.

### Current coverage limits

- No accounts have been created and no paid service has been added.
- Provider adapters are verified against controlled response fixtures; live credentials are still needed for an end-to-end provider test.
- Marketaux's published free plan allows **100 requests/day and 3 articles/request**. This is limited coverage, not comprehensive news for every company.
- Alpha Vantage's standard free allowance is **25 requests/day**. Rotating seven companies cannot deliver fresh daily quotes for the whole roster. Each company displays its source, status, and quote timestamp.
- S&P 500 and VIX inputs remain demo data until a suitable index provider is connected. Mixed snapshots retain that explicit labeling. Company explanations never treat fictional news as evidence for real quotes, or use news published after an EOD quote to explain that earlier move.
- GitHub Pages is static; Actions schedules are best-effort. The initial hourly snapshot path does not promise five-minute news. A future shared server/cache can provide the specification's target cadence without changing the UI or domain model.

Verified references: [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Marketaux pricing](https://www.marketaux.com/pricing), [Marketaux API](https://www.marketaux.com/documentation), [Alpha Vantage API](https://www.alphavantage.co/documentation/), [Alpha Vantage free allowance](https://www.alphavantage.co/premium/).

## Structure

```text
src/app/           Static application shell and shared visual tokens
src/components/    DOM controls, company details, charts, radio and list fallback
src/three/         Instanced geometry, camera, districts, labels and traffic
src/domain/        Normalized types, layout, encodings and evidence calculations
src/domain/cities/ One module per city: tiers, districts, landmarks, roads, plots
src/data/          Deterministic, labeled development fixtures
src/data/layouts/  Generated plot fixtures — run `npm run bake:layouts` to rebuild
src/services/      Commands, replaceable providers, validation, audio and bulletins
scripts/           Credential-bearing refresh execution (never browser code)
tests/             Domain, layout, city and provider contract checks
```

Buildings use twelve procedural massing variations, including faceted oval towers, twin towers with skybridges, Art Deco crowns, terraced towers, courtyard campuses and colonnades. Four-sided window grids, cornices, entrances, roof equipment and parapets remain visible when orbiting. Lot sizes and heights use compressed market capitalization.

Sixteen companies — at least one in every sector — have recognizable signature architecture: Apple, Microsoft, Amazon, Alphabet, Meta, NVIDIA, Tesla and Netflix, joined by JPMorgan (financials), Eli Lilly (healthcare), Caterpillar (industrials), Walmart (staples), Exxon Mobil (energy), NextEra (utilities), Linde (materials) and Prologis (real estate). Details include sculptures, atriums, canopies, terraces, skybridges, chip crowns, chargers, cinema marquees, a four-sided diagonal exoskeleton on corner supercolumns, a rooftop wind turbine, a refinery flare and a warehouse sawtooth roof. Each has a curated base massing so its accents sit on a flat facade. Brand elements are identity cues; they do not encode additional financial metrics and are not architectural reproductions.

Low-rise blocks, trees, mountains and civic landmarks are decorative scenery. Energy's symbolic nuclear campus, the industrial container port and the real-estate marina stand on distinct islands; mainland sectors have their own identifying landmarks. These thematic landmarks do not represent company-owned facilities. More vibrant water, foliage, roofs and civic accents follow the owner's revised direction, while company gains remain green and losses red.

Each city declares a geometry budget — lots, landmarks, road segments and labels — that a test enforces from both sides: no city may exceed its budget, and no budget may sit far above what its city actually draws, so a generous number cannot be used to wave a regression through. Only the active city's geometry is downloaded; the rest load on switch. Plot placement is baked to a JSON fixture at build time and keyed on the roster's structure (ticker, sector, subsector, market cap) rather than on prices, so refreshing quotes reuses the fixture and a roster change falls back to solving in the browser — a stale fixture costs a slower boot, never a wrong city.

Geometry is shared and instanced, including roads, crossings, trees and low-poly traffic. Vehicle count is capped at 240. Market updates change color buffers separately from structural matrices. Labels are culled by zoom; hidden tabs pause rendering; traffic stops after 30 seconds of inactivity. Reduced effects removes traffic and motion. Rendering uses a bounded device pixel ratio and no full-city real-time shadows.

Subsectors are a curated exploration taxonomy, not official GICS sub-industry classifications. Streets group related companies, including a dedicated Memory Lane for Micron. Each city interprets its real geography at an illustrative scale and none is a georeferenced map: Tokyo's mainland, river and bay arrangement; London's zones, radial avenues and the Thames; New York's five boroughs, Manhattan grid and river crossings. Fuji uses a triangulated cone with a small crater and elevation-based seasonal snow, on continuous inland terrain.

Environment references: [Tokyo geography](https://www.gotokyo.org/en/plan/tokyo-outline/index.html), [Japan's seasons](https://www.japan.travel/en/gc/when-to-go/), and [Fuji-Hakone-Izu National Park](https://www.japan.travel/national-parks/parks/fuji-hakone-izu/explore/).

The authoritative product brief is [MARKET_CITY.md](MARKET_CITY.md); accepted scope and development status are in [BUILD_PLAN.md](BUILD_PLAN.md). Full live S&P 500 constituent coverage, historical replay, authentication, trading, and paid AI remain outside this phase.

### God simulation
Open **God → Simulation** at the upper right. This permanent, offline feature replaces the old Demo Mode controls. It starts collapsed and never modifies a shared provider snapshot. Every simulated quote remains marked as simulated/demo in provenance.

Set daily company targets (overriding sector targets), sector targets, the independent index, relative volume, VIX and a simulated ET clock. Presets include panic selling and a relief rally. Announcements create fictional news/catalysts and enable catalyst beacons; their price impact is set separately. Reset clears overrides and injected events. Settings last for the current page session.

Fire marks a stock below −10%. Entering an index decline of at least 5% triggers a brief earthquake. Reduced effects suppresses animation; the God effects switch removes these metaphors.

The tomorrow laboratory uses a [random-walk benchmark](https://otexts.com/fpp3/simple-methods.html): next price equals the current price. Downside/upside scenarios apply ±1.96 standard deviations of up to 60 trailing log returns. A 0.5% volatility floor prevents degenerate ranges. These are **uncalibrated illustrations based on synthetic history**, not reliable confidence intervals or event predictions. The index stress separately uses VIX / √252; all stocks share the chosen stress direction, without a fitted correlation model. Back to today restores the current scenario. Dates skip weekends, but do not account for exchange holidays. Longer horizons and validation on real out-of-sample data remain future work.

Civic additions take architectural cues from Paris (museum courtyard/pyramid), NYC (formal public park), Singapore (conservatories), and London (covered rail station). They are original stylized scenery, not geographic replicas. Station platform lights reflect average relative trading volume. Parks and conservatories remain seasonal public space; a market-history museum and optional breadth gardens are future educational ideas.

### Map details and city identity
**Layers & view → Map details** offers independent feature tiles for parks, district landmarks, transit, trees, city blocks, Mount Fuji, labels, road signs, brand details and market shocks. Hiding scenery does not remove stock data or change market statistics. The compact **Read the city** guide replaces the opening headline; expand it to see the encodings and controls.

Central Commons Park is a full 50×40-unit block with lawns, a lake, fountain and amphitheater steps. Fuji has no trees, and the surrounding tree distribution is sparse and deterministic. The farm, shopping arcade, exchange promenade and technology sculpture give sectors distinct civic identities. A SpaceX exhibit occupies the industrial island as scenery with **no quote**; it is not an invented member of the 100-stock dataset.

Glass shafts, tapered spires and twisting towers join the existing courtyard, terraced, twin-tower and Art Deco forms. Colored podiums, crowns and tinted glass preserve the daily-performance encoding. Keyboard panning is now about 2.4× faster than the preceding version.

### Music folders and sector reference
Put audio inside `music/jazz/`, `music/lofi/`, `music/classical/`, or `music/technopop/`; nested folders are supported. `npm run dev` and `npm run build` synchronize the library automatically. To refresh an already-running preview, run `npm run music:sync`. Supported extensions are mp3, m4a, ogg, wav and aac. Generated public/music files are ignored by Git; the source recordings stay in music/. Tracks stream individually instead of loading the entire library into memory.

Jazz starts with broadcasts and news enabled. Browser autoplay policy may require the first interaction. News headlines are deduplicated and read at 90-second intervals while playing and visible; God headlines are expressly fictional. Pause stops both music and speech. The presenter prefers available natural/neural English voices, then supported alternatives; this preview currently exposes Microsoft Zira as the selected fallback. Rate/pitch and friendlier scripts make delivery livelier without claiming a neural voice when none is installed.

All 100 company assignments matched the [public sector reference](https://github.com/datasets/s-and-p-500-companies/blob/main/data/constituents.csv) checked on 2026-09-08. The reference originates from the Wikipedia constituent table and can lag official changes. Alphabet and Meta's Communication Services placement is also supported by [S&P's GICS revision](https://www.spglobal.com/spdji/en/documents/indexnews/announcements/20180111-646149/646149_gicspressreleasejan2018.pdf) and [State Street's Communication Services ETF](https://www.ssga.com/us/en/individual/etfs/state-street-communication-services-select-sector-spdr-etf-xlc). `npx tsx scripts/audit-sectors.ts [path-to-updated-csv]` regenerates the dated audit; update its review date when refreshing. Sector classifications are separate from our curated subsector street names.
