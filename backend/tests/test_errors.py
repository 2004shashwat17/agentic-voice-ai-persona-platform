"""Tests for the shared error envelope and exception handling."""

from __future__ import annotations

import pytest
from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient

from app.core.error_schemas import ErrorDetail, ErrorResponse
from app.core.exceptions import AppError, ConflictError, ErrorCode, NotFoundError
from app.main import create_app


def _client_with_error_route() -> TestClient:
    """Build an app exposing a route that raises an AppError."""
    app = create_app()
    router = APIRouter()

    @router.get("/boom")
    async def boom() -> None:
        raise NotFoundError("Persona not found.")

    @router.get("/conflict")
    async def conflict() -> None:
        raise ConflictError("Already exists.")

    @router.get("/raw")
    async def raw() -> None:
        raise RuntimeError("s3cr3t-internal-detail")

    app.include_router(router, prefix="/test")
    return TestClient(app, raise_server_exceptions=False)


def test_error_envelope_schema_roundtrip() -> None:
    """The error schema serialises to the documented shape."""
    payload = ErrorResponse(
        error=ErrorDetail(code=ErrorCode.NOT_FOUND, message="Nope.")
    ).model_dump(exclude_none=True)

    assert payload == {"error": {"code": "not_found", "message": "Nope."}}


def test_app_error_defaults() -> None:
    """AppError subclasses carry sensible defaults."""
    assert AppError().status_code == 500
    assert NotFoundError().status_code == 404
    assert ConflictError().code == ErrorCode.CONFLICT


def test_app_error_accepts_overrides() -> None:
    """Message, code and status can be overridden per instance."""
    error = AppError("Custom", code="custom_code", status_code=418)

    assert error.message == "Custom"
    assert error.code == "custom_code"
    assert error.status_code == 418


def test_not_found_error_returns_envelope() -> None:
    """AppError subclasses become the standard JSON envelope."""
    response = _client_with_error_route().get("/test/boom")

    assert response.status_code == 404
    assert response.json() == {
        "error": {"code": "not_found", "message": "Persona not found."}
    }


def test_conflict_error_returns_409() -> None:
    """ConflictError maps to HTTP 409."""
    response = _client_with_error_route().get("/test/conflict")

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "conflict"


def test_unhandled_error_returns_sanitised_500() -> None:
    """Unexpected exceptions return a generic 500 without leaking details."""
    response = _client_with_error_route().get("/test/raw")

    assert response.status_code == 500
    body = response.json()
    assert body["error"]["code"] == ErrorCode.INTERNAL_ERROR
    assert "s3cr3t-internal-detail" not in response.text


@pytest.mark.parametrize("path", ["/test/boom", "/test/conflict"])
def test_errors_never_expose_internals(path: str) -> None:
    """Error bodies contain no stack traces or configuration values."""
    response = _client_with_error_route().get(path)

    assert "Traceback" not in response.text
    assert "DATABASE_URL" not in response.text
