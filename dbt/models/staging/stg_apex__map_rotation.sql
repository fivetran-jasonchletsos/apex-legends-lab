-- Latest snapshot of map rotation per playlist.

with src as (
    select
        playlist,
        snapshot_ts,
        current_map,
        cast(current_start as bigint) as current_start,
        cast(current_end as bigint)   as current_end,
        next_map,
        cast(next_start as bigint)    as next_start,
        _fivetran_synced
    from {{ source('apexlegendsapi', 'map_rotation') }}
),
ranked as (
    select *,
        row_number() over (partition by playlist order by snapshot_ts desc) as rn
    from src
)
select
    playlist,
    snapshot_ts,
    current_map,
    current_start,
    current_end,
    next_map,
    next_start,
    (current_end - extract(epoch from current_timestamp()))::int as seconds_to_swap
from ranked
where rn = 1
