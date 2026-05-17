-- Per-player, per-legend stat block.

select
    player_id,
    lower(legend_id)                    as legend_id,
    legend_name,
    cast(kills as int)                   as kills,
    cast(damage as float)                as damage,
    cast(headshots as int)               as headshots,
    cast(games_played as int)            as games_played,
    cast(wins as int)                    as wins,
    case when cast(games_played as int) > 0
         then cast(wins as float) / cast(games_played as int)
         else null
    end                                  as win_rate,
    _fivetran_synced                     as updated_at
from {{ source('tracker_gg', 'legend_stats') }}
