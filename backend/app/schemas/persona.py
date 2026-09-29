"""Pydantic schemas for the Persona resource.

Requests and responses are deliberately decoupled: ``PersonaUpdate`` is a
partial model and the response exposes only intended fields. No database
internals leak through these schemas.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_NAME_LENGTH = 120
MAX_DESCRIPTION_LENGTH = 2000
MAX_BEHAVIOR_LENGTH = 8000
MAX_LIST_ITEMS = 50


def _normalise_tags(values: list[str]) -> list[str]:
    """Trim, lowercase, de-duplicate and drop empty entries from a tag list."""
    seen: dict[str, None] = {}
    for value in values:
        cleaned = value.strip().lower()
        if cleaned:
            seen.setdefault(cleaned, None)
    return list(seen)


class PersonaConfigBase(BaseModel):
    """Base for free-form subsystem configuration blocks."""

    model_config = ConfigDict(extra="allow")


class ModelProviderConfig(PersonaConfigBase):
    """References the model subsystem configured in a later step."""

    provider: str | None = None
    model: str | None = None
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)


class VoiceConfig(PersonaConfigBase):
    """References the voice subsystem configured in a later step."""

    provider: str | None = None
    voice_id: str | None = None
    style: str | None = None


class KnowledgeConfig(PersonaConfigBase):
    """References the knowledge/RAG subsystem configured in a later step."""

    enabled: bool = False
    source_count: int | None = Field(default=None, ge=0)
    status: str | None = None


class SafetyConfig(PersonaConfigBase):
    """Safety rules and disclaimers owned by the persona."""

    rules: list[str] = Field(default_factory=list)
    disclaimer: str | None = None
    require_disclaimer: bool = False


class PersonaBase(BaseModel):
    """Fields shared by persona create and update payloads."""

    name: str = Field(min_length=1, max_length=MAX_NAME_LENGTH)
    description: str = Field(min_length=1, max_length=MAX_DESCRIPTION_LENGTH)
    category: str = Field(min_length=1, max_length=80)
    personality: list[str] = Field(default_factory=list)
    behavior_instructions: str | None = Field(
        default=None, max_length=MAX_BEHAVIOR_LENGTH
    )
    # Aliased so the public payload key is "model_config" while the Python
    # attribute avoids shadowing pydantic's own ``model_config`` setting.
    model_provider_config: ModelProviderConfig | None = Field(
        default=None, alias="model_config"
    )
    voice_config: VoiceConfig | None = None
    knowledge_config: KnowledgeConfig | None = None
    safety_config: SafetyConfig | None = None
    capabilities: list[str] = Field(default_factory=list)
    is_active: bool = True

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("personality", "capabilities")
    @classmethod
    def _validate_tags(cls, value: list[str]) -> list[str]:
        if len(value) > MAX_LIST_ITEMS:
            raise ValueError(f"at most {MAX_LIST_ITEMS} entries are allowed")
        return _normalise_tags(value)

    @field_validator("name", "category", "description")
    @classmethod
    def _validate_stripped(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be blank")
        return cleaned


class PersonaCreate(PersonaBase):
    """Payload for creating a persona."""


class PersonaUpdate(BaseModel):
    """Partial payload for updating a persona.

    Every field is optional; only supplied fields are applied. A field cannot
    be distinguished from "explicitly set to null" for the optional config
    blocks, which is intentional for this iteration.
    """

    model_config = ConfigDict(populate_by_name=True)

    name: str | None = Field(default=None, min_length=1, max_length=MAX_NAME_LENGTH)
    description: str | None = Field(
        default=None, min_length=1, max_length=MAX_DESCRIPTION_LENGTH
    )
    category: str | None = Field(default=None, min_length=1, max_length=80)
    personality: list[str] | None = None
    behavior_instructions: str | None = Field(
        default=None, max_length=MAX_BEHAVIOR_LENGTH
    )
    model_provider_config: ModelProviderConfig | None = Field(
        default=None, alias="model_config"
    )
    voice_config: VoiceConfig | None = None
    knowledge_config: KnowledgeConfig | None = None
    safety_config: SafetyConfig | None = None
    capabilities: list[str] | None = None
    is_active: bool | None = None

    @field_validator("personality", "capabilities")
    @classmethod
    def _validate_tags(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        if len(value) > MAX_LIST_ITEMS:
            raise ValueError(f"at most {MAX_LIST_ITEMS} entries are allowed")
        return _normalise_tags(value)

    @field_validator("name", "category", "description")
    @classmethod
    def _validate_optional_stripped(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be blank")
        return cleaned


    rules: list[str] = Field(default_factory=list)
    disclaimer: str | None = None
    require_disclaimer: bool = False


class PersonaResponse(BaseModel):
    """Persona representation returned by the API."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    name: str
    description: str
    category: str
    personality: list[str]
    behavior_instructions: str | None
    model_provider_config: ModelProviderConfig | None = Field(
        default=None, alias="model_config"
    )
    voice_config: VoiceConfig | None
    knowledge_config: KnowledgeConfig | None
    safety_config: SafetyConfig | None
    capabilities: list[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PersonaListResponse(BaseModel):
    """Paginated collection of personas."""

    model_config = ConfigDict(populate_by_name=True)

    items: list[PersonaResponse]
    total: int = Field(description="Total personas matching the filter.")
    limit: int
    offset: int


class PersonaDeactivateResponse(BaseModel):
    """Result of deactivating (soft deleting) a persona."""

    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    is_active: bool
    message: str

    rules: list[str] = Field(default_factory=list)
    disclaimer: str | None = None
    require_disclaimer: bool = False
