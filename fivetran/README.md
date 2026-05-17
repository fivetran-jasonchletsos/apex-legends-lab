# Fivetran SDK · Custom Connectors

Six custom Fivetran Connector SDK connectors land raw Apex Legends data
into **MDLS** (Fivetran Managed Data Lake Service) as Iceberg tables on
S3 — registered in a shared Glue or Polaris catalog.

| Connector | Source | Landing schema | Cadence |
|---|---|---|---|
| `apexlegendsapi` | mozambiquehe.re REST API | `bronze_apexlegendsapi` | 15 min |
| `tracker_gg` | tracker.gg public API | `bronze_tracker_gg` | 30 min |
| `als_predator` | ALS Predator leaderboard | `bronze_als_predator` | hourly |
| `reddit_apex` | r/apexlegends + r/CompetitiveApex via OAuth | `bronze_reddit_apex` | 30 min |
| `ea_news` | EA / Respawn news + patch notes feed | `bronze_ea_news` | hourly |
| `streamer_loadouts` | Twitch Helix (top Apex streamers) | `bronze_streamer_loadouts` | 60 min |

## Run a connector locally

```bash
pip install fivetran-connector-sdk requests
cd fivetran/connectors/apexlegendsapi
# fill in configuration.json with your key
python connector.py   # uses connector.debug()
```

## Destination · MDLS

The destination is configured in the Fivetran UI as a **Managed Data
Lake Service** target, pointed at an S3 bucket + an Iceberg catalog
(Glue or Snowflake Polaris). Each connector writes to a `bronze_*`
schema; tables are created automatically from the `schema()` function.

## Why MDLS

One Iceberg table set, written once. Snowflake-on-Iceberg is the
primary read engine, but the same catalog is readable by Athena,
Databricks SQL, and Trino with zero re-ingestion. dbt runs on the
active engine target (see `dbt/profiles.example.yml`).
