import Link from "next/link";
import { Brain, Clock, Heart, Mic, Plus, Sparkles } from "lucide-react";

import { PersonaAvatar } from "@/components/personas/persona-avatar";
import { Badge, Section, SectionHeading } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import type { Persona } from "@/types/persona";

type LibraryPersona = Persona & {
  lastUsed: string | null;
  durationSeconds: number;
  favorite: boolean;
  owned: boolean;
};

export interface LibraryPersonaInput {
  personas: Persona[];
  /** Ids of personas the user created (personas are unowned until auth exists). */
  ownedIds?: string[];
}

/**
 * "My Personas".
 *
 * Backed by the persona API. Ownership, favourites and conversation history
 * arrive empty until authentication and sessions exist in a later step — the
 * groups render their empty states until then.
 */
export function PersonaLibrary({ personas }: LibraryPersonaInput) {
  const library: LibraryPersona[] = personas.map((persona) => ({
    ...persona,
    lastUsed: persona.lastConversationAt ?? null,
    durationSeconds: 0,
    favorite: false,
    owned: false,
  }));

  const created = library.filter((item) => item.owned);
  const favorites = library.filter((item) => item.favorite);
  const recent = [...library]
    .filter((item) => item.lastUsed)
    .sort((a, b) => Date.parse(b.lastUsed!) - Date.parse(a.lastUsed!))
    .slice(0, 3);

  return (
    <Section>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          align="left"
          eyebrow="Your library"
          title="My Personas"
          description="Everything you've created, started or saved — all in one place."
        />
        <Button asChild className="shrink-0">
          <Link href="/personas/create">
            <Plus className="h-4 w-4" />
            New persona
          </Link>
        </Button>
      </div>

      <LibraryGroup
        title="Created by you"
        icon={<Sparkles className="h-3.5 w-3.5" />}
        personas={created}
        emptyTitle="You haven't created a persona yet."
        emptyBody="Design one with its own personality, knowledge and voice."
        emptyCta="Create your first persona"
        emptyHref="/personas/create"
      />
      <LibraryGroup
        title="Recently used"
        icon={<Clock className="h-3.5 w-3.5" />}
        personas={recent}
        emptyTitle="No conversations yet"
        emptyBody="Start talking to a persona and it will show up here."
        emptyCta="Explore personas"
        emptyHref="/personas"
      />
      <LibraryGroup
        title="Favorites"
        icon={<Heart className="h-3.5 w-3.5" />}
        personas={favorites}
        emptyTitle="No favorites yet"
        emptyBody="Personas you favorite will be pinned here for quick access."
        emptyCta="Explore personas"
        emptyHref="/personas"
      />
    </Section>
  );
}

function LibraryGroup({
  title,
  icon,
  personas: group,
  emptyTitle,
  emptyBody,
  emptyCta,
  emptyHref,
}: {
  title: string;
  icon: React.ReactNode;
  personas: LibraryPersona[];
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  emptyHref: string;
}) {
  return (
    <section className="mt-14 first:mt-12">
      <h2 className="mb-6 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-mist-500">
        {icon}
        {title}
      </h2>

      {group.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="text-[15px] text-white">{emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-mist-500">
            {emptyBody}
          </p>
          <Button asChild className="mt-7">
            <Link href={emptyHref}>{emptyCta}</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {group.map((persona) => (
            <LibraryCard key={persona.id} persona={persona} />
          ))}
        </div>
      )}
    </section>
  );
}

function LibraryCard({ persona }: { persona: LibraryPersona }) {
  const knowledgeTone =
    persona.knowledge.status === "ready"
      ? "success"
      : persona.knowledge.status === "processing"
        ? "warning"
        : "muted";

  const rows = [
    { icon: <Mic className="h-3.5 w-3.5" />, label: "Voice", value: persona.voice.name },
    {
      icon: <Brain className="h-3.5 w-3.5" />,
      label: "Knowledge",
      badge: (
        <Badge tone={knowledgeTone}>{persona.knowledge.status}</Badge>
      ),
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "Last conversation",
      value: persona.lastUsed
        ? `${formatRelativeTime(persona.lastUsed)}${
            persona.durationSeconds
              ? ` · ${formatDuration(persona.durationSeconds)}`
              : ""
          }`
        : "Not started",
    },
  ];

  return (
    <Card className="group relative flex flex-col overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-40"
        style={{ background: persona.accent[0] }}
      />

      <div className="relative flex items-start gap-4">
        <PersonaAvatar
          initials={persona.initials}
          accent={persona.accent}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-white">
            {persona.name}
          </h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-mist-500">
            {persona.category}
          </p>
        </div>
        {persona.favorite ? (
          <Heart className="h-4 w-4 shrink-0 fill-rose-400/20 text-rose-400" />
        ) : null}
      </div>

      <dl className="relative mt-5 space-y-2.5 text-[13px]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-mist-500">
              {row.icon} {row.label}
            </dt>
            <dd className="truncate text-mist-200">
              {row.badge ?? row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-6 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link href={`/conversation/${persona.id}`}>Continue</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/personas/${persona.id}`}>Details</Link>
        </Button>
      </div>
    </Card>
  );
}

