# dbt · apex_legends_lab

Builds silver (staging + intermediate) and gold (marts) on top of MDLS
Iceberg bronze tables. Primary engine: **Snowflake-on-Iceberg** (via
external volume + catalog integration). Athena retained as alternative
profile for multi-engine demos — same model SQL runs on both.

## Layout

```
models/
  sources.yml                                # bronze_<source> Iceberg sources
  staging/                                   # silver_stg (views)
    stg_apex__player_stats.sql               # union of tracker.gg + apexlegendsapi
    stg_apex__ranked_history.sql             # per-match deltas
    stg_apex__map_rotation.sql               # latest snapshot per playlist
    stg_apex__predator_leaderboard.sql       # latest top-750 snapshot
    stg_reddit__posts.sql                    # naive keyword-tagged posts
    stg_ea__patch_notes.sql                  # per-subject patch-line rows
    stg_streamer__loadouts.sql               # observed pick events
    stg_tracker__legend_stats.sql            # per-player per-legend stats
  intermediate/                              # silver_int (tables)
    int_legend_meta_signal.sql               # d_patch + d_stream + d_reddit + d_form per legend
    int_weapon_meta_signal.sql               # d_patch + d_reddit per weapon
    int_player_recent_form.sql               # rolling 10-match form, z-scored
  marts/                                     # gold (tables)
    mart_meta_predictions.sql                # predicted tier delta (powers /pulse)
    mart_player_360.sql                      # per-player aggregated view
    mart_map_rotation_active.sql             # countdown to next playlist swap
```

## Run it

```bash
pip install dbt-snowflake     # or dbt-athena-community
cp profiles.example.yml ~/.dbt/profiles.yml
# fill in real Snowflake account + external volume + catalog
dbt deps
dbt build
```

## Key mart: `mart_meta_predictions`

`(subject_type, subject_id, predicted_delta, confidence, primary_driver,
driver_breakdown_json, computed_at)`.

Same shape as the 2K LAB `mart_rating_predictions` — different drivers,
same idea: signed contribution → clamp → confidence + primary driver.
