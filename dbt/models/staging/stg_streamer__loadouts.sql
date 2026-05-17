-- Observed legend picks per streaming session.

select
    observation_id,
    session_id,
    user_login,
    legend_id,
    cast(observed_at as timestamp) as observed_at,
    source,
    cast(confidence as float)      as confidence,
    _fivetran_synced               as updated_at
from {{ source('streamer_loadouts', 'loadout_observations') }}
