"use client";

import { Mic, MicOff, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/persona";

type MicrophoneButtonProps = {
  state: VoiceState;
  accent: [string, string];
  onToggle: () => void;
  onStop?: () => void;
  className?: string;
};

/**
 * Primary conversation control. All behaviour is simulated in the prototype —
 * no microphone permissions or audio processing are used.
 */
export function MicrophoneButton({
  state,
  accent,
  onToggle,
  onStop,
  className,
}: MicrophoneButtonProps) {
  const [from, to] = accent;
  const isListening = state === "listening";
  const isDisabled = state === "ended" || state === "processing";

  const label = isDisabled
    ? "Preparing"
    : isListening
      ? "Stop listening"
      : state === "muted"
        ? "Unmute microphone"
        : "Tap to talk";

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="relative grid place-items-center">
        {/* Halo reacts to state */}
        <span
          aria-hidden
          className={cn(
            "absolute h-48 w-48 rounded-full transition-opacity duration-500",
            isListening ? "animate-pulse-ring opacity-100" : "opacity-0",
          )}
          style={{ background: `radial-gradient(circle, ${from}55, transparent 70%)` }}
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={isDisabled}
          aria-label={label}
          aria-pressed={isListening}
          className={cn(
            "relative grid h-28 w-28 place-items-center rounded-full text-white transition-all duration-500 sm:h-32 sm:w-32",
            "hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
          )}
          style={{
            background: `linear-gradient(145deg, ${from}, ${to})`,
            boxShadow: `0 18px 60px -14px ${from}, inset 0 1px 0 rgba(255,255,255,0.35)`,
          }}
        >
          <span className="absolute inset-0 animate-orb-breathe rounded-full" />
          {state === "muted" || state === "ended" ? (
            <MicOff className="relative h-8 w-8" />
          ) : (
            <Mic className="relative h-8 w-8" />
          )}
        </button>
      </div>

      {onStop && state !== "ended" ? (
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-mist-300 transition-colors hover:border-rose-400/40 hover:text-rose-300"
        >
          <Square className="h-3 w-3" />
          End conversation
        </button>
      ) : null}
    </div>
  );
}
