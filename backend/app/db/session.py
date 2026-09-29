"""Database engine and session management.

The engine is created lazily so importing the application never requires a
reachable database — important for tests and for tooling such as Alembic.
"""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)

_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


def _build_engine(settings: Settings) -> Engine:
    """Create a PostgreSQL engine with connection pooling."""
    if not settings.database_url:
        raise RuntimeError(
            "DATABASE_URL is not configured. Set it in your environment or .env file."
        )

    return create_engine(
        settings.database_url,
        echo=settings.db_echo,
        pool_pre_ping=True,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_recycle=settings.db_pool_recycle,
    )


def get_engine(settings: Settings | None = None) -> Engine:
    """Return the process-wide engine, creating it on first use."""
    global _engine
    if _engine is None:
        _engine = _build_engine(settings or get_settings())
        logger.info("Database engine created")
    return _engine


def get_session_factory(settings: Settings | None = None) -> sessionmaker[Session]:
    """Return the process-wide session factory."""
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(
            bind=get_engine(settings),
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )
    return _session_factory


def reset_engine() -> None:
    """Dispose of the engine and factory. Used by tests."""
    global _engine, _session_factory
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _session_factory = None


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for the duration of a unit of work.

    Commits when the block completes successfully and rolls back on error, so
    callers never need to manage transactions themselves.
    """
    session = get_session_factory()()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
