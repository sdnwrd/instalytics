import logging
import os
import time
from dataclasses import dataclass
from typing import Optional

from instagrapi import Client
from instagrapi.exceptions import LoginRequired, ClientError


SAMSUNG_GALAXY_S23 = {
    "app_version": "302.0.0.32.110",
    "android_version": 33,
    "android_release": "13",
    "dpi": "420dpi",
    "resolution": "1080x2316",
    "manufacturer": "samsung",
    "device": "SM-S911B",
    "model": "dm1q",
    "cpu": "qcom",
    "version_code": "509302116",
}


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


def make_client(
    session_dict: Optional[dict] = None,
    ig_user_id: Optional[str] = None,
) -> Client:
    """
    Build an instagrapi Client.

    - When `session_dict` is provided, restores it and ensures
      `authorization_data["ds_user_id"]` is populated so `cl.user_id`
      resolves correctly (instagrapi ignores top-level "user_id" in settings).
    - When no session is provided (fresh login), sets a stable Samsung Galaxy
      S23 device so the first login establishes a realistic fingerprint that
      will then be persisted into the saved session.
    """
    cl = Client()
    proxy_url = os.environ.get("RESIDENTIAL_PROXY_URL")
    if proxy_url:
        cl.set_proxy(proxy_url)
        logging.info("instagram_client: using proxy %s…", proxy_url[:30])
    else:
        logging.warning("instagram_client: no proxy set — RESIDENTIAL_PROXY_URL missing")

    if session_dict:
        cl.set_settings(session_dict)
        if ig_user_id:
            auth = cl.authorization_data if isinstance(cl.authorization_data, dict) else {}
            if not auth.get("ds_user_id"):
                auth["ds_user_id"] = str(ig_user_id)
                cl.authorization_data = auth
        logging.info(
            "instagram_client: restored session — device_settings_present=%s, ds_user_id_present=%s, cl.user_id=%s",
            bool(session_dict.get("device_settings")),
            bool((cl.authorization_data or {}).get("ds_user_id")),
            cl.user_id,
        )
    else:
        cl.set_device(SAMSUNG_GALAXY_S23)
        logging.info("instagram_client: fresh client with Samsung Galaxy S23 device")

    return cl


def verify_session(session_dict: dict, ig_user_id: Optional[str] = None) -> tuple[str, str]:
    """
    Verify a session is alive. Returns (ig_user_id, ig_username).
    Raises LoginRequired if the session is dead.
    """
    cl = make_client(session_dict, ig_user_id)
    info = cl.account_info()
    return str(info.pk), info.username


def fetch_followers_and_following(
    session_dict: dict,
    ig_user_id: Optional[str] = None,
    warmup: bool = False,
) -> FetchResult:
    """
    Fetch current followers and following lists.
    Raises LoginRequired if session is expired.

    When `warmup=True`, performs human-like pre-calls (timeline + account info)
    with short sleeps before the heavy followers/following calls. This reduces
    Instagram's "PleaseWaitFewMinutes" soft-block on first fetch after login.
    """
    cl = make_client(session_dict, ig_user_id)
    user_id = cl.user_id or ig_user_id
    ig_username = cl.username

    if warmup:
        logging.info("fetch: warmup sequence starting")
        try:
            cl.get_timeline_feed()
        except Exception as e:
            logging.warning("fetch warmup: timeline_feed failed (continuing): %s", e)
        time.sleep(4)
        try:
            cl.account_info()
        except Exception as e:
            logging.warning("fetch warmup: account_info failed (continuing): %s", e)
        time.sleep(6)
        logging.info("fetch: warmup complete, proceeding to followers")

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
