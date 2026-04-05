import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.crypto import decrypt_session, encrypt_session
from app.models import InstagramSession


def build_session_row(
    user_id: str,
    ig_user_id: str,
    ig_username: str,
    session_dict: dict,
) -> dict:
    """Build a dict ready to insert as an InstagramSession row."""
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "ig_user_id": ig_user_id,
        "ig_username": ig_username,
        "session_json_enc": encrypt_session(session_dict),
        "status": "active",
        "last_verified_at": datetime.now(timezone.utc),
    }


def parse_session_row(session_json_enc: bytes) -> dict:
    """Decrypt and return session dict from a stored row."""
    return decrypt_session(session_json_enc)


async def get_session(db: AsyncSession, user_id: str) -> Optional[InstagramSession]:
    result = await db.execute(
        select(InstagramSession).where(InstagramSession.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def upsert_session(
    db: AsyncSession,
    user_id: str,
    ig_user_id: str,
    ig_username: str,
    session_dict: dict,
) -> InstagramSession:
    """Create or replace the Instagram session for a user."""
    existing = await get_session(db, user_id)
    row_data = build_session_row(user_id, ig_user_id, ig_username, session_dict)

    if existing:
        for key, val in row_data.items():
            if key != "id":
                setattr(existing, key, val)
        await db.commit()
        await db.refresh(existing)
        return existing

    session_row = InstagramSession(**row_data)
    db.add(session_row)
    await db.commit()
    await db.refresh(session_row)
    return session_row


async def mark_needs_reconnect(db: AsyncSession, user_id: str) -> None:
    await db.execute(
        update(InstagramSession)
        .where(InstagramSession.user_id == user_id)
        .values(status="needs_reconnect")
    )
    await db.commit()


async def delete_session(db: AsyncSession, user_id: str) -> None:
    session = await get_session(db, user_id)
    if session:
        await db.delete(session)
        await db.commit()
