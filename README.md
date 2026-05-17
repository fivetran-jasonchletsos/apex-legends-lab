# APEX LAB

Apex Legends reference site + ODI demo. Legends, weapons, loadouts, drop
spots, ranked tracker, movement tech, training drills, and live patch
impact predictions. Same data architecture as the **2K LAB**, themed
and modeled for Apex Legends.

Fully responsive — desktop, tablet, mobile.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 on your laptop, or visit it from your phone on
the same Wi-Fi at `http://<your-mac-ip>:3000`.

To deploy publicly: push to GitHub, import the repo at
https://vercel.com — one click, free, gives a shareable URL like
`apex-lab.vercel.app`.

## Pages

| Route | What it does |
|---|---|
| `/` | Dashboard: hero, S-tier picks, meta pulse callout, weapons highlights |
| `/legends` | 28-legend roster — search, filter by class/tier, expand for full kit, counters, pairs, pro tip |
| `/weapons` | Tier list — sort by DPS, TTK, damage, mag. Hop-ups, attachments. Pro tips per weapon. |
| `/loadouts` | Curated weapon pairings (S/A tier) + a custom builder. Star favorites, hot-drop plan. |
| `/maps` | Per-map drop spots — risk, loot, rotation. Map fundamentals. Favorite drops saved locally. |
| `/ranked` | RP tracker + match simulator. Tier ladder. Climb tips for your tier. Predator threshold history. |
| `/training` | Daily 5-min warm-up routine (with timer). Drills by category. Sensitivity grid. |
| `/tips` | Movement tech, gunplay, audio cues, hidden mechanics. Search + filter. Mark as learned. |
| `/pulse` | Live patch + sentiment → predicted meta deltas. Same shape as 2K LAB `mart_rating_predictions`. |
| `/stack` | ODI demo backbone — architecture diagram, sources, dbt models, code preview |

## ODI demo angle

Real architecture — Fivetran SDK lands six sources into **MDLS** (Managed
Data Lake Service: S3 + Iceberg + Polaris/Glue catalog). **Snowflake-on-Iceberg**
is the primary read engine: it attaches to the MDLS Polaris catalog via an
external volume + catalog integration, dbt runs there, and Next.js consumes
the marts. Athena, Databricks, and Trino can read the same Iceberg tables
from the same catalog if needed — no re-ingest.

```
   Sources                  Fivetran SDK
   ─────────────            ──────────────
   Apex Legends API ─┐
   Tracker.gg         │
   ALS Predator       ├──→  6 custom connectors  ─┐
   Reddit r/apex      │     (Python)               │
   EA / Respawn news  │                            │
   Streamer loadouts ─┘                            │
                                                   ▼
                       ┌──────────────────────────────────────────────┐
                       │  MDLS destination                            │
                       │  ──────────────────────────────────────────  │
                       │  S3 · Apache Iceberg · Polaris/Glue Catalog  │
                       │  bronze_<source>.<table>                     │
                       └─────────────────┬────────────────────────────┘
                                         │  one Iceberg catalog
                                         ▼
                              ┌─────────────────────────┐
                              │  Snowflake-on-Iceberg   │  <-- primary
                              │  external volume +      │      read engine
                              │  catalog integration    │
                              │  (table_type='iceberg') │
                              └───────────┬─────────────┘
                                          ▼
                                  ┌────────────────┐
                                  │  dbt           │
                                  │  on Snowflake- │
                                  │  on-Iceberg    │
                                  │  stg/int/marts │
                                  └───────┬────────┘
                                          ▼
                                  ┌────────────────┐
                                  │  Next.js       │
                                  │  /pulse,       │
                                  │  /legends,     │
                                  │  /stack        │
                                  └────────────────┘

   ┌─ Compatible (catalog-readable, not the active dbt target) ──────────┐
   │  Athena  ·  Databricks SQL  ·  Trino                                │
   │  attach to the same Polaris/Glue Iceberg catalog · same tables      │
   └─────────────────────────────────────────────────────────────────────┘
```

### Why MDLS

One Iceberg table set, written once by the Fivetran connectors, readable
by any engine with an Iceberg catalog client. We demo
Snowflake-on-Iceberg here. Athena, Databricks, and Trino read the same
catalog if needed — no re-ingest.

- `fivetran/connectors/` — 6 Fivetran Connector SDK custom connectors (Python).
- `dbt/` — 8 staging models, 3 intermediates, 3 marts. Primary target is
  Snowflake-on-Iceberg; Athena retained as alternative profile. Key mart:
  `mart_meta_predictions` (subject_type, subject_id, predicted_delta,
  confidence, primary_driver).
- App reads marts via JSON snapshots in `public/data/`; if an MDLS
  destination + engine are configured, the same shape is served from a
  live query.

## Stack

- **Data layer** — Fivetran SDK + MDLS (S3 + Iceberg + Polaris/Glue catalog)
- **Transformation** — dbt on Snowflake-on-Iceberg (Athena alternative profile retained)
- **Frontend** — Next.js 14 (App Router) · TypeScript · Tailwind, static export
- **Mobile** — every page works at 360px wide; nav collapses to an overlay
- **Demo data** — content modeled in `lib/*.ts`; the same shape is served
  from a live query when MDLS + an engine are configured
- localStorage for personal state (saved loadouts, favorited drops, redeemed tips,
  learned moves, RP tracker)
- No third-party UI libraries; primitives in `components/ui.tsx`

## Mobile

- Sticky top nav collapses to a 2-column overlay grid below `md` breakpoint
- All tables (`/pulse`, `/weapons`, `/ranked`) scroll-x with hidden scrollbars
- Map tabs scroll-x on small screens
- iOS safe-area inset applied to nav top + main bottom padding
- 15px base font on <640px to keep dense data legible without horizontal overflow
- All interactive elements are 32px+ tall (Apple HIG / Material touch target guidance)
