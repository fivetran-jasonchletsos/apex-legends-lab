{{ config(materialized='table') }}

-- Aggregate per-legend signals into a single row for the marts to score.
-- Three drivers:
--   d_patch   : signed sum of patch-note sentiment (clamped)
--   d_stream  : streamer pick rate vs. global baseline
--   d_reddit  : community reddit-title sentiment, last 7d
--   d_form    : pick-rate delta vs. prior 7d window

with patch as (
    select
        lower(target_name) as legend_id,
        sum(sentiment_score) as raw_patch_sum
    from {{ ref('stg_ea__patch_notes') }}
    where lower(target_type) = 'legend'
      and updated_at >= dateadd(day, -30, current_timestamp())
    group by 1
),
stream as (
    select
        lower(legend_id) as legend_id,
        count(*)         as observations_7d
    from {{ ref('stg_streamer__loadouts') }}
    where observed_at >= dateadd(day, -7, current_timestamp())
    group by 1
),
stream_baseline as (
    select avg(observations_7d) as avg_observations
    from stream
),
reddit as (
    -- Try to attribute reddit posts to legends by title-text match.
    select
        legends.legend_id,
        sum(p.title_sentiment) as reddit_sum_7d,
        count(*)               as mentions_7d
    from {{ ref('stg_reddit__posts') }} p
    cross join (
        select 'wraith' as legend_id     union all select 'octane'
        union all select 'bloodhound'    union all select 'gibraltar'
        union all select 'lifeline'      union all select 'pathfinder'
        union all select 'horizon'       union all select 'valkyrie'
        union all select 'caustic'       union all select 'bangalore'
        union all select 'wattson'       union all select 'fuse'
        union all select 'mirage'        union all select 'loba'
        union all select 'ash'           union all select 'seer'
        union all select 'newcastle'     union all select 'ballistic'
        union all select 'conduit'       union all select 'vantage'
        union all select 'rampart'       union all select 'crypto'
        union all select 'revenant'      union all select 'catalyst'
        union all select 'alter'         union all select 'mad maggie'
        union all select 'axle'
    ) legends
    where lower(p.title) like '%' || legends.legend_id || '%'
      and p.created_at >= dateadd(day, -7, current_timestamp())
    group by 1
),
stream_now as (
    select
        legend_id,
        observations_7d,
        observations_7d / nullif((select avg_observations from stream_baseline), 0) - 1.0 as pick_index
    from stream
),
stream_prior as (
    select
        lower(legend_id) as legend_id,
        count(*)         as observations_prior
    from {{ ref('stg_streamer__loadouts') }}
    where observed_at >= dateadd(day, -14, current_timestamp())
      and observed_at <  dateadd(day, -7,  current_timestamp())
    group by 1
),
form as (
    select
        n.legend_id,
        (coalesce(n.observations_7d, 0) - coalesce(p.observations_prior, 0))
            / nullif(coalesce(p.observations_prior, 1), 0) as form_delta
    from stream_now n
    left join stream_prior p using (legend_id)
)
select
    coalesce(p.legend_id, s.legend_id, r.legend_id, f.legend_id) as legend_id,
    least(2.0, greatest(-2.0, coalesce(p.raw_patch_sum, 0) * 0.5)) as d_patch,
    least(2.0, greatest(-2.0, coalesce(s.pick_index,   0) * 1.0))  as d_stream,
    least(2.0, greatest(-2.0, coalesce(r.reddit_sum_7d / nullif(r.mentions_7d, 0), 0)
                          * least(1.0, r.mentions_7d / 25.0)))     as d_reddit,
    least(2.0, greatest(-2.0, coalesce(f.form_delta, 0) * 1.0))    as d_form,
    current_timestamp() as updated_at
from patch p
full outer join stream_now s using (legend_id)
full outer join reddit r using (legend_id)
full outer join form f using (legend_id)
