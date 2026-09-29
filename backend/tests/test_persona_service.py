"""Unit tests for PersonaService using an in-memory fake repository.

These prove the domain rules without touching PostgreSQL.
"""

from __future__ import annotations

from typing import Any
from uuid import UUID, uuid4

import pytest

from app.core.exceptions import ConflictError, NotFoundError
from app.models.persona import Persona
from app.schemas.persona import PersonaCreate, PersonaUpdate
from app.services.persona_service import PersonaService


class FakePersonaRepository:
    """In-memory stand-in implementing the repository contract."""

    def __init__(self) -> None:
        self.rows: dict[UUID, Persona] = {}
        self.rollback_calls = 0

    def get_by_id(self, persona_id: UUID, *, include_inactive: bool = True) -> Persona | None:
        persona = self.rows.get(persona_id)
        if persona is None:
            return None
        if not include_inactive and not persona.is_active:
            return None
        return persona

    def get_by_name(self, name: str, *, case_insensitive: bool = True) -> Persona | None:
        target = name.strip().lower()
        return next(
            (p for p in self.rows.values() if p.name.lower() == target), None
        )

    def list(self, **kwargs: Any):
        items = list(self.rows.values())
        if kwargs.get("active_only", True):
            items = [item for item in items if item.is_active]
        return items, len(items)

    def add(self, persona: Persona) -> Persona:
        persona.id = persona.id or uuid4()
        persona.is_active = True
        self.rows[persona.id] = persona
        return persona

    def update(self, persona: Persona, values: dict[str, Any]) -> Persona:
        for field, value in values.items():
            setattr(persona, field, value)
        return persona

    def deactivate(self, persona: Persona) -> Persona:
        persona.is_active = False
        return persona

    def delete(self, persona: Persona) -> None:
        self.rows.pop(persona.id, None)

    def rollback(self) -> None:
        self.rollback_calls += 1


@pytest.fixture
def repository() -> FakePersonaRepository:
    return FakePersonaRepository()


@pytest.fixture
def service(repository: FakePersonaRepository) -> PersonaService:
    return PersonaService(repository)




class TestCreate:
    def test_creates_persona(self, service: PersonaService) -> None:
        persona = service.create(_create())

        assert isinstance(persona.id, UUID)
        assert persona.name == "Doctor AI"
        assert persona.is_active is True

    def test_rejects_duplicate_name(self, service: PersonaService) -> None:
        service.create(_create())

        with pytest.raises(ConflictError):
            service.create(_create(description="Another"))

    def test_duplicate_check_is_case_insensitive(self, service: PersonaService) -> None:
        service.create(_create())

        with pytest.raises(ConflictError):
            service.create(_create(name="doctor ai"))

    def test_stores_nested_config_as_plain_dicts(self, service: PersonaService) -> None:
        persona = service.create(
            _create(
                voice_config={"style": "calm"},
                model_config={"provider": "local", "temperature": 0.4},
            )
        )

        assert persona.voice_config == {"style": "calm"}
        assert persona.model_config == {"provider": "local", "temperature": 0.4}

    def test_null_config_is_not_stored(self, service: PersonaService) -> None:
        persona = service.create(_create())

        assert persona.model_config is None
        assert persona.safety_config is None


class TestRetrieve:
    def test_get_returns_persona(self, service: PersonaService) -> None:
        created = service.create(_create())

        assert service.get(created.id).name == "Doctor AI"

    def test_get_missing_raises_not_found(self, service: PersonaService) -> None:
        with pytest.raises(NotFoundError):
            service.get(uuid4())

    def test_list_defaults_to_active_only(self, service: PersonaService) -> None:
        first = service.create(_create())
        service.create(_create(name="Actor AI", category="entertainment"))
        service.deactivate(first.id)

        items, total = service.list()

        assert total == 1
        assert items[0].name == "Actor AI"


class TestUpdate:
    def test_applies_partial_update(self, service: PersonaService) -> None:
        created = service.create(_create())

        updated = service.update(created.id, PersonaUpdate(description="New text."))

        assert updated.description == "New text."
        assert updated.name == "Doctor AI"

    def test_empty_update_is_a_no_op(self, service: PersonaService) -> None:
        created = service.create(_create())

        assert service.update(created.id, PersonaUpdate()).id == created.id

    def test_rename_to_existing_name_conflicts(self, service: PersonaService) -> None:
        first = service.create(_create())
        service.create(_create(name="Actor AI"))

        with pytest.raises(ConflictError):
            service.update(first.id, PersonaUpdate(name="Actor AI"))

    def test_rename_keeping_same_name_is_allowed(self, service: PersonaService) -> None:
        created = service.create(_create())

        assert service.update(created.id, PersonaUpdate(name="Doctor AI")).name == "Doctor AI"

    def test_config_serialised_to_dict(self, service: PersonaService) -> None:
        created = service.create(_create())

        updated = service.update(
            created.id,
            PersonaUpdate.model_validate({"safety_config": {"rules": ["a"]}}),
        )

        assert updated.safety_config == {"rules": ["a"]}


class TestDeactivate:
    def test_deactivate_sets_inactive(self, service: PersonaService) -> None:
        created = service.create(_create())

        assert service.deactivate(created.id).is_active is False

    def test_deactivate_is_idempotent(self, service: PersonaService) -> None:
        created = service.create(_create())
        service.deactivate(created.id)

        assert service.deactivate(created.id).is_active is False

    def test_deactivate_missing_raises_not_found(self, service: PersonaService) -> None:
        with pytest.raises(NotFoundError):
            service.deactivate(uuid4())

    def test_reactivate(self, service: PersonaService) -> None:
        created = service.create(_create())
        service.deactivate(created.id)

        assert service.reactivate(created.id).is_active is True

def _create(**overrides) -> PersonaCreate:
    base = {
        "name": "Doctor AI",
        "description": "A healthcare persona.",
        "category": "healthcare",
    }
    base.update(overrides)
    return PersonaCreate(**base)
