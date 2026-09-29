/**
 * Shared types for the PersonaAPI backend.
 *
 * Kept in one place so components never depend on raw response shapes.
 * Field names mirror the backend's public JSON exactly.
 */

export type PersonaCategory =
  | "healthcare"
  | "entertainment"
  | "education"
  | "business"
  | "coaching"
  | "research"
  | (string & {});

export type ModelProviderConfig = {
  provider?: string | null;
  model?: string | null;
  temperature?: number | null;
  [key: string]: unknown;
};

export type VoiceConfig = {
  provider?: string | null;
  voice_id?: string | null;
  style?: string | null;
  [key: string]: unknown;
};

export type KnowledgeConfig = {
  enabled?: boolean;
  source_count?: number | null;
  status?: string | null;
  [key: string]: unknown;
};

export type SafetyConfig = {
  rules?: string[];
  disclaimer?: string | null;
  require_disclaimer?: boolean;
  [key: string]: unknown;
};

export type Persona = {
  id: string;
  name: string;
  description: string;
  category: PersonaCategory;
  personality: string[];
  behavior_instructions: string | null;
  model_config: ModelProviderConfig | null;
  voice_config: VoiceConfig | null;
  knowledge_config: KnowledgeConfig | null;
  safety_config: SafetyConfig | null;
  capabilities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PersonaListResponse = {
  items: Persona[];
  total: number;
  limit: number;
  offset: number;
};

export type PersonaListParams = {
  activeOnly?: boolean;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type PersonaCreateInput = Omit<
  Persona,
  "id" | "created_at" | "updated_at" | "is_active"
> &
  Partial<Pick<Persona, "is_active">>;

export type PersonaUpdateInput = Partial<PersonaCreateInput>;
