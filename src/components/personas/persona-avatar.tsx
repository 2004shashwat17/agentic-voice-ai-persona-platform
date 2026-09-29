import * as React from "react";
import { cn } from "@/lib/utils";

type PersonaAvatarProps = {
  initials: string;
  accent: [string, string];
  size?: "sm" | "md" | "lg" | "xl";
  /** Adds a soft pulsing halo — used in the conversation view. */
  active?: boolean;
  className?: string;
};

const sizes = {
  sm: "h-10 w-10 text-[11px]",
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-lg",
  xl: "h-32 w-32 text-3xl sm:h-40 sm:w-40 sm:text-4xl",
} as const;

/**
 * Persona visual. Uses a data-driven gradient (persona.accent) plus initials
 * so it works identically for mock and user-created personas.
 */
export function PersonaAvatar({
  initials,
  accent,
  size = "md",
  active = false,
  className,
}: PersonaAvatarProps) {
  const [from, to] = accent;

  return (
    <div className={cn("relative shrink-0", className)}>
      {active ? (
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse-ring rounded-full"
          style={{ background: `radial-gradient(circle, ${from}55, transparent 70%)` }}
        />
      ) : null}

      <div
        className={cn(
          "relative grid place-items-center rounded-2xl font-semibold tracking-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
          sizes[size],
        )}
        style={{
          background: `linear-gradient(145deg, ${from}, ${to})`,
          boxShadow: `0 12px 40px -12px ${from}80, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      >
        <span className="drop-shadow-sm">{initials}</span>
      </div>
    </div>
  );
}
