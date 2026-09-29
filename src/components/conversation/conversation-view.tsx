"use client";

import { useState } from "react";
import Link from "next/link";
import { MicOff, RotateCcw, Settings2, TriangleAlert } from "lucide-react";

import { ConversationHeader } from "@/components/conversation/conversation-header";
import { ConversationTranscript } from "@/components/conversation/conversation-transcript";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { VoiceOrb } from "@/components/voice/voice-orb";
import { VoiceVisualizer } from "@/components/voice/voice-visualizer";
import { Disclaimer } from "@/components/personas/disclaimer";
import { Button } from "@/components/ui/button";
import { useVoiceSession } from "@/hooks/use-voice-session";
import { cn, formatDuration } from "@/lib/utils";
import type { Persona } from "@/types/persona";

/**
 * The voice environment. All states are simulated in the browser — there is
 * no microphone access, speech-to-text or text-to-speech in this prototype.
 */
export function ConversationView({
  persona,
  initialMessages,
}: {
  persona: Persona;
  initialMessages: ReturnType<typeof useVoiceSession>["messages"];
}) {
  const session = useVoiceSession(initialMessages);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <ConversationHeader
        personaId={persona.id}
        personaName={persona.name}
        personaInitials={persona.initials}
        personaAccent={persona.accent}
        state={session.state}
      />

      <main className="flex flex-1 flex-col items-center px-5 py-10 sm:py-14">
        <div className="w-full max-w-3xl">
          {/* Status */}
          <div className="text-center">
            <h1
              aria-live="polite"
              className={cn(
                "text-2xl font-semibold tracking-tight transition-colors sm:text-3xl",
                session.state === "error" ? "text-rose-300" : "text-white",
              )}
            >
              {session.status.title}
            </h1>
            <p className="mt-2 text-sm text-mist-500">{session.status.hint}</p>
          </div>

          {/* Orb */}
          <div className="mt-10 flex justify-center">
            <VoiceOrb
              state={session.state}
              accent={persona.accent}
              initials={persona.initials}
            />
          </div>

          <VoiceVisualizer
            state={session.state}
            accent={persona.accent}
            className="mt-8"
          />

          {/* Microphone */}
          <div className="mt-8 flex justify-center">
            <MicrophoneButton
              state={session.state}
              accent={persona.accent}
              onToggle={session.toggleMicrophone}
              onStop={session.endConversation}
            />
          </div>

          {/* Secondary controls */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="subtle"
              size="sm"
              onClick={session.toggleMute}
              aria-pressed={session.isMuted}
            >
              <MicOff className="h-3.5 w-3.5" />
              {session.isMuted ? "Unmute" : "Mute"}
            </Button>

            <Button asChild variant="subtle" size="sm">
              <Link
                href="/settings"
                className="flex items-center gap-2"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Settings
              </Link>
            </Button>

            <Button
              variant="subtle"
              size="sm"
              onClick={() => setTranscriptOpen((open) => !open)}
              aria-expanded={transcriptOpen}
            >
              Transcript
            </Button>

            <span className="rounded-full border border-white/8 px-3 py-1.5 font-mono text-[11px] text-mist-500">
              {formatDuration(session.sessionSeconds)}
            </span>
          </div>

          {/* Error affordance — demo only */}
          {session.state === "error" ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="sm" onClick={session.toggleMicrophone}>
                <RotateCcw className="h-3.5 w-3.5" />
                Try again
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={session.toggleMicrophone}
              >
                Back to idle
              </Button>
            </div>
          ) : null}

          {/* Transcript — collapsible on mobile, inline on desktop */}
          <ConversationTranscript
            className="mt-10 lg:hidden"
            messages={session.messages}
            personaName={persona.name}
            personaInitials={persona.initials}
            personaAccent={persona.accent}
            collapsible
            isOpen={transcriptOpen}
            onOpenChange={setTranscriptOpen}
          />

          {persona.disclaimer ? (
            <Disclaimer className="mt-8">
              {persona.disclaimer}
            </Disclaimer>
          ) : null}

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-mist-500">
            <TriangleAlert className="h-3 w-3" />
            Prototype mode — the microphone simulates conversation states only.
          </p>
        </div>
      </main>

      {/* Desktop transcript rail */}
      <aside className="hidden w-full max-w-3xl px-5 pb-14 lg:block">
        <ConversationTranscript
          messages={session.messages}
          personaName={persona.name}
          personaInitials={persona.initials}
          personaAccent={persona.accent}
          collapsible={false}
          isOpen
          onOpenChange={() => undefined}
        />
      </aside>
    </div>
  );
}
