"""Tests for configuration loading and validation."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.core.config import Settings, get_settings


def test_defaults_are_applied() -> None:
    """Settings fall back to safe defaults when unset."""
    settings = Settings(
        database_url="postgresql+psycopg://u:p@localhost/db", _env_file=None
    )

    assert settings.app_name == "PersonaAI API"
    assert settings.api_v1_prefix == "/api/v1"
    assert settings.debug is False


def test_values_loaded_from_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    """Environment variables override defaults."""
    monkeypatch.setenv("APP_NAME", "Test API")
    monkeypatch.setenv("DEBUG", "true")

    settings = Settings(_env_file=None)

    assert settings.app_name == "Test API"
    assert settings.debug is True


def test_cors_origins_accept_comma_separated_string(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """CORS_ORIGINS may be provided as a single comma-separated string."""
    monkeypatch.setenv(
        "CORS_ORIGINS", "http://localhost:3000, https://app.example.com"
    )

    settings = Settings(_env_file=None)

    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://app.example.com",
    ]


def test_cors_origins_accepts_list(monkeypatch: pytest.MonkeyPatch) -> None:
    """A JSON-style list is also accepted."""
    monkeypatch.setenv("CORS_ORIGINS", '["http://localhost:3000"]')

    settings = Settings(_env_file=None)

    assert settings.cors_origins == ["http://localhost:3000"]


def test_empty_cors_origins_becomes_empty_list(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """An empty CORS_ORIGINS value yields an empty list, not [""]."""
    monkeypatch.setenv("CORS_ORIGINS", "")

    settings = Settings(_env_file=None)

    assert settings.cors_origins == []


def test_invalid_log_level_is_rejected() -> None:
    """An unsupported log level fails validation."""
    with pytest.raises(ValidationError):
        Settings(log_level="LOUD", _env_file=None)


def test_log_level_is_normalised_to_uppercase(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Log levels are stored uppercase regardless of input casing."""
    monkeypatch.setenv("LOG_LEVEL", "debug")

    assert Settings(_env_file=None).log_level == "DEBUG"


def test_environment_helpers(monkeypatch: pytest.MonkeyPatch) -> None:
    """is_production / is_testing reflect APP_ENV."""
    assert Settings(app_env="production", _env_file=None).is_production is True
    assert Settings(app_env="testing", _env_file=None).is_testing is True


def test_get_settings_is_cached() -> None:
    """get_settings returns the same instance on repeated calls."""
    assert get_settings() is get_settings()


def test_settings_never_hardcode_secrets() -> None:
    """No secret values are baked into the defaults."""
    defaults = Settings(_env_file=None)

    assert defaults.database_url == ""
    assert "postgres" not in defaults.model_dump_json()
