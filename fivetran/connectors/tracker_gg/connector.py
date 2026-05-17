"""Fivetran custom connector: tracker.gg Apex public API.

Pulls per-player and per-legend stats (games played, win rate, K/D,
damage, headshots). Lands into MDLS as Iceberg under bronze_tracker_gg.

Tables:
    bronze_tracker_gg.player_stats     (player_id grain)
    bronze_tracker_gg.legend_stats     (player_id × legend_id grain)
    bronze_tracker_gg.session_history  (session_id grain)
"""

from datetime import datetime, timezone
from typing import Any, Iterable

import requests
from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Logging as log
from fivetran_connector_sdk import Operations as op

BASE_URL = "https://public-api.tracker.gg/v2/apex/standard"
CHECKPOINT_EVERY = 100


def schema(configuration: dict):
    return [
        {"table": "player_stats",     "primary_key": ["player_id"]},
        {"table": "legend_stats",     "primary_key": ["player_id", "legend_id"]},
        {"table": "session_history",  "primary_key": ["session_id"]},
    ]


def _headers(configuration: dict) -> dict:
    api_key = configuration.get("api_key")
    if not api_key:
        raise ValueError("Missing required configuration field: api_key")
    return {"TRN-Api-Key": api_key, "Accept": "application/json"}


def _get(url: str, headers: dict, params: dict | None = None) -> dict:
    resp = requests.get(url, headers=headers, params=params or {}, timeout=30)
    if resp.status_code == 429:
        log.warning(f"tracker_gg 429 rate-limited on {url}")
        raise RuntimeError("rate limited")
    resp.raise_for_status()
    return resp.json()


def _flat(stat_block: dict) -> dict:
    """Tracker stat blocks come as {key: {value, displayValue, ...}}; flatten."""
    out = {}
    for k, v in (stat_block or {}).items():
        if isinstance(v, dict) and "value" in v:
            out[k] = v["value"]
    return out


def _sync_player_stats(configuration: dict, state: dict) -> Iterable[Any]:
    headers = _headers(configuration)
    watch_list = configuration.get("watch_list", [])
    if isinstance(watch_list, str):
        watch_list = [p.strip() for p in watch_list.split(",") if p.strip()]
    platform = configuration.get("platform", "origin")
    log.info(f"tracker_gg: syncing {len(watch_list)} profiles on {platform}")
    now = datetime.now(timezone.utc).isoformat()
    count = 0
    for player in watch_list:
        body = _get(f"{BASE_URL}/profile/{platform}/{player}", headers)
        data = (body or {}).get("data", {}) or {}
        platform_info = data.get("platformInfo", {}) or {}
        segments = data.get("segments", []) or []
        overview = next((s for s in segments if s.get("type") == "overview"), {}) or {}
        overview_stats = _flat(overview.get("stats", {}))

        yield op.upsert(
            table="player_stats",
            data={
                "player_id": platform_info.get("platformUserId") or player,
                "platform": platform,
                "user_handle": platform_info.get("platformUserHandle"),
                "level": overview_stats.get("level"),
                "kills": overview_stats.get("kills"),
                "damage": overview_stats.get("damage"),
                "headshots": overview_stats.get("headshots"),
                "wins": overview_stats.get("wins"),
                "rank_score": overview_stats.get("rankScore"),
                "kd": overview_stats.get("kd"),
                "_fivetran_synced": now,
            },
        )
        count += 1

        # Per-legend stats
        for seg in segments:
            if seg.get("type") != "legend":
                continue
            legend_id = seg.get("attributes", {}).get("id")
            stats = _flat(seg.get("stats", {}))
            yield op.upsert(
                table="legend_stats",
                data={
                    "player_id": platform_info.get("platformUserId") or player,
                    "legend_id": legend_id,
                    "legend_name": seg.get("metadata", {}).get("name"),
                    "kills": stats.get("kills"),
                    "damage": stats.get("damage"),
                    "headshots": stats.get("headshots"),
                    "games_played": stats.get("games"),
                    "wins": stats.get("wins"),
                    "_fivetran_synced": now,
                },
            )
        if count % CHECKPOINT_EVERY == 0:
            yield op.checkpoint(state)
    log.info(f"tracker_gg: profiles synced={count}")


def update(configuration: dict, state: dict):
    log.info(f"tracker_gg: update() starting, state={state}")
    yield from _sync_player_stats(configuration, state)
    yield op.checkpoint(state)
    log.info("tracker_gg: update() complete")


connector = Connector(update=update, schema=schema)


if __name__ == "__main__":
    connector.debug()
