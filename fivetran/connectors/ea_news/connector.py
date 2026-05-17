"""Fivetran custom connector: EA / Respawn official news (patch notes,
designer's notes, hotfixes).

Pulls the public ea.com / respawn.com news feed via JSON-LD endpoint
and parses patch notes into per-subject impact rows.

Tables:
    bronze_ea_news.articles      (id grain)
    bronze_ea_news.patch_notes   (patch_id × target_id × line_no grain)
"""

from datetime import datetime, timezone
import re
from typing import Any, Iterable

import requests
from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Logging as log
from fivetran_connector_sdk import Operations as op

FEED_URL = "https://www.ea.com/games/apex-legends/news/feed"
CHECKPOINT_EVERY = 50

# Naive subject-tag map. dbt does the heavy lifting.
SUBJECT_PATTERNS = [
    ("legend", r"\b(Wraith|Octane|Bloodhound|Gibraltar|Lifeline|Pathfinder|Horizon|Valkyrie|Caustic|Bangalore|Wattson|Fuse|Mirage|Loba|Ash|Seer|Newcastle|Ballistic|Conduit|Vantage|Rampart|Crypto|Revenant|Catalyst|Alter|Mad Maggie|Axle)\b"),
    ("weapon", r"\b(R-301|Flatline|HAVOC|Nemesis|Hemlok|R-99|Volt|Alternator|Prowler|C\.A\.R\.|Spitfire|Rampage|Devotion|Kraber|Longbow|Sentinel|Charge Rifle|G7 Scout|30-30|Bocek|Peacekeeper|Mastiff|EVA-8|Mozambique|Wingman|P2020|RE-45)\b"),
]


def schema(configuration: dict):
    return [
        {"table": "articles",    "primary_key": ["id"]},
        {"table": "patch_notes", "primary_key": ["patch_id", "target_type", "target_name", "line_no"]},
    ]


def _get(url: str, params: dict | None = None) -> dict:
    resp = requests.get(url, params=params or {}, timeout=30, headers={"User-Agent": "apex-legends-lab/0.1"})
    resp.raise_for_status()
    return resp.json()


def update(configuration: dict, state: dict):
    log.info(f"ea_news: update() starting, state={state}")
    cursor_ts = state.get("cursor_ts") or ""
    feed = _get(configuration.get("feed_url") or FEED_URL)
    items = feed.get("items") or feed.get("data") or []
    log.info(f"ea_news: feed yielded {len(items)} items")
    count = 0
    max_ts = cursor_ts
    for item in items:
        published = item.get("publishedDate") or item.get("date") or ""
        if cursor_ts and published <= cursor_ts:
            continue
        if published > max_ts:
            max_ts = published
        article_id = item.get("id") or item.get("slug") or item.get("url")
        body = item.get("body") or item.get("html") or ""

        yield op.upsert(
            table="articles",
            data={
                "id": article_id,
                "title": item.get("title"),
                "slug": item.get("slug"),
                "url": item.get("url"),
                "published_date": published,
                "category": item.get("category"),
                "body_html": body[:50000],
                "_fivetran_synced": datetime.now(timezone.utc).isoformat(),
            },
        )

        # Parse patch-note style lines.
        if "patch" in (item.get("category") or "").lower() or "designer" in (item.get("title") or "").lower():
            for line_no, line in enumerate(body.split("\n")):
                clean = re.sub(r"<[^>]+>", "", line).strip()
                if not clean:
                    continue
                sentiment = "neutral"
                if any(w in clean.lower() for w in ("buff", "increase", "boost", "improved")):
                    sentiment = "buff"
                elif any(w in clean.lower() for w in ("nerf", "reduce", "decrease", "lower")):
                    sentiment = "nerf"
                for target_type, pat in SUBJECT_PATTERNS:
                    for m in re.finditer(pat, clean, flags=re.IGNORECASE):
                        yield op.upsert(
                            table="patch_notes",
                            data={
                                "patch_id": article_id,
                                "target_type": target_type,
                                "target_name": m.group(1),
                                "line_no": line_no,
                                "line_text": clean[:1000],
                                "sentiment": sentiment,
                                "_fivetran_synced": datetime.now(timezone.utc).isoformat(),
                            },
                        )
        count += 1
        if count % CHECKPOINT_EVERY == 0:
            state["cursor_ts"] = max_ts
            yield op.checkpoint(state)
    state["cursor_ts"] = max_ts
    log.info(f"ea_news: articles upserted={count}, cursor={max_ts}")
    yield op.checkpoint(state)


connector = Connector(update=update, schema=schema)


if __name__ == "__main__":
    connector.debug()
