"""Structured application logging.

Emits key/value context alongside each message. A redaction filter prevents
accidental logging of secrets such as database URLs or passwords.
"""

from __future__ import annotations

import json
import logging
import sys
from typing import Any

# Values whose keys must never be written to logs.
_SENSITIVE_KEYS = frozenset(
    {
        "password",
        "passwd",
        "secret",
        "token",
        "api_key",
        "apikey",
        "authorization",
        "database_url",
        "dsn",
        "connection_string",
    }
)


class RedactFilter(logging.Filter):
    """Strip sensitive values from log records and their ``extra`` context."""

    def filter(self, record: logging.LogRecord) -> bool:
        for key in list(record.__dict__):
            if key.lower() in _SENSITIVE_KEYS:
                setattr(record, key, "***REDACTED***")
        return True


class JsonFormatter(logging.Formatter):
    """Render log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Carry any structured context passed via ``extra=``.
        context = getattr(record, "context", None)
        if isinstance(context, dict):
            payload["context"] = {
                key: ("***REDACTED***" if key.lower() in _SENSITIVE_KEYS else value)
                for key, value in context.items()
            }

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)


def configure_logging(level: str = "INFO", json_output: bool = False) -> None:
    """Configure root logging once at application startup."""
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RedactFilter())
    handler.setFormatter(
        JsonFormatter() if json_output else logging.Formatter(
            "%(asctime)s %(levelname)-8s %(name)s: %(message)s"
        )
    )

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())

    # Reduce noise from third-party libraries.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if level.upper() == "DEBUG" else logging.WARNING
    )


def get_logger(name: str) -> logging.Logger:
    """Return a module-level logger."""
    return logging.getLogger(name)
