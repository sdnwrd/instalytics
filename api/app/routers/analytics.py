from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.deps import AuthDep, DbDep
from app.models import Snapshot, SnapshotUser
from app.services.analytics_engine import compute_diff

router = APIRouter()


@router.get("/diff")
async def get_diff(_: AuthDep, user_id: str, db: DbDep):
    """Return the diff between the two most recent snapshots."""
    result = await db.execute(
        select(Snapshot)
        .where(Snapshot.user_id == user_id)
        .order_by(Snapshot.taken_at.desc())
        .limit(2)
    )
    snapshots = result.scalars().all()

    if len(snapshots) < 2:
        return {"unfollowers": [], "new_followers": [], "not_following_back": [], "you_dont_follow_back": []}

    curr_snap, prev_snap = snapshots[0], snapshots[1]

    async def get_users(snap_id: str):
        r = await db.execute(select(SnapshotUser).where(SnapshotUser.snapshot_id == snap_id))
        return r.scalars().all()

    curr_users = await get_users(curr_snap.id)
    prev_users = await get_users(prev_snap.id)

    return compute_diff(
        prev_followers={u.ig_user_id for u in prev_users if u.type == "follower"},
        curr_followers={u.ig_user_id for u in curr_users if u.type == "follower"},
        prev_following={u.ig_user_id for u in prev_users if u.type == "following"},
        curr_following={u.ig_user_id for u in curr_users if u.type == "following"},
    )


@router.get("/history")
async def get_history(_: AuthDep, user_id: str, db: DbDep, days: int = 30):
    """Return follower_count per snapshot for the growth chart."""
    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(Snapshot.id, Snapshot.taken_at, Snapshot.follower_count, Snapshot.following_count)
        .where(Snapshot.user_id == user_id, Snapshot.taken_at >= cutoff)
        .order_by(Snapshot.taken_at.asc())
    )
    rows = result.all()
    return [
        {
            "snapshot_id": r.id,
            "taken_at": r.taken_at.isoformat(),
            "follower_count": r.follower_count,
            "following_count": r.following_count,
        }
        for r in rows
    ]
