-- Most recent Predator snapshot per platform.

with src as (
    select
        snapshot_dt,
        player_id,
        platform,
        name,
        cast(rank as int)        as rank,
        cast(rp as int)           as rp,
        cast(threshold_rp as int) as threshold_rp,
        _fivetran_synced
    from {{ source('als_predator', 'predator_leaderboard') }}
),
latest as (
    select max(snapshot_dt) as snapshot_dt
    from src
)
select s.*
from src s
join latest l on s.snapshot_dt = l.snapshot_dt
