{{ config(materialized='table') }}

-- One row per player. Aggregates current tier, top legend, recent form.

with stats as (
    select * from {{ ref('stg_apex__player_stats') }}
),
form as (
    select * from {{ ref('int_player_recent_form') }}
),
top_legend as (
    select
        player_id,
        legend_id,
        legend_name,
        games_played,
        kills,
        win_rate,
        row_number() over (
            partition by player_id
            order by games_played desc nulls last
        ) as rn
    from {{ ref('stg_tracker__legend_stats') }}
)
select
    s.player_id,
    s.platform,
    s.player_name,
    s.level,
    s.rank_score,
    s.rank_name,
    s.rank_div,
    s.ladder_pos_platform,
    s.selected_legend,
    t.legend_id   as top_legend_id,
    t.legend_name as top_legend_name,
    t.games_played as top_legend_games,
    t.win_rate     as top_legend_win_rate,
    s.kills_total,
    s.damage_total,
    s.headshots_total,
    s.kd,
    f.rp_avg,
    f.form_z,
    f.avg_placement,
    s.updated_at
from stats s
left join top_legend t
  on s.player_id = t.player_id and t.rn = 1
left join form f
  on s.player_id = f.player_id and s.platform = f.platform
