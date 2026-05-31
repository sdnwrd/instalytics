import os
from dataclasses import dataclass
from typing import Optional

from instagrapi import Client
from instagrapi.exceptions import LoginRequired, ClientError


@dataclass
class IGUser:
    ig_user_id: str
    username: str
    full_name: str


@dataclass
class FetchResult:
    ig_user_id: str
    ig_username: str
    followers: list[IGUser]
    following: list[IGUser]


def _build_client(session_dict: dict) -> Client:
    import logging
    cl = Client()
    proxy_url = os.environ.get("RESIDENTIAL_PROXY_URL")
    if proxy_url:
        cl.set_proxy(proxy_url)
        logging.info("instagram_client: using proxy %s", proxy_url[:30])
    else:
        logging.warning("instagram_client: no proxy set — RESIDENTIAL_PROXY_URL missing")
    cl.set_settings(session_dict)
    return cl


def verify_session(session_dict: dict) -> tuple[str, str]:
    """
    Verify a session is alive. Returns (ig_user_id, ig_username).
    Raises LoginRequired if the session is dead.
    """
    cl = _build_client(session_dict)
    info = cl.account_info()
    return str(info.pk), info.username


def fetch_followers_and_following(session_dict: dict, ig_user_id: str | None = None) -> FetchResult:
    """
    Fetch current followers and following lists.
    Raises LoginRequired if session is expired.
    """
    # Patch user_id into session so instagrapi uses it everywhere (rank_token, etc.)
    if ig_user_id and not session_dict.get("user_id"):
        session_dict = {**session_dict, "user_id": int(ig_user_id)}
    cl = _build_client(session_dict)
    user_id = cl.user_id or ig_user_id
    ig_username = cl.username

    raw_followers = cl.user_followers(user_id)
    raw_following = cl.user_following(user_id)

    def to_ig_user(u) -> IGUser:
        return IGUser(
            ig_user_id=str(u.pk),
            username=u.username,
            full_name=u.full_name or "",
        )

    return FetchResult(
        ig_user_id=str(user_id),
        ig_username=ig_username,
        followers=[to_ig_user(u) for u in raw_followers.values()],
        following=[to_ig_user(u) for u in raw_following.values()],
    )
