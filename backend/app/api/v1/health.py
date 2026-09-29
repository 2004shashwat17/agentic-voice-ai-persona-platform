"""Health and readiness routes."""

from __future__ import annotations

from fastapi import APIRouter, Request

from app.api.deps import SettingsDep
from app.schemas.health import HealthResponse, ReadinessResponse
from app.services.health_service import HealthService

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness probe",
    description="Confirms the API process is running.",
)
async def health(settings: SettingsDep) -> HealthResponse:
    """Return basic service health."""
    return HealthService(settings).get_health()


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    summary="Readiness probe",
    description="Verifies the service and its dependencies can serve traffic.",
)
async def readiness(request: Request, settings: SettingsDep) -> ReadinessResponse:
    """Return service readiness including dependency checks."""
    engine = getattr(request.app.state, "engine", None)
    return HealthService(settings).get_readiness(engine)
