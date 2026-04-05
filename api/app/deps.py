from typing import Annotated

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session_factory


async def get_db():
    async with get_session_factory()() as session:
        yield session


def verify_internal_secret(x_internal_secret: Annotated[str, Header()]) -> None:
    from app.config import get_settings
    if x_internal_secret != get_settings().internal_secret:
        raise HTTPException(status_code=401, detail="Unauthorized")


DbDep = Annotated[AsyncSession, Depends(get_db)]
AuthDep = Annotated[None, Depends(verify_internal_secret)]
