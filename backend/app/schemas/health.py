"""Response schemas for the health endpoint."""

from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Liveness/readiness payload returned by ``GET /health``."""

    status: str = Field(description="Overall service status.")
    app_name: str = Field(description="Configured application name.")
    version: str = Field(description="Application version.")
    environment: str = Field(description="Active application environment.")


class ServiceStatus(BaseModel):
    """Readiness detail for a single dependency."""

    name: str
    status: str
    detail: str | None = None


class ReadinessResponse(BaseModel):
    """Readiness payload including dependency checks."""

    status: str
    services: list[ServiceStatus] = []
