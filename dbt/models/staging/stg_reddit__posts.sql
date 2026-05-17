-- Reddit posts with naive sentiment scoring keywords pre-extracted.
-- Production version would use Cortex AI / Bedrock for sentiment.

select
    id                          as post_id,
    subreddit,
    title,
    selftext,
    cast(score as int)          as score,
    cast(num_comments as int)   as num_comments,
    author,
    url,
    to_timestamp(cast(created_utc as int)) as created_at,
    case
        when lower(title) ~ '.*(buff|love|amazing|broken|busted|s tier|s-tier).*' then 1
        when lower(title) ~ '.*(nerf|hate|trash|garbage|useless|bad).*' then -1
        else 0
    end                         as title_sentiment,
    _fivetran_synced            as updated_at
from {{ source('reddit_apex', 'posts') }}
