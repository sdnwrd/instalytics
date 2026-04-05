from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


_engine = None
_session_factory = None


def get_engine():
    global _engine
    if _engine is None:
        from app.config import get_settings
        import ssl as _ssl
        # Strip sslmode query param — asyncpg uses connect_args for SSL, not URL params
        url = get_settings().database_url.split("?")[0]
        ctx = _ssl.create_default_context()
        _engine = create_async_engine(url, connect_args={"ssl": ctx}, echo=False)
    return _engine


def get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _session_factory
