"""Tests for the database layer.

Unit tests cover configuration and construction; the live connection test is
skipped unless ``TEST_DATABASE_URL`` is set.
"""

from __future__ import annotations

import pytest
from sqlalchemy import Engine, text

from app.core.config import Settings
from app.db.base import Base
from app.db.session import get_engine, get_session_factory, reset_engine


def test_engine_requires_database_url() -> None:
    """Building an engine without DATABASE_URL raises a clear error."""
    reset_engine()
    try:
        with pytest.raises(RuntimeError, match="DATABASE_URL"):
            get_engine(Settings(database_url="", _env_file=None))
    finally:
        reset_engine()


def test_base_metadata_is_available() -> None:
    """The declarative metadata object exists for Alembic to inspect."""
    assert Base.metadata is not None
    assert Base.metadata.naming_convention["pk"] == "pk_%(table_name)s"


def test_reset_engine_is_safe_to_call_repeatedly() -> None:
    """reset_engine can run multiple times without error."""
    reset_engine()
    reset_engine()


def test_session_factory_requires_database_url() -> None:
    """Creating a session factory without a URL fails fast."""
    reset_engine()
    try:
        with pytest.raises(RuntimeError, match="DATABASE_URL"):
            get_session_factory(Settings(database_url="", _env_file=None))
    finally:
        reset_engine()


def test_live_connection(db_session) -> None:
    """A real session can execute a statement (skipped without TEST_DATABASE_URL)."""
    result = db_session.execute(text("SELECT 1")).scalar_one()

    assert result == 1


def test_readiness_against_live_database(db_session) -> None:
    """Readiness reports the database as reachable when it is up."""
    from app.services.health_service import HealthService

    engine: Engine = db_session.get_bind()
    readiness = HealthService(Settings(app_env="testing", _env_file=None)).get_readiness(
        engine
    )

    assert readiness.status == "ok"
    assert readiness.services[0].status == "ok"
