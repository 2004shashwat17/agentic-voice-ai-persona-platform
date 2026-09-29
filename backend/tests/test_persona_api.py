"""API tests for the persona routes. Requires PostgreSQL."""

from __future__ import annotations

from uuid import uuid4

import pytest

pytestmark = pytest.mark.integration

PAYLOAD = {
    "name": "Doctor AI",
    "description": "A calm healthcare persona.",
    "category": "healthcare",
    "personality": ["professional", "calm"],
    "behavior_instructions": "Do not diagnose.",
    "voice_config": {"style": "calm"},
    "safety_config": {"rules": ["informational only"], "disclaimer": "Not advice."},
    "capabilities": ["voice_conversation"],
}


def _create(client, **overrides) -> dict:
    body = {**PAYLOAD, **overrides}
    response = client.post("/api/v1/personas", json=body)
    assert response.status_code == 201, response.text
    return response.json()


class TestCreate:
    def test_create_returns_201(self, persona_client) -> None:
        response = persona_client.post("/api/v1/personas", json=PAYLOAD)

        assert response.status_code == 201

    def test_response_contains_public_fields(self, persona_client) -> None:
        body = _create(persona_client)

        assert set(body) == {
            "id",
            "name",
            "description",
            "category",
            "personality",
            "behavior_instructions",
            "model_config",
            "voice_config",
            "knowledge_config",
            "safety_config",
            "capabilities",
            "is_active",
            "created_at",
            "updated_at",
        }

    def test_config_values_roundtrip(self, persona_client) -> None:
        body = _create(persona_client)

        assert body["voice_config"]["style"] == "calm"
        assert body["safety_config"]["disclaimer"] == "Not advice."
        assert body["model_config"] is None

    def test_duplicate_name_returns_409(self, persona_client) -> None:
        _create(persona_client)

        response = persona_client.post(
            "/api/v1/personas", json={**PAYLOAD, "description": "Dup"}
        )

        assert response.status_code == 409
        assert response.json()["error"]["code"] == "conflict"

    @pytest.mark.parametrize(
        "invalid",
        [
            {},
            {"name": "x"},
            {"name": "", "description": "d", "category": "c"},
            {"name": "   ", "description": "d", "category": "c"},
            {"name": "x", "description": "d", "category": "c", "personality": ["a"] * 51},
        ],
    )
    def test_invalid_payload_returns_422(self, persona_client, invalid) -> None:
        response = persona_client.post("/api/v1/personas", json=invalid)

        assert response.status_code == 422
        assert response.json()["error"]["code"] == "validation_error"


class TestRetrieve:
    def test_get_existing_returns_200(self, persona_client) -> None:
        created = _create(persona_client)

        response = persona_client.get(f"/api/v1/personas/{created['id']}")

        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_get_missing_returns_404(self, persona_client) -> None:
        response = persona_client.get(f"/api/v1/personas/{uuid4()}")

        assert response.status_code == 404
        assert response.json()["error"]["code"] == "not_found"

    def test_invalid_uuid_returns_422(self, persona_client) -> None:
        response = persona_client.get("/api/v1/personas/not-a-uuid")

        assert response.status_code == 422


class TestList:
    def test_list_returns_envelope(self, persona_client) -> None:
        _create(persona_client)

        response = persona_client.get("/api/v1/personas")

        assert response.status_code == 200
        body = response.json()
        assert body["total"] == 1 and body["limit"] == 50 and body["offset"] == 0
        assert len(body["items"]) == 1

    def test_excludes_inactive_by_default(self, persona_client) -> None:
        created = _create(persona_client)
        persona_client.delete(f"/api/v1/personas/{created['id']}")

        assert persona_client.get("/api/v1/personas").json()["total"] == 0

    def test_includes_inactive_when_requested(self, persona_client) -> None:
        created = _create(persona_client)
        persona_client.delete(f"/api/v1/personas/{created['id']}")

        body = persona_client.get("/api/v1/personas?active_only=false").json()

        assert body["total"] == 1 and body["items"][0]["is_active"] is False

    def test_filter_by_category_and_search(self, persona_client) -> None:
        _create(persona_client)
        _create(persona_client, name="Actor AI", category="entertainment")

        by_category = persona_client.get("/api/v1/personas?category=healthcare").json()
        by_search = persona_client.get("/api/v1/personas?search=actor").json()

        assert by_category["total"] == 1
        assert by_search["total"] == 1


class TestUpdate:
    def test_patch_applies_partial_update(self, persona_client) -> None:
        created = _create(persona_client)

        response = persona_client.patch(
            f"/api/v1/personas/{created['id']}", json={"description": "Updated."}
        )

        assert response.status_code == 200
        assert response.json()["description"] == "Updated."
        assert response.json()["name"] == "Doctor AI"

    def test_patch_unknown_returns_404(self, persona_client) -> None:
        response = persona_client.patch(
            f"/api/v1/personas/{uuid4()}", json={"description": "x"}
        )

        assert response.status_code == 404

    def test_patch_duplicate_name_returns_409(self, persona_client) -> None:
        first = _create(persona_client)
        _create(persona_client, name="Actor AI", category="entertainment")

        response = persona_client.patch(
            f"/api/v1/personas/{first['id']}", json={"name": "Actor AI"}
        )

        assert response.status_code == 409


class TestDeactivate:
    def test_delete_returns_204_and_hides_persona(self, persona_client) -> None:
        created = _create(persona_client)

        response = persona_client.delete(f"/api/v1/personas/{created['id']}")
        listed = persona_client.get("/api/v1/personas").json()

        assert response.status_code == 204
        assert response.content == b""
        assert listed["total"] == 0

    def test_delete_is_idempotent(self, persona_client) -> None:
        created = _create(persona_client)
        persona_client.delete(f"/api/v1/personas/{created['id']}")

        assert persona_client.delete(f"/api/v1/personas/{created['id']}").status_code == 204

    def test_delete_missing_returns_404(self, persona_client) -> None:
        assert persona_client.delete(f"/api/v1/personas/{uuid4()}").status_code == 404

    def test_reactivate_restores_persona(self, persona_client) -> None:
        created = _create(persona_client)
        persona_client.delete(f"/api/v1/personas/{created['id']}")

        response = persona_client.post(f"/api/v1/personas/{created['id']}/activate")

        assert response.status_code == 200
        assert response.json()["is_active"] is True
        assert persona_client.get("/api/v1/personas").json()["total"] == 1


class TestPersistence:
    def test_created_persona_is_committed(self, persona_client, persona_session) -> None:
        """Guards against writes being rolled back instead of committed."""
        created = _create(persona_client)
        persona_session.commit()

        assert persona_client.get(f"/api/v1/personas/{created['id']}").status_code == 200

