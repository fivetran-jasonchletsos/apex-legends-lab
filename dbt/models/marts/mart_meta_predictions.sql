{{ config(
    materialized='incremental',
    unique_key=['subject_type','subject_id'],
    on_schema_change='append_new_columns'
) }}

-- Predicted meta-tier delta per legend or weapon. Drivers:
--   d_patch    : sum of patch-notes signed weights (S29 buffs/nerfs)
--   d_stream   : streamer pick rate vs. global baseline
--   d_reddit   : community sentiment z-score, last 7 days
--   d_form     : (legends only) pick rate delta vs. prior period

with legend_signals as (
    select * from {{ ref('int_legend_meta_signal') }}
),
weapon_signals as (
    select * from {{ ref('int_weapon_meta_signal') }}
),
unioned as (
    select 'legend'::varchar as subject_type, legend_id as subject_id,
           d_patch, d_stream, d_reddit, d_form, updated_at
    from legend_signals
    union all
    select 'weapon'::varchar, weapon_id,
           d_patch, d_stream, d_reddit, null::float, updated_at
    from weapon_signals
),
scored as (
    select
        subject_type, subject_id, updated_at,
        round(d_patch  * 1.8, 2) as s_patch,
        round(d_stream * 1.2, 2) as s_stream,
        round(d_reddit * 0.8, 2) as s_reddit,
        round(coalesce(d_form, 0) * 1.0, 2) as s_form
    from unioned
),
final as (
    select
        subject_type, subject_id, updated_at,
        greatest(-5.0, least(5.0,
            s_patch + s_stream + s_reddit + s_form
        )) as predicted_delta,
        case
            when abs(s_patch)  >= greatest(abs(s_stream), abs(s_reddit), abs(s_form)) then 'patch_change'
            when abs(s_stream) >= greatest(abs(s_reddit), abs(s_form)) then 'streamer_meta'
            when abs(s_reddit) >= abs(s_form) then 'community_sentiment'
            else 'pick_rate_form'
        end as primary_driver,
        least(1.0, 0.4
            + abs(s_patch)  * 0.15
            + abs(s_stream) * 0.10
            + abs(s_reddit) * 0.08
            + abs(s_form)   * 0.05
        )::float as confidence,
        object_construct(
            'patch',  s_patch,
            'stream', s_stream,
            'reddit', s_reddit,
            'form',   s_form
        ) as driver_breakdown_json
    from scored
)
select
    subject_type, subject_id,
    predicted_delta::number(3,1) as predicted_delta,
    confidence, primary_driver, driver_breakdown_json,
    current_timestamp() as computed_at
from final

{% if is_incremental() %}
where (subject_type, subject_id) in (
    select subject_type, subject_id from unioned
    where updated_at > (select coalesce(max(computed_at), '1970-01-01'::timestamp_tz) from {{ this }})
)
{% endif %}
