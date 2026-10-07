# Market City — Product & Build Specification

> **Purpose:** Astra-ready build brief for a portfolio-grade FinTech + Business Analytics web application.  
> **Project name:** Market City  
> **Repository:** Use the existing local GitHub repository named `Market City`. Do not create a new repository.  
> **Primary goal:** Make the stock market fun and intuitive to explore without sacrificing analytical usefulness.

---

# 1. Product Vision

Market City is an interactive 3D visualization of the U.S. stock market where companies are represented as buildings inside a living city.

The application should help a user answer two questions quickly:

1. **What is happening in the market?**
2. **Why is it happening?**

The product is primarily a portfolio project designed to impress viewers through a strong combination of:

- FinTech
- Business Analytics
- data visualization
- market intelligence
- modern UI/UX
- Three.js engineering
- performance-conscious web architecture

The product should feel **fun, intuitive, polished and credible**, not like a futuristic sci-fi dashboard and not like a Bloomberg clone.

The intended first impression is:

> “That is an incredibly cool way to visualize stocks.”

The intended second impression is:

> “This actually helps me understand what is happening in the market.”

---

# 2. Core Product Principles

## 2.1 City first

The 3D city is the main interface, not a decorative background.

The city should occupy roughly **70% of the usable desktop viewport**.

Supporting controls should remain compact.

---

## 2.2 Progressive disclosure

Do not show every metric immediately.

The initial experience should be visually simple.

Information should reveal progressively through:

1. overview
2. hover
3. click
4. quick drawer
5. company deep dive
6. optional analytical layers

Avoid permanent information overload.

---

## 2.3 Lightweight by design

Market City should **look visually rich while remaining inexpensive to render**.

Avoid effects or systems that consume significant GPU/CPU resources without providing clear analytical value.

---

## 2.4 Data before interpretation

Market City should calculate and present structured market evidence directly.

Do not rely on a paid AI API for core product functionality.

Prices, percentage changes, market cap, volume, earnings dates, news, analyst metrics and other financial facts must come from trusted data sources.

---

## 2.5 Every visual encoding must mean something

Do not add visual elements simply because they look cool.

The city metaphor must communicate financial information.

---

# 3. Target Audience

Primary users:

- retail investors
- finance students
- business analytics students
- FinTech enthusiasts
- portfolio visitors and recruiters

The project is primarily intended to demonstrate technical and product ability rather than become a professional trading terminal.

It is **not** a brokerage platform and does not execute trades.

---

# 4. Market Universe

## Initial architecture

Architect the application for the **S&P 500**.

During development, start with approximately **100 representative companies** until 3D performance and interaction quality are stable.

Once performance is verified, enable the full S&P 500 constituent set.

This approach should avoid premature optimization while ensuring the final architecture is designed for ~500 active buildings.

---

# 5. The Market City Metaphor

## 5.1 Companies = buildings

Each S&P 500 company owns a permanent plot inside its sector neighborhood.

Company buildings should be algorithmically generated low-poly architectural models.

Do not attempt to recreate real company headquarters in MVP.

Do not use futuristic sci-fi skyscrapers.

The buildings should resemble a clean architectural model or physical city-planning model.

---

## 5.2 Sectors = neighborhoods

Each GICS sector occupies a permanent neighborhood.

Examples:

- Information Technology
- Financials
- Healthcare
- Consumer Discretionary
- Communication Services
- Industrials
- Consumer Staples
- Energy
- Utilities
- Materials
- Real Estate

Sector neighborhoods should retain stable geography so users develop spatial familiarity.

However, neighborhood **area and density should gradually adjust with total sector market capitalization**.

Example:

If Technology represents approximately 30% of S&P 500 market capitalization, its neighborhood should occupy approximately 30% of usable company-city area, subject to layout constraints.

The district remains in the same general geographic location even as it expands or contracts.

---

# 6. Building Data Encodings

Keep the default visualization simple.

## 6.1 Footprint

**Building footprint = company market capitalization**

Use a logarithmic or similarly compressed scale.

Mega-cap companies must be visibly larger without making smaller S&P 500 companies unreadably tiny.

---

## 6.2 Height

**Building height = market capitalization / economic importance**

Height should remain relatively stable.

Do not make height represent daily percentage movement in the default view, because the entire skyline would change too aggressively every trading day.

Height should use a normalized/logarithmic mapping.

---

## 6.3 Building color

**Building color = daily stock performance**

Use standard financial semantics:

- green = positive
- red = negative
- neutral material tone = approximately flat

Color intensity should represent magnitude.

Do not make small moves visually dramatic.

---

## 6.4 Building plot permanence

Companies should retain the same plot whenever practical.

If NVIDIA becomes larger than Apple, NVIDIA's existing plot should expand rather than teleport to another part of the Technology neighborhood.

Spatial memory is important.

---

## 6.5 Gradual building growth

As market capitalization changes over time, buildings should gradually grow or shrink.

This should be subtle during ordinary live use.

It becomes much more visible during historical replay.

---

# 7. City Traffic

Traffic is one of the few persistent secondary city layers.

## Meaning

**Traffic intensity = relative trading volume**

Prefer:

`current trading volume / normal or rolling average volume`

rather than raw volume.

This prevents highly traded mega-caps from always appearing busy.

---

## Visual implementation

Traffic does not need realistic cars.

Prefer:

- lightweight particles
- small low-poly vehicles
- moving light points
- sparse directional flow

The system should communicate:

- normal activity
- elevated activity
- unusual activity

Do not simulate thousands of vehicles.

Use a hard particle/vehicle budget.

Traffic should be easy to disable.

---

# 8. Roads

Roads should mostly exist to give neighborhoods visual structure.

Do **not** permanently encode dozens of financial relationships into the road system.

Analytical relationships should appear contextually.

Examples:

### Company selection

Selecting NVIDIA may reveal relevant relationships such as:

- sector peers
- important competitors
- supply-chain relationships

### Correlation Mode

A future analytical mode can reveal correlation routes.

Relationships should never create an unreadable web of lines across the city.

---

# 9. Market Environment & Weather

Weather should communicate market conditions without becoming theatrical.

The environment should remain **noticeable but professional**.

---

## 9.1 UI theme

The broad application theme is determined primarily by the S&P 500's daily direction.

### S&P 500 above previous close

Use a light interface.

Suggested feel:

- warm off-white
- light gray
- restrained green market accents
- brighter architectural city

### S&P 500 below previous close

Use a dark charcoal interface.

Do not use true black.

Suggested feel:

- charcoal
- deep neutral gray
- restrained red market accents
- dimmer city environment

Avoid abrupt theme flashing near exactly 0.00%.

Use a small deadband/hysteresis or transition smoothing around the previous close.

---

## 9.2 Weather

Weather should use a combination of:

- VIX / volatility
- market breadth
- major catalyst conditions
- news sentiment
- news uncertainty
- event magnitude

Examples:

### Healthy bullish session

- bright environment
- low cloud
- high visibility
- light UI

### Index slightly positive but narrow breadth / elevated volatility

- light UI
- partial cloud / haze

### Broad risk-off session

- charcoal UI
- overcast environment
- slightly reduced visibility

### Major event

- localized environmental change around the affected company or sector

Avoid simplistic rules such as:

> stock down = rain

---

## 9.3 Localized weather

Localized environmental effects may represent significant company/sector news.

Use a combination of:

- sentiment
- information uncertainty
- news volume
- catalyst magnitude

Possible subtle effects:

- clearer lighting
- local cloud shadow
- light haze
- localized fog
- restrained storm cue for exceptional events

Do not use exaggerated lightning, explosions or disaster visuals.

---

# 10. Catalyst/Event Beacons

Major events should be discoverable without opening a permanent news dashboard.

Companies with significant current events may show a subtle event indicator.

Examples:

- earnings report
- earnings upcoming soon
- CEO change
- major acquisition
- regulatory decision
- major analyst action
- significant product announcement
- major lawsuit
- material guidance revision

Clicking or hovering the indicator should expose the event.

Low-importance events should not create beacons.

---

# 11. Day / Night & Market Session

The city can reflect the U.S. trading session.

Suggested environmental states:

- pre-market → early morning
- market open → morning/day
- regular session → daylight
- closing hour → later-day lighting
- after-hours → evening
- market closed → night / calm state

Do not let this conflict confusingly with bullish/bearish light/dark UI theme.

Treat market-session lighting as the **3D environmental state** and market direction as the **UI material/theme state**.

---

# 12. Default UI Layout

The interface should immediately launch into Market City after an initial loading sequence.

Do not create a marketing landing page for v1.

The initial desktop layout should remain visually simple.

Conceptual arrangement:

```text
┌─────────────────────────────────────────────────────────────┐
│ Market City                 Market status         Profile   │
│                                                             │
│              ┌─────────────────────────────┐                │
│              │   Search / command Market City              │
│              └─────────────────────────────┘                │
│                                                             │
│                                                             │
│                      3D MARKET CITY                         │
│                                                             │
│        Technology                     Healthcare            │
│                                                             │
│          ████                            ███                 │
│      ██████████                      ███████                │
│                                                             │
│     Financials                      Industrials             │
│                                                             │
│                                                             │
│  ♫ MC Radio                                Layers / View    │
└─────────────────────────────────────────────────────────────┘
```

Do not permanently surround the city with many cards.

---

# 13. UI Visual Direction

## Overall vibe

Mix:

- **premium minimal**
- **editorial finance**

Avoid:

- cyberpunk
- neon sci-fi
- overly dense command-center dashboards
- generic SaaS card walls
- obvious AI-generated futuristic styling

---

## 13.1 3D materials

The city should use:

- low-poly architecture
- simple geometric massing
- mostly matte materials
- restrained palette
- simple windows/details
- clean urban planning model feel

Potential inspiration:

- architectural massing models
- low-poly urban visualization
- planning / mapping software

---

## 13.2 2D UI

Use a modern Apple-inspired liquid-glass feel.

The UI may use:

- translucent panels
- light background blur
- slightly opaque surfaces
- subtle borders
- subtle shadow/elevation
- restrained rounded corners
- strong typography
- generous spacing
- lightweight motion

Do not make every surface transparent.

Readability always takes priority over glass effects.

---

## 13.3 Typography

Use modern, neutral typography.

Numerical values may use a monospace or tabular-number style where useful.

The interface should feel premium, not game-like.

---

# 14. Progressive Disclosure Model

## Level 0 — City overview

Show only:

- city
- market direction/status
- sector names
- command/search bar
- MC Radio control
- compact layers/view control
- profile/account control

Optional tiny supporting indicator:

- S&P 500 daily %
- market open/closed status

Do not show full dashboards by default.

---

## Level 1 — Hover

Hovering a company should show a minimal floating tooltip:

```text
NVDA
NVIDIA Corporation
$XXX.XX
+4.2%
```

Optional:

- market cap
- relative volume icon

No large panel.

---

## Level 2 — Click / Quick Drawer

Clicking a company opens a compact liquid-glass drawer.

Prioritize:

1. Why It's Moving
2. news
3. catalysts
4. current price / daily movement
5. relative sector/index performance

Example:

```text
NVIDIA

$XXX.XX        +4.2%

WHY IT'S MOVING
• Outperforming Technology sector
• Relative volume: 2.4× normal
• 3 significant recent stories
• Earnings in 8 days

LATEST CATALYST
Q3 earnings — 8 days

NEWS
3 significant stories →

[ Explore NVIDIA ]
```

The city must remain visible.

---

## Level 3 — Company Deep Dive

Clicking **Explore** should:

1. smoothly move camera toward the selected company
2. de-emphasize surrounding city
3. keep the selected low-poly building central
4. reveal clean liquid-glass information panels around it

Possible layout:

```text
                   CATALYSTS
                       │

       NEWS ─────── NVIDIA ─────── PERFORMANCE
                       │

                WHY IT'S MOVING
```

Use 2D DOM/CSS panels positioned around the 3D view rather than rendering large amounts of text inside WebGL.

The user must always have a clear way to return to City View.

---

# 15. Company Information Priority

Rank company information in this order:

1. **Why It's Moving**
2. **News**
3. **Catalysts**
4. Current price and daily performance
5. Relative sector/index performance
6. Historical price chart
7. Earnings
8. Analyst expectations / targets
9. Key fundamentals
10. Valuation
11. Volume / volatility
12. Technical indicators

Market City is an intelligence/exploration product.

Do not turn it into a TradingView clone.

---

# 16. Persistent Command Bar

Keep a persistent pill-shaped command/search bar centered above the city.

This does **not** require a paid AI API.

Example:

```text
┌──────────────────────────────────────────────┐
│   Search or ask Market City...            ↑ │
└──────────────────────────────────────────────┘
```

Supported commands can be parsed deterministically.

Examples:

- Show technology
- Show stocks down more than 2%
- Show unusual volume
- Earnings this week
- Show NVDA
- News for Apple
- What is moving today?
- Show strongest sector
- Show companies with major catalysts

---

# 17. Command Bar Should Control the City

Command results should not only return text.

Where appropriate, commands should trigger visual actions.

Example:

> Show companies with earnings this week.

Possible behavior:

1. activate Catalyst View
2. highlight matching companies
3. dim irrelevant companies
4. adjust camera framing
5. show a concise structured answer

Example:

> Show technology.

Possible behavior:

1. focus Technology neighborhood
2. highlight sector leaders/laggards
3. show small sector summary

---

# 18. Command Parsing Architecture

Use a lightweight intent parser.

Concept:

```text
User command
    ↓
Normalize input
    ↓
Intent parser
    ↓
Structured filters/actions
    ↓
Market City state
    ↓
Camera / highlighting / panel response
```

Supported intents may include:

- focus sector
- focus company
- filter by move
- filter by volume
- filter by catalyst
- filter by earnings
- show news
- show market movers
- show market summary

Use clear deterministic parsing first.

A future AI adapter may be added later, but MVP must not depend on it.

---

# 19. Why It's Moving Engine

The MVP should not require an LLM.

Create a deterministic evidence-based explanation engine.

The engine should combine:

- company price movement
- sector movement
- S&P 500 movement
- relative performance
- relative volume
- recent live news
- known catalysts
- earnings proximity
- analyst actions if available

Example:

```text
WHY IT'S MOVING

NVDA +4.2%

Likely drivers
• Outperforming Technology by 2.7%
• Relative volume is 2.4× normal
• 4 significant NVIDIA-related stories detected
• Semiconductor peers are broadly higher
• Earnings are scheduled in 8 days

Market context
S&P 500: +0.6%
Technology: +1.5%

Confidence: Moderate
```

---

# 20. Explanation Confidence

Confidence should be calculated from evidence quality.

Possible factors:

- number of relevant recent stories
- recency of news
- consistency of news sentiment
- sector co-movement
- relative volume
- presence of known catalyst
- magnitude of price reaction

Example confidence levels:

- High
- Moderate
- Low

Never claim certainty where evidence is weak.

---

# 21. Data Architecture

The visualization layer must never depend directly on one external API.

Use a normalized backend/provider architecture.

Conceptual model:

```text
External Providers
       │
       ▼
Provider Adapters
       │
       ▼
Normalization Layer
       │
       ├── Quotes / Market State
       ├── Fundamentals
       ├── Historical Prices
       ├── Live News
       ├── Earnings / Catalysts
       └── Index / Sector Data
       │
       ▼
Market City Domain Models
       │
       ├── 3D City
       ├── UI
       ├── Why It's Moving Engine
       ├── Command Parser
       └── Radio Event Engine
```

---

# 22. Cost Philosophy

The deployed MVP should be capable of running at **approximately $0/month beyond existing development subscriptions**, subject to provider free-tier limits.

Do not make core functionality depend on:

- paid AI APIs
- paid TTS APIs
- expensive real-time market data
- paid music services

Use free tiers, local/demo data and browser capabilities where practical.

---

# 23. Market Price Data Strategy

Real-time stock price data is **not required for MVP** if it creates significant recurring cost.

Preferred order:

1. free end-of-day or delayed data
2. free limited snapshots where available
3. Demo Mode for active movement demonstrations
4. paid real-time provider only as a future optional upgrade

The architecture must remain compatible with real-time data providers later.

The UI must clearly display:

- last updated timestamp
- live/delayed/EOD/demo status

Never label stale or delayed market data as live.

---

# 24. Live News Is High Priority

Unlike price data, **news should be refreshed as quickly as reasonably possible within a free-tier architecture**.

Live/fresh news is a key Market City feature.

The system should:

- fetch latest market/company news centrally
- cache results server-side
- associate stories with S&P 500 tickers/entities
- prioritize major stories
- avoid each client making its own provider calls

---

# 25. Recommended Live News Provider

Strong initial candidate:

**Marketaux**

Use it behind a `NewsProvider` abstraction.

Desired fields:

- headline
- source
- publication timestamp
- article URL
- related entities/tickers
- sentiment if available
- relevance score if available

The app should remain provider-agnostic.

---

# 26. News Polling Strategy

Do not poll all 500 companies individually.

Prefer a centralized latest-market-news pull and entity matching.

During regular U.S. market hours:

- target approximately every **5 minutes** if free-tier limits support it

Outside market hours:

- poll less frequently
- for example every 30–60 minutes
- or pause if unnecessary

All deployed users should read from the same server-side cached result.

Do not allow each browser session to consume news API quota independently.

---

# 27. News Freshness UI

News cards should display:

- source
- publication time
- relative age
- last news refresh time when useful

Example:

```text
Reuters
2 min ago
```

If price data is EOD/delayed while news is fresh, show them separately.

Example:

```text
NEWS
Updated 2 min ago

MARKET PRICE
Previous close
```

Do not imply identical freshness.

---

# 28. News Importance Engine

Not every article should affect the city.

Create importance scoring using inputs such as:

- company market cap
- index weight
- recency
- relevance
- event type
- number of corroborating sources
- sector impact
- market-wide impact
- provider sentiment

Low-impact stories:

- appear in company news only

Medium-impact stories:

- may create a visual beacon

High-impact stories:

- may affect local weather
- may enter radio bulletin queue

---

# 29. Fundamentals / Company Information

Use a separate provider if necessary.

Create a `FundamentalsProvider` abstraction.

Potential data:

- company profile
- sector
- industry
- market cap
- P/E
- forward P/E
- EPS
- revenue growth
- analyst targets
- earnings dates
- 52-week high/low

Do not tightly couple the UI to a provider's raw schema.

---

# 30. Domain Model

Create normalized application types.

Example:

```ts
interface CompanyMarketState {
  ticker: string
  name: string
  sector: string
  industry?: string

  price: number
  previousClose: number
  change: number
  changePercent: number

  marketCap: number

  volume?: number
  averageVolume?: number
  relativeVolume?: number

  updatedAt: string
  dataStatus: 'live' | 'delayed' | 'eod' | 'demo'
}
```

Additional normalized types should exist for:

- sector state
- market state
- historical prices
- company fundamentals
- news
- catalysts
- market intelligence
- city layout data
- radio bulletins
- command intents

---

# 31. Derived Analytics

Calculate derived metrics in Market City's backend/domain layer where practical.

Examples:

- relative volume
- sector weighted performance
- market breadth
- index contribution estimates
- unusual movement
- catalyst importance
- news importance
- environmental state
- explanation confidence

Do not outsource these calculations to an LLM.

---

# 32. Demo Mode

Market City must include a reliable Demo Mode.

Demo Mode should use seeded realistic data for approximately 100 companies initially.

Demo Mode must support:

- city rendering
- sectors
- simulated price movement
- market cap
- relative volume
- news
- catalysts
- Why It's Moving explanations
- radio bulletins
- light/dark market themes
- weather state

Clearly label simulated/demo data.

The portfolio must remain usable if APIs fail or rate limits are reached.

---

# 33. Market City Radio

Market City Radio is an optional ambient audio feature.

It should make the city feel alive without adding another permanent visual dashboard.

Radio should be **off by default** until the user chooses to start it.

---

## 33.1 Radio UI

Collapsed:

```text
♫ MC Radio
```

Expanded:

```text
MC RADIO

Late Night Jazz
Now Playing: [Track / Stream]

──────────────
◀   ❚❚   ▶   🔊
```

Use a small liquid-glass floating player.

Suggested location:

bottom-left or another non-obstructive area.

---

## 33.2 Stations

Keep the initial station count small.

Suggested:

### MC Jazz

- soft jazz
- city / finance ambience
- default personality

### MC Lo-Fi

- instrumental beats
- background browsing / studying

### MC Ambient

- unobtrusive instrumental audio

### Market News

- lower-music / bulletin-oriented station

Do not build dozens of stations.

---

# 34. Radio Music Sources

Use a provider abstraction.

Example:

```ts
interface RadioMusicProvider {
  play(): Promise<void>
  pause(): void
  setVolume(value: number): void
  getMetadata(): TrackMetadata | null
}
```

Potential provider types:

- embedded YouTube player
- hosted/licensed audio
- curated copyright-safe playlist
- future streaming provider

Requirements:

- verify licensing
- verify embedding permission
- do not depend permanently on one livestream
- provide fallback behavior
- never autoplay unexpectedly

---

# 35. Market City Broadcaster

The radio can interrupt music with short generated market bulletins.

The MVP does **not** need an AI API.

Use structured templates.

Music should duck smoothly while the announcement plays, then return.

Examples:

### Market open

> Good morning, Market City. U.S. markets are now open for trading.

### Market close

> The closing bell has rung. The S&P 500 finished higher, with Technology leading the session.

### Major news

> Market City update. NVIDIA is in focus after a significant company announcement.

### IPO

> A new company begins trading today. [Company] has listed under ticker [TICKER].

### Macro event

> Market City update. New U.S. inflation data has been released and equity markets are reacting.

Do not announce every minor event.

---

# 36. Radio Bulletin Templates

Create reusable templates.

Example inputs:

```ts
{
  type: 'MARKET_CLOSE',
  sp500Change: 0.82,
  bestSector: 'Technology',
  worstSector: 'Energy'
}
```

Possible output:

> The closing bell has rung. The S&P 500 finished 0.82% higher, with Technology leading the session while Energy lagged.

This does not require an LLM.

---

# 37. Text-to-Speech

Use free/local browser capabilities first.

Preferred MVP approach:

**Web Speech API / browser speech synthesis**, where supported.

Create a `TTSProvider` abstraction so a higher-quality provider can be added later if desired.

Requirements:

- no paid TTS dependency for MVP
- short scripts
- clear voice
- graceful fallback if browser speech is unavailable

---

# 38. Radio Bulletin Engine

Use structured event scoring.

Concept:

```text
Market Event
     │
     ▼
Importance Scoring
     │
     ├── Low     → ignore
     ├── Medium  → visual notification
     └── High    → radio bulletin
                      │
                      ▼
                 Template script
                      │
                      ▼
                 Browser TTS
                      │
                      ▼
              music ducks / bulletin
```

No AI decision-maker is required.

---

## 38.1 Bulletin preferences

Suggested user settings:

```text
Broadcasts

○ Important only
○ Opening & closing only
○ More frequent updates
○ Off
```

Default:

**Important only**

---

# 39. Loading Experience

The site should launch directly into Market City after a short branded loading sequence.

Suggested screen:

```text
MARKET CITY

Building today's market...

████████████████░░░

Loading market data
Mapping sectors
Preparing buildings
Starting city systems
```

A faint low-poly city may progressively assemble in the background.

When loading is complete:

- smoothly transition into the city
- settle camera into the default isometric view

Avoid long unnecessary cinematic sequences.

---

# 40. Camera System

Default camera:

**controlled isometric / elevated perspective**

The application should feel like inspecting an architectural model.

Allow:

- zoom
- limited orbit
- controlled pan
- click-to-focus
- reset view

Avoid game-like free-flying controls by default.

---

## Company focus transition

On company deep dive:

1. interpolate camera smoothly
2. focus selected building
3. soften/de-emphasize surrounding city
4. reveal DOM-based analysis panels

Use a consistent camera state system.

---

# 41. Labels

Do not render all ~500 ticker labels simultaneously.

Use level-dependent labels.

### Far zoom

- sector names only

### Medium zoom

- major companies
- selected companies

### Near zoom

- local ticker labels

### Hover

- full compact tooltip

This is important for both usability and render performance.

---

# 42. Layers / Modes

Keep the default layer system small.

## MVP / Default

### Market

- building size
- daily price direction
- sectors

### Volume

- traffic / relative trading volume

### Catalysts

- event indicators
- affected companies / sectors
- localized environment cues

Do not implement a giant layer menu.

---

## Future analytical modes

Possible future additions:

- correlation
- fundamentals
- risk
- earnings
- historical replay

Only add a mode when it provides a clear analytical benefit.

---

# 43. Remove / Avoid These City Layers

Do not implement these in the initial roadmap:

- sewage
- garbage
- permanent power-grid visualization
- underground water/capital pipes
- pedestrians representing investors
- defensive-asset parks
- permanent supply-chain line networks
- excessive simultaneous city infrastructure layers

These ideas risk turning Market City into a city simulator rather than a market visualization product.

---

# 44. Authentication & Accounts

Users should be able to enter Market City immediately without logging in.

Add a profile/login control.

Guest users should have full access to core exploration.

Accounts can later support:

- saved preferences
- watchlist
- saved companies
- radio preferences
- visual settings

Initial seeded owner email:

`reginald.h.tan@gmail.com`

Do not hard-code this value throughout the frontend.

Use configuration such as:

```env
INITIAL_OWNER_EMAIL=reginald.h.tan@gmail.com
```

Google login can be integrated later.

Do not build full authentication infrastructure before the main city experience works.

---

# 45. Recommended Frontend Stack

Preferred:

- Next.js
- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- Tailwind CSS
- lightweight component primitives / shadcn where useful
- Zustand for local interaction state if needed
- TanStack Query for server state if needed

Do not add dependencies without clear value.

---

# 46. Charts

Charts are secondary.

For company deep-dive views, use a lightweight chart library.

Potential choice:

- Lightweight Charts
- Recharts for simple summaries

Do not build a full professional trading chart engine.

---

# 47. Backend Strategy

Start simple.

Preferred initial approach:

- Next.js server routes / server-side services

Introduce a separate backend such as FastAPI only when justified by:

- heavy analytics
- historical preprocessing
- scheduled event processing

Database:

- PostgreSQL when persistent accounts/configuration become necessary

Caching:

- memory / framework caching initially
- Redis later if justified

Do not introduce infrastructure merely because it is conventional.

---

# 48. Suggested Service Boundaries

```text
services/
├── market-data/
├── fundamentals/
├── news/
├── catalysts/
├── market-intelligence/
├── commands/
├── radio/
├── tts/
└── city-state/
```

Possible provider interfaces:

```ts
interface MarketDataProvider {}
interface FundamentalsProvider {}
interface NewsProvider {}
interface CatalystProvider {}
interface TTSProvider {}
interface RadioMusicProvider {}
```

---

# 49. Suggested Repository Structure

```text
src/
├── app/
│   ├── api/
│   └── ...
│
├── components/
│   ├── city-ui/
│   ├── company/
│   ├── intelligence/
│   ├── radio/
│   ├── charts/
│   └── common/
│
├── three/
│   ├── MarketCityScene/
│   ├── Buildings/
│   ├── Districts/
│   ├── Traffic/
│   ├── Environment/
│   ├── Camera/
│   └── Labels/
│
├── services/
│   ├── market-data/
│   ├── fundamentals/
│   ├── news/
│   ├── market-intelligence/
│   ├── commands/
│   ├── radio/
│   └── tts/
│
├── domain/
│   ├── market/
│   ├── city/
│   └── events/
│
├── stores/
├── hooks/
├── types/
├── utils/
├── config/
└── data/
    └── demo/
```

Adjust when justified.

---

# 50. 3D Performance Requirements

Market City must be designed around ~500 companies.

Target a smooth interactive experience on a modern laptop/desktop.

Aim for approximately 60 FPS where practical.

---

## 50.1 Geometry

Use:

- low polygon counts
- shared geometry
- instancing where practical
- procedural variation rather than unique high-poly models
- simple LOD where useful

Do not load 500 complex architectural assets.

---

## 50.2 Materials

Use a small number of reusable materials.

Avoid:

- expensive physically complex materials
- excessive transparency in WebGL
- high-resolution textures
- expensive reflections on every building

---

## 50.3 Lighting

Use simple lighting.

Prefer:

- ambient/hemisphere light
- one main directional light
- baked-looking material choices
- limited shadows

Avoid real-time shadows across the full city if they materially reduce performance.

---

## 50.4 Rendering strategy

Avoid rerendering the entire scene on every market-data update.

Prices may update independently from geometry.

Separate:

- structural state
- visual market state
- interaction state

Use efficient buffers/instancing where appropriate.

---

## 50.5 Traffic

Use a capped object/particle budget.

Traffic should give an impression of activity without accurately simulating every vehicle.

---

## 50.6 Weather

Avoid physically simulated weather.

Use inexpensive techniques such as:

- environment color
- fog
- light cloud layers
- small capped particle systems
- lighting changes

---

## 50.7 Visibility optimization

Use:

- frustum culling
- LOD
- label culling
- distance-based simplification

Avoid expensive detail when the camera is far away.

---

## 50.8 Idle behavior

Throttle or pause rendering when:

- tab is hidden
- user is idle
- scene is fully static where possible

---

## 50.9 Reduced Effects mode

Provide an optional reduced-effects/performance mode.

It may disable or reduce:

- traffic
- weather particles
- transparency effects
- animation detail
- expensive shadows

The core financial visualization must remain fully usable.

---

# 51. Update Frequency

Use different update strategies per data category.

Do not unnecessarily poll every company every second.

Prefer:

- provider bulk snapshots
- batched updates
- sensible refresh intervals
- centralized server caching

---

# 52. Market Update Categories

### Price / daily change

- refresh according to free provider limits
- may be EOD or delayed in MVP

### Volume / relative volume

- refresh alongside available market data
- Demo Mode may simulate live changes

### Market cap

- periodic

### Fundamentals

- daily or less frequent

### Company metadata

- rare

### News

- high priority
- approximately every 5 minutes during U.S. regular market hours when quota allows

### Earnings calendar

- periodic

### City geometry

- only when structural data meaningfully changes

This keeps the client lightweight while keeping news fresh.

---

# 53. Data Integrity

Every financial card/tooltip should be able to display:

- data timestamp
- source/provider internally
- live/delayed/EOD/demo status

The UI does not need to show provider branding everywhere.

But debugging and internal metadata should retain provenance.

---

# 54. Market Intelligence Pipeline

Build structured explanation context without an LLM.

Example:

```text
NVDA

Market
- S&P 500: ...
- VIX: ...
- breadth: ...

Company
- price change: ...
- relative volume: ...
- market cap: ...

Sector
- sector performance: ...
- peer performance: ...

News
- article 1
- article 2
- article 3

Catalysts
- earnings date
- analyst action
- recent announcement

Derived metrics
- relative performance
- unusual activity
- evidence confidence
```

The deterministic explanation engine turns this into a concise answer.

---

# 55. Market Event Engine

Create a reusable market-event model.

Potential event types:

- MARKET_OPEN
- MARKET_CLOSE
- IPO
- EARNINGS
- MAJOR_PRICE_MOVE
- UNUSUAL_VOLUME
- MACRO_RELEASE
- FED_DECISION
- ANALYST_ACTION
- ACQUISITION
- EXECUTIVE_CHANGE
- REGULATORY_EVENT
- BREAKING_NEWS

Each event should support:

- timestamp
- companies
- sectors
- significance score
- data source
- evidence
- eligibleForRadio
- eligibleForWeather
- eligibleForBeacon

This single event model can power multiple features without duplicating logic.

---

# 56. Importance Scoring

Use deterministic/structured rules first.

Example inputs:

- event category
- company market cap
- index weight
- magnitude of move
- relative volume
- number/quality of news sources
- sector impact
- market-wide impact

No AI model is required.

---

# 57. Accessibility

Price direction cannot rely on green/red alone.

Also use:

- arrows
- + / − signs
- numeric percentages
- optional patterns or brightness changes

Support:

- keyboard interaction for major UI controls
- reduced motion preference
- readable contrast
- descriptive labels

---

# 58. Mobile / Responsive Strategy

Market City is desktop-first.

Desktop is the primary portfolio experience.

Tablet should remain functional.

Phone should use a simplified experience.

Do not force the complete 3D desktop scene onto low-power phones.

Mobile may prioritize:

- simplified city
- sector overview
- search
- company quick view
- market intelligence
- radio

Detect device capability where appropriate.

---

# 59. MVP Scope

The first polished MVP should contain:

## City

- ~100 companies initially
- permanent sector neighborhoods
- low-poly buildings
- footprint/height based on market cap
- price-direction color
- controlled isometric camera
- hover
- click
- company selection
- light/dark market theme

## Market state

- S&P 500 direction
- sector performance
- basic market breadth
- VIX / volatility input where available
- last updated status

## Traffic

- relative-volume traffic

## Environment

- restrained weather state
- market-session lighting

## Company intelligence

- quick drawer
- Why It's Moving
- fresh news
- catalysts
- price
- relative performance
- historical chart in deep dive

## Command bar

- persistent command/search bar
- rule-based parser
- visual filtering/focus

## Radio

- one or two working stations
- play/pause/volume
- radio off by default
- browser-TTS market-open/market-close or major-event bulletin

## Demo Mode

- complete offline/demo dataset

## Account UI

- guest mode
- profile/login entry
- seeded owner email configuration
- full Google authentication deferred

---

# 60. Phase 1 Development Milestones

## Milestone 1 — Foundation

Build:

- app shell
- design tokens
- theme system
- loading screen
- demo market dataset
- normalized types
- empty Three.js scene
- camera
- basic city layout

Do not connect real APIs yet.

---

## Milestone 2 — City Core

Build:

- sector neighborhoods
- low-poly company buildings
- market-cap scaling
- price-color scaling
- hover
- click
- label LOD
- basic performance testing

Use demo data only.

---

## Milestone 3 — Progressive Company UX

Build:

- quick drawer
- Explore Company transition
- company deep-dive camera
- liquid-glass information overlays
- back-to-city interaction

---

## Milestone 4 — Environment

Build:

- S&P-based light/charcoal theme
- session lighting
- basic VIX/breadth weather
- lightweight traffic

Do not add complex effects.

---

## Milestone 5 — Live News

Create the `NewsProvider`.

Connect a real live/fresh financial news source.

Implement:

- centralized polling
- server-side caching
- entity/ticker matching
- importance scoring
- news timestamps
- company news drawer
- catalyst/event beacons

Target approximately 5-minute refresh during U.S. regular market hours if free-tier limits permit.

---

## Milestone 6 — Market Data

Connect free/delayed/EOD market data.

Validate:

- timestamps
- live/delayed/EOD status
- batch updates
- error behavior
- caching

Do not purchase real-time data for MVP.

---

## Milestone 7 — Market Intelligence & Commands

Add:

- Why It's Moving engine
- evidence confidence
- sector/market summaries
- command parser
- command-driven highlighting/focus

No paid AI API.

---

## Milestone 8 — MC Radio

Add:

- radio player
- provider abstraction
- one copyright-safe music source
- audio ducking
- event bulletin engine
- templated bulletin scripts
- browser TTS
- user broadcast settings

---

## Milestone 9 — Polish

Improve:

- motion
- loading
- empty states
- errors
- responsiveness
- reduced motion
- reduced effects
- accessibility
- performance profiling
- visual consistency

---

# 61. Phase 2

Main priorities:

## Full S&P 500

Scale from development subset to all constituents.

Optimize:

- instancing
- labels
- batching
- traffic
- update frequency

---

## Historical Market Replay

This is a major future signature feature.

Allow users to select a past period and watch Market City evolve.

Possible control:

```text
◀  2008 ━━━━━━━━━━━●━━━━━━━━━━ 2026  ▶

1D   1W   1M   1Y   5Y   MAX
```

During replay:

- buildings grow/shrink
- districts expand/contract
- companies enter/leave the S&P 500
- building colors change
- traffic changes
- weather/environment changes
- major events appear
- city structure evolves

Historical replay should show how the composition of the U.S. market changed over time.

---

# 62. Historical Constituents

Historical replay must eventually account for index constituent changes.

If a company leaves the S&P 500:

- in ordinary current view, it is absent
- during replay, show its historical presence
- optionally use a restrained construction/demolition transition

Do not make this cartoonish.

---

# 63. Phase 3 / Future Possibilities

Possible future features:

- broader U.S. market
- Russell indices
- Nasdaq universe
- global markets
- correlation mode
- earnings mode
- risk mode
- portfolio overlay
- stronger event replay
- optional AI adapter
- optional premium TTS adapter
- optional recognizable company architecture
- Crypto City

---

# 64. Optional Future AI Adapter

Do not build this for MVP.

If a free or affordable AI option becomes desirable later, keep the architecture extensible.

Possible future uses:

- natural-language command interpretation
- richer Why It's Moving summaries
- conversational market Q&A
- radio script variation

The structured Market Intelligence Engine should remain the source of evidence.

AI should be an optional presentation layer, never the sole source of facts.

---

# 65. Crypto City

Do not mix crypto directly into the initial Market City.

If explored later, use the same visualization engine with a separate geography.

Potential crypto neighborhoods:

- Layer 1
- Layer 2
- DeFi
- infrastructure
- exchanges
- AI
- gaming
- meme
- stablecoins

Cross-market relationships could later appear as bridges between market environments.

This is not part of MVP or Phase 2.

---

# 66. Explicit Non-Goals

Do not build in MVP:

- brokerage integration
- order execution
- automated trading
- price prediction
- options chain
- crypto market
- social feed
- financial-advice engine
- full portfolio accounting
- heavy technical-analysis suite
- full backtesting
- paid AI API dependency
- paid TTS dependency
- expensive real-time market data dependency
- dozens of widgets
- every possible city infrastructure metaphor
- photorealistic rendering
- game mechanics
- avatars/pedestrians
- excessive particles
- unnecessary animations

---

# 67. UX Anti-Overload Rules

Astra must follow these rules.

1. The city remains the visual focus.
2. Never introduce a permanent dashboard panel unless it is essential.
3. Prefer hover/click/reveal over always-visible data.
4. Only one analytical mode should dominate at a time.
5. Do not show all 500 labels simultaneously.
6. Do not animate data that does not need animation.
7. Do not present more than a few top-level controls in the default view.
8. Do not make the user understand ten visual encodings before the city becomes useful.
9. Market intelligence should simplify information, not create another wall of text.
10. News/catalysts should prioritize significance rather than quantity.
11. Radio broadcasts should be rare enough to remain meaningful.
12. Visual effects must justify their resource cost.
13. Fresh news is more valuable than unnecessarily expensive real-time prices for MVP.
14. Do not add paid APIs unless the user explicitly approves them.

---

# 68. Failure Handling

Gracefully handle:

- market API unavailable
- news unavailable
- fundamentals unavailable
- browser TTS unavailable
- radio stream unavailable
- WebGL failure
- slow GPU/device
- stale data

Examples:

### Price API failure

Keep city usable with last known data if available.

Show stale timestamp.

### News API failure

Keep cached news where available.

Show last refresh time.

### Radio source failure

Offer fallback station/source.

Do not break the app.

### Browser TTS failure

Show text bulletin only.

### WebGL failure

Provide a simplified 2D market view if practical.

---

# 69. Loading & Data States

Every major feature should support:

- loading
- success
- empty
- error
- stale
- demo

Do not leave blank panels.

---

# 70. Security

All external API keys must remain server-side.

Never expose:

- financial provider secrets
- news API keys
- authentication secrets

Use environment variables.

Provide:

`.env.example`

Do not commit real secrets.

---

# 71. Development Rules for Astra

When working in the existing Market City repository:

1. Inspect the existing repository before changing architecture.
2. Do not create another repository.
3. Build incrementally by milestone.
4. Do not implement later phases prematurely.
5. Use Demo Mode first.
6. Keep Three.js code separated from normal React UI.
7. Keep provider APIs separated from domain models.
8. Keep market facts separate from interpretation.
9. Use strict TypeScript.
10. Avoid giant components.
11. Avoid hardcoded financial values inside visualization components.
12. Use reusable components.
13. Prioritize performance from the beginning.
14. Run lint/type checks after meaningful milestones.
15. Test city interactions before adding new effects.
16. Do not redesign approved UX merely because a new feature is added.
17. Prefer a simple implementation that works smoothly over a visually excessive implementation.
18. If a feature threatens usability, simplify it.
19. If a visual layer does not clearly communicate information, remove it.
20. Treat the application as a portfolio-quality product, not a prototype.
21. Do not introduce a paid AI API.
22. Do not introduce a paid TTS API.
23. Do not introduce an expensive market-data subscription without explicit approval.
24. Prioritize fast, cached live news over paid real-time stock quotes.
25. Keep provider adapters replaceable.

---

# 72. Suggested Core Components

```text
MarketCityScene
MarketCityLoader
MarketThemeController
SectorDistrict
CompanyBuilding
TrafficSystem
MarketEnvironment
MarketCameraController
CompanyTooltip
CompanyQuickDrawer
CompanyDeepDive
CommandBar
CommandResultPanel
WhyItsMovingPanel
MarketStatus
LayerControl
MarketCityRadio
RadioPlayer
RadioBulletin
ProfileMenu
```

---

# 73. Suggested Domain Services

```text
MarketDataService
SectorAnalyticsService
MarketBreadthService
RelativeVolumeService
EnvironmentStateService
EventDetectionService
CatalystService
NewsService
NewsImportanceService
MarketIntelligenceService
CommandParserService
RadioBulletinService
TTSService
```

---

# 74. Definition of Done — MVP

The MVP is complete when a new visitor can:

1. open Market City
2. see a short polished loading sequence
3. enter a smooth low-poly market city
4. understand that neighborhoods represent sectors
5. understand that larger buildings represent larger companies
6. understand green/red performance
7. observe activity through relative-volume traffic
8. hover a company
9. click a company
10. see a useful quick drawer
11. understand Why It's Moving using structured evidence
12. inspect fresh news and catalysts
13. enter company deep dive
14. see the camera focus the building
15. inspect deeper information through lightweight glass panels
16. return smoothly to the city
17. use the command bar to locate/filter part of the market
18. use MC Radio voluntarily
19. hear at least one functioning market bulletin without a paid TTS API
20. understand whether market-price data is live, delayed, EOD or demo
21. see clearly how fresh the news data is
22. use the application without creating an account
23. open the profile/login interface if desired
24. experience the project smoothly on a normal modern desktop
25. run the core MVP without any paid AI API

The user should understand the core concept within approximately **30 seconds**.

The project's key differentiator should be obvious within approximately **one minute**.

---

# 75. Multiple Cities and Market Universes (owner update)

The city geography and the market universe are **separate, switchable choices**.

One rendering engine, several maps. A user picks which index they want to explore and
which city they want to explore it in.

---

## 75.1 Universes

| Universe | Meaning |
|---|---|
| Nasdaq-100 | Nasdaq-listed large caps |
| S&P 500 | Broad U.S. large-cap market |

Companies carry accurate index-membership flags. A universe filters the dataset; it
does not relabel it.

> **Recorded correction.** The original seeded 100-company development set is an S&P
> 500-style subset, not the Nasdaq-100. It contains NYSE-listed names that are not NDX
> constituents. The Nasdaq-100 city therefore renders only the seeded companies that
> genuinely belong to that index until the remaining constituents are added.

---

## 75.2 Tokyo — Nasdaq-100

The existing layout, unchanged: inland sprawl, eastern river wards, a southeastern bay
with three sector islands, an elevated rail loop and Mount Fuji behind the skyline.

- Sector = town
- Subsector = street
- Company = plot on a street

---

## 75.3 London — S&P 500

A **radial** city, not a grid of towns.

- **Nine concentric zones.** Zone 1 is the centre; zone 9 is the outer edge.
- **Every sector cuts through every zone** as an angular wedge, so a district is a
  radial slice from the centre to the edge.
- **Zone = market-cap band.** The larger the company, the lower its zone number.
- **No subsector sorting in the layout.** Subsector belongs on the company card.

Geography and identity:

- The Thames curves through the city
- Royal parks and museum quarters as civic space
- Landmarks: the Shard, Tower Bridge, the London Eye, Buckingham Palace, St Paul's,
  the Gherkin, Canary Wharf
- Sector placement follows the real city where a real anchor exists — financials at
  Canary Wharf and the City
- Existing skyscrapers may stand in for companies (for example the Shard for Apple)

---

## 75.4 New York City — S&P 500

A **borough-tiered** city.

- **Five boroughs, ranked by sector market-cap tier:** Manhattan (highest), Queens,
  Staten Island, Brooklyn, Bronx (lowest)
- **Borough = tier.** Manhattan holds the largest sectors, such as technology and
  financials
- **Neighbourhood = sector**
- **Street = subsector**

Geography and identity:

- Hudson and East rivers, Central Park, museums, iconic landmarks, the NYC skyline
- Real anchoring where it exists — Wall Street for financials, Hudson Yards and St
  John's Terminal for technology
- Existing skyscrapers stand in for their real occupants, such as 270 Park Avenue for
  JPMorgan
- **Opening camera:** across Manhattan, with Queens and Brooklyn in the background

---

## 75.5 Market-cap encoding

Market capitalisation maps to the **total volume of built space** a company occupies:

```text
volume ∝ compressed(market cap)
footprint × height = volume
```

Height alone is no longer the sole carrier. Land area and height share the encoding, so
a very large company reads as a large *site*, not only a tall spike.

---

## 75.6 Honesty constraints for city geography

These layouts are **stylised interpretations at an illustrative scale**.

- Not georeferenced maps
- Landmarks are simplified low-poly massing, not architectural reproductions
- Assigning a real building to a company is an **identity cue for exploration**, not a
  claim about property ownership, tenancy or headquarters location
- Zone/borough placement encodes market capitalisation, not a company's real address

## 75.7 London revisions (owner follow-up)

- **Seven zones, not nine.** The outer two carried no companies, and an empty ring
  is only distance for the camera to cross. The built radius falls from 170 to 138.
- **No zone separation.** Concentric ring roads are replaced by ordinary streets
  that front each row of buildings and stop at the avenues either side, with each
  neighbourhood's building line offset slightly from its neighbours so nothing reads
  as a ring. Radial arterials remain, and break around a landmark standing in for a
  company rather than passing through it.
- **Inland.** London is not coastal, so beyond the built-up area is open green
  country in the city's own ground colour rather than sea. The Thames stays.

The zone still means what it always meant: a market-capitalisation band, with the
largest companies closest to the centre. Removing the empty rings and the ring roads
changes how the city reads, not what it encodes.

## 75.8 Implementation status — shipped

All three cities are built and switchable. `src/domain/cities/` holds one module per
city behind a shared `CityDefinition`: market-cap tiers, districts, landmarks, land and
water polygons, roads, a `createPlots` function and an opening camera. A shared terrain
and landmark renderer draws any data-described city, while Tokyo keeps its bespoke
terrain, seasons and Fuji through a `bespokeTerrain` flag — nothing about the original
city changed. Buildings, signature architecture, traffic, labels and every analytical
overlay are shared.

The header globe control switches cities and the choice persists locally. A city renders
only the companies in its universe, and the headline index move is recomputed over that
universe so the pulse, breadth, search, lists and catalysts agree with the skyline; a
district with no members in the active universe says "No members" rather than reporting
+0.00%. Market capitalisation is encoded as built volume through `domain/massing.ts`,
and the company card carries the subsector next to the city's own band (Borough ·
Manhattan, Zone · Zone 3, Town · Technology).

New York opens over the Hudson looking east-south-east down the built length of
Manhattan, which places Queens across the East River and Brooklyn beyond the bridges in
the background, as specified.

`tests/cities.test.ts` holds the invariants the layouts must not drift from: complete
placement, no overlaps, session independence, the New York borough ranking really
following the seeded sector market-cap order, every lot inside its own borough polygon,
and London's largest-first zone ordering and single-wedge sectors.

## 75.9 Full sector coverage in every city (owner follow-up)

The Nasdaq-100 city showed no financials and no energy buildings, and its districts
were buried under decorative low-rise blocks. One cause behind both: Tokyo rendered
only the 34 seeded companies that were Nasdaq-100 members, so two districts had
nothing to place and the scenery generator filled the empty ground.

- **The roster now covers every sector in every universe.** 133 seeded companies,
  67 of them Nasdaq-100 members, chosen so no district is ever empty. Every company
  is checked against a dated public GICS sector reference, so nothing is filed under
  a sector it does not belong to.
- **Energy and materials stay deliberately small in the Nasdaq-100 city.** The real
  index carries about one company in each. Padding those districts with companies
  that are not in the index would misrepresent it, so they stay one-building
  neighbourhoods instead.
- **Scenery is secondary again.** Tokyo's low-rise blocks went from 604 to 189
  against 67 company buildings. Decorative geometry carries no market encoding, so
  it must never outweigh the buildings that do.
- **A city's band is named on every lot.** Tokyo's plots never recorded a tier, so
  its company cards said "Tokyo" where the other cities say "Borough · Manhattan".
  The sector town is now the tier, as the guide always claimed.
- **Boroughs re-checked against the seeded caps.** Utilities overtook materials once
  more utilities companies were seeded, so utilities moved to Brooklyn and materials
  to the Bronx, keeping the documented rule that the Bronx holds the smallest sector.

## 75.10 Landmark fidelity and label decluttering (owner follow-up)

Two complaints, both addressed in `src/three/CityLandmarks.tsx`: too many floating
landmark names, and several landmarks not looking like the real place they name.

- **A label now means something.** Only a landmark that identifies a sector carries a
  floating name — the same role Tokyo's sector landmarks always played. Every purely
  decorative landmark relies on its own shape to be recognizable instead.
- **Bespoke shapes for the landmarks that need one**, via an id-keyed lookup checked
  before the shared per-kind renderer: Tower Bridge vs. Brooklyn Bridge, the Gherkin's
  taper, Canary Wharf's pyramid roof, the Empire State/Chrysler/One World Trade Center's
  own profiles, Battersea's four chimneys (replacing a train-shed shape that was simply
  wrong for a power station), St Paul's/Greenwich/Tate Modern each distinct from the O2
  and from each other, and Washington Square Arch as an actual arch rather than the
  placeholder museum block its data `kind` had defaulted it to.
- **Real parks, not one template.** Hyde Park (the Serpentine), Regent's Park (the
  Boating Lake), Central Park (the Reservoir and the Lake on its long north-south strip,
  with sparser trees matching its open meadows) and Prospect Park (the Lake beside a
  wooded cluster on one side, rather than a symmetric border) each get their own water
  body and tree arrangement, sized as a fraction of that park's own footprint.
- **A real bug fixed along the way.** The Shard (`ticker: "AAPL"`) and Apple's own
  company building were rendering at the exact same coordinates. A landmark with a
  `ticker` now renders no mesh at all: the company's building already stands there,
  carrying both the identity (Apple's logo) and the daily-change colour encoding a
  second shape would have duplicated or obscured.

---

## 75.11 Backlog selection — orientation, breadth, landmarks, budgets (owner follow-up)

The owner selected nine backlog proposals and asked for them together: UI/UX 1 and
3, Market visualisation 1 and 2, Features 2 and 3, and all three Optimisation
items. They are now shipped and their entries are struck from the backlog below.

**City-aware onboarding and guided tours (UI/UX 1, 3).** `src/domain/cities/orientation.ts`
holds one `CityOrientation` per city: a two-line headline and detail, plus a
three-or-four-stop tour. Both are per city on purpose — the point of three cities
is that the same market is arranged three different ways, so an orientation that
said the same thing everywhere would teach nothing. The card
(`CityOnboarding.tsx`) appears once per city, tracked in a persistent set rather
than a single flag, because switching city changes the rules of the map and the
explanation has to come back for a city you have not seen. The tour
(`GuidedTour.tsx`) reuses the existing sector-flyto: each stop names a sector, and
advancing calls the same camera move a click on the district directory would. It
never advances on a timer — it moves only when the reader asks, so it cannot take
the map away from someone mid-thought — and Escape ends it at any step.

**Breadth ribbons and mass columns (Market visualisation 1, 2).** Two layers that
separate the two things a district encodes. `BreadthRibbons.tsx` draws a thin band
along each market-cap band's edge — a London ring, a New York borough shore, a
Tokyo town boundary — coloured by the share of that band's companies advancing.
`MassColumns.tsx` draws a translucent column over each district whose height
tracks that sector's share of total index market capitalisation. Breadth is a
count and mass is a weight, and they disagree often: a band of small companies
mostly rising reads green on the ribbon while its column stays short. Both are off
by default and toggle from Layers & view.

One `tierOutline(tierId)` on `CityDefinition` is what lets a single breadth layer
draw all three cities. The contract is an *explicit* loop — first point repeated as
last — because the renderer walks consecutive pairs. New York's borough shapes are
stored open, the way a polygon fill wants them, so its `tierOutline` closes them on
the way out; without that the ribbon stopped one segment short and left every
borough visibly unsealed. `tests/orientation.test.ts` asserts the closure for
every band of every city, which is how that gap was found.

**Landmark index (Features 2).** `LandmarkIndex.tsx` lists every real place in the
active city and says in words what each one is doing: standing in for a company,
identifying a sector, or scenery only. From the map alone the three look similar,
and an identity cue mistaken for a claim about ownership or headquarters location
is exactly the ambiguity the honesty constraints exist to prevent. The footer
counts how many landmarks carry a meaning against the total, so the ratio of
decoration to signal is stated rather than implied.

**Personal city preferences (Features 3).** `useCityPreferences` stores map layers,
season mode and last camera bookmark under `market-city-prefs:<cityId>`, so each
city keeps its own feel instead of a global setting following you between
geographies. Stored preferences are merged over the current defaults rather than
used as-is, so a file written before a layer existed does not leave that layer
undefined.

**Per-city geometry budget (Optimisation 1).** Each `CityDefinition` declares a
`budget` of lots, landmarks, road segments and labels. `tests/budget.test.ts`
enforces three things: no city exceeds its own budget, no budget exceeds a shared
ceiling, and — the part that makes a budget a real constraint rather than a
comment — no budget sits far above what the city actually draws. Without that
headroom check a city could declare a generous budget and pass forever.

**Lazy city loading (Optimisation 2).** `src/domain/cities/index.ts` is now a
`Record<CityId, () => Promise<…>>` of dynamic imports with a resolved-module cache,
written as literal specifiers because a bundler can only split what it can see
statically. `catalog.ts` carries the light metadata the city picker needs (name,
region, universe, tagline) so listing the cities does not pull in any city's
geometry. `MarketCity` splits into a loader and a view; the view keeps the same
component type at the same position across a city switch, so God-mode and compare
state survive changing city. The one non-obvious dependency this exposed: Tokyo's
geography was still loading eagerly because sector identities lived in the same
module as its terrain, so `sectorIdentities` moved to `src/domain/sectors.ts` and
`geography.ts` now imports from it rather than the reverse.

**Precomputed layout snapshots (Optimisation 3).** `npm run bake:layouts` writes
each city's solved plots to `src/data/layouts/<city>.json`, imported by that city's
module so the fixture rides its lazy chunk. The cache key is a structural
signature — ticker, sector, subsector and market cap, sorted — and deliberately
excludes price and volume, so a quote refresh reuses the baked layout while a
roster or weighting change falls back to solving in the browser. A stale fixture
is therefore a slower boot, never a wrong city.

---

## 75.12 The ordinary city (owner follow-up)

The owner asked for a more realistic city, in the vein of the city-building
games. The diagnosis was that every building in Market City carried market
data: company lots, landmarks, and nothing else. A real city is mostly
*ordinary* buildings — terraces, houses, a corner shop — and without them a
layout reads as a diagram of a market rather than a place. New York and London
had no such buildings at all; their open ground was bare green between road
grids. Tokyo had a grid-scattered filler of its own.

**One generator, placed by fronting streets.** `src/domain/cities/fabric.ts`
generates the fabric for all three cities. It is pure and deterministic, so the
same city always builds the same way and a test can count it. Buildings are
placed by *fronting a road* rather than scattering on a grid: a real
neighbourhood is a line of buildings facing a street at a consistent setback,
and following the road network means the fabric inherits whatever shape each
city already has — a Manhattan grid, a London radial, a Tokyo town — instead of
imposing a fourth one on top.

**Blocks are deep, not a single line.** Rows step back from each street into
the block interior, thinning as they go, until they run out of land or hit a
company lot, a landmark or another building. Without this New York stayed
nearly empty: it has few roads and very deep boroughs, so street frontage alone
filled almost nothing. Shops are generated only on the front row — a row deep
inside a block has no passing trade to open onto, and a shopfront drawn there
would face the back of another building.

**Three kinds, and what each one is for.** A terrace is the ordinary case; a
house carries a pitched roof and chimney so some of the skyline is not flat;
a shop has a glazed ground floor and an awning, which is most of what makes a
shopping street legible from a distance. All of them use muted wall colours and
never the green and red of a daily move, and none is tall enough to compete with
a mega-cap for the eye. The ordinary city is the backdrop; the market is still
the subject.

**Street furniture does the rest.** Trees and lamp posts alternate along the
verge, parked cars hug the kerb, and zebra stripes mark where one street meets
another. The cars are the cheapest possible cue that a strip of grey is a street
someone uses rather than a path.

**Tokyo's own filler was deleted rather than kept alongside.** Two generators
for the same thing would have drifted apart, and the shared one is better —
Tokyo gains pitched roofs, shopfronts and parked cars that its grid never had.

**The budget gained a `fabric` entry, and it works the other way round.** The
other budget figures are measured after the fact and capped from above. This one
is a hard cap passed *into* the generator, because the fabric grows with the road
network and a city that gained a few streets would otherwise quietly gain
hundreds of instances. The risk therefore runs the other way, so the test asserts
a floor as well: a city whose roads or land changed such that almost nothing can
front a street would pass every other check while looking deserted.

**Degrading thins rather than hides.** The first wiring dropped the fabric
entirely at the lowest quality tier, which did not read as lower detail — it
read as a city missing most of its buildings. A struggling device now keeps
every third building, spread across the whole city rather than truncated to a
dense corner and an empty remainder.

---

## 75.13 Making it look like a city (owner follow-up)

Four changes, all chosen by the owner: building shapes that say what a company
does, block interiors, a brighter palette, and lights after the close.

**A building's shape now comes from its industry, not its index position.**
`formFor` previously picked one of twelve massings from a company's position in
the listing, so a bank and a warehouse operator could end up with the same
silhouette by accident of ordering — the shape said nothing true. Each sector
now draws from its own set: financials get the crystalline spire and the deco
setback, materials and energy get broad low plant masses, real estate gets the
terraces and the oval, technology the glass shafts and campuses. Several per
sector, so a street is not a row of identical buildings. The sixteen curated
signature buildings still override everything, because their brand accents are
positioned for a flat centred facade and a sector form would put a logo on a
taper.

What did *not* change is as important: height and footprint remain the
market-cap encoding, and colour remains the daily move. Industrial buildings are
not squashed down to look like real plants, however much that would help the
illusion, because height means something here.

**This broke the baked-layout cache, which was a flaw in the cache.** Every
lot's `variant` changed without a single company changing, so the structural key
still matched and the stale fixtures silently won. The key now carries a
`LAYOUT_VERSION`, bumped whenever placement logic changes. The original key was
right that prices must not invalidate a layout and wrong that the roster was the
only other input: the generator is an input too.

**Blocks have interiors.** A gap in a back row is no longer bare ground: it
becomes a garden square with trees and a bench, a paved square with a fountain,
or a car park with bays and a couple of cars in them. Car parks only appear on
the row immediately behind the frontage, since a car has to be able to reach
one.

**The palette is brighter, but still cannot lie.** The owner asked for something
more toy-like, so walls, roofs and awnings moved to saturated blues, yellows,
teals, violets and terracottas — and deliberately *not* green or red. Those two
are the daily-change encoding, and a terrace painted red would read as a company
having a bad day. Avoiding two hues leaves plenty of range, and height still
keeps the fabric below the towers.

**Dusk goes properly dark (owner follow-up).** The first evening was too timid
to read as one. It is now a real night — low ambient, deep blue fog — with the
company towers' window bands lit warm so the city still has shape. The first
attempt at that lit `towerGlass` as well, which is a whole glazed shaft rather
than a window: entire buildings turned uniform gold and the difference between
a company up on the day and one down disappeared. Emissive is a constant added
after the diffuse colour, so anything large enough to dominate a silhouette
will always flatten the encoding colour carries. Only the small window bands
light up.

A related mistake, now fixed: `Boxes` set its emissive to white and relied on
instance colour to tint it. Three multiplies instance colour into diffuse only
— emissive is one material uniform — so every glowing thing was washing toward
white regardless of its colour. Glowing batches now take an explicit shared
glow colour, and things that glow differently are batched separately.

**Lights come on when the exchange closes, not when the market falls.** The
scene already had a `night` flag meaning the session is closed or after-hours,
and a `dark` flag meaning the index is *down*. Lighting the windows from `dark`
would have made a falling market look like nightfall, so the lights key to
`night`. The first attempt lit windows while leaving full daylight, which read
as glowing paint rather than lights; after-hours now genuinely dims and cools
the scene — enough to make a lit window register, not so much that a company's
green or red stops being legible. Roughly two windows in five light up, fixed
per building so the city does not flicker as the camera moves.

**A real orientation bug surfaced while doing this.** Fabric buildings were
rotated so their depth ran *along* the street, and their windows and shopfronts
were offset along the wrong local axis — which only became visible once the
windows glowed and appeared as diagonal slashes floating off the walls. The
rotation convention is now stated on the type: at a block's rotation its local X
axis points at the road, so width runs along the street and depth back from it,
and anything mounted on the front wall offsets by `(cos r, -sin r)`.

---

## 75.14 Measuring before optimising (owner follow-up)

Every performance decision so far had been a guess. The scene trims itself when
frames get slow, but nothing recorded what slow was or what it cost, so there
was no way to tell whether draw calls, triangle count or fill rate was the
constraint. `?perf=1` now renders a readout from the renderer's own counters
rather than from anything the app believes about itself: average and worst
frame time, draw calls, triangles, resident geometries and compiled programs.

It leads with frame time in milliseconds rather than frames per second, because
milliseconds are the unit a budget is spent in — the gap between 60fps and
50fps reads as a rounding error while 16.7ms against 20ms does not. It samples
once a second rather than per frame, since a setState every frame would distort
the number it is measuring. And it is opt-in and absent otherwise: a permanent
overlay is one more thing to draw.

**Baseline, measured at the default camera with adaptive quality off:**

| City | Draw calls | Triangles | Geometries |
| --- | --- | --- | --- |
| New York | 231 | 383k | 222 |
| London | 255 | 425k | 229 |
| Tokyo | 144 | 357k | 108 |

These were taken in a software rasteriser, so the frame times that came with
them describe this test environment and not any real device — but draw calls,
triangle count and geometry count are hardware-independent, and they are what
the remaining optimisation work targets. The gap between Tokyo's 108 resident
geometries and New York's 222 is the clearest signal in the table: the shared
terrain builds one extruded geometry per land polygon and the landmarks build
one per landmark, none of them instanced.

---

## 75.15 Making city generation fast (owner follow-up)

Generation ran once per city switch and took long enough to be felt. Three
changes, and the order in which they were found is the point: **the one I
predicted would help was the one that made things worse.**

**A spatial index for the overlap checks — the proposed fix — was a
regression on its own.** The obvious shape is to store each item in the cells
its own box touches and read every cell within the query's margin. That makes
each query widen to the size of the largest thing indexed, so a city with one
big park scans fifty cells rather than comparing against sixteen landmarks.
London went from 200ms to 247ms. Inverting it fixed that: pad on *insert* by
the largest margin any caller uses, and a query then reads exactly one cell,
because anything that could match is already in it.

**The real cost was the land test.** `onLand` runs a point-in-polygon crossing
count against every land and water polygon, four corners per candidate. London's
coastline and Tokyo's bay are hundred-vertex polygons, so this was tens of
millions of edge comparisons — far more than the overlap scan. Bounding boxes
around each polygon let an obviously-outside point cost four comparisons
instead of a full pass, which took Tokyo from 262ms to 34ms.

**Bounding boxes do nothing for a polygon that contains the query**, which is
London: one large outline that nearly every candidate falls inside. The fix
there was ordering. The land test ran first, before four O(1) grid lookups that
would have rejected most candidates anyway. Putting the cheap tests first
halved London again.

| City | Before | After |
| --- | --- | --- |
| New York | 19.9ms | 9.1ms |
| London | 199.7ms | 51.9ms |
| Tokyo | 262.6ms | 15.0ms |

Block counts are identical before and after in all three cities, which is what
makes this an optimisation rather than a change.

---

## 75.16 Baking the ordinary buildings (owner follow-up)

With generation down to 9-52ms the case for a fixture was no longer obvious: it
trades CPU for download. The deciding factor was the encoding. Written as
readable JSON the three cities come to 116KB; written as arrays of numbers
rounded to the centimetre they come to 37KB gzipped, split so a visitor
downloads only the city they are looking at — 9KB for New York, 18KB for
London, 10KB for Tokyo, each riding the lazy chunk that city already fetches.
Against 9-52ms on this machine, and several times that on a phone, that is
worth paying.

Field names would otherwise be repeated some fifteen hundred times per city,
and full float precision is meaningless for scenery.

**Two things the fixture mechanism needed that the layouts taught.** It carries
a `FABRIC_VERSION` alongside a key derived from the lots, because the generator
is an input as much as the lots are — the lesson from building forms by sector
changing every lot without changing a company. And a test re-solves each city
and compares, because a key and a version both passing still does not prove the
file on disk is what today's code produces.

**Negative zero cost an hour.** A rotation of -0 encodes fine, but JSON has no
negative zero, so it comes back as 0 and the staleness test fails forever on a
file that is in fact current. Rounding now adds zero, which collapses -0 to 0
before it is written.

**Rows are typed as plain arrays, not fixed-length tuples.** TypeScript widens
a JSON import to exactly that, and asserting a tuple shape over a file on disk
would be a claim the compiler cannot check; the decoder reads positionally and
coerces instead.

---

## 75.17 Draw calls, and a proposal the measurements killed (owner follow-up)

With the readout in place it became possible to attribute the frame rather than
guess at it. Turning each layer off in turn, on New York at the default camera:

| Layer | Draw calls | Geometries |
| --- | --- | --- |
| District landmarks | 97 | 101 |
| City blocks (the fabric) | 12 | 0 |
| Everything else | 121 | 121 |

**Landmarks dominated, and for an avoidable reason.** Every box-shaped piece of
every landmark declared its own inline `<boxGeometry />`, and each of those
allocates a separate buffer even though all fifty-one are the same unit cube —
the meshes already size themselves with `scale`. Sharing one cube took resident
geometries from 222 to 151.

**Batching by material instead of by meaning.** The fabric drew a separate
instanced mesh for ground, crossings, walls, roofs, trims, windows, cars and
street furniture. Colour travels per instance, so all of those are the same
cube in the same material and belong in one mesh; they were separated by what
they represent, which is a reason to name them differently and not a reason to
draw them apart. Twelve batches became three. Only the two other geometries and
the self-lit night instances genuinely cannot merge, since emissiveness is a
material property.

**Per-district culling turned out to be a bad trade, and the numbers are why.**
Zooming from the overview into one district takes draw calls from 222 to 136 —
landmark meshes are small and separate, so the frustum already removes most of
them — but triangles fall only from 383k to 380k. The triangles are in the
instanced meshes, which are one object each and so are all-or-nothing. Splitting
them into spatial tiles would let those triangles cull, at the cost of
multiplying their draw calls by the tile count at the overview, where every tile
is visible anyway. That trades the resource this scene has plenty of for the one
it is actually short of: 380k triangles is unremarkable for any GPU, while
several hundred draw calls is the real cost on a phone. So this proposal is not
implemented, and the measurement is the reason.

The remaining prize is the 97 landmark draw calls, which needs those meshes
instanced rather than merely sharing a geometry. That is a rewrite of how each
landmark emits its pieces, not a mechanical change, and it is better done
deliberately than folded into this pass.

---

## 75.18 Keeping decoration out of the encoding (owner follow-up)

Exactly one thing in Market City encodes the daily move: a company building's
colour. Every other coloured surface is decoration, and decoration that lands on
the signal's colour makes the signal ambiguous — a reader glancing at a district
cannot tell which of two similar colours is data.

The flagged problem was autumn foliage sitting on the declining red. Measuring
it in CIE L\*a\*b\* found that true, and found worse things that were not
flagged:

| Colour | Nearest encoding colour | Distance |
| --- | --- | --- |
| Summer leaf `#45a05d` | strongest advance | 14.5 |
| Spring evergreen `#38815c` | strongest advance | 11.2 |
| Autumn leaf `#d96336` | strongest decline | 22.9 |
| Fabric awning `#e07a5f` | weakest decline | **8.6** |
| Fabric awning `#5aa88c` | weakest advance | **11.6** |

Summer foliage and the evergreens were closer to the advancing green than
autumn ever was to the declining red. Worse, the ordinary-buildings palette
shipped a comment claiming it avoided green and red while five of its colours
did not — one awning at a distance of 8.6, which is to say it *was* that red.
**A constraint stated only in a comment is not a constraint.**

`src/domain/palette.ts` now defines the rule and `tests/palette.test.ts`
enforces it over every scenery palette in the app. Objects must clear green and
red by 25. The flat-change grey gets a lower bar of 12, because being mistaken
for a company that is *not* moving is a milder error than being mistaken for one
that is, and a strict bar there would outlaw every pale or desaturated colour the
city legitimately needs — frost, stone, concrete. Ground is lower still at 15 and
tested separately: grass is green, and the ground is the one surface that cannot
be mistaken for a building.

**The sector palette turned out to have a second, unrelated problem.** Districts
are told apart by colour, and three pairs were too close to distinguish —
technology and real estate at 10.4, financials and energy at 10.9, financials and
staples at 12.7 — while four sectors sat near the encoding themselves. Every
sector is now at least 21 from its nearest neighbour and 27 from the encoding.

**An optimiser was the wrong tool for that.** Searching for the palette that
maximises minimum separation produced an unusable result: electric blue, acid
yellow-green, and — for communications — a pure red that passed the numeric
threshold while being, to any reader, the colour of a falling market. Excluding
the red and green *hue bands* outright helped and still gave garish corners of
the gamut, because maximising a minimum distance always pushes there. The palette
that shipped is hand-picked, keeps each sector's existing character, and uses the
measurements to check the result rather than to choose it.

---

## 75.19 Landmarks baked by finish (owner follow-up)

§75.17 left the 97 landmark draw calls as the remaining prize. They are now gone,
by merging rather than instancing. The landmarks are two dozen different shapes
with a handful of copies each, which is exactly the case instancing does not
serve: it would have produced dozens of one- and two-instance meshes. Every
landmark in `src/three/landmark-geometry.ts` now describes itself as a list of
pieces, and the city's whole set is baked once into one geometry per *finish*
(metalness, roughness, emissive, sidedness), with colour carried per vertex.

| City | Pieces | Draw calls before | Draw calls after |
| --- | --- | --- | --- |
| New York | 97 | 97 | 8 |
| London | 108 | 108 | 8 |

Whole-frame draw calls on New York at the default camera went from 222 to 139,
with triangles unchanged. Before/after screenshots of both cities differ only
where traffic moved between captures. The ponds joined the bake, since they
share the water finish. `tests/landmarks.test.ts` asserts the merge really
collapses (at least four pieces per batch), loses no vertices, paints every
vertex, and that every structural landmark still draws while company stand-ins
draw nothing.

---

## 75.20 Universe diff (owner follow-up)

Switching city switches universe, and two things change without explanation: a
third of the skyline disappears, and the headline move can change size or even
sign. *Tools → Universe diff* now says which companies each universe holds and
why the two headlines differ.

- **Exact, not descriptive.** With *s* the cap-weighted move of the companies in
  both, and *w* the share of a universe's market cap held by companies only it
  contains, moving at *o*: move(A) − move(B) = wA·(oA − s) − wB·(oB − s). The
  panel's sentence is built from those two terms, so it cannot disagree with the
  headlines. `tests/universe-diff.test.ts` asserts the identity over several
  simulated sessions in both directions, and that each side's move equals what
  that city's pulse shows.
- **Chips know whether they are on the map.** A company in the current universe
  opens its card; one that is not is drawn dashed and does nothing, and a
  button switches to the city that does show it.
- **The overlap is stated honestly.** Every seeded company is treated as an
  S&P 500 member, so in this dataset the Nasdaq-100 is a strict subset. The
  panel says so, and that the real indexes overlap less, instead of letting a
  "0 only in Nasdaq-100" stand as a fact about the indexes.
- A stale universe note claimed the S&P set held 100 companies; the roster has
  been 133 since §75.9. The note no longer states a count.

---

# 76. Idea Backlog

Proposals only. Nothing here is approved scope until the owner selects it. Items
the owner has selected and shipped are removed rather than ticked; §75.11 records
the last nine.

## UI/UX

1. **Split-screen city comparison** — the same company or sector rendered in two
   cities side by side, to show how differently each geography reads.

## Market visualisation

1. **Index-migration ghosts** — when a company would sit in a different zone/borough
   than it did at the last snapshot, show a faint outline on its previous plot.

## Features

The selected feature proposal shipped (§75.20); none is outstanding.

## Optimisation

All three selected optimisation proposals are shipped (§75.11). No further
optimisation work is proposed until a measurement shows one is needed.

---

# 77. Final Product Statement

Market City should not be:

> a stock dashboard rendered in 3D.

It should be:

> **a living, navigable visual model of the stock market where the city itself communicates market structure, activity and narrative.**

Every future feature should be evaluated against that statement.
