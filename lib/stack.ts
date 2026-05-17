// ODI demo backbone — same architecture story as 2K LAB.
// Six Fivetran SDK connectors land into MDLS (S3 + Iceberg + Polaris/Glue catalog).
// Primary read engine: Snowflake-on-Iceberg via external volume + catalog integration.
// dbt runs there. Athena retained as alternative profile for multi-engine demos.

export const SOURCES = [
  {
    id: "apexlegendsapi",
    name: "Apex Legends API",
    type: "REST API",
    description:
      "Player profiles, ranked stats, map rotation, crafting rotation. Pulled from apexlegendsstatus.com / mozambiquehe.re API.",
    tables: ["player_profile", "ranked_history", "map_rotation", "crafting_rotation"],
    landingSchema: "bronze_apexlegendsapi",
    cadence: "Every 15 min",
  },
  {
    id: "tracker_gg",
    name: "Tracker.gg",
    type: "REST API",
    description:
      "Per-legend stat tracker — games played, win rate, K/D, damage, pick rate. Public profile endpoint.",
    tables: ["player_stats", "legend_stats", "session_history"],
    landingSchema: "bronze_tracker_gg",
    cadence: "Every 30 min",
  },
  {
    id: "als_predator",
    name: "ALS Predator Leaderboard",
    type: "REST API",
    description:
      "Top 750 Predator board for PC/PS5/XBox. Drives 'pro pick' data and meta legend selection.",
    tables: ["predator_leaderboard", "rp_history"],
    landingSchema: "bronze_als_predator",
    cadence: "Hourly",
  },
  {
    id: "reddit_apex",
    name: "Reddit r/apexlegends + r/CompetitiveApex",
    type: "Reddit OAuth",
    description:
      "Community sentiment on legends, weapons, maps. Hot/top posts + comment trees. Token feeds NLP scoring.",
    tables: ["posts", "comments"],
    landingSchema: "bronze_reddit_apex",
    cadence: "Every 30 min",
  },
  {
    id: "ea_news",
    name: "EA / Respawn Official News",
    type: "RSS + HTML scrape",
    description:
      "Patch notes, designer's notes, hotfix announcements. Highest-trust signal for meta change predictions.",
    tables: ["articles", "patch_notes"],
    landingSchema: "bronze_ea_news",
    cadence: "Hourly",
  },
  {
    id: "streamer_loadouts",
    name: "Twitch + YouTube Streamer Loadouts",
    type: "Twitch API + YouTube API",
    description:
      "Top Apex streamers (ImperialHal, Genburten, Faide, etc.) — gear up loadouts, legend picks, recent VOD highlights.",
    tables: ["streamer_sessions", "loadout_observations"],
    landingSchema: "bronze_streamer_loadouts",
    cadence: "Every 60 min",
  },
];

export const DBT_MODELS = {
  staging: [
    {
      name: "stg_apex__player_stats",
      description: "Apex player + legend stats normalized.",
      grain: "player_id × legend_id",
    },
    {
      name: "stg_apex__ranked_history",
      description: "Per-match ranked deltas — RP earned, placement, kills, tier.",
      grain: "match_id × player_id",
    },
    {
      name: "stg_apex__map_rotation",
      description: "Current/next BR + Mixtape rotation with timestamps.",
      grain: "rotation_id",
    },
    {
      name: "stg_apex__predator_leaderboard",
      description: "Top 750 daily snapshot for each platform.",
      grain: "snapshot_dt × player_id × platform",
    },
    {
      name: "stg_reddit__posts",
      description: "r/apexlegends + r/CompetitiveApex posts with sentiment-ready text.",
      grain: "post_id",
    },
    {
      name: "stg_ea__patch_notes",
      description: "Parsed patch notes — split into per-legend / per-weapon impact rows.",
      grain: "patch_id × target_id",
    },
    {
      name: "stg_streamer__loadouts",
      description: "Observed weapon + legend pairings from top streamers.",
      grain: "observation_id",
    },
  ],
  intermediate: [
    {
      name: "int_legend_meta_signal",
      description: "Per-legend reddit sentiment + streamer pick rate + patch impact, last 7 days.",
      grain: "legend_id",
    },
    {
      name: "int_weapon_meta_signal",
      description: "Per-weapon pick rate + community sentiment + patch impact, last 7 days.",
      grain: "weapon_id",
    },
    {
      name: "int_player_recent_form",
      description: "Rolling 5-match RP delta and K/D z-score per player.",
      grain: "player_id",
    },
  ],
  marts: [
    {
      name: "mart_meta_predictions",
      description:
        "Predicted tier delta per legend/weapon for next 7 days. Drivers: patch, streamer picks, community sentiment.",
      grain: "subject_type × subject_id",
    },
    {
      name: "mart_player_360",
      description: "Aggregated player view — ranked tier, top legends, weapon prefs, recent form.",
      grain: "player_id",
    },
    {
      name: "mart_map_rotation_active",
      description: "Currently-active BR + Mixtape maps with countdown to next swap.",
      grain: "playlist_id",
    },
  ],
};

export const RATING_PREDICTION_SQL = `{{ config(
    materialized='incremental',
    unique_key=['subject_type','subject_id'],
    on_schema_change='append_new_columns'
) }}

-- Predicted meta-tier delta per legend or weapon. Drivers:
--   d_patch    : sum of patch-notes signed weights (S29 buffs/nerfs)
--   d_stream   : streamer pick rate vs. global baseline
--   d_reddit   : community sentiment z-score, last 7 days
--   d_form     : (legends only) pick rate delta vs. prior period

with legend_signals as (
    select * from {{ ref('int_legend_meta_signal') }}
),
weapon_signals as (
    select * from {{ ref('int_weapon_meta_signal') }}
),
unioned as (
    select 'legend'::varchar as subject_type, legend_id as subject_id,
           d_patch, d_stream, d_reddit, d_form, updated_at
    from legend_signals
    union all
    select 'weapon'::varchar, weapon_id,
           d_patch, d_stream, d_reddit, null::float, updated_at
    from weapon_signals
),
scored as (
    select
        subject_type, subject_id, updated_at,
        round(d_patch  * 1.8, 2) as s_patch,
        round(d_stream * 1.2, 2) as s_stream,
        round(d_reddit * 0.8, 2) as s_reddit,
        round(coalesce(d_form, 0) * 1.0, 2) as s_form
    from unioned
),
final as (
    select
        subject_type, subject_id, updated_at,
        greatest(-5.0, least(5.0,
            s_patch + s_stream + s_reddit + s_form
        )) as predicted_delta,
        case
            when abs(s_patch)  >= greatest(abs(s_stream), abs(s_reddit), abs(s_form)) then 'patch_change'
            when abs(s_stream) >= greatest(abs(s_reddit), abs(s_form)) then 'streamer_meta'
            when abs(s_reddit) >= abs(s_form) then 'community_sentiment'
            else 'pick_rate_form'
        end as primary_driver,
        least(1.0, 0.4
            + abs(s_patch)  * 0.15
            + abs(s_stream) * 0.10
            + abs(s_reddit) * 0.08
            + abs(s_form)   * 0.05
        )::float as confidence,
        object_construct(
            'patch',  s_patch,
            'stream', s_stream,
            'reddit', s_reddit,
            'form',   s_form
        ) as driver_breakdown_json
    from scored
)
select
    subject_type, subject_id,
    predicted_delta::number(3,1) as predicted_delta,
    confidence, primary_driver, driver_breakdown_json,
    current_timestamp() as computed_at
from final

{% if is_incremental() %}
where (subject_type, subject_id) in (
    select subject_type, subject_id from unioned
    where updated_at > (select coalesce(max(computed_at), '1970-01-01'::timestamp_tz) from {{ this }})
)
{% endif %}
`;

export const FIVETRAN_SDK_SNIPPET = `# fivetran/connectors/tracker_gg/connector.py  (truncated)

from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Logging as log
from fivetran_connector_sdk import Operations as op
import requests

BASE_URL = "https://public-api.tracker.gg/v2/apex/standard"

def schema(configuration: dict):
    return [
        {"table": "player_stats",  "primary_key": ["player_id"]},
        {"table": "legend_stats",  "primary_key": ["player_id", "legend_id"]},
        {"table": "session_history","primary_key": ["session_id"]},
    ]

def update(configuration: dict, state: dict):
    headers = {"TRN-Api-Key": configuration["api_key"]}
    cursor = state.get("since") or "2026-01-01T00:00:00Z"
    for player in configuration["watch_list"]:
        r = requests.get(f"{BASE_URL}/profile/origin/{player}", headers=headers)
        r.raise_for_status()
        body = r.json()
        # rows land in MDLS Iceberg bronze_tracker_gg.player_stats
        yield op.upsert(table="player_stats", data={...})
        # ...legend_stats, session_history...
    yield op.checkpoint(state)

connector = Connector(update=update, schema=schema)`;
