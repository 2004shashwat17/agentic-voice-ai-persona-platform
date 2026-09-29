"""Application configuration.

All settings are read from the environment (or a local ``.env`` file).
Secrets are never hardcoded; see ``.env.example`` for the expected variables.
"""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Application ---------------------------------------------------
    app_name: str = Field(default="PersonaAI API")
    app_version: str = Field(default="0.1.0")
    app_env: str = Field(default="development")
    debug: bool = Field(default=False)

    # --- API -----------------------------------------------------------
    api_v1_prefix: str = Field(default="/api/v1")

    # --- Database ------------------------------------------------------
    database_url: str = Field(
        default="",
        description="PostgreSQL connection URL. Required outside tests.",
    )
    db_echo: bool = Field(default=False)
    db_pool_size: int = Field(default=5)
    db_max_overflow: int = Field(default=10)
    db_pool_timeout: int = Field(default=30)
    db_pool_recycle: int = Field(default=1800)

    # --- CORS ----------------------------------------------------------
    # Comma-separated list of allowed origins, e.g. "http://localhost:3000".
    # NoDecode stops pydantic-settings from expecting a JSON-encoded list, so
    # a plain comma-separated string works in .env and the shell.
    cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=list)

    # --- Logging -------------------------------------------------------
    log_level: str = Field(default="INFO")
    log_json: bool = Field(default=False)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_origins(cls, value: object) -> object:
        """Accept a comma-separated string or a JSON array of origins."""
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                # JSON-encoded list, e.g. '["http://localhost:3000"]'
                try:
                    return json.loads(stripped)
                except json.JSONDecodeError:
                    pass
            return [
                origin.strip() for origin in stripped.split(",") if origin.strip()
            ]
        return value

    @field_validator("log_level")
    @classmethod
    def _validate_log_level(cls, value: str) -> str:
        level = value.upper()
        if level not in {"CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG", "NOTSET"}:
            raise ValueError(f"Invalid log level: {value}")
        return level

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def is_testing(self) -> bool:
        return self.app_env.lower() == "testing"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings. Cached so the environment is read once."""
    return Settings()
