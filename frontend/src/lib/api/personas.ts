import { request } from "@/lib/api/client";
import { API_V1 } from "@/lib/api/config";
import type {
  Persona,
  PersonaCreateInput,
  PersonaListParams,
  PersonaListResponse,
  PersonaUpdateInput,
} from "@/lib/api/types";

const BASE = `${API_V1}/personas`;

function toQuery(params: PersonaListParams): string {
  const search = new URLSearchParams();
  if (params.activeOnly !== undefined) {
    search.set("active_only", String(params.activeOnly));
  }
  if (params.category) search.set("category", params.category);
  if (params.search) search.set("search", params.search);
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));

  const query = search.toString();
  return query ? `?${query}` : "";
}

/** List personas. Inactive personas are excluded unless activeOnly is false. */
export function listPersonas(
  params: PersonaListParams = {},
): Promise<PersonaListResponse> {
  return request<PersonaListResponse>(`${BASE}${toQuery(params)}`);
}

/** Fetch a single persona by id. */
export function getPersona(id: string): Promise<Persona> {
  return request<Persona>(`${BASE}/${id}`);
}

/** Create a persona. */
export function createPersona(input: PersonaCreateInput): Promise<Persona> {
  return request<Persona>(BASE, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Apply a partial update to a persona. */
export function updatePersona(
  id: string,
  input: PersonaUpdateInput,
): Promise<Persona> {
  return request<Persona>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

/** Soft delete a persona (deactivates it). */
export function deactivatePersona(id: string): Promise<void> {
  return request<void>(`${BASE}/${id}`, { method: "DELETE" });
}

/** Re-activate a previously deactivated persona. */
export function reactivatePersona(id: string): Promise<{ id: string }> {
  return request<{ id: string }>(`${BASE}/${id}/activate`, {
    method: "POST",
  });
}
