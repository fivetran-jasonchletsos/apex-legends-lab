{{ config(materialized='view') }}

-- Currently-active map per playlist with seconds until the next swap.

select
    playlist,
    current_map,
    current_start,
    current_end,
    next_map,
    next_start,
    seconds_to_swap
from {{ ref('stg_apex__map_rotation') }}
