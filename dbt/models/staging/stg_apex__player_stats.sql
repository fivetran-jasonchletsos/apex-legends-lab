-- Normalize tracker.gg player overview + apexlegendsapi player profile
-- into a single per-player view.

with tracker as (
    select
        player_id,
        platform,
        user_handle              as name,
        cast(level as int)        as level,
        cast(kills as int)        as kills_total,
        cast(damage as float)     as damage_total,
        cast(headshots as int)    as headshots_total,
        cast(wins as int)         as wins_total,
        cast(kd as float)         as kd,
        cast(rank_score as int)   as rank_score,
        _fivetran_synced          as updated_at
    from {{ source('tracker_gg', 'player_stats') }}
),
api as (
    select
        player_uid                as player_id,
        platform,
        name,
        cast(level as int)        as level,
        rank_name,
        cast(rank_score as int)   as rank_score,
        cast(rank_div as int)     as rank_div,
        cast(ladder_pos_platform as int) as ladder_pos_platform,
        selected_legend,
        _fivetran_synced          as updated_at
    from {{ source('apexlegendsapi', 'player_profile') }}
)
select
    coalesce(a.player_id, t.player_id)         as player_id,
    coalesce(a.platform, t.platform)            as platform,
    coalesce(a.name, t.name)                    as player_name,
    coalesce(a.level, t.level)                  as level,
    coalesce(a.rank_score, t.rank_score)        as rank_score,
    a.rank_name,
    a.rank_div,
    a.ladder_pos_platform,
    a.selected_legend,
    t.kills_total,
    t.damage_total,
    t.headshots_total,
    t.wins_total,
    t.kd,
    greatest(
        coalesce(a.updated_at, '1970-01-01'),
        coalesce(t.updated_at, '1970-01-01')
    )                                            as updated_at
from api a
full outer join tracker t
  on a.player_id = t.player_id and a.platform = t.platform
