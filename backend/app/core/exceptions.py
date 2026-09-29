"""Application exception types and the shared error response schema."""

from __future__ import annotations

from typing import Any


class ErrorCode:
    """Stable, machine-readable error codes returned to clients."""

    VALIDATION_ERROR = "validation_error"
    NOT_FOUND = "not_found"
    CONFLICT = "conflict"
    DATABASE_ERROR = "database_error"
    INTERNAL_ERROR = "internal_error"


class AppError(Exception):
    """Base class for expected application errors.

    Route handlers raise these; the global handler in
    :mod:`app.core.error_handlers` converts them into consistent JSON.
    """

    status_code: int = 500
    code: str = ErrorCode.INTERNAL_ERROR
    message: str = "An unexpected error occurred."

    def __init__(
        self,
        message: str | None = None,
        *,
        code: str | None = None,
        status_code: int | None = None,
        details: Any = None,
    ) -> None:
        self.message = message or self.message
        self.code = code or self.code
        self.status_code = status_code or self.status_code
        self.details = details
        super().__init__(self.message)


class NotFoundError(AppError):
    """A requested resource does not exist."""

    status_code = 404
    code = ErrorCode.NOT_FOUND
    message = "Resource not found."


class ConflictError(AppError):
    """A resource conflicts with the current state."""

    status_code = 409
    code = ErrorCode.CONFLICT
    message = "Resource conflict."


class DatabaseError(AppError):
    """A database operation failed."""

    status_code = 503
    code = ErrorCode.DATABASE_ERROR
    message = "A database error occurred."
