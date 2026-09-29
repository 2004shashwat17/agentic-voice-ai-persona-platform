"""Integration tests for PersonaRepository. Requires PostgreSQL."""

from __future__ import annotations

import pytest

from app.models.persona import Persona
from app.repositories.persona_repository import PersonaRepository

pytestmark = pytest.mark.integration


@pytest.fixture
def repository(persona_session) -> PersonaRepository:
    return PersonaRepository(persona_session)


def _persona(name: str = "Doctor AI", **overrides) -> Persona:
    values = {
        "name": name,
        "description": "A persona.",
        "category": "healthcare",
        "personality": ["calm"],
        "capabilities": ["voice_conversation"],
    }
    values.update(overrides)
    return Persona(**values)


class TestAddAndGet:
    def test_add_persists_and_returns_id(self, repository, persona_session) -> None:
        created = repository.add(_persona())
        persona_session.commit()

        assert created.id is not None
        assert repository.get_by_id(created.id).name == "Doctor AI"

    def test_get_missing_returns_none(self, repository) -> None:
        from uuid import uuid4

        assert repository.get_by_id(uuid4()) is None

    def test_get_by_name_is_case_insensitive(self, repository, persona_session) -> None:
        repository.add(_persona(name="Teacher AI"))
        persona_session.commit()

        assert repository.get_by_name("teacher ai").name == "Teacher AI"

    def test_exists(self, repository, persona_session) -> None:
        created = repository.add(_persona())
        persona_session.commit()

        assert repository.exists(created.id) is True


class TestList:
    def test_active_only_hides_inactive(self, repository, persona_session) -> None:
        first = repository.add(_persona(name="Doctor AI"))
        repository.add(_persona(name="Actor AI"))
        repository.deactivate(first)
        persona_session.commit()

        active, active_total = repository.list(active_only=True)
        every, total = repository.list(active_only=False)

        assert active_total == 1 and total == 2
        assert len(active) == 1 and len(every) == 2

    def test_filter_by_category(self, repository, persona_session) -> None:
        repository.add(_persona(name="Doctor AI", category="healthcare"))
        repository.add(_persona(name="Actor AI", category="entertainment"))
        persona_session.commit()

        items, total = repository.list(category="HEALTHCARE")

        assert total == 1 and items[0].name == "Doctor AI"

    def test_search_matches_name_and_description(self, repository, persona_session) -> None:
        repository.add(_persona(name="Doctor AI", description="Explains medicine."))
        persona_session.commit()

        by_name, _ = repository.list(search="doctor")
        by_description, _ = repository.list(search="medicine")

        assert len(by_name) == 1 and len(by_description) == 1

    def test_pagination(self, repository, persona_session) -> None:
        for index in range(5):
            repository.add(_persona(name=f"Persona {index}"))
        persona_session.commit()

        page, total = repository.list(limit=2, offset=0)
        next_page, _ = repository.list(limit=2, offset=2)

        assert total == 5
        assert len(page) == 2 and len(next_page) == 2


class TestMutations:
    def test_update_applies_values(self, repository, persona_session) -> None:
        created = repository.add(_persona())
        persona_session.commit()

        updated = repository.update(created, {"description": "Changed."})
        persona_session.commit()

        assert repository.get_by_id(created.id).description == "Changed."
        assert updated.description == "Changed."

    def test_deactivate_sets_flag(self, repository, persona_session) -> None:
        created = repository.add(_persona())
        persona_session.commit()

        repository.deactivate(created)
        persona_session.commit()

        assert repository.get_by_id(created.id).is_active is False

    def test_delete_removes_row(self, repository, persona_session) -> None:
        created = repository.add(_persona())
        persona_session.commit()

        repository.delete(created)
        persona_session.commit()

        assert repository.exists(created.id) is False


class TestPersistence:
    def test_jsonb_defaults_to_empty_lists(self, repository, persona_session) -> None:
        created = repository.add(
            Persona(name="X", description="d", category="c", personality=[], capabilities=[])
        )
        persona_session.commit()

        stored = repository.get_by_id(created.id)
        assert stored.personality == [] and stored.capabilities == []

    def test_config_roundtrips_as_dict(self, repository, persona_session) -> None:
        created = repository.add(
            _persona(
                voice_config={"style": "calm", "voice_id": "v1"},
                safety_config={"rules": ["a"]},
            )
        )
        persona_session.commit()

        stored = repository.get_by_id(created.id)
        assert stored.voice_config == {"style": "calm", "voice_id": "v1"}
        assert stored.safety_config == {"rules": ["a"]}
