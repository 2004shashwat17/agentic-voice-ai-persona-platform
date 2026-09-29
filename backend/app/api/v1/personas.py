"""Persona routes.

Handlers stay thin: they resolve dependencies, delegate to
:class:`~app.services.persona_service.PersonaService` and map the result to a
response. No SQL and no business rules live here.
"""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.api.deps import PersonaServiceDep
from app.schemas.persona import (
    PersonaCreate,
    PersonaDeactivateResponse,
    PersonaListResponse,
    PersonaResponse,
    PersonaUpdate,
)

router = APIRouter(prefix="/personas", tags=["personas"])


@router.get(
    "",
    response_model=PersonaListResponse,
    summary="List personas",
)
async def list_personas(
    service: PersonaServiceDep,
    active_only: Annotated[bool, Query(description="Hide deactivated personas.")] = True,
    category: Annotated[str | None, Query(description="Filter by category.")] = None,
    search: Annotated[str | None, Query(description="Match name or description.")] = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> PersonaListResponse:
    """Return a paginated list of personas."""
    items, total = service.list(
        active_only=active_only,
        category=category,
        search=search,
        limit=limit,
        offset=offset,
    )
    return PersonaListResponse(
        items=[PersonaResponse.model_validate(item) for item in items],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{persona_id}",
    response_model=PersonaResponse,
    summary="Get a persona",
)
async def get_persona(
    persona_id: UUID,
    service: PersonaServiceDep,
) -> PersonaResponse:
    """Return a single persona by id."""
    return PersonaResponse.model_validate(service.get(persona_id))


@router.post(
    "",
    response_model=PersonaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a persona",
)
async def create_persona(
    payload: PersonaCreate,
    service: PersonaServiceDep,
) -> PersonaResponse:
    """Create a new persona."""
    return PersonaResponse.model_validate(service.create(payload))


@router.patch(
    "/{persona_id}",
    response_model=PersonaResponse,
    summary="Update a persona",
)
async def update_persona(
    persona_id: UUID,
    payload: PersonaUpdate,
    service: PersonaServiceDep,
) -> PersonaResponse:
    """Apply a partial update to a persona."""
    return PersonaResponse.model_validate(service.update(persona_id, payload))


@router.delete(
    "/{persona_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Deactivate a persona",
)
async def deactivate_persona(
    persona_id: UUID,
    service: PersonaServiceDep,
) -> Response:
    """Soft delete a persona by deactivating it."""
    service.deactivate(persona_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{persona_id}/activate",
    response_model=PersonaDeactivateResponse,
    summary="Reactivate a persona",
)
async def reactivate_persona(
    persona_id: UUID,
    service: PersonaServiceDep,
) -> PersonaDeactivateResponse:
    """Re-activate a previously deactivated persona."""
    persona = service.reactivate(persona_id)
    return PersonaDeactivateResponse(
        id=persona.id,
        is_active=persona.is_active,
        message="Persona reactivated.",
    )
