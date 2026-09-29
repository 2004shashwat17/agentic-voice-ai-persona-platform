"""Unit tests for persona schemas. No database required."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.persona import (
    MAX_DESCRIPTION_LENGTH,
    PersonaCreate,
    PersonaUpdate,
    SafetyConfig,
    VoiceConfig,
)


def _payload(**overrides) -> dict:
    base = {"name": "Doctor AI", "description": "A persona.", "category": "healthcare"}
    base.update(overrides)
    return base


class TestPersonaCreate:
    def test_minimal_payload_defaults_lists(self) -> None:
        persona = PersonaCreate(**_payload())

        assert persona.personality == []
        assert persona.capabilities == []
        assert persona.is_active is True
        assert persona.behavior_instructions is None

    def test_personality_is_normalised(self) -> None:
        persona = PersonaCreate(**_payload(personality=[" Calm ", "calm", ""]))

        assert persona.personality == ["calm"]

    def test_name_is_stripped(self) -> None:
        persona = PersonaCreate(**_payload(name="  Teacher AI  "))

        assert persona.name == "Teacher AI"

    def test_blank_name_rejected(self) -> None:
        with pytest.raises(ValidationError):
            PersonaCreate(**_payload(name="   "))

    def test_empty_name_rejected(self) -> None:
        with pytest.raises(ValidationError):
            PersonaCreate(**_payload(name=""))

    def test_overlong_description_rejected(self) -> None:
        with pytest.raises(ValidationError):
            PersonaCreate(**_payload(description="x" * (MAX_DESCRIPTION_LENGTH + 1)))

    def test_too_many_personality_entries_rejected(self) -> None:
        with pytest.raises(ValidationError):
            PersonaCreate(**_payload(personality=[f"t{i}" for i in range(51)]))

    def test_model_config_alias_is_accepted(self) -> None:
        persona = PersonaCreate(**_payload(model_config={"provider": "local"}))

        assert persona.model_provider_config is not None
        assert persona.model_provider_config.provider == "local"

    def test_voice_config_is_parsed(self) -> None:
        persona = PersonaCreate(**_payload(voice_config={"style": "calm"}))

        assert persona.voice_config == VoiceConfig(provider=None, voice_id=None, style="calm")

    def test_safety_config_collects_rules(self) -> None:
        persona = PersonaCreate(
            **_payload(safety_config={"rules": ["informational only"], "disclaimer": "x"})
        )

        assert persona.safety_config == SafetyConfig(
            rules=["informational only"], disclaimer="x", require_disclaimer=False
        )

    def test_unknown_config_keys_are_preserved(self) -> None:
        """Config blocks are extensible for later subsystems."""
        persona = PersonaCreate(**_payload(voice_config={"style": "calm", "pitch": 0.4}))

        assert persona.voice_config is not None
        assert persona.voice_config.model_dump()["pitch"] == 0.4


class TestPersonaUpdate:
    def test_all_fields_optional(self) -> None:
        assert PersonaUpdate().model_dump(exclude_unset=True) == {}

    def test_exclude_unset_distinguishes_absent_from_null(self) -> None:
        update = PersonaUpdate.model_validate({"name": "New"})

        assert update.model_dump(exclude_unset=True) == {"name": "New"}

    def test_blank_optional_name_rejected(self) -> None:
        with pytest.raises(ValidationError):
            PersonaUpdate(name="   ")

    def test_personality_none_is_allowed(self) -> None:
        assert PersonaUpdate.model_validate({"personality": None}).personality is None
