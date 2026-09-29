/**
 * Core domain model for the PersonaAI platform.
 * Frontend-only: no backend or persistence is wired up in this step.
 */

export type KnowledgeStatus = "ready" | "processing" | "empty";

/**
 * Personas come from the backend, so the category is data rather than a
 * closed set. Known categories are listed for autocomplete and documentation,
 * but any string is accepted.
 */
export type PersonaCategory =
  | "healthcare"
  | "entertainment"
  | "education"
  | "business"
  | "coaching"
  | "research"
  | "Health"
  | "Creative"
  | "Wellness"
  | (string & {});

export type PersonaVoice = {
  /** Display name, e.g. "Calm". */
  name: string;
  /** Longer style description, e.g. "Calm / professional". */
  style: string;
};

export type PersonaKnowledge = {
  /** Human readable summary of what the persona knows. */
  summary: string;
  sourceCount: number;
  status: KnowledgeStatus;
};

export type Persona = {
  id: string;
  name: string;
  /** Short one-liner used on cards. */
  tagline: string;
  description: string;
  category: PersonaCategory;
  avatar: string;
  /** Initials shown inside the avatar visual. */
  initials: string;
  /** Gradient hue pair driving the persona's visual identity. */
  accent: [string, string];
  personality: string[];
  voice: PersonaVoice;
  knowledge: PersonaKnowledge;
  capabilities: string[];
  /** Optional, data-driven safety notice rendered on profile + conversation. */
  disclaimer?: string;
  featured?: boolean;
  /** Marks personas authored by the user in this prototype. */
  isCustom?: boolean;
  lastConversationAt?: string;
};

export type PersonaCategoryFilter = PersonaCategory | "All";

/* -------------------------------------------------------------------------- */
/* Conversation                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Frontend-simulated voice session states. No real audio capture yet.
 */
export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error"
  | "muted"
  | "ended";

export type Speaker = "user" | "persona";

export type ConversationMessage = {
  id: string;
  speaker: Speaker;
  text: string;
  /** Simulated wall-clock timestamp. */
  timestamp: string;
};

/* -------------------------------------------------------------------------- */
/* Persona creation wizard                                                    */
/* -------------------------------------------------------------------------- */

export const PERSONALITY_TRAITS = [
  "Professional",
  "Friendly",
  "Calm",
  "Energetic",
  "Analytical",
  "Humorous",
  "Empathetic",
] as const;

export const VOICE_STYLES = [
  {
    id: "professional",
    name: "Professional",
    style: "Professional / measured",
    description: "Clear articulation, neutral pacing, suited to briefings.",
  },
  {
    id: "warm",
    name: "Warm",
    style: "Warm / inviting",
    description: "Soft tone with a friendly conversational cadence.",
  },
  {
    id: "energetic",
    name: "Energetic",
    style: "Energetic / bright",
    description: "Lively delivery with lifted pitch and quick response.",
  },
  {
    id: "calm",
    name: "Calm",
    style: "Calm / steady",
    description: "Low, consistent register that stays grounded and patient.",
  },
  {
    id: "deep",
    name: "Deep",
    style: "Deep / resonant",
    description: "Rich timbre with a slow, cinematic pace.",
  },
] as const;

export type VoiceStyleId = (typeof VOICE_STYLES)[number]["id"];

export const KNOWLEDGE_FILE_TYPES = ["PDF", "TXT", "DOCX"] as const;
export type KnowledgeFileType = (typeof KNOWLEDGE_FILE_TYPES)[number];

/** A mock "queued" knowledge file — the upload itself is a UI placeholder. */
export type KnowledgeFile = {
  id: string;
  name: string;
  type: KnowledgeFileType;
  sizeLabel: string;
};

export type PersonaDraft = {
  name: string;
  description: string;
  category: PersonaCategory;
  traits: string[];
  behaviorInstructions: string;
  voiceId: VoiceStyleId | null;
  files: KnowledgeFile[];
};

/* -------------------------------------------------------------------------- */
/* Library metadata                                                           */
/* -------------------------------------------------------------------------- */

export type PersonaLibraryEntry = {
  personaId: string;
  /** Null when the persona has never been started. */
  lastConversationAt: string | null;
  /** Simulated conversation duration in seconds. */
  durationSeconds: number;
  favorite: boolean;
};
