import Link from "next/link";
import { ArrowUpRight, Mic } from "lucide-react";

import { PersonaAvatar } from "@/components/personas/persona-avatar";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Persona } from "@/types/persona";

type PersonaCardProps = {
  persona: Persona;
  /** Renders the knowledge count badge (used in library views). */
  showKnowledge?: boolean;
  className?: string;
};

/**
 * Primary persona discovery card. Reused across the explorer, library
 * and landing page so a persona always presents identically.
 */
export function PersonaCard({
  persona,
  showKnowledge = false,
  className,
}: PersonaCardProps) {
  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden p-6",
        className,
      )}
    >
      {/* Ambient accent wash on hover */}
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
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white">
              {persona.name}
            </h3>
            {persona.isCustom ? (
              <Badge tone="brand" className="shrink-0">
                Yours
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-mist-500">
            {persona.category}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-mist-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
      </div>

      <p className="relative mt-4 text-sm leading-relaxed text-mist-300">
        {persona.tagline}
      </p>

      <ul className="relative mt-4 flex flex-wrap gap-1.5">
        {persona.personality.slice(0, 3).map((trait) => (
          <li key={trait}>
            <Badge tone="muted">{trait}</Badge>
          </li>
        ))}
      </ul>

      <div className="relative mt-auto pt-5">
        <div className="mb-4 flex items-center justify-between text-[11px] text-mist-500">
          <span>Voice</span>
          <span className="font-medium text-mist-200">
            {persona.voice.style}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/conversation/${persona.id}`}>
              <Mic className="h-3.5 w-3.5" />
              Talk now
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/personas/${persona.id}`}>Details</Link>
          </Button>
        </div>

        {showKnowledge ? (
          <p className="mt-3 text-[11px] text-mist-500">
            {persona.knowledge.sourceCount} knowledge sources
          </p>
        ) : null}
      </div>
    </Card>
  );
}
