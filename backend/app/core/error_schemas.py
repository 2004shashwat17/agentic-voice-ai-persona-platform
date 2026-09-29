"""Consistent error response envelope.

Every failing response uses this shape regardless of the underlying cause:

.. code-block:: json

    {
      "error": {
        "code": "not_found",
        "message": "Resource not found.",
        "details": null
      }
    }
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Body of an error response."""

    code: str = Field(description="Stable machine-readable error code.")
    message: str = Field(description="Human-readable error message.")
    details: Any | None = Field(
        default=None, description="Optional additional context."
    )


class ErrorResponse(BaseModel):
    """Envelope wrapping a single :class:`ErrorDetail`."""

    error: ErrorDetail
