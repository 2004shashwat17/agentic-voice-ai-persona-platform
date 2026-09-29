"use client";

import { cn } from "@/lib/utils";
import type { VoiceState } from "@/types/persona";

type VoiceOrbProps = {
  state: VoiceState;
  accent: [string, string];
  initials: string;
  className?: string;
};

/**
 * Large animated persona orb. Pure CSS animation driven by `state` — no
 * real audio analysis yet.
 */
export function VoiceOrb({
  state,
  accent,
  initials,
  className,
}: VoiceOrbProps) {
  const [from, to] = accent;
  const isActive = state === "listening" || state === "speaking";
  const isProcessing = state === "processing";

  return (
    <div
      className={cn(
        "relative grid h-56 w-56 place-items-center sm:h-72 sm:w-72",
        className,
      )}
    >
      {/* Expanding rings while active */}
      {isActive ? (
        <>
          <span
            aria-hidden
            className="absolute inset-6 animate-pulse-ring rounded-full"
            style={{ background: `radial-gradient(circle, ${from}44, transparent 70%)` }}
          />
          <span
            aria-hidden
            className="absolute inset-6 animate-pulse-ring rounded-full"
            style={{
              background: `radial-gradient(circle, ${to}33, transparent 70%)`,
              animationDelay: "0.8s",
            }}
          />
        </>
      ) : null}

      {/* Core sphere */}
      <div
        className={cn(
          "relative grid h-40 w-40 place-items-center rounded-full sm:h-52 sm:w-52",
          isActive && "animate-orb-breathe",
        )}
        style={{
          background: `radial-gradient(circle at 32% 28%, ${from}, ${to} 62%, ${to}22 100%)`,
          boxShadow: `0 0 70px -10px ${from}, inset 0 1px 0 rgba(255,255,255,0.35)`,
          filter: state === "error" ? "grayscale(0.6)" : undefined,
          opacity: state === "muted" || state === "ended" ? 0.45 : 1,
        }}
      >
        {/* Specular highlight for a glassy, premium feel */}
        <span
          aria-hidden
          className="absolute left-1/4 top-1/6 h-16 w-16 rounded-full bg-white/25 blur-xl"
        />
        <span className="relative text-3xl font-semibold tracking-tight text-white drop-shadow sm:text-4xl">
          {initials}
        </span>
      </div>

      {/* Processing sweep */}
      {isProcessing ? (
        <span
          aria-hidden
          className="absolute inset-2 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: from, borderRightColor: `${to}88` }}
        />
      ) : null}
    </div>
  );
}
