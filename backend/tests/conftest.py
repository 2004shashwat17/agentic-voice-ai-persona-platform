"""Shared pytest fixtures.

Tests run without a database by default. Set ``TEST_DATABASE_URL`` to enable
the integration tests that exercise a real PostgreSQL connection.
"""

from __future__ import annotations

import os
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# The test environment must be configured before ``app.main`` is imported,
# because importing that module builds the application instance eagerly.
os.environ["APP_ENV"] = "testing"
os.environ["DEBUG"] = "false"

from app.api.deps import get_db_session
from app.core.config import Settings, get_settings  # noqa: E402
from app.db.session import reset_engine  # noqa: E402
from app.main import create_app  # noqa: E402

# Integration tests run against TEST_DATABASE_URL when set, otherwise they use
# the same database as the app (DATABASE_URL from the environment or .env).
_TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL") or Settings().database_url


@pytest.fixture(scope="session")
def settings() -> Settings:
    """Settings instance for the test session."""
    return get_settings()


@pytest.fixture
def app(settings: Settings) -> Iterator:
    """Fresh application instance with its own engine lifecycle."""
    reset_engine()
    application = create_app(settings)
    yield application
    reset_engine()


@pytest.fixture
def client(app) -> Iterator[TestClient]:
    """TestClient that triggers the lifespan (startup/shutdown) handlers."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def test_database_url() -> str:
    """PostgreSQL URL used by the integration tests."""
    return _TEST_DATABASE_URL


@pytest.fixture
def db_session(test_database_url: str) -> Iterator:
    """Live database session against the configured test database."""
    from sqlalchemy.orm import Session, sessionmaker

    from app.db.session import get_engine

    reset_engine()
    engine_settings = Settings(
        database_url=test_database_url, app_env="testing", _env_file=None
    )
    factory = sessionmaker(bind=get_engine(engine_settings), expire_on_commit=False)
    session: Session = factory()
    try:
        yield session
    finally:
        session.close()
        reset_engine()


# ---------------------------------------------------------------------------
# Persona fixtures
#
# Unit tests use a fake repository and need no database. Integration tests are
# marked with @pytest.mark.integration and use this isolated schema.
# ---------------------------------------------------------------------------


@pytest.fixture(scope="session")
def persona_engine(test_database_url: str) -> Iterator:
    """Engine bound to the test database with the schema created."""
    from sqlalchemy import create_engine

    from app.db.base import Base
    import app.models  # noqa: F401  (registers models)

    engine = create_engine(test_database_url, poolclass=NullPool, future=True)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture
def persona_session(persona_engine) -> Iterator:
    """Clean database session per test; truncates the personas table after."""
    factory = sessionmaker(bind=persona_engine, expire_on_commit=False)
    with factory() as session:
        yield session
        session.rollback()
        session.execute(text("TRUNCATE TABLE personas RESTART IDENTITY CASCADE"))
        session.commit()


@pytest.fixture
def persona_client(app, persona_session) -> Iterator[TestClient]:
    """TestClient whose persona routes use the isolated test session.

    The override commits on success, mirroring the production session
    dependency, so tests observe the same transaction semantics as production.
    """

    def _override() -> Iterator:
        try:
            yield persona_session
            persona_session.commit()
        except Exception:
            persona_session.rollback()
            raise

    app.dependency_overrides[get_db_session] = _override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


