"""Tests for application startup, routing and the error envelope."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app


def test_application_starts(client: TestClient) -> None:
    """The app boots and its lifespan sets up state."""
    assert client.app.state.settings is not None
    assert client.app.state.settings.app_env == "testing"


def test_index_route(client: TestClient) -> None:
    """The root index describes the API."""
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["docs"] == "/docs"


def test_openapi_schema_available(client: TestClient) -> None:
    """OpenAPI docs are generated and expose the versioned routes."""
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "/api/v1/health" in response.json()["paths"]


def test_unknown_route_returns_error_envelope(client: TestClient) -> None:
    """Unknown paths return the standard error envelope."""
    response = client.get("/does-not-exist")

    assert response.status_code == 404
    body = response.json()
    assert body["error"]["code"] == "not_found"
    assert "message" in body["error"]


def test_create_app_is_idempotent(settings) -> None:
    """Creating the app twice yields independent instances."""
    first = create_app(settings)
    second = create_app(settings)

    assert first is not second
    assert first.title == second.title
