import type { Persona } from "@/lib/api/types";
import type { Persona as UiPersona } from "@/types/persona";

/**
 * Visual identity per persona category.
 *
 * The backend stores category as data, so the frontend owns presentation.
 */
const CATEGORY_ACCENT: Record<string, [string, string]> = {
  healthcare: ["#38bdf8", "#0ea5e9"],
  health: ["#38bdf8", "#0ea5e9"],
  entertainment: ["#c4b5fd", "#a78bfa"],
  creative: ["#c4b5fd", "#a78bfa"],
  education: ["#34d399", "#10b981"],
  business: ["#fbbf24", "#f59e0b"],
  coaching: ["#fb7185", "#f43f5e"],
  wellness: ["#fb7185", "#f43f5e"],
  research: ["#22d3ee", "#06b6d4"],
};

const FALLBACK_ACCENT: [string, string] = ["#7dd3fc", "#38bdf8"];

/** Build up to two uppercase initials from a persona name. */
function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AI";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Map a backend persona onto the shape the existing UI components consume.
 *
 * This keeps every component unchanged: only the data source is replaced.
 */
export function toUiPersona(persona: Persona): UiPersona {
  const accent = CATEGORY_ACCENT[persona.category] ?? FALLBACK_ACCENT;
  const knowledge = persona.knowledge_config ?? {};
  const sourceCount = knowledge.source_count ?? 0;

  return {
    id: persona.id,
    name: persona.name,
    tagline: persona.description,
    description: persona.description,
    category: persona.category,
    avatar: "",
    initials: initialsFrom(persona.name),
    accent,
    personality: persona.personality,
    voice: {
      name: persona.voice_config?.style ?? "Default",
      style: persona.voice_config?.style ?? "Default",
    },
    knowledge: {
      summary: knowledge.status
        ? `Knowledge (${knowledge.status})`
        : "No knowledge attached",
      sourceCount,
      status: sourceCount > 0 ? "ready" : "empty",
    },
    capabilities: persona.capabilities,
    disclaimer: persona.safety_config?.disclaimer ?? undefined,
  };
}

/** Map a list of backend personas for rendering. */
export function toUiPersonas(personas: Persona[]): UiPersona[] {
  return personas.map(toUiPersona);
}
