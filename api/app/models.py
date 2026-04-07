from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, LargeBinary, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class InstagramSession(Base):
    __tablename__ = "instagram_sessions"

    # Column names match Prisma-created camelCase columns in Supabase
    id: Mapped[str] = mapped_column("id", String, primary_key=True)
    user_id: Mapped[str] = mapped_column("userId", String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    ig_user_id: Mapped[str] = mapped_column("igUserId", String, nullable=False)
    ig_username: Mapped[str] = mapped_column("igUsername", String, nullable=False)
    session_json_enc: Mapped[bytes] = mapped_column("sessionJsonEnc", LargeBinary, nullable=False)
    status: Mapped[str] = mapped_column("status", String, default="active")
    last_verified_at: Mapped[datetime | None] = mapped_column("lastVerifiedAt", DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column("createdAt", DateTime(timezone=True), server_default=func.now())


class Snapshot(Base):
    __tablename__ = "snapshots"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    follower_count: Mapped[int] = mapped_column(Integer, nullable=False)
    following_count: Mapped[int] = mapped_column(Integer, nullable=False)

    snapshot_users: Mapped[list["SnapshotUser"]] = relationship(back_populates="snapshot")


class SnapshotUser(Base):
    __tablename__ = "snapshot_users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    snapshot_id: Mapped[str] = mapped_column(String, ForeignKey("snapshots.id", ondelete="CASCADE"), nullable=False)
    ig_user_id: Mapped[str] = mapped_column(String, nullable=False)
    username: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    type: Mapped[str] = mapped_column(String, nullable=False)  # follower | following

    snapshot: Mapped["Snapshot"] = relationship(back_populates="snapshot_users")

    __table_args__ = (
        Index("idx_snapshot_users_snapshot_type", "snapshot_id", "type"),
    )


# Minimal User stub — FK target only. Actual User table is managed by Prisma/NextAuth.
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
