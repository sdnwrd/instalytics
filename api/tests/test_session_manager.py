import os
import base64
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.session_manager import (
    build_session_row,
    parse_session_row,
)


@pytest.fixture(autouse=True)
def set_encryption_key(monkeypatch):
    key = base64.b64encode(os.urandom(32)).decode()
    monkeypatch.setenv("SESSION_ENCRYPTION_KEY", key)


def test_build_and_parse_roundtrip():
    session_dict = {"sessionid": "abc123", "user_agent": "Mozilla/5.0"}
    row = build_session_row(
        user_id="user_cuid_1",
        ig_user_id="12345678",
        ig_username="testuser",
        session_dict=session_dict,
    )
    assert row["user_id"] == "user_cuid_1"
    assert row["ig_username"] == "testuser"
    assert isinstance(row["session_json_enc"], bytes)
    assert row["status"] == "active"

    recovered = parse_session_row(row["session_json_enc"])
    assert recovered == session_dict


def test_build_session_row_status_default():
    row = build_session_row("u1", "ig1", "user1", {"sessionid": "x"})
    assert row["status"] == "active"
