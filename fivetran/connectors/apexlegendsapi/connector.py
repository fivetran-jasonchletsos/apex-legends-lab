"""Fivetran custom connector: apexlegendsstatus.com / mozambiquehe.re API.

Pulls Apex Legends player and game-state data (player profile, ranked
history, map rotation, crafting rotation) into MDLS as Iceberg.

Tables registered in the MDLS catalog (Glue or Polaris):
    bronze_apexlegendsapi.player_profile
    bronze_apexlegendsapi.ranked_history
    bronze_apexlegendsapi.map_rotation
    bronze_apexlegendsapi.crafting_rotation

Any engine with an Iceberg catalog reader (Snowflake-on-Iceberg primary,
Athena/Databricks/Trino as alternates) can query these tables directly
off S3.

Auth: `Authorization` header (mozambiquehe.re free tier supports basic
endpoints). API key is supplied via `configuration.json`.

State / cursors:
    - player_profile: full refresh per watch_list player
    - ranked_history: pulled by max_seen_match_ts
    - rotations: full snapshot every run
"""

from datetime import datetime, timezone
from typing import Any, Iterable

import requests
from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Logging as log
from fivetran_connector_sdk import Operations as op

BASE_URL = "https://api.mozambiquehe.re"
CHECKPOINT_EVERY = 250


def schema(configuration: dict):
    return [
        {"table": "player_profile",     "primary_key": ["player_uid", "platform"]},
        {"table": "ranked_history",     "primary_key": ["player_uid", "match_ts"]},
        {"table": "map_rotation",       "primary_key": ["playlist", "snapshot_ts"]},
        {"table": "crafting_rotation",  "primary_key": ["bundle_id", "snapshot_ts"]},
    ]


def _headers(configuration: dict) -> dict:
    api_key = configuration.get("api_key")
    if not api_key:
        raise ValueError("Missing required configuration field: api_key")
    return {"Authorization": api_key, "Accept": "application/json"}


def _get(url: str, headers: dict, params: dict | None = None) -> dict:
    resp = requests.get(url, headers=headers, params=params or {}, timeout=30)
    if resp.status_code == 429:
        log.warning(f"apexlegendsapi 429 rate-limited on {url}")
        raise RuntimeError("rate limited")
    resp.raise_for_status()
    return resp.json()


def _sync_profiles(configuration: dict) -> Iterable[Any]:
    headers = _headers(configuration)
    watch_list = configuration.get("watch_list", [])
    if isinstance(watch_list, str):
        watch_list = [p.strip() for p in watch_list.split(",") if p.strip()]
    platform = configuration.get("platform", "PC")
    log.info(f"apexlegendsapi: syncing {len(watch_list)} profiles on {platform}")
    for player in watch_list:
        body = _get(
            f"{BASE_URL}/bridge",
            headers,
            {"version": "5", "platform": platform, "player": player},
        )
        global_ = (body or {}).get("global", {}) or {}
        realtime = (body or {}).get("realtime", {}) or {}
        legend = (body or {}).get("legends", {}) or {}
        rank = global_.get("rank", {}) or {}
        yield op.upsert(
            table="player_profile",
            data={
                "player_uid": str(global_.get("uid") or player),
                "platform": platform,
                "name": global_.get("name"),
                "level": global_.get("level"),
                "to_next_level_percent": global_.get("toNextLevelPercent"),
                "current_state": realtime.get("currentState"),
                "current_state_seconds": realtime.get("currentStateSecsAgo"),
                "selected_legend": (legend.get("selected") or {}).get("LegendName"),
                "rank_score": rank.get("rankScore"),
                "rank_name": rank.get("rankName"),
                "rank_div": rank.get("rankDiv"),
                "ladder_pos_platform": rank.get("ladderPosPlatform"),
                "_fivetran_synced": datetime.now(timezone.utc).isoformat(),
            },
        )


def _sync_ranked_history(configuration: dict, state: dict) -> Iterable[Any]:
    headers = _headers(configuration)
    watch_list = configuration.get("watch_list", [])
    if isinstance(watch_list, str):
        watch_list = [p.strip() for p in watch_list.split(",") if p.strip()]
    platform = configuration.get("platform", "PC")
    cursor_ts = state.get("ranked_cursor_ts") or 0
    log.info(f"apexlegendsapi: syncing ranked history since {cursor_ts}")
    max_ts = cursor_ts
    count = 0
    for player in watch_list:
        body = _get(
            f"{BASE_URL}/games",
            headers,
            {"player": player, "platform": platform, "auth": "1"},
        )
        for match in body or []:
            match_ts = int(match.get("end") or 0)
            if match_ts <= cursor_ts:
                continue
            if match_ts > max_ts:
                max_ts = match_ts
            yield op.upsert(
                table="ranked_history",
                data={
                    "player_uid": str(match.get("uid") or player),
                    "match_ts": match_ts,
                    "platform": platform,
                    "legend_played": match.get("legendPlayed"),
                    "rank_score_delta": match.get("rankScoreChange"),
                    "kills": (match.get("gameData") or {}).get("kills"),
                    "damage": (match.get("gameData") or {}).get("damage"),
                    "placement": (match.get("gameData") or {}).get("placement"),
                    "_fivetran_synced": datetime.now(timezone.utc).isoformat(),
                },
            )
            count += 1
            if count % CHECKPOINT_EVERY == 0:
                state["ranked_cursor_ts"] = max_ts
                yield op.checkpoint(state)
    state["ranked_cursor_ts"] = max_ts
    log.info(f"apexlegendsapi: ranked rows upserted={count}, cursor={max_ts}")


def _sync_rotations(configuration: dict) -> Iterable[Any]:
    headers = _headers(configuration)
    body = _get(f"{BASE_URL}/maprotation", headers, {"version": "2"})
    snapshot = datetime.now(timezone.utc).isoformat()
    for playlist in ("battle_royale", "ranked", "ltm", "mixtape"):
        node = (body or {}).get(playlist, {}) or {}
        current = node.get("current") or {}
        next_ = node.get("next") or {}
        yield op.upsert(
            table="map_rotation",
            data={
                "playlist": playlist,
                "snapshot_ts": snapshot,
                "current_map": current.get("map"),
                "current_start": current.get("start"),
                "current_end": current.get("end"),
                "next_map": next_.get("map"),
                "next_start": next_.get("start"),
                "_fivetran_synced": snapshot,
            },
        )

    crafting = _get(f"{BASE_URL}/crafting", headers, {})
    for bundle in crafting or []:
        for item in bundle.get("bundleContent", []) or []:
            yield op.upsert(
                table="crafting_rotation",
                data={
                    "bundle_id": bundle.get("bundle"),
                    "snapshot_ts": snapshot,
                    "bundle_type": bundle.get("bundleType"),
                    "item_name": (item or {}).get("itemType", {}).get("name"),
                    "item_rarity": (item or {}).get("itemType", {}).get("rarity"),
                    "cost": (item or {}).get("cost"),
                    "_fivetran_synced": snapshot,
                },
            )


def update(configuration: dict, state: dict):
    log.info(f"apexlegendsapi: update() starting, state={state}")
    yield from _sync_profiles(configuration)
    yield from _sync_ranked_history(configuration, state)
    yield from _sync_rotations(configuration)
    yield op.checkpoint(state)
    log.info(f"apexlegendsapi: update() complete, state={state}")


connector = Connector(update=update, schema=schema)


if __name__ == "__main__":
    connector.debug()
