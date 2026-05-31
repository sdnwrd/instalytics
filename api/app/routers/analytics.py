from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.deps import AuthDep, DbDep
from app.models import Snapshot, SnapshotUser
from app.services.analytics_engine import compute_diff

router = APIRouter()


def _to_user_objects(ig_user_ids: list[str], lookup: dict) -> list[dict]:
    """Convert a list of ig_user_ids to full user objects using a lookup dict."""
    result = []
    for uid in ig_user_ids:
        u = lookup.get(uid)
        if u:
            result.append({"ig_user_id": u.ig_user_id, "username": u.username, "full_name": u.full_name or ""})
    return result


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

    if not snapshots:
        return {"unfollowers": [], "new_followers": [], "not_following_back": [], "you_dont_follow_back": []}

    async def get_users(snap_id: str):
        r = await db.execute(select(SnapshotUser).where(SnapshotUser.snapshot_id == snap_id))
        return r.scalars().all()

    curr_snap = snapshots[0]
    curr_users = await get_users(curr_snap.id)
    curr_lookup = {u.ig_user_id: u for u in curr_users}
    curr_followers = {u.ig_user_id for u in curr_users if u.type == "follower"}
    curr_following = {u.ig_user_id for u in curr_users if u.type == "following"}

    if len(snapshots) < 2:
        diff = compute_diff(
            prev_followers=curr_followers,
            curr_followers=curr_followers,
            prev_following=curr_following,
            curr_following=curr_following,
        )
    else:
        prev_snap = snapshots[1]
        prev_users = await get_users(prev_snap.id)
        prev_lookup = {u.ig_user_id: u for u in prev_users}
        diff = compute_diff(
            prev_followers={u.ig_user_id for u in prev_users if u.type == "follower"},
            curr_followers=curr_followers,
            prev_following={u.ig_user_id for u in prev_users if u.type == "following"},
            curr_following=curr_following,
        )
        # For unfollowers/new_followers, fall back to prev_lookup for users not in curr
        combined_lookup = {**prev_lookup, **curr_lookup}
        return {
            "unfollowers": _to_user_objects(diff["unfollowers"], combined_lookup),
            "new_followers": _to_user_objects(diff["new_followers"], combined_lookup),
            "not_following_back": _to_user_objects(diff["not_following_back"], curr_lookup),
            "you_dont_follow_back": _to_user_objects(diff["you_dont_follow_back"], curr_lookup),
        }

    return {
        "unfollowers": [],
        "new_followers": [],
        "not_following_back": _to_user_objects(diff["not_following_back"], curr_lookup),
        "you_dont_follow_back": _to_user_objects(diff["you_dont_follow_back"], curr_lookup),
    }


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
