"""Persona domain model.

A persona is the aggregate root of the platform: it owns its identity,
personality and the configuration references for the subsystems that will be
built in later steps (model provider, knowledge/RAG, voice, memory, tools and
safety).

Those subsystems are stored as JSONB configuration on the persona so each can
be developed and migrated independently without reshaping this table. The
columns are intentionally not normalised yet.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, Index, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Persona(Base):
    """A conversational persona definition."""

    __tablename__ = "personas"

    __table_args__ = (
        # Supports the default library query: active personas, newest first.
        Index("ix_personas_is_active_created_at", "is_active", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default=func.gen_random_uuid(),
    )

    name: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(nullable=False)
    category: Mapped[str] = mapped_column(nullable=False, index=True)

    personality: Mapped[list[str]] = mapped_column(
        JSONB, nullable=False, default=list, server_default="[]"
    )
    behavior_instructions: Mapped[str | None] = mapped_column(nullable=True)

    # --- Subsystem configuration (populated in later steps) --------------
    model_config: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    voice_config: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    knowledge_config: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB, nullable=True
    )
    safety_config: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    capabilities: Mapped[list[str]] = mapped_column(
        JSONB, nullable=False, default=list, server_default="[]"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true", index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Persona id={self.id} name={self.name!r} active={self.is_active}>"
