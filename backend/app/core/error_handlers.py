"""Global exception handlers translating errors into the standard envelope."""

from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.error_schemas import ErrorDetail, ErrorResponse
from app.core.exceptions import AppError, ErrorCode
from app.core.logging_config import get_logger

logger = get_logger(__name__)


def _envelope(
    status_code: int, code: str, message: str, details: object = None
) -> JSONResponse:
    """Build a JSON error response using the shared schema."""
    payload = ErrorResponse(error=ErrorDetail(code=code, message=message, details=details))
    return JSONResponse(
        status_code=status_code,
        content=payload.model_dump(exclude_none=True),
        headers=None,
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all exception handlers to the application."""

    @app.exception_handler(AppError)
    async def _handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        logger.warning(
            "Application error",
            extra={"context": {"code": exc.code, "status": exc.status_code}},
        )
        return _envelope(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def _handle_validation_error(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        logger.info("Request validation failed")
        return _envelope(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            ErrorCode.VALIDATION_ERROR,
            "Request validation failed.",
            # jsonable_encoder strips non-serialisable values (e.g. the
            # ValueError instance pydantic stores under "ctx") so the error
            # envelope always renders as valid JSON.
            details=jsonable_encoder(exc.errors()),
        )

    @app.exception_handler(StarletteHTTPException)
    async def _handle_http_error(
        _: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        code = ErrorCode.NOT_FOUND if exc.status_code == 404 else ErrorCode.INTERNAL_ERROR
        return _envelope(exc.status_code, code, str(exc.detail))

    @app.exception_handler(SQLAlchemyError)
    async def _handle_database_error(_: Request, exc: SQLAlchemyError) -> JSONResponse:
        # Log the type only — never the connection string or credentials.
        logger.error("Database error: %s", type(exc).__name__)
        return _envelope(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            ErrorCode.DATABASE_ERROR,
            "A database error occurred.",
        )

    @app.exception_handler(Exception)
    async def _handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error: %s", type(exc).__name__)
        return _envelope(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            ErrorCode.INTERNAL_ERROR,
            "An unexpected error occurred.",
        )
