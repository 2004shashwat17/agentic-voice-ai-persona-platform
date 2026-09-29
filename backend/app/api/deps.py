"""API dependencies.

Shared FastAPI dependencies used by route handlers. Wiring lives here so the
service and repository stay free of framework concerns.
"""

from __future__ import annotations

from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.repositories.persona_repository import PersonaRepository
from app.services.persona_service import PersonaService


def get_db_session() -> Iterator[Session]:
    """Yield a database session for the lifetime of a request.

    Declared as a generator dependency so FastAPI closes the session and
    releases the pooled connection once the response is sent. Tests override
    this dependency to run against an isolated session.
    """
    yield from get_db()


def get_persona_repository(
    session: Annotated[Session, Depends(get_db_session)],
) -> PersonaRepository:
    """Build a persona repository bound to the current session."""
    return PersonaRepository(session)


def get_persona_service(
    repository: Annotated[PersonaRepository, Depends(get_persona_repository)],
) -> PersonaService:
    """Build the persona service for a request."""
    return PersonaService(repository)


SettingsDep = Annotated[Settings, Depends(get_settings)]
DbSessionDep = Annotated[Session, Depends(get_db_session)]
PersonaRepositoryDep = Annotated[PersonaRepository, Depends(get_persona_repository)]
PersonaServiceDep = Annotated[PersonaService, Depends(get_persona_service)]


