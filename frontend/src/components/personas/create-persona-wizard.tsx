"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

import { PersonaAvatar } from "@/components/personas/persona-avatar";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { personaCategories } from "@/data/personas";
import { ApiError } from "@/lib/api/client";
import { createPersona } from "@/lib/api/personas";
import { cn } from "@/lib/utils";
import {
  KNOWLEDGE_FILE_TYPES,
  PERSONALITY_TRAITS,
  VOICE_STYLES,
} from "@/types/persona";
import type { PersonaDraft, VoiceStyleId } from "@/types/persona";

const STEPS = [
  { id: 1, title: "Basics", description: "Name and describe the persona." },
  { id: 2, title: "Personality", description: "Choose how it behaves." },
  { id: 3, title: "Knowledge", description: "Add source material." },
  { id: 4, title: "Voice", description: "Pick a vocal character." },
  { id: 5, title: "Review", description: "Confirm and create." },
] as const;

export const CATEGORY_ACCENT: Record<string, [string, string]> = {
  Health: ["#38bdf8", "#0ea5e9"],
  Creative: ["#c4b5fd", "#a78bfa"],
  Education: ["#34d399", "#10b981"],
  Business: ["#fbbf24", "#f59e0b"],
  Wellness: ["#fb7185", "#f43f5e"],
  Research: ["#22d3ee", "#06b6d4"],
};

const emptyDraft: PersonaDraft = {
  name: "",
  description: "",
  category: "Education",
  traits: [],
  behaviorInstructions: "",
  voiceId: null,
  files: [],
};

/**
 * Multi-step persona builder. State is local to the session only — nothing is
 * persisted, uploaded or sent anywhere.
 */
export function CreatePersonaWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<PersonaDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof PersonaDraft>(
    key: K,
    value: PersonaDraft[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const toggleTrait = (trait: string) =>
    update(
      "traits",
      draft.traits.includes(trait)
        ? draft.traits.filter((item) => item !== trait)
        : [...draft.traits, trait],
    );

  const addMockFile = () => {
    // UI placeholder only — no file input, no network, no storage.
    const type =
      KNOWLEDGE_FILE_TYPES[draft.files.length % KNOWLEDGE_FILE_TYPES.length];
    update("files", [
      ...draft.files,
      {
        id: `file-${draft.files.length + 1}`,
        name: `${
          draft.name || "persona"
        }-source-${draft.files.length + 1}.${type.toLowerCase()}`,
        type,
        sizeLabel: `${(1.2 + draft.files.length * 0.7).toFixed(1)} MB`,
      },
    ]);
  };

  const removeFile = (id: string) =>
    update("files", draft.files.filter((file) => file.id !== id));

  const canContinue =
    step === 1
      ? draft.name.trim().length > 1
      : step === 2
        ? draft.traits.length > 0
        : step === 4
          ? draft.voiceId !== null
          : true;

  const handleCreate = async () => {
    const voice = VOICE_STYLES.find((item) => item.id === draft.voiceId);
    setSubmitting(true);
    setError(null);

    try {
      await createPersona({
        name: draft.name.trim(),
        description: draft.description.trim(),
        category: draft.category,
        personality: draft.traits,
        behavior_instructions: draft.behaviorInstructions || null,
        voice_config: voice ? { style: voice.style } : null,
        safety_config: null,
        model_config: null,
        knowledge_config:
          draft.files.length > 0
            ? { enabled: true, status: "processing", source_count: draft.files.length }
            : { enabled: false, status: "empty", source_count: 0 },
        capabilities: draft.traits.length > 0 ? ["voice_conversation"] : [],
        is_active: true,
      });
      router.push("/personas");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Could not create the persona. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <Section>
      <SectionHeading
        align="left"
        eyebrow="Persona builder"
        title="Create your persona"
        description="Five steps. Nothing is uploaded or saved in this prototype."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[280px_1fr]">
        <StepNav current={step} onSelect={setStep} />

        <Card className="p-7 sm:p-9">
          {step === 1 ? <StepBasics draft={draft} onUpdate={update} /> : null}
          {step === 2 ? (
            <StepPersonality traits={draft.traits} onToggle={toggleTrait} />
          ) : null}
          {step === 3 ? (
            <StepKnowledge
              files={draft.files}
              onAdd={addMockFile}
              onRemove={removeFile}
            />
          ) : null}
          {step === 4 ? (
            <StepVoice
              selected={draft.voiceId}
              onSelect={(id) => update("voiceId", id)}
            />
          ) : null}
          {step === 5 ? <StepReview draft={draft} /> : null}

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/8 pt-7">
            <Button
              variant="ghost"
              onClick={() => setStep((value) => Math.max(1, value - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {step < STEPS.length ? (
              <Button
                onClick={() => setStep((value) => value + 1)}
                disabled={!canContinue}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleCreate} disabled={submitting}>
                <Sparkles className="h-4 w-4" />
                {submitting ? "Creating..." : "Create Persona"}
              </Button>
            )}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200"
            >
              {error}
            </p>
          ) : null}
        </Card>

      </div>
    </Section>
  );
}

function StepNav({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (step: number) => void;
}) {
  return (
    <nav aria-label="Creation steps">
      <ol className="space-y-2">
        {STEPS.map((item) => {
          const isCurrent = item.id === current;
          const isDone = item.id < current;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300",
                  isCurrent ? "bg-white/8" : "hover:bg-white/4",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors",
                    isDone
                      ? "bg-brand-500 text-ink-950"
                      : isCurrent
                        ? "bg-white/12 text-white"
                        : "bg-white/6 text-mist-500",
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : item.id}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-sm",
                      isCurrent ? "text-white" : "text-mist-400",
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-mist-500">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepBasics({
  draft,
  onUpdate,
}: {
  draft: PersonaDraft;
  onUpdate: <K extends keyof PersonaDraft>(
    key: K,
    value: PersonaDraft[K],
  ) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium text-white">Basic information</h2>
      <p className="mt-2 text-sm text-mist-500">
        Give the persona a name and a short description of what it is for.
      </p>

      <div className="mt-8 space-y-6">
        <div>
          <Label htmlFor="persona-name">Persona name</Label>
          <Input
            id="persona-name"
            value={draft.name}
            onChange={(event) => onUpdate("name", event.target.value)}
            placeholder="e.g. Study Companion"
            maxLength={48}
          />
        </div>

        <div>
          <Label htmlFor="persona-description">Description</Label>
          <Textarea
            id="persona-description"
            value={draft.description}
            onChange={(event) => onUpdate("description", event.target.value)}
            placeholder="What should this persona help with, and how should it behave?"
            maxLength={280}
          />
          <p className="mt-2 text-[11px] text-mist-500">
            {draft.description.length}/280
          </p>
        </div>

        <div>
          <Label htmlFor="persona-category">Category</Label>
          <Select
            id="persona-category"
            value={draft.category}
            onChange={(event) =>
              onUpdate("category", event.target.value as PersonaDraft["category"])
            }
          >
            {personaCategories
              .filter((item) => item !== "All")
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="persona-behavior">
            Behaviour instructions (optional)
          </Label>
          <Textarea
            id="persona-behavior"
            value={draft.behaviorInstructions}
            onChange={(event) =>
              onUpdate("behaviorInstructions", event.target.value)
            }
            placeholder="e.g. Ask clarifying questions before answering. Never present as a real professional."
            maxLength={2000}
          />
          <p className="mt-2 text-[11px] text-mist-500">
            Instructions the persona engine will follow in later steps.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepPersonality({
  traits,
  onToggle,
}: {
  traits: string[];
  onToggle: (trait: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium text-white">Personality</h2>
      <p className="mt-2 text-sm text-mist-500">
        Pick the traits that define how this persona thinks and speaks.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {PERSONALITY_TRAITS.map((trait) => {
          const isSelected = traits.includes(trait);
          return (
            <button
              key={trait}
              type="button"

              aria-pressed={isSelected}
              onClick={() => onToggle(trait)}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-5 py-4 text-left text-sm transition-all duration-300",
                isSelected
                  ? "border-brand-500/40 bg-brand-500/10 text-white"
                  : "border-white/10 text-mist-300 hover:border-white/20 hover:text-white",
              )}
            >
              {trait}
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-md border transition-colors",
                  isSelected
                    ? "border-brand-400 bg-brand-500 text-ink-950"
                    : "border-white/20",
                )}
              >
                {isSelected ? <Check className="h-3 w-3" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-[11px] text-mist-500">
        {traits.length} trait{traits.length === 1 ? "" : "s"} selected
      </p>
    </div>
  );
}

function StepKnowledge({
  files,
  onAdd,
  onRemove,
}: {
  files: PersonaDraft["files"];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium text-white">Knowledge</h2>
      <p className="mt-2 text-sm text-mist-500">
        Upload the material this persona should draw on.
      </p>

      {/* Upload placeholder — intentionally non-functional in this prototype. */}
      <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
        <UploadCloud className="mx-auto h-7 w-7 text-mist-500" />
        <p className="mt-4 text-sm text-white">Upload knowledge</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-mist-500">
          Real file upload is not implemented yet. Use the button below to
          preview the interface with sample sources.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {KNOWLEDGE_FILE_TYPES.map((type) => (
            <span
              key={type}
              className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-mist-400"
            >
              {type}
            </span>
          ))}
        </div>

        <Button variant="outline" className="mt-7" onClick={onAdd}>
          Add sample source
        </Button>
      </div>

      {files.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4"
            >
              <FileText className="h-4 w-4 shrink-0 text-brand-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-mist-200">{file.name}</p>
                <p className="text-[11px] text-mist-500">
                  {file.type} · {file.sizeLabel}
                </p>
              </div>
              <span className="rounded-full bg-amber-400/12 px-2.5 py-1 text-[11px] text-amber-300">
                processing
              </span>
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                aria-label={`Remove ${file.name}`}
                className="rounded-full p-2 text-mist-500 transition-colors hover:bg-white/8 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function StepVoice({
  selected,
  onSelect,
}: {
  selected: VoiceStyleId | null;
  onSelect: (id: VoiceStyleId) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-medium text-white">Voice</h2>
      <p className="mt-2 text-sm text-mist-500">
        Choose the vocal character this persona should speak with.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {VOICE_STYLES.map((voice) => {
          const isSelected = selected === voice.id;
          return (
            <button
              key={voice.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(voice.id)}
              className={cn(
                "group rounded-3xl border p-6 text-left transition-all duration-300",
                isSelected
                  ? "border-brand-500/40 bg-brand-500/10"
                  : "border-white/10 hover:border-white/20",
              )}
            >
              <div className="flex items-center justify-between">
                <WaveIcon active={isSelected} />
                {isSelected ? (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-ink-950">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                ) : null}
              </div>
              <p className="mt-5 text-[15px] font-medium text-white">
                {voice.name}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-mist-500">
                {voice.style}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-mist-400">
                {voice.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Decorative waveform used to preview a voice card visually. */
function WaveIcon({ active }: { active: boolean }) {
  const bars = [8, 16, 24, 12, 20, 10];
  return (
    <span aria-hidden className="flex h-7 items-end gap-1">
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-500",
            active ? "bg-brand-400" : "bg-white/25",
          )}
          style={{ height }}
        />
      ))}
    </span>
  );
}

function StepReview({ draft }: { draft: PersonaDraft }) {
  const voice = VOICE_STYLES.find((item) => item.id === draft.voiceId);
  const accent = CATEGORY_ACCENT[draft.category] ?? CATEGORY_ACCENT.Education;
  const initials = draft.name.trim()
    ? draft.name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("")
    : "P";

  const summary = [
    { label: "Name", value: draft.name || "—" },
    { label: "Category", value: draft.category },
    {
      label: "Description",
      value: draft.description || "No description added",
    },
    {
      label: "Behaviour",
      value: draft.behaviorInstructions || "No instructions added",
    },
    {
      label: "Personality",
      value: draft.traits.length ? draft.traits.join(", ") : "—",
    },
    {
      label: "Knowledge",
      value:
        draft.files.length > 0
          ? `${draft.files.length} source${draft.files.length === 1 ? "" : "s"} queued`
          : "No sources added",
    },
    { label: "Voice", value: voice ? `${voice.name} — ${voice.style}` : "—" },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium text-white">Review</h2>
      <p className="mt-2 text-sm text-mist-500">
        Check everything looks right before creating the persona.
      </p>

      <div className="mt-8 flex items-center gap-5 rounded-3xl border border-white/8 bg-white/[0.03] p-6">
        <PersonaAvatar initials={initials} accent={accent} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-lg font-medium text-white">
            {draft.name || "Untitled persona"}
          </p>
          <p className="mt-1 text-sm text-mist-400">
            {draft.description || "No description yet"}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {summary.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-5"
          >
            <dt className="text-[11px] uppercase tracking-[0.14em] text-mist-500">
              {row.label}
            </dt>
            <dd className="mt-1.5 text-sm capitalize text-mist-200">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-[11px] leading-relaxed text-mist-500">
        Creating a persona in this prototype only shows the completed flow —
        nothing is persisted to a database.
      </p>
    </div>
  );
}
