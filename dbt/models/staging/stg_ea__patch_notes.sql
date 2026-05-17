-- Per-subject (legend or weapon) impact rows extracted from patch notes
-- by the ea_news connector's regex tagger.

select
    patch_id,
    target_type,
    target_name,
    cast(line_no as int)        as line_no,
    line_text,
    sentiment,
    case sentiment
        when 'buff'    then  1
        when 'nerf'    then -1
        else 0
    end                          as sentiment_score,
    _fivetran_synced             as updated_at
from {{ source('ea_news', 'patch_notes') }}
