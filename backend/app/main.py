"""FastAPI application entrypoint.

Creates the app, configures CORS and error handling, and manages the database
engine through the lifespan handler.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import Settings, get_settings
from app.core.error_handlers import register_exception_handlers
from app.core.logging_config import configure_logging, get_logger

logger = get_logger(__name__)

DESCRIPTION = """
Backend API for the PersonaAI voice persona platform.

This is the Step 2 foundation: configuration, database access, structured
errors and logging. Persona, knowledge, memory, LLM and voice capabilities
are not implemented yet.
"""


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Create the database engine on startup and dispose of it on shutdown."""
    settings: Settings = app.state.settings

    # Imported here so the engine is only built when the app actually runs.
    from app.db.session import get_engine, reset_engine

    if settings.database_url:
        app.state.engine = get_engine(settings)
        logger.info("Database engine ready")
    else:
        # Keeps the app bootable without a database (e.g. CI or tooling).
        app.state.engine = None
        logger.warning("DATABASE_URL not set — running without a database")

    logger.info(
        "Application started",
        extra={"context": {"env": settings.app_env, "version": settings.app_version}},
    )
    yield

    reset_engine()
    logger.info("Application shut down")


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = settings or get_settings()

    configure_logging(level=settings.log_level, json_output=settings.log_json)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=DESCRIPTION,
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.state.settings = settings

    # CORS origins come from the environment — never hardcoded here.
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        logger.info(
            "CORS configured",
            extra={"context": {"origins": settings.cors_origins}},
        )
    else:
        logger.warning("No CORS origins configured — browser requests will be blocked")

    register_exception_handlers(app)

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    # Liveness lives at the root for infrastructure probes.
    @app.get("/health", tags=["health"], summary="Liveness probe")
    async def root_health() -> dict[str, str]:
        """Unversioned health check."""
        return {
            "status": "ok",
            "app_name": settings.app_name,
            "version": settings.app_version,
            "environment": settings.app_env,
        }

    @app.get("/", include_in_schema=False)
    async def root() -> dict[str, str]:
        """Minimal index describing the API."""
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
        }

    return app


app = create_app()
