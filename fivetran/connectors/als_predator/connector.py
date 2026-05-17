"""Fivetran custom connector: ALS Predator Leaderboard.

Snapshots the top 750 Predator players on PC / PS5 / Xbox each run.
Tables:
    bronze_als_predator.predator_leaderboard  (snapshot_dt × player_id × platform)
    bronze_als_predator.rp_history            (player_id × snapshot_dt)
"""

from datetime import datetime, timezone
from typing import Any, Iterable

import requests
from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Logging as log
from fivetran_connector_sdk import Operations as op

BASE_URL = "https://api.mozambiquehe.re"
PLATFORMS = ("PC", "PS4", "X1")


def schema(configuration: dict):
    return [
        {"table": "predator_leaderboard", "primary_key": ["snapshot_dt", "player_id", "platform"]},
        {"table": "rp_history",            "primary_key": ["player_id", "snapshot_dt", "platform"]},
    ]


def _headers(configuration: dict) -> dict:
    api_key = configuration.get("api_key")
    if not api_key:
        raise ValueError("Missing required configuration field: api_key")
    return {"Authorization": api_key, "Accept": "application/json"}


def _get(url: str, headers: dict, params: dict | None = None) -> dict:
    resp = requests.get(url, headers=headers, params=params or {}, timeout=30)
    if resp.status_code == 429:
        log.warning(f"als_predator 429 rate-limited on {url}")
        raise RuntimeError("rate limited")
    resp.raise_for_status()
    return resp.json()


def update(configuration: dict, state: dict):
    log.info(f"als_predator: update() starting, state={state}")
    headers = _headers(configuration)
    snapshot_dt = datetime.now(timezone.utc).date().isoformat()
    snapshot_ts = datetime.now(timezone.utc).isoformat()

    body = _get(f"{BASE_URL}/predator", headers, {})
    rp_section = (body or {}).get("RP", {}) or {}
    for platform in PLATFORMS:
        platform_node = rp_section.get(platform, {}) or {}
        threshold = platform_node.get("val")
        total = platform_node.get("totalMastersAndPreds")
        log.info(f"als_predator: platform={platform} threshold={threshold} total={total}")

        # Pull the full leaderboard for this platform.
        board = _get(
            f"{BASE_URL}/bridge",
            headers,
            {"version": "5", "platform": platform, "raw_data": "predator_leaderboard"},
        ) or {}
        leaderboard = board.get("leaderboard", []) or []
        for entry in leaderboard:
            yield op.upsert(
                table="predator_leaderboard",
                data={
                    "snapshot_dt": snapshot_dt,
                    "player_id": str(entry.get("uid") or entry.get("name")),
                    "platform": platform,
                    "name": entry.get("name"),
                    "rank": entry.get("rank"),
                    "rp": entry.get("rankScore"),
                    "threshold_rp": threshold,
                    "_fivetran_synced": snapshot_ts,
                },
            )
            yield op.upsert(
                table="rp_history",
                data={
                    "player_id": str(entry.get("uid") or entry.get("name")),
                    "snapshot_dt": snapshot_dt,
                    "platform": platform,
                    "rp": entry.get("rankScore"),
                    "_fivetran_synced": snapshot_ts,
                },
            )

    yield op.checkpoint(state)
    log.info("als_predator: update() complete")


connector = Connector(update=update, schema=schema)


if __name__ == "__main__":
    connector.debug()
