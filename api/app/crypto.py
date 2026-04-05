import base64
import json
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def _get_key() -> bytes:
    key_b64 = os.environ["SESSION_ENCRYPTION_KEY"]
    return base64.b64decode(key_b64)


def encrypt_session(session_dict: dict) -> bytes:
    key = _get_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    plaintext = json.dumps(session_dict).encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return nonce + ciphertext


def decrypt_session(encrypted: bytes) -> dict:
    key = _get_key()
    aesgcm = AESGCM(key)
    nonce = encrypted[:12]
    ciphertext = encrypted[12:]
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    return json.loads(plaintext.decode("utf-8"))
