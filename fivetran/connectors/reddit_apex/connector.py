"""Fivetran custom connector: Reddit OAuth for r/apexlegends + r/CompetitiveApex.

Pulls hot/top posts and top-level comments. Feeds NLP sentiment in dbt
intermediate models.

Tables:
    bronze_reddit_apex.posts     (id grain)
    bronze_reddit_apex.comments  (id grain)
"""

from datetime import datetime, timezone
from typing import Any, Iterable

import requests
from fivetran_connector_sdk import Connector
from fivetran_connector_sdk import Logging as log
from fivetran_connector_sdk import Operations as op

OAUTH_URL = "https://www.reddit.com/api/v1/access_token"
BASE_URL = "https://oauth.reddit.com"
SUBREDDITS = ("apexlegends", "CompetitiveApex")
CHECKPOINT_EVERY = 200


def schema(configuration: dict):
    return [
        {"table": "posts",    "primary_key": ["id"]},
        {"table": "comments", "primary_key": ["id"]},
    ]


def _token(configuration: dict) -> str:
    auth = requests.auth.HTTPBasicAuth(
        configuration["client_id"], configuration["client_secret"]
    )
    data = {"grant_type": "client_credentials"}
    headers = {"User-Agent": configuration.get("user_agent", "apex-legends-lab/0.1")}
    r = requests.post(OAUTH_URL, auth=auth, data=data, headers=headers, timeout=20)
    r.raise_for_status()
    return r.json()["access_token"]


def _get(url: str, token: str, ua: str, params: dict | None = None) -> dict:
    resp = requests.get(
        url,
        headers={"Authorization": f"bearer {token}", "User-Agent": ua},
        params=params or {},
        timeout=30,
    )
    if resp.status_code == 429:
        log.warning(f"reddit_apex 429 rate-limited on {url}")
        raise RuntimeError("rate limited")
    resp.raise_for_status()
    return resp.json()


def _sync_subreddit(token: str, ua: str, sub: str, state: dict) -> Iterable[Any]:
    after = state.get(f"after_{sub}")
    log.info(f"reddit_apex: syncing r/{sub} from after={after}")
    count = 0
    params = {"limit": 100}
    if after:
        params["after"] = after
    body = _get(f"{BASE_URL}/r/{sub}/new", token, ua, params)
    children = ((body or {}).get("data", {}) or {}).get("children", [])
    last_id = None
    for ch in children:
        d = (ch or {}).get("data", {}) or {}
        last_id = d.get("name") or last_id
        yield op.upsert(
            table="posts",
            data={
                "id": d.get("id"),
                "subreddit": sub,
                "title": d.get("title"),
                "selftext": d.get("selftext"),
                "score": d.get("score"),
                "num_comments": d.get("num_comments"),
                "url": d.get("url"),
                "author": d.get("author"),
                "created_utc": d.get("created_utc"),
                "_fivetran_synced": datetime.now(timezone.utc).isoformat(),
            },
        )
        count += 1
        # Sample top-level comments for the post.
        comm = _get(
            f"{BASE_URL}/r/{sub}/comments/{d.get('id')}",
            token,
            ua,
            {"limit": 30, "depth": 1},
        )
        if isinstance(comm, list) and len(comm) > 1:
            for ch_c in (comm[1].get("data", {}) or {}).get("children", []):
                cd = (ch_c or {}).get("data", {}) or {}
                if cd.get("body") is None:
                    continue
                yield op.upsert(
                    table="comments",
                    data={
                        "id": cd.get("id"),
                        "post_id": d.get("id"),
                        "subreddit": sub,
                        "body": cd.get("body"),
                        "score": cd.get("score"),
                        "author": cd.get("author"),
                        "created_utc": cd.get("created_utc"),
                        "_fivetran_synced": datetime.now(timezone.utc).isoformat(),
                    },
                )
        if count % CHECKPOINT_EVERY == 0:
            state[f"after_{sub}"] = last_id
            yield op.checkpoint(state)
    state[f"after_{sub}"] = last_id
    log.info(f"reddit_apex: r/{sub} posts upserted={count}")


def update(configuration: dict, state: dict):
    log.info(f"reddit_apex: update() starting, state={state}")
    token = _token(configuration)
    ua = configuration.get("user_agent", "apex-legends-lab/0.1")
    for sub in SUBREDDITS:
        yield from _sync_subreddit(token, ua, sub, state)
    yield op.checkpoint(state)
    log.info("reddit_apex: update() complete")


connector = Connector(update=update, schema=schema)


if __name__ == "__main__":
    connector.debug()
