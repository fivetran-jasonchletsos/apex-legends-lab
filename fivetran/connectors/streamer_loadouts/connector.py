"""Fivetran custom connector: Twitch + YouTube streamer observation feed.

Pulls live + recently-VODs from top Apex streamers (ImperialHal, Genburten,
Faide, etc.) and produces "loadout observations" — legend + weapon picks
visible in stream metadata / thumbnails / chapters.

Tables:
    bronze_streamer_loadouts.streamer_sessions      (session_id grain)
    bronze_streamer_loadouts.loadout_observations   (observation_id grain)
"""

from datetime import datetime, timezone
import uuid
from typing import Any, Iterable

import requests
from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Logging as log
from fivetran_connector_sdk import Operations as op

TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
TWITCH_BASE = "https://api.twitch.tv/helix"
APEX_GAME_ID = "511224"  # Apex Legends on Twitch


def schema(configuration: dict):
    return [
        {"table": "streamer_sessions",    "primary_key": ["session_id"]},
        {"table": "loadout_observations", "primary_key": ["observation_id"]},
    ]


def _twitch_token(configuration: dict) -> str:
    r = requests.post(
        TWITCH_TOKEN_URL,
        params={
            "client_id": configuration["twitch_client_id"],
            "client_secret": configuration["twitch_client_secret"],
            "grant_type": "client_credentials",
        },
        timeout=20,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def _twitch_get(url: str, token: str, client_id: str, params: dict | None = None) -> dict:
    resp = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}", "Client-Id": client_id},
        params=params or {},
        timeout=30,
    )
    if resp.status_code == 429:
        log.warning(f"streamer_loadouts 429 rate-limited on {url}")
        raise RuntimeError("rate limited")
    resp.raise_for_status()
    return resp.json()


def _sync_streams(configuration: dict, state: dict) -> Iterable[Any]:
    token = _twitch_token(configuration)
    client_id = configuration["twitch_client_id"]
    log.info("streamer_loadouts: pulling top Apex streams")
    body = _twitch_get(
        f"{TWITCH_BASE}/streams",
        token,
        client_id,
        {"game_id": APEX_GAME_ID, "first": 100},
    )
    snapshot = datetime.now(timezone.utc).isoformat()
    for stream in body.get("data", []) or []:
        session_id = f"{stream.get('user_id')}_{stream.get('started_at')}"
        yield op.upsert(
            table="streamer_sessions",
            data={
                "session_id": session_id,
                "user_id": stream.get("user_id"),
                "user_login": stream.get("user_login"),
                "user_name": stream.get("user_name"),
                "started_at": stream.get("started_at"),
                "language": stream.get("language"),
                "viewer_count": stream.get("viewer_count"),
                "title": stream.get("title"),
                "tags": ",".join(stream.get("tags") or []),
                "thumbnail_url": stream.get("thumbnail_url"),
                "_fivetran_synced": snapshot,
            },
        )

        # Naive title-parse for legend mentions.
        title_lower = (stream.get("title") or "").lower()
        for legend in [
            "wraith", "octane", "bloodhound", "horizon", "valkyrie",
            "conduit", "ash", "newcastle", "axle", "alter",
        ]:
            if legend in title_lower:
                obs_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{session_id}:{legend}"))
                yield op.upsert(
                    table="loadout_observations",
                    data={
                        "observation_id": obs_id,
                        "session_id": session_id,
                        "user_login": stream.get("user_login"),
                        "legend_id": legend,
                        "observed_at": snapshot,
                        "source": "title_parse",
                        "confidence": 0.55,
                        "_fivetran_synced": snapshot,
                    },
                )

    yield op.checkpoint(state)


def update(configuration: dict, state: dict):
    log.info(f"streamer_loadouts: update() starting, state={state}")
    yield from _sync_streams(configuration, state)
    log.info("streamer_loadouts: update() complete")


connector = Connector(update=update, schema=schema)


if __name__ == "__main__":
    connector.debug()
