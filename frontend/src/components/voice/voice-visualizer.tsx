"use client";

import { useMemo } from "react";

import { clamp } from "@/lib/utils";
import type { VoiceState } from "@/types/persona";

const BAR_COUNT = 24;

/** Deterministic pseudo-waveform per state so SSR and client markup match. */
function buildHeights(state: VoiceState) {
  return Array.from({ length: BAR_COUNT }, (_, index) => {
    switch (state) {
      case "listening":
        return clamp(22 + ((index * 37) % 60), 18, 96);
      case "speaking":
        return clamp(30 + ((index * 53) % 66), 20, 100);
      case "processing":
        return clamp(12 + ((index * 17) % 26), 8, 44);
      case "error":
        return clamp(10 + ((index * 11) % 14), 6, 26);
      default:
        return clamp(6 + ((index * 7) % 10), 4, 18);
    }
  });
}

/**
 * Animated voice activity bars. CSS keyframes only — the amplitudes are
 * placeholder values until real audio data is wired in.
 */
export function VoiceVisualizer({
  state,
  accent,
  className,
}: {
  state: VoiceState;
  accent: [string, string];
  className?: string;
}) {
  const heights = useMemo(() => buildHeights(state), [state]);
  const isAnimating = state === "listening" || state === "speaking";

  return (
    <div
      className={className}
      role="presentation"
      aria-hidden
    >
      <div className="flex h-12 items-center justify-center gap-[3px]">
        {heights.map((height, index) => (
          <span
            key={index}
            className="w-[3px] rounded-full transition-all duration-500"
            style={{
              height: `${height}%`,
              background: `linear-gradient(to top, ${accent[1]}, ${accent[0]})`,
              opacity: isAnimating ? 1 : 0.45,
              animation: isAnimating
                ? `bar 1.1s ease-in-out ${(index * 0.045).toFixed(2)}s infinite`
                : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
