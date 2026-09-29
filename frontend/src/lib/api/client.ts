import { API_BASE_URL } from "@/lib/api/config";

/** Error thrown for any non-2xx backend response. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

/**
 * Single fetch wrapper for the backend.
 *
 * Centralises URL building, JSON handling and error mapping so components
 * never call fetch() directly.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      0,
      "network_error",
      "Could not reach the PersonaAI API. Is the backend running?",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const envelope = payload as ErrorEnvelope | null;
    throw new ApiError(
      response.status,
      envelope?.error?.code ?? "unknown_error",
      envelope?.error?.message ?? `Request failed with status ${response.status}`,
      envelope?.error?.details,
    );
  }

  return payload as T;
}

export { request };
