"""Health service.

Holds the health/readiness logic so route handlers stay thin. The database
check issues a real ``SELECT 1`` against the configured engine.
"""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import Settings
from app.core.logging_config import get_logger
from app.schemas.health import HealthResponse, ReadinessResponse, ServiceStatus

logger = get_logger(__name__)


class HealthService:
    """Reports application and dependency health."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def get_health(self) -> HealthResponse:
        """Liveness check — confirms the process is running."""
        return HealthResponse(
            status="ok",
            app_name=self._settings.app_name,
            version=self._settings.app_version,
            environment=self._settings.app_env,
        )

    def get_readiness(self, engine: Engine | None) -> ReadinessResponse:
        """Readiness check — verifies the database is reachable."""
        services: list[ServiceStatus] = []

        if engine is None:
            services.append(
                ServiceStatus(
                    name="database",
                    status="skipped",
                    detail="Database is not configured.",
                )
            )
        else:
            try:
                with engine.connect() as connection:
                    connection.execute(text("SELECT 1"))
                services.append(ServiceStatus(name="database", status="ok"))
            except SQLAlchemyError as exc:
                # Log the exception type only, never the connection details.
                logger.error("Readiness check failed: %s", type(exc).__name__)
                services.append(
                    ServiceStatus(
                        name="database",
                        status="unavailable",
                        detail="Could not connect to the database.",
                    )
                )

        overall = (
            "ok"
            if all(service.status == "ok" for service in services)
            else "degraded"
        )
        return ReadinessResponse(status=overall, services=services)
