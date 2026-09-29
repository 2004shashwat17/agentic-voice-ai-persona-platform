"""Tests for the health endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient

from app.schemas.health import HealthResponse


def test_root_health_returns_ok(client: TestClient) -> None:
    """GET /health reports the service is alive."""
    response = client.get("/health")

    assert response.status_code == 200
    body = HealthResponse.model_validate(response.json())
    assert body.status == "ok"
    assert body.app_name


def test_versioned_health_matches_root(client: TestClient) -> None:
    """The versioned health route mirrors the root probe."""
    root = client.get("/health")
    versioned = client.get("/api/v1/health")

    assert versioned.status_code == 200
    assert versioned.json() == root.json()


def test_health_reports_environment(client: TestClient) -> None:
    """Health output includes the configured environment."""
    response = client.get("/api/v1/health")

    assert response.json()["environment"] == "testing"


def test_readiness_reports_services(client: TestClient) -> None:
    """Readiness returns a status and a list of service checks."""
    response = client.get("/api/v1/health/ready")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] in {"ok", "degraded"}
    assert any(service["name"] == "database" for service in body["services"])


def test_health_does_not_expose_secrets(client: TestClient) -> None:
    """Health output must never leak configuration such as the database URL."""
    body = client.get("/health").text

    assert "DATABASE_URL" not in body
    assert "postgresql" not in body
    assert "password" not in body.lower()
