"use client";

import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";

import { PersonaAvatar } from "@/components/personas/persona-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/persona";

const statusMeta: Record<VoiceState, { label: string; dot: string }> = {
  idle: { label: "Ready", dot: "bg-mist-400" },
  listening: { label: "Connected", dot: "bg-emerald-400" },
  processing: { label: "Connected", dot: "bg-amber-400" },
  speaking: { label: "Connected", dot: "bg-brand-400" },
  muted: { label: "Muted", dot: "bg-mist-500" },
  error: { label: "Connection issue", dot: "bg-rose-400" },
  ended: { label: "Ended", dot: "bg-mist-600" },
};

/** Conversation top bar: back, persona identity, status and settings. */
export function ConversationHeader({
  personaId,
  personaName,
  personaInitials,
  personaAccent,
  state,
}: {
  personaId: string;
  personaName: string;
  personaInitials: string;
  personaAccent: [string, string];
  state: VoiceState;
}) {
  const status = statusMeta[state];

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Button asChild variant="ghost" size="icon" aria-label="Back to personas">
          <Link href={`/personas/${personaId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <Link
          href="/personas"
          className="flex min-w-0 items-center gap-3 rounded-full"
        >
          <PersonaAvatar
            initials={personaInitials}
            accent={personaAccent}
            size="sm"
            active={state === "speaking"}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{personaName}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-mist-500">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  status.dot,
                  (state === "listening" || state === "speaking") && "animate-pulse",
                )}
              />
              {status.label}
            </p>
          </div>
        </Link>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="ml-auto"
          aria-label="Conversation settings"
        >
          <Link href="/settings">
            <Settings2 className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
