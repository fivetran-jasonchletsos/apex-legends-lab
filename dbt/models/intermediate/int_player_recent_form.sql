{{ config(materialized='table') }}

-- Rolling N-match form per player. z-score normalized within their tier.

with base as (
    select
        player_id,
        platform,
        match_ts,
        rp_delta,
        kills,
        damage,
        placement,
        row_number() over (
            partition by player_id, platform
            order by match_ts desc
        ) as rn
    from {{ ref('stg_apex__ranked_history') }}
),
recent as (
    select *
    from base
    where rn <= {{ var('recent_window_matches') }}
),
agg as (
    select
        player_id,
        platform,
        count(*)                         as recent_matches,
        sum(rp_delta)                    as rp_sum,
        avg(rp_delta)                    as rp_avg,
        stddev(rp_delta)                 as rp_std,
        avg(kills)                       as avg_kills,
        avg(damage)                      as avg_damage,
        avg(placement)                   as avg_placement
    from recent
    group by 1, 2
),
glb as (
    select
        avg(rp_avg) as global_rp_avg,
        stddev(rp_avg) as global_rp_std
    from agg
)
select
    a.player_id,
    a.platform,
    a.recent_matches,
    a.rp_sum,
    a.rp_avg,
    a.avg_kills,
    a.avg_damage,
    a.avg_placement,
    (a.rp_avg - g.global_rp_avg) / nullif(g.global_rp_std, 0) as form_z,
    current_timestamp() as updated_at
from agg a
cross join glb g
