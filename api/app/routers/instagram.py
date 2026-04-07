import os
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from instagrapi import Client
from instagrapi.exceptions import (
    BadPassword,
    ChallengeRequired,
    LoginRequired,
    TwoFactorRequired,
)
from pydantic import BaseModel
from sqlalchemy import select

from app.config import get_settings
from app.crypto import decrypt_session, encrypt_session
from app.deps import AuthDep, DbDep
from app.models import InstagramSession, Snapshot, SnapshotUser
from app.services.analytics_engine import compute_diff
from app.services.instagram_client import fetch_followers_and_following, verify_session
from app.services.proxy import forward_request
from app.services.session_manager import (
    delete_session,
    get_session,
    mark_needs_reconnect,
    upsert_session,
)

router = APIRouter()

# In-memory store for proxy tokens (TTL 10 min). In production, use Redis or DB table.
_proxy_tokens: dict[str, dict] = {}

# In-memory store for pending logins awaiting 2FA/challenge code
_pending_logins: dict[str, dict] = {}


def _make_client() -> Client:
    cl = Client()
    proxy_url = os.environ.get("RESIDENTIAL_PROXY_URL")
    if proxy_url:
        cl.set_proxy(proxy_url)
    return cl


class InitConnectResponse(BaseModel):
    proxy_url: str
    token: str


class VerifyRequest(BaseModel):
    token: str
    user_id: str


class StatusResponse(BaseModel):
    connected: bool
    ig_username: Optional[str]
    status: Optional[str]
    cooldown_seconds: Optional[int]


class ConnectRequest(BaseModel):
    username: str
    password: str
    user_id: str


class ResolveChallengeRequest(BaseModel):
    session_id: str
    code: str
    user_id: str


@router.post("/connect")
async def connect_instagram(_: AuthDep, body: ConnectRequest, db: DbDep):
    """Login with username/password. Returns connected or challenge info."""
    cl = _make_client()
    try:
        cl.login(body.username, body.password)
        session_dict = cl.get_settings()
        await upsert_session(db, body.user_id, str(cl.user_id), cl.username, session_dict)
        return {"connected": True, "ig_username": cl.username}

    except TwoFactorRequired:
        session_id = str(uuid.uuid4())
        two_factor_info = (cl.last_json or {}).get("two_factor_info", {})
        _pending_logins[session_id] = {
            "type": "2fa",
            "client": cl,
            "username": body.username,
            "two_factor_identifier": two_factor_info.get("two_factor_identifier", ""),
            "user_id": body.user_id,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        }
        return {"requires_challenge": True, "challenge_type": "2fa", "session_id": session_id}

    except ChallengeRequired:
        session_id = str(uuid.uuid4())
        # Initiate the challenge so Instagram sends the SMS/email code
        try:
            cl.challenge_resolve(cl.last_json)
        except Exception:
            pass
        _pending_logins[session_id] = {
            "type": "challenge",
            "client": cl,
            "user_id": body.user_id,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        }
        return {"requires_challenge": True, "challenge_type": "security_code", "session_id": session_id}

    except BadPassword:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    except TypeError as e:
        if "NoneType" in str(e):
            last = cl.last_json or {}
            msg = last.get("message", "")
            if "wait" in msg.lower() or "few minutes" in msg.lower():
                raise HTTPException(
                    status_code=429,
                    detail="Instagram is temporarily rate-limiting this server. Please wait 5–10 minutes and try again."
                )
            raise HTTPException(status_code=422, detail="Instagram returned an unexpected response. Please try again in a few minutes.")
        raise HTTPException(status_code=422, detail=f"Login failed: {str(e)}")

    except Exception as e:
        import traceback, logging
        logging.error("connect_instagram failed [%s]: %s", type(e).__name__, traceback.format_exc())
        raise HTTPException(status_code=422, detail=f"Login failed [{type(e).__name__}]: {str(e)}")


@router.post("/resolve-challenge")
async def resolve_challenge(_: AuthDep, body: ResolveChallengeRequest, db: DbDep):
    """Submit a 2FA or security challenge code to complete login."""
    pending = _pending_logins.get(body.session_id)
    if not pending:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    if datetime.now(timezone.utc) > pending["expires_at"]:
        _pending_logins.pop(body.session_id, None)
        raise HTTPException(status_code=410, detail="Session expired, please start over")

    try:
        cl: Client = pending["client"]
        if pending["type"] == "2fa":
            # POST directly to two_factor_login — avoids re-initiating login (which sends a new code)
            cl.private_request(
                "accounts/two_factor_login/",
                {
                    "username": pending["username"],
                    "verificationCode": body.code.strip(),
                    "identifier": pending.get("two_factor_identifier", ""),
                    "trustThisDevice": "0",
                    "phoneId": cl.phone_id,
                    "_csrftoken": cl.token,
                    "_uuid": cl.uuid,
                    "deviceId": cl.android_device_id,
                },
                login=True,
            )
        else:
            cl.challenge_send_security_code(body.code.strip())

        session_dict = cl.get_settings()
        await upsert_session(db, body.user_id, str(cl.user_id), cl.username, session_dict)
        _pending_logins.pop(body.session_id, None)
        return {"connected": True, "ig_username": cl.username}

    except Exception as e:
        raise HTTPException(status_code=422, detail=f"[{pending.get('type')}] {str(e)}")


@router.post("/init-connect", response_model=InitConnectResponse)
async def init_connect(_: AuthDep, user_id: str):
    token = str(uuid.uuid4())
    _proxy_tokens[token] = {
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
    }
    proxy_url = f"{get_settings().proxy_base_url}/accounts/login/?token={token}"
    return InitConnectResponse(proxy_url=proxy_url, token=token)


@router.post("/verify-session")
async def verify_session_endpoint(_: AuthDep, body: VerifyRequest, db: DbDep):
    token_data = _proxy_tokens.get(body.token)
    if not token_data:
        raise HTTPException(status_code=404, detail="Token not found or expired")
    if datetime.now(timezone.utc) > token_data["expires_at"]:
        del _proxy_tokens[body.token]
        raise HTTPException(status_code=410, detail="Token expired")
    if token_data["user_id"] != body.user_id:
        raise HTTPException(status_code=403, detail="Token user mismatch")

    session_enc = token_data.get("session_enc")
    if not session_enc:
        raise HTTPException(status_code=400, detail="Session not captured yet")

    session_dict = decrypt_session(session_enc)
    try:
        ig_user_id, ig_username = verify_session(session_dict)
    except Exception:
        raise HTTPException(status_code=422, detail="Instagram session invalid")

    await upsert_session(db, body.user_id, ig_user_id, ig_username, session_dict)
    del _proxy_tokens[body.token]
    return {"connected": True, "ig_username": ig_username}


@router.get("/status", response_model=StatusResponse)
async def get_status(_: AuthDep, user_id: str, db: DbDep):
    session = await get_session(db, user_id)
    if not session:
        return StatusResponse(connected=False, ig_username=None, status=None, cooldown_seconds=None)

    cooldown_seconds = None
    result = await db.execute(
        select(Snapshot)
        .where(Snapshot.user_id == user_id)
        .order_by(Snapshot.taken_at.desc())
        .limit(1)
    )
    last_snapshot = result.scalar_one_or_none()
    if last_snapshot:
        elapsed = (datetime.now(timezone.utc) - last_snapshot.taken_at).total_seconds()
        remaining = 3600 - int(elapsed)
        if remaining > 0:
            cooldown_seconds = remaining

    return StatusResponse(
        connected=True,
        ig_username=session.ig_username,
        status=session.status,
        cooldown_seconds=cooldown_seconds,
    )


@router.post("/fetch")
async def fetch_snapshot(_: AuthDep, user_id: str, db: DbDep):
    session = await get_session(db, user_id)
    if not session:
        raise HTTPException(status_code=404, detail="No Instagram session found")
    if session.status == "needs_reconnect":
        raise HTTPException(status_code=409, detail="Session needs reconnect")

    result = await db.execute(
        select(Snapshot)
        .where(Snapshot.user_id == user_id)
        .order_by(Snapshot.taken_at.desc())
        .limit(1)
    )
    last_snapshot = result.scalar_one_or_none()
    if last_snapshot:
        elapsed = (datetime.now(timezone.utc) - last_snapshot.taken_at).total_seconds()
        if elapsed < 3600:
            raise HTTPException(
                status_code=429,
                detail={"message": "Cooldown active", "retry_after": int(3600 - elapsed)},
            )

    session_dict = decrypt_session(session.session_json_enc)

    try:
        fetch_result = fetch_followers_and_following(session_dict)
    except LoginRequired:
        await mark_needs_reconnect(db, user_id)
        raise HTTPException(status_code=401, detail="Instagram session expired")

    snapshot_id = str(uuid.uuid4())
    new_snapshot = Snapshot(
        id=snapshot_id,
        user_id=user_id,
        follower_count=len(fetch_result.followers),
        following_count=len(fetch_result.following),
    )
    db.add(new_snapshot)

    for u in fetch_result.followers:
        db.add(SnapshotUser(
            id=str(uuid.uuid4()),
            snapshot_id=snapshot_id,
            ig_user_id=u.ig_user_id,
            username=u.username,
            full_name=u.full_name,
            type="follower",
        ))
    for u in fetch_result.following:
        db.add(SnapshotUser(
            id=str(uuid.uuid4()),
            snapshot_id=snapshot_id,
            ig_user_id=u.ig_user_id,
            username=u.username,
            full_name=u.full_name,
            type="following",
        ))

    await db.commit()

    diff = {"unfollowers": [], "new_followers": [], "not_following_back": [], "you_dont_follow_back": []}
    if last_snapshot:
        prev_result = await db.execute(
            select(SnapshotUser).where(SnapshotUser.snapshot_id == last_snapshot.id)
        )
        prev_users = prev_result.scalars().all()
        prev_followers = {u.ig_user_id for u in prev_users if u.type == "follower"}
        prev_following = {u.ig_user_id for u in prev_users if u.type == "following"}
        curr_followers = {u.ig_user_id for u in fetch_result.followers}
        curr_following = {u.ig_user_id for u in fetch_result.following}
        diff = compute_diff(prev_followers, curr_followers, prev_following, curr_following)

    return {
        "snapshot_id": snapshot_id,
        "follower_count": len(fetch_result.followers),
        "following_count": len(fetch_result.following),
        **diff,
    }


@router.delete("/session")
async def revoke_session(_: AuthDep, user_id: str, db: DbDep):
    await delete_session(db, user_id)
    return {"deleted": True}


# Proxy catch-all — handles all /instagram/proxy/* paths
@router.api_route("/proxy/{path:path}", methods=["GET", "POST"])
async def proxy_handler(request: Request, path: str, token: str = ""):
    response, sessionid = await forward_request(request, path, get_settings().proxy_base_url, token)

    if sessionid and token and token in _proxy_tokens:
        from instagrapi import Client
        cl = Client()
        try:
            cl.login_by_sessionid(sessionid)
            session_dict = cl.get_settings()
            _proxy_tokens[token]["session_enc"] = encrypt_session(session_dict)
        except Exception:
            pass  # session capture failed silently

    return response
