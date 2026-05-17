{{ config(materialized='table') }}

-- Same shape as int_legend_meta_signal but for weapons. We don't have
-- per-player weapon stats from tracker.gg public profile, so weapons
-- only carry d_patch + d_reddit.

with patch as (
    select
        lower(target_name) as weapon_id,
        sum(sentiment_score) as raw_patch_sum
    from {{ ref('stg_ea__patch_notes') }}
    where lower(target_type) = 'weapon'
      and updated_at >= dateadd(day, -30, current_timestamp())
    group by 1
),
reddit as (
    select
        guns.weapon_id,
        sum(p.title_sentiment) as reddit_sum_7d,
        count(*)               as mentions_7d
    from {{ ref('stg_reddit__posts') }} p
    cross join (
        select 'r-301' as weapon_id        union all select 'flatline'
        union all select 'havoc'           union all select 'nemesis'
        union all select 'hemlok'          union all select 'r-99'
        union all select 'volt'            union all select 'alternator'
        union all select 'prowler'         union all select 'c.a.r.'
        union all select 'spitfire'        union all select 'rampage'
        union all select 'devotion'        union all select 'kraber'
        union all select 'longbow'         union all select 'sentinel'
        union all select 'charge rifle'    union all select 'g7 scout'
        union all select '30-30'           union all select 'bocek'
        union all select 'peacekeeper'     union all select 'mastiff'
        union all select 'eva-8'           union all select 'mozambique'
        union all select 'wingman'         union all select 'p2020'
        union all select 're-45'
    ) guns
    where lower(p.title) like '%' || guns.weapon_id || '%'
      and p.created_at >= dateadd(day, -7, current_timestamp())
    group by 1
),
combined as (
    select
        coalesce(p.weapon_id, r.weapon_id) as weapon_id,
        coalesce(p.raw_patch_sum, 0)       as raw_patch_sum,
        coalesce(r.reddit_sum_7d, 0)       as reddit_sum,
        coalesce(r.mentions_7d, 0)         as mentions_7d
    from patch p
    full outer join reddit r using (weapon_id)
)
select
    weapon_id,
    least(2.0, greatest(-2.0, raw_patch_sum * 0.5))    as d_patch,
    0.0                                                 as d_stream,
    least(2.0, greatest(-2.0, (reddit_sum / nullif(mentions_7d, 0))
                          * least(1.0, mentions_7d / 25.0))) as d_reddit,
    current_timestamp() as updated_at
from combined
