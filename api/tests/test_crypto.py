import os
import pytest
from app.crypto import decrypt_session, encrypt_session


@pytest.fixture(autouse=True)
def set_encryption_key(monkeypatch):
    import base64
    key = base64.b64encode(os.urandom(32)).decode()
    monkeypatch.setenv("SESSION_ENCRYPTION_KEY", key)


def test_encrypt_returns_bytes():
    data = {"sessionid": "abc123", "user_id": "42"}
    result = encrypt_session(data)
    assert isinstance(result, bytes)
    assert len(result) > 12  # nonce (12) + ciphertext


def test_roundtrip():
    data = {"sessionid": "abc123", "user_id": "42", "nested": {"key": "value"}}
    encrypted = encrypt_session(data)
    decrypted = decrypt_session(encrypted)
    assert decrypted == data


def test_different_encryptions_produce_different_output():
    data = {"sessionid": "abc"}
    enc1 = encrypt_session(data)
    enc2 = encrypt_session(data)
    assert enc1 != enc2  # different nonces each call


def test_tampered_ciphertext_raises():
    data = {"sessionid": "abc"}
    encrypted = bytearray(encrypt_session(data))
    encrypted[-1] ^= 0xFF  # flip last byte — GCM auth tag mismatch
    with pytest.raises(Exception):
        decrypt_session(bytes(encrypted))
