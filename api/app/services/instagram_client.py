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
    cl = Client()
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


def fetch_followers_and_following(session_dict: dict) -> FetchResult:
    """
    Fetch current followers and following lists.
    Raises LoginRequired if session is expired.
    """
    cl = _build_client(session_dict)
    info = cl.account_info()
    user_id = info.pk

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
        ig_username=info.username,
        followers=[to_ig_user(u) for u in raw_followers.values()],
        following=[to_ig_user(u) for u in raw_following.values()],
    )
