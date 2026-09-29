/**
 * Base URL for the PersonaAI backend.
 *
 * Configured via NEXT_PUBLIC_API_BASE_URL so the same build can target local
 * or deployed environments. Falls back to the local FastAPI port.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

/** Prefix for all versioned endpoints. */
export const API_V1 = "/api/v1";
