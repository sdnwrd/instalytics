import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.proxy import rewrite_location, extract_sessionid_from_set_cookie


def test_rewrite_location_replaces_instagram_domain():
    result = rewrite_location(
        location="https://www.instagram.com/feed/",
        proxy_base="https://ig-proxy.instalytics.app",
    )
    assert result == "https://ig-proxy.instalytics.app/feed/"


def test_rewrite_location_non_instagram_unchanged():
    result = rewrite_location(
        location="https://other.com/page",
        proxy_base="https://ig-proxy.instalytics.app",
    )
    assert result == "https://other.com/page"


def test_rewrite_location_none_returns_none():
    result = rewrite_location(location=None, proxy_base="https://ig-proxy.instalytics.app")
    assert result is None


def test_extract_sessionid_from_set_cookie_found():
    set_cookie = "sessionid=ABC123XYZ; Domain=.instagram.com; Path=/; HttpOnly"
    result = extract_sessionid_from_set_cookie(set_cookie)
    assert result == "ABC123XYZ"


def test_extract_sessionid_from_set_cookie_not_found():
    set_cookie = "csrftoken=somevalue; Domain=.instagram.com; Path=/"
    result = extract_sessionid_from_set_cookie(set_cookie)
    assert result is None


def test_extract_sessionid_empty_string():
    result = extract_sessionid_from_set_cookie("")
    assert result is None
