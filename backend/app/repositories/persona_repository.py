"""Persistence for the Persona aggregate.

This layer only performs data access. It contains no business rules and has
no knowledge of FastAPI — services decide what is valid and what should
happen.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.persona import Persona


class PersonaRepository:
    """Data access for :class:`~app.models.persona.Persona`."""

    def __init__(self, session: Session) -> None:
        self._session = session

    # --- Reads ----------------------------------------------------------

    def get_by_id(self, persona_id: UUID, *, include_inactive: bool = True) -> Persona | None:
        """Return a persona by id, or ``None`` when it does not exist."""
        statement = select(Persona).where(Persona.id == persona_id)
        if not include_inactive:
            statement = statement.where(Persona.is_active.is_(True))
        return self._session.execute(statement).scalar_one_or_none()

    def get_by_name(self, name: str, *, case_insensitive: bool = True) -> Persona | None:
        """Return the first persona matching a name."""
        column = Persona.name
        if case_insensitive:
            column = func.lower(Persona.name)
        statement = select(Persona).where(column == name.strip().lower())
        return self._session.execute(statement).scalars().first()

    def list(
        self,
        *,
        active_only: bool = True,
        category: str | None = None,
        search: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[Persona], int]:
        """Return a page of personas plus the total number of matches."""
        filters = self._build_filters(active_only=active_only, category=category, search=search)

        count_statement = select(func.count()).select_from(Persona).where(*filters)
        total = self._session.execute(count_statement).scalar_one()

        statement: Select[tuple[Persona]] = (
            select(Persona)
            .where(*filters)
            .order_by(Persona.created_at.desc(), Persona.id.desc())
            .limit(limit)
            .offset(offset)
        )
        items = list(self._session.execute(statement).scalars().all())
        return items, total

    def exists(self, persona_id: UUID) -> bool:
        """Return whether a persona row exists (including inactive)."""
        statement = select(func.count()).select_from(Persona).where(Persona.id == persona_id)
        return self._session.execute(statement).scalar_one() > 0

    def rollback(self) -> None:
        """Roll back the current transaction.

        Used by the service to recover from integrity errors before raising a
        domain-level error.
        """
        self._session.rollback()

    # --- Writes ---------------------------------------------------------

    def add(self, persona: Persona) -> Persona:
        """Persist a new persona and return it with its id populated."""
        self._session.add(persona)
        self._session.flush()
        self._session.refresh(persona)
        return persona

    def update(self, persona: Persona, values: dict[str, Any]) -> Persona:
        """Apply a partial set of field values to a persona."""
        for field, value in values.items():
            setattr(persona, field, value)
        self._session.flush()
        self._session.refresh(persona)
        return persona

    def deactivate(self, persona: Persona) -> Persona:
        """Soft delete a persona by clearing ``is_active``."""
        persona.is_active = False
        self._session.flush()
        self._session.refresh(persona)
        return persona

    def delete(self, persona: Persona) -> None:
        """Physically remove a persona row.

        Not exposed via the API — kept for tests and future hard-delete flows.
        """
        self._session.delete(persona)
        self._session.flush()

    # --- Internals ------------------------------------------------------

    @staticmethod
    def _build_filters(
        *, active_only: bool, category: str | None, search: str | None
    ) -> list:
        """Build the shared WHERE clauses used by list and count."""
        filters: list = []
        if active_only:
            filters.append(Persona.is_active.is_(True))
        if category:
            filters.append(func.lower(Persona.category) == category.strip().lower())
        if search:
            pattern = f"%{search.strip().lower()}%"
            filters.append(
                func.lower(Persona.name).like(pattern)
                | func.lower(Persona.description).like(pattern)
            )
        return filters
