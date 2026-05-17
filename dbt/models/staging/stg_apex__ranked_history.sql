-- Per-match ranked deltas from mozambiquehe.re /games endpoint.

select
    player_uid                  as player_id,
    cast(match_ts as bigint)    as match_ts,
    platform,
    legend_played,
    cast(rank_score_delta as int) as rp_delta,
    cast(kills as int)           as kills,
    cast(damage as float)        as damage,
    cast(placement as int)       as placement,
    _fivetran_synced             as updated_at
from {{ source('apexlegendsapi', 'ranked_history') }}
where match_ts is not null
