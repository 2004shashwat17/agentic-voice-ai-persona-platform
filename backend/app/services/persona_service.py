"""Persona business logic.

The service owns domain rules (uniqueness, required fields, deactivation
semantics) and transaction boundaries. It depends on the repository and the
schemas, but knows nothing about HTTP or FastAPI.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.exceptions import AppError, ConflictError, NotFoundError
from app.core.logging_config import get_logger
from app.models.persona import Persona
from app.repositories.persona_repository import PersonaRepository
from app.schemas.persona import PersonaCreate, PersonaUpdate

logger = get_logger(__name__)

# Schema attribute -> database column name. The public payload key is
# "model_config", so the schema uses a different attribute name to avoid
# colliding with pydantic's own settings attribute.
_CONFIG_FIELDS = ("model_provider_config", "voice_config", "knowledge_config", "safety_config")
_CONFIG_COLUMNS = {
    "model_provider_config": "model_config",
    "voice_config": "voice_config",
    "knowledge_config": "knowledge_config",
    "safety_config": "safety_config",
}


class PersonaService:
    """Application service for personas."""

    def __init__(self, repository: PersonaRepository) -> None:
        self._repository = repository

    # --- Create ---------------------------------------------------------

    def create(self, payload: PersonaCreate) -> Persona:
        """Create a persona after validating domain rules."""
        self._ensure_name_available(payload.name)

        try:
            persona = Persona(
                name=payload.name,
                description=payload.description,
                category=payload.category,
                personality=list(payload.personality),
                behavior_instructions=payload.behavior_instructions,
                capabilities=list(payload.capabilities),
                is_active=payload.is_active,
                **self._dump_configs(payload),
            )
            created = self._repository.add(persona)
            logger.info("Persona created", extra={"context": {"name": created.name}})
            return created
        except IntegrityError as exc:
            # The unique index on lower(name) is the source of truth under
            # concurrency; translate it into the same clean conflict error.
            self._repository.rollback()
            logger.warning("Persona create rejected: duplicate name")
            raise ConflictError(f"A persona named '{payload.name}' already exists.") from exc
        except SQLAlchemyError as exc:
            self._repository.rollback()
            # Never surface raw database errors to the caller.
            logger.error("Failed to create persona: %s", type(exc).__name__)
            raise AppError("Could not create persona.") from exc

    # --- Read -----------------------------------------------------------

    def get(self, persona_id: UUID, *, include_inactive: bool = True) -> Persona:
        """Return a persona or raise :class:`NotFoundError`."""
        persona = self._repository.get_by_id(
            persona_id, include_inactive=include_inactive
        )
        if persona is None:
            raise NotFoundError(f"Persona {persona_id} was not found.")
        return persona

    def list(
        self,
        *,
        active_only: bool = True,
        category: str | None = None,
        search: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[Persona], int]:
        """Return a page of personas and the total match count."""
        return self._repository.list(
            active_only=active_only,
            category=category,
            search=search,
            limit=limit,
            offset=offset,
        )

    # --- Update ---------------------------------------------------------

    def update(self, persona_id: UUID, payload: PersonaUpdate) -> Persona:
        """Apply a partial update to an existing persona."""
        persona = self.get(persona_id)

        changes = payload.model_dump(exclude_unset=True, by_alias=False)
        if not changes:
            return persona

        # Renaming must keep the name unique.
        new_name = changes.get("name")
        if new_name and new_name.lower() != persona.name.lower():
            self._ensure_name_available(new_name, exclude_id=persona_id)

        values = {
            _CONFIG_COLUMNS.get(field, field): self._dump_value(field, value)
            for field, value in changes.items()
            if value is not None
        }
        if not values:
            return persona

        try:
            updated = self._repository.update(persona, values)
        except IntegrityError as exc:
            self._repository.rollback()
            logger.warning("Persona update rejected: duplicate name")
            raise ConflictError(f"A persona named '{new_name}' already exists.") from exc
        except SQLAlchemyError as exc:
            self._repository.rollback()
            logger.error("Failed to update persona: %s", type(exc).__name__)
            raise AppError("Could not update persona.") from exc

        logger.info(
            "Persona updated", extra={"context": {"fields": sorted(values)}}
        )
        return updated

    # --- Delete ---------------------------------------------------------

    def deactivate(self, persona_id: UUID) -> Persona:
        """Soft delete a persona.

        Idempotent: deactivating an already inactive persona succeeds.
        """
        persona = self.get(persona_id)
        if not persona.is_active:
            return persona
        return self._repository.deactivate(persona)

    def reactivate(self, persona_id: UUID) -> Persona:
        """Re-activate a previously deactivated persona."""
        persona = self.get(persona_id)
        if persona.is_active:
            return persona
        updated = self._repository.update(persona, {"is_active": True})
        logger.info("Persona reactivated", extra={"context": {"id": str(persona_id)}})
        return updated

    # --- Internals ------------------------------------------------------

    def _ensure_name_available(self, name: str, *, exclude_id: UUID | None = None) -> None:
        """Raise a conflict when another persona already uses this name."""
        existing = self._repository.get_by_name(name)
        if existing is not None and existing.id != exclude_id:
            raise ConflictError(f"A persona named '{name}' already exists.")

    @classmethod
    def _dump_configs(cls, payload: PersonaCreate) -> dict[str, Any]:
        """Convert nested config models into JSON-serialisable dicts."""
        return {
            _CONFIG_COLUMNS[field]: cls._dump_value(field, getattr(payload, field))
            for field in _CONFIG_FIELDS
            if getattr(payload, field, None) is not None
        }

    @staticmethod
    def _dump_value(field: str, value: Any) -> Any:
        """Serialise nested pydantic models to dicts; pass anything else through.

        ``model_dump`` may already have flattened nested models into plain
        dicts (as it does on the update path), so both forms are accepted.
        """
        if field in _CONFIG_FIELDS and isinstance(value, BaseModel):
            return value.model_dump(exclude_none=True)
        return value
